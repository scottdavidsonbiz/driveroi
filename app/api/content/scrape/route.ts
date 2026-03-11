import { NextRequest, NextResponse } from 'next/server'
import { scrapePostEngagers } from '@/lib/apify'

export const maxDuration = 120 // Allow up to 120s for two parallel Apify sync runs

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { post_url } = body

    if (!post_url) {
      return NextResponse.json({ error: 'post_url is required' }, { status: 400 })
    }

    const clayWebhookUrl = process.env.CLAY_ENGAGER_WEBHOOK_URL
    if (!clayWebhookUrl) {
      return NextResponse.json({ error: 'CLAY_ENGAGER_WEBHOOK_URL not configured' }, { status: 500 })
    }

    // Run actor synchronously — returns dataset items directly
    const engagers = await scrapePostEngagers(post_url)

    // Forward each engager to Clay for enrichment
    let pushed = 0
    for (const engager of engagers) {
      try {
        await fetch(clayWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...engager,
            source_post_url: post_url,
          }),
        })
        pushed++
      } catch (e) {
        console.error('[Content Scrape API] Failed to push engager to Clay:', e)
      }
    }

    return NextResponse.json({
      success: true,
      engagers_found: engagers.length,
      pushed_to_clay: pushed,
    })
  } catch (error) {
    console.error('[Content Scrape API] Error:', error)
    const message = error instanceof Error ? error.message : 'Failed to start scrape'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
