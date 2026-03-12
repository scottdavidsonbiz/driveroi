'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Upload, TrendingUp, Eye, MousePointer, Search, RefreshCw } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import * as XLSX from 'xlsx'
import type { LinkedInMetric } from '@/lib/supabase'

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<LinkedInMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<string | null>(null)
  const [filterAuthor, setFilterAuthor] = useState<string>('all')
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set())
  const [scraping, setScraping] = useState(false)
  const [scrapeResult, setScrapeResult] = useState<string | null>(null)
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

  const fetchMetrics = useCallback(async () => {
    const res = await fetch('/api/content/metrics')
    const data = await res.json()
    setMetrics(data.metrics || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchMetrics() }, [fetchMetrics])

  function parseLinkedInXlsx(buffer: ArrayBuffer): Record<string, string>[] {
    const wb = XLSX.read(buffer, { type: 'array' })

    // Parse TOP POSTS sheet — two side-by-side tables: engagements (cols 0-2) and impressions (cols 4-6)
    const topPosts = wb.Sheets['TOP POSTS']
    if (!topPosts) return []
    const rows: unknown[][] = XLSX.utils.sheet_to_json(topPosts, { header: 1 })

    // Find the header row (contains "Post URL")
    const headerIdx = rows.findIndex(r => r[0] === 'Post URL')
    if (headerIdx < 0) return []

    const postMap: Record<string, { date: string; engagements: string; impressions: string }> = {}

    for (let i = headerIdx + 1; i < rows.length; i++) {
      const r = rows[i]
      if (!r || !r[0]) continue
      // Left table: engagements
      const engUrl = String(r[0] || '')
      if (engUrl.includes('linkedin.com')) {
        if (!postMap[engUrl]) postMap[engUrl] = { date: '', engagements: '0', impressions: '0' }
        postMap[engUrl].date = String(r[1] || '')
        postMap[engUrl].engagements = String(r[2] || '0')
      }
      // Right table: impressions (cols 4-6)
      const impUrl = String(r[4] || '')
      if (impUrl.includes('linkedin.com')) {
        if (!postMap[impUrl]) postMap[impUrl] = { date: '', engagements: '0', impressions: '0' }
        if (!postMap[impUrl].date) postMap[impUrl].date = String(r[5] || '')
        postMap[impUrl].impressions = String(r[6] || '0')
      }
    }

    // Parse FOLLOWERS sheet for daily new followers
    const followersSheet = wb.Sheets['FOLLOWERS']
    const followerMap: Record<string, string> = {}
    if (followersSheet) {
      const fRows: unknown[][] = XLSX.utils.sheet_to_json(followersSheet, { header: 1 })
      for (const r of fRows) {
        if (r && r[0] && String(r[0]).includes('/')) {
          followerMap[String(r[0])] = String(r[1] || '0')
        }
      }
    }

    return Object.entries(postMap).map(([url, data]) => ({
      'Post URL': url,
      'Date': data.date,
      'Impressions': data.impressions,
      'Engagements': data.engagements,
      'Reactions': '0',
      'Comments': '0',
      'Reposts': '0',
      'Clicks': '0',
      'Engagement rate': '0',
      'New followers': followerMap[data.date] || '0',
    }))
  }

  function parseCsvText(text: string): Record<string, string>[] {
    const lines = text.split('\n').filter(l => l.trim())
    if (lines.length < 2) return []
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"/, '').replace(/"$/, ''))
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"/, '').replace(/"$/, ''))
      const record: Record<string, string> = {}
      headers.forEach((h, i) => { record[h] = values[i] || '' })
      return record
    })
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportResult(null)

    let records: Record<string, string>[]
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      const buffer = await file.arrayBuffer()
      records = parseLinkedInXlsx(buffer)
    } else {
      const text = await file.text()
      records = parseCsvText(text)
    }

    if (records.length === 0) {
      setImportResult('No post data found in file')
      setImporting(false)
      return
    }

    const author = prompt('Who is this data for? (scott or brenda)', 'scott')
    if (!author) { setImporting(false); return }

    const res = await fetch('/api/content/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records, author }),
    })

    const data = await res.json()
    if (data.error) {
      setImportResult(`Error: ${data.error}`)
    } else {
      setImportResult(`Imported ${data.imported} posts`)
      fetchMetrics()
    }
    setImporting(false)
  }

  function togglePost(id: string) {
    setSelectedPosts(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAllPosts() {
    const linkPosts = filtered.filter(m => m.post_text?.includes('linkedin.com'))
    if (selectedPosts.size === linkPosts.length) {
      setSelectedPosts(new Set())
    } else {
      setSelectedPosts(new Set(linkPosts.map(m => m.id)))
    }
  }

  async function handleScrapeSelected() {
    const posts = filtered.filter(m => selectedPosts.has(m.id) && m.post_text?.includes('linkedin.com'))
    if (posts.length === 0) return
    setScraping(true)
    setScrapeResult(null)
    let totalEngagers = 0
    let errors = 0
    for (const post of posts) {
      try {
        const res = await fetch('/api/content/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ post_url: post.post_text }),
        })
        const data = await res.json()
        if (data.error) errors++
        else totalEngagers += data.engagers_found || 0
      } catch {
        errors++
      }
    }
    setScrapeResult(`Found ${totalEngagers} engager${totalEngagers !== 1 ? 's' : ''}, pushed to Clay${errors ? ` (${errors} failed)` : ''}`)
    setSelectedPosts(new Set())
    setScraping(false)
  }

  const filtered = filterAuthor === 'all' ? metrics : metrics.filter(m => m.author === filterAuthor)
  const sorted = [...filtered].sort((a, b) =>
    new Date(a.published_at || 0).getTime() - new Date(b.published_at || 0).getTime()
  )

  // Summary stats
  const totalImpressions = filtered.reduce((s, m) => s + m.impressions, 0)
  const totalReactions = filtered.reduce((s, m) => s + m.reactions, 0)
  const avgEngagement = filtered.length > 0
    ? (filtered.reduce((s, m) => s + m.engagement_rate, 0) / filtered.length).toFixed(2)
    : '0'

  // Chart data
  const chartData = sorted.map(m => ({
    date: m.published_at ? new Date(m.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '?',
    impressions: m.impressions,
    engagement: m.engagement_rate,
    reactions: m.reactions,
    comments: m.comments,
  }))

  // Day-of-week data
  const dayMap: Record<string, { impressions: number; engagement: number; count: number }> = {}
  sorted.forEach(m => {
    if (!m.published_at) return
    const day = new Date(m.published_at).toLocaleDateString('en-US', { weekday: 'short' })
    if (!dayMap[day]) dayMap[day] = { impressions: 0, engagement: 0, count: 0 }
    dayMap[day].impressions += m.impressions
    dayMap[day].engagement += m.engagement_rate
    dayMap[day].count++
  })
  const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const dayData = dayOrder.filter(d => dayMap[d]).map(d => ({
    day: d,
    avgImpressions: Math.round(dayMap[d].impressions / dayMap[d].count),
    avgEngagement: parseFloat((dayMap[d].engagement / dayMap[d].count).toFixed(2)),
  }))

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="space-y-6">
      {/* Import + filter row */}
      <div className="flex items-center justify-between">
        <select
          value={filterAuthor}
          onChange={(e) => setFilterAuthor(e.target.value)}
          className="flex h-8 rounded-md border border-input bg-background px-2 text-xs"
        >
          <option value="all">All authors</option>
          <option value="scott">Scott</option>
          <option value="brenda">Brenda</option>
        </select>

        <div className="flex items-center gap-2">
          {briefResult && <span className="text-xs text-muted-foreground">{briefResult}</span>}
          <Button size="sm" variant="outline" disabled={briefRefreshing} onClick={handleRefreshBrief}>
            {briefRefreshing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
            Refresh Brief
          </Button>
          {importResult && <span className="text-xs text-muted-foreground">{importResult}</span>}
          <Button size="sm" variant="outline" disabled={importing} asChild>
            <label className="cursor-pointer">
              {importing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
              Import CSV
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
            </label>
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1"><Eye className="h-4 w-4" /><span className="text-xs font-medium uppercase">Impressions</span></div>
            <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1"><TrendingUp className="h-4 w-4" /><span className="text-xs font-medium uppercase">Avg Engagement</span></div>
            <div className="text-2xl font-bold">{avgEngagement}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1"><MousePointer className="h-4 w-4" /><span className="text-xs font-medium uppercase">Reactions</span></div>
            <div className="text-2xl font-bold">{totalReactions}</div>
          </CardContent>
        </Card>
      </div>

      {metrics.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-2">No performance data yet.</p>
            <p className="text-sm text-muted-foreground">Export your LinkedIn post analytics as CSV and import above.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Engagement over time */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Engagement Over Time</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="impressions" stroke="#8B7FD4" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Engagements */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Engagements by Post</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="reactions" fill="#8B7FD4" name="Engagements" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Day of week */}
          {dayData.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Average Impressions by Day</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={dayData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="avgImpressions" fill="#8B7FD4" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Posts table */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">All Posts</CardTitle>
              <div className="flex items-center gap-2">
                {scrapeResult && <span className="text-xs text-muted-foreground">{scrapeResult}</span>}
                {selectedPosts.size > 0 && (
                  <Button size="sm" variant="outline" disabled={scraping} onClick={handleScrapeSelected}>
                    {scraping ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Search className="h-4 w-4 mr-1" />}
                    Scrape {selectedPosts.size} Post{selectedPosts.size !== 1 ? 's' : ''}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-2 pr-2 font-medium w-8">
                        <input
                          type="checkbox"
                          checked={selectedPosts.size > 0 && selectedPosts.size === filtered.filter(m => m.post_text?.includes('linkedin.com')).length}
                          onChange={toggleAllPosts}
                          className="rounded"
                        />
                      </th>
                      <th className="py-2 pr-4 font-medium">Date</th>
                      <th className="py-2 pr-4 font-medium">Post</th>
                      <th className="py-2 pr-4 font-medium text-right">Impressions</th>
                      <th className="py-2 pr-4 font-medium text-right">Engagement</th>
                      <th className="py-2 font-medium text-right">Engagements</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...filtered].sort((a, b) => b.impressions - a.impressions).map(m => {
                      const isLinkedIn = m.post_text?.includes('linkedin.com')
                      return (
                        <tr key={m.id} className={`border-b last:border-0 ${selectedPosts.has(m.id) ? 'bg-muted/50' : ''}`}>
                          <td className="py-2 pr-2">
                            {isLinkedIn ? (
                              <input
                                type="checkbox"
                                checked={selectedPosts.has(m.id)}
                                onChange={() => togglePost(m.id)}
                                className="rounded"
                              />
                            ) : null}
                          </td>
                          <td className="py-2 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                            {m.published_at ? new Date(m.published_at).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-2 pr-4 max-w-[300px] truncate">
                            {isLinkedIn ? (
                              <a href={m.post_text!} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                {m.published_at ? new Date(m.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' post' : 'View post'}
                              </a>
                            ) : (
                              m.post_text?.slice(0, 80) || '—'
                            )}
                          </td>
                          <td className="py-2 pr-4 text-right">{m.impressions.toLocaleString()}</td>
                          <td className="py-2 pr-4 text-right">{m.engagement_rate}%</td>
                          <td className="py-2 text-right">{m.reactions}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
