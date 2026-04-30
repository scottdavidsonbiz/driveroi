import { createHash } from 'crypto'

// HHS overhauled the OCR portal in early 2026, splitting HIPAA and Part 2 reports.
// breach_report.jsf now 302-redirects to breach_frontpage.jsf (no data).
// HIPAA breach data lives at breach_report_hip.jsf with new form action IDs.
const PORTAL_URL = 'https://ocrportal.hhs.gov/ocr/breach/breach_report_hip.jsf'
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

export interface BreachRecord {
  breach_id: string
  covered_entity_name: string
  state: string | null
  entity_type: string | null
  individuals_affected: number | null
  breach_submission_date: string | null // ISO date YYYY-MM-DD
  breach_type: string
  location_of_breached_info: string
  ba_present: boolean
  web_description: string | null
}

export async function downloadHhsBreaches(): Promise<string> {
  // Retry the GET → POST handshake up to 3 times. The HHS portal's load balancer
  // appears to drop session affinity intermittently; first-of-cycle attempts
  // typically succeed, retries within the same session sometimes fail with a
  // redirect-to-frontpage. A fresh GET (new JSESSIONID + asig_persistence) recovers.
  let lastErr: Error | null = null
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await downloadOnce()
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err))
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 2000 * attempt))
      }
    }
  }
  throw lastErr ?? new Error('HHS download failed after retries')
}

