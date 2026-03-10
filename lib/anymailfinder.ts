const ANYMAILFINDER_BASE_URL = 'https://api.anymailfinder.com/v5.1'

function getApiKey(): string {
  const key = process.env.ANYMAILFINDER_API_KEY
  if (!key) throw new Error('ANYMAILFINDER_API_KEY not set')
  return key
}

async function apiPost<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${ANYMAILFINDER_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Anymailfinder ${endpoint} error ${res.status}: ${text}`)
  }
  return res.json()
}

// --- Email Verification ---

export interface VerifyResult {
  email: string
  email_status: 'valid' | 'invalid' | 'unknown' | 'not_found'
  valid_email: string | null
}

export async function verifyEmail(email: string): Promise<VerifyResult> {
  return apiPost<VerifyResult>('/verify-email', { email })
}

// --- Decision Maker Search (2 credits) ---

export interface DecisionMakerResult {
  email: string | null
  email_status: string
  person_full_name: string | null
  person_job_title: string | null
  person_linkedin_url: string | null
  valid_email: string | null
  decision_maker_category: string | null
}

// AMF v5.1 valid categories: ceo, engineering, finance, hr, it, logistics, marketing, operations, buyer, sales
const DEFAULT_DM_CATEGORIES = ['marketing', 'ceo', 'sales']

export async function findDecisionMaker(
  domain: string,
  categories: string[] = DEFAULT_DM_CATEGORIES
): Promise<DecisionMakerResult> {
  return apiPost<DecisionMakerResult>('/find-email/decision-maker', {
    domain,
    decision_maker_category: categories,
  })
}

// --- Person Email Search (1 credit, only charged if found) ---

export interface PersonEmailResult {
  email: string | null
  email_status: string
  valid_email: string | null
  person_full_name: string | null
  person_job_title: string | null
  person_linkedin_url: string | null
}

export async function findPersonEmail(opts: {
  first_name: string
  last_name: string
  domain: string
  company_name?: string
}): Promise<PersonEmailResult> {
  return apiPost<PersonEmailResult>('/find-email/person', opts)
}

/** Batch find emails for a list of people. Returns results with email attached. */
export async function batchFindPersonEmails(
  people: { first_name: string; last_name: string; domain: string; company_name?: string; title?: string; linkedin_url?: string }[]
): Promise<(typeof people[number] & { email: string | null; email_status: string })[]> {
  const results: (typeof people[number] & { email: string | null; email_status: string })[] = []
  for (let i = 0; i < people.length; i++) {
    const person = people[i]
    try {
      const res = await findPersonEmail({
        first_name: person.first_name,
        last_name: person.last_name,
        domain: person.domain,
        company_name: person.company_name,
      })
      results.push({ ...person, email: res.valid_email || res.email, email_status: res.email_status })
      const found = res.valid_email ? 'FOUND' : res.email_status
      console.log(`  [${i + 1}/${people.length}] ${person.first_name} ${person.last_name} @ ${person.domain}: ${found} ${res.valid_email || ''}`)
    } catch (err: any) {
      console.error(`  [${i + 1}/${people.length}] ${person.first_name} ${person.last_name} @ ${person.domain}: ERROR ${err.message}`)
      results.push({ ...person, email: null, email_status: 'error' })
    }
    await delay(DELAY_MS)
  }
  return results
}

// --- Company Email Search (1 credit, up to 20 results) ---

export interface CompanyEmailsResult {
  email_status: string
  emails: string[]
  valid_emails: string[]
}

export async function findCompanyEmails(domain: string): Promise<CompanyEmailsResult> {
  return apiPost<CompanyEmailsResult>('/find-email/company', { domain })
}

// --- Batch helpers ---

const DELAY_MS = 500

async function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

export interface ContactRecord {
  email: string
  first_name: string
  last_name: string
  company_name: string
  domain: string
  title: string
  status?: 'valid' | 'invalid' | 'unknown' | 'not_found'
}

/** Verify an array of contacts, returning them with status attached */
export async function batchVerify(contacts: ContactRecord[]): Promise<ContactRecord[]> {
  const results: ContactRecord[] = []
  for (const contact of contacts) {
    try {
      const res = await verifyEmail(contact.email)
      results.push({ ...contact, status: res.email_status as ContactRecord['status'] })
    } catch (err: any) {
      console.error(`  Verify failed for ${contact.email}: ${err.message}`)
      results.push({ ...contact, status: 'unknown' })
    }
    await delay(DELAY_MS)
  }
  return results
}

export interface DomainDiscoveryResult {
  domain: string
  decision_maker: DecisionMakerResult | null
  company_emails: string[]
}

/** For a list of domains, find decision-maker + all company emails */
export async function batchDiscover(domains: string[]): Promise<DomainDiscoveryResult[]> {
  const results: DomainDiscoveryResult[] = []
  for (const domain of domains) {
    let dm: DecisionMakerResult | null = null
    let companyEmails: string[] = []

    try {
      dm = await findDecisionMaker(domain)
    } catch (err: any) {
      console.error(`  Decision-maker failed for ${domain}: ${err.message}`)
    }
    await delay(DELAY_MS)

    try {
      const res = await findCompanyEmails(domain)
      companyEmails = res.valid_emails || []
    } catch (err: any) {
      console.error(`  Company emails failed for ${domain}: ${err.message}`)
    }
    await delay(DELAY_MS)

    results.push({ domain, decision_maker: dm, company_emails: companyEmails })
  }
  return results
}
