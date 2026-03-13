'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, ExternalLink, Mail, ThumbsUp, ThumbsDown, Filter } from 'lucide-react'
import type { PostEngager } from '@/lib/supabase'

const TIER_LABELS: Record<number, string> = {
  3: 'Buyer',
  2: 'Influencer',
  1: 'Adjacent',
  0: 'Non-ICP',
}

const TIER_COLORS: Record<number, string> = {
  3: 'bg-emerald-100 text-emerald-700',
  2: 'bg-blue-100 text-blue-700',
  1: 'bg-yellow-100 text-yellow-700',
  0: 'bg-gray-100 text-gray-500',
}

type TierFilter = 'icp' | 'all' | 'qualified' | 'disqualified'

export default function EngagersPage() {
  const [engagers, setEngagers] = useState<PostEngager[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<TierFilter>('icp')
  const [qualStatus, setQualStatus] = useState<Record<string, 'qualified' | 'disqualified'>>({})
  const [saving, setSaving] = useState<string | null>(null)

  const fetchEngagers = useCallback(async () => {
    const res = await fetch('/api/content/engagers')
    const data = await res.json()
    const list: PostEngager[] = data.engagers || []
    setEngagers(list)

    const statusMap: Record<string, 'qualified' | 'disqualified'> = {}
    for (const eng of list) {
      if (eng.icp_status === 'qualified' || eng.icp_status === 'disqualified') {
        statusMap[eng.id] = eng.icp_status
      }
    }
    setQualStatus(statusMap)
    setLoading(false)
  }, [])

  useEffect(() => { fetchEngagers() }, [fetchEngagers])

  async function handleQualify(id: string, status: 'qualified' | 'disqualified') {
    setSaving(id)
    const newStatus = qualStatus[id] === status ? undefined : status

    try {
      await fetch(`/api/content/engagers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icp_status: newStatus || null }),
      })

      setQualStatus(prev => {
        const next = { ...prev }
        if (newStatus) {
          next[id] = newStatus
        } else {
          delete next[id]
        }
        return next
      })
    } catch (err) {
      console.error('Failed to update qualification:', err)
    } finally {
      setSaving(null)
    }
  }

  const filtered = engagers.filter(eng => {
    if (filter === 'icp') return (eng.icp_tier ?? 0) >= 1
    if (filter === 'qualified') return qualStatus[eng.id] === 'qualified'
    if (filter === 'disqualified') return qualStatus[eng.id] === 'disqualified'
    return true // 'all'
  })

  // Sort: highest tier first, then by name
  const sorted = [...filtered].sort((a, b) => {
    const tierDiff = (b.icp_tier ?? 0) - (a.icp_tier ?? 0)
    if (tierDiff !== 0) return tierDiff
    return (a.name || '').localeCompare(b.name || '')
  })

  const counts = {
    icp: engagers.filter(e => (e.icp_tier ?? 0) >= 1).length,
    all: engagers.length,
    qualified: engagers.filter(e => qualStatus[e.id] === 'qualified').length,
    disqualified: engagers.filter(e => qualStatus[e.id] === 'disqualified').length,
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  if (engagers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-2">No engagers yet.</p>
          <p className="text-sm text-muted-foreground">
            Go to the Performance tab, select posts, and click "Scrape" to capture engagers from your LinkedIn posts.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {([
          { key: 'icp' as TierFilter, label: 'Tier 1+' },
          { key: 'all' as TierFilter, label: 'All' },
          { key: 'qualified' as TierFilter, label: 'Qualified' },
          { key: 'disqualified' as TierFilter, label: 'Disqualified' },
        ]).map(f => (
          <Button
            key={f.key}
            size="sm"
            variant={filter === f.key ? 'default' : 'outline'}
            onClick={() => setFilter(f.key)}
            className="text-xs h-7"
          >
            {f.label}
            <span className="ml-1 text-[10px] opacity-70">({counts[f.key]})</span>
          </Button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">{sorted.length} engager{sorted.length !== 1 ? 's' : ''}</p>

      {sorted.map(eng => {
        const status = qualStatus[eng.id]
        const isSaving = saving === eng.id
        const tier = eng.icp_tier ?? 0

        return (
          <Card
            key={eng.id}
            className={`card-hover ${status === 'disqualified' ? 'opacity-50' : ''}`}
          >
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {eng.linkedin_url ? (
                      <a
                        href={eng.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-sm hover:underline text-blue-600 dark:text-blue-400"
                      >
                        {eng.name || 'Unknown'}
                      </a>
                    ) : (
                      <span className="font-medium text-sm">{eng.name || 'Unknown'}</span>
                    )}
                    <Badge className={`text-[10px] ${TIER_COLORS[tier] || TIER_COLORS[0]}`}>
                      {TIER_LABELS[tier] || 'Non-ICP'}
                    </Badge>
                    {eng.company && <Badge variant="outline" className="text-xs">{eng.company}</Badge>}
                    {status === 'qualified' && <Badge className="bg-emerald-500 text-white text-[10px]">ICP ✓</Badge>}
                    {status === 'disqualified' && <Badge className="bg-red-500 text-white text-[10px]">Not ICP</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {eng.title || 'No title'}
                    {eng.domain && ` · ${eng.domain}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`h-7 w-7 p-0 ${status === 'qualified' ? 'text-emerald-600' : 'text-muted-foreground'}`}
                    onClick={() => handleQualify(eng.id, 'qualified')}
                    disabled={isSaving}
                    title="Mark as ICP qualified"
                  >
                    {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ThumbsUp className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`h-7 w-7 p-0 ${status === 'disqualified' ? 'text-red-600' : 'text-muted-foreground'}`}
                    onClick={() => handleQualify(eng.id, 'disqualified')}
                    disabled={isSaving}
                    title="Mark as not ICP"
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </Button>

                  {eng.email && (
                    <a href={`mailto:${eng.email}`} className="text-muted-foreground hover:text-foreground p-1" title={eng.email}>
                      <Mail className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {eng.linkedin_url && (
                    <a href={eng.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground p-1">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {sorted.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">No engagers match this filter.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
