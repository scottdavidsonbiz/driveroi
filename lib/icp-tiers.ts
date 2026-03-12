export interface TierDefinition {
  tier: number
  label: string
  weight: number
  patterns: string[]
}

export interface TierResult {
  tier: number
  label: string
  weight: number
}

export const TIER_DEFINITIONS: TierDefinition[] = [
  {
    tier: 3,
    label: 'Buyer',
    weight: 3,
    patterns: [
      'chief marketing officer',
      'chief revenue officer',
      'vp marketing',
      'vp of marketing',
      'vp sales',
      'vp of sales',
      'vp revops',
      'vp of revops',
      'vp revenue operations',
      'vp of revenue operations',
      'vp revenue',
      'vp of revenue',
      'vp growth',
      'vp of growth',
      'head of growth',
      'cro',
      'cmo',
    ],
  },
  {
    tier: 2,
    label: 'Influencer',
    weight: 2,
    patterns: [
      'director of revenue operations',
      'director revenue operations',
      'head of revenue operations',
      'director of demand gen',
      'director demand gen',
      'head of demand gen',
      'director of marketing',
      'director marketing',
      'head of marketing',
      'director of sales ops',
      'director sales ops',
      'director of revops',
      'director revops',
      'director of growth',
      'director growth',
    ],
  },
  {
    tier: 1,
    label: 'Adjacent',
    weight: 1,
    patterns: [
      'marketing manager',
      'revops manager',
      'revenue operations manager',
      'sales ops manager',
      'sales operations manager',
      'demand gen manager',
      'demand generation manager',
      'growth manager',
      'gtm manager',
    ],
  },
  {
    tier: 0,
    label: 'Non-ICP',
    weight: 0,
    patterns: [],
  },
]

const NON_ICP_RESULT: TierResult = { tier: 0, label: 'Non-ICP', weight: 0 }

export function classifyEngagerTier(title: string | null | undefined): TierResult {
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return NON_ICP_RESULT
  }

  const normalized = title.toLowerCase()

  for (const tier of TIER_DEFINITIONS) {
    if (tier.patterns.length === 0) continue
    for (const pattern of tier.patterns) {
      if (normalized.includes(pattern)) {
        return { tier: tier.tier, label: tier.label, weight: tier.weight }
      }
    }
  }

  return NON_ICP_RESULT
}
