import { NextRequest, NextResponse } from 'next/server'
import { buildCarouselPrompt } from '@/lib/carousel/prompt'
import type { CarouselGenerateResponse } from '@/lib/carousel/types'

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

    const prompt = buildCarouselPrompt(idea)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[Carousel Generate] Claude API error:', error)
      return NextResponse.json(
        { error: `Claude API error: ${response.status}` },
        { status: 502 }
      )
    }

    const result = await response.json()
    const content = result.content[0].text

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = content
    if (content.includes('```json')) {
      jsonStr = content.split('```json')[1].split('```')[0]
    } else if (content.includes('```')) {
      jsonStr = content.split('```')[1].split('```')[0]
    }

    const parsed: CarouselGenerateResponse = JSON.parse(jsonStr.trim())

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('[Carousel Generate] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate carousel content' },
      { status: 500 }
    )
  }
}
