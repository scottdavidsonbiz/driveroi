import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/leads/check - Check if leads exist (for Clay deduplication)
// Supports multiple lookup methods: email, linkedin_url, or name+domain
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Determine lookup method based on what's provided
    const email = body.email?.toLowerCase()?.trim()
    const linkedinUrl = body.linkedin_url || body.linkedinUrl
    const firstName = body.first_name || body.firstName
    const lastName = body.last_name || body.lastName
    const fullName = body.full_name || body.fullName
    const domain = body.domain?.toLowerCase()?.trim()
    const company = body.company

    // Method 1: Check by email (if available)
    if (email) {
      const { data: lead } = await supabase
        .from('leads')
        .select('id, email, domain, company, linkedin_url, created_at')
        .eq('email', email)
        .single()

      return NextResponse.json({
        method: 'email',
        query: { email },
        exists: !!lead,
        ...(lead && { existing: lead }),
      })
    }

    // Method 2: Check by LinkedIn URL (most reliable without email)
    if (linkedinUrl) {
      // Normalize LinkedIn URL - extract the profile path
      const normalizedUrl = normalizeLinkedInUrl(linkedinUrl)

      const { data: leads } = await supabase
        .from('leads')
        .select('id, email, domain, company, linkedin_url, first_name, last_name, created_at')
        .ilike('linkedin_url', `%${normalizedUrl}%`)
        .limit(1)

      const lead = leads?.[0]

      return NextResponse.json({
        method: 'linkedin_url',
        query: { linkedin_url: linkedinUrl },
        exists: !!lead,
        ...(lead && { existing: lead }),
      })
    }

    // Method 3: Check by name + domain (fuzzy match)
    if ((firstName || lastName || fullName) && (domain || company)) {
      let query = supabase
        .from('leads')
        .select('id, email, domain, company, linkedin_url, first_name, last_name, created_at')

      // Match on domain or company
      if (domain) {
        query = query.eq('domain', domain)
      } else if (company) {
        query = query.ilike('company', `%${company}%`)
      }

      const { data: leads } = await query

      // Check for name match within results
      const searchFirst = (firstName || '').toLowerCase()
      const searchLast = (lastName || '').toLowerCase()
      const searchFull = (fullName || '').toLowerCase()

      const match = leads?.find((lead) => {
        const leadFirst = (lead.first_name || '').toLowerCase()
        const leadLast = (lead.last_name || '').toLowerCase()
        const leadFull = `${leadFirst} ${leadLast}`.trim()

        // Check various name combinations
        if (searchFull && leadFull.includes(searchFull)) return true
        if (searchFull && searchFull.includes(leadFull) && leadFull.length > 3) return true
        if (searchFirst && searchLast) {
          return leadFirst === searchFirst && leadLast === searchLast
        }
        if (searchFirst && leadFirst === searchFirst) return true
        if (searchLast && leadLast === searchLast) return true

        return false
      })

      return NextResponse.json({
        method: 'name_domain',
        query: {
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          domain,
          company,
        },
        exists: !!match,
        ...(match && { existing: match }),
        candidates: leads?.length || 0, // How many leads we have at this domain
      })
    }

    // Method 4: Check by domain only (returns count at company)
    if (domain) {
      const { data: leads, count } = await supabase
        .from('leads')
        .select('id, email, first_name, last_name, title', { count: 'exact' })
        .eq('domain', domain)
        .limit(5)

      return NextResponse.json({
        method: 'domain_only',
        query: { domain },
        exists: (count || 0) > 0,
        count: count || 0,
        sample: leads || [],
      })
    }

    return NextResponse.json(
      {
        error: 'No valid lookup fields provided',
        hint: 'Provide email, linkedin_url, name+domain, or domain',
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('[Leads Check API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to check leads' },
      { status: 500 }
    )
  }
}

function normalizeLinkedInUrl(url: string): string {
  // Extract the profile identifier from various LinkedIn URL formats
  // https://www.linkedin.com/in/johndoe/ -> johndoe
  // https://linkedin.com/in/johndoe -> johndoe
  const match = url.match(/linkedin\.com\/in\/([^\/\?]+)/)
  return match ? match[1].toLowerCase() : url.toLowerCase()
}
