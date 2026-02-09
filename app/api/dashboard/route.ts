import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getOverallStats } from '@/lib/heyreach'
import { getCampaignAnalytics } from '@/lib/instantly'

export async function GET() {
  try {
    // 1. Get all clients with status = 'client', joined with their integrations
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select(`
        *,
        client_integrations (*)
      `)
      .eq('status', 'client')

    if (clientsError) {
      console.error('[Dashboard API] Error fetching clients:', clientsError)
      return NextResponse.json({ error: clientsError.message }, { status: 500 })
    }

    // Aggregate totals
    let totalLeadsContacted = 0
    let totalEmailsSent = 0
    let totalReplies = 0
    let totalMeetings = 0
    let totalConnectionsSent = 0
    let totalConnectionsAccepted = 0
    let totalOpened = 0

    const clientSummaries: {
      id: string
      name: string
      industry: string | null
      status: string
      campaignCount: number
      totalSent: number
      totalReplies: number
      meetings: number
    }[] = []

    // 2. For each client, fetch live stats from their integrations
    for (const client of clients || []) {
      const integrations = client.client_integrations || []
      const activeIntegrations = integrations.filter((i: any) => i.active)

      const heyreachCampaigns = activeIntegrations.filter((i: any) => i.platform === 'heyreach')
      const instantlyCampaigns = activeIntegrations.filter((i: any) => i.platform === 'instantly')

      let clientSent = 0
      let clientReplies = 0
      let clientMeetings = 0

      // HeyReach stats
      if (heyreachCampaigns.length > 0) {
        try {
          const campaignIds = heyreachCampaigns.map((c: any) => Number(c.external_campaign_id))
          const stats = await getOverallStats(campaignIds)
          const overall = stats.overallStats

          totalConnectionsSent += overall.connectionsSent || 0
          totalConnectionsAccepted += overall.connectionsAccepted || 0
          totalLeadsContacted += overall.connectionsSent || 0
          totalReplies += overall.totalMessageReplies || 0

          clientSent += overall.connectionsSent || 0
          clientReplies += overall.totalMessageReplies || 0
        } catch (err) {
          console.error(`[Dashboard API] HeyReach error for ${client.name}:`, err)
        }
      }

      // Instantly stats
      if (instantlyCampaigns.length > 0) {
        try {
          for (const campaign of instantlyCampaigns) {
            const analytics = await getCampaignAnalytics(campaign.external_campaign_id)
            const stats = analytics[0]
            if (!stats) continue

            totalLeadsContacted += stats.new_leads_contacted_count || 0
            totalEmailsSent += stats.emails_sent_count || 0
            totalReplies += stats.reply_count || 0
            totalMeetings += stats.total_opportunities || 0
            totalOpened += stats.open_count || 0

            clientSent += stats.emails_sent_count || 0
            clientReplies += stats.reply_count || 0
            clientMeetings += stats.total_opportunities || 0
          }
        } catch (err) {
          console.error(`[Dashboard API] Instantly error for ${client.name}:`, err)
        }
      }

      clientSummaries.push({
        id: client.id,
        name: client.name,
        industry: client.industry,
        status: client.status,
        campaignCount: activeIntegrations.length,
        totalSent: clientSent,
        totalReplies: clientReplies,
        meetings: clientMeetings,
      })
    }

    const stats = {
      activeClients: clients?.length || 0,
      totalLeadsContacted,
      totalEmailsSent,
      totalReplies,
      totalMeetings,
      totalConnectionsSent,
      totalConnectionsAccepted,
      totalOpened,
    }

    return NextResponse.json({ stats, clients: clientSummaries })
  } catch (error) {
    console.error('[Dashboard API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
