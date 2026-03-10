# LinkedIn Content Hub — Design Document

**Date:** 2026-03-10
**Authors:** Scott Davidson, Brenda Hali (users), Claude (design)
**Status:** Approved

## Overview

Internal tool within the DriveROI Vercel app for planning, measuring, and extracting pipeline value from LinkedIn content. Two users: Scott (80% tactical/short-form, 20% thought leadership) and Brenda (80% thought leadership/long-form, 20% tactical). Same auth level for both.

## Pages

### `/content/ideas` — Backlog

Quick-capture idea board with prioritization.

- Quick-add bar at top (title + enter)
- Card list, draggable to reorder priority
- Each card: title, author, optional theme tag, status badge
- Click to expand: add notes, assign theme tag, change status
- Filter by: status, author, theme tag
- Promote idea to "planned" → optionally creates a draft post entry

**Statuses:** idea → planned → in_progress → published → archived

### `/content/themes` — Theme Calendar

Weekly/bi-weekly theme coordination.

- Timeline/list view of upcoming and past themes
- Create theme: name, description, date range
- Theme detail: shows Brenda's and Scott's posts grouped under it
- Active theme highlighted at top
- Loose coordination — not a rigid production schedule
- Theme ideas come from: timely events, inspiration, Clay use case backlog (ABM, Signals, CRM Enrichment, etc.)

### `/content/performance` — Analytics Dashboard

LinkedIn CSV import and performance visualization.

- Drag-and-drop CSV upload (LinkedIn post analytics export)
- CSV columns: date, post text, impressions, reactions, comments, reposts, clicks, engagement rate, new followers
- On import: parse, attempt to match to existing `content_posts` by text/date, store in `linkedin_metrics`
- **Charts:**
  - Engagement rate over time
  - Impressions trend
  - Reactions/comments breakdown
  - Day-of-week heatmap (best days per author)
- **Filters:** author, theme, content type (thought leadership vs tactical), date range
- **Table view:** all posts sorted by performance, best performers surface
- **Scrape Engagers button** on each published post (triggers Apify)

### `/content/engagers` — ICP Engagement Feed

Enriched, ICP-qualified engagers from LinkedIn posts.

- List view of enriched profiles grouped by the post they engaged with
- Each engager: name, title, company, LinkedIn URL, email
- Filter by post, date range
- Only ICP-qualified engagers appear (Clay filters out non-ICP before sending to app)
- Slack notification on each new ICP engager

## Data Model

### `content_ideas`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| created_by | text | scott / brenda |
| title | text | Required |
| notes | text | Optional |
| status | text | idea, planned, in_progress, published, archived |
| priority | integer | Sort order for drag-to-reorder |
| theme_tag | text | Optional — "ABM", "Signals", etc. |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `content_themes`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | "ABM Week" |
| description | text | Optional |
| start_date | date | |
| end_date | date | |
| status | text | upcoming, active, completed |
| created_at | timestamptz | |

### `content_posts`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| theme_id | uuid | FK to content_themes, nullable |
| idea_id | uuid | FK to content_ideas, nullable |
| author | text | scott / brenda |
| content_type | text | thought_leadership / tactical |
| funnel_stage | text | top / middle / bottom, nullable |
| post_text | text | Draft or published text |
| linkedin_url | text | Added after publishing |
| status | text | draft, ready, published |
| published_at | timestamptz | |
| created_at | timestamptz | |

### `linkedin_metrics`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| post_id | uuid | FK to content_posts, nullable (matched by text/date) |
| author | text | scott / brenda |
| post_text | text | From CSV |
| published_at | timestamptz | |
| impressions | integer | |
| reactions | integer | |
| comments | integer | |
| reposts | integer | |
| clicks | integer | |
| engagement_rate | numeric | |
| new_followers | integer | |
| imported_at | timestamptz | |

### `post_engagers`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| post_id | uuid | FK to content_posts |
| linkedin_url | text | |
| name | text | |
| title | text | |
| company | text | |
| domain | text | From Clay enrichment |
| email | text | From Clay enrichment |
| enriched_at | timestamptz | |
| created_at | timestamptz | |

## Integration Architecture

### LinkedIn CSV Import

```
User uploads CSV → /api/content/metrics (POST)
  → Parse CSV columns
  → Match to existing content_posts by post_text similarity or published_at date
  → Insert into linkedin_metrics
  → Return import summary
```

### Apify Post Scraper

```
User clicks "Scrape Engagers" on a post → /api/content/scrape (POST)
  → Calls Apify API to run LinkedIn Post Likers/Commenters actor
  → Passes: post URL, webhook callback URL
  → Apify runs scrape (1-3 min)
  → Apify sends results to Clay webhook (not directly to app)
```

Env var: `APIFY_API_KEY`

### Clay Enrichment + ICP Filter

```
Apify → Clay incoming webhook table
  → Enrichment columns: company domain, email, title, company size, ICP score
  → Filter: only rows passing ICP criteria
  → HTTP push column → /api/content/engagers (POST)
  → App stores in post_engagers
  → App sends Slack notification
```

### Slack Notifications

```
New ICP engager received → /api/content/engagers
  → Store in post_engagers
  → POST to SLACK_WEBHOOK_URL with message:
    "[Post title/excerpt] got engagement from [Name], [Title] at [Company]"
    + LinkedIn profile link
```

Uses existing `SLACK_WEBHOOK_URL` env var.

## Auth

Same auth level for both users. No role-based separation. Both see all ideas, posts, themes, analytics, and engagers. Existing app auth flow applies.

## Tech Stack

- **Frontend:** Next.js app router, Tailwind + Radix UI (existing component library)
- **Backend:** Supabase (new tables above)
- **Integrations:** Apify API, Clay webhook, Slack webhook
- **Charts:** Recharts or similar lightweight charting library

## Out of Scope (for now)

- Direct LinkedIn API integration (would require OAuth app approval)
- Post scheduling/auto-publishing
- Client-facing views
- Formal linking between posts and Clay templates (templates are just content fuel)
- AI-generated post drafts (existing linkedin-content-creator skill handles this outside the app)
