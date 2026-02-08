'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, ArrowRight, Loader2 } from 'lucide-react'

interface SOP {
  slug: string
  title: string
  purpose: string | null
  lastUpdated: string | null
}

export default function SOPsPage() {
  const [sops, setSOPs] = useState<SOP[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSOPs() {
      try {
        const response = await fetch('/api/sops')
        const data = await response.json()

        if (data.error) {
          setError(data.error)
        } else {
          setSOPs(data.sops || [])
        }
      } catch (err) {
        setError('Failed to load SOPs')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSOPs()
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

  if (sops.length === 0) {
    return (
      <div className="page-enter">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No SOPs found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add markdown files to docs/sops/ to get started
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="page-enter">
      <div className="grid gap-4">
        {sops.map((sop) => (
          <Link key={sop.slug} href={`/sops/${sop.slug}`}>
            <Card className="card-hover cursor-pointer">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{sop.title}</h3>
                      {sop.purpose && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {sop.purpose}
                        </p>
                      )}
                      {sop.lastUpdated && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Updated: {sop.lastUpdated}
                        </p>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
