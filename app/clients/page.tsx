'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'

type ClientStatus = 'client' | 'prospect' | 'internal' | 'churned'

interface ClientWithICP {
  id: string
  name: string
  website: string | null
  industry: string | null
  status: ClientStatus
  created_at: string
  client_icp: {
    buyer_persona: string | null
    positioning: string | null
  } | null
}

const STATUS_COLORS: Record<ClientStatus, string> = {
  client: 'bg-green-100 text-green-700',
  prospect: 'bg-yellow-100 text-yellow-700',
  internal: 'bg-gray-100 text-gray-700',
  churned: 'bg-red-100 text-red-700',
}

const FILTER_OPTIONS: { label: string; value: ClientStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Clients', value: 'client' },
  { label: 'Prospects', value: 'prospect' },
  { label: 'Internal', value: 'internal' },
]

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientWithICP[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<ClientStatus | 'all'>('all')

  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await fetch('/api/clients')
        const data = await response.json()

        if (data.error) {
          setError(data.error)
        } else {
          setClients(data.clients || [])
        }
      } catch (err) {
        setError('Failed to load clients')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  const filtered = filter === 'all'
    ? clients
    : clients.filter(c => c.status === filter)

  if (loading) {
    return (
      <div className="page-enter flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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

  if (clients.length === 0) {
    return (
      <div className="page-enter">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No clients yet</p>
            <Link
              href="/clients/new"
              className="text-primary hover:underline font-medium"
            >
              Create your first client
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="page-enter">
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filter === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filtered.map((client, index) => (
          <Link key={client.id} href={`/clients/${client.id}`}>
            <Card
              className="card-hover cursor-pointer"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg gradient-accent flex items-center justify-center text-white font-bold">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{client.name}</h3>
                        <StatusBadge status={client.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {client.industry || 'No industry set'}
                      </p>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Created {new Date(client.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No {filter} clients found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: ClientStatus }) {
  return (
    <Badge variant="secondary" className={STATUS_COLORS[status] || STATUS_COLORS.prospect}>
      {status}
    </Badge>
  )
}
