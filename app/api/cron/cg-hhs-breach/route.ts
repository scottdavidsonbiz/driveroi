import { NextRequest, NextResponse } from 'next/server'
import { downloadHhsBreaches, parseBreachCsv, type BreachRecord } from '@/lib/hhs-breach'
import { supabase } from '@/lib/supabase'
import { postToSlack } from '@/lib/slack'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cgClientId = process.env.CG_CLIENT_ID || null
  const dry = request.nextUrl.searchParams.get('dry') === 'true'
  const sinceDaysRaw = request.nextUrl.searchParams.get('since_days')
  const sinceDays = sinceDaysRaw ? parseInt(sinceDaysRaw, 10) : 0

  try {
    const csv = await downloadHhsBreaches()
    const allRecords = parseBreachCsv(csv)

    // Optional date-window filter — used for the first-run 90-day backfill.
    // Default (no since_days) keeps the cron's diff-only behavior for weekly runs.
    let records = allRecords
    if (sinceDays > 0) {
      const cutoffMs = Date.now() - sinceDays * 24 * 60 * 60 * 1000
      records = allRecords.filter(r => {
        if (!r.breach_submission_date) return false
        return new Date(r.breach_submission_date).getTime() >= cutoffMs
      })
    }

    if (records.length === 0) {
      return NextResponse.json({
        ok: true,
        total: 0,
        new: 0,
        duplicates: 0,
        message: sinceDays > 0
          ? `No records in last ${sinceDays} days`
          : 'No records parsed from HHS portal',
      })
    }

    // Diff against existing rows by breach_id
    const ids = records.map(r => r.breach_id)
    const { data: existingRows, error: fetchErr } = await supabase
      .from('hhs_breaches')
      .select('breach_id')
      .in('breach_id', ids)
    if (fetchErr) throw new Error(`Supabase fetch error: ${fetchErr.message}`)
    const existingSet = new Set((existingRows ?? []).map(r => r.breach_id))
    // Dedupe within the batch as well — the HHS CSV repeats (name|date|breachType)
    // tuples for multi-state filings, amendments, and BA/CE pairs reporting the
    // same incident. Without this, two such rows both pass the existing-DB filter
    // and the bulk insert hits hhs_breaches_breach_id_key.
    const seen = new Set<string>()
    const newRecords = records.filter(r => {
      if (existingSet.has(r.breach_id) || seen.has(r.breach_id)) return false
      seen.add(r.breach_id)
      return true
    })
    const duplicates = records.length - newRecords.length

    if (!dry && newRecords.length > 0) {
      const payload = newRecords.map(r => ({
        breach_id: r.breach_id,
        client_id: cgClientId,
        covered_entity_name: r.covered_entity_name,
        state: r.state,
        entity_type: r.entity_type,
        individuals_affected: r.individuals_affected,
        breach_submission_date: r.breach_submission_date,
        breach_type: r.breach_type,
        location_of_breached_info: r.location_of_breached_info,
        ba_present: r.ba_present,
        web_description: r.web_description,
        raw_row: r,
      }))
      const { error: insertErr } = await supabase.from('hhs_breaches').insert(payload)
      if (insertErr) throw new Error(`Supabase insert error: ${insertErr.message}`)
    }

    await notifySlackSuccess(newRecords, duplicates, dry)

    return NextResponse.json({
      ok: true,
      total: records.length,
      total_unfiltered: allRecords.length,
      since_days: sinceDays || null,
      new: newRecords.length,
      duplicates,
      dry,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await notifySlackFailure(message)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

async function notifySlackSuccess(
  newRecords: BreachRecord[],
  duplicates: number,
  dry: boolean
): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_CG_HHS_URL
  if (!webhookUrl || newRecords.length === 0) return

  const top = [...newRecords]
    .sort((a, b) => (b.individuals_affected ?? 0) - (a.individuals_affected ?? 0))
    .slice(0, 5)
  const topLines = top
    .map(r => {
      const count = r.individuals_affected?.toLocaleString() ?? 'unknown'
      const state = r.state ?? '??'
      const type = r.entity_type ?? 'unknown'
      const ba = r.ba_present ? ' [BA present]' : ''
      return `• ${r.covered_entity_name} — ${state} ${type} — ${count} affected${ba}`
    })
    .join('\n')

  const n = newRecords.length
  const dryPrefix = dry ? '[DRY RUN] ' : ''
  const summary = `${dryPrefix}*CG HHS Breach ingestion:* ${n} new breach${n === 1 ? '' : 'es'} logged (${duplicates} duplicate${duplicates === 1 ? '' : 's'} skipped).`
  const context = `Run \`py scripts/cg-hhs-enrich-and-push.py\` to enrich and push to \`CG - HHS Breach\` Instantly campaign.`

  try {
    await postToSlack(webhookUrl, [
      { type: 'section', text: { type: 'mrkdwn', text: summary } },
      { type: 'section', text: { type: 'mrkdwn', text: `*Top by individuals affected:*\n${topLines}` } },
      { type: 'context', elements: [{ type: 'mrkdwn', text: context }] },
    ] as any)
  } catch {
    // Swallow Slack errors — don't fail the cron because notification failed
  }
}

async function notifySlackFailure(message: string): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_CG_HHS_URL
  if (!webhookUrl) return
  try {
    await postToSlack(webhookUrl, [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*CG HHS Breach cron FAILED:* ${message}` },
      },
    ] as any)
  } catch {
    // Swallow
  }
}
