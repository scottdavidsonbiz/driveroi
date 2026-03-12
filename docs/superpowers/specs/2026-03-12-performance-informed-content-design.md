# Performance-Informed Content Creation — Design Spec

**Date:** 2026-03-12
**Status:** Approved

## Problem

LinkedIn content creation and performance tracking are siloed. The `linkedin-content-creator` skill generates posts without knowing what's worked before. The Vercel app tracks metrics and engagers but doesn't surface insights at the moment of content planning. There is no feedback loop from "what performed well with ICP buyers" to "what to create next."

## Solution

A **performance brief** — a structured summary of what content works for Scott's ICP audience — that feeds into both the AI skill (at draft time) and the Vercel app (at planning time).

The brief introduces **ICP-weighted scoring**: not just raw engagement, but how much of that engagement comes from revenue leaders (VP Marketing, CRO, CMO, etc.) vs. non-ICP titles.

## Architecture Overview

```
linkedin_metrics (Supabase)  ──┐
                                ├──→  lib/performance-brief.ts  ──→  Performance Brief (JSON + Markdown)
post_engagers (Supabase)     ──┘           │                              │
                                           │                              ├──→  linkedin-content-creator skill (reads brief before generating)
                                           │                              ├──→  /content/ideas page (sidebar panel)
                                           │                              └──→  content/linkedin-performance-brief.md (file for skill access)
                                           │
                                           ├──→  /api/content/brief (GET endpoint for app)
                                           └──→  Auto-triggered on CSV import + engager webhook
```

## Unit 1: ICP Tier Classification

**Purpose:** Assign an ICP tier (0-3) to each engager based on job title.

**Interface:** `classifyEngagerTier(title: string): { tier: number; label: string }`

**Location:** `lib/icp-tiers.ts`

### Tier Definitions

| Tier | Weight | Label | Title Patterns |
|------|--------|-------|----------------|
| 3 | 3 | Buyer | VP Marketing, VP Sales, CRO, CMO, VP RevOps, VP Revenue, VP Growth, Head of Growth, Chief Revenue Officer, Chief Marketing Officer |
| 2 | 2 | Influencer | Director Marketing, Director Sales Ops, Director RevOps, Director Demand Gen, Head of Demand Gen, Head of Marketing, Head of Revenue Operations, Director Growth |
| 1 | 1 | Adjacent | Marketing Manager, RevOps Manager, Sales Ops Manager, Demand Gen Manager, Growth Manager, GTM Manager |
| 0 | 0 | Non-ICP | Everything else (SDR, BDR, Consultant, Student, Engineer, etc.) |

**Matching rules:**
- Case-insensitive substring match against the `title` field from `post_engagers`
- Match longest pattern first to avoid false positives (e.g., "VP Marketing" before "Marketing")
- Null or empty titles classify as tier 0
- The tier definitions are a plain TypeScript array — easy to edit as Scott's ICP evolves

### Exported Types

```typescript
interface TierDefinition {
  tier: number       // 0-3
  label: string      // "Buyer", "Influencer", "Adjacent", "Non-ICP"
  weight: number     // Same as tier value
  patterns: string[] // Title substrings to match
}

interface ClassifiedEngager {
  tier: number
  label: string
  weight: number
  name: string | null
  title: string | null
  company: string | null
}
```

## Unit 2: Performance Brief Generator

**Purpose:** Query metrics + engagers, compute ICP scores, and produce a structured brief.

**Interface:** `generatePerformanceBrief(): Promise<PerformanceBrief>`

**Location:** `lib/performance-brief.ts`

### Input Data

1. All rows from `linkedin_metrics` (post-level performance)
2. All rows from `post_engagers` (enriched profiles with titles)
3. Engagers are linked to metrics via `post_id` on `post_engagers` joining to `post_id` on `linkedin_metrics`

### Per-Post ICP Score

For each post that has engager data:

```
icp_score = sum(engager_tier_weights) / total_engagers_for_post
```

- Range: 0.0 (no ICP engagement) to 3.0 (every engager is a buyer)
- Posts with no engager data get `icp_score: null` (not zero — absence of data is different from bad data)

### Brief Structure (JSON)

