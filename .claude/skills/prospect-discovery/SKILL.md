# Prospect Discovery

## Metadata
- **Name:** prospect-discovery
- **Description:** End-to-end outbound prospecting pipeline. Find ICP look-alikes with DiscoLike, qualify against buyer's ICP, verify tech stack, find contacts, verify emails, and push to Instantly. One pipeline, no manual steps, no fabricated data.
- **Invocation:** /prospect-discovery

---

## Overview

This skill runs the full outbound prospecting pipeline:

1. **DiscoLike Discovery** — Find ICP look-alike companies
2. **ICP Qualification** — Filter to actual buyer fits, remove non-fits
3. **Tech Stack Verification** — Confirm companies don't already use the buyer's product or direct competitors (via Sumble)
4. **DiscoLike Contacts** — Find decision-maker contacts at qualified companies
5. **Email Verification** — Verify every email via Anymailfinder, gap-fill with Clay webhook
6. **Instantly Push** — Push verified leads with custom variables to a campaign

**Rules:**
- Never include a company you haven't qualified against the buyer's ICP
- Never claim a tech stack check was done if it wasn't. Actually run it.
- Never pad a list with non-fits to hit a number. 13 real fits > 25 padded.
- Show methodology: what was checked, what was excluded, and why

---

## Required Inputs

1. **ICP description** — Natural language (e.g., "compliance SaaS companies selling to healthcare, 51-500 employees, US")
2. **Persona** — Who to find (e.g., "VP+ marketing, sales, or CRO")
3. **Campaign ID** — Instantly campaign to push to (create one first if needed), or "create new"
4. **Max accounts** — How many companies to find (default: 25)

Optional:
- **Seed domains** — Example companies for lookalike matching
- **Segment name** — Label for file naming (default: derived from ICP)
- **Buyer context** — If building a deliverable FOR a prospect (e.g., "BigID sells DSPM"), include their product category so we can check competitors in tech stacks

---

## Workflow

### Step 1: DiscoLike Discovery

Use `discover-similar-companies` with `icp_prompt`:

```
discover-similar-companies(
  icp_prompt="{user's full ICP description}",
  country=["US"],
  max_records={max accounts + 50% buffer for filtering},
  fields=["domain", "name", "description", "employees", "similarity", "social_urls"]
)
```

Request MORE than the target count. Filtering will remove non-fits.

### Step 2: ICP Qualification

Review every result and remove companies that don't fit the buyer's ICP:

**Remove if:**
- Too small for the buyer's product (e.g., single-location practices won't buy enterprise DSPM)
- Wrong segment (government entities if buyer only sells to private sector)
- Wrong industry despite high similarity score
- Already a customer of the buyer (check if known)
- Duplicate domains (e.g., smartapp.com and smartappbeta.com)

**For signal-based lists (breach data, funding, job postings):**
- Apply the same ICP filter. A breach at a dental practice doesn't make them an enterprise DSPM buyer.
- The signal (breach, funding round, hiring) creates urgency. The ICP filter confirms they can actually buy.

Present the filtered list with removal reasons:
```
Removed: 8 of 21
  ✗ Pecan Tree Dental: Single-location dental practice
  ✗ Baltimore City Health Dept: Government entity
  ...
ICP fits: 13
```

### Step 3: Tech Stack Verification

If the buyer sells a specific product category, check whether target companies already use the buyer's product or direct competitors.

**Use Sumble API** (`https://api.sumble.com/v5/organizations/enrich`) with technology filters:

```python
# For each domain, check each competitor vendor
payload = {
  "organization": {"domain": domain},
  "filters": {"technologies": ["vendor_name"]}
}
```

- Sumble costs 0 credits if no match, 5 if match
- Check all domains against the buyer's product AND known competitors
- If a company already uses the buyer's product: REMOVE (they're already a customer)
- If a company uses a competitor: KEEP but note it (potential displacement opportunity, or remove depending on buyer preference)

**Common DSPM vendors:** bigid, cyera, symmetry systems, normalyze, dig security, laminar, open raven, varonis, securiti
**Common CRM vendors:** salesforce, hubspot, zoho, pipedrive
**Common outbound vendors:** outreach, salesloft, instantly, apollo

