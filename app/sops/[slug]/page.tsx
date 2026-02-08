'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  Loader2,
  Calendar,
  FileText,
  Pencil,
  Save,
  X,
  Video,
} from 'lucide-react'

interface SOPDetail {
  slug: string
  title: string
  purpose: string | null
  lastUpdated: string | null
  loomUrl: string | null
  content: string
}

function LoomEmbed({ url }: { url: string }) {
  // Convert share URL to embed URL
  // https://www.loom.com/share/abc123 -> https://www.loom.com/embed/abc123
  const embedUrl = url.replace('/share/', '/embed/')

  return (
    <div className="relative w-full pb-[56.25%] mb-6 rounded-lg overflow-hidden border">
      <iframe
        src={embedUrl}
        frameBorder="0"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  )
}

export default function SOPDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [sop, setSOP] = useState<SOPDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    async function fetchSOP() {
      try {
        const response = await fetch(`/api/sops/${params.slug}`)
        const data = await response.json()

        if (data.error) {
          setError(data.error)
        } else {
          setSOP(data.sop)
          setEditContent(data.sop.content)
        }
      } catch (err) {
        setError('Failed to load SOP')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchSOP()
    }
  }, [params.slug])

  const handleSave = async () => {
    if (!sop) return

    setSaving(true)
    try {
      const response = await fetch(`/api/sops/${params.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      })

      const data = await response.json()

      if (data.success) {
        setSOP(data.sop)
        setEditContent(data.sop.content)
        setIsEditing(false)
      } else {
        alert('Failed to save: ' + data.error)
      }
    } catch (err) {
      console.error(err)
      alert('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditContent(sop?.content || '')
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="page-enter flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !sop) {
    return (
      <div className="page-enter">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive">{error || 'SOP not found'}</p>
            <Button variant="link" onClick={() => router.push('/sops')}>
              Back to SOPs
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="page-enter max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/sops')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">{sop.title}</h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground ml-13">
              {sop.lastUpdated && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {sop.lastUpdated}
                </span>
              )}
              {sop.loomUrl && (
                <span className="flex items-center gap-1">
                  <Video className="h-3 w-3" />
                  Has video
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Edit/Save buttons */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="ghost" onClick={handleCancel} disabled={saving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Loom Embed */}
      {sop.loomUrl && !isEditing && <LoomEmbed url={sop.loomUrl} />}

      {/* Content */}
      <Card>
        <CardContent className="py-6">
          {isEditing ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Edit the markdown below. Add <code className="bg-muted px-1 rounded">**Loom:** https://www.loom.com/share/...</code> to embed a video.
              </p>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[600px] font-mono text-sm"
                placeholder="Enter markdown content..."
              />
            </div>
          ) : (
            <article className="prose prose-slate max-w-none dark:prose-invert prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h2:border-b prose-h2:pb-2 prose-h2:mt-8 prose-h3:text-lg prose-a:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted prose-pre:border prose-table:border prose-th:border prose-th:px-4 prose-th:py-2 prose-th:bg-muted prose-td:border prose-td:px-4 prose-td:py-2 prose-li:marker:text-muted-foreground">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {sop.content}
              </ReactMarkdown>
            </article>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
