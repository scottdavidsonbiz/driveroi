import { NextRequest, NextResponse } from 'next/server'
import type { SlideRegenerateRequest, Card, VoiceTone } from '@/lib/carousel/types'

function voiceNote(voice: VoiceTone): string {
  if (voice === 'conversational') {
    return 'Write conversationally, like texting a smart friend in ops. Short sentences, contractions, occasional fragments.'
  }
  return 'Write professionally but directly. Clear, specific, human. Not corporate.'
}

export async function POST(request: NextRequest) {
  try {
    const body: SlideRegenerateRequest = await request.json()
    const { carousel, postCopy, slideIndex, feedback, voice = 'professional' } = body

    if (!carousel || slideIndex < 0 || slideIndex >= carousel.cards.length) {
      return NextResponse.json(
        { error: 'Invalid carousel data or slide index' },
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

    const currentSlide = carousel.cards[slideIndex]
    const otherSlides = carousel.cards
      .map((card, i) => i === slideIndex ? null : `Slide ${i + 1}: ${JSON.stringify(card)}`)
      .filter(Boolean)
      .join('\n')

    const feedbackNote = feedback?.trim()
      ? `\n\nUser feedback on this slide: "${feedback.trim()}"\nAddress this feedback specifically.`
      : '\n\nThe user wants a fresh take on this slide. Make it distinctly different from the current version.'

    const prompt = `You are rewriting a single slide in a LinkedIn carousel for DriveROI, a B2B GTM consultancy.

## Context

The LinkedIn post this carousel accompanies:
"""
${postCopy}
"""

Carousel title: "${carousel.title}"

The other slides (DO NOT repeat their content):
${otherSlides}

## Current slide to rewrite (slide ${slideIndex + 1}):
${JSON.stringify(currentSlide, null, 2)}
${feedbackNote}

## Rules
- Keep the same card type: "${currentSlide.type}"
- The new slide must complement the other slides, not repeat them
- The carousel deepens the post, never restates it
- ${voiceNote(voice)}
- NEVER use: pivotal, crucial, vital, testament, groundbreaking, leverage, utilize, elevate, streamline, game-changer, unlock, empower
- No em dashes, no exclamation marks
- Stay grounded: no fabricated stats or examples

## Card type requirements:
${currentSlide.type === 'stat' ? '- value: The number/stat (e.g., "73%", "$2.4M")\n- label: What it measures (max 6 words, uppercase style)' : ''}${currentSlide.type === 'insight' ? '- headline: Max 8 words, bold claim\n- body: 2-3 sentences (40-60 words), real detail' : ''}${currentSlide.type === 'step' ? `- number: ${(currentSlide as { number: number }).number}\n- title: Max 6 words\n- description: 2-3 sentences (30-50 words)` : ''}${currentSlide.type === 'takeaway' ? '- text: Max 15 words, punchy and quotable' : ''}

Return ONLY valid JSON for the single card object. Example for type "${currentSlide.type}":
${currentSlide.type === 'stat' ? '{ "type": "stat", "value": "3x", "label": "PIPELINE GROWTH IN 90 DAYS" }' : ''}${currentSlide.type === 'insight' ? '{ "type": "insight", "headline": "Your ICP is probably wrong", "body": "Most teams define ICP once and never revisit it. Markets shift faster than your last spreadsheet update." }' : ''}${currentSlide.type === 'step' ? `{ "type": "step", "number": ${(currentSlide as { number: number }).number}, "title": "Audit your lead sources", "description": "Pull last quarter's data. Which sources actually closed? Cut anything below 2% conversion." }` : ''}${currentSlide.type === 'takeaway' ? '{ "type": "takeaway", "text": "Stop optimizing what shouldn\'t exist." }' : ''}`

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
      console.error('[Carousel Regenerate Slide] Claude API error:', error)
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

    const newCard: Card = JSON.parse(jsonStr.trim())

    return NextResponse.json({ card: newCard })
  } catch (error) {
    console.error('[Carousel Regenerate Slide] Error:', error)
    return NextResponse.json(
      { error: 'Failed to regenerate slide' },
      { status: 500 }
    )
  }
}
