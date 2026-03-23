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
 * POST /api/leads/pool
 *
 * Receives leads from Clay webhook and inserts into lead_pool table.
 * Deduplicates against both lead_pool and lead_pool_contacted.
 *
 * Accepts single lead or array of leads.
 * Fields: email, first_name, last_name, company_name, company_domain, job_title, industry, location
 * Also accepts Clay/Instantly format: firstName, lastName, companyName, website
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const leads = Array.isArray(body) ? body : [body]

    const results = { inserted: 0, duplicates: 0, contacted: 0, errors: 0 }

    for (const raw of leads) {
      // Normalize field names (accept both Clay and standard formats)
      const lead = {
        email: raw.email?.toLowerCase()?.trim(),
        first_name: raw.first_name || raw.firstName || '',
        last_name: raw.last_name || raw.lastName || '',
        company_name: raw.company_name || raw.companyName || '',
        company_domain: raw.company_domain || raw.website || '',
        job_title: raw.job_title || raw.jobTitle || '',
        industry: raw.industry || '',
        location: raw.location || raw.city || '',
      }

      if (!lead.email) {
        results.errors++
        continue
      }

      // Check if already contacted (never re-email)
      const { data: contacted } = await getSupabase()
        .from('lead_pool_contacted')
        .select('email')
        .eq('email', lead.email)
        .single()

      if (contacted) {
        results.contacted++
        continue
      }

      // Upsert into lead pool (skip if already exists)
      const { error } = await getSupabase()
        .from('lead_pool')
        .upsert(lead, { onConflict: 'email', ignoreDuplicates: true })

      if (error) {
        if (error.code === '23505') {
          results.duplicates++
        } else {
          results.errors++
          console.error('Lead pool insert error:', error.message)
        }
      } else {
        results.inserted++
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      total: leads.length,
    })
  } catch (err: any) {
    console.error('Lead pool webhook error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

/**
 * GET /api/leads/pool
 *
 * Returns pool stats for monitoring.
 */
export async function GET() {
  const { count: available } = await getSupabase()
    .from('lead_pool')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'available')

  const { count: assigned } = await getSupabase()
    .from('lead_pool')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'assigned')

  const { count: contacted } = await getSupabase()
    .from('lead_pool_contacted')
    .select('*', { count: 'exact', head: true })

  return NextResponse.json({
    available: available || 0,
    assigned: assigned || 0,
    total_contacted: contacted || 0,
  })
}
