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
