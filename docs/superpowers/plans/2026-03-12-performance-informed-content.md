# Performance-Informed Content Creation — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Feed ICP-weighted LinkedIn performance data into the content creator skill and the app's Ideas page so content creation is informed by what works for revenue leaders.

**Architecture:** Pure utility functions (`lib/icp-tiers.ts`) classify engagers by title tier. A brief generator (`lib/performance-brief.ts`) queries Supabase, computes ICP scores per post, and outputs structured JSON + markdown. An API route serves the brief to the frontend. The `linkedin-content-creator` skill reads the markdown brief before generating posts.

**Tech Stack:** Next.js 14 (app router), Supabase, TypeScript, Tailwind + Radix UI, Recharts, Vitest (new — for pure function tests)

**Spec:** `docs/superpowers/specs/2026-03-12-performance-informed-content-design.md`

---

## Chunk 1: Core Library

### Task 1: Vitest Setup

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add vitest dev dependency + test script)

- [ ] **Step 1: Install vitest**

```bash
npm install -D vitest
```

- [ ] **Step 2: Create vitest config**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Step 3: Add test script to package.json**

Add to `scripts`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Verify vitest runs**

```bash
npx vitest run
```

Expected: "No test files found" (confirms vitest is configured correctly)

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "Add vitest for unit testing"
```

---

### Task 2: ICP Tier Classification

**Files:**
- Create: `lib/icp-tiers.ts`
- Create: `lib/__tests__/icp-tiers.test.ts`

- [ ] **Step 1: Write failing tests for classifyEngagerTier**

Create `lib/__tests__/icp-tiers.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { classifyEngagerTier, TIER_DEFINITIONS } from '../icp-tiers'

