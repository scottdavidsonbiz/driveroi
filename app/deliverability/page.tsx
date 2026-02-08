'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react'

interface AccountDetail {
  email: string
  domain: string
  warmup_status: string
  sent: number
  bounced: number
  bounce_rate: number
  warmup_health_score: number | null
  warmup_sent: number
  warmup_inbox: number
}

interface DomainSummary {
  domain: string
  account_count: number
  total_sent: number
  total_bounced: number
  bounce_rate: number
  avg_warmup_health: number | null
  accounts: AccountDetail[]
}

interface DeliverabilityData {
  domains: DomainSummary[]
  date_range: { start_date: string; end_date: string }
  total_accounts: number
  total_domains: number
}

function bounceColor(rate: number): string {
  if (rate < 0.02) return 'text-green-600'
  if (rate < 0.05) return 'text-yellow-600'
  return 'text-red-600'
}

function bounceBadge(rate: number) {
  if (rate < 0.02) return <Badge variant="secondary" className="bg-green-100 text-green-800 border-0">Good</Badge>
  if (rate < 0.05) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-0">Warning</Badge>
  return <Badge variant="secondary" className="bg-red-100 text-red-800 border-0">High</Badge>
}

function healthColor(score: number | null): string {
  if (score === null) return 'text-muted-foreground'
  if (score >= 90) return 'text-green-600'
  if (score >= 70) return 'text-yellow-600'
  return 'text-red-600'
}

function healthBadge(score: number | null) {
  if (score === null) return <Badge variant="outline">N/A</Badge>
  if (score >= 90) return <Badge variant="secondary" className="bg-green-100 text-green-800 border-0">{score}%</Badge>
  if (score >= 70) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-0">{score}%</Badge>
  return <Badge variant="secondary" className="bg-red-100 text-red-800 border-0">{score}%</Badge>
}

function warmupStatusBadge(status: string) {
  const s = String(status ?? '').toLowerCase()
  if (s === 'active' || s === 'enabled') return <Badge variant="secondary" className="bg-green-100 text-green-800 border-0 text-xs">{status}</Badge>
  if (s === 'paused') return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-0 text-xs">{status}</Badge>
  return <Badge variant="outline" className="text-xs">{status}</Badge>
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

export default function DeliverabilityPage() {
  const [data, setData] = useState<DeliverabilityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set())

  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [startDate, setStartDate] = useState(formatDate(thirtyDaysAgo))
  const [endDate, setEndDate] = useState(formatDate(now))

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ start_date: startDate, end_date: endDate })
      const res = await fetch(`/api/deliverability?${params}`)
      const json = await res.json()
      if (json.error) {
        setError(json.error)
      } else {
        setData(json)
      }
    } catch {
      setError('Failed to fetch deliverability data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleDomain = (domain: string) => {
    setExpandedDomains((prev) => {
      const next = new Set(prev)
      if (next.has(domain)) next.delete(domain)
      else next.add(domain)
      return next
    })
  }

  const overallBounceRate = data
    ? data.domains.reduce((s, d) => s + d.total_bounced, 0) /
      Math.max(data.domains.reduce((s, d) => s + d.total_sent, 0), 1)
    : 0

  const overallHealth = data
    ? (() => {
        const scores = data.domains
          .map((d) => d.avg_warmup_health)
          .filter((h): h is number => h !== null)
        return scores.length > 0
          ? Math.round(scores.reduce((s, h) => s + h, 0) / scores.length)
          : null
      })()
    : null

  if (loading && !data) {
    return (
      <div className="page-enter flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="page-enter">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchData} variant="outline" className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="page-enter space-y-4">
      {/* Date range + Refresh */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">From</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">To</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
          />
        </div>
        <Button onClick={fetchData} variant="outline" size="sm" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-1.5">Refresh</span>
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Domains</p>
            <p className="text-2xl font-bold">{data?.total_domains ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Accounts</p>
            <p className="text-2xl font-bold">{data?.total_accounts ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Overall Bounce Rate</p>
            <p className={`text-2xl font-bold ${bounceColor(overallBounceRate)}`}>
              {(overallBounceRate * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Avg Warmup Health</p>
            <p className={`text-2xl font-bold ${healthColor(overallHealth)}`}>
              {overallHealth !== null ? `${overallHealth}%` : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Domain cards */}
      {data?.domains.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No sending accounts found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data?.domains.map((domain) => {
            const isExpanded = expandedDomains.has(domain.domain)
            return (
              <Card key={domain.domain}>
                <CardContent className="p-0">
                  {/* Domain header row */}
                  <button
                    onClick={() => toggleDomain(domain.domain)}
                    className="flex items-center justify-between w-full p-4 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-semibold">{domain.domain}</span>
                      <Badge variant="outline" className="text-xs">
                        {domain.account_count} account{domain.account_count !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground mr-1">Sent:</span>
                        <span className="font-medium">{domain.total_sent.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground mr-1">Bounced:</span>
                        <span className={`font-medium ${bounceColor(domain.bounce_rate)}`}>
                          {domain.total_bounced.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">Bounce:</span>
                        {bounceBadge(domain.bounce_rate)}
                        <span className={`font-medium ${bounceColor(domain.bounce_rate)}`}>
                          {(domain.bounce_rate * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">Health:</span>
                        {healthBadge(domain.avg_warmup_health)}
                      </div>
                    </div>
                  </button>

                  {/* Expanded account table */}
                  {isExpanded && (
                    <div className="border-t">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="text-left p-3 text-xs font-medium text-muted-foreground">Email</th>
                              <th className="text-left p-3 text-xs font-medium text-muted-foreground">Warmup</th>
                              <th className="text-right p-3 text-xs font-medium text-muted-foreground">Sent</th>
                              <th className="text-right p-3 text-xs font-medium text-muted-foreground">Bounced</th>
                              <th className="text-right p-3 text-xs font-medium text-muted-foreground">Bounce Rate</th>
                              <th className="text-right p-3 text-xs font-medium text-muted-foreground">Health</th>
                              <th className="text-right p-3 text-xs font-medium text-muted-foreground">WU Sent</th>
                              <th className="text-right p-3 text-xs font-medium text-muted-foreground">WU Inbox</th>
                            </tr>
                          </thead>
                          <tbody>
                            {domain.accounts.map((account) => (
                              <tr key={account.email} className="border-t hover:bg-muted/30">
                                <td className="p-3 text-sm font-mono">{account.email}</td>
                                <td className="p-3">{warmupStatusBadge(account.warmup_status)}</td>
                                <td className="p-3 text-sm text-right">{account.sent.toLocaleString()}</td>
                                <td className="p-3 text-sm text-right">{account.bounced.toLocaleString()}</td>
                                <td className={`p-3 text-sm text-right font-medium ${bounceColor(account.bounce_rate)}`}>
                                  {(account.bounce_rate * 100).toFixed(1)}%
                                </td>
                                <td className="p-3 text-right">{healthBadge(account.warmup_health_score)}</td>
                                <td className="p-3 text-sm text-right">{account.warmup_sent.toLocaleString()}</td>
                                <td className="p-3 text-sm text-right">{account.warmup_inbox.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
