# LinkedIn Content Hub — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an internal LinkedIn content planning, analytics, and engagement tool within the existing DriveROI Vercel app.

**Architecture:** Four new pages under `/content` (ideas, themes, performance, engagers) backed by five new Supabase tables. CSV import for LinkedIn analytics, Apify integration for post engagement scraping, Clay webhook for ICP enrichment, Slack notifications for qualified engagers. No new auth — uses existing password-based session auth.

**Tech Stack:** Next.js 14 (app router), Supabase (PostgreSQL), Recharts (new dep for charts), Apify REST API, existing Slack webhook.

---

### Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/005_content_hub.sql`

**Step 1: Write the migration**

```sql
-- Migration: Content Hub tables for LinkedIn content planning and analytics

-- Content ideas backlog
CREATE TABLE IF NOT EXISTS content_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by TEXT NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'idea',
  priority INTEGER NOT NULL DEFAULT 0,
  theme_tag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_ideas_status ON content_ideas(status);
CREATE INDEX idx_content_ideas_created_by ON content_ideas(created_by);

-- Content themes (weekly/bi-weekly focus areas)
CREATE TABLE IF NOT EXISTS content_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_themes_status ON content_themes(status);

-- Content posts (drafts and published posts)
CREATE TABLE IF NOT EXISTS content_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID REFERENCES content_themes(id) ON DELETE SET NULL,
  idea_id UUID REFERENCES content_ideas(id) ON DELETE SET NULL,
  author TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'tactical',
  funnel_stage TEXT,
  post_text TEXT,
  linkedin_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_posts_author ON content_posts(author);
CREATE INDEX idx_content_posts_theme ON content_posts(theme_id);
CREATE INDEX idx_content_posts_status ON content_posts(status);

-- LinkedIn metrics (imported from CSV)
CREATE TABLE IF NOT EXISTS linkedin_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES content_posts(id) ON DELETE SET NULL,
  author TEXT NOT NULL,
  post_text TEXT,
  published_at TIMESTAMPTZ,
  impressions INTEGER DEFAULT 0,
  reactions INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  reposts INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  engagement_rate NUMERIC DEFAULT 0,
  new_followers INTEGER DEFAULT 0,
  imported_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_linkedin_metrics_author ON linkedin_metrics(author);
CREATE INDEX idx_linkedin_metrics_published ON linkedin_metrics(published_at);

-- Post engagers (ICP-qualified, from Clay webhook)
CREATE TABLE IF NOT EXISTS post_engagers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES content_posts(id) ON DELETE CASCADE,
  linkedin_url TEXT,
  name TEXT,
  title TEXT,
  company TEXT,
  domain TEXT,
  email TEXT,
  enriched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_post_engagers_post ON post_engagers(post_id);

-- RLS policies (allow all — internal tool, auth handled at app layer)
ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_engagers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on content_ideas" ON content_ideas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on content_themes" ON content_themes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on content_posts" ON content_posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on linkedin_metrics" ON linkedin_metrics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on post_engagers" ON post_engagers FOR ALL USING (true) WITH CHECK (true);
```

**Step 2: Run migration against Supabase**

```bash
# Copy the SQL and run in Supabase SQL Editor, or:
npx supabase db push
```

**Step 3: Commit**

```bash
git add supabase/migrations/005_content_hub.sql
git commit -m "feat: add Content Hub database tables"
```

---

### Task 2: TypeScript Types and Supabase Lib Updates

**Files:**
- Modify: `lib/supabase.ts` (append new interfaces)

**Step 1: Add interfaces to `lib/supabase.ts`**

Append after the existing `AuditSubmission` interface:

```typescript
export interface ContentIdea {
  id: string
  created_by: string
  title: string
  notes: string | null
  status: 'idea' | 'planned' | 'in_progress' | 'published' | 'archived'
  priority: number
  theme_tag: string | null
  created_at: string
  updated_at: string
}

export interface ContentTheme {
  id: string
  name: string
  description: string | null
  start_date: string | null
  end_date: string | null
  status: 'upcoming' | 'active' | 'completed'
  created_at: string
}

export interface ContentPost {
  id: string
  theme_id: string | null
  idea_id: string | null
  author: string
  content_type: 'thought_leadership' | 'tactical'
  funnel_stage: 'top' | 'middle' | 'bottom' | null
  post_text: string | null
  linkedin_url: string | null
  status: 'draft' | 'ready' | 'published'
  published_at: string | null
  created_at: string
}

export interface LinkedInMetric {
  id: string
  post_id: string | null
  author: string
  post_text: string | null
  published_at: string | null
  impressions: number
  reactions: number
  comments: number
  reposts: number
  clicks: number
  engagement_rate: number
  new_followers: number
  imported_at: string
}

export interface PostEngager {
  id: string
  post_id: string
  linkedin_url: string | null
  name: string | null
  title: string | null
  company: string | null
  domain: string | null
  email: string | null
  enriched_at: string | null
  created_at: string
}
```

