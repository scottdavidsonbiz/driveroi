import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { buildMetricsSnapshot } from '@/lib/metrics'

// GET /api/clients/[id]/stats?range=7d|14d|30d|all
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params
    const url = new URL(request.url)
    const range = url.searchParams.get('range') || '7d'

    // 1. Fetch latest campaign_stats snapshot for this client
    const { data: allStats, error: statsError } = await supabase
      .from('campaign_stats')
      .select('*')
      .eq('client_id', clientId)
      .order('snapshot_date', { ascending: false })

    if (statsError) {
      return NextResponse.json({ error: statsError.message }, { status: 500 })
    }

    if (!allStats || allStats.length === 0) {
      return NextResponse.json({
        current: null,
        previous: null,
        current_date: null,
        previous_date: null,
        range,
      })
    }

    // Get the most recent snapshot date and its stats
    const latestDate = allStats[0].snapshot_date
    const currentStats = allStats.filter(s => s.snapshot_date === latestDate)
    const current = buildMetricsSnapshot(currentStats)

    if (range === 'all') {
      return NextResponse.json({
        current,
        previous: null,
        current_date: latestDate,
        previous_date: null,
        range,
      })
    }

    // 2. Calculate the comparison date
    const days = range === '7d' ? 7 : range === '14d' ? 14 : 30
    const sinceDate = new Date()
    sinceDate.setDate(sinceDate.getDate() - days)
    const sinceDateStr = sinceDate.toISOString().split('T')[0]

    // 3. Find the closest snapshot on or before sinceDate as comparison baseline
    const { data: previousStats, error: prevError } = await supabase
      .from('campaign_stats')
      .select('*')
      .eq('client_id', clientId)
      .lte('snapshot_date', sinceDateStr)
      .order('snapshot_date', { ascending: false })

    if (prevError) {
      return NextResponse.json({ error: prevError.message }, { status: 500 })
    }

    if (!previousStats || previousStats.length === 0) {
      // No previous data for this range — return current with no comparison
      return NextResponse.json({
        current,
        previous: null,
        current_date: latestDate,
        previous_date: null,
        range,
      })
    }

    // Get all stats from the closest previous snapshot date
    const previousDate = previousStats[0].snapshot_date
    const previousDateStats = previousStats.filter(s => s.snapshot_date === previousDate)
    const previous = buildMetricsSnapshot(previousDateStats)

    return NextResponse.json({
      current,
      previous,
      current_date: latestDate,
      previous_date: previousDate,
      range,
    })
  } catch (error) {
    console.error('[Stats API] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
