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
