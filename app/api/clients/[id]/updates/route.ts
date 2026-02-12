import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import * as fs from 'fs'
import * as path from 'path'

// Map client names to their folder names under Clients/
const CLIENT_FOLDER_MAP: Record<string, string> = {
  'IVS': 'IBS',
  'IBS': 'IBS',
  'GovEagle': 'GovEagle',
  'Qumis': 'Qumis',
}

function getClientFolder(clientName: string): string {
  // Check exact match first, then case-insensitive partial match
  if (CLIENT_FOLDER_MAP[clientName]) return CLIENT_FOLDER_MAP[clientName]
  const key = Object.keys(CLIENT_FOLDER_MAP).find(
    k => clientName.toLowerCase().includes(k.toLowerCase())
  )
  return key ? CLIENT_FOLDER_MAP[key] : clientName.replace(/[^a-zA-Z0-9-]/g, '')
}

// GET /api/clients/[id]/updates — list past updates
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    const { data: updates, error } = await supabase
      .from('client_updates')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ updates: updates || [] })
  } catch (error) {
    console.error('[Updates API] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch updates' }, { status: 500 })
  }
}

// POST /api/clients/[id]/updates — generate a new weekly update
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params

    // 1. Fetch the client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // 2. Fetch latest campaign_stats for this client (today's snapshot from sync)
    const { data: currentStats, error: statsError } = await supabase
      .from('campaign_stats')
      .select('*')
      .eq('client_id', clientId)
      .order('snapshot_date', { ascending: false })

    if (statsError) {
      return NextResponse.json({ error: statsError.message }, { status: 500 })
    }

    // Get the most recent snapshot date
    const latestDate = currentStats?.[0]?.snapshot_date
    // Filter to only the most recent snapshot
    const latestStats = currentStats?.filter(s => s.snapshot_date === latestDate) || []

    // 3. Fetch previous client_updates record for delta comparison
    const { data: previousUpdates } = await supabase
      .from('client_updates')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)

    const previousUpdate = previousUpdates?.[0] || null

    // 4. Build metrics snapshot
    const metricsSnapshot = buildMetricsSnapshot(latestStats)
    const previousSnapshot = previousUpdate?.metrics_snapshot || null

    // 5. Call Claude for narrative + recommendations
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      )
    }

    const { narrative, recommendations } = await generateNarrative(
      apiKey,
      client.name,
      metricsSnapshot,
      previousSnapshot
    )

    // 6. Determine period
    const periodEnd = new Date().toISOString().split('T')[0]
    const periodStart = previousUpdate?.period_end ||
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // 7. Write markdown file (best-effort — Vercel has read-only filesystem)
    let markdownPath: string | null = null
    try {
      markdownPath = await writeMarkdownUpdate(
        client.name,
        periodEnd,
        metricsSnapshot,
        previousSnapshot,
        narrative,
        recommendations
      )
    } catch (fsErr) {
      console.warn('[Updates API] Could not write markdown file (expected on Vercel):', fsErr)
    }

    // 8. Insert client_updates record
    const { data: update, error: insertError } = await supabase
      .from('client_updates')
      .insert({
        client_id: clientId,
        period_start: periodStart,
        period_end: periodEnd,
        metrics_snapshot: metricsSnapshot,
        previous_snapshot: previousSnapshot,
        narrative,
        recommendations,
        markdown_path: markdownPath,
      })
      .select()
      .single()

    if (insertError) {
      console.error('[Updates API] Insert error:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ update })
  } catch (error) {
    console.error('[Updates API] POST error:', error)
    return NextResponse.json({ error: 'Failed to generate update' }, { status: 500 })
  }
}

