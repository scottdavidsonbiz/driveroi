import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: engagers, error } = await supabase
      .from('post_engagers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      console.error('[Content Engagers API] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ engagers })
  } catch (error) {
    console.error('[Content Engagers API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch engagers' }, { status: 500 })
  }
}

// Webhook endpoint: receives ICP-qualified engagers from Clay
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Support single record or array
    const records = Array.isArray(body) ? body : [body]

    const rows = records.map((r: Record<string, string>) => ({
      post_id: r.post_id || null,
      linkedin_url: r.linkedin_url || r.LinkedIn || null,
      name: r.name || r.Name || r['Full Name'] || null,
      title: r.title || r.Title || r['Job Title'] || null,
      company: r.company || r.Company || r['Company Name'] || null,
      domain: r.domain || r.Domain || null,
      email: r.email || r.Email || null,
      enriched_at: new Date().toISOString(),
    }))

    const { data, error } = await supabase
      .from('post_engagers')
      .insert(rows)
      .select()

    if (error) {
      console.error('[Content Engagers API] Error inserting:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Send Slack notification for each engager
    const slackUrl = process.env.SLACK_WEBHOOK_URL
    if (slackUrl) {
      for (const engager of data || []) {
        const message = `*LinkedIn Engagement* — ${engager.name || 'Unknown'}, ${engager.title || ''} at ${engager.company || 'Unknown'}\n${engager.linkedin_url || ''}`
        try {
          await fetch(slackUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: message }),
          })
        } catch (slackErr) {
          console.error('[Content Engagers API] Slack error:', slackErr)
        }
      }
    }

    return NextResponse.json({ inserted: data?.length || 0 })
  } catch (error) {
    console.error('[Content Engagers API] Error:', error)
    return NextResponse.json({ error: 'Failed to store engagers' }, { status: 500 })
  }
}
