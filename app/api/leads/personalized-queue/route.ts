import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _supabase
}

/**
 * POST /api/leads/personalized-queue
 *
 * Receives new revenue leader leads from Clay for the personalized email play.
 * These get researched + personalized emails written before sending.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const leads = Array.isArray(body) ? body : [body]

    const results = { inserted: 0, duplicates: 0, errors: 0 }

    for (const raw of leads) {
      const lead = {
        email: raw.email?.toLowerCase()?.trim() || null,
        first_name: raw.first_name || raw.firstName || '',
        last_name: raw.last_name || raw.lastName || '',
        full_name: raw.full_name || raw.fullName || `${raw.first_name || raw.firstName || ''} ${raw.last_name || raw.lastName || ''}`.trim(),
        company_name: raw.company_name || raw.companyName || '',
        company_domain: raw.company_domain || raw.website || raw.domain || '',
        job_title: raw.job_title || raw.jobTitle || '',
        employees: raw.employees || '',
        location: raw.location || '',
        linkedin_url: raw.linkedin_url || raw.linkedinUrl || raw.linkedin || '',
        status: 'queued',
      }

      if (!lead.company_domain) {
        results.errors++
        continue
      }

      const { error } = await getSupabase()
        .from('personalized_queue')
        .upsert(lead, { onConflict: 'email,company_domain', ignoreDuplicates: true })

      if (error) {
        if (error.code === '23505') results.duplicates++
        else {
          results.errors++
          console.error('Personalized queue insert error:', error.message)
        }
      } else {
        results.inserted++
      }
    }

    return NextResponse.json({ success: true, ...results, total: leads.length })
  } catch (err: any) {
    console.error('Personalized queue webhook error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

/**
 * GET /api/leads/personalized-queue
 *
 * Returns queue stats by status.
 */
export async function GET() {
  const supabase = getSupabase()

  const statuses = ['queued', 'researched', 'email_drafted', 'email_found', 'pushed_to_instantly', 'skipped']
  const counts: Record<string, number> = {}

  for (const status of statuses) {
    const { count } = await supabase
      .from('personalized_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', status)
    counts[status] = count || 0
  }

  return NextResponse.json(counts)
}
