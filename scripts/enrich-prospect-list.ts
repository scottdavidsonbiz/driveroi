/**
 * Enrich a prospect ICP list with decision-maker contacts and emails.
 *
 * Pipeline:
 *   1. Read account CSV (domain, company_name, city, state, linkedin_company_url)
 *   2. DiscoLike search-contacts: find people by title/seniority at each domain
 *   3. Anymailfinder fallback: for domains where DiscoLike found no email
 *   4. Output enriched CSV compatible with generate-deliverable.py
 *
 * Usage:
 *   npx tsx scripts/enrich-prospect-list.ts \
 *     --csv data/fancyai-icp-list.csv \
 *     --titles "VP Marketing,Head of SEO,Head of Growth,CMO,Director of Marketing" \
 *     --prospect "FancyAI" \
 *     --output data/fancyai-enriched.csv
 *
 * Options:
 *   --csv        Input CSV with account list (required)
 *   --titles     Comma-separated title keywords to search for (default: marketing,growth,seo)
 *   --seniority  Comma-separated seniority levels (default: executive,vp,director)
 *   --prospect   Prospect name for output metadata (required)
 *   --output     Output CSV path (default: data/{prospect-slug}-enriched.csv)
 *   --min        Minimum accounts with contacts required (default: 25)
 *   --skip-amf   Skip Anymailfinder fallback (DiscoLike only)
 *   --dry-run    Show what would be searched without making API calls
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { parseArgs } from 'util'

// ── Load .env ────────────────────────────────────────────────────────────────
const envPath = resolve(__dirname, '..', '.env')
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx)
    const val = trimmed.slice(eqIdx + 1)
    if (!process.env[key]) process.env[key] = val
  }
}

// ── Imports (after env loaded) ───────────────────────────────────────────────
import { findDecisionMaker, findPersonEmail } from '../lib/anymailfinder'

// ── DiscoLike API client ─────────────────────────────────────────────────────
const DISCOLIKE_BASE = 'https://api.discolike.com/api/v1'

function getDiscoLikeKey(): string {
  // DiscoLike MCP uses OAuth, but we need the API key for direct calls.
  // Check common env var names
  const key = process.env.DISCOLIKE_API_KEY || process.env.DISCOLIKE_TOKEN
  if (!key) {
    console.warn('⚠ DISCOLIKE_API_KEY not set — will use Anymailfinder only')
    return ''
  }
  return key
}

interface DiscoLikeContact {
  name: string
  title: string
  domain: string
  email: string | null
  email_validated: boolean
  social_urls: string[]
  company_name: string
}

async function searchContactsDiscoLike(
  domains: string[],
  titleKeywords: string[],
  seniorityLevels: string[],
  resultsPerCompany: number = 1
): Promise<DiscoLikeContact[]> {
  const key = getDiscoLikeKey()
  if (!key) return []

  // DiscoLike search-contacts accepts up to 10 domains at a time
  const allContacts: DiscoLikeContact[] = []
  const batchSize = 10

  for (let i = 0; i < domains.length; i += batchSize) {
    const batch = domains.slice(i, i + batchSize)
    const batchNum = Math.floor(i / batchSize) + 1
    const totalBatches = Math.ceil(domains.length / batchSize)
    console.log(`  DiscoLike batch ${batchNum}/${totalBatches}: ${batch.join(', ')}`)

    try {
      const res = await fetch(`${DISCOLIKE_BASE}/search-contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: {
            domain: batch,
            title: titleKeywords,
            seniority: seniorityLevels,
            has_email: true,
            max_records: batch.length * resultsPerCompany * 2, // overfetch to ensure coverage
            results_by_company: resultsPerCompany,
          },
          fields: ['name', 'title', 'domain', 'email', 'email_validated', 'social_urls', 'company_name'],
          format: 'rows',
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        console.error(`    DiscoLike error ${res.status}: ${text.substring(0, 200)}`)
        continue
      }

      const data = await res.json() as { contacts: DiscoLikeContact[]; count: number }
      console.log(`    Found ${data.count} contacts`)
      allContacts.push(...data.contacts)
    } catch (err: any) {
      console.error(`    DiscoLike request failed: ${err.message}`)
    }

    // Rate limit
    await delay(500)
  }

  return allContacts
}

// ── CSV parsing ──────────────────────────────────────────────────────────────
interface AccountRow {
  domain: string
  company_name: string
  city: string
  state: string
  linkedin_company_url: string
}

function parseInputCSV(path: string): AccountRow[] {
  const content = readFileSync(path, 'utf-8')
  const lines = content.trim().split('\n')
  const header = lines[0].split(',').map(h => h.trim().toLowerCase())

  const domainIdx = header.indexOf('domain')
  const nameIdx = header.findIndex(h => h.includes('company') || h.includes('club'))
  const cityIdx = header.indexOf('city')
  const stateIdx = header.indexOf('state')
  const liIdx = header.findIndex(h => h.includes('linkedin'))

  if (domainIdx === -1) throw new Error('CSV must have a "domain" column')

  return lines.slice(1).filter(l => l.trim()).map(line => {
    // Handle quoted fields
    const fields = parseCSVLine(line)
    return {
      domain: fields[domainIdx]?.trim() || '',
      company_name: (nameIdx >= 0 ? fields[nameIdx]?.trim() : '') || '',
      city: (cityIdx >= 0 ? fields[cityIdx]?.trim() : '') || '',
      state: (stateIdx >= 0 ? fields[stateIdx]?.trim() : '') || '',
      linkedin_company_url: (liIdx >= 0 ? fields[liIdx]?.trim() : '') || '',
    }
  }).filter(r => r.domain)
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      fields.push(current)
      current = ''
    } else {
      current += char
    }
  }
  fields.push(current)
  return fields
}

// ── Output CSV (generate-deliverable.py format) ──────────────────────────────
interface EnrichedContact {
  club_name: string
  domain: string
  first_name: string
  last_name: string
  full_name: string
  job_title: string
  location: string
  linkedin_profile: string
  valid_email: string
  source: string // 'discolike' | 'anymailfinder'
}

function writeOutputCSV(contacts: EnrichedContact[], path: string): void {
  const header = 'Club Name,Domain,First Name,Last Name,Full Name,Job Title,Location,LinkedIn Profile,Valid Email'
  const rows = contacts.map(c => {
    return [
      csvEscape(c.club_name),
      csvEscape(c.domain),
      csvEscape(c.first_name),
      csvEscape(c.last_name),
      csvEscape(c.full_name),
      csvEscape(c.job_title),
      csvEscape(c.location),
      csvEscape(c.linkedin_profile),
      csvEscape(c.valid_email),
    ].join(',')
  })
  writeFileSync(path, [header, ...rows].join('\n') + '\n')
}

function csvEscape(val: string): string {
  if (!val) return ''
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`
  }
  return val
}

// ── Name parsing ─────────────────────────────────────────────────────────────
function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 0) return { first: '', last: '' }
  if (parts.length === 1) return { first: parts[0], last: '' }
  return { first: parts[0], last: parts.slice(1).join(' ') }
}

function extractLinkedInUrl(socialUrls: string[]): string {
  if (!socialUrls || !Array.isArray(socialUrls)) return ''
  return socialUrls.find(u => u && u.includes('linkedin.com/in/')) || ''
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const { values } = parseArgs({
    options: {
      csv: { type: 'string' },
      titles: { type: 'string', default: 'marketing,growth,seo,digital,brand' },
      seniority: { type: 'string', default: 'executive,vp,director' },
      prospect: { type: 'string' },
      output: { type: 'string' },
      min: { type: 'string', default: '25' },
      'skip-amf': { type: 'boolean', default: false },
      'dry-run': { type: 'boolean', default: false },
    },
  })

  if (!values.csv || !values.prospect) {
    console.error('Usage: npx tsx scripts/enrich-prospect-list.ts --csv <path> --prospect <name>')
    console.error('       [--titles "marketing,growth"] [--seniority "executive,vp,director"]')
    console.error('       [--output <path>] [--min 25] [--skip-amf] [--dry-run]')
    process.exit(1)
  }

  const csvPath = resolve(values.csv)
  const prospect = values.prospect
  const slug = slugify(prospect)
  const outputPath = values.output ? resolve(values.output) : resolve(__dirname, '..', 'data', `${slug}-enriched.csv`)
  const minAccounts = parseInt(values.min || '25', 10)
  const titleKeywords = (values.titles || '').split(',').map(t => t.trim()).filter(Boolean)
  const seniorityLevels = (values.seniority || '').split(',').map(s => s.trim()).filter(Boolean)
  const skipAmf = values['skip-amf'] || false
  const dryRun = values['dry-run'] || false

  console.log(`\n🔍 Enriching ICP list for: ${prospect}`)
  console.log(`   Input:     ${csvPath}`)
  console.log(`   Output:    ${outputPath}`)
  console.log(`   Titles:    ${titleKeywords.join(', ')}`)
  console.log(`   Seniority: ${seniorityLevels.join(', ')}`)
  console.log(`   Min accts: ${minAccounts}`)
  console.log(`   AMF fallback: ${skipAmf ? 'disabled' : 'enabled'}`)
  console.log()

  // ── Step 1: Read accounts ──────────────────────────────────────────────────
  const accounts = parseInputCSV(csvPath)
  console.log(`📋 Loaded ${accounts.length} accounts from CSV`)

  if (accounts.length < minAccounts) {
    console.error(`❌ Only ${accounts.length} accounts in CSV — need at least ${minAccounts}`)
    process.exit(1)
  }

  if (dryRun) {
    console.log('\n🏃 DRY RUN — would search these domains:')
    accounts.forEach((a, i) => console.log(`  ${i + 1}. ${a.domain} (${a.company_name})`))
    console.log(`\nTitle keywords: ${titleKeywords.join(', ')}`)
    console.log(`Seniority: ${seniorityLevels.join(', ')}`)
    return
  }

  // ── Step 2: DiscoLike contact search ───────────────────────────────────────
  console.log('\n🪩 Step 1: DiscoLike contact search...')
  const allDomains = accounts.map(a => a.domain)
  const discoContacts = await searchContactsDiscoLike(allDomains, titleKeywords, seniorityLevels, 1)

  // Build lookup: domain → best contact
  const contactByDomain = new Map<string, DiscoLikeContact>()
  for (const c of discoContacts) {
    // Keep first (highest relevance) per domain
    if (!contactByDomain.has(c.domain)) {
      contactByDomain.set(c.domain, c)
    }
  }

  const discoHits = contactByDomain.size
  const discoMisses = accounts.filter(a => !contactByDomain.has(a.domain))
  console.log(`   ✅ DiscoLike found contacts at ${discoHits}/${accounts.length} accounts`)
  if (discoMisses.length > 0) {
    console.log(`   ⚠ Missing: ${discoMisses.map(a => a.domain).join(', ')}`)
  }

  // ── Step 3: Anymailfinder fallback for gaps ────────────────────────────────
  if (!skipAmf && discoMisses.length > 0) {
    console.log(`\n📧 Step 2: Anymailfinder fallback for ${discoMisses.length} gaps...`)

    // Try decision-maker search first (finds VPs, C-suite)
    // AMF v5.1 valid categories: ceo, engineering, finance, hr, it, logistics, marketing, operations, buyer, sales
    const amfCategories = ['marketing', 'ceo', 'sales']
    for (const account of discoMisses) {
      try {
        console.log(`   ${account.domain}...`)
        const dm = await findDecisionMaker(account.domain, amfCategories)
        if (dm.valid_email || dm.email) {
          // Convert to DiscoLike-like format and add to lookup
          contactByDomain.set(account.domain, {
            name: dm.person_full_name || '',
            title: dm.person_job_title || dm.decision_maker_category || '',
            domain: account.domain,
            email: dm.valid_email || dm.email,
            email_validated: !!dm.valid_email,
            social_urls: dm.person_linkedin_url ? [dm.person_linkedin_url] : [],
            company_name: account.company_name,
          })
          console.log(`     ✅ ${dm.person_full_name} — ${dm.person_job_title} — ${dm.valid_email || dm.email}`)
        } else {
          console.log(`     ✗ No contact found`)
        }
      } catch (err: any) {
        console.log(`     ✗ Error: ${err.message}`)
      }
      await delay(600)
    }

    const amfFills = contactByDomain.size - discoHits
    console.log(`   ✅ Anymailfinder filled ${amfFills} additional contacts`)
  }

  // ── Step 4: Build output ───────────────────────────────────────────────────
  const enriched: EnrichedContact[] = []
  const noContact: string[] = []

  for (const account of accounts) {
    const contact = contactByDomain.get(account.domain)
    if (!contact || (!contact.email && !contact.name)) {
      noContact.push(account.domain)
      continue
    }

    const { first, last } = splitName(contact.name)
    const linkedIn = extractLinkedInUrl(contact.social_urls)
    const location = [account.city, account.state].filter(Boolean).join(', ')

    enriched.push({
      club_name: account.company_name || contact.company_name || account.domain,
      domain: account.domain,
      first_name: first,
      last_name: last,
      full_name: contact.name,
      job_title: contact.title,
      location,
      linkedin_profile: linkedIn,
      valid_email: contact.email || '',
      source: contact.company_name ? 'discolike' : 'anymailfinder',
    })
  }

  // ── Step 5: Validate & write ───────────────────────────────────────────────
  console.log(`\n📊 Results:`)
  console.log(`   Accounts with contacts: ${enriched.length}/${accounts.length}`)
  console.log(`   No contact found:       ${noContact.length}`)
  if (noContact.length > 0) {
    console.log(`   Missing domains:        ${noContact.join(', ')}`)
  }

  if (enriched.length < minAccounts) {
    console.warn(`\n⚠ Only ${enriched.length} enriched accounts — below minimum of ${minAccounts}`)
    console.warn(`  Consider adding more accounts to the input CSV or broadening title keywords.`)
    console.warn(`  Writing output anyway — review and supplement manually.\n`)
  }

  writeOutputCSV(enriched, outputPath)
  console.log(`\n✅ Wrote ${enriched.length} contacts to ${outputPath}`)
  console.log(`\n   Next: generate deliverable with:`)
  console.log(`   python .claude/skills/prospect-deliverable/scripts/generate-deliverable.py \\`)
  console.log(`     --csv ${outputPath} \\`)
  console.log(`     --prospect "${prospect}" \\`)
  console.log(`     --cal-link "https://cal.com/driveroi/30min" \\`)
  console.log(`     --output public/leads/${slug}.html`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