// DELETE /api/clients/[id]/updates — delete an update
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params
    const { update_id } = await request.json()

    if (!update_id) {
      return NextResponse.json({ error: 'update_id is required' }, { status: 400 })
    }

    // Also delete the markdown file if it exists
    const { data: update } = await supabase
      .from('client_updates')
      .select('markdown_path')
      .eq('id', update_id)
      .eq('client_id', clientId)
      .single()

    if (update?.markdown_path) {
      try {
        const filePath = path.join(process.cwd(), update.markdown_path)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      } catch (fsErr) {
        console.warn('[Updates API] Could not delete markdown file:', fsErr)
      }
    }

    const { error } = await supabase
      .from('client_updates')
      .delete()
      .eq('id', update_id)
      .eq('client_id', clientId)

    if (error) {
      console.error('[Updates API] Delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Updates API] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete update' }, { status: 500 })
  }
}

// PATCH /api/clients/[id]/updates — edit an update's narrative/recommendations
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params
    const { update_id, narrative, recommendations } = await request.json()

    if (!update_id) {
      return NextResponse.json({ error: 'update_id is required' }, { status: 400 })
    }

    const updates: Record<string, any> = {}
    if (narrative !== undefined) updates.narrative = narrative
    if (recommendations !== undefined) updates.recommendations = recommendations

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('client_updates')
      .update(updates)
      .eq('id', update_id)
      .eq('client_id', clientId)
      .select()
      .single()

    if (error) {
      console.error('[Updates API] Patch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Re-write the markdown file if narrative or recommendations changed
    if (data.markdown_path && (narrative !== undefined || recommendations !== undefined)) {
      const { data: client } = await supabase
        .from('clients')
        .select('name')
        .eq('id', clientId)
        .single()

      if (client) {
        try {
          await writeMarkdownUpdate(
            client.name,
            data.period_end,
            data.metrics_snapshot,
            data.previous_snapshot,
            data.narrative,
            data.recommendations
          )
        } catch (fsErr) {
          console.warn('[Updates API] Could not re-write markdown file:', fsErr)
        }
      }
    }

    return NextResponse.json({ update: data })
  } catch (error) {
    console.error('[Updates API] PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

function buildMetricsSnapshot(stats: any[]) {
  const heyreachStats = stats.filter(s => s.platform === 'heyreach')
  const instantlyStats = stats.filter(s => s.platform === 'instantly')

  const heyreach = {
    campaigns: heyreachStats.map(s => ({
      campaign_id: s.campaign_id,
      campaign_name: s.campaign_name,
      connectionsSent: s.raw_data?.connectionsSent || s.sent || 0,
      connectionsAccepted: s.raw_data?.connectionsAccepted || 0,
      connectionAcceptanceRate: s.raw_data?.connectionAcceptanceRate || 0,
      profileViews: s.raw_data?.profileViews || s.opened || 0,
      messagesSent: s.raw_data?.messagesSent || 0,
      messageReplies: s.raw_data?.totalMessageReplies || s.replied || 0,
    })),
    totals: {
      connectionsSent: heyreachStats.reduce((sum, s) => sum + (s.raw_data?.connectionsSent || s.sent || 0), 0),
      connectionsAccepted: heyreachStats.reduce((sum, s) => sum + (s.raw_data?.connectionsAccepted || 0), 0),
      profileViews: heyreachStats.reduce((sum, s) => sum + (s.raw_data?.profileViews || s.opened || 0), 0),
      messagesSent: heyreachStats.reduce((sum, s) => sum + (s.raw_data?.messagesSent || 0), 0),
      messageReplies: heyreachStats.reduce((sum, s) => sum + (s.raw_data?.totalMessageReplies || s.replied || 0), 0),
    },
  }

  const instantly = {
    campaigns: instantlyStats.map(s => ({
      campaign_id: s.campaign_id,
      campaign_name: s.campaign_name,
      emailsSent: s.sent || 0,
      emailsOpened: s.opened || 0,
      replied: s.replied || 0,
      bounced: s.bounced || 0,
      meetings: s.meetings || 0,
    })),
    totals: {
      emailsSent: instantlyStats.reduce((sum, s) => sum + (s.sent || 0), 0),
      emailsOpened: instantlyStats.reduce((sum, s) => sum + (s.opened || 0), 0),
      replied: instantlyStats.reduce((sum, s) => sum + (s.replied || 0), 0),
      bounced: instantlyStats.reduce((sum, s) => sum + (s.bounced || 0), 0),
      meetings: instantlyStats.reduce((sum, s) => sum + (s.meetings || 0), 0),
    },
  }

  return {
    heyreach,
    instantly,
    totals: {
      leadsContacted: heyreach.totals.connectionsSent + instantly.totals.emailsSent,
      connectionsSent: heyreach.totals.connectionsSent,
      connectionsAccepted: heyreach.totals.connectionsAccepted,
      emailsSent: instantly.totals.emailsSent,
      emailsOpened: instantly.totals.emailsOpened,
      totalReplies: heyreach.totals.messageReplies + instantly.totals.replied,
      meetings: instantly.totals.meetings,
    },
    snapshot_date: new Date().toISOString().split('T')[0],
  }
}

async function generateNarrative(
  apiKey: string,
  clientName: string,
  currentMetrics: any,
  previousMetrics: any | null
): Promise<{ narrative: string; recommendations: string[] }> {
  const today = new Date()
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  let deltaContext = ''
  if (previousMetrics?.totals) {
    const prev = previousMetrics.totals
    const curr = currentMetrics.totals
    deltaContext = `
Previous period metrics:
- Leads Contacted: ${prev.leadsContacted || 0}
- Connections Sent: ${prev.connectionsSent || 0}
- Connections Accepted: ${prev.connectionsAccepted || 0}
- Emails Sent: ${prev.emailsSent || 0}
- Total Replies: ${prev.totalReplies || 0}
- Meetings: ${prev.meetings || 0}

Changes:
- Leads Contacted: ${(curr.leadsContacted || 0) - (prev.leadsContacted || 0)} (${prev.leadsContacted ? (((curr.leadsContacted - prev.leadsContacted) / prev.leadsContacted) * 100).toFixed(1) : 'N/A'}%)
- Connections Accepted: ${(curr.connectionsAccepted || 0) - (prev.connectionsAccepted || 0)}
- Total Replies: ${(curr.totalReplies || 0) - (prev.totalReplies || 0)}
- Meetings: ${(curr.meetings || 0) - (prev.meetings || 0)}`
  }

  const prompt = `You are a B2B GTM consultant writing a concise weekly client update for ${clientName}.

Today: ${dateStr}

Current metrics (all-time cumulative):
LinkedIn (HeyReach):
${currentMetrics.heyreach.campaigns.map((c: any) =>
  `  - ${c.campaign_name}: ${c.connectionsSent} connections sent, ${c.connectionsAccepted} accepted (${(c.connectionAcceptanceRate * 100).toFixed(1)}%), ${c.profileViews} profile views, ${c.messageReplies} replies`
).join('\n')}
  Totals: ${currentMetrics.heyreach.totals.connectionsSent} connections sent, ${currentMetrics.heyreach.totals.connectionsAccepted} accepted, ${currentMetrics.heyreach.totals.messageReplies} replies

Email (Instantly):
${currentMetrics.instantly.campaigns.length > 0
  ? currentMetrics.instantly.campaigns.map((c: any) =>
    `  - ${c.campaign_name}: ${c.emailsSent} sent, ${c.emailsOpened} opened, ${c.replied} replied, ${c.meetings} meetings`
  ).join('\n')
  : '  No email campaigns active yet'}
  Totals: ${currentMetrics.instantly.totals.emailsSent} emails sent, ${currentMetrics.instantly.totals.replied} replies, ${currentMetrics.instantly.totals.meetings} meetings

${deltaContext}

Write a weekly update with:
1. A 2-3 sentence executive summary of campaign performance
2. Key highlights (what's working)
3. Areas of concern (if any)
4. 3-5 specific, actionable recommendations for next week

Return as JSON:
{
  "narrative": "The full narrative summary in markdown format (use ## headers, bullet points, bold for emphasis). Include the executive summary, highlights, and concerns.",
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}

Keep the tone professional but conversational. Be specific with numbers. Only return valid JSON.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[Claude API] Error:', errorText)
    throw new Error(`Claude API error: ${response.status}`)
  }

  const result = await response.json()
  const content = result.content[0].text

  // Parse JSON response
  let jsonStr = content
  if (content.includes('```json')) {
    jsonStr = content.split('```json')[1].split('```')[0]
  } else if (content.includes('```')) {
    jsonStr = content.split('```')[1].split('```')[0]
  }

  return JSON.parse(jsonStr.trim())
}

async function writeMarkdownUpdate(
  clientName: string,
  dateStr: string,
  metrics: any,
  previousMetrics: any | null,
  narrative: string,
  recommendations: string[]
): Promise<string> {
  const folder = getClientFolder(clientName)
  const prefix = clientName.replace(/[^a-zA-Z0-9]/g, '')
  const filename = `${prefix}-Update-${dateStr}.md`
  const dirPath = path.join(process.cwd(), 'Clients', folder)
  const filePath = path.join(dirPath, filename)
  const relativePath = `Clients/${folder}/${filename}`

  // Ensure directory exists
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }

  const d = (curr: number, prev: number | undefined) => {
    if (prev === undefined || prev === null) return ''
    const diff = curr - prev
    if (diff === 0) return ' (no change)'
    return diff > 0 ? ` (+${diff})` : ` (${diff})`
  }

  const prevTotals = previousMetrics?.totals
  const t = metrics.totals

  let md = `# ${clientName} Update - ${new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

## Metrics Summary

| Metric | Value | Change |
|--------|-------|--------|
| Leads Contacted | ${t.leadsContacted} | ${d(t.leadsContacted, prevTotals?.leadsContacted)} |
| Connections Sent | ${t.connectionsSent} | ${d(t.connectionsSent, prevTotals?.connectionsSent)} |
| Connections Accepted | ${t.connectionsAccepted} | ${d(t.connectionsAccepted, prevTotals?.connectionsAccepted)} |
| Emails Sent | ${t.emailsSent} | ${d(t.emailsSent, prevTotals?.emailsSent)} |
| Emails Opened | ${t.emailsOpened} | ${d(t.emailsOpened, prevTotals?.emailsOpened)} |
| Total Replies | ${t.totalReplies} | ${d(t.totalReplies, prevTotals?.totalReplies)} |
| Meetings | ${t.meetings} | ${d(t.meetings, prevTotals?.meetings)} |

---

## Campaign Breakdown

### LinkedIn (HeyReach)

| Campaign | Connections Sent | Accepted | Rate | Profile Views | Replies |
|----------|-----------------|----------|------|---------------|---------|
${metrics.heyreach.campaigns.map((c: any) =>
  `| ${c.campaign_name} | ${c.connectionsSent} | ${c.connectionsAccepted} | ${(c.connectionAcceptanceRate * 100).toFixed(1)}% | ${c.profileViews} | ${c.messageReplies} |`
).join('\n')}

`

  if (metrics.instantly.campaigns.length > 0) {
    md += `### Email (Instantly)

| Campaign | Sent | Opened | Replied | Bounced | Meetings |
|----------|------|--------|---------|---------|----------|
${metrics.instantly.campaigns.map((c: any) =>
  `| ${c.campaign_name} | ${c.emailsSent} | ${c.emailsOpened} | ${c.replied} | ${c.bounced} | ${c.meetings} |`
).join('\n')}

`
  }

  md += `---

${narrative}

---

## Recommendations

${recommendations.map(r => `- [ ] ${r}`).join('\n')}

---

*Generated ${new Date().toISOString().split('T')[0]} by DriveROI Ops*
`

  fs.writeFileSync(filePath, md, 'utf-8')
  return relativePath
}
