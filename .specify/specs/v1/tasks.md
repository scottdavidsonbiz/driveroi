# DriveROI Ops - V1 Tasks

## Overview

Tasks ordered by dependency. Each task is a ~10-15 minute chunk.
Mark status: `[ ]` todo, `[x]` done, `[~]` in progress

---

## Phase 1: Foundation

### 1.1 Project Setup
- [ ] Initialize Next.js 14 app in `/app` folder
- [ ] Configure Tailwind CSS
- [ ] Install shadcn/ui, initialize components
- [ ] Add Figtree font (Google Fonts or local)
- [ ] Create base CSS variables (colors, spacing)

### 1.2 Supabase Setup
- [ ] Create Supabase project
- [ ] Create `clients` table with schema
- [ ] Create `client_materials` table
- [ ] Create `client_icp` table
- [ ] Create `leads` table with indexes
- [ ] Create `campaign_stats` table
- [ ] Install `@supabase/supabase-js`
- [ ] Create `lib/supabase.ts` client helper

### 1.3 Base Layout
- [ ] Create root layout with fonts and theme provider
- [ ] Build sidebar component (navigation)
- [ ] Build header component (breadcrumbs, title)
- [ ] Create page shell component
- [ ] Add route structure (empty pages for now)

**Checkpoint:** App runs locally, navigates between empty pages, connects to Supabase.

---

## Phase 2: Client Management

### 2.1 Client List Page
- [ ] Create `/clients/page.tsx`
- [ ] Build client card component
- [ ] Fetch clients from Supabase
- [ ] Display grid of client cards
- [ ] Add "New Client" button (links to intake)

### 2.2 Client Detail Page (Basic)
- [ ] Create `/clients/[id]/page.tsx`
- [ ] Fetch client by ID
- [ ] Build tabs component (Overview, ICP, Leads, Campaigns, Materials)
- [ ] Display client name, website, created date
- [ ] Link back to client list

### 2.3 Client API Routes
- [ ] Create `/api/clients/route.ts` (GET list, POST create)
- [ ] Create `/api/clients/[id]/route.ts` (GET, PATCH)
- [ ] Test with curl/Postman

**Checkpoint:** Can create clients via API, view them in list and detail pages.

---

## Phase 3: Client Intake (AI-Powered)

### 3.1 Intake Wizard - Step 1
- [ ] Create `/clients/new/page.tsx`
- [ ] Build wizard shell (step indicator, next/back buttons)
- [ ] Create Step 1 form (name, website, industry)
- [ ] Store form state with useState/useReducer

### 3.2 Intake Wizard - Step 2
- [ ] Build file upload component (drag & drop)
- [ ] Build text paste input (textarea)
- [ ] Display list of added materials
- [ ] Store materials in state (not DB yet)

### 3.3 Intake Wizard - Step 3 (AI Analysis)
- [ ] Install `@anthropic-ai/sdk`
- [ ] Create `lib/claude.ts` with analysis function
- [ ] Create `/api/clients/[id]/analyze/route.ts`
- [ ] Build loading state UI (skeleton + spinner)
- [ ] Display extracted ICP, pain points, positioning
- [ ] Make fields editable inline

### 3.4 Intake Wizard - Step 4 (Confirm)
- [ ] Show summary of all data
- [ ] On confirm: create client, materials, ICP in Supabase
- [ ] Redirect to client detail page
- [ ] Show success toast

**Checkpoint:** Full intake flow works. Upload transcript → AI extracts ICP → Save to DB.

---

## Phase 4: Lead Storage API

### 4.1 Lead Check Endpoint
- [ ] Create `/api/leads/check/route.ts`
- [ ] Accept `?email=` or `?domain=` query param
- [ ] Query Supabase for match
- [ ] Return `{ exists: boolean, lead?: object }`
- [ ] Test with curl

### 4.2 Lead CRUD
- [ ] Create `/api/leads/route.ts` (GET list with filters, POST create)
- [ ] Support filters: client_id, domain, date range
- [ ] Validate required fields on POST

### 4.3 Leads UI (Client Tab)
- [ ] Create `/clients/[id]/leads/page.tsx`
- [ ] Build leads table component
- [ ] Fetch leads filtered by client_id
- [ ] Display: name, email, company, title, enriched date
- [ ] Add pagination (20 per page)

**Checkpoint:** Clay can call `/api/leads/check` to avoid duplicate enrichment.

---

## Phase 5: Campaign Reporting

