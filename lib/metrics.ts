export function buildMetricsSnapshot(stats: any[]) {
  const heyreachStats = stats.filter(s => s.platform === 'heyreach')
  const instantlyStats = stats.filter(s => s.platform === 'instantly')

  const heyreach = {
    campaigns: heyreachStats.map(s => ({
      campaign_id: s.campaign_id,
      campaign_name: s.campaign_name,
      connectionsSent: s.raw_data?.connectionsSent || s.sent || 0,
      connectionsAccepted: s.raw_data?.connectionsAccepted || 0,
      connectionAcceptanceRate: s.raw_data?.connectionAcceptanceRate || 0,
      profileViews: s.raw_data?.profileViews || s.opened || 0,
      messagesSent: s.raw_data?.messagesSent || 0,
      messageReplies: s.raw_data?.totalMessageReplies || s.replied || 0,
    })),
    totals: {
      connectionsSent: heyreachStats.reduce((sum, s) => sum + (s.raw_data?.connectionsSent || s.sent || 0), 0),
      connectionsAccepted: heyreachStats.reduce((sum, s) => sum + (s.raw_data?.connectionsAccepted || 0), 0),
      profileViews: heyreachStats.reduce((sum, s) => sum + (s.raw_data?.profileViews || s.opened || 0), 0),
      messagesSent: heyreachStats.reduce((sum, s) => sum + (s.raw_data?.messagesSent || 0), 0),
      messageReplies: heyreachStats.reduce((sum, s) => sum + (s.raw_data?.totalMessageReplies || s.replied || 0), 0),
    },
  }

  const instantly = {
    campaigns: instantlyStats.map(s => ({
      campaign_id: s.campaign_id,
      campaign_name: s.campaign_name,
      emailsSent: s.sent || 0,
      replied: s.replied || 0,
      bounced: s.bounced || 0,
      meetings: s.meetings || 0,
    })),
    totals: {
      emailsSent: instantlyStats.reduce((sum, s) => sum + (s.sent || 0), 0),
      replied: instantlyStats.reduce((sum, s) => sum + (s.replied || 0), 0),
      bounced: instantlyStats.reduce((sum, s) => sum + (s.bounced || 0), 0),
      meetings: instantlyStats.reduce((sum, s) => sum + (s.meetings || 0), 0),
    },
  }

  return {
    heyreach,
    instantly,
    totals: {
      leadsContacted: heyreach.totals.connectionsSent + instantly.totals.emailsSent,
      connectionsSent: heyreach.totals.connectionsSent,
      connectionsAccepted: heyreach.totals.connectionsAccepted,
      emailsSent: instantly.totals.emailsSent,
      totalReplies: heyreach.totals.messageReplies + instantly.totals.replied,
      meetings: instantly.totals.meetings,
    },
    snapshot_date: new Date().toISOString().split('T')[0],
  }
}