describe('classifyEngagerTier', () => {
  it('classifies VP Marketing as tier 3 (buyer)', () => {
    const result = classifyEngagerTier('VP Marketing')
    expect(result.tier).toBe(3)
    expect(result.label).toBe('Buyer')
  })

  it('classifies CRO as tier 3', () => {
    expect(classifyEngagerTier('CRO').tier).toBe(3)
  })

  it('classifies Chief Marketing Officer as tier 3', () => {
    expect(classifyEngagerTier('Chief Marketing Officer').tier).toBe(3)
  })

  it('classifies Director Marketing as tier 2 (influencer)', () => {
    const result = classifyEngagerTier('Director of Marketing')
    expect(result.tier).toBe(2)
    expect(result.label).toBe('Influencer')
  })

  it('classifies Head of Demand Gen as tier 2', () => {
    expect(classifyEngagerTier('Head of Demand Generation').tier).toBe(2)
  })

  it('classifies Marketing Manager as tier 1 (adjacent)', () => {
    const result = classifyEngagerTier('Marketing Manager')
    expect(result.tier).toBe(1)
    expect(result.label).toBe('Adjacent')
  })

  it('classifies SDR as tier 0 (non-ICP)', () => {
    const result = classifyEngagerTier('Senior SDR')
    expect(result.tier).toBe(0)
    expect(result.label).toBe('Non-ICP')
  })

  it('is case-insensitive', () => {
    expect(classifyEngagerTier('vp marketing').tier).toBe(3)
    expect(classifyEngagerTier('VP MARKETING').tier).toBe(3)
    expect(classifyEngagerTier('director marketing').tier).toBe(2)
  })

  it('handles null/empty titles as tier 0', () => {
    expect(classifyEngagerTier(null).tier).toBe(0)
    expect(classifyEngagerTier('').tier).toBe(0)
    expect(classifyEngagerTier(undefined as unknown as string).tier).toBe(0)
  })

  it('matches longest pattern first (VP Marketing over Marketing Manager)', () => {
    // "VP of Marketing" should match VP tier, not Marketing Manager tier
    expect(classifyEngagerTier('VP of Marketing').tier).toBe(3)
  })

  it('matches titles with extra words around the pattern', () => {
    expect(classifyEngagerTier('Senior VP of Sales, North America').tier).toBe(3)
    expect(classifyEngagerTier('Director of Revenue Operations at Acme').tier).toBe(2)
  })

  it('exports TIER_DEFINITIONS array', () => {
    expect(TIER_DEFINITIONS).toBeDefined()
    expect(TIER_DEFINITIONS.length).toBe(4)
    expect(TIER_DEFINITIONS[0].tier).toBe(3) // highest tier first
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run lib/__tests__/icp-tiers.test.ts
```

Expected: FAIL — module not found

- [ ] **Step 3: Implement icp-tiers.ts**

Create `lib/icp-tiers.ts`:

```typescript
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

// Ordered by tier descending so we match highest-value patterns first.
// Within each tier, longer patterns are listed first for priority matching.
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
    patterns: [], // Catch-all — everything that doesn't match above
  },
]

const NON_ICP_RESULT: TierResult = { tier: 0, label: 'Non-ICP', weight: 0 }

export function classifyEngagerTier(title: string | null | undefined): TierResult {
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return NON_ICP_RESULT
  }

  const normalized = title.toLowerCase()

  // Check tiers 3, 2, 1 in order (highest first).
  // TIER_DEFINITIONS[3] is the catch-all (tier 0) with no patterns.
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run lib/__tests__/icp-tiers.test.ts
```

Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/icp-tiers.ts lib/__tests__/icp-tiers.test.ts
git commit -m "Add ICP tier classification with tests"
```

---

### Task 3: Hook Style Classifier

**Files:**
- Create: `lib/hook-classifier.ts`
- Create: `lib/__tests__/hook-classifier.test.ts`

- [ ] **Step 1: Write failing tests for classifyHookStyle**

Create `lib/__tests__/hook-classifier.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { classifyHookStyle, isLinkedInUrl } from '../hook-classifier'

describe('isLinkedInUrl', () => {
  it('detects LinkedIn post URLs', () => {
    expect(isLinkedInUrl('https://www.linkedin.com/feed/update/urn:li:activity:123')).toBe(true)
  })

  it('returns false for regular text', () => {
    expect(isLinkedInUrl('Companies are racing to capture employee knowledge')).toBe(false)
  })

  it('returns false for null/empty', () => {
    expect(isLinkedInUrl(null)).toBe(false)
    expect(isLinkedInUrl('')).toBe(false)
  })
})

describe('classifyHookStyle', () => {
  it('classifies question-list format', () => {
    const text = 'Can you answer these about your business right now?\n1. Do you know your CAC?\n2. What is your pipeline velocity?'
    expect(classifyHookStyle(text)).toBe('question-list')
  })

  it('classifies contrarian hooks', () => {
    expect(classifyHookStyle('Most people think cold email is dead. Actually, they are wrong.')).toBe('contrarian')
    expect(classifyHookStyle('Stop sending cold emails without a signal layer.')).toBe('contrarian')
  })

  it('classifies data-led hooks', () => {
    expect(classifyHookStyle('We sent 2,106 emails across 9 campaigns.')).toBe('data-led')
    expect(classifyHookStyle('$120/hr is the rate for white-label Clay work.')).toBe('data-led')
    expect(classifyHookStyle('85% of their pipeline comes from marketing.')).toBe('data-led')
  })

  it('classifies story hooks', () => {
    expect(classifyHookStyle('Last week I sat down with a CRO who had just raised Series A.')).toBe('story')
    expect(classifyHookStyle('We spent 3 months building outbound for an oilfield services company.')).toBe('story')
  })

  it('classifies observation hooks', () => {
    expect(classifyHookStyle('Most companies I talk to have no idea what their pipeline velocity is.')).toBe('observation')
    expect(classifyHookStyle('Every time I audit a GTM stack, the same pattern shows up.')).toBe('observation')
  })

  it('falls back to direct for unrecognized patterns', () => {
    expect(classifyHookStyle('Build your GTM infrastructure before you hire salespeople.')).toBe('direct')
  })

  it('returns null for null/empty text', () => {
    expect(classifyHookStyle(null)).toBeNull()
    expect(classifyHookStyle('')).toBeNull()
  })

  it('returns null for LinkedIn URLs', () => {
    expect(classifyHookStyle('https://www.linkedin.com/feed/update/urn:li:activity:123')).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run lib/__tests__/hook-classifier.test.ts
```

Expected: FAIL — module not found

- [ ] **Step 3: Implement hook-classifier.ts**

Create `lib/hook-classifier.ts`:

```typescript
export type HookStyle = 'question-list' | 'contrarian' | 'data-led' | 'story' | 'direct' | 'observation'

export function isLinkedInUrl(text: string | null | undefined): boolean {
  if (!text) return false
  return text.includes('linkedin.com/feed/update')
}

export function classifyHookStyle(text: string | null | undefined): HookStyle | null {
  if (!text || text.trim() === '') return null
  if (isLinkedInUrl(text)) return null

  const firstLine = text.split('\n')[0].toLowerCase()
  const fullLower = text.toLowerCase()

  // Question-list: starts with question AND has numbered/bulleted items
  if (
    (firstLine.includes('?') || firstLine.startsWith('can ') || firstLine.startsWith('do ') || firstLine.startsWith('how ') || firstLine.startsWith('what ') || firstLine.startsWith('why ')) &&
    (/\n\s*[\d]+[.)]\s/.test(fullLower) || /\n\s*[-•]\s/.test(fullLower))
  ) {
    return 'question-list'
  }

  // Contrarian: negation or contradiction words in first sentence
  const contrarianPatterns = [' actually', ' wrong', ' stop ', 'stop ', ' but ', ' isn\'t', ' aren\'t', ' don\'t', ' doesn\'t', ' not ', ' dead', ' myth']
  if (contrarianPatterns.some(p => firstLine.includes(p))) {
    return 'contrarian'
  }

  // Data-led: numbers, percentages, or dollar signs in first line
  if (/\d[\d,]*/.test(firstLine) && (/\$/.test(firstLine) || /%/.test(firstLine) || /\d{2,}/.test(firstLine))) {
    return 'data-led'
  }

  // Story: temporal or first-person narrative opening
  const storyPatterns = ['last week', 'last month', 'last year', 'yesterday', 'this morning', 'i sat down', 'i was ', 'we spent', 'we built', 'we ran', 'i just']
  if (storyPatterns.some(p => firstLine.includes(p))) {
    return 'story'
  }

  // Observation: generalized pattern observation
  const observationPatterns = ['most companies', 'every time', 'every company', 'most founders', 'most people', 'in my experience', 'companies are']
  if (observationPatterns.some(p => firstLine.includes(p))) {
    return 'observation'
  }

  // Default: direct
  return 'direct'
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run lib/__tests__/hook-classifier.test.ts
```

Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/hook-classifier.ts lib/__tests__/hook-classifier.test.ts
git commit -m "Add hook style classifier with tests"
```

---

### Task 4: Performance Brief Generator

**Files:**
- Create: `lib/performance-brief.ts`

This is the largest unit. It queries Supabase, links metrics to engagers through `content_posts`, computes ICP scores, classifies hooks, and produces the brief JSON + markdown.

- [ ] **Step 1: Create lib/performance-brief.ts with types and main function**

```typescript
import { supabase } from '@/lib/supabase'
import type { LinkedInMetric, PostEngager } from '@/lib/supabase'
import { classifyEngagerTier } from '@/lib/icp-tiers'
import { classifyHookStyle, isLinkedInUrl, type HookStyle } from '@/lib/hook-classifier'

// --- Types ---

export interface PostSummary {
  published_at: string
  hook: string
  impressions: number
  engagement_rate: number
  icp_score: number | null
  tier_breakdown: { tier_3: number; tier_2: number; tier_1: number; tier_0: number }
}

export interface HookPattern {
  style: string
  avg_icp_score: number | null
  avg_impressions: number
  sample_size: number
}

export interface DayPattern {
  day: string
  avg_icp_score: number | null
  avg_impressions: number
  sample_size: number
}

export interface FormatPattern {
  format: string
  avg_icp_score: number | null
  avg_impressions: number
  sample_size: number
}

export interface PerformanceBrief {
  generated_at: string
  confidence: 'low' | 'moderate' | 'high'
  sample_size: {
    total_posts: number
    posts_with_engager_data: number
    total_engagers: number
  }
  icp_insights: {
    overall_tier_distribution: {
      tier_3_buyer_pct: number
      tier_2_influencer_pct: number
      tier_1_adjacent_pct: number
      tier_0_non_icp_pct: number
    }
    top_posts_by_icp_score: PostSummary[]
    bottom_posts_by_icp_score: PostSummary[]
    icp_trend: 'improving' | 'declining' | 'stable' | 'insufficient_data'
  }
  reach_insights: {
    top_posts_by_impressions: PostSummary[]
    avg_impressions: number
    avg_engagement_rate: number
  }
  patterns: {
    best_hooks_for_icp: HookPattern[]
    best_days_for_icp: DayPattern[]
    best_formats_for_icp: FormatPattern[]
    reach_vs_icp_divergence: string[]
  }
  avoid: string[]
  tactical_rules: string[]
}

// --- Internal types for aggregation ---

interface EnrichedPost {
  post_id: string | null
  post_text: string | null
  linkedin_url: string | null
  published_at: string | null
  impressions: number
  engagement_rate: number
  engagers: PostEngager[]
  icp_score: number | null
  hook_style: HookStyle | null
  tier_breakdown: { tier_3: number; tier_2: number; tier_1: number; tier_0: number }
}

interface ContentPostRow {
  id: string
  post_text: string | null
  linkedin_url: string | null
  published_at: string | null
}

// --- Main generator ---

export async function generatePerformanceBrief(): Promise<PerformanceBrief> {
  // 1. Fetch all data
  const [metricsResult, engagersResult, postsResult] = await Promise.all([
    supabase.from('linkedin_metrics').select('*').order('published_at', { ascending: false }),
    supabase.from('post_engagers').select('*'),
    supabase.from('content_posts').select('id, post_text, linkedin_url, published_at'),
  ])

  const metrics: LinkedInMetric[] = metricsResult.data || []
  const engagers: PostEngager[] = engagersResult.data || []
  const contentPosts: ContentPostRow[] = postsResult.data || []

  // 2. Build lookup maps
  const engagersByPostId = new Map<string, PostEngager[]>()
  for (const e of engagers) {
    if (!e.post_id) continue
    const list = engagersByPostId.get(e.post_id) || []
    list.push(e)
    engagersByPostId.set(e.post_id, list)
  }

  const contentPostByUrl = new Map<string, ContentPostRow>()
  const contentPostById = new Map<string, ContentPostRow>()
  for (const cp of contentPosts) {
    contentPostById.set(cp.id, cp)
    if (cp.linkedin_url) {
      contentPostByUrl.set(cp.linkedin_url, cp)
    }
  }

  // 3. Enrich each metric row: link to content_post, get engagers, compute ICP score
  const enrichedPosts: EnrichedPost[] = []

  for (const m of metrics) {
    let linkedPostId = m.post_id
    let resolvedText = m.post_text
    let linkedUrl: string | null = null

    // Attempt to link metric → content_post via 3 strategies
    if (linkedPostId && contentPostById.has(linkedPostId)) {
      // Strategy 0: post_id already set
      const cp = contentPostById.get(linkedPostId)!
      resolvedText = cp.post_text || resolvedText
      linkedUrl = cp.linkedin_url
    } else if (m.post_text && isLinkedInUrl(m.post_text)) {
      // Strategy 1: post_text is a LinkedIn URL — match against content_posts.linkedin_url
      const cp = contentPostByUrl.get(m.post_text)
      if (cp) {
        linkedPostId = cp.id
        resolvedText = cp.post_text || m.post_text
        linkedUrl = m.post_text
      } else {
        linkedUrl = m.post_text
      }
    } else if (m.post_text && m.published_at) {
      // Strategy 2: post_text is content — fuzzy match against content_posts by text + date
      const metricDate = new Date(m.published_at).getTime()
      const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000
      const metricTextLower = m.post_text.toLowerCase().slice(0, 100)
      for (const cp of contentPosts) {
        if (!cp.post_text || !cp.published_at) continue
        const cpDate = new Date(cp.published_at).getTime()
        if (Math.abs(metricDate - cpDate) > TWO_DAYS_MS) continue
        // Match if first 100 chars overlap significantly
        const cpTextLower = cp.post_text.toLowerCase().slice(0, 100)
        if (metricTextLower === cpTextLower || cp.post_text.toLowerCase().includes(metricTextLower.slice(0, 50))) {
          linkedPostId = cp.id
          resolvedText = cp.post_text
          linkedUrl = cp.linkedin_url
          break
        }
      }
    }

    // Get engagers for this post
    const postEngagers = linkedPostId ? (engagersByPostId.get(linkedPostId) || []) : []

    // Compute ICP score
    let icpScore: number | null = null
    const tierBreakdown = { tier_3: 0, tier_2: 0, tier_1: 0, tier_0: 0 }

    if (postEngagers.length > 0) {
      let totalWeight = 0
      for (const e of postEngagers) {
        const tier = classifyEngagerTier(e.title)
        totalWeight += tier.weight
        if (tier.tier === 3) tierBreakdown.tier_3++
        else if (tier.tier === 2) tierBreakdown.tier_2++
        else if (tier.tier === 1) tierBreakdown.tier_1++
        else tierBreakdown.tier_0++
      }
      icpScore = parseFloat((totalWeight / postEngagers.length).toFixed(2))
    }

    // Classify hook
    const hookStyle = classifyHookStyle(resolvedText)

    const hook = resolvedText && !isLinkedInUrl(resolvedText)
      ? resolvedText.split('\n')[0].slice(0, 80)
      : linkedUrl || '(no text)'

    enrichedPosts.push({
      post_id: linkedPostId,
      post_text: resolvedText,
      linkedin_url: linkedUrl,
      published_at: m.published_at,
      impressions: m.impressions,
      engagement_rate: m.engagement_rate,
      engagers: postEngagers,
      icp_score: icpScore,
      hook_style: hookStyle,
      tier_breakdown: tierBreakdown,
    })
  }

  // 4. Compute brief sections
  const postsWithEngagers = enrichedPosts.filter(p => p.icp_score !== null)
  const totalEngagers = engagers.length

  const confidence: PerformanceBrief['confidence'] =
    postsWithEngagers.length > 15 ? 'high' :
    postsWithEngagers.length >= 5 ? 'moderate' : 'low'

  // Tier distribution across all engagers
  const allTiers = { tier_3: 0, tier_2: 0, tier_1: 0, tier_0: 0 }
  for (const p of postsWithEngagers) {
    allTiers.tier_3 += p.tier_breakdown.tier_3
    allTiers.tier_2 += p.tier_breakdown.tier_2
    allTiers.tier_1 += p.tier_breakdown.tier_1
    allTiers.tier_0 += p.tier_breakdown.tier_0
  }
  const tierTotal = allTiers.tier_3 + allTiers.tier_2 + allTiers.tier_1 + allTiers.tier_0 || 1
  const tierDist = {
    tier_3_buyer_pct: parseFloat(((allTiers.tier_3 / tierTotal) * 100).toFixed(1)),
    tier_2_influencer_pct: parseFloat(((allTiers.tier_2 / tierTotal) * 100).toFixed(1)),
    tier_1_adjacent_pct: parseFloat(((allTiers.tier_1 / tierTotal) * 100).toFixed(1)),
    tier_0_non_icp_pct: parseFloat(((allTiers.tier_0 / tierTotal) * 100).toFixed(1)),
  }

  // ICP trend
  let icpTrend: PerformanceBrief['icp_insights']['icp_trend'] = 'insufficient_data'
  const sortedByDate = [...postsWithEngagers].sort(
    (a, b) => new Date(a.published_at || 0).getTime() - new Date(b.published_at || 0).getTime()
  )
  if (sortedByDate.length >= 10) {
    const recent5 = sortedByDate.slice(-5)
    const prev5 = sortedByDate.slice(-10, -5)
    const recentAvg = recent5.reduce((s, p) => s + (p.icp_score || 0), 0) / 5
    const prevAvg = prev5.reduce((s, p) => s + (p.icp_score || 0), 0) / 5
    const delta = recentAvg - prevAvg
    icpTrend = delta > 0.3 ? 'improving' : delta < -0.3 ? 'declining' : 'stable'
  }

  // Top/bottom by ICP score
  const byIcp = [...postsWithEngagers].sort((a, b) => (b.icp_score || 0) - (a.icp_score || 0))
  const toSummary = (p: EnrichedPost): PostSummary => ({
    published_at: p.published_at || '',
    hook: p.post_text && !isLinkedInUrl(p.post_text)
      ? p.post_text.split('\n')[0].slice(0, 80)
      : p.linkedin_url || '(no text)',
    impressions: p.impressions,
    engagement_rate: p.engagement_rate,
    icp_score: p.icp_score,
    tier_breakdown: p.tier_breakdown,
  })

  const topByIcp = byIcp.slice(0, 5).map(toSummary)
  const bottomByIcp = byIcp.slice(-3).reverse().map(toSummary)

  // Top by impressions
  const byImpressions = [...enrichedPosts].sort((a, b) => b.impressions - a.impressions)
  const topByImpressions = byImpressions.slice(0, 5).map(toSummary)

  const avgImpressions = enrichedPosts.length > 0
    ? Math.round(enrichedPosts.reduce((s, p) => s + p.impressions, 0) / enrichedPosts.length)
    : 0
  const avgEngagementRate = enrichedPosts.length > 0
    ? parseFloat((enrichedPosts.reduce((s, p) => s + p.engagement_rate, 0) / enrichedPosts.length).toFixed(2))
    : 0

  // Patterns: hooks
  const hookGroups = new Map<string, { icpScores: number[]; impressions: number[] }>()
  for (const p of enrichedPosts) {
    if (!p.hook_style) continue
    const group = hookGroups.get(p.hook_style) || { icpScores: [], impressions: [] }
    if (p.icp_score !== null) group.icpScores.push(p.icp_score)
    group.impressions.push(p.impressions)
    hookGroups.set(p.hook_style, group)
  }
  const bestHooks: HookPattern[] = [...hookGroups.entries()]
    .map(([style, g]) => ({
      style,
      avg_icp_score: g.icpScores.length > 0
        ? parseFloat((g.icpScores.reduce((s, v) => s + v, 0) / g.icpScores.length).toFixed(2))
        : null,
      avg_impressions: Math.round(g.impressions.reduce((s, v) => s + v, 0) / g.impressions.length),
      sample_size: g.impressions.length,
    }))
    .sort((a, b) => (b.avg_icp_score || 0) - (a.avg_icp_score || 0))

  // Patterns: day of week
  const dayGroups = new Map<string, { icpScores: number[]; impressions: number[] }>()
  for (const p of enrichedPosts) {
    if (!p.published_at) continue
    const day = new Date(p.published_at).toLocaleDateString('en-US', { weekday: 'long' })
    const group = dayGroups.get(day) || { icpScores: [], impressions: [] }
    if (p.icp_score !== null) group.icpScores.push(p.icp_score)
    group.impressions.push(p.impressions)
    dayGroups.set(day, group)
  }
  const bestDays: DayPattern[] = [...dayGroups.entries()]
    .map(([day, g]) => ({
      day,
      avg_icp_score: g.icpScores.length > 0
        ? parseFloat((g.icpScores.reduce((s, v) => s + v, 0) / g.icpScores.length).toFixed(2))
        : null,
      avg_impressions: Math.round(g.impressions.reduce((s, v) => s + v, 0) / g.impressions.length),
      sample_size: g.impressions.length,
    }))
    .sort((a, b) => (b.avg_icp_score || 0) - (a.avg_icp_score || 0))

  // Patterns: format — linkedin_metrics has no format column.
  // Returns empty until a format field is added to the metrics import.
  // The PerformanceBrief type keeps the field for forward-compatibility.
  const bestFormats: FormatPattern[] = []

  // Divergence: high reach but low ICP (or vice versa)
  const divergence: string[] = []
  for (const p of postsWithEngagers) {
    if (p.impressions > avgImpressions * 1.5 && (p.icp_score || 0) < 1.0) {
      divergence.push(`High reach (${p.impressions} impressions) but low ICP score (${p.icp_score}): "${p.post_text?.split('\n')[0]?.slice(0, 60) || '?'}"`)
    }
    if (p.impressions < avgImpressions * 0.5 && (p.icp_score || 0) > 2.0) {
      divergence.push(`Low reach (${p.impressions} impressions) but high ICP score (${p.icp_score}): "${p.post_text?.split('\n')[0]?.slice(0, 60) || '?'}"`)
    }
  }

  // Avoid rules
  const avoid: string[] = []
  const caveat = confidence === 'low'
    ? ' (low confidence — based on limited engager data)'
    : ''
  // Check for reshare underperformance
  const reshares = enrichedPosts.filter(p =>
    p.post_text?.toLowerCase().includes('reshare') || p.engagement_rate === 0
  )
  if (reshares.length > 0) {
    avoid.push(`Reshares: ${reshares.length} post(s) with 0 engagement${caveat}`)
  }
  // Check for underperforming days
  for (const dp of bestDays) {
    if (dp.avg_impressions < avgImpressions * 0.5 && dp.sample_size >= 2) {
      avoid.push(`${dp.day} posts average ${dp.avg_impressions} impressions (below ${avgImpressions} avg)${caveat}`)
    }
  }

  // Tactical rules
  const tacticalRules: string[] = []
  if (bestHooks.length > 0 && bestHooks[0].avg_icp_score !== null) {
    tacticalRules.push(`Best hook style for ICP: ${bestHooks[0].style} (avg ICP score: ${bestHooks[0].avg_icp_score}, n=${bestHooks[0].sample_size})`)
  }
  if (bestDays.length > 0 && bestDays[0].avg_icp_score !== null) {
    tacticalRules.push(`Best day for ICP engagement: ${bestDays[0].day} (avg ICP score: ${bestDays[0].avg_icp_score}, n=${bestDays[0].sample_size})`)
  }
  if (confidence === 'low') {
    tacticalRules.push('Confidence is low. Treat all patterns as directional, not conclusive.')
  }

  return {
    generated_at: new Date().toISOString(),
    confidence,
    sample_size: {
      total_posts: enrichedPosts.length,
      posts_with_engager_data: postsWithEngagers.length,
      total_engagers: totalEngagers,
    },
    icp_insights: {
      overall_tier_distribution: tierDist,
      top_posts_by_icp_score: topByIcp,
      bottom_posts_by_icp_score: bottomByIcp,
      icp_trend: icpTrend,
    },
    reach_insights: {
      top_posts_by_impressions: topByImpressions,
      avg_impressions: avgImpressions,
      avg_engagement_rate: avgEngagementRate,
    },
    patterns: {
      best_hooks_for_icp: bestHooks,
      best_days_for_icp: bestDays,
      best_formats_for_icp: bestFormats,
      reach_vs_icp_divergence: divergence,
    },
    avoid,
    tactical_rules: tacticalRules,
  }
}

// --- Markdown brief writer ---

function briefToMarkdown(brief: PerformanceBrief): string {
  const lines: string[] = []
  const { sample_size, confidence } = brief

  lines.push('# LinkedIn Performance Brief')
  lines.push(`> Auto-generated ${new Date().toISOString().split('T')[0]}. Confidence: ${confidence} (${sample_size.total_posts} posts, ${sample_size.posts_with_engager_data} with engager data, ${sample_size.total_engagers} total engagers).`)
  lines.push('')

  // What's working for ICP
  lines.push('## What\'s Working for ICP')
  if (brief.icp_insights.top_posts_by_icp_score.length > 0) {
    for (const p of brief.icp_insights.top_posts_by_icp_score.slice(0, 3)) {
      lines.push(`- **ICP ${p.icp_score}** | ${p.impressions} impressions | "${p.hook}" (Buyers: ${p.tier_breakdown.tier_3}, Influencers: ${p.tier_breakdown.tier_2}, Adjacent: ${p.tier_breakdown.tier_1})`)
    }
  } else {
    lines.push('- No posts with engager data yet. Scrape engagers to start tracking ICP quality.')
  }
  if (brief.patterns.best_hooks_for_icp.length > 0) {
    lines.push('')
    lines.push('**Hook patterns:**')
    for (const h of brief.patterns.best_hooks_for_icp) {
      lines.push(`- ${h.style}: avg ICP ${h.avg_icp_score ?? 'n/a'}, avg impressions ${h.avg_impressions} (n=${h.sample_size})`)
    }
  }
  lines.push('')

  // What's working for reach
  lines.push('## What\'s Working for Reach')
  for (const p of brief.reach_insights.top_posts_by_impressions.slice(0, 3)) {
    const icpNote = p.icp_score !== null ? ` | ICP: ${p.icp_score}` : ''
    lines.push(`- **${p.impressions.toLocaleString()} impressions** | ${p.engagement_rate}% engagement${icpNote} | "${p.hook}"`)
  }
  if (brief.patterns.reach_vs_icp_divergence.length > 0) {
    lines.push('')
    lines.push('**Reach vs ICP divergence:**')
    for (const d of brief.patterns.reach_vs_icp_divergence) {
      lines.push(`- ${d}`)
    }
  }
  lines.push('')

  // What to avoid
  lines.push('## What to Avoid')
  if (brief.avoid.length > 0) {
    for (const a of brief.avoid) {
      lines.push(`- ${a}`)
    }
  } else {
    lines.push('- No clear underperformers identified yet.')
  }
  lines.push('')

  // ICP audience quality
  lines.push('## ICP Audience Quality')
  const dist = brief.icp_insights.overall_tier_distribution
  lines.push(`- Buyers (Tier 3): ${dist.tier_3_buyer_pct}%`)
  lines.push(`- Influencers (Tier 2): ${dist.tier_2_influencer_pct}%`)
  lines.push(`- Adjacent (Tier 1): ${dist.tier_1_adjacent_pct}%`)
  lines.push(`- Non-ICP (Tier 0): ${dist.tier_0_non_icp_pct}%`)
  lines.push(`- Trend: ${brief.icp_insights.icp_trend}`)
  lines.push('')

  // Tactical rules
  lines.push('## Tactical Rules')
  if (brief.tactical_rules.length > 0) {
    for (const r of brief.tactical_rules) {
      lines.push(`- ${r}`)
    }
  } else {
    lines.push('- Insufficient data for tactical recommendations.')
  }
  lines.push('')

  return lines.join('\n')
}

// --- Public: generate brief and write markdown file ---

export async function generateAndStoreBrief(): Promise<PerformanceBrief> {
  const brief = await generatePerformanceBrief()
  const markdown = briefToMarkdown(brief)

  // Write markdown file for skill access (server-side only, dynamic import for serverless safety)
  try {
    const fs = await import('fs')
    const path = await import('path')
    const briefPath = path.join(process.cwd(), 'content', 'linkedin-performance-brief.md')
    fs.writeFileSync(briefPath, markdown, 'utf-8')
  } catch {
    // File write may fail in edge/serverless — brief JSON still returned
    console.warn('[Performance Brief] Could not write markdown file')
  }

  return brief
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit lib/performance-brief.ts
```

Note: This may show import errors due to path aliases — that's fine, the actual build will resolve them. The key check is no syntax or type errors in the file itself.

- [ ] **Step 3: Commit**

```bash
git add lib/performance-brief.ts
git commit -m "Add performance brief generator with ICP scoring"
```

---

## Chunk 2: API + Wiring

### Task 5: Brief API Endpoint

**Files:**
- Create: `app/api/content/brief/route.ts`

- [ ] **Step 1: Create the API route**

Create `app/api/content/brief/route.ts`:

```typescript
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
```

- [ ] **Step 2: Verify with dev server**

```bash
npm run dev
```

Then in another terminal:
```bash
curl http://localhost:3000/api/content/brief
```

Expected: JSON response with `{ brief: { generated_at: "...", confidence: "...", ... } }`

- [ ] **Step 3: Commit**

```bash
git add app/api/content/brief/route.ts
git commit -m "Add brief API endpoint (GET/POST)"
```

---

### Task 6: Wire Auto-Regeneration into Existing Routes

**Files:**
- Modify: `app/api/content/metrics/route.ts`
- Modify: `app/api/content/engagers/route.ts`

- [ ] **Step 1: Add brief regeneration to metrics POST handler**

In `app/api/content/metrics/route.ts`, add import at top:

```typescript
import { generateAndStoreBrief } from '@/lib/performance-brief'
```

In the POST handler's success path, find `return NextResponse.json({ imported: data?.length || 0 })` (the one inside the `try` block after the successful Supabase insert, NOT the error-case returns). Replace that single return statement with:

```typescript
    // Regenerate performance brief after import
    try {
      await generateAndStoreBrief()
    } catch (briefErr) {
      console.error('[Content Metrics API] Brief regeneration error:', briefErr)
    }

    return NextResponse.json({ imported: data?.length || 0 })
```

- [ ] **Step 2: Add brief regeneration to engagers POST handler**

In `app/api/content/engagers/route.ts`, add import at top:

```typescript
import { generateAndStoreBrief } from '@/lib/performance-brief'
```

After the Slack notification block (before the final `return NextResponse.json({ inserted: data?.length || 0 })`), add:

```typescript
    // Regenerate performance brief after engager insertion
    try {
      await generateAndStoreBrief()
    } catch (briefErr) {
      console.error('[Content Engagers API] Brief regeneration error:', briefErr)
    }
```

- [ ] **Step 3: Verify build compiles**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add app/api/content/metrics/route.ts app/api/content/engagers/route.ts
git commit -m "Wire brief auto-regeneration into metrics and engagers routes"
```

---

### Task 7: Update Skills

**Files:**
- Modify: `.claude/skills/linkedin-content-creator/SKILL.md`
- Modify: `.claude/skills/linkedin-performance/SKILL.md`

- [ ] **Step 1: Add Step 1.5 to linkedin-content-creator SKILL.md**

After `### Step 1: Understand the Input` and before `### Step 2: Extract Takeaways`, insert:

```markdown
### Step 1.5: Read Performance Brief

Before generating content, read the performance brief at `content/linkedin-performance-brief.md`.

Use it to:
- **Bias hook selection** toward styles with higher ICP scores
- **Prefer topics/formats** that attract Tier 1-2 engagers
- **Avoid patterns** listed in the "What to Avoid" section
- **Calibrate length** based on what's worked (if the brief says short posts outperform, keep it tight)

The brief is guidance, not a straitjacket. If the input material calls for a format that hasn't performed well yet, write it anyway — but note the deviation. New formats need testing.

If the brief doesn't exist yet or has low confidence, proceed normally and note that performance data is limited.
```

- [ ] **Step 2: Update linkedin-performance SKILL.md**

In the `### 2. Analyze` section, after "Write analysis to `content/linkedin-performance-analysis.md`", add:

```markdown
5. Also regenerate the performance brief at `content/linkedin-performance-brief.md` by calling the brief API (`POST /api/content/brief`) or, if running outside the app context, by reading engager data from Supabase directly. The brief uses ICP-weighted scoring from the `post_engagers` table — see `lib/performance-brief.ts` for the generator.
```

In the `### 3. Recommend` section, update the process to reference ICP scoring:

```markdown
2. Identify top-performing patterns **weighted by ICP score, not just raw engagement**. A post with high impressions but low ICP score (many non-buyer engagers) should rank lower than a post with moderate reach but high Tier 1-2 engagement.
3. Read the performance brief at `content/linkedin-performance-brief.md` for pre-computed ICP patterns, tier distribution, and tactical rules.
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/linkedin-content-creator/SKILL.md .claude/skills/linkedin-performance/SKILL.md
git commit -m "Update skills to read performance brief with ICP scoring"
```

---

## Chunk 3: Frontend

### Task 8: Performance Insights Panel Component

**Files:**
- Create: `components/content/performance-insights-panel.tsx`

- [ ] **Step 1: Create the component**

Create `components/content/performance-insights-panel.tsx`:

```tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { PerformanceBrief } from '@/lib/performance-brief'

const TREND_ICONS = {
  improving: TrendingUp,
  declining: TrendingDown,
  stable: Minus,
  insufficient_data: Minus,
}

const TREND_LABELS = {
  improving: 'improving',
  declining: 'declining',
  stable: 'stable',
  insufficient_data: 'insufficient data',
}

export function PerformanceInsightsPanel() {
  const [brief, setBrief] = useState<PerformanceBrief | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBrief = useCallback(async () => {
    try {
      const res = await fetch('/api/content/brief')
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setBrief(data.brief)
        setError(null)
      }
    } catch {
      setError('Failed to load brief')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBrief() }, [fetchBrief])

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const res = await fetch('/api/content/brief', { method: 'POST' })
      const data = await res.json()
      if (data.brief) {
        setBrief(data.brief)
        setError(null)
      }
    } catch {
      setError('Failed to refresh brief')
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button size="sm" variant="ghost" onClick={() => { setLoading(true); fetchBrief() }} className="mt-2">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!brief || brief.sample_size.total_engagers === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No engager data yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Scrape post engagers from the Performance tab to start tracking ICP engagement quality.</p>
        </CardContent>
      </Card>
    )
  }

  const TrendIcon = TREND_ICONS[brief.icp_insights.icp_trend]
  const t12pct = brief.icp_insights.overall_tier_distribution.tier_3_buyer_pct +
    brief.icp_insights.overall_tier_distribution.tier_2_influencer_pct

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Performance Insights</CardTitle>
        <Button size="sm" variant="ghost" onClick={handleRefresh} disabled={refreshing} className="h-7 w-7 p-0">
          {refreshing
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <RefreshCw className="h-3.5 w-3.5" />}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* ICP Quality headline */}
        <div className="flex items-center justify-between">
          <span className="text-sm">ICP Quality: <span className="font-semibold">{t12pct.toFixed(0)}%</span> Buyer + Influencer</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendIcon className="h-3 w-3" />
            {TREND_LABELS[brief.icp_insights.icp_trend]}
          </span>
        </div>

        {/* Top hook patterns */}
        {brief.patterns.best_hooks_for_icp.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Top patterns for ICP:</p>
            <ul className="space-y-0.5">
              {brief.patterns.best_hooks_for_icp.slice(0, 3).map((h) => (
                <li key={h.style} className="text-xs text-foreground">
                  {h.style} (ICP: {h.avg_icp_score ?? 'n/a'}, n={h.sample_size})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Avoid */}
        {brief.avoid.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Avoid:</p>
            <ul className="space-y-0.5">
              {brief.avoid.slice(0, 3).map((a, i) => (
                <li key={i} className="text-xs text-foreground">{a}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Confidence */}
        <p className="text-[10px] text-muted-foreground">
          Based on {brief.sample_size.total_posts} posts, {brief.sample_size.posts_with_engager_data} with engager data. Confidence: {brief.confidence}.
        </p>

        {/* Expand toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="w-full text-xs h-7"
        >
          {expanded ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
          {expanded ? 'Show less' : 'View full brief'}
        </Button>

        {/* Expanded view */}
        {expanded && (
          <div className="space-y-4 pt-2 border-t">
            {/* Tier distribution */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Tier Distribution</p>
              <div className="flex h-4 rounded overflow-hidden">
                {brief.icp_insights.overall_tier_distribution.tier_3_buyer_pct > 0 && (
                  <div
                    className="bg-emerald-500"
                    style={{ width: `${brief.icp_insights.overall_tier_distribution.tier_3_buyer_pct}%` }}
                    title={`Buyers: ${brief.icp_insights.overall_tier_distribution.tier_3_buyer_pct}%`}
                  />
                )}
                {brief.icp_insights.overall_tier_distribution.tier_2_influencer_pct > 0 && (
                  <div
                    className="bg-blue-500"
                    style={{ width: `${brief.icp_insights.overall_tier_distribution.tier_2_influencer_pct}%` }}
                    title={`Influencers: ${brief.icp_insights.overall_tier_distribution.tier_2_influencer_pct}%`}
                  />
                )}
                {brief.icp_insights.overall_tier_distribution.tier_1_adjacent_pct > 0 && (
                  <div
                    className="bg-yellow-500"
                    style={{ width: `${brief.icp_insights.overall_tier_distribution.tier_1_adjacent_pct}%` }}
                    title={`Adjacent: ${brief.icp_insights.overall_tier_distribution.tier_1_adjacent_pct}%`}
                  />
                )}
                {brief.icp_insights.overall_tier_distribution.tier_0_non_icp_pct > 0 && (
                  <div
                    className="bg-gray-300"
                    style={{ width: `${brief.icp_insights.overall_tier_distribution.tier_0_non_icp_pct}%` }}
                    title={`Non-ICP: ${brief.icp_insights.overall_tier_distribution.tier_0_non_icp_pct}%`}
                  />
                )}
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Buyers {brief.icp_insights.overall_tier_distribution.tier_3_buyer_pct}%</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Influencers {brief.icp_insights.overall_tier_distribution.tier_2_influencer_pct}%</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> Adjacent {brief.icp_insights.overall_tier_distribution.tier_1_adjacent_pct}%</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block" /> Non-ICP {brief.icp_insights.overall_tier_distribution.tier_0_non_icp_pct}%</span>
              </div>
            </div>

            {/* Top posts by ICP */}
            {brief.icp_insights.top_posts_by_icp_score.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Top Posts by ICP Score</p>
                <div className="space-y-2">
                  {brief.icp_insights.top_posts_by_icp_score.map((p, i) => (
                    <div key={i} className="text-xs border rounded p-2">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">ICP: {p.icp_score}</span>
                        <span className="text-muted-foreground">{p.impressions.toLocaleString()} impressions</span>
                      </div>
                      <p className="text-muted-foreground truncate">"{p.hook}"</p>
                      <div className="flex gap-2 mt-1 text-[10px] text-muted-foreground">
                        <span>Buyers: {p.tier_breakdown.tier_3}</span>
                        <span>Influencers: {p.tier_breakdown.tier_2}</span>
                        <span>Adjacent: {p.tier_breakdown.tier_1}</span>
                        <span>Non-ICP: {p.tier_breakdown.tier_0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divergence */}
            {brief.patterns.reach_vs_icp_divergence.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Reach vs ICP Divergence</p>
                <ul className="space-y-1">
                  {brief.patterns.reach_vs_icp_divergence.map((d, i) => (
                    <li key={i} className="text-xs text-foreground">{d}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tactical rules */}
            {brief.tactical_rules.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Tactical Rules</p>
                <ul className="space-y-0.5">
                  {brief.tactical_rules.map((r, i) => (
                    <li key={i} className="text-xs text-foreground">{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/content/performance-insights-panel.tsx
git commit -m "Add performance insights panel component"
```

---

### Task 9: Add Sidebar to Ideas Page

**Files:**
- Modify: `app/content/page.tsx`

The Ideas page already exists. We need to add the `PerformanceInsightsPanel` as a sidebar.

- [ ] **Step 1: Modify app/content/page.tsx layout**

Add import at top of the file (after the existing imports):

```typescript
import { PerformanceInsightsPanel } from '@/components/content/performance-insights-panel'
```

The current return statement begins at line 96 with `return (` and the outermost element is `<div className="space-y-4">`. Make these changes:

**Change 1:** Replace `<div className="space-y-4">` (the outermost div in the return, line 97) with:

```tsx
<div className="flex gap-6">
  <div className="flex-1 min-w-0 space-y-4">
```

**Change 2:** Replace the closing `</div>` that matches the outermost div (the very last `</div>` before the closing `)` of the return, line 210) with:

```tsx
  </div>
  {/* Sidebar — performance insights */}
  <div className="hidden lg:block w-80 flex-shrink-0">
    <div className="sticky top-4">
      <PerformanceInsightsPanel />
    </div>
  </div>
</div>
```

This wraps the existing content in a flex child and adds the sidebar as a second flex child. All existing JSX between the opening and closing divs stays untouched. The sidebar is hidden on mobile (`hidden lg:block`) and sticky on desktop.

- [ ] **Step 2: Verify in browser**

```bash
npm run dev
```

Navigate to `http://localhost:3000/content`. The ideas page should show with a performance insights panel on the right side on desktop viewports.

- [ ] **Step 3: Commit**

```bash
git add app/content/page.tsx
git commit -m "Add performance insights sidebar to ideas page"
```

---

### Task 10: Add Refresh Brief Button to Performance Page

**Files:**
- Modify: `app/content/performance/page.tsx`

- [ ] **Step 1: Add a Refresh Brief button to the performance page**

In `app/content/performance/page.tsx`, add state and handler. After the existing `scrapeResult` state declaration, add:

```typescript
const [briefRefreshing, setBriefRefreshing] = useState(false)
const [briefResult, setBriefResult] = useState<string | null>(null)

async function handleRefreshBrief() {
  setBriefRefreshing(true)
  setBriefResult(null)
  try {
    const res = await fetch('/api/content/brief', { method: 'POST' })
    const data = await res.json()
    if (data.error) {
      setBriefResult(`Error: ${data.error}`)
    } else {
      setBriefResult(`Brief regenerated (${data.brief?.sample_size?.total_posts || 0} posts, ${data.brief?.sample_size?.posts_with_engager_data || 0} with engagers)`)
    }
  } catch {
    setBriefResult('Failed to regenerate brief')
  } finally {
    setBriefRefreshing(false)
  }
}
```

Add import for `RefreshCw`:
```typescript
import { Loader2, Upload, TrendingUp, Eye, MousePointer, Search, RefreshCw } from 'lucide-react'
```

In the import/filter row (the `<div className="flex items-center justify-between">` near the top), add the Refresh Brief button next to the Import CSV button:

```tsx
<Button size="sm" variant="outline" disabled={briefRefreshing} onClick={handleRefreshBrief}>
  {briefRefreshing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
  Refresh Brief
</Button>
{briefResult && <span className="text-xs text-muted-foreground">{briefResult}</span>}
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:3000/content/performance`. Click "Refresh Brief" button. Should show confirmation message.

- [ ] **Step 3: Commit**

```bash
git add app/content/performance/page.tsx
git commit -m "Add Refresh Brief button to performance page"
```

---

### Task 11: Run All Tests + Final Build Verification

- [ ] **Step 1: Run all unit tests**

```bash
npx vitest run
```

Expected: All tests pass (icp-tiers + hook-classifier)

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: If build fails, fix in the relevant task's file and commit with a specific message describing the fix. Do not use a catch-all commit.**
