# Prospect Discovery

## Metadata
- **Name:** prospect-discovery
- **Description:** End-to-end outbound prospecting pipeline. Find ICP look-alikes with DiscoLike, find decision-maker contacts, verify emails via Anymailfinder, and push straight to Instantly. One pipeline, no manual steps.
- **Invocation:** /prospect-discovery

---

## Overview

This skill runs the full outbound prospecting pipeline in one shot:

1. **DiscoLike Discovery** — Find ICP look-alike companies
2. **DiscoLike Contacts** — Find revenue leader contacts at each company
3. **Anymailfinder Verify** — Verify every email
4. **Anymailfinder Gap-Fill** — Find contacts at companies DiscoLike missed
5. **Instantly Push** — Push verified leads with custom variables to a campaign

No HTML deliverables. No manual steps. Input goes in, leads come out in Instantly.

---

## Required Inputs

1. **ICP description** — Natural language (e.g., "compliance SaaS companies selling to healthcare, 51-500 employees, US")
2. **Persona** — Who to find (e.g., "VP+ marketing, sales, or CRO")
3. **Campaign ID** — Instantly campaign to push to (create one first if needed)
4. **Max accounts** — How many companies to find (default: 25)

Optional:
- **Seed domains** — Example companies for lookalike matching
- **Segment name** — Label for file naming (default: derived from ICP)

---

## Workflow

### Step 1: DiscoLike Discovery

Use `discover-similar-companies` with `icp_prompt` (let DiscoLike extract filters automatically):

```
discover-similar-companies(
  icp_prompt="{user's full ICP description}",
  country=["US"],
  max_records={max accounts},
  fields=["domain", "name", "description", "employees", "similarity", "social_urls"]
)
```

Show results as a table. Move straight to Step 2 unless something looks obviously wrong.

### Step 2: DiscoLike Contacts

Use `search-contacts` on ALL discovered domains in a single call:

```
search-contacts(
  domain=[all discovered domains],
  seniority=[map from persona - e.g., "executive", "vp", "director"],
  title=[map from persona - e.g., "marketing", "sales", "revenue", "growth", "demand", "CRO"],
  has_linkedin=true,
  results_by_company=1,
  max_records={max accounts},
  fields=["name", "title", "domain", "company_name", "email", "social_urls", "seniority"]
)
```

Note which companies returned no contacts (gap companies).

### Step 3: Anymailfinder Verify

For every contact from Step 2 that has a name, run AMF `findPersonEmail` to get a verified email:

```typescript
// For each contact:
findPersonEmail({
  first_name: "First",
  last_name: "Last",
  domain: "company.com",
  company_name: "Company Name"
})
```

Write and execute a script at `scripts/demo-amf-verify.ts` using the manual .env loader pattern (no dotenv package):

```typescript
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { findPersonEmail } from '../lib/anymailfinder'

const envPath = resolve(__dirname, '..', '.env')
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
```

Run with `npx tsx scripts/demo-amf-verify.ts`.

Contacts that come back VALID proceed. Contacts that come back not_found go to Step 4.

### Step 4: Gap-Fill

For domains with zero verified contacts (either DiscoLike returned nobody, or AMF couldn't verify), run AMF `findDecisionMaker`:

```typescript
findDecisionMaker(domain, ["marketing", "sales", "ceo"])
```

This costs 2 credits but finds a decision-maker even when we don't have a name.

### Step 5: Push to Instantly

For all contacts with verified emails, push to the Instantly campaign using `lib/instantly.ts`:

```typescript
import { addLeadToCampaign } from '../lib/instantly'

addLeadToCampaign(CAMPAIGN_ID, {
  email: "verified@company.com",
  first_name: "First",
  last_name: "Last",
  company_name: "Company Name",
  custom_variables: {
    company: "Company Name",
    title: "VP Marketing",
    linkedin_url: "https://linkedin.com/in/...",
    domain: "company.com"
  }
})
```

Write a push script at `scripts/push-{segment}-leads.ts` and execute it.

Report final stats:
- Accounts found
- Contacts verified
- Leads pushed to Instantly
- Gap companies (no contact found)

---

## Tools & Dependencies

### MCP Tools
- **DiscoLike** `discover-similar-companies` — ICP lookalike search
- **DiscoLike** `search-contacts` — Find people at companies

### Libraries
- **`lib/anymailfinder.ts`** — `findPersonEmail`, `findDecisionMaker`, `batchVerify`
- **`lib/instantly.ts`** — `addLeadToCampaign`

### Environment Variables (in `.env`)
- `ANYMAILFINDER_API_KEY`
- `INSTANTLY_API_KEY`

### Script Pattern
All scripts use the manual .env loader (no dotenv package installed):
```typescript
import { readFileSync } from 'fs'
import { resolve } from 'path'
const envPath = resolve(__dirname, '..', '.env')
// ... parse and set process.env
```

---

## Quality Checks

- [ ] Every pushed lead has a verified email (AMF status = valid)
- [ ] No leads pushed without email verification
- [ ] Custom variables populated (company, title, linkedin_url)
- [ ] No duplicate emails
- [ ] Gap companies documented for LinkedIn/HeyReach follow-up
