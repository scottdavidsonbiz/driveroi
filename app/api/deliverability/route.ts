import { NextRequest, NextResponse } from 'next/server'
import {
  listAccounts,
  getAccountAnalyticsDaily,
  getWarmupAnalytics,
} from '@/lib/instantly'

interface AccountDetail {
  email: string
  domain: string
  warmup_status: string
  sent: number
  bounced: number
  bounce_rate: number
  warmup_health_score: number | null
  warmup_sent: number
  warmup_inbox: number
}

interface DomainSummary {
  domain: string
  account_count: number
  total_sent: number
  total_bounced: number
  bounce_rate: number
  avg_warmup_health: number | null
  accounts: AccountDetail[]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const startDate = searchParams.get('start_date') ?? thirtyDaysAgo.toISOString().split('T')[0]
    const endDate = searchParams.get('end_date') ?? now.toISOString().split('T')[0]

    // 1. Fetch all sending accounts
    const accounts = await listAccounts()
    const emails = accounts.map((a) => a.email)

    if (emails.length === 0) {
      return NextResponse.json({
        domains: [],
        date_range: { start_date: startDate, end_date: endDate },
        total_accounts: 0,
        total_domains: 0,
      })
    }

    // 2. Fetch analytics + warmup in parallel
    const [dailyAnalytics, warmupAnalytics] = await Promise.all([
      getAccountAnalyticsDaily(startDate, endDate, emails),
      getWarmupAnalytics(emails),
    ])

    // 3. Build per-account detail objects grouped by domain
    const domainMap = new Map<string, AccountDetail[]>()

    for (const account of accounts) {
      const email = account.email
      const domain = email.split('@')[1] ?? 'unknown'

      const daily = dailyAnalytics[email]
      const warmup = warmupAnalytics.aggregate_data?.[email]

      const sent = daily?.sent ?? 0
      const bounced = daily?.bounced ?? 0

      // warmup_status: 0=disabled, 1=active
      const warmupLabel = account.warmup_status === 1 ? 'Active' : account.warmup_status === 0 ? 'Disabled' : String(account.warmup_status)

      const detail: AccountDetail = {
        email,
        domain,
        warmup_status: warmupLabel,
        sent,
        bounced,
        bounce_rate: sent > 0 ? bounced / sent : 0,
        warmup_health_score: warmup?.health_score ?? account.stat_warmup_score ?? null,
        warmup_sent: warmup?.sent ?? 0,
        warmup_inbox: warmup?.landed_inbox ?? 0,
      }

      const existing = domainMap.get(domain) ?? []
      existing.push(detail)
      domainMap.set(domain, existing)
    }

    // 4. Aggregate into domain summaries
    const domains: DomainSummary[] = []
    const domainKeys = Array.from(domainMap.keys())

    for (const domain of domainKeys) {
      const accountDetails = domainMap.get(domain)!
      const totalSent = accountDetails.reduce((s: number, a: AccountDetail) => s + a.sent, 0)
      const totalBounced = accountDetails.reduce((s: number, a: AccountDetail) => s + a.bounced, 0)

      const healthScores = accountDetails
        .map((a: AccountDetail) => a.warmup_health_score)
        .filter((h: number | null): h is number => h !== null)

      domains.push({
        domain,
        account_count: accountDetails.length,
        total_sent: totalSent,
        total_bounced: totalBounced,
        bounce_rate: totalSent > 0 ? totalBounced / totalSent : 0,
        avg_warmup_health:
          healthScores.length > 0
            ? Math.round(healthScores.reduce((s: number, h: number) => s + h, 0) / healthScores.length)
            : null,
        accounts: accountDetails.sort((a: AccountDetail, b: AccountDetail) => b.sent - a.sent),
      })
    }

    // Sort by total send volume descending
    domains.sort((a, b) => b.total_sent - a.total_sent)

    return NextResponse.json({
      domains,
      date_range: { start_date: startDate, end_date: endDate },
      total_accounts: accounts.length,
      total_domains: domains.length,
    })
  } catch (error) {
    console.error('Deliverability API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch deliverability data' },
      { status: 500 }
    )
  }
}
