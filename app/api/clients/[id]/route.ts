import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/clients/[id] - Get a single client with all related data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: client, error } = await supabase
      .from('clients')
      .select(`
        *,
        client_icp (*),
        client_materials (*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('[Client API] Error fetching client:', error)
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    // Also fetch leads for this client
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .eq('client_id', id)
      .order('created_at', { ascending: false })

    // Also fetch campaign stats
    const { data: campaigns } = await supabase
      .from('campaign_stats')
      .select('*')
      .eq('client_id', id)
      .order('snapshot_date', { ascending: false })

    // Fetch integrations
    const { data: integrations } = await supabase
      .from('client_integrations')
      .select('*')
      .eq('client_id', id)
      .order('created_at', { ascending: false })

    // Fetch latest update
    const { data: latestUpdates } = await supabase
      .from('client_updates')
      .select('*')
      .eq('client_id', id)
      .order('created_at', { ascending: false })
      .limit(1)

    return NextResponse.json({
      client: {
        ...client,
        leads: leads || [],
        campaigns: campaigns || [],
        integrations: integrations || [],
        latest_update: latestUpdates?.[0] || null,
      },
    })
  } catch (error) {
    console.error('[Client API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 })
  }
}

// DELETE /api/clients/[id] - Delete a client
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[Client API] Error deleting client:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Client API] Error:', error)
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 })
  }
}
