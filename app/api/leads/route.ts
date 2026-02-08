import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/leads - List leads with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('client_id')
    const domain = searchParams.get('domain')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    if (domain) {
      query = query.eq('domain', domain)
    }

    const { data: leads, error, count } = await query

    if (error) {
      console.error('[Leads API] Error fetching leads:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      leads,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('[Leads API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}

// POST /api/leads - Add leads (single or batch)
// Returns which leads are new vs duplicates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Support both single lead and array of leads
    const leadsInput = Array.isArray(body) ? body : [body]

    if (leadsInput.length === 0) {
      return NextResponse.json({ error: 'No leads provided' }, { status: 400 })
    }

    // Extract emails to check for duplicates
    const emails = leadsInput
      .map((l) => l.email?.toLowerCase()?.trim())
      .filter(Boolean)

    // Check which emails already exist
    const { data: existingLeads } = await supabase
      .from('leads')
      .select('email')
      .in('email', emails)

    const existingEmails = new Set(
      (existingLeads || []).map((l) => l.email?.toLowerCase())
    )

    // Separate new leads from duplicates
    const newLeads: typeof leadsInput = []
    const duplicates: string[] = []

    for (const lead of leadsInput) {
      const email = lead.email?.toLowerCase()?.trim()
      if (!email) continue

      if (existingEmails.has(email)) {
        duplicates.push(email)
      } else {
        newLeads.push({
          email: email,
          domain: lead.domain?.toLowerCase()?.trim() || extractDomain(email),
          first_name: lead.first_name || lead.firstName || null,
          last_name: lead.last_name || lead.lastName || null,
          title: lead.title || null,
          company: lead.company || null,
          linkedin_url: lead.linkedin_url || lead.linkedinUrl || null,
          client_id: lead.client_id || lead.clientId || null,
          source: lead.source || 'api',
          enriched_at: lead.enriched_at || null,
          raw_data: lead.raw_data || lead.rawData || null,
        })
        existingEmails.add(email) // Prevent duplicates within the same batch
      }
    }

    // Insert new leads
    let inserted: typeof newLeads = []
    if (newLeads.length > 0) {
      const { data, error } = await supabase
        .from('leads')
        .insert(newLeads)
        .select()

      if (error) {
        console.error('[Leads API] Error inserting leads:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      inserted = data || []
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: leadsInput.length,
        new: inserted.length,
        duplicates: duplicates.length,
      },
      inserted,
      duplicates,
    })
  } catch (error) {
    console.error('[Leads API] Error:', error)
    return NextResponse.json({ error: 'Failed to add leads' }, { status: 500 })
  }
}

function extractDomain(email: string): string | null {
  if (!email || !email.includes('@')) return null
  return email.split('@')[1].toLowerCase()
}