Always ask the user or infer from context which vendors to check.

### Step 4: DiscoLike Contacts

Use `search-contacts` on ALL qualified domains:

```
search-contacts(
  domain=[all qualified domains],
  seniority=[map from persona],
  title=[map from persona],
  has_linkedin=true,
  results_by_company=1,
  max_records={qualified count},
  fields=["name", "title", "domain", "company_name", "email", "social_urls", "seniority"]
)
```

Note gap companies (no contacts returned).

### Step 5: Email Verification

**Primary: Anymailfinder** — Run `findPersonEmail` for every contact with a name.

Write and execute a verification script using the manual .env loader:
```typescript
import { readFileSync } from 'fs'
import { resolve } from 'path'
const envPath = resolve(__dirname, '..', '.env')
// ... parse and set process.env
```

**Gap-fill: Anymailfinder `findDecisionMaker`** — For domains where AMF person search returned not_found.

**Final fallback: Clay webhook** — Push remaining unfound contacts to Clay for waterfall enrichment:
```
POST https://api.clay.com/v3/sources/webhook/{webhook-id}
{
  "full_name": "First Last",
  "first_name": "First",
  "last_name": "Last",
  "job_title": "Title",
  "company_name": "Company",
  "company_domain": "domain.com"
}
```
Push one at a time with 2-second delays. Clay webhook field names: `full_name`, `first_name`, `last_name`, `job_title`, `company_name`, `company_domain`.

### Step 6: Push to Instantly

For all contacts with verified emails, push to Instantly using `lib/instantly.ts`:

```typescript
import { addLeadsToCampaign } from '../lib/instantly'
```

Each lead gets: email, first_name, last_name, company_name, custom_variables (company_name, title, linkedin_url, domain).

If creating a new campaign with email sequence, use PATCH to add sequences (not a separate endpoint):
```typescript
// Create campaign
POST /campaigns → { id: campaignId }
// Add sequence via PATCH
PATCH /campaigns/{campaignId} → { sequences: [{ steps: [...] }] }
// Push leads one at a time via lib
addLeadsToCampaign(campaignId, lead)
```

### Step 7 (Deliverable mode): Generate HTML

If building a deliverable for a prospect, generate branded HTML at `public/leads/{slug}.html` using the prospect-deliverable skill's generate pattern. Include:
- Methodology section (sources, date range, ICP filter, tech stack check, contact verification)
- Stats (qualified companies, affected/signal count, verified contacts, competitor vendor check)
- Table with company, signal data, source, and contact info
- CTA to cal.com/driveroi/30min

Report final stats:
- Accounts discovered → ICP-qualified → tech stack verified
- Contacts found → emails verified → pushed to Instantly
- Gap companies (no contact found)
- Removal reasons logged

---

## Tools & Dependencies

### MCP Tools
- **DiscoLike** `discover-similar-companies` — ICP lookalike search
- **DiscoLike** `search-contacts` — Find people at companies

### APIs
- **Sumble** (`api.sumble.com/v5/organizations/enrich`) — Tech stack verification. Key in `.env` as API key embedded in script (see `scripts/sumble-clay-check.py` for pattern)
- **Clay webhook** — Fallback email finding. Push contacts with correct field names.

### Libraries
- **`lib/anymailfinder.ts`** — `findPersonEmail`, `findDecisionMaker`, `batchVerify`
- **`lib/instantly.ts`** — `addLeadToCampaign`, `addLeadsToCampaign`, `updateCampaignSequences`

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

- [ ] Every company on the list was qualified against the buyer's ICP
- [ ] Non-fits were removed with documented reasons
- [ ] Tech stack was actually checked (not assumed)
- [ ] Companies using the buyer's own product were excluded
- [ ] Every pushed lead has a verified email
- [ ] No leads pushed without email verification
- [ ] Custom variables populated (company, title, linkedin_url)
- [ ] No duplicate emails
- [ ] Methodology is transparent (sources, filters, checks)
- [ ] Gap companies documented for LinkedIn/HeyReach follow-up
