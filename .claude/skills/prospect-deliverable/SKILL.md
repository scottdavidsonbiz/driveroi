---
name: prospect-deliverable
description: End-to-end workflow for delivering branded ICP lead lists to prospects. Use when a prospect responds to the "free leads" always-on offer, when building an ICP account list for a prospect, when generating a branded HTML deliverable from a Clay CSV, or when someone asks about the lead list delivery process. Covers prospect research, DiscoLike account discovery, Clay enrichment handoff, branded HTML generation with automatic email inference, and deployment to Vercel.
---

# Prospect Deliverable

Build and deliver a branded ICP lead list for a prospect in 5 phases.

## Workflow

### Phase 1: Research

Understand the prospect's product, ICP, and existing customers.

1. Visit their website and case studies
2. Identify their target customer profile (industry, size, type)
3. Note existing customers to exclude from the list
4. Check for buying signals (hiring BDRs, recent funding)

### Phase 2: Account Discovery

Use DiscoLike + web search to build the account list. See `references/discovery-workflow.md` for detailed query strategies.

1. Run `plan-discovery-query` with natural language ICP description
2. Run `discover-similar-companies` with structured filters (2+ queries for coverage)
3. Supplement with web searches for accounts DiscoLike misses
4. Filter out: the prospect itself, their existing customers, competitors, software companies, government entities, non-US
5. Save to `data/{prospect-slug}-icp-list.csv` (columns: domain, club_name, city, state, linkedin_company_url)

Target: 25+ qualified accounts.

### Phase 3: Clay Enrichment (Manual Handoff)

Pause and hand the CSV to the user for Clay enrichment.

Tell the user:
> Here's the account list. Import it into Clay to find decision-maker contacts.
> Export the enriched table as CSV when done and share it back.

Expected Clay export columns: Club Name, Domain, First Name, Last Name, Full Name, Job Title, Location, LinkedIn Profile, Valid Email.

### Phase 4: Generate Deliverable

Run the generation script with the Clay CSV:

```bash
python .claude/skills/prospect-deliverable/scripts/generate-deliverable.py \
    --csv <clay-csv-path> \
    --prospect "<Prospect Name>" \
    --cal-link "https://cal.com/driveroi/30min" \
    --output public/leads/<prospect-slug>.html
```

The script handles: CSV parsing, non-US filtering, email pattern detection and inference, branded HTML generation.

After generation, review the output in a browser. Check for:
- Contacts that are obviously wrong (wrong country, wrong company)
- Data quality issues (duplicate names, garbled titles)

Fix any issues by editing the CSV and re-running, or editing the HTML directly.

### Phase 5: Deploy

```bash
git add public/leads/<prospect-slug>.html
git commit -m "Add <Prospect> ICP deliverable page"
git push
```

Share the link: `driveroi.vercel.app/leads/<prospect-slug>.html`

Suggested email to the prospect:
> Hey [name], here's the ICP list we put together for your team:
>
> [link]
>
> [N] accounts with decision-maker contacts, LinkedIn profiles, and emails.
> Let me know if you want to talk about building this out further.

## Reference Files

- **`references/discovery-workflow.md`**: Detailed DiscoLike query strategies, filtering rules, Clay handoff format
- **`scripts/generate-deliverable.py`**: HTML generation script (run with `--help` for options)
