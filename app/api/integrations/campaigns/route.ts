import { NextRequest, NextResponse } from 'next/server'

const HEYREACH_REST_URL = 'https://api.heyreach.io/api/public'

// List available campaigns from HeyReach or Instantly for mapping
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const platform = url.searchParams.get('platform')

  if (!platform || !['heyreach', 'instantly'].includes(platform)) {
    return NextResponse.json({ error: 'platform must be heyreach or instantly' }, { status: 400 })
  }

  try {
    if (platform === 'heyreach') {
      const apiKey = process.env.HEYREACH_API_KEY
      if (!apiKey) return NextResponse.json({ error: 'HEYREACH_API_KEY not set' }, { status: 500 })

      const res = await fetch(`${HEYREACH_REST_URL}/campaign/GetAll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
        },
        body: JSON.stringify({ offset: 0, limit: 100, statuses: [], accountIds: [] }),
      })

      if (!res.ok) throw new Error(`HeyReach API error: ${res.status}`)

      const data = await res.json()
      const campaigns = data.items.map((c: any) => ({
        id: String(c.id),
        name: c.name,
        status: c.status,
      }))

      return NextResponse.json({ campaigns })
    }

    if (platform === 'instantly') {
      const apiKey = process.env.INSTANTLY_API_KEY
      if (!apiKey) return NextResponse.json({ error: 'INSTANTLY_API_KEY not set' }, { status: 500 })

      const res = await fetch(`https://api.instantly.ai/api/v2/campaigns?limit=100`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      })

      if (!res.ok) throw new Error(`Instantly API error: ${res.status}`)

      const data = await res.json()
      const statusMap: Record<number, string> = {
        [-2]: 'DELETED', [-1]: 'ERROR', 0: 'DRAFT', 1: 'ACTIVE', 2: 'PAUSED', 3: 'COMPLETED',
      }
      const campaigns = data.items.map((c: any) => ({
        id: c.id,
        name: c.name,
        status: statusMap[c.status] || String(c.status),
      }))

      return NextResponse.json({ campaigns })
    }
  } catch (error) {
    console.error('[Integrations API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
  }
}
