import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { icp_status } = body

    // Validate icp_status
    if (icp_status !== null && icp_status !== 'qualified' && icp_status !== 'disqualified') {
      return NextResponse.json({ error: 'icp_status must be "qualified", "disqualified", or null' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('post_engagers')
      .update({ icp_status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[Engager PATCH] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ engager: data })
  } catch (error) {
    console.error('[Engager PATCH] Error:', error)
    return NextResponse.json({ error: 'Failed to update engager' }, { status: 500 })
  }
}
