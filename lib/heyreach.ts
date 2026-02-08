const HEYREACH_REST_URL = 'https://api.heyreach.io/api/public'
const HEYREACH_MCP_URL = 'https://mcp.heyreach.io/mcp'

// MCP key for the hosted HeyReach MCP server (stats endpoint)
const MCP_KEY = 'alqfSjwiqBj3h6ZRot14IkkIr1ISIRk3NRawTfln3tA='

function getApiKey(): string {
  const key = process.env.HEYREACH_API_KEY
  if (!key) throw new Error('HEYREACH_API_KEY not set')
  return key
}

export interface HeyReachDayStats {
  profileViews: number
  postLikes: number
  follows: number
  messagesSent: number
  totalMessageStarted: number
  totalMessageReplies: number
  inmailMessagesSent: number
  totalInmailStarted: number
  totalInmailReplies: number
  connectionsSent: number
  connectionsAccepted: number
  messageReplyRate: number
  inMailReplyRate: number
  connectionAcceptanceRate: number
}

export interface HeyReachStatsResponse {
  byDayStats: Record<string, HeyReachDayStats>
  overallStats: HeyReachDayStats
}

/**
 * Get overall stats via HeyReach's hosted MCP server.
 * The REST API doesn't expose a stats endpoint, but the MCP server does.
 */
export async function getOverallStats(
  campaignIds: number[],
  startDate?: string,
  endDate?: string
): Promise<HeyReachStatsResponse> {
  const args: Record<string, any> = {
    campaignIds,
    accountIds: [],
  }
  if (startDate) args.startDate = startDate
  if (endDate) args.endDate = endDate

  const mcpUrl = `${HEYREACH_MCP_URL}?xMcpKey=${encodeURIComponent(MCP_KEY)}`

  const res = await fetch(mcpUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'get_overall_stats',
        arguments: args,
      },
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HeyReach MCP error ${res.status}: ${text}`)
  }

  // Response is SSE format: "event: message\ndata: {...}\n\n"
  const raw = await res.text()
  const dataLine = raw.split('\n').find(line => line.startsWith('data: '))
  if (!dataLine) {
    throw new Error('HeyReach MCP: no data in response')
  }

  const envelope = JSON.parse(dataLine.slice(6)) // strip "data: "
  const content = envelope.result?.content?.[0]?.text
  if (!content) {
    throw new Error('HeyReach MCP: empty result')
  }

  return JSON.parse(content)
}

export interface HeyReachCampaign {
  id: number
  name: string
  status: string
  progressStats: {
    totalUsers: number
    totalUsersInProgress: number
    totalUsersPending: number
    totalUsersFinished: number
    totalUsersFailed: number
  }
}

export async function getCampaign(campaignId: number): Promise<HeyReachCampaign> {
  const res = await fetch(
    `${HEYREACH_REST_URL}/campaign/GetById?campaignId=${campaignId}`,
    {
      headers: {
        'X-API-KEY': getApiKey(),
      },
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HeyReach API error ${res.status}: ${text}`)
  }

  return res.json()
}
