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
