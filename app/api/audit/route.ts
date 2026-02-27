import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { postToSlack } from '@/lib/slack'
import { CATEGORIES } from '@/lib/audit/questions'
import { getTier, getTierLabel, getCategoryTier, getCategoryTierLabel } from '@/lib/audit/scoring'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, company, answers } = body

    if (!name || !email || !answers) {
      return NextResponse.json(
        { error: 'name, email, and answers are required' },
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
        name,
        email,
        company: company || null,
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

    // Slack notification
    const webhookUrl = process.env.SLACK_WEBHOOK_URL
    if (webhookUrl) {
      const tierLabel = getTierLabel(scoreTier)
      const categoryLines = CATEGORIES.map((cat) => {
        const score = categoryScores[cat.id]
        const tier = getCategoryTierLabel(getCategoryTier(score))
        return `  ${cat.name}: ${score}/9 (${tier})`
      }).join('\n')

      const blocks = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'New GTM Audit Submission',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: [
              `*${name}*${company ? ` at ${company}` : ''}`,
              `Email: ${email}`,
              `*Score: ${totalScore}/45 — ${tierLabel}*`,
              '',
              categoryLines,
            ].join('\n'),
          },
        },
      ]

      try {
        await postToSlack(webhookUrl, blocks)
      } catch (err) {
        console.error('[Audit API] Slack error:', err)
      }
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (error) {
    console.error('[Audit API] Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
