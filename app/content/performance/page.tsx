'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Upload, TrendingUp, MessageSquare, Eye, MousePointer } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import type { LinkedInMetric } from '@/lib/supabase'

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<LinkedInMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<string | null>(null)
  const [filterAuthor, setFilterAuthor] = useState<string>('all')

  const fetchMetrics = useCallback(async () => {
    const res = await fetch('/api/content/metrics')
    const data = await res.json()
    setMetrics(data.metrics || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchMetrics() }, [fetchMetrics])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportResult(null)

    const text = await file.text()
    const lines = text.split('\n').filter(l => l.trim())
    if (lines.length < 2) {
      setImportResult('CSV has no data rows')
      setImporting(false)
      return
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"/, '').replace(/"$/, ''))
    const records = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"/, '').replace(/"$/, ''))
      const record: Record<string, string> = {}
      headers.forEach((h, i) => { record[h] = values[i] || '' })
      return record
    })

    // Prompt for author — simple approach
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

  const filtered = filterAuthor === 'all' ? metrics : metrics.filter(m => m.author === filterAuthor)
  const sorted = [...filtered].sort((a, b) =>
    new Date(a.published_at || 0).getTime() - new Date(b.published_at || 0).getTime()
  )

  // Summary stats
  const totalImpressions = filtered.reduce((s, m) => s + m.impressions, 0)
  const totalReactions = filtered.reduce((s, m) => s + m.reactions, 0)
  const totalComments = filtered.reduce((s, m) => s + m.comments, 0)
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
          {importResult && <span className="text-xs text-muted-foreground">{importResult}</span>}
          <Button size="sm" variant="outline" disabled={importing} asChild>
            <label className="cursor-pointer">
              {importing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
              Import CSV
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
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
            <div className="flex items-center gap-2 text-muted-foreground mb-1"><MessageSquare className="h-4 w-4" /><span className="text-xs font-medium uppercase">Comments</span></div>
            <div className="text-2xl font-bold">{totalComments}</div>
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

          {/* Reactions vs comments */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Reactions vs Comments</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="reactions" fill="#8B7FD4" />
                  <Bar dataKey="comments" fill="#6b5fb4" />
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
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">All Posts</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">Date</th>
                      <th className="py-2 pr-4 font-medium">Post</th>
                      <th className="py-2 pr-4 font-medium text-right">Impressions</th>
                      <th className="py-2 pr-4 font-medium text-right">Engagement</th>
                      <th className="py-2 pr-4 font-medium text-right">Reactions</th>
                      <th className="py-2 font-medium text-right">Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...filtered].sort((a, b) => b.impressions - a.impressions).map(m => (
                      <tr key={m.id} className="border-b last:border-0">
                        <td className="py-2 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                          {m.published_at ? new Date(m.published_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-2 pr-4 max-w-[300px] truncate">{m.post_text?.slice(0, 80) || '—'}</td>
                        <td className="py-2 pr-4 text-right">{m.impressions.toLocaleString()}</td>
                        <td className="py-2 pr-4 text-right">{m.engagement_rate}%</td>
                        <td className="py-2 pr-4 text-right">{m.reactions}</td>
                        <td className="py-2 text-right">{m.comments}</td>
                      </tr>
                    ))}
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
