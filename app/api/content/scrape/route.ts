import { NextRequest, NextResponse } from 'next/server'
import { scrapePostEngagers } from '@/lib/apify'
import { supabase } from '@/lib/supabase'
import { parseHeadline } from '@/lib/parse-headline'
import { generateAndStoreBrief } from '@/lib/performance-brief'

export const maxDuration = 120 // Allow up to 120s for two parallel Apify sync runs

// Extract a field from an Apify engager object, trying multiple possible key names
function getField(obj: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const val = obj[key]
    if (typeof val === 'string' && val.trim()) return val.trim()
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { post_url, post_id } = body

    if (!post_url) {
      return NextResponse.json({ error: 'post_url is required' }, { status: 400 })
    }

    // 1. Scrape engagers from Apify
    const engagers = await scrapePostEngagers(post_url)

    // Log first raw engager for debugging field names
    if (engagers.length > 0) {
      console.log('[Content Scrape API] Raw Apify fields:', JSON.stringify(Object.keys(engagers[0])))
      console.log('[Content Scrape API] First engager sample:', JSON.stringify(engagers[0]))
    }

    if (engagers.length === 0) {
      return NextResponse.json({ success: true, engagers_found: 0, inserted: 0, skipped_existing: 0 })
    }

    // 2. Normalize field names — try multiple possible Apify field names
    const normalized = engagers.map(e => {
      const raw = e as Record<string, unknown>
      return {
        linkedinUrl: getField(raw, 'profileUrl', 'profile_url', 'linkedInUrl', 'linkedin_url', 'profileLink', 'link', 'url'),
        name: getField(raw, 'name', 'fullName', 'full_name', 'Name'),
        headline: getField(raw, 'headline', 'tagline', 'Headline', 'title', 'Title', 'subtitle', 'description'),
      }
    })

    // 3. Dedupe: check which LinkedIn URLs we already have in post_engagers
    const profileUrls = normalized
      .map(e => e.linkedinUrl)
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

    // Also dedupe by name for engagers without LinkedIn URLs
    const existingNames = new Set<string>()
    const namesWithoutUrls = normalized
      .filter(e => !e.linkedinUrl && e.name)
      .map(e => e.name!)

    if (namesWithoutUrls.length > 0) {
      const { data: existingByName } = await supabase
        .from('post_engagers')
        .select('name')
        .in('name', namesWithoutUrls)

      if (existingByName) {
        for (const row of existingByName) {
          if (row.name) existingNames.add(row.name)
        }
      }
    }

    // 4. For new engagers, parse headline and insert directly
    const newRows = []
    let skipped = 0

    for (const engager of normalized) {
      // Skip if we already have this contact
      if (engager.linkedinUrl && existingUrls.has(engager.linkedinUrl)) {
        skipped++
        continue
      }
      if (!engager.linkedinUrl && engager.name && existingNames.has(engager.name)) {
        skipped++
        continue
      }

      // Parse headline for title + company
      const { title, company } = parseHeadline(engager.headline)

      newRows.push({
        post_id: post_id || null,
        linkedin_url: engager.linkedinUrl,
        name: engager.name,
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

      // Send Slack notification for ICP-relevant engagers only
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

    // 5. Regenerate performance brief
    try {
      await generateAndStoreBrief()
    } catch (briefErr) {
      console.error('[Content Scrape API] Brief regeneration error:', briefErr)
    }

    // Include raw field names in response for debugging
    const rawFields = engagers.length > 0 ? Object.keys(engagers[0]) : []

    return NextResponse.json({
      success: true,
      engagers_found: engagers.length,
      inserted,
      skipped_existing: skipped,
      _debug_raw_fields: rawFields,
      _debug_sample: engagers.length > 0 ? engagers[0] : null,
    })
  } catch (error) {
    console.error('[Content Scrape API] Error:', error)
    const message = error instanceof Error ? error.message : 'Failed to start scrape'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
