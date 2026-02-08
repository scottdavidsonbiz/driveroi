---
title: "Clay Workflow: Series A/B Signal-Based Targeting"
type: sop
use-cases:
  - lead-generation
  - icp-definition
  - cold-email
personas:
  - ceo-founder
  - gtm-leader
created: 2026-02-05
last-updated: 2026-02-05
status: active
integrates-with:
  - content/insights/2026-01-31_driveroi-legacy-b2b-positioning-session.md
  - docs/sops/linkedin-dm-email-multichannel-cadence.md
key-concepts:
  - signal-based-targeting
  - clay-enrichment
  - series-a-b-identification
  - revops-gap-detection
tags:
  - clay
  - lead-generation
  - signal-based
  - series-a-b
  - icp
---

# Clay Workflow: Series A/B Signal-Based Targeting

**Purpose:** Build a repeatable Clay workflow that identifies Series A/B B2B SaaS companies with no RevOps function, creating a high-intent target list for DriveROI outreach.

**ICP:** B2B SaaS, Series A/B, US-based, raised in last 6 months, no RevOps person yet, founder/CEO or GTM leader is buyer.

---

## Workflow Overview

```
BusinessWire RSS feed (daily signal)
    → Clay table (import company name + funding details)
        → Enrichment layer 1: Company data + website
        → Enrichment layer 2: ICP qualification (B2B SaaS, headcount, US)
        → Enrichment layer 3: People/role detection (RevOps gap, contacts)
        → Enrichment layer 4: Scoring
        → Filter: Qualified leads only
            → Output: Outreach-ready list

LinkedIn Sales Navigator (secondary source)
    → RevOps job posting signal
    → Merge into same Clay table
```

---

## Step 1: BusinessWire RSS Feed (Primary Signal)

### What You Have

Daily RSS feed from BusinessWire filtered to fundraise announcements for US software companies. This delivers real-time funding signals the day they're announced.

### Why This Is Better Than Search-Based Sourcing

| RSS Feed | Sales Navigator Search |
|----------|----------------------|
| Day-of signal. You reach out while the news is fresh. | Days or weeks old by the time you find it. |
| Pre-filtered to funding announcements | Mixed results, requires manual filtering |
| Company name + round + amount in the feed | Have to enrich to find funding data |
| Can reference the announcement in outreach | Outreach feels generic |

### Daily Process

1. Review the RSS feed each morning (5 min)
2. For each announcement, check: Is this Series A or B? Is it a software/SaaS company?
3. Add qualifying companies to the Clay table: Company Name, Funding Round, Amount, Date, Investors (all from the announcement)

### Connecting RSS to Clay

**Option A: Manual daily import (simplest)**
- Each morning, review the feed and manually add qualifying companies to your Clay table
- Fast enough at 3-10 companies per day
- You're already doing the filtering in your head

**Option B: Zapier/Make automation**
- RSS trigger (new item in BusinessWire feed)
- Filter step: title contains "Series A" OR "Series B" OR "raises" OR "funding round"
- Create row in Clay table with: company name, headline, link, date
- Then run Clay enrichments automatically

**Option C: Clay's built-in RSS/webhook**
- If Clay supports RSS import or webhook triggers, connect directly
- Filter in Clay using AI column: "Is this a B2B SaaS Series A or B raise? Yes/No"

Recommend starting with Option A to validate, then automate with Option B once the process is proven.

---

## Step 1B: LinkedIn Sales Navigator (Secondary Signal)

### RevOps Hiring Signal

This catches companies that may have raised earlier but are NOW feeling the pain:

- Go to LinkedIn Jobs
- Search: "Revenue Operations" OR "RevOps" OR "Sales Operations" OR "GTM Operations"
- Filter: US, company size 15-150, software/SaaS industry
- These companies KNOW they need RevOps but don't have it yet

**Weekly cadence:** Run this search once a week. Add companies to the same Clay table with signal = "Hiring RevOps."

### Export to Clay

- Import as rows into the same master table
- Tag source: "RSS-BusinessWire" or "LinkedIn-Job-Posting"
- This lets you track which signal source produces better conversations

---

## Step 2: Clay Table Setup

### Columns to Create

