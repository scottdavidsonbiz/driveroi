# DriveROI Ops - V1 Technical Plan

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         VERCEL                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    NEXT.JS APP                          ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ││
│  │  │    Pages     │  │     API      │  │  Components  │  ││
│  │  │  /dashboard  │  │ /api/leads   │  │   shadcn/ui  │  ││
│  │  │  /clients    │  │ /api/clients │  │   + custom   │  ││
│  │  │  /sops       │  │ /api/sync    │  │              │  ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘  ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
    ┌────────────┐      ┌────────────┐       ┌────────────┐
    │  SUPABASE  │      │   CLAUDE   │       │    APIs    │
    │  Postgres  │      │    API     │       │ Instantly  │
    │  Storage   │      │            │       │ HeyReach   │
    └────────────┘      └────────────┘       └────────────┘
```

---

## Project Structure

```
context-os/
├── .specify/                    # Spec-kit specs (this folder)
├── app/                         # Next.js App Router
│   ├── layout.tsx              # Root layout with fonts, theme
│   ├── page.tsx                # Dashboard (home)
│   ├── clients/
│   │   ├── page.tsx            # Client list
│   │   ├── new/page.tsx        # Client intake wizard
│   │   └── [id]/
│   │       ├── page.tsx        # Client detail (overview)
│   │       ├── icp/page.tsx    # ICP & messaging tab
│   │       ├── leads/page.tsx  # Leads tab
│   │       └── campaigns/page.tsx
│   ├── sops/
│   │   ├── page.tsx            # SOP list/search
│   │   └── [...slug]/page.tsx  # SOP detail (dynamic)
│   └── api/
│       ├── leads/
│       │   ├── route.ts        # GET list, POST create
│       │   └── check/route.ts  # GET check existence
│       ├── clients/
│       │   ├── route.ts        # GET list, POST create
│       │   └── [id]/
│       │       ├── route.ts    # GET, PATCH client
│       │       └── analyze/route.ts  # POST trigger AI
│       ├── reports/
│       │   └── [clientId]/route.ts   # GET report (md/pdf)
│       └── sync/
│           ├── instantly/route.ts
│           └── heyreach/route.ts
├── components/
│   ├── ui/                     # shadcn components
│   ├── layout/                 # Header, Sidebar, etc.
│   ├── clients/                # Client-specific components
│   ├── leads/                  # Lead table, forms
│   └── reports/                # Report preview, export
├── lib/
│   ├── supabase.ts            # Supabase client
│   ├── claude.ts              # Claude API helpers
│   ├── instantly.ts           # Instantly API client
│   ├── heyreach.ts            # HeyReach API client
│   ├── markdown.ts            # Markdown parsing for SOPs
│   └── pdf.ts                 # PDF generation
├── docs/                       # Existing SOPs (rendered in app)
├── content/                    # Existing content
└── public/
    └── fonts/                  # Figtree font files
```

---

## Database Schema (Supabase)

### Tables

```sql
-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client materials (transcripts, notes, etc.)
CREATE TABLE client_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'transcript', 'notes', 'website_scrape'
  filename TEXT,
  content TEXT,
  storage_path TEXT, -- for file uploads
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client ICP and positioning (AI-generated, human-edited)
CREATE TABLE client_icp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE UNIQUE,
  buyer_persona TEXT,
  company_size TEXT,
  industry TEXT,
  geography TEXT,
  triggers JSONB, -- array of trigger events
  pain_points JSONB, -- array of pain points
  positioning TEXT,
  email_angles JSONB, -- array of {angle, subject, preview}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads (enriched, for deduplication)
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  email TEXT,
  domain TEXT,
  first_name TEXT,
  last_name TEXT,
  title TEXT,
  company TEXT,
  linkedin_url TEXT,
  enriched_at TIMESTAMPTZ,
  source TEXT, -- 'clay', 'apollo', 'manual'
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes for fast lookups
  CONSTRAINT unique_email UNIQUE (email)
);

CREATE INDEX idx_leads_domain ON leads(domain);
CREATE INDEX idx_leads_client ON leads(client_id);

