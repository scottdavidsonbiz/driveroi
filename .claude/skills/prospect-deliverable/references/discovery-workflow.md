# Discovery Workflow

Step-by-step guide for finding ICP accounts using DiscoLike and web search.

## Step 1: Research the Prospect

Before running discovery, understand the prospect's product and ICP:

1. Visit their website + case studies page
2. Identify: what they sell, who buys it, what size companies, what verticals
3. Note any existing customers (exclude from the list)
4. Check for recent news (funding, hiring BDRs = strong buying signal)

## Step 2: DiscoLike Discovery

Run `plan-discovery-query` first with a natural language description of the ICP.

Then run `discover-similar-companies` with:
- `icp_text`: cleaned description from the plan
- `phrase_match`: 3-5 key terms (e.g., "tennis", "pickleball", "racquet")
- `category`: relevant industry categories
- `country`: ["US"] (or as appropriate)
- `employee_range`: match the prospect's typical customer size
- `negate_domain`: the prospect itself + known competitors/customers
- `fields`: ["domain", "name", "address", "social_urls", "employees", "similarity"]
- `max_records`: 100

Run a second query with `offset=50` or `offset=100` for more results.

Run a second discovery with different `icp_text` angle (e.g., "private country club with tennis" vs "independent pickleball facility") to catch different segments.

## Step 3: Web Search for Additional Accounts

DiscoLike won't find everything. Supplement with web searches:
- "[vertical] clubs [region] list 2025 2026"
- "independent [vertical] facilities United States"
- Industry association directories

## Step 4: Filter Results

Remove from the list:
- The prospect itself
- Known customers of the prospect (check case studies, check if their domain appears in social_urls of results)
- Software/SaaS companies (competitors, not customers)
- Parks/recreation districts (government, not private clubs)
- HOAs and residential communities
- Non-US results
- Industry associations and nonprofits (unless they operate facilities)
- Large enterprise chains (201+ employees) unless specifically relevant

## Step 5: Output CSV for Clay

Save results to `data/{prospect-slug}-icp-list.csv` with columns:
```
domain,club_name,city,state,linkedin_company_url
```

Extract LinkedIn company URLs from the `social_urls` field (look for linkedin.com/company/ URLs).

## Step 6: Clay Enrichment (Manual)

User imports the CSV into Clay and runs their contact enrichment table.
Clay finds decision-maker contacts with LinkedIn profiles and emails.
User exports the enriched CSV and provides it back.

Expected Clay export columns:
```
Club Name, Domain, First Name, Last Name, Full Name, Job Title,
Location, Company Domain, LinkedIn Profile, Valid Email
```

## Step 7: Generate Deliverable

Run the generation script:
```bash
python .claude/skills/prospect-deliverable/scripts/generate-deliverable.py \
    --csv path/to/clay-export.csv \
    --prospect "ProspectName" \
    --cal-link "https://cal.com/driveroi/30min" \
    --output public/leads/prospect-slug.html
```

The script automatically:
- Parses the Clay CSV
- Removes non-US contacts
- Detects email patterns per company
- Infers emails for contacts without them
- Generates the branded HTML page

## Step 8: Deploy

```bash
git add public/leads/prospect-slug.html
git commit -m "Add [Prospect] ICP deliverable page"
git push
```

Live at: `driveroi.vercel.app/leads/prospect-slug.html`
