import { NextResponse } from 'next/server'
import { generatePerformanceBrief, generateAndStoreBrief } from '@/lib/performance-brief'

export async function GET() {
  try {
    const brief = await generatePerformanceBrief()
    return NextResponse.json({ brief })
  } catch (error) {
    console.error('[Brief API] Error:', error)
    return NextResponse.json({ error: 'Failed to generate brief' }, { status: 500 })
  }
}

export async function POST() {
  try {
    const brief = await generateAndStoreBrief()
    return NextResponse.json({ brief, generated_at: brief.generated_at })
  } catch (error) {
    console.error('[Brief API] Error:', error)
    return NextResponse.json({ error: 'Failed to regenerate brief' }, { status: 500 })
  }
}
