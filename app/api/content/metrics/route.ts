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
