---
title: "GovEagle Account Scoring & Personalization Work Product"
type: insight
use-cases:
  - icp-definition
  - sales-enablement
  - cold-email
personas:
  - ceo-founder
  - vp-sales
created: 2026-02-05
last-updated: 2026-02-05
status: active
integrates-with:
  - .claude/skills/cold-email-outreach/SKILL.md
  - content/insights/2026-01-31_driveroi-legacy-b2b-positioning-session.md
  - content/frameworks/spiced-discovery-template-driveroi.md
key-concepts:
  - public-data-account-scoring
  - usaspending-api
  - ai-personalization-at-scale
  - work-product-as-sales-tool
tags:
  - goveagle
  - govtech
  - account-scoring
  - personalization
  - work-product
  - proof-of-concept
---

# GovEagle Account Scoring & Personalization Work Product

**Date:** February 5, 2026

## Context

Built a proof-of-concept work product to pitch DriveROI's GTM engineering services to GovEagle (AI-powered proposal development platform for federal contractors).

**GovEagle's product:** Automates RFP compliance analysis, proposal outlines, and narrative drafts for GovCons. Cuts proposal prep by 40%.

**Job description requirements we addressed:**
1. Account Identification and Scoring - using USASpending, SAM.gov
2. Personalization at Scale - AI-powered outreach with organizational context

---

## What We Built

### 1. Account Scoring Script (`goveagle_account_scoring.py`)

- Pulls 5,000 contract awards from USASpending.gov API
- Filters by IT/Professional Services NAICS codes
- Aggregates by recipient company
- Scores using 4-factor model (100 points):
  - Value Fit (35 pts): Sweet spot $20M-$100M
  - Volume (25 pts): Award count = proposal activity
  - Agency Diversity (20 pts): Multiple agencies = experienced BD
  - Recency (20 pts): Recent awards = active pipeline
- Tiers accounts A/B/C/D with segment labels
- Enterprise players (>$500M) deprioritized

**Results:** 1,644 contractors scored, 18 Tier A, 351 Tier B

### 2. Personalized Outreach Script (`goveagle_personalized_outreach.py`)

- Reads scored accounts JSON
- Filters to top 20 Tier A/B accounts
- Generates personalized email for each using Claude API
- References specific data: award count, value, agencies
- Matches pain point to their segment/volume

### 3. Scoring Methodology Doc (`goveagle_scoring_methodology.md`)

- Full documentation of model logic
- CSV column reference
- Tier definitions and adjustment rules
- Limitations and potential enhancements

### 4. Presentation Content (`goveagle_presentation_content.md`)

- 10-slide deck outline for pitching to GovEagle
- Content ready to paste into Google Slides template

---

## Key Learnings

### Work Product as Sales Tool
Building a real, working proof of concept is more compelling than a capabilities deck. The scored account list IS the pitch.

### USASpending API
- Free, public, no auth required
- Max 100 results per page (pagination required)
- Sorted by award amount descending
- NAICS filtering works with plain string arrays
- Data may lag 30-90 days

### Scoring Model Design
- Sweet spot sizing matters: $20M-$100M companies are ideal GovEagle targets
- Enterprise downgrade is critical: Booz Allen and Lockheed are not good targets
- Volume + recency together are strongest signals
- Single-award companies dominate at lower thresholds

### Presentation Approach
- 10 slides max for proof of concept
- Let the work product speak for itself
- Lead with the problem, show the results, end with what's next

---

## Files Created (in Downloads)

| File | Purpose |
|------|---------|
| goveagle_account_scoring.py | Runnable scoring script |
| goveagle_scored_accounts.csv | 1,644 scored accounts |
| goveagle_scored_accounts.json | Full data with methodology |
| goveagle_scoring_methodology.md | Model documentation |
| goveagle_personalized_outreach.py | Email generation script |
| goveagle_personalized_emails.txt | 20 sample emails |
| goveagle_personalized_emails.json | Structured email data |
| goveagle_presentation_content.md | 10-slide deck content |

---

## Reusable Patterns

This approach (public data + scoring model + AI personalization) is repeatable for any prospect:

1. Identify relevant public data source for their market
2. Build scoring model aligned to their ICP
3. Pull and score accounts
4. Generate personalized outreach
5. Package as proof of concept

---

## Related Files

- `/content/insights/2026-01-31_driveroi-legacy-b2b-positioning-session.md` - Current DriveROI positioning
- `/.claude/skills/cold-email-outreach/` - Email generation framework
- `/content/frameworks/spiced-discovery-template-driveroi.md` - Discovery call template