| Column | Type | Source | Purpose |
|--------|------|--------|---------|
| Company Name | Text | RSS/Import | Identifier |
| Signal Source | Text | Manual | "RSS-BusinessWire" or "LinkedIn-Job-Posting" |
| Signal Date | Date | RSS/Import | When the signal fired. Key for outreach timing. |
| Funding Headline | Text | RSS | Original announcement headline |
| Funding Stage | Text | RSS | Series A/B (from announcement) |
| Funding Amount | Number | RSS | Dollar amount raised |
| Investors | Text | RSS | Lead investor names (useful for personalization) |
| Website | URL | Enrichment | For further enrichment |
| LinkedIn Company URL | URL | Enrichment | Source link |
| Headcount | Number | Enrichment | Size filter |
| HQ Location | Text | Enrichment | US verification |
| Industry | Text | Enrichment | SaaS verification |
| Is B2B SaaS | Boolean | AI/Enrichment | Qualification filter |
| Has RevOps Person | Boolean | Enrichment | Key qualifier |
| RevOps Headcount | Number | Enrichment | Gap detection |
| Sales Team Size | Number | Enrichment | Pain signal |
| CEO/Founder Name | Text | Enrichment | Primary contact |
| CEO/Founder Email | Text | Enrichment | Outreach |
| CEO/Founder LinkedIn | URL | Enrichment | Outreach |
| GTM Leader Name | Text | Enrichment | Secondary contact |
| GTM Leader Title | Text | Enrichment | Context |
| GTM Leader Email | Text | Enrichment | Outreach |
| Fit Score | Number | Formula | Prioritization |
| Tier | Text | Formula | A/B/C segmentation |
| Outreach Angle | Text | AI | Personalization |

---

## Step 3: Enrichment Layers

### Layer 1: Company Enrichment

Funding data already comes from the RSS feed. This layer fills in the company profile.

**Clay enrichment: "Find Company" (using company name)**
- Pulls: website, description, industry, employee count, founded year, tech stack, LinkedIn URL
- Verifies: correct size range, US-based

**Clay enrichment: "AI Web Scraper" (using website)**
- Target: Company homepage
- Extract: One-line description of what they sell, who they sell to
- AI column prompt: "Based on this website, is this a B2B SaaS company? Answer Yes or No."
- This is your B2B SaaS qualification filter. If No, deprioritize.

### Layer 2: People/Role Detection

**Clay enrichment: "Find People at Company"**
- Search 1: Title contains "Revenue Operations" OR "RevOps" OR "Sales Operations" OR "GTM Operations" OR "Business Operations"
  - If found: Has RevOps Person = TRUE (deprioritize)
  - If not found: Has RevOps Person = FALSE (target)

- Search 2: Title contains "VP Sales" OR "Head of Sales" OR "CRO" OR "VP Growth" OR "Head of Growth" OR "GTM"
  - This is your secondary contact (GTM leader)
  - Pull: Name, title, email, LinkedIn URL

- Search 3: Title contains "CEO" OR "Founder" OR "Co-Founder"
  - This is your primary contact
  - Pull: Name, email, LinkedIn URL

**Clay enrichment: "Find Email" (for each contact)**
- Use Clay's waterfall email finder
- Run on CEO/Founder and GTM Leader

### Layer 3: Sales Team Sizing

**Clay enrichment: "Find People at Company"**
- Title contains "Account Executive" OR "AE" OR "Sales Representative" OR "SDR" OR "BDR"
- Count results = Sales Team Size
- 2-5 AEs with no RevOps = perfect ICP (full-cycle, no infrastructure)

---

## Step 4: Scoring Model

### Fit Score (100 points)

Build as a Clay formula column:

| Factor | Points | Logic |
|--------|--------|-------|
| Funding stage confirmed | 25 | Series A or B from RSS = 25, Seed = 5, Other = 0 |
| Signal recency | 20 | Announced in last 14 days = 20, 15-30 days = 15, 31-90 days = 10, older = 5 |
| No RevOps person | 20 | No RevOps = 20, Has RevOps = 0 |
| Sales team size 2-10 | 15 | 2-5 AEs = 15, 6-10 = 10, 1 or 11+ = 5 |
| Confirmed B2B SaaS | 10 | B2B SaaS confirmed = 10, Unclear = 5, Not SaaS = 0 |
| Contact info found | 10 | CEO email found = 5, GTM leader email found = 5 |

### Tier Assignment

| Tier | Score | Action |
|------|-------|--------|
| A | 75-100 | Priority outreach. Personalized email + LinkedIn. |
| B | 55-74 | Standard sequence. Email first. |
| C | 35-54 | Nurture list. Add to content audience. |
| D | Below 35 | Skip. Doesn't match ICP. |

### Clay Formula (Fit Score)