-- Campaign stats snapshots
CREATE TABLE campaign_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'instantly', 'heyreach'
  campaign_id TEXT,
  campaign_name TEXT,
  snapshot_date DATE DEFAULT CURRENT_DATE,
  sent INTEGER DEFAULT 0,
  opened INTEGER DEFAULT 0,
  replied INTEGER DEFAULT 0,
  bounced INTEGER DEFAULT 0,
  meetings INTEGER DEFAULT 0,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(platform, campaign_id, snapshot_date)
);
```

### Row Level Security

Disabled for V1 (no auth). Will enable when auth is added.

---

## External API Integration

### Instantly API

```typescript
// lib/instantly.ts
const INSTANTLY_API = 'https://api.instantly.ai/api/v1';

export async function getCampaigns(apiKey: string) {
  const res = await fetch(`${INSTANTLY_API}/campaign/list?api_key=${apiKey}`);
  return res.json();
}

export async function getCampaignStats(apiKey: string, campaignId: string) {
  const res = await fetch(
    `${INSTANTLY_API}/analytics/campaign/summary?api_key=${apiKey}&campaign_id=${campaignId}`
  );
  return res.json();
}
```

### HeyReach API

```typescript
// lib/heyreach.ts
const HEYREACH_API = 'https://api.heyreach.io/api/v1';

export async function getCampaigns(apiKey: string) {
  const res = await fetch(`${HEYREACH_API}/campaigns`, {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  return res.json();
}
```

### Claude API (Transcript Analysis)

```typescript
// lib/claude.ts
import Anthropic from '@anthropic-ai/sdk';

export async function analyzeClientMaterials(materials: string[]) {
  const anthropic = new Anthropic();

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `Analyze these client materials and extract:
        1. ICP (buyer persona, company size, industry, geography, trigger events)
        2. Pain points (3-5 specific problems)
        3. Positioning statement (1-2 sentences)
        4. Email angles (2-3 approaches with suggested subject lines)

        Return as JSON.

        Materials:
        ${materials.join('\n\n---\n\n')}`
    }]
  });

  return JSON.parse(response.content[0].text);
}
```

---

## Key Components

### Client Intake Wizard

```
Step 1: Basic Info
  - Client name (required)
  - Website URL (optional, will scrape if provided)
  - Industry (optional)

Step 2: Upload Materials
  - Drag & drop transcript files
  - Or paste text directly
  - Can add multiple

Step 3: AI Analysis
  - Show loading state
  - Display extracted ICP, pain points, positioning
  - Allow inline edits

Step 4: Confirm
  - Review final version
  - Save to database
```

### Report Generator

```typescript
// Markdown template
const generateReportMarkdown = (client, stats) => `
# ${client.name} - Weekly Report
*Generated: ${new Date().toLocaleDateString()}*

## Campaign Performance

### Email (Instantly)
| Metric | This Week | Total |
|--------|-----------|-------|
| Sent | ${stats.email.sent} | ${stats.email.totalSent} |
| Opens | ${stats.email.opened} (${stats.email.openRate}%) | - |
| Replies | ${stats.email.replied} (${stats.email.replyRate}%) | - |

### LinkedIn (HeyReach)
| Metric | This Week | Total |
|--------|-----------|-------|
| Requests | ${stats.linkedin.sent} | - |
| Accepted | ${stats.linkedin.accepted} (${stats.linkedin.acceptRate}%) | - |
| Replies | ${stats.linkedin.replied} | - |

## Meetings Booked
${stats.meetings} this week

---
*Report generated by DriveROI Ops*
`;
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

ANTHROPIC_API_KEY=xxx

INSTANTLY_API_KEY=xxx
HEYREACH_API_KEY=xxx
```

---

## Build Order

Based on dependencies:

1. **Foundation** - Next.js setup, Supabase connection, base layout
2. **Client CRUD** - Create/list/view clients (no AI yet)
3. **Client Intake** - File upload, AI analysis, ICP storage
4. **Lead Storage** - Database + REST API for Clay
5. **Campaign Sync** - Instantly/HeyReach API integration
6. **Reporting** - Markdown generation, PDF export
7. **SOPs Viewer** - Markdown rendering from docs/

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Instantly API rate limits | Cache stats, sync once daily |
| HeyReach API incomplete | Build UI to work without it initially |
| Claude API costs | Limit analysis to intake flow only |
| PDF generation complexity | Start with Markdown, add PDF later |
