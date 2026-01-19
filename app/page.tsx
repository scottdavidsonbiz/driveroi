import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, ArrowRight } from 'lucide-react'

export default function Dashboard() {
  return (
    <div className="page-enter">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 stagger-children">
        <StatCard label="Active Clients" value="3" change="+1 this month" />
        <StatCard label="Leads Enriched" value="1,247" change="+312 this week" />
        <StatCard label="Emails Sent" value="4,892" change="49% open rate" />
        <StatCard label="Meetings Booked" value="23" change="+6 this week" />
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
          <ClientCard
            name="IVS"
            industry="Property Tax Assessment"
            status="active"
            campaigns={3}
            meetings={12}
            href="/clients/ivs"
          />
          <ClientCard
            name="CharterUP"
            industry="Charter Bus Marketplace"
            status="setup"
            campaigns={1}
            meetings={0}
            href="/clients/charterup"
          />
          <ClientCard
            name="WithCoverage"
            industry="Commercial Insurance"
            status="new"
            campaigns={0}
            meetings={0}
            href="/clients/withcoverage"
          />
        </div>
      </div>

      {/* Quick Actions */}
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
            <CardTitle className="text-base">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Emails sent</span>
                <span className="font-medium">1,247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Open rate</span>
                <span className="font-medium">49%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reply rate</span>
                <span className="font-medium">4.1%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Meetings booked</span>
                <span className="font-medium text-primary">6</span>
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
  status,
  campaigns,
  meetings,
  href
}: {
  name: string
  industry: string
  status: 'active' | 'setup' | 'new'
  campaigns: number
  meetings: number
  href: string
}) {
  const statusColors = {
    active: 'bg-green-100 text-green-700',
    setup: 'bg-yellow-100 text-yellow-700',
    new: 'bg-blue-100 text-blue-700'
  }

  return (
    <Link href={href}>
      <Card className="card-hover cursor-pointer h-full">
        <CardContent className="pt-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg">{name}</h3>
            <Badge variant="secondary" className={statusColors[status]}>
              {status}
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
