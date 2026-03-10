---
name: prospect-deliverable
description: End-to-end workflow for delivering branded ICP lead lists to prospects. Use when a prospect responds to the "free leads" always-on offer, when building an ICP account list for a prospect, when generating a branded HTML deliverable, or when someone asks about the lead list delivery process. Covers prospect research, account discovery (DiscoLike + Exa), automated contact enrichment (DiscoLike contacts + Anymailfinder), branded HTML generation, and deployment to Vercel.
---

# Prospect Deliverable

Build and deliver a branded ICP lead list for a prospect in 5 phases. No Clay dependency — enrichment is fully automated.

## Workflow

### Phase 1: Research

Understand the prospect's product, ICP, and existing customers.

1. Run `extract-website-text` on their domain (DiscoLike) for cached site content
2. Run `business-profile` on their domain for firmographics (size, industry, location)
3. Web search for case studies, customers, recent news
4. Identify: what they sell, who buys it, what verticals, what company size
5. Note existing customers to exclude from the list
6. Check for buying signals (hiring BDRs, recent funding, new Head of Sales/BD)

### Phase 2: Account Discovery

Use DiscoLike + Exa to build the account list. See `references/discovery-workflow.md` for detailed strategies.

**DiscoLike path** (works well for B2B, logistics, services, SaaS):
1. Run `plan-discovery-query` with natural language ICP description
2. Run `discover-similar-companies` with structured filters (2+ queries for coverage)
3. Filter out: prospect itself, existing customers, competitors, non-US

**Exa path** (works better for DTC, ecommerce, consumer brands, niche verticals):
1. Use Exa `findSimilar` API with 1-2 seed company URLs
2. Run 2-3 queries from different angles (by vertical, by company type)
3. Use `category: "company"` filter to avoid blog/media results
4. Exa API key is passed as arg or stored in env: `EXA_API_KEY`

**Combine both** when DiscoLike returns too many spam/irrelevant results or when the vertical is consumer-facing.

**Exa API patterns:**
```bash
# findSimilar — best for "more companies like this one"
curl -X POST "https://api.exa.ai/findSimilar" \
  -H "x-api-key: $EXA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "numResults": 30, "category": "company",
       "excludeDomains": ["shopify.com","amazon.com","linkedin.com","instagram.com"],
       "contents": {"text": {"maxCharacters": 100}}}'

# search — best for conceptual queries
curl -X POST "https://api.exa.ai/search" \
  -H "x-api-key: $EXA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "Series A funded DTC brand selling...", "type": "auto",
       "category": "company", "numResults": 30,
       "contents": {"text": {"maxCharacters": 100}}}'
```

Save to `data/{prospect-slug}-icp-list.csv` with columns: `domain,company_name,city,state,linkedin_company_url`

Target: **25+ qualified accounts** (minimum enforced).

### Phase 3: Contact Enrichment (Automated)

No Clay needed. Use DiscoLike contacts + Anymailfinder fallback.

**Step 1 — DiscoLike `search-contacts`** (primary):
- Search all domains in batches of 10
- Filter by title keywords relevant to the prospect's buyer persona
- Filter by seniority: `executive`, `vp`, `director`
- Require `has_email: true`
- Use `results_by_company: 1` (one contact per account)

```
search-contacts filters:
  domain: [batch of up to 10 domains]
  title: ["marketing", "growth", "seo"]  ← adjust per prospect's buyer
  seniority: ["executive", "vp", "director"]
  has_email: true
  results_by_company: 1
fields: ["name", "title", "domain", "email", "email_validated", "social_urls", "company_name"]
```

**Step 2 — Anymailfinder fallback** (for gaps):
- For domains where DiscoLike found no contact
- Use `findDecisionMaker(domain, categories)` from `lib/anymailfinder.ts`
- Valid AMF categories: `ceo`, `engineering`, `finance`, `hr`, `it`, `logistics`, `marketing`, `operations`, `buyer`, `sales`
- Pick categories matching the prospect's buyer persona

**Step 3 — Assemble enriched CSV:**
Output format compatible with `generate-deliverable.py`:
```
Club Name,Domain,First Name,Last Name,Full Name,Job Title,Location,LinkedIn Profile,Valid Email
```

The reusable enrichment script is at `scripts/enrich-prospect-list.ts`:
```bash
npx tsx scripts/enrich-prospect-list.ts \
  --csv data/{slug}-icp-list.csv \
  --titles "marketing,growth,seo" \
  --prospect "ProspectName" \
  --output data/{slug}-enriched.csv
```

Note: The script calls DiscoLike via REST API (needs `DISCOLIKE_API_KEY` in `.env`). If no key is set, it falls through to Anymailfinder only. When running interactively, use the MCP tools directly for DiscoLike contacts (better coverage), then AMF for gaps.

### Phase 4: Generate Deliverable

Run the generation script with the enriched CSV:

```bash
python .claude/skills/prospect-deliverable/scripts/generate-deliverable.py \
    --csv data/{slug}-enriched.csv \
    --prospect "<Prospect Name>" \
    --cal-link "https://cal.com/driveroi/30min" \
    --output public/leads/<prospect-slug>.html
```

The script handles: CSV parsing, non-US filtering, email pattern detection and inference, branded HTML generation.

After generation, review the output:
- Contacts that are obviously wrong (wrong country, wrong company)
- Data quality issues (duplicate names, garbled titles)
- CTA button should appear at top AND bottom of page

Fix issues by editing the CSV and re-running, or editing the HTML directly.

### Phase 5: Deploy

```bash
git add public/leads/<prospect-slug>.html
git commit -m "Add <Prospect> ICP deliverable page"
git push
```

Live at: `driveroi.vercel.app/leads/<prospect-slug>.html`

Suggested message to the prospect:
> Hey [name], here's the ICP list we put together for your team:
>
> [link]
>
> [N] accounts with decision-maker contacts, LinkedIn profiles, and emails.
> Let me know if you want to talk about building this out further.

## Tool Selection Guide

| Prospect's ICP | Discovery Tool | Why |
|---|---|---|
| B2B services, logistics, SaaS | DiscoLike | Strong category/employee filters, good B2B coverage |
| DTC, ecommerce, consumer brands | Exa `findSimilar` | DiscoLike returns spam for consumer sites; Exa finds real brands |
| Niche vertical (clubs, facilities) | DiscoLike + web search | DiscoLike for bulk, web search for association directories |
| Mixed / unclear | Both | Start DiscoLike, supplement with Exa if quality is low |

| Enrichment Need | Tool | Cost |
|---|---|---|
| People by domain + title | DiscoLike `search-contacts` (MCP) | Included in plan |
| Email by name + domain | Anymailfinder `findPersonEmail` | 1 credit (only if found) |
| Decision maker by domain | Anymailfinder `findDecisionMaker` | 2 credits |
| Email verification | Anymailfinder `verifyEmail` | 1 credit |

## Reference Files

- **`references/discovery-workflow.md`**: Detailed query strategies, filtering rules, Exa patterns
- **`scripts/generate-deliverable.py`**: HTML generation script (run with `--help` for options)
- **`scripts/enrich-prospect-list.ts`**: Automated enrichment pipeline (DiscoLike + AMF)
- **`lib/anymailfinder.ts`**: Anymailfinder API client library
