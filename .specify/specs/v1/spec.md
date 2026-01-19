# DriveROI Ops - V1 Specification

## Overview

**Product:** DriveROI Ops
**Version:** 1.0
**Purpose:** Internal ops platform for managing clients, ICP development, lead deduplication, and campaign reporting.

---

## Target Users

| User | Role | Primary Use Cases |
|------|------|-------------------|
| Scott | Founder | Client strategy, ICP refinement, reporting |
| Brenda | Team Member | Client setup, lead management, daily ops |
| Future Hires | Operators | Execute playbooks, follow SOPs, manage campaigns |

---

## Problem Statement

Client information is scattered across:
- Markdown files in this repo
- Clay tables
- Instantly campaigns
- HeyReach campaigns
- Call transcripts in various formats

This causes:
- Duplicate enrichment spend (re-enriching leads Clay already processed)
- Manual reporting (copy-pasting stats into client updates)
- Tribal knowledge (no centralized ICP/positioning docs)
- Onboarding friction (new hires can't find SOPs)

---

## User Stories

### Client Intake

```
As an operator,
I want to upload call transcripts and notes for a new client,
So that AI can extract ICP, pain points, and positioning automatically.

Acceptance Criteria:
- Can create a new client with name and website
- Can upload transcript files (.txt, .srt, .md) or paste text
- AI processes materials and extracts:
  - ICP (buyer persona, company size, industry, geography, triggers)
  - Pain points (3-5 bullets)
  - Positioning statement (draft)
  - Email angles (2-3 suggestions)
- Can review and edit AI-generated content
- All materials stored and linked to client
```

### Client Dashboard

```
As an operator,
I want to view a client's ICP, positioning, and campaign performance in one place,
So that I can quickly get context before calls or when writing copy.

Acceptance Criteria:
- Client list view showing all clients with quick stats
- Client detail page with:
  - ICP and positioning (editable)
  - Email angles with performance data (if available)
  - Source materials (transcripts, notes)
  - Campaign stats summary
- Can edit ICP/positioning inline
- Can add new source materials anytime
```

### Lead Storage & Deduplication

```
As an operator,
I want to check if a lead has already been enriched,
So that we don't pay Clay twice for the same data.

Acceptance Criteria:
- Leads stored in Supabase with key fields (email, domain, company, enriched_at)
- REST API endpoint: GET /api/leads/check?email=x or ?domain=x
- Returns: { exists: true/false, lead: {...} if exists }
- Can view leads by client in the UI
- Can manually add leads (for imports from other sources)
```

### Campaign Reporting

```
As an operator,
I want to pull campaign stats from Instantly and HeyReach,
So that I can generate client reports without manual data entry.

Acceptance Criteria:
- Connect to Instantly API (store API key in env)
- Connect to HeyReach API (store API key in env)
- Pull stats: sent, opened, replied, bounced, meetings booked
- Aggregate by client (using tags/campaign names)
- Display in client dashboard
- Export as Markdown or PDF
```

### SOPs & Knowledge Base

```
As an operator,
I want to browse and search SOPs,
So that I can follow established processes.

Acceptance Criteria:
- Reads markdown files from docs/sops/ folder
- Renders with proper formatting (headers, tables, checklists)
- Searchable by title and content
- Organized by category (client setup, campaigns, etc.)
```

---

## Feature Breakdown

| Feature | Priority | Complexity | Dependencies |
|---------|----------|------------|--------------|
| Client Intake | P0 | High | Claude API, Supabase |
| Client Dashboard | P0 | Medium | Supabase |
| Lead Storage API | P1 | Low | Supabase |
| Campaign Reporting | P1 | Medium | Instantly API, HeyReach API |
| SOPs Viewer | P2 | Low | Filesystem |
| PDF Export | P2 | Low | Client Dashboard |

---

## Data Model (High-Level)

```
clients
  - id, name, website, industry, created_at

client_materials
  - id, client_id, type (transcript/notes/website), content, filename, created_at

client_icp
  - id, client_id, buyer_persona, company_size, industry, geography, triggers, pain_points, positioning, email_angles, updated_at

leads
  - id, client_id, email, domain, first_name, last_name, title, company, linkedin_url, enriched_at, source, raw_data (jsonb)

campaign_stats
  - id, client_id, platform (instantly/heyreach), campaign_name, date, sent, opened, replied, bounced, meetings, raw_data (jsonb)
```

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/leads/check | GET | Check if lead exists (for Clay) |
| /api/leads | POST | Add new lead |
| /api/leads | GET | List leads (with filters) |
| /api/clients | GET/POST | List and create clients |
| /api/clients/[id] | GET/PATCH | Get and update client |
| /api/clients/[id]/analyze | POST | Trigger AI analysis of materials |
| /api/reports/[client_id] | GET | Generate report (accepts format=md or format=pdf) |
| /api/sync/instantly | POST | Pull latest stats from Instantly |
| /api/sync/heyreach | POST | Pull latest stats from HeyReach |

---

## Design Requirements

### Aesthetic

Light version of DriveROI.ai:
- **Background:** White/off-white (#fafafa, #ffffff)
- **Accent:** Purple gradient (#814ac8 → #df7afe)
- **Typography:** Figtree, tight letter-spacing, bold headlines
- **Cards:** Light shadows, subtle purple tint on hover
- **Motion:** Spring animations on page load, staggered reveals

### Key Screens

1. **Dashboard** - Client cards, quick stats, recent activity
2. **Client List** - Table view of all clients
3. **Client Detail** - Tabs: Overview, ICP & Messaging, Leads, Campaigns, Materials
4. **Client Intake** - Multi-step wizard for new client setup
5. **SOPs** - Sidebar navigation, markdown content area, search
6. **Report Preview** - Formatted report with export buttons

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Time to onboard new client | < 10 minutes |
| Lead deduplication rate | Save 30%+ on enrichment |
| Report generation time | < 2 minutes (vs 30+ manual) |
| SOP findability | < 30 seconds to locate any SOP |

---

## Open Questions

1. **HeyReach API limits** - Need to verify rate limits and available endpoints
2. **Instantly tag structure** - Confirm how clients are tagged for filtering
3. **PDF styling** - Use react-pdf or server-side generation?

---

## References

- [DriveROI.ai](https://driveroi.ai/) - Design reference
- [Instantly API Docs](https://developer.instantly.ai/)
- [Supabase Docs](https://supabase.com/docs)
- [Claude API Docs](https://docs.anthropic.com/)
