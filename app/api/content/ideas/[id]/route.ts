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
