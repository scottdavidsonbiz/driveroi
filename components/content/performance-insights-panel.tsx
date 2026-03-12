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
