import { NextRequest, NextResponse } from 'next/server'
import type { HooksGenerateResponse } from '@/lib/carousel/types'

export async function POST(request: NextRequest) {
  try {
    const { idea } = await request.json()

    if (!idea || typeof idea !== 'string') {
      return NextResponse.json(
        { error: 'Post idea is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      )
    }

    const prompt = `You are a LinkedIn content strategist for DriveROI, a B2B GTM consultancy. Given a post idea, generate 3 distinct hook options. Each hook should be a different angle on the same topic.

Rules for hooks:
- NEVER start with "I"
- Each hook should be a single punchy sentence (max 15 words)
- Make them pattern interrupts that stop people scrolling
- Each should take a distinctly different angle: e.g., one contrarian, one data-driven, one question-based
- No em dashes, no exclamation marks
- Sound like a sharp operator, not a consultant

For each hook, also provide a 1-sentence "angle" description explaining the direction the full post would take.

Return ONLY valid JSON:

{
  "hooks": [
    { "hook": "The hook text here.", "angle": "Brief description of where this post would go" },
    { "hook": "Second hook option.", "angle": "Brief description of the angle" },
    { "hook": "Third hook option.", "angle": "Brief description of the angle" }
  ]
}

Post idea: ${idea}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[Carousel Hooks] Claude API error:', error)
      return NextResponse.json(
        { error: `Claude API error: ${response.status}` },
        { status: 502 }
      )
    }

    const result = await response.json()
    const content = result.content[0].text

    let jsonStr = content
    if (content.includes('```json')) {
      jsonStr = content.split('```json')[1].split('```')[0]
    } else if (content.includes('```')) {
      jsonStr = content.split('```')[1].split('```')[0]
    }

    const parsed: HooksGenerateResponse = JSON.parse(jsonStr.trim())

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('[Carousel Hooks] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate hooks' },
      { status: 500 }
    )
  }
}
