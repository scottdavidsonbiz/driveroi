import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/clients/[id]/integrations — add a campaign integration
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params
    const { platform, external_campaign_id, campaign_name } = await request.json()

    if (!platform || !external_campaign_id) {
      return NextResponse.json(
        { error: 'platform and external_campaign_id are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('client_integrations')
      .upsert(
        {
          client_id: clientId,
          platform,
          external_campaign_id,
          campaign_name: campaign_name || null,
          active: true,
        },
        { onConflict: 'platform,external_campaign_id' }
      )
      .select()
      .single()

    if (error) {
      console.error('[Integrations API] Insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ integration: data })
  } catch (error) {
    console.error('[Integrations API] Error:', error)
    return NextResponse.json({ error: 'Failed to add integration' }, { status: 500 })
  }
}

// DELETE /api/clients/[id]/integrations — remove a campaign integration
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params
    const { integration_id } = await request.json()

    if (!integration_id) {
      return NextResponse.json({ error: 'integration_id is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('client_integrations')
      .delete()
      .eq('id', integration_id)
      .eq('client_id', clientId)

    if (error) {
      console.error('[Integrations API] Delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Integrations API] Error:', error)
    return NextResponse.json({ error: 'Failed to delete integration' }, { status: 500 })
  }
}
