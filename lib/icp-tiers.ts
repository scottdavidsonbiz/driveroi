export interface TierDefinition {
  tier: number
  label: string
  weight: number
  patterns: string[]
  prefixPatterns?: string[]
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
      // C-suite
      'chief marketing officer',
      'chief revenue officer',
      'chief operating officer',
      'chief executive officer',
      'chief commercial officer',
      'chief growth officer',
      'chief sales officer',
      'ceo',
      'cro',
      'cmo',
      'coo',
      'cgo',
      'cso',
      // VP level
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
      'vp demand gen',
      'vp of demand gen',
      'vp business development',
      'vp of business development',
      // Head of
      'head of growth',
      'head of sales',
      'head of marketing',
      'head of revenue',
      'head of business development',
      'head of demand gen',
      'head of partnerships',
    ],
    // Founder/CEO/Owner patterns need special handling — see prefixPatterns below
    prefixPatterns: [
      'founder',
      'co-founder',
      'cofounder',
      'owner',
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
      'director of demand generation',
      'director of marketing',
      'director marketing',
      'director of sales',
      'director sales',
      'director of sales ops',
      'director sales ops',
      'director of revops',
      'director revops',
      'director of growth',
      'director growth',
      'director of business development',
      'director business development',
      'director of partnerships',
      'sales leader',
      'sales director',
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
      'sales manager',
      'business development manager',
      'partnerships manager',
      'marketing operations',
      'senior revops',
      'senior revenue operations',
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

// Split a headline into segments on common LinkedIn separators: | - , &
// Then check if any segment starts with the prefix pattern.
// This prevents "GTM for SaaS Founders" from matching while
// "Founder & CEO at Acme" and "Co-Founder | SaaS" still match.
function matchesPrefixPattern(normalized: string, pattern: string): boolean {
  // Split on separators commonly used in LinkedIn headlines
  const segments = normalized.split(/\s*[|,&\-–—]\s*/)
  for (const seg of segments) {
    const trimmed = seg.trim()
    if (trimmed.startsWith(pattern)) return true
  }
  return false
}

export function classifyEngagerTier(title: string | null | undefined): TierResult {
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return NON_ICP_RESULT
  }

  const normalized = title.toLowerCase()

  for (const tier of TIER_DEFINITIONS) {
    // Check standard substring patterns
    for (const pattern of tier.patterns) {
      if (normalized.includes(pattern)) {
        return { tier: tier.tier, label: tier.label, weight: tier.weight }
      }
    }
    // Check prefix patterns (must appear at start of a headline segment)
    if (tier.prefixPatterns) {
      for (const pattern of tier.prefixPatterns) {
        if (matchesPrefixPattern(normalized, pattern)) {
          return { tier: tier.tier, label: tier.label, weight: tier.weight }
        }
      }
    }
  }

  return NON_ICP_RESULT
}
