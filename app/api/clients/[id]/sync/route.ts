import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getOverallStats } from '@/lib/heyreach'
import { getCampaignAnalytics } from '@/lib/instantly'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params
    const today = new Date().toISOString().split('T')[0]

    // Look up integrations for this client
    const { data: integrations, error: intError } = await supabase
      .from('client_integrations')
      .select('*')
      .eq('client_id', clientId)
      .eq('active', true)

    if (intError) {
      console.error('[Sync API] Error fetching integrations:', intError)
      return NextResponse.json({ error: intError.message }, { status: 500 })
    }

    if (!integrations || integrations.length === 0) {
      return NextResponse.json(
        { error: 'No campaign integrations configured for this client' },
        { status: 404 }
      )
    }

    const results: Record<string, any>[] = []

    // Group integrations by platform
    const heyreachCampaigns = integrations.filter(i => i.platform === 'heyreach')
    const instantlyCampaigns = integrations.filter(i => i.platform === 'instantly')

    // Fetch HeyReach stats
    if (heyreachCampaigns.length > 0) {
      try {
        const campaignIds = heyreachCampaigns.map(c => Number(c.external_campaign_id))
        // Fetch stats for each campaign individually so we get per-campaign breakdown
        for (const campaign of heyreachCampaigns) {
          const cid = Number(campaign.external_campaign_id)
          const stats = await getOverallStats([cid])
          const overall = stats.overallStats

          const row = {
            client_id: clientId,
            platform: 'heyreach',
            campaign_id: campaign.external_campaign_id,
            campaign_name: campaign.campaign_name,
            snapshot_date: today,
            sent: overall.connectionsSent,
            opened: overall.profileViews,
            replied: overall.totalMessageReplies,
            bounced: 0,
            meetings: 0,
            raw_data: {
              connectionsSent: overall.connectionsSent,
              connectionsAccepted: overall.connectionsAccepted,
              connectionAcceptanceRate: overall.connectionAcceptanceRate,
              profileViews: overall.profileViews,
              messagesSent: overall.messagesSent,
              totalMessageReplies: overall.totalMessageReplies,
              messageReplyRate: overall.messageReplyRate,
              inmailMessagesSent: overall.inmailMessagesSent,
              totalInmailReplies: overall.totalInmailReplies,
            },
          }

          // Upsert — unique on (platform, campaign_id, snapshot_date)
          const { data, error } = await supabase
            .from('campaign_stats')
            .upsert(row, { onConflict: 'platform,campaign_id,snapshot_date' })
            .select()

          if (error) {
            console.error(`[Sync API] HeyReach upsert error for ${cid}:`, error)
          } else {
            results.push({ platform: 'heyreach', campaign_id: cid, ...overall })
          }
        }
      } catch (err) {
        console.error('[Sync API] HeyReach fetch error:', err)
        results.push({ platform: 'heyreach', error: String(err) })
      }
    }

    // Fetch Instantly stats
    if (instantlyCampaigns.length > 0) {
      try {
        for (const campaign of instantlyCampaigns) {
          const analytics = await getCampaignAnalytics(campaign.external_campaign_id)
          const stats = analytics[0]
          if (!stats) continue

          const row = {
            client_id: clientId,
            platform: 'instantly',
            campaign_id: campaign.external_campaign_id,
            campaign_name: campaign.campaign_name || stats.campaign_name,
            snapshot_date: today,
            sent: stats.emails_sent_count || 0,
            opened: stats.open_count || 0,
            replied: stats.reply_count || 0,
            bounced: stats.bounced_count || 0,
            meetings: stats.total_opportunities || 0,
            raw_data: stats,
          }

          const { data, error } = await supabase
            .from('campaign_stats')
            .upsert(row, { onConflict: 'platform,campaign_id,snapshot_date' })
            .select()

          if (error) {
            console.error(`[Sync API] Instantly upsert error:`, error)
          } else {
            results.push({ platform: 'instantly', campaignId: campaign.external_campaign_id, ...stats })
          }
        }
      } catch (err) {
        console.error('[Sync API] Instantly fetch error:', err)
        results.push({ platform: 'instantly', error: String(err) })
      }
    }

    return NextResponse.json({
      synced_at: new Date().toISOString(),
      snapshot_date: today,
      campaigns_synced: results.length,
      results,
    })
  } catch (error) {
    console.error('[Sync API] Error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