**Step 2: Commit**

```bash
git add lib/supabase.ts
git commit -m "feat: add Content Hub TypeScript interfaces"
```

---

### Task 3: Sidebar Navigation + Header Titles

**Files:**
- Modify: `components/layout/sidebar.tsx`
- Modify: `components/layout/header.tsx`

**Step 1: Update sidebar**

In `components/layout/sidebar.tsx`:

1. Add import: `import { ..., PenSquare } from 'lucide-react'`
2. Add to `navigation` array after the Carousel entry:

```typescript
{ name: 'Content', href: '/content', icon: PenSquare },
```

**Step 2: Update header**

In `components/layout/header.tsx`, add these entries to `pageTitles`:

```typescript
'/content': {
  title: 'Content',
  description: 'LinkedIn content planning and analytics',
},
'/content/ideas': {
  title: 'Ideas',
  description: 'Content idea backlog',
},
'/content/themes': {
  title: 'Themes',
  description: 'Weekly content themes',
},
'/content/performance': {
  title: 'Performance',
  description: 'LinkedIn post analytics',
},
'/content/engagers': {
  title: 'Engagers',
  description: 'ICP engagement from LinkedIn posts',
},
```

**Step 3: Commit**

```bash
git add components/layout/sidebar.tsx components/layout/header.tsx
git commit -m "feat: add Content section to sidebar and header"
```

---

### Task 4: Content Landing Page with Sub-Navigation

**Files:**
- Create: `app/content/layout.tsx`
- Create: `app/content/page.tsx`

**Step 1: Create layout with tab navigation**