### 5.1 Instantly Integration
- [ ] Create `lib/instantly.ts`
- [ ] Implement `getCampaigns()` function
- [ ] Implement `getCampaignStats()` function
- [ ] Create `/api/sync/instantly/route.ts`
- [ ] Store stats in `campaign_stats` table

### 5.2 HeyReach Integration
- [ ] Research HeyReach API endpoints
- [ ] Create `lib/heyreach.ts`
- [ ] Implement campaign/stats fetching
- [ ] Create `/api/sync/heyreach/route.ts`
- [ ] Store stats in `campaign_stats` table

### 5.3 Campaign Stats UI
- [ ] Create `/clients/[id]/campaigns/page.tsx`
- [ ] Build stats cards (sent, opened, replied, meetings)
- [ ] Build campaign table (by platform)
- [ ] Add "Sync Now" button
- [ ] Show last synced timestamp

### 5.4 Report Generation
- [ ] Create `lib/reports.ts` with Markdown generator
- [ ] Create `/api/reports/[clientId]/route.ts`
- [ ] Accept `?format=md` query param
- [ ] Return markdown as text/plain or file download

### 5.5 PDF Export
- [ ] Install `@react-pdf/renderer` or similar
- [ ] Create `lib/pdf.ts` with PDF generator
- [ ] Accept `?format=pdf` in report endpoint
- [ ] Return PDF as application/pdf

### 5.6 Report Preview UI
- [ ] Create report preview component
- [ ] Add to client detail page
- [ ] Export buttons (Markdown, PDF)
- [ ] Preview rendered markdown

**Checkpoint:** Can sync Instantly/HeyReach stats and export client reports.

---

## Phase 6: SOPs Viewer

### 6.1 SOP Listing
- [ ] Create `/sops/page.tsx`
- [ ] Create `lib/markdown.ts` to read docs/sops folder
- [ ] List all SOP files with titles (parsed from H1)
- [ ] Group by subfolder/category
- [ ] Add search input (filter by title)

### 6.2 SOP Detail
- [ ] Create `/sops/[...slug]/page.tsx`
- [ ] Parse markdown file
- [ ] Render with proper formatting (use `react-markdown`)
- [ ] Support tables, checklists, code blocks
- [ ] Add breadcrumb navigation

### 6.3 SOP Search
- [ ] Implement full-text search across SOP content
- [ ] Highlight matching terms
- [ ] Show snippet in results

**Checkpoint:** All SOPs from docs/ browsable and searchable in app.

---

## Phase 7: Polish & Launch

### 7.1 Dashboard
- [ ] Create `/page.tsx` (home dashboard)
- [ ] Client cards with quick stats
- [ ] This week's aggregate metrics
- [ ] Quick action buttons (New Client, View SOPs)
- [ ] Recent activity feed (optional)

### 7.2 Design Polish
- [ ] Audit all pages for design consistency
- [ ] Add page load animations (staggered fade-in)
- [ ] Add hover states and micro-interactions
- [ ] Ensure purple accent usage is consistent
- [ ] Mobile responsiveness check

### 7.3 Error Handling
- [ ] Add error boundaries
- [ ] API error responses with proper status codes
- [ ] Toast notifications for errors
- [ ] Loading states for all async operations

### 7.4 Deploy
- [ ] Push to GitHub
- [ ] Connect to Vercel
- [ ] Configure environment variables
- [ ] Test production build
- [ ] Share URL with Brenda for testing

**Checkpoint:** App deployed and usable in production.

---

## Parallel Work (Can be done anytime)

These don't block other tasks:

- [ ] Write README.md with setup instructions
- [ ] Document API endpoints in `/api/README.md`
- [ ] Create sample .env.example file
- [ ] Add favicon and meta tags

---

## Task Summary

| Phase | Tasks | Est. Time |
|-------|-------|-----------|
| Foundation | 12 | 2-3 hours |
| Client Management | 7 | 1-2 hours |
| Client Intake | 10 | 2-3 hours |
| Lead Storage | 7 | 1-2 hours |
| Campaign Reporting | 13 | 3-4 hours |
| SOPs Viewer | 6 | 1-2 hours |
| Polish & Launch | 9 | 2-3 hours |
| **Total** | **64** | **12-19 hours** |

---

## Next Actions

When ready to start building:
1. Run Phase 1.1 (Project Setup)
2. Create Supabase project and share connection string
3. Begin Phase 1.2 (Database setup)
