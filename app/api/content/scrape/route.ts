import { NextRequest, NextResponse } from 'next/server'
import { scrapePostEngagers } from '@/lib/apify'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { post_url } = body

    if (!post_url) {
      return NextResponse.json({ error: 'post_url is required' }, { status: 400 })
    }

    // The webhook URL where Apify sends results
    // This goes to Clay first for enrichment, not directly to our engagers endpoint
    const clayWebhookUrl = process.env.CLAY_ENGAGER_WEBHOOK_URL
    if (!clayWebhookUrl) {
      return NextResponse.json({ error: 'CLAY_ENGAGER_WEBHOOK_URL not configured' }, { status: 500 })
    }

    const result = await scrapePostEngagers(post_url, clayWebhookUrl)

    return NextResponse.json({
      success: true,
      run_id: result.data?.id,
      message: 'Scrape started. Results will arrive via Clay webhook once enriched.',
    })
  } catch (error) {
    console.error('[Content Scrape API] Error:', error)
    const message = error instanceof Error ? error.message : 'Failed to start scrape'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