async function downloadOnce(): Promise<string> {
  // Next.js patches fetch and caches GETs by default. A cached GET would feed
  // us stale ViewState + cookies, and the POST would land in a different JSF
  // session — returning the frontpage HTML instead of the CSV.
  const getRes = await fetch(PORTAL_URL, {
    headers: { 'User-Agent': USER_AGENT },
    cache: 'no-store',
  })
  if (!getRes.ok) throw new Error(`HHS portal GET failed: ${getRes.status}`)
  const html = await getRes.text()

  const viewState = extractViewState(html)
  if (!viewState) throw new Error('Could not extract javax.faces.ViewState from HHS portal')

  // JSF rotates form action IDs whenever the page template changes (the CSV
  // anchor moved from j_idt385 to j_idt384 on 2026-04-30 mid-day, breaking the
  // cron). Extract the live submit ID by locating the CSV image and scanning
  // backward to its enclosing anchor's onclick payload.
  const csvSubmitId = extractCsvSubmitId(html)
  if (!csvSubmitId) throw new Error('Could not locate CSV export anchor on HHS portal')

  const cookie = extractJsessionCookie(getRes.headers)

  const formData = new URLSearchParams({
    ocrForm: 'ocrForm',
    'javax.faces.ViewState': viewState,
    [csvSubmitId]: csvSubmitId,
  })

  const postRes = await fetch(PORTAL_URL, {
    method: 'POST',
    headers: {
      'User-Agent': USER_AGENT,
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: PORTAL_URL,
      Origin: 'https://ocrportal.hhs.gov',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: formData.toString(),
    cache: 'no-store',
  })

  if (!postRes.ok) throw new Error(`HHS CSV export failed: ${postRes.status}`)

  const body = await postRes.text()
  const contentType = postRes.headers.get('content-type') ?? ''
  if (!body.startsWith('Name') && !/csv|octet/i.test(contentType)) {
    throw new Error(`HHS POST returned unexpected content (first 200 chars): ${body.slice(0, 200)}`)
  }

  return body
}

function extractCsvSubmitId(html: string): string | null {
  // The CSV export is rendered as
  //   <a onclick="mojarra.jsfcljs(...,{'ocrForm:j_idtNNN':'ocrForm:j_idtNNN'},'')">
  //     <img alt="CSV" />
  //   </a>
  // The submit ID we POST is the anchor's onclick payload, NOT the image's id —
  // those are sequential JSF ids and easy to confuse.
  const csvImgIdx = html.search(/<img[^>]*alt=["']CSV["']/)
  if (csvImgIdx < 0) return null
  const before = html.slice(0, csvImgIdx)
  const matches = [...before.matchAll(/['"](ocrForm:j_idt\d+)['"]:['"]ocrForm:j_idt\d+['"]/g)]
  return matches.length > 0 ? matches[matches.length - 1][1] : null
}

function extractViewState(html: string): string | null {
  const a = html.match(/name="javax\.faces\.ViewState"[^>]*\svalue="([^"]+)"/)
  if (a) return a[1]
  const b = html.match(/value="([^"]+)"[^>]*\sname="javax\.faces\.ViewState"/)
  return b ? b[1] : null
}

function extractJsessionCookie(headers: Headers): string {
  // HHS sets two session cookies: JSESSIONID (servlet session) and asig_persistence
  // (load-balancer affinity). Both must round-trip or the POST hits a different
  // backend without the JSF session and gets redirected to the frontpage.
  const setCookie = headers.get('set-cookie') ?? ''
  const cookies: string[] = []
  for (const name of ['JSESSIONID', 'asig_persistence']) {
    const match = setCookie.match(new RegExp(`${name}=[^;]+`))
    if (match) cookies.push(match[0])
  }
  return cookies.join('; ')
}

export function parseBreachCsv(csv: string): BreachRecord[] {
  const rows = parseCsv(csv)
  if (rows.length < 2) return []

  const header = rows[0].map(h => h.trim())
  const idx = (name: string) => header.findIndex(h => h.toLowerCase() === name.toLowerCase())

  let iName = idx('Name of Covered Entity')
  const iState = idx('State')
  const iType = idx('Covered Entity Type')
  const iIndividuals = idx('Individuals Affected')
  const iDate = idx('Breach Submission Date')
  const iBreachType = idx('Type of Breach')
  const iLocation = idx('Location of Breached Information')
  let iBa = idx('Business Associate Present')
  const iWeb = idx('Web Description')

  // The 2026 HIP portal renders the entity-name and BA-present columns as
  // unbound JSF UIPanel components; their headers come back as
  // "javax.faces.component.UIPanel@<hash>" instead of human labels. Positions
  // are stable: column 0 = name, column 7 = BA-present (between Location and Web).
  if (iName < 0) {
    const panelIdx = header.findIndex(h => /UIPanel@/i.test(h))
    if (panelIdx === 0) iName = 0
  }
  if (iBa < 0) {
    const lateIdx = header.findIndex((h, i) => /UIPanel@/i.test(h) && i > 0)
    if (lateIdx > 0) iBa = lateIdx
  }

  if (iName < 0 || iDate < 0 || iBreachType < 0) {
    throw new Error(`Unexpected CSV header from HHS: ${header.join(' | ')}`)
  }

  const out: BreachRecord[] = []
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    const name = cleanCell(row[iName])
    if (!name) continue
    const date = cleanCell(row[iDate])
    const breachType = cleanCell(row[iBreachType])
    const individualsRaw = cleanCell(row[iIndividuals]).replace(/,/g, '')
    const individuals = individualsRaw ? parseInt(individualsRaw, 10) : NaN

    out.push({
      covered_entity_name: name,
      state: cleanCell(row[iState]) || null,
      entity_type: cleanCell(row[iType]) || null,
      individuals_affected: Number.isFinite(individuals) ? individuals : null,
      breach_submission_date: normalizeDate(date),
      breach_type: breachType,
      location_of_breached_info: cleanCell(row[iLocation]),
      ba_present: /yes|true/i.test(cleanCell(row[iBa])),
      web_description: cleanCell(row[iWeb]) || null,
      breach_id: computeBreachId(name, date, breachType),
    })
  }
  return out
}

function cleanCell(v: string | undefined): string {
  return (v ?? '').trim()
}

function normalizeDate(s: string): string | null {
  if (!s) return null
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (!m) return null
  const [, mm, dd, yy] = m
  const year = yy.length === 2 ? `20${yy}` : yy
  return `${year}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
}

function computeBreachId(name: string, date: string, breachType: string): string {
  return createHash('sha256').update(`${name}|${date}|${breachType}`).digest('hex').slice(0, 16)
}

// Full CSV parser — handles quoted fields with embedded commas, newlines, and escaped quotes
function parseCsv(csv: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i]
    if (ch === '"') {
      if (inQuotes && csv[i + 1] === '"') {
        field += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      row.push(field)
      field = ''
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && csv[i + 1] === '\n') i++
      row.push(field)
      field = ''
      if (row.length > 1 || row[0] !== '') rows.push(row)
      row = []
    } else {
      field += ch
    }
  }
  if (field || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}
