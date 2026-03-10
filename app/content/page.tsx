'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, GripVertical, ChevronDown, ChevronUp } from 'lucide-react'
import type { ContentIdea } from '@/lib/supabase'

const STATUS_OPTIONS = ['idea', 'planned', 'in_progress', 'published', 'archived'] as const
const STATUS_COLORS: Record<string, string> = {
  idea: 'bg-blue-100 text-blue-700',
  planned: 'bg-purple-100 text-purple-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-700',
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<ContentIdea[]>([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterAuthor, setFilterAuthor] = useState<string>('all')

  const fetchIdeas = useCallback(async () => {
    const res = await fetch('/api/content/ideas')
    const data = await res.json()
    setIdeas(data.ideas || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchIdeas() }, [fetchIdeas])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setAdding(true)
    await fetch('/api/content/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim(), created_by: 'scott' }),
    })
    setNewTitle('')
    setAdding(false)
    fetchIdeas()
  }

  async function handleUpdateStatus(id: string, status: string) {
    await fetch(`/api/content/ideas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchIdeas()
  }

  async function handleUpdateNotes(id: string, notes: string) {
    await fetch(`/api/content/ideas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    })
  }

  async function handleUpdateThemeTag(id: string, theme_tag: string) {
    await fetch(`/api/content/ideas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme_tag: theme_tag || null }),
    })
    fetchIdeas()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/content/ideas/${id}`, { method: 'DELETE' })
    fetchIdeas()
  }

  const filtered = ideas
    .filter(i => filterStatus === 'all' || i.status === filterStatus)
    .filter(i => filterAuthor === 'all' || i.created_by === filterAuthor)
    .sort((a, b) => a.priority - b.priority)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Quick-add bar */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          placeholder="Add an idea..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={adding || !newTitle.trim()} size="sm" className="gradient-accent border-0">
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
      </form>

      {/* Filters */}
      <div className="flex gap-2">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="flex h-8 rounded-md border border-input bg-background px-2 text-xs"
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filterAuthor}
          onChange={(e) => setFilterAuthor(e.target.value)}
          className="flex h-8 rounded-md border border-input bg-background px-2 text-xs"
        >
          <option value="all">All authors</option>
          <option value="scott">Scott</option>
          <option value="brenda">Brenda</option>
        </select>
      </div>

      {/* Ideas list */}
      <div className="space-y-2">
        {filtered.map((idea) => (
          <Card key={idea.id} className="card-hover">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{idea.title}</span>
                    <Badge variant="secondary" className={STATUS_COLORS[idea.status] || ''}>
                      {idea.status}
                    </Badge>
                    {idea.theme_tag && (
                      <Badge variant="outline" className="text-xs">{idea.theme_tag}</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{idea.created_by}</span>
                </div>
                <button
                  onClick={() => setExpandedId(expandedId === idea.id ? null : idea.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {expandedId === idea.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>

              {expandedId === idea.id && (
                <div className="mt-3 pt-3 border-t space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Notes</label>
                    <textarea
                      defaultValue={idea.notes || ''}
                      onBlur={(e) => handleUpdateNotes(idea.id, e.target.value)}
                      placeholder="Add notes..."
                      rows={3}
                      className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Status</label>
                      <select
                        value={idea.status}
                        onChange={(e) => handleUpdateStatus(idea.id, e.target.value)}
                        className="mt-1 flex h-8 rounded-md border border-input bg-background px-2 text-xs"
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Theme tag</label>
                      <Input
                        defaultValue={idea.theme_tag || ''}
                        onBlur={(e) => handleUpdateThemeTag(idea.id, e.target.value)}
                        placeholder="e.g. ABM"
                        className="mt-1 h-8 text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={() => handleDelete(idea.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No ideas yet. Add one above.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
