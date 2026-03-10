'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import type { ContentTheme } from '@/lib/supabase'

const STATUS_COLORS: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-700',
}

export default function ThemesPage() {
  const [themes, setThemes] = useState<ContentTheme[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '', start_date: '', end_date: '' })
  const [saving, setSaving] = useState(false)

  const fetchThemes = useCallback(async () => {
    const res = await fetch('/api/content/themes')
    const data = await res.json()
    setThemes(data.themes || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchThemes() }, [fetchThemes])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name.trim()) return
    setSaving(true)
    await fetch('/api/content/themes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    setFormData({ name: '', description: '', start_date: '', end_date: '' })
    setShowForm(false)
    setSaving(false)
    fetchThemes()
  }

  async function handleStatusChange(id: string, status: string) {
    await fetch(`/api/content/themes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchThemes()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/content/themes/${id}`, { method: 'DELETE' })
    fetchThemes()
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  const active = themes.filter(t => t.status === 'active')
  const upcoming = themes.filter(t => t.status === 'upcoming')
  const completed = themes.filter(t => t.status === 'completed')

  return (
    <div className="space-y-6">
      {/* Active theme highlight */}
      {active.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Active Theme</h3>
          {active.map(theme => (
            <Card key={theme.id} className="border-primary/50 bg-primary/5">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{theme.name}</span>
                      <Badge className={STATUS_COLORS.active}>active</Badge>
                    </div>
                    {theme.description && <p className="text-sm text-muted-foreground mt-1">{theme.description}</p>}
                    {theme.start_date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {theme.start_date} — {theme.end_date || 'ongoing'}
                      </p>
                    )}
                  </div>
                  <select
                    value={theme.status}
                    onChange={(e) => handleStatusChange(theme.id, e.target.value)}
                    className="flex h-8 rounded-md border border-input bg-background px-2 text-xs"
                  >
                    <option value="upcoming">upcoming</option>
                    <option value="active">active</option>
                    <option value="completed">completed</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New theme form */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {upcoming.length > 0 ? 'Upcoming' : 'Themes'}
        </h3>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> New Theme
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4">
            <form onSubmit={handleCreate} className="space-y-3">
              <Input placeholder="Theme name (e.g. ABM Week)" value={formData.name} onChange={(e) => setFormData(d => ({ ...d, name: e.target.value }))} />
              <Input placeholder="Description (optional)" value={formData.description} onChange={(e) => setFormData(d => ({ ...d, description: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Start date</label>
                  <Input type="date" value={formData.start_date} onChange={(e) => setFormData(d => ({ ...d, start_date: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">End date</label>
                  <Input type="date" value={formData.end_date} onChange={(e) => setFormData(d => ({ ...d, end_date: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={saving || !formData.name.trim()} className="gradient-accent border-0">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Upcoming + completed lists */}
      <div className="space-y-2">
        {[...upcoming, ...completed].map(theme => (
          <Card key={theme.id}>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{theme.name}</span>
                    <Badge variant="secondary" className={STATUS_COLORS[theme.status] || ''}>{theme.status}</Badge>
                  </div>
                  {theme.start_date && (
                    <p className="text-xs text-muted-foreground">{theme.start_date} — {theme.end_date || 'ongoing'}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={theme.status}
                    onChange={(e) => handleStatusChange(theme.id, e.target.value)}
                    className="flex h-8 rounded-md border border-input bg-background px-2 text-xs"
                  >
                    <option value="upcoming">upcoming</option>
                    <option value="active">active</option>
                    <option value="completed">completed</option>
                  </select>
                  <button onClick={() => handleDelete(theme.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {themes.length === 0 && !showForm && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">No themes yet. Create one to start coordinating content.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