`app/content/layout.tsx`:

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  { name: 'Ideas', href: '/content' },
  { name: 'Themes', href: '/content/themes' },
  { name: 'Performance', href: '/content/performance' },
  { name: 'Engagers', href: '/content/engagers' },
]

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div>
      <div className="flex gap-1 mb-6 border-b">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.name}
            </Link>
          )
        })}
      </div>
      {children}
    </div>
  )
}
```

**Step 2: Create ideas page (the default `/content` page)**

`app/content/page.tsx`:

```typescript
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
```

**Step 3: Commit**

```bash
git add app/content/layout.tsx app/content/page.tsx
git commit -m "feat: add Content Hub layout and Ideas page"
```

---

### Task 5: Ideas API Routes

**Files:**
- Create: `app/api/content/ideas/route.ts`
- Create: `app/api/content/ideas/[id]/route.ts`

**Step 1: List + Create endpoint**

`app/api/content/ideas/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: ideas, error } = await supabase
      .from('content_ideas')
      .select('*')
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Content Ideas API] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ideas })
  } catch (error) {
    console.error('[Content Ideas API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, created_by, notes, theme_tag } = body

    if (!title || !created_by) {
      return NextResponse.json({ error: 'title and created_by are required' }, { status: 400 })
    }

    // Get max priority to append at end
    const { data: maxRow } = await supabase
      .from('content_ideas')
      .select('priority')
      .order('priority', { ascending: false })
      .limit(1)
      .single()

    const nextPriority = (maxRow?.priority || 0) + 1

    const { data: idea, error } = await supabase
      .from('content_ideas')
      .insert({
        title,
        created_by,
        notes: notes || null,
        theme_tag: theme_tag || null,
        priority: nextPriority,
      })
      .select()
      .single()

    if (error) {
      console.error('[Content Ideas API] Error creating:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ idea })
  } catch (error) {
    console.error('[Content Ideas API] Error:', error)
    return NextResponse.json({ error: 'Failed to create idea' }, { status: 500 })
  }
}
```

**Step 2: Update + Delete endpoint**

`app/api/content/ideas/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if ('title' in body) updates.title = body.title
    if ('notes' in body) updates.notes = body.notes
    if ('status' in body) updates.status = body.status
    if ('priority' in body) updates.priority = body.priority
    if ('theme_tag' in body) updates.theme_tag = body.theme_tag
    if ('created_by' in body) updates.created_by = body.created_by

    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('content_ideas')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('[Content Ideas API] Error updating:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ idea: data })
  } catch (error) {
    console.error('[Content Ideas API] Error:', error)
    return NextResponse.json({ error: 'Failed to update idea' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('content_ideas')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('[Content Ideas API] Error deleting:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Content Ideas API] Error:', error)
    return NextResponse.json({ error: 'Failed to delete idea' }, { status: 500 })
  }
}
```

**Step 3: Commit**

```bash
git add app/api/content/ideas/route.ts app/api/content/ideas/\[id\]/route.ts
git commit -m "feat: add Ideas CRUD API routes"
```

---

### Task 6: Themes Page + API

**Files:**
- Create: `app/content/themes/page.tsx`
- Create: `app/api/content/themes/route.ts`
- Create: `app/api/content/themes/[id]/route.ts`

**Step 1: Themes API**

`app/api/content/themes/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: themes, error } = await supabase
      .from('content_themes')
      .select('*')
      .order('start_date', { ascending: false })

    if (error) {
      console.error('[Content Themes API] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ themes })
  } catch (error) {
    console.error('[Content Themes API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch themes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, start_date, end_date } = body

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const { data: theme, error } = await supabase
      .from('content_themes')
      .insert({
        name,
        description: description || null,
        start_date: start_date || null,
        end_date: end_date || null,
      })
      .select()
      .single()

    if (error) {
      console.error('[Content Themes API] Error creating:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ theme })
  } catch (error) {
    console.error('[Content Themes API] Error:', error)
    return NextResponse.json({ error: 'Failed to create theme' }, { status: 500 })
  }
}
```

`app/api/content/themes/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if ('name' in body) updates.name = body.name
    if ('description' in body) updates.description = body.description
    if ('start_date' in body) updates.start_date = body.start_date
    if ('end_date' in body) updates.end_date = body.end_date
    if ('status' in body) updates.status = body.status

    const { data, error } = await supabase
      .from('content_themes')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('[Content Themes API] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ theme: data })
  } catch (error) {
    console.error('[Content Themes API] Error:', error)
    return NextResponse.json({ error: 'Failed to update theme' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('content_themes')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('[Content Themes API] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Content Themes API] Error:', error)
    return NextResponse.json({ error: 'Failed to delete theme' }, { status: 500 })
  }
}
```

**Step 2: Themes page**

`app/content/themes/page.tsx`:

```typescript
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
```

**Step 3: Commit**

```bash
git add app/content/themes/page.tsx app/api/content/themes/route.ts app/api/content/themes/\[id\]/route.ts
git commit -m "feat: add Themes page and API routes"
```

---

### Task 7: Install Recharts + Performance Page

**Files:**
- Create: `app/content/performance/page.tsx`
- Create: `app/api/content/metrics/route.ts`

**Step 1: Install recharts**

```bash
npm install recharts
```

**Step 2: Metrics import API**

`app/api/content/metrics/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const author = searchParams.get('author')

    let query = supabase
      .from('linkedin_metrics')
      .select('*')
      .order('published_at', { ascending: false })

    if (author) query = query.eq('author', author)

    const { data: metrics, error } = await query

    if (error) {
      console.error('[Content Metrics API] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ metrics })
  } catch (error) {
    console.error('[Content Metrics API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { records, author } = body

    if (!records || !Array.isArray(records) || !author) {
      return NextResponse.json({ error: 'records array and author are required' }, { status: 400 })
    }

    const rows = records.map((r: Record<string, string>) => ({
      author,
      post_text: r['Post text'] || r['post_text'] || r['Content'] || null,
      published_at: r['Date'] || r['date'] || r['Published date'] || null,
      impressions: parseInt(r['Impressions'] || r['impressions'] || '0') || 0,
      reactions: parseInt(r['Reactions'] || r['reactions'] || r['Likes'] || '0') || 0,
      comments: parseInt(r['Comments'] || r['comments'] || '0') || 0,
      reposts: parseInt(r['Reposts'] || r['reposts'] || r['Shares'] || '0') || 0,
      clicks: parseInt(r['Clicks'] || r['clicks'] || '0') || 0,
      engagement_rate: parseFloat(r['Engagement rate'] || r['engagement_rate'] || '0') || 0,
      new_followers: parseInt(r['New followers'] || r['new_followers'] || r['Followers'] || '0') || 0,
    }))

    const { data, error } = await supabase
      .from('linkedin_metrics')
      .insert(rows)
      .select()

    if (error) {
      console.error('[Content Metrics API] Error importing:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ imported: data?.length || 0 })
  } catch (error) {
    console.error('[Content Metrics API] Error:', error)
    return NextResponse.json({ error: 'Failed to import metrics' }, { status: 500 })
  }
}
```

**Step 3: Performance page**

`app/content/performance/page.tsx`:

```typescript
'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Upload, TrendingUp, MessageSquare, Eye, MousePointer } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import type { LinkedInMetric } from '@/lib/supabase'

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<LinkedInMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<string | null>(null)
  const [filterAuthor, setFilterAuthor] = useState<string>('all')

  const fetchMetrics = useCallback(async () => {
    const res = await fetch('/api/content/metrics')
    const data = await res.json()
    setMetrics(data.metrics || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchMetrics() }, [fetchMetrics])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportResult(null)

    const text = await file.text()
    const lines = text.split('\n').filter(l => l.trim())
    if (lines.length < 2) {
      setImportResult('CSV has no data rows')
      setImporting(false)
      return
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"/, '').replace(/"$/, ''))
    const records = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"/, '').replace(/"$/, ''))
      const record: Record<string, string> = {}
      headers.forEach((h, i) => { record[h] = values[i] || '' })
      return record
    })

    // Prompt for author — simple approach
    const author = prompt('Who is this data for? (scott or brenda)', 'scott')
    if (!author) { setImporting(false); return }

    const res = await fetch('/api/content/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records, author }),
    })

    const data = await res.json()
    if (data.error) {
      setImportResult(`Error: ${data.error}`)
    } else {
      setImportResult(`Imported ${data.imported} posts`)
      fetchMetrics()
    }
    setImporting(false)
  }

  const filtered = filterAuthor === 'all' ? metrics : metrics.filter(m => m.author === filterAuthor)
  const sorted = [...filtered].sort((a, b) =>
    new Date(a.published_at || 0).getTime() - new Date(b.published_at || 0).getTime()
  )

  // Summary stats
  const totalImpressions = filtered.reduce((s, m) => s + m.impressions, 0)
  const totalReactions = filtered.reduce((s, m) => s + m.reactions, 0)
  const totalComments = filtered.reduce((s, m) => s + m.comments, 0)
  const avgEngagement = filtered.length > 0
    ? (filtered.reduce((s, m) => s + m.engagement_rate, 0) / filtered.length).toFixed(2)
    : '0'

  // Chart data
  const chartData = sorted.map(m => ({
    date: m.published_at ? new Date(m.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '?',
    impressions: m.impressions,
    engagement: m.engagement_rate,
    reactions: m.reactions,
    comments: m.comments,
  }))

  // Day-of-week data
  const dayMap: Record<string, { impressions: number; engagement: number; count: number }> = {}
  sorted.forEach(m => {
    if (!m.published_at) return
    const day = new Date(m.published_at).toLocaleDateString('en-US', { weekday: 'short' })
    if (!dayMap[day]) dayMap[day] = { impressions: 0, engagement: 0, count: 0 }
    dayMap[day].impressions += m.impressions
    dayMap[day].engagement += m.engagement_rate
    dayMap[day].count++
  })
  const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const dayData = dayOrder.filter(d => dayMap[d]).map(d => ({
    day: d,
    avgImpressions: Math.round(dayMap[d].impressions / dayMap[d].count),
    avgEngagement: parseFloat((dayMap[d].engagement / dayMap[d].count).toFixed(2)),
  }))

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="space-y-6">
      {/* Import + filter row */}
      <div className="flex items-center justify-between">
        <select
          value={filterAuthor}
          onChange={(e) => setFilterAuthor(e.target.value)}
          className="flex h-8 rounded-md border border-input bg-background px-2 text-xs"
        >
          <option value="all">All authors</option>
          <option value="scott">Scott</option>
          <option value="brenda">Brenda</option>
        </select>

        <div className="flex items-center gap-2">
          {importResult && <span className="text-xs text-muted-foreground">{importResult}</span>}
          <Button size="sm" variant="outline" disabled={importing} asChild>
            <label className="cursor-pointer">
              {importing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
              Import CSV
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1"><Eye className="h-4 w-4" /><span className="text-xs font-medium uppercase">Impressions</span></div>
            <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1"><TrendingUp className="h-4 w-4" /><span className="text-xs font-medium uppercase">Avg Engagement</span></div>
            <div className="text-2xl font-bold">{avgEngagement}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1"><MessageSquare className="h-4 w-4" /><span className="text-xs font-medium uppercase">Comments</span></div>
            <div className="text-2xl font-bold">{totalComments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1"><MousePointer className="h-4 w-4" /><span className="text-xs font-medium uppercase">Reactions</span></div>
            <div className="text-2xl font-bold">{totalReactions}</div>
          </CardContent>
        </Card>
      </div>

      {metrics.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-2">No performance data yet.</p>
            <p className="text-sm text-muted-foreground">Export your LinkedIn post analytics as CSV and import above.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Engagement over time */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Engagement Over Time</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="impressions" stroke="#8B7FD4" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Reactions vs comments */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Reactions vs Comments</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="reactions" fill="#8B7FD4" />
                  <Bar dataKey="comments" fill="#6b5fb4" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Day of week */}
          {dayData.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Average Impressions by Day</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={dayData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="avgImpressions" fill="#8B7FD4" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Posts table */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">All Posts</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">Date</th>
                      <th className="py-2 pr-4 font-medium">Post</th>
                      <th className="py-2 pr-4 font-medium text-right">Impressions</th>
                      <th className="py-2 pr-4 font-medium text-right">Engagement</th>
                      <th className="py-2 pr-4 font-medium text-right">Reactions</th>
                      <th className="py-2 font-medium text-right">Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...filtered].sort((a, b) => b.impressions - a.impressions).map(m => (
                      <tr key={m.id} className="border-b last:border-0">
                        <td className="py-2 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                          {m.published_at ? new Date(m.published_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-2 pr-4 max-w-[300px] truncate">{m.post_text?.slice(0, 80) || '—'}</td>
                        <td className="py-2 pr-4 text-right">{m.impressions.toLocaleString()}</td>
                        <td className="py-2 pr-4 text-right">{m.engagement_rate}%</td>
                        <td className="py-2 pr-4 text-right">{m.reactions}</td>
                        <td className="py-2 text-right">{m.comments}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add package.json package-lock.json app/content/performance/page.tsx app/api/content/metrics/route.ts
git commit -m "feat: add Performance page with CSV import and charts"
```

---

### Task 8: Engagers Page + Webhook API

**Files:**
- Create: `app/content/engagers/page.tsx`
- Create: `app/api/content/engagers/route.ts`

**Step 1: Engagers webhook API**

`app/api/content/engagers/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: engagers, error } = await supabase
      .from('post_engagers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      console.error('[Content Engagers API] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ engagers })
  } catch (error) {
    console.error('[Content Engagers API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch engagers' }, { status: 500 })
  }
}

// Webhook endpoint: receives ICP-qualified engagers from Clay
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Support single record or array
    const records = Array.isArray(body) ? body : [body]

    const rows = records.map((r: Record<string, string>) => ({
      post_id: r.post_id || null,
      linkedin_url: r.linkedin_url || r.LinkedIn || null,
      name: r.name || r.Name || r['Full Name'] || null,
      title: r.title || r.Title || r['Job Title'] || null,
      company: r.company || r.Company || r['Company Name'] || null,
      domain: r.domain || r.Domain || null,
      email: r.email || r.Email || null,
      enriched_at: new Date().toISOString(),
    }))

    const { data, error } = await supabase
      .from('post_engagers')
      .insert(rows)
      .select()

    if (error) {
      console.error('[Content Engagers API] Error inserting:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Send Slack notification for each engager
    const slackUrl = process.env.SLACK_WEBHOOK_URL
    if (slackUrl) {
      for (const engager of data || []) {
        const message = `*LinkedIn Engagement* — ${engager.name || 'Unknown'}, ${engager.title || ''} at ${engager.company || 'Unknown'}\n${engager.linkedin_url || ''}`
        try {
          await fetch(slackUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: message }),
          })
        } catch (slackErr) {
          console.error('[Content Engagers API] Slack error:', slackErr)
        }
      }
    }

    return NextResponse.json({ inserted: data?.length || 0 })
  } catch (error) {
    console.error('[Content Engagers API] Error:', error)
    return NextResponse.json({ error: 'Failed to store engagers' }, { status: 500 })
  }
}
```

**Step 2: Engagers page**

`app/content/engagers/page.tsx`:

```typescript
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
```

**Step 3: Commit**

```bash
git add app/content/engagers/page.tsx app/api/content/engagers/route.ts
git commit -m "feat: add Engagers page with Clay webhook and Slack notifications"
```

---

### Task 9: Apify Scrape Integration

**Files:**
- Create: `lib/apify.ts`
- Create: `app/api/content/scrape/route.ts`

**Step 1: Apify client library**

`lib/apify.ts`:

```typescript
const APIFY_BASE_URL = 'https://api.apify.com/v2'

function getApiKey(): string {
  const key = process.env.APIFY_API_KEY
  if (!key) throw new Error('APIFY_API_KEY not set')
  return key
}

// LinkedIn Post Likers/Commenters actor
// Replace ACTOR_ID with the actual actor ID from your Apify account
const LINKEDIN_POST_SCRAPER_ACTOR = 'curious_coder/linkedin-post-likers-and-commenters'

export async function scrapePostEngagers(postUrl: string, webhookUrl: string) {
  const res = await fetch(
    `${APIFY_BASE_URL}/acts/${LINKEDIN_POST_SCRAPER_ACTOR}/runs?token=${getApiKey()}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: {
          postUrls: [postUrl],
        },
        webhooks: [
          {
            eventTypes: ['ACTOR.RUN.SUCCEEDED'],
            requestUrl: webhookUrl,
          },
        ],
      }),
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Apify API error ${res.status}: ${text}`)
  }

  return res.json()
}
```

**Step 2: Scrape API route**

`app/api/content/scrape/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { scrapePostEngagers } from '@/lib/apify'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { post_url } = body

    if (!post_url) {
      return NextResponse.json({ error: 'post_url is required' }, { status: 400 })
    }

    // The webhook URL where Apify sends results
    // This goes to Clay first for enrichment, not directly to our engagers endpoint
    const clayWebhookUrl = process.env.CLAY_ENGAGER_WEBHOOK_URL
    if (!clayWebhookUrl) {
      return NextResponse.json({ error: 'CLAY_ENGAGER_WEBHOOK_URL not configured' }, { status: 500 })
    }

    const result = await scrapePostEngagers(post_url, clayWebhookUrl)

    return NextResponse.json({
      success: true,
      run_id: result.data?.id,
      message: 'Scrape started. Results will arrive via Clay webhook once enriched.',
    })
  } catch (error) {
    console.error('[Content Scrape API] Error:', error)
    const message = error instanceof Error ? error.message : 'Failed to start scrape'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

**Step 3: Commit**

```bash
git add lib/apify.ts app/api/content/scrape/route.ts
git commit -m "feat: add Apify scrape integration for LinkedIn post engagers"
```

---

### Task 10: Final Integration — Wire Up, Test, Deploy

**Step 1: Verify all pages load locally**

```bash
npm run dev
```

Visit:
- `http://localhost:3000/content` — Ideas page with quick-add
- `http://localhost:3000/content/themes` — Themes page with create form
- `http://localhost:3000/content/performance` — Performance page with CSV upload
- `http://localhost:3000/content/engagers` — Engagers page (empty state)

**Step 2: Run the Supabase migration**

Open Supabase SQL Editor and paste the contents of `supabase/migrations/005_content_hub.sql`. Run it.

**Step 3: Test the Ideas flow**

1. Add an idea via the quick-add bar
2. Expand it, change status, add notes, add a theme tag
3. Filter by status and author
4. Delete an idea

**Step 4: Test CSV import**

1. Export LinkedIn post analytics CSV
2. Upload via Performance page
3. Verify charts render and table populates

**Step 5: Test the engagers webhook**

```bash
curl -X POST http://localhost:3000/api/content/engagers \
  -H "Content-Type: application/json" \
  -d '[{"name":"Test User","title":"VP Marketing","company":"Acme Corp","linkedin_url":"https://linkedin.com/in/test","email":"test@acme.com","domain":"acme.com"}]'
```

Verify: record appears in engagers page + Slack notification fires.

**Step 6: Build and deploy**

```bash
npm run build
git add -A
git commit -m "feat: LinkedIn Content Hub — complete initial build"
git push
```

**Step 7: Set env vars in Vercel**

Add to Vercel project settings:
- `APIFY_API_KEY` — from your Apify account
- `CLAY_ENGAGER_WEBHOOK_URL` — the Clay table's incoming webhook URL (set up after Clay table is created)

Redeploy after adding env vars.