```typescript
interface PerformanceBrief {
  generated_at: string           // ISO timestamp
  confidence: "low" | "moderate" | "high"  // Based on sample size
  sample_size: {
    total_posts: number
    posts_with_engager_data: number
    total_engagers: number
  }

  icp_insights: {
    overall_tier_distribution: {
      tier_3_buyer_pct: number
      tier_2_influencer_pct: number
      tier_1_adjacent_pct: number
      tier_0_non_icp_pct: number
    }
    top_posts_by_icp_score: PostSummary[]     // Top 5
    bottom_posts_by_icp_score: PostSummary[]   // Bottom 3
    icp_trend: "improving" | "declining" | "stable" | "insufficient_data"
  }

  reach_insights: {
    top_posts_by_impressions: PostSummary[]    // Top 5
    avg_impressions: number
    avg_engagement_rate: number
  }

  patterns: {
    best_hooks_for_icp: HookPattern[]          // Hook styles ranked by avg ICP score
    best_days_for_icp: DayPattern[]            // Days ranked by avg ICP score
    best_formats_for_icp: FormatPattern[]      // Formats ranked by avg ICP score
    reach_vs_icp_divergence: string[]          // Posts where reach was high but ICP score was low (or vice versa)
  }

  avoid: string[]                // Plain-English rules derived from data
  tactical_rules: string[]       // Plain-English recommendations derived from data
}

interface PostSummary {
  published_at: string
  hook: string              // First ~80 chars of post_text
  impressions: number
  engagement_rate: number
  icp_score: number | null
  tier_breakdown: { tier_3: number; tier_2: number; tier_1: number; tier_0: number }
}

interface HookPattern {
  style: string             // "question-list", "contrarian", "data-led", "story", "direct"
  avg_icp_score: number | null
  avg_impressions: number
  sample_size: number
}

interface DayPattern {
  day: string
  avg_icp_score: number | null
  avg_impressions: number
  sample_size: number
}

interface FormatPattern {
  format: string
  avg_icp_score: number | null
  avg_impressions: number
  sample_size: number
}
```

### Confidence Levels

| Posts with Engager Data | Confidence |
|------------------------|------------|
| < 5 | low |
| 5-15 | moderate |
| > 15 | high |

When confidence is "low", the brief still generates but `patterns` and `avoid` sections include explicit caveats (e.g., "Based on 3 posts with engager data. Treat as directional, not conclusive.").

### Markdown Output

The generator also writes a human-readable version to `content/linkedin-performance-brief.md`. This is what the `linkedin-content-creator` skill reads. Structure:

```markdown
# LinkedIn Performance Brief
> Auto-generated [timestamp]. Confidence: [level] (N posts, M with engager data).

## What's Working for ICP
[Top 3 posts by ICP score with hook, topic, and tier breakdown]
[Pattern: "Question-list hooks average ICP score 2.4 vs 0.3 for contrarian hooks"]

## What's Working for Reach
[Top 3 posts by impressions]
[Note divergence from ICP: "Your highest-reach post (2,353 impressions) had 0 Tier 1 engagers"]

## What to Avoid
[Bullet list of data-backed rules]

## ICP Audience Quality
[Tier distribution percentages]
[Trend: improving/declining/stable]

## Tactical Rules
[Best days, hook lengths, format preferences — all derived from ICP scoring, not raw engagement]
```

### Hook Style Classification

The generator classifies hooks into styles by pattern matching on the first line of `post_text`:

| Style | Detection Pattern |
|-------|-------------------|
| question-list | Starts with a question + contains numbered/bulleted items |
| contrarian | Contains "but", "actually", "wrong", "stop", or negation in first sentence |
| data-led | Contains a number, percentage, or "$" in first line |
| story | Starts with "I", "We", "Last week", temporal reference |
| direct | Imperative opening or declarative statement |
| observation | "Most companies...", "Every time I...", general observation pattern |

This is heuristic, not ML. Good enough for pattern detection at current scale.

## Unit 3: Brief API Endpoint

**Purpose:** Serve the brief as JSON for the app frontend.

**Location:** `app/api/content/brief/route.ts`

### GET /api/content/brief

Returns the current performance brief as JSON. If none exists yet, generates one on the fly.

**Response:** `{ brief: PerformanceBrief }`

### POST /api/content/brief

Force-regenerates the brief. Called by:
- The "Refresh" button in the app
- Triggered after CSV import (from `/api/content/metrics` POST handler)
- Triggered after engager webhook (from `/api/content/engagers` POST handler)

**Response:** `{ brief: PerformanceBrief, generated_at: string }`

### Auto-Regeneration

After a successful import or engager insertion, the existing API routes call the brief generator:

```typescript
// In /api/content/metrics POST handler, after successful insert:
await generateAndStoreBrief()

// In /api/content/engagers POST handler, after successful insert:
await generateAndStoreBrief()
```

