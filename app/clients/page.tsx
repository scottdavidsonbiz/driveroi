import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const clients = [
  {
    id: 'ivs',
    name: 'IVS',
    fullName: 'Industrial Valuation Services',
    industry: 'Property Tax Assessment',
    status: 'active' as const,
    campaigns: 3,
    meetings: 12,
    leadsEnriched: 847,
  },
  {
    id: 'charterup',
    name: 'CharterUP',
    fullName: 'CharterUP',
    industry: 'Charter Bus Marketplace',
    status: 'setup' as const,
    campaigns: 1,
    meetings: 0,
    leadsEnriched: 312,
  },
  {
    id: 'withcoverage',
    name: 'WithCoverage',
    fullName: 'WithCoverage',
    industry: 'Commercial Insurance',
    status: 'new' as const,
    campaigns: 0,
    meetings: 0,
    leadsEnriched: 60,
  },
]

export default function ClientsPage() {
  return (
    <div className="page-enter">
      <div className="grid gap-4">
        {clients.map((client, index) => (
          <Link key={client.id} href={`/clients/${client.id}`}>
            <Card
              className="card-hover cursor-pointer"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg gradient-accent flex items-center justify-center text-white font-bold">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{client.fullName}</h3>
                        <StatusBadge status={client.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">{client.industry}</p>
                    </div>
                  </div>

                  <div className="flex gap-8 text-sm">
                    <div className="text-center">
                      <p className="font-semibold">{client.campaigns}</p>
                      <p className="text-muted-foreground">campaigns</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{client.leadsEnriched}</p>
                      <p className="text-muted-foreground">leads</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{client.meetings}</p>
                      <p className="text-muted-foreground">meetings</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: 'active' | 'setup' | 'new' }) {
  const styles = {
    active: 'bg-green-100 text-green-700',
    setup: 'bg-yellow-100 text-yellow-700',
    new: 'bg-blue-100 text-blue-700',
  }

  return (
    <Badge variant="secondary" className={styles[status]}>
      {status}
    </Badge>
  )
}
