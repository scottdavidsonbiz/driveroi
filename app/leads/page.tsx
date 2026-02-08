'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Search, Database, ExternalLink } from 'lucide-react'

interface Lead {
  id: string
  email: string | null
  domain: string | null
  first_name: string | null
  last_name: string | null
  title: string | null
  company: string | null
  linkedin_url: string | null
  source: string | null
  created_at: string
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [searchDomain, setSearchDomain] = useState('')

  const fetchLeads = async (domain?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (domain) params.set('domain', domain)
      params.set('limit', '100')

      const response = await fetch(`/api/leads?${params}`)
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setLeads(data.leads || [])
        setTotal(data.total || 0)
      }
    } catch (err) {
      setError('Failed to load leads')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchLeads(searchDomain || undefined)
  }

  if (loading && leads.length === 0) {
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

  return (
    <div className="page-enter space-y-4">
      {/* Stats & Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {total.toLocaleString()} total leads
          </span>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <Input
            placeholder="Filter by domain..."
            value={searchDomain}
            onChange={(e) => setSearchDomain(e.target.value)}
            className="w-64"
          />
          <Button type="submit" variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* API Info */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <p className="text-sm font-medium mb-2">Clay Integration Endpoints:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-green-600">POST</span>{' '}
              <span className="text-muted-foreground">/api/leads</span>
              <span className="text-muted-foreground ml-2">- Add leads</span>
            </div>
            <div>
              <span className="text-blue-600">POST</span>{' '}
              <span className="text-muted-foreground">/api/leads/check</span>
              <span className="text-muted-foreground ml-2">- Check duplicates</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      {leads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-2">No leads yet</p>
            <p className="text-sm text-muted-foreground">
              POST leads to /api/leads or use the Clay integration
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Email
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Company
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Title
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Source
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Added
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span>
                            {lead.first_name || lead.last_name
                              ? `${lead.first_name || ''} ${lead.last_name || ''}`.trim()
                              : '-'}
                          </span>
                          {lead.linkedin_url && (
                            <a
                              href={lead.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm">{lead.email || '-'}</td>
                      <td className="p-4 text-sm">
                        <div>
                          <span>{lead.company || '-'}</span>
                          {lead.domain && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({lead.domain})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {lead.title || '-'}
                      </td>
                      <td className="p-4">
                        {lead.source && (
                          <Badge variant="secondary" className="text-xs">
                            {lead.source}
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