```
// Pseudocode for Clay formula column
funding_score = IF(funding_stage = "Series A" OR "Series B", 25, IF(funding_stage = "Seed", 5, 0))
recency_score = IF(signal_date > TODAY() - 14, 20, IF(signal_date > TODAY() - 30, 15, IF(signal_date > TODAY() - 90, 10, 5)))
revops_score = IF(has_revops_person = FALSE, 20, 0)
sales_score = IF(sales_team_size >= 2 AND sales_team_size <= 5, 15, IF(sales_team_size >= 6 AND sales_team_size <= 10, 10, 5))
b2b_score = IF(is_b2b_saas = TRUE, 10, IF(is_b2b_saas = "Unclear", 5, 0))
contact_score = IF(ceo_email != "", 5, 0) + IF(gtm_leader_email != "", 5, 0)

fit_score = funding_score + recency_score + revops_score + sales_score + b2b_score + contact_score
```

### Tier Formula

```
tier = IF(fit_score >= 75, "A", IF(fit_score >= 55, "B", IF(fit_score >= 35, "C", "D")))
```

---

## Step 5: AI Personalization Column

### Clay AI enrichment: "Use AI" (GPT/Claude)

**Prompt template for outreach angle:**

```
You are writing a one-sentence outreach angle for a sales email.

Company: {Company Name}
Description: {Company Description}
Funding announcement: {Funding Headline}
Round: {Funding Stage}, raised {Funding Amount} on {Signal Date}
Investors: {Investors}
Sales team: {Sales Team Size} AEs, no dedicated RevOps person
CEO: {CEO Name}

Write a one-sentence opening line that:
1. References the specific funding announcement (round, amount, or investor name)
2. Connects to what happens next: scaling the sales team without infrastructure
3. Sounds like a peer, not a salesperson
4. Is under 20 words

Do not use em dashes. Do not use exclamation marks.

Example: "Saw the $12M Series A with Accel. When you start scaling the sales team, the infrastructure question comes fast."
```

---

## Step 6: Outreach Timing Model

### Why NOT to Reach Out Immediately

Founders get 50-100 "congrats on your raise" emails within days of an announcement. Every agency, tool vendor, recruiter, and AI company piles on. Reaching out immediately puts you in the noisiest inbox moment of the year.

**The RSS feed is for sourcing, not for immediate outreach.**

### The 60-Day Warming Sequence

| Timing | Action | Channel | Goal |
|--------|--------|---------|------|
| Day 1 | Add to Clay. Enrich. Follow founder on LinkedIn. | Clay + LinkedIn | Build the file. No contact. |
| Days 1-14 | Engage with founder's LinkedIn posts. Comment with real takes, not "great post." 2-3 comments. | LinkedIn (organic) | Build name recognition. They see you in their notifications. |
| Days 14-30 | Send LinkedIn connection request. Short note referencing one of their posts you engaged with. No pitch. | LinkedIn | Warm connection. You're a person, not a vendor. |
| Days 30-45 | Monitor: has the company started hiring AEs? Posted a RevOps role? Growing the team? Re-enrich in Clay to update sales team size. | Clay enrichment | Confirm the pain is materializing. |
| Days 45-60 | Outreach. Email or DM. Reference the symptom, not the raise. | Email or LinkedIn DM | They're feeling the pain now. The noise is gone. You're already familiar. |

### What the Outreach Message Sounds Like

**Bad (day 1, sounds like everyone else):**
> "Congrats on the Series A! We help companies like yours scale their GTM infrastructure..."

**Good (day 45, references the symptom):**
> "Noticed your team has grown to 4 AEs since the spring. Curious how you're handling account scoring and enrichment, or if the reps are still doing that manually."

**Good (day 60, if they posted a RevOps role):**
> "Saw you're hiring your first RevOps person. That hire takes 3-6 months to ramp. Curious if you'd want the infrastructure in place before they start so they're optimizing on day one, not building from scratch."

No mention of the raise. Just the problem they're living with right now.

### Clay Table: Additional Tracking Columns

| Column | Type | Purpose |
|--------|------|---------|
| Signal Date | Date | When the funding was announced |
| LinkedIn Follow Date | Date | When you started engaging |
| Connection Sent Date | Date | When you sent the connection request |
| Connection Accepted | Boolean | Did they accept? |
| Outreach Date | Date | When you sent the first real message |
| Outreach Channel | Text | Email, LinkedIn DM, or both |
| Response | Text | Their reply (if any) |
| Status | Text | Warming, Connected, Contacted, Replied, Meeting, Closed, Dead |
| Next Action Date | Date | When to take the next step |

### Filter Views in Clay

**View 1: "New signals (engage now)"**
- Signal date in last 14 days
- LinkedIn Follow Date is empty
- Action: Follow and start engaging

