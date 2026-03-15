import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { CATEGORIES } from '@/lib/audit/questions'
import { getTier } from '@/lib/audit/scoring'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { answers } = body

    if (!answers) {
      return NextResponse.json(
        { error: 'answers are required' },
        { status: 400 }
      )
    }

    // Calculate scores server-side for data integrity
    const categoryScores: Record<string, number> = {}
    for (const cat of CATEGORIES) {
      categoryScores[cat.id] = cat.questions.reduce(
        (sum, q) => sum + (answers[q.id] ?? 0),
        0
      )
    }
    const totalScore = Object.values(categoryScores).reduce((a, b) => a + b, 0)
    const scoreTier = getTier(totalScore)

    const { data, error } = await supabase
      .from('audit_submissions')
      .insert({
        answers,
        category_scores: categoryScores,
        total_score: totalScore,
        score_tier: scoreTier,
      })
      .select('id')
      .single()

    if (error) {
      console.error('[Audit API] Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (error) {
    console.error('[Audit API] Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
