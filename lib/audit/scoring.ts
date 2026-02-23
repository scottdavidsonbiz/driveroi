import { CATEGORIES, type AuditCategory } from './questions'

export type ScoreTier = 'early' | 'building' | 'solid' | 'mature'
export type CategoryTier = 'critical' | 'improve' | 'strong'

export interface CategoryScore {
  id: string
  name: string
  score: number
  maxScore: number
  tier: CategoryTier
}

export interface AuditResult {
  totalScore: number
  maxScore: number
  tier: ScoreTier
  tierLabel: string
  categoryScores: CategoryScore[]
  recommendations: string[]
}

export function getTier(score: number): ScoreTier {
  if (score >= 39) return 'mature'
  if (score >= 30) return 'solid'
  if (score >= 19) return 'building'
  return 'early'
}

export function getTierLabel(tier: ScoreTier): string {
  switch (tier) {
    case 'mature': return 'GTM-Mature'
    case 'solid': return 'Solid Foundation'
    case 'building': return 'Building Momentum'
    case 'early': return 'Early-Stage GTM'
  }
}

export function getTierColor(tier: ScoreTier): string {
  switch (tier) {
    case 'mature': return '#22c55e'
    case 'solid': return '#3b82f6'
    case 'building': return '#f59e0b'
    case 'early': return '#ef4444'
  }
}

export function getCategoryTier(score: number): CategoryTier {
  if (score >= 7) return 'strong'
  if (score >= 4) return 'improve'
  return 'critical'
}

export function getCategoryTierLabel(tier: CategoryTier): string {
  switch (tier) {
    case 'strong': return 'Strong'
    case 'improve': return 'Room to Improve'
    case 'critical': return 'Critical Gap'
  }
}

export function getCategoryTierColor(tier: CategoryTier): string {
  switch (tier) {
    case 'strong': return '#22c55e'
    case 'improve': return '#f59e0b'
    case 'critical': return '#ef4444'
  }
}

const RECOMMENDATIONS: Record<string, string> = {
  pipeline:
    'Your CRM and pipeline infrastructure needs work. Start by defining clear deal stages with entry/exit criteria, then set up a weekly pipeline review cadence. This is the foundation everything else builds on.',
  enrichment:
    'You\'re leaving money on the table without proper ICP targeting and enrichment. Document your ICP criteria, set up automated enrichment (Clay or Apollo), and build a basic scoring model to prioritize the right leads.',
  outbound:
    'Your outbound engine is underbuilt. Establish a repeatable sequence across email and LinkedIn, automate list building with ICP filters, and track conversion from outreach to meeting booked.',
  reporting:
    'You can\'t optimize what you can\'t measure. Build a unified dashboard that connects marketing activity to pipeline, implement loss analysis, and align sales and marketing on shared KPIs.',
  enablement:
    'Your team is operating without a playbook. Create messaging templates and objection-handling docs, build a structured onboarding process, and implement regular coaching cadences with call reviews.',
}

export function scoreAudit(answers: Record<string, number>): AuditResult {
  const categoryScores: CategoryScore[] = CATEGORIES.map((cat: AuditCategory) => {
    const score = cat.questions.reduce(
      (sum, q) => sum + (answers[q.id] ?? 0),
      0
    )
    return {
      id: cat.id,
      name: cat.name,
      score,
      maxScore: 9,
      tier: getCategoryTier(score),
    }
  })

  const totalScore = categoryScores.reduce((sum, cs) => sum + cs.score, 0)
  const tier = getTier(totalScore)

  // Pick recommendations from the 3 lowest-scoring categories
  const sorted = [...categoryScores].sort((a, b) => a.score - b.score)
  const recommendations = sorted
    .slice(0, 3)
    .filter((cs) => cs.tier !== 'strong')
    .map((cs) => RECOMMENDATIONS[cs.id])

  return {
    totalScore,
    maxScore: 45,
    tier,
    tierLabel: getTierLabel(tier),
    categoryScores,
    recommendations,
  }
}