`generateAndStoreBrief()` calls `generatePerformanceBrief()`, writes the markdown file, and returns the JSON. This is fire-and-await (not fire-and-forget — the response waits for brief generation to complete, since it's a fast operation: just two Supabase queries + local computation).

## Unit 4: Skill Integration

**Purpose:** The `linkedin-content-creator` skill reads the performance brief before generating posts.

### Changes to `linkedin-content-creator` SKILL.md

Add a new **Step 1.5: Read Performance Brief** between "Understand the Input" and "Extract Takeaways":

```
### Step 1.5: Read Performance Brief

Before generating content, read the performance brief at `content/linkedin-performance-brief.md`.

Use it to:
- **Bias hook selection** toward styles with higher ICP scores
- **Prefer topics/formats** that attract Tier 1-2 engagers
- **Avoid patterns** listed in the "What to Avoid" section
- **Calibrate length** based on what's worked (if the brief says short posts outperform, keep it tight)

The brief is guidance, not a straitjacket. If the input material calls for a format that hasn't performed well yet, write it anyway — but note the deviation. New formats need testing.

If the brief doesn't exist yet or has low confidence, proceed normally and note that performance data is limited.
```

### Changes to `linkedin-performance` SKILL.md

The "Analyze" mode (mode 2) should also regenerate the brief file. Add to the analyze process:

```
After writing the analysis to content/linkedin-performance-analysis.md,
also regenerate the performance brief at content/linkedin-performance-brief.md
by reading engager data from Supabase (or from the app's brief API if running outside the app context).
```

The "Recommend" mode (mode 3) should reference the brief's ICP scoring rather than only raw engagement.

## Unit 5: App Sidebar Component

**Purpose:** Show performance insights on the `/content/ideas` page so Scott sees what's working when planning content.

**Location:** New component at `components/content/performance-insights-panel.tsx`

### Behavior

- Fetches from `GET /api/content/brief` on mount
- Renders as a collapsible sidebar panel on the right side of the ideas page
- Collapsed by default on mobile, expanded on desktop

### Content (compact view)

```
Performance Insights          [Refresh ↻]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ICP Quality: 34% Tier 1-2     ▲ improving

Top patterns for ICP:
• Question-list hooks (ICP: 2.4)
• Thursday posts (ICP: 2.1)
• BOF/tactical format (ICP: 1.8)

Avoid:
• Reshares (0 engagement)
• Wednesday posts (below avg)

Based on 12 posts, 8 with engager data.
[View full brief →]
```

### "View full brief" expands to show:
- Full tier distribution chart (horizontal stacked bar)
- Top 5 posts by ICP score (title, score, tier breakdown)
- Reach vs. ICP divergence highlights
- All tactical rules

### No engager data state

If no engagers have been scraped yet, show:

```
Performance Insights
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
No engager data yet.
Scrape post engagers from the Performance tab
to start tracking ICP engagement quality.
```

## Data Flow Summary

```
1. Scott uploads LinkedIn CSV → /api/content/metrics
   → Stores in linkedin_metrics
   → Auto-regenerates brief (JSON + markdown)

2. Scott clicks "Scrape Engagers" → /api/content/scrape → Apify → Clay → /api/content/engagers
   → Stores in post_engagers
   → Auto-regenerates brief (JSON + markdown)

3. Scott opens /content/ideas page
   → Sidebar fetches GET /api/content/brief
   → Shows ICP-weighted insights

4. Scott invokes linkedin-content-creator skill
   → Skill reads content/linkedin-performance-brief.md
   → Generates posts biased toward ICP-proven patterns

5. Scott runs linkedin-performance skill (analyze mode)
   → Regenerates both analysis and brief files
```

## New Files

| File | Purpose |
|------|---------|
| `lib/icp-tiers.ts` | Tier definitions + `classifyEngagerTier()` |
| `lib/performance-brief.ts` | `generatePerformanceBrief()` + `generateAndStoreBrief()` |
| `app/api/content/brief/route.ts` | GET/POST brief API |
| `components/content/performance-insights-panel.tsx` | Sidebar component |
| `content/linkedin-performance-brief.md` | Generated brief (skill reads this) |

## Modified Files

| File | Change |
|------|--------|
| `.claude/skills/linkedin-content-creator/SKILL.md` | Add Step 1.5 (read brief) |
| `.claude/skills/linkedin-performance/SKILL.md` | Analyze mode also regenerates brief; Recommend mode uses ICP scoring |
| `app/api/content/metrics/route.ts` | Call `generateAndStoreBrief()` after successful import |
| `app/api/content/engagers/route.ts` | Call `generateAndStoreBrief()` after successful insert |
| `app/content/ideas/page.tsx` | Does not exist yet — will be created as part of content hub implementation, includes sidebar |
| `app/content/performance/page.tsx` | Add "Refresh Brief" button |

## Database Changes

None. All existing tables (`linkedin_metrics`, `post_engagers`) already have the fields needed. ICP scoring is computed at read time, not stored.

## Out of Scope

- ML-based title classification (keyword matching is sufficient at current scale)
- Predictive scoring per content idea (revisit at 20+ posts with engager data)
- Automated engager scraping (manual trigger is fine)
- Company-level ICP filtering (e.g., by company size) — title tier is the starting point
- Direct LinkedIn API integration
