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

// --- Internal types ---

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

  // 3. Enrich each metric row
  const enrichedPosts: EnrichedPost[] = []

  for (const m of metrics) {
    let linkedPostId = m.post_id
    let resolvedText = m.post_text
    let linkedUrl: string | null = null

    // Attempt to link metric -> content_post via 3 strategies
    if (linkedPostId && contentPostById.has(linkedPostId)) {
      // Strategy 0: post_id already set
      const cp = contentPostById.get(linkedPostId)!
      resolvedText = cp.post_text || resolvedText
      linkedUrl = cp.linkedin_url
    } else if (m.post_text && isLinkedInUrl(m.post_text)) {
      // Strategy 1: post_text is a LinkedIn URL
      const cp = contentPostByUrl.get(m.post_text)
      if (cp) {
        linkedPostId = cp.id
        resolvedText = cp.post_text || m.post_text
        linkedUrl = m.post_text
      } else {
        linkedUrl = m.post_text
      }
    } else if (m.post_text && m.published_at) {
      // Strategy 2: fuzzy match by text + date
      const metricDate = new Date(m.published_at).getTime()
      const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000
      const metricTextLower = m.post_text.toLowerCase().slice(0, 100)
      for (const cp of contentPosts) {
        if (!cp.post_text || !cp.published_at) continue
        const cpDate = new Date(cp.published_at).getTime()
        if (Math.abs(metricDate - cpDate) > TWO_DAYS_MS) continue
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
  const bestHooks: HookPattern[] = Array.from(hookGroups.entries())
    .map(([style, g]) => ({
      style,
      avg_icp_score: g.icpScores.length > 0
        ? parseFloat((g.icpScores.reduce((s: number, v: number) => s + v, 0) / g.icpScores.length).toFixed(2))
        : null,
      avg_impressions: Math.round(g.impressions.reduce((s: number, v: number) => s + v, 0) / g.impressions.length),
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
  const bestDays: DayPattern[] = Array.from(dayGroups.entries())
    .map(([day, g]) => ({
      day,
      avg_icp_score: g.icpScores.length > 0
        ? parseFloat((g.icpScores.reduce((s: number, v: number) => s + v, 0) / g.icpScores.length).toFixed(2))
        : null,
      avg_impressions: Math.round(g.impressions.reduce((s: number, v: number) => s + v, 0) / g.impressions.length),
      sample_size: g.impressions.length,
    }))
    .sort((a, b) => (b.avg_icp_score || 0) - (a.avg_icp_score || 0))

  // Patterns: format — linkedin_metrics has no format column.
  // Returns empty until a format field is added to the metrics import.
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
  const reshares = enrichedPosts.filter(p =>
    p.post_text?.toLowerCase().includes('reshare') || p.engagement_rate === 0
  )
  if (reshares.length > 0) {
    avoid.push(`Reshares: ${reshares.length} post(s) with 0 engagement${caveat}`)
  }
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

  lines.push('## What to Avoid')
  if (brief.avoid.length > 0) {
    for (const a of brief.avoid) {
      lines.push(`- ${a}`)
    }
  } else {
    lines.push('- No clear underperformers identified yet.')
  }
  lines.push('')

  lines.push('## ICP Audience Quality')
  const dist = brief.icp_insights.overall_tier_distribution
  lines.push(`- Buyers (Tier 3): ${dist.tier_3_buyer_pct}%`)
  lines.push(`- Influencers (Tier 2): ${dist.tier_2_influencer_pct}%`)
  lines.push(`- Adjacent (Tier 1): ${dist.tier_1_adjacent_pct}%`)
  lines.push(`- Non-ICP (Tier 0): ${dist.tier_0_non_icp_pct}%`)
  lines.push(`- Trend: ${brief.icp_insights.icp_trend}`)
  lines.push('')

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

  // Write markdown file for skill access (dynamic import for serverless safety)
  try {
    const fs = await import('fs')
    const path = await import('path')
    const briefPath = path.join(process.cwd(), 'content', 'linkedin-performance-brief.md')
    fs.writeFileSync(briefPath, markdown, 'utf-8')
  } catch {
    console.warn('[Performance Brief] Could not write markdown file')
  }

  return brief
}
