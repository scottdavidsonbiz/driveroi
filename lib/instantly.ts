const INSTANTLY_BASE_URL = 'https://api.instantly.ai/api/v2'

function getApiKey(): string {
  const key = process.env.INSTANTLY_API_KEY
  if (!key) throw new Error('INSTANTLY_API_KEY not set')
  return key
}

export interface InstantlyCampaignAnalytics {
  campaign_id: string
  campaign_name: string
  campaign_status: number
  leads_count: number
  contacted_count: number
  emails_sent_count: number
  new_leads_contacted_count: number
  open_count: number
  reply_count: number
  bounced_count: number
  unsubscribed_count: number
  completed_count: number
  total_opportunities: number
  total_opportunity_value: number
  reply_count_unique: number
  link_click_count: number
}

export async function getCampaignAnalytics(
  campaignId?: string
): Promise<InstantlyCampaignAnalytics[]> {
  const params = new URLSearchParams()
  if (campaignId) params.set('id', campaignId)

  const res = await fetch(
    `${INSTANTLY_BASE_URL}/campaigns/analytics?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
      },
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Instantly API error ${res.status}: ${text}`)
  }

  const data = await res.json()
  // API returns an array or a single-item array depending on whether id was provided
  return Array.isArray(data) ? data : [data]
}

export interface InstantlyCampaign {
  id: string
  name: string
  status: number // 0=draft, 1=active, 2=paused, 3=completed
}

export async function listCampaigns(
  limit = 100
): Promise<InstantlyCampaign[]> {
  const res = await fetch(
    `${INSTANTLY_BASE_URL}/campaigns?limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
      },
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Instantly API error ${res.status}: ${text}`)
  }

  return res.json()
}

// --- Sending Account & Deliverability ---

export interface InstantlyAccount {
  email: string
  warmup_status: number // 0=disabled, 1=active
  stat_warmup_score: number | null
  provider_code: number | null
}

export async function listAccounts(limit = 100): Promise<InstantlyAccount[]> {
  const allAccounts: InstantlyAccount[] = []
  let skip = 0

  while (true) {
    const params = new URLSearchParams({ limit: String(limit), skip: String(skip) })
    const res = await fetch(`${INSTANTLY_BASE_URL}/accounts?${params}`, {
      headers: { Authorization: `Bearer ${getApiKey()}` },
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Instantly API error ${res.status}: ${text}`)
    }
    const batch = await res.json()
    const items: InstantlyAccount[] = Array.isArray(batch) ? batch : batch.items ?? []
    if (items.length === 0) break
    allAccounts.push(...items)
    if (items.length < limit) break
    skip += items.length
  }

  return allAccounts
}

export interface AccountDailyRow {
  date: string
  email_account: string
  sent: number
  bounced: number
}

/** Returns per-email aggregate { sent, bounced } summed across all days in range */
export async function getAccountAnalyticsDaily(
  startDate: string,
  endDate: string,
  emails?: string[]
): Promise<Record<string, { sent: number; bounced: number }>> {
  const params = new URLSearchParams({ start_date: startDate, end_date: endDate })
  if (emails?.length) params.set('emails', emails.join(','))

  const res = await fetch(`${INSTANTLY_BASE_URL}/accounts/analytics/daily?${params}`, {
    headers: { Authorization: `Bearer ${getApiKey()}` },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Instantly API error ${res.status}: ${text}`)
  }

  const rows: AccountDailyRow[] = await res.json()

  // Aggregate daily rows by email_account
  const aggregated: Record<string, { sent: number; bounced: number }> = {}
  for (const row of rows) {
    const key = row.email_account
    if (!aggregated[key]) aggregated[key] = { sent: 0, bounced: 0 }
    aggregated[key].sent += row.sent ?? 0
    aggregated[key].bounced += row.bounced ?? 0
  }
  return aggregated
}

export interface WarmupAnalytics {
  aggregate_data: Record<string, {
    sent: number
    received: number
    landed_inbox: number
    health_score: number
    health_score_label: string
  }>
}

export async function getWarmupAnalytics(emails: string[]): Promise<WarmupAnalytics> {
  const res = await fetch(`${INSTANTLY_BASE_URL}/accounts/warmup-analytics`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ emails }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Instantly API error ${res.status}: ${text}`)
  }
  return res.json()
}

// --- Campaign Creation ---

/** Convert plain text body to HTML paragraphs (Instantly strips non-HTML) */
export function textToHtml(body: string): string {
  return body
    .split(/\n\n+/)
    .map(paragraph => paragraph.trim())
    .filter(p => p.length > 0)
    .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('\n')
}

export interface EmailVariant {
  subject: string
  body: string
}

export interface SequenceStep {
  type: 'email'
  delay?: number
  variants: EmailVariant[]
}

export interface CampaignSequence {
  steps: SequenceStep[]
}

export interface CreateCampaignPayload {
  name: string
  sequences: CampaignSequence[]
  schedule?: {
    schedules: {
      timezone: string
      days: Record<string, number>
      from: string
      to: string
    }[]
  }
  campaign_settings?: {
    email_gap?: number
    daily_limit?: number
    stop_on_reply?: boolean
    end_date?: string
  }
}

export interface CreateCampaignResult {
  id: string
  name: string
  status: number
}

const DEFAULT_SCHEDULE = {
  schedules: [{
    timezone: 'America/Chicago',
    days: { '1': 1, '2': 1, '3': 1, '4': 1, '5': 1 },
    from: '09:00',
    to: '17:00',
  }],
}

const DEFAULT_SETTINGS = {
  email_gap: 10,
  daily_limit: 50,
  stop_on_reply: true,
  end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = 1
): Promise<Response> {
  const res = await fetch(url, init)
  if (res.status === 429 && retries > 0) {
    await new Promise(resolve => setTimeout(resolve, 30_000))
    return fetchWithRetry(url, init, retries - 1)
  }
  return res
}

export async function createCampaign(
  payload: CreateCampaignPayload
): Promise<CreateCampaignResult> {
  const body = {
    name: payload.name,
    sequences: payload.sequences,
    schedule: payload.schedule ?? DEFAULT_SCHEDULE,
    campaign_settings: {
      ...DEFAULT_SETTINGS,
      ...payload.campaign_settings,
    },
  }

  const res = await fetchWithRetry(
    `${INSTANTLY_BASE_URL}/campaigns`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Instantly create campaign error ${res.status}: ${text}`)
  }

  return res.json()
}

export async function updateCampaignSequences(
  campaignId: string,
  sequences: CampaignSequence[]
): Promise<void> {
  const res = await fetchWithRetry(
    `${INSTANTLY_BASE_URL}/campaigns/${campaignId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sequences }),
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Instantly update sequences error ${res.status}: ${text}`)
  }
}
