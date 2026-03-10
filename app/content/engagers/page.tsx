'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ExternalLink, Mail } from 'lucide-react'
import type { PostEngager } from '@/lib/supabase'

export default function EngagersPage() {
  const [engagers, setEngagers] = useState<PostEngager[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEngagers = useCallback(async () => {
    const res = await fetch('/api/content/engagers')
    const data = await res.json()
    setEngagers(data.engagers || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchEngagers() }, [fetchEngagers])

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  if (engagers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-2">No engagers yet.</p>
          <p className="text-sm text-muted-foreground">
            Set up the Apify → Clay → webhook pipeline to capture ICP engagers from your LinkedIn posts.
          </p>
          <div className="mt-4 text-left max-w-md mx-auto text-xs text-muted-foreground space-y-1">
            <p>1. Set up an Apify actor to scrape post likers/commenters</p>
            <p>2. Route output to a Clay table for enrichment + ICP filtering</p>
            <p>3. Clay pushes qualified leads to: <code className="bg-muted px-1 rounded">POST /api/content/engagers</code></p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{engagers.length} ICP-qualified engagers</p>
      {engagers.map(eng => (
        <Card key={eng.id} className="card-hover">
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{eng.name || 'Unknown'}</span>
                  {eng.company && <Badge variant="outline" className="text-xs">{eng.company}</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{eng.title || 'No title'}</p>
                {eng.domain && <p className="text-xs text-muted-foreground">{eng.domain}</p>}
              </div>
              <div className="flex items-center gap-2">
                {eng.email && (
                  <a href={`mailto:${eng.email}`} className="text-muted-foreground hover:text-foreground" title={eng.email}>
                    <Mail className="h-4 w-4" />
                  </a>
                )}
                {eng.linkedin_url && (
                  <a href={eng.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                <span className="text-xs text-muted-foreground">
                  {eng.created_at ? new Date(eng.created_at).toLocaleDateString() : ''}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
