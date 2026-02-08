'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'

interface ClientWithICP {
  id: string
  name: string
  website: string | null
  industry: string | null
  created_at: string
  client_icp: {
    buyer_persona: string | null
    positioning: string | null
  } | null
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientWithICP[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{client.name}</h3>
                        <StatusBadge hasICP={!!client.client_icp} />
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
      </div>
    </div>
  )
}

function StatusBadge({ hasICP }: { hasICP: boolean }) {
  if (hasICP) {
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-700">
        ICP Ready
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
      Needs Setup
    </Badge>
  )
}
