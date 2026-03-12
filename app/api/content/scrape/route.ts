import { NextRequest, NextResponse } from 'next/server'
import { scrapePostEngagers } from '@/lib/apify'
import { supabase } from '@/lib/supabase'
import { parseHeadline } from '@/lib/parse-headline'
import { generateAndStoreBrief } from '@/lib/performance-brief'

export const maxDuration = 120 // Allow up to 120s for two parallel Apify sync runs

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { post_url, post_id } = body

    if (!post_url) {
      return NextResponse.json({ error: 'post_url is required' }, { status: 400 })
    }

    // 1. Scrape engagers from Apify
    const engagers = await scrapePostEngagers(post_url)

    if (engagers.length === 0) {
      return NextResponse.json({ success: true, engagers_found: 0, inserted: 0, skipped_existing: 0 })
    }

    // 2. Dedupe: check which LinkedIn URLs we already have in post_engagers
    const profileUrls = engagers
      .map(e => e.profileUrl)
      .filter((url): url is string => !!url)

    const existingUrls = new Set<string>()
    if (profileUrls.length > 0) {
      const { data: existing } = await supabase
        .from('post_engagers')
        .select('linkedin_url')
        .in('linkedin_url', profileUrls)

      if (existing) {
        for (const row of existing) {
          if (row.linkedin_url) existingUrls.add(row.linkedin_url)
        }
      }
    }

    // 3. For new engagers, parse headline and insert directly
    const newRows = []
    let skipped = 0

    for (const engager of engagers) {
      const linkedinUrl = engager.profileUrl || null

      // Skip if we already have this contact
      if (linkedinUrl && existingUrls.has(linkedinUrl)) {
        skipped++
        continue
      }

      // Parse headline for title + company
      const { title, company } = parseHeadline(engager.headline)

      newRows.push({
        post_id: post_id || null,
        linkedin_url: linkedinUrl,
        name: engager.name || null,
        title,
        company,
        domain: null,
        email: null,
        enriched_at: new Date().toISOString(),
      })
    }

    let inserted = 0
    if (newRows.length > 0) {
      const { data, error } = await supabase
        .from('post_engagers')
        .insert(newRows)
        .select()

      if (error) {
        console.error('[Content Scrape API] Supabase insert error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      inserted = data?.length || 0

      // Send Slack notification for ICP-relevant engagers only (title suggests seniority)
      const slackUrl = process.env.SLACK_WEBHOOK_URL
      if (slackUrl && data) {
        const icpKeywords = ['vp', 'vice president', 'director', 'head of', 'chief', 'cmo', 'cro', 'coo', 'ceo']
        const icpEngagers = data.filter(e =>
          e.title && icpKeywords.some(kw => e.title!.toLowerCase().includes(kw))
        )
        for (const engager of icpEngagers) {
          const message = `*LinkedIn Engagement (ICP)* — ${engager.name || 'Unknown'}, ${engager.title || ''} at ${engager.company || 'Unknown'}\n${engager.linkedin_url || ''}`
          try {
            await fetch(slackUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: message }),
            })
          } catch (slackErr) {
            console.error('[Content Scrape API] Slack error:', slackErr)
          }
        }
      }
    }

    // 4. Regenerate performance brief
    try {
      await generateAndStoreBrief()
    } catch (briefErr) {
      console.error('[Content Scrape API] Brief regeneration error:', briefErr)
    }

    return NextResponse.json({
      success: true,
      engagers_found: engagers.length,
      inserted,
      skipped_existing: skipped,
    })
  } catch (error) {
    console.error('[Content Scrape API] Error:', error)
    const message = error instanceof Error ? error.message : 'Failed to start scrape'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
