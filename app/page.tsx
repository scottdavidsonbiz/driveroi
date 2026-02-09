'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, ArrowRight, Loader2 } from 'lucide-react'

interface DashboardStats {
  activeClients: number
  totalLeadsContacted: number
  totalEmailsSent: number
  totalReplies: number
  totalMeetings: number
  totalConnectionsSent: number
  totalConnectionsAccepted: number
  totalOpened: number
}

interface ClientSummary {
  id: string
  name: string
  industry: string | null
  status: string
  campaignCount: number
  totalSent: number
  totalReplies: number
  meetings: number
}

interface DashboardData {
  stats: DashboardStats
  clients: ClientSummary[]
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/dashboard')
        const json = await res.json()
        if (json.error) {
          setError(json.error)
        } else {
          setData(json)
        }
      } catch (err) {
        setError('Failed to load dashboard')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="page-enter">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 stagger-children">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="card-hover">
              <CardContent className="pt-5">
                <div className="h-4 w-24 bg-muted rounded animate-pulse mb-2" />
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-enter">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = data!.stats
  const clients = data!.clients

  const openRate = stats.totalEmailsSent > 0
    ? ((stats.totalOpened / stats.totalEmailsSent) * 100).toFixed(0)
    : '0'
  const replyRate = stats.totalEmailsSent > 0
    ? ((stats.totalReplies / stats.totalEmailsSent) * 100).toFixed(1)
    : '0'

  return (
    <div className="page-enter">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 stagger-children">
        <StatCard label="Active Clients" value={String(stats.activeClients)} />
        <StatCard label="Leads Contacted" value={stats.totalLeadsContacted.toLocaleString()} />
        <StatCard label="Emails Sent" value={stats.totalEmailsSent.toLocaleString()} />
        <StatCard label="Meetings Booked" value={String(stats.totalMeetings)} />
      </div>

      {/* Clients Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-tight">Clients</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/clients">
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {clients.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No active clients yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
            {clients.map(client => (
              <ClientCard
                key={client.id}
                name={client.name}
                industry={client.industry || 'No industry set'}
                campaigns={client.campaignCount}
                meetings={client.meetings}
                href={`/clients/${client.id}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions + This Week */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start" asChild>
              <Link href="/clients/new">
                <Plus className="mr-2 h-4 w-4" />
                Add New Client
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" asChild>
              <Link href="/sops">
                View SOPs
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Totals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Emails sent</span>
                <span className="font-medium">{stats.totalEmailsSent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Open rate</span>
                <span className="font-medium">{openRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reply rate</span>
                <span className="font-medium">{replyRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Meetings booked</span>
                <span className="font-medium text-primary">{stats.totalMeetings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">LinkedIn connections sent</span>
                <span className="font-medium">{stats.totalConnectionsSent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">LinkedIn accepted</span>
                <span className="font-medium">{stats.totalConnectionsAccepted.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  change
}: {
  label: string
  value: string
  change?: string
}) {
  return (
    <Card className="card-hover">
      <CardContent className="pt-5">
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {change && (
          <p className="text-xs text-muted-foreground mt-1">{change}</p>
        )}
      </CardContent>
    </Card>
  )
}

function ClientCard({
  name,
  industry,
  campaigns,
  meetings,
  href
}: {
  name: string
  industry: string
  campaigns: number
  meetings: number
  href: string
}) {
  return (
    <Link href={href}>
      <Card className="card-hover cursor-pointer h-full">
        <CardContent className="pt-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg">{name}</h3>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              client
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{industry}</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span><strong className="text-foreground">{campaigns}</strong> campaigns</span>
            <span><strong className="text-foreground">{meetings}</strong> meetings</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