**View 2: "Ready to connect"**
- Signal date 14-30 days ago
- LinkedIn Follow Date exists
- Connection Sent Date is empty
- Action: Send connection request

**View 3: "Ready for outreach"**
- Signal date 45+ days ago
- Connection Accepted = TRUE or email found
- Outreach Date is empty
- Has RevOps Person = FALSE
- Action: Send first outreach message

**View 4: "Follow up"**
- Outreach Date exists
- Response is empty
- Outreach Date 7+ days ago
- Action: Follow up or try different channel

### Export Options (for View 3 leads)

**For cold email (Instantly/Smartlead):**
- Export: First Name, Last Name, Email, Company, Outreach Angle, Tier
- Segment by tier: Tier A gets personalized email, Tier B gets standard

**For LinkedIn DM (HeyReach or manual):**
- Tier A: Manual DM (personalized, reference your prior engagement)
- Tier B: HeyReach sequence (connection request + follow-up message)

**For tracking:**
- Keep master Clay table as source of truth
- Update Status column as leads progress through the warming sequence

---

## Step 7: Daily and Weekly Cadence

### Daily (15 min, morning)

| Action | Time | How |
|--------|------|-----|
| Review RSS feed, add new companies to Clay | 5 min | Scan announcements. Add qualifying B2B SaaS raises. |
| Run enrichments on new rows | 2 min | Click "enrich" on new rows. Clay does the rest. |
| Check "New signals" view: follow founders on LinkedIn | 3 min | Follow 1-3 new founders. Like or comment on a recent post. |
| Check "Ready to connect" view: send connection requests | 3 min | Send 1-2 personalized connection requests. |
| Check "Ready for outreach" view: send messages | 2 min | Send 1-2 outreach emails or DMs to warmed leads. |

### Weekly (30 min, Monday)

| Action | Time | How |
|--------|------|-----|
| LinkedIn Jobs search for RevOps postings | 10 min | Run saved search. Add new companies to Clay with "Hiring RevOps" signal. |
| Review pipeline across all views | 10 min | How many in each stage? Any stuck? Any ready to move forward? |
| Engagement session: comment on 5 founder posts | 10 min | Target founders from "engage now" and "ready to connect" views. |

### Monthly (1 hour)

| Action | How |
|--------|-----|
| Re-enrich existing leads | Re-run "Find People" to catch new RevOps hires (deprioritize if hired) |
| Re-enrich sales team size | Check if AE count has grown (stronger pain signal) |
| Dead lead cleanup | Remove Tier D, non-responders after 3 touches |
| Source analysis | Which signal (RSS vs. job posting) produced better conversations? |
| Timing analysis | Which outreach window (30 day, 45 day, 60 day) got the best reply rates? |

---

## Expected Output

**Daily from RSS feed:** 3-10 funding announcements. After B2B SaaS filter: 1-3 qualifying companies per day.

**Weekly new adds:** 5-15 new companies in Clay. After enrichment and scoring: 3-8 Tier A/B.

**Warming pipeline (building over time):**
- Week 1-2: Mostly sourcing and following. Few outreach-ready leads yet.
- Week 4-6: First batch of leads hit the 45-day mark. Outreach begins.
- Week 8+: Steady state. New leads entering, warmed leads reaching outreach window daily.

**Monthly at steady state:** 12-30 warmed Tier A/B leads reaching outreach window. At 5-10% reply rate (warmed, not cold): 1-3 qualified conversations.

**Key advantage:** You're not cold. By the time you reach out, the founder has seen your name, accepted your connection, and the raise-day noise is long gone. The reply rate on a warmed lead with a symptom-based message is 2-3x a cold "congrats on your raise" email.

---

## Setup Checklist

- [ ] Create Sales Navigator saved searches (3 searches from Step 1)
- [ ] Create Clay table with column structure from Step 2
- [ ] Configure enrichment sequence (company, people, email)
- [ ] Build scoring formula
- [ ] Build tier formula
- [ ] Configure AI outreach angle column
- [ ] Create filtered view for qualified leads
- [ ] Run first batch and validate results
- [ ] Export first Tier A list to outreach tool
- [ ] Set calendar reminder for bi-weekly refresh

---

## Related Files

- `/content/insights/2026-01-31_driveroi-legacy-b2b-positioning-session.md` - Positioning and messaging
- `/docs/sops/linkedin-dm-email-multichannel-cadence.md` - Outreach cadence once leads are identified
- `/content/linkedin-content-drafts.md` - LinkedIn posts to support outbound with inbound credibility
