# Discovery Workflow

Step-by-step guide for finding ICP accounts using DiscoLike, Exa, and web search.

## Step 1: Research the Prospect

Before running discovery, understand the prospect's product and ICP:

1. `extract-website-text` on their domain (DiscoLike cached content)
2. `business-profile` for firmographics (employees, industry, location)
3. Web search for case studies, customers, recent funding/hiring news
4. Identify: what they sell, who buys it, what size companies, what verticals
5. Note existing customers (exclude from list)

## Step 2: Account Discovery

### DiscoLike Path (B2B, services, logistics, SaaS)

Run `plan-discovery-query` first with a natural language description of the ICP.

Then run `discover-similar-companies` with:
- `icp_text`: cleaned description from the plan
- `domain`: 3-5 seed domains of known good-fit companies
- `category`: relevant industry categories
- `country`: ["US"] (or as appropriate)
- `employee_range`: match the prospect's typical customer size
- `negate_domain`: the prospect itself + known competitors/customers
- `negate_category`: exclude SOFTWARE, SAAS, MEDIA if looking for operators/end users
- `fields`: ["domain", "name", "address", "social_urls", "employees", "similarity"]
- `max_records`: 60-100

Run 2+ queries with different angles to cover segments.

### Exa Path (DTC, ecommerce, consumer brands)

DiscoLike's database skews B2B and returns spam/affiliate sites for consumer verticals. Use Exa instead.

**`findSimilar`** — best when you have a seed company:
```bash
curl -X POST "https://api.exa.ai/findSimilar" \
  -H "x-api-key: $EXA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://seed-company.com",
    "numResults": 30,
    "category": "company",
    "excludeDomains": ["shopify.com","amazon.com","linkedin.com","instagram.com","facebook.com","twitter.com","tiktok.com","youtube.com","reddit.com","medium.com"],
    "contents": {"text": {"maxCharacters": 100}}
  }'
```

Run 3-4 `findSimilar` calls with different seed URLs across verticals (e.g., one home goods brand, one apparel brand, one beauty brand).

**`search`** — best for conceptual/funding-based queries:
```bash
curl -X POST "https://api.exa.ai/search" \
  -H "x-api-key: $EXA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Series A funded direct-to-consumer brand selling...",
    "type": "auto",
    "category": "company",
    "numResults": 30,
    "contents": {"text": {"maxCharacters": 100}}
  }'
```

### Web Search Supplement

Neither tool finds everything. Supplement with web searches:
- "[vertical] companies [region] list 2025 2026"
- "top [vertical] brands US mid-market"
- Industry association directories

## Step 3: Filter Results

Remove from the list:
- The prospect itself
- Known customers of the prospect
- Competitors to the prospect (software/SaaS companies if prospect is SaaS)
- Media, publications, review sites, affiliate sites
- Government entities
- Non-US results
- Companies too small (under 10 employees) unless specifically relevant
- Marketplace/platform companies (Shopify stores, Amazon sellers)

## Step 4: Output Account CSV

Save results to `data/{prospect-slug}-icp-list.csv` with columns:
```
domain,company_name,city,state,linkedin_company_url
```

Extract LinkedIn company URLs from DiscoLike `social_urls` field or construct from known company names.

**Minimum: 25 accounts.** If under 25 after filtering, run additional discovery queries or broaden criteria.

## Step 5: Contact Enrichment

### Primary: DiscoLike `search-contacts` (MCP)

Search contacts in batches of up to 10 domains:
```
filters:
  domain: [batch of domains]
  title: [keywords matching prospect's buyer persona]
  seniority: ["executive", "vp", "director"]
  has_email: true
  results_by_company: 1
fields: ["name", "title", "domain", "email", "email_validated", "social_urls", "company_name"]
```

**Title keywords by prospect type:**
- SEO/marketing tool → "marketing", "growth", "seo", "digital", "brand"
- Sales tool → "sales", "revenue", "business development"
- Operations tool → "operations", "supply chain", "logistics"
- HR/people tool → "people", "hr", "talent"
- Finance tool → "finance", "accounting", "cfo"
- General → "marketing", "growth", "ceo"

### Fallback: Anymailfinder

For domains where DiscoLike found no contact:
```typescript
import { findDecisionMaker } from '../lib/anymailfinder'
// Valid categories: ceo, engineering, finance, hr, it, logistics, marketing, operations, buyer, sales
const result = await findDecisionMaker(domain, ['marketing', 'ceo'])
```

### Last Resort: Manual

If both tools miss a domain:
- Web search for "[company] CEO" or "[company] Head of Marketing"
- Check LinkedIn company page for leadership
- Infer email from known company pattern (e.g., first@domain.com)

## Step 6: Assemble Enriched CSV

Output format for `generate-deliverable.py`:
```
Club Name,Domain,First Name,Last Name,Full Name,Job Title,Location,LinkedIn Profile,Valid Email
```

Parse full names into first/last. Build location from city + state. Extract LinkedIn `/in/` URLs from social_urls arrays.

## Step 7: Generate Deliverable

```bash
python .claude/skills/prospect-deliverable/scripts/generate-deliverable.py \
    --csv data/{slug}-enriched.csv \
    --prospect "ProspectName" \
    --cal-link "https://cal.com/driveroi/30min" \
    --output public/leads/{slug}.html
```

Review the output. Ensure CTA button appears at top of page (add manually if the generator doesn't include it — edit the HTML to add `<a href="https://cal.com/driveroi/30min" class="cta-button">Book a Call to Build This Out</a>` inside the `.header` div).

## Step 8: Deploy

```bash
git add public/leads/{slug}.html
git commit -m "Add [Prospect] ICP deliverable page"
git push
```

Live at: `driveroi.vercel.app/leads/{slug}.html`
