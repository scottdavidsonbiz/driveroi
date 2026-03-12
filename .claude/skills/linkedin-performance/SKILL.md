---
name: linkedin-performance
description: Tracks LinkedIn post performance and analyzes patterns to improve future content. Use when the user wants to log LinkedIn post metrics, analyze what content is working, review performance trends, or get data-driven recommendations for future posts. Also use when the user mentions "post performance," "what's working on LinkedIn," "LinkedIn analytics," "log my post," or "content performance review." Integrates with linkedin-content-creator to feed insights into new post generation.
---

# LinkedIn Performance Tracker

**Version:** 1.0.0
**Purpose:** Log post metrics, identify patterns, and generate data-driven content recommendations
**Data file:** `content/linkedin-performance-data.json`

## Modes

This skill operates in three modes based on user intent:

### 1. Log — Add post performance data

User provides post details and metrics. Skill appends to data file.

**Required fields:**
- `date` — When the post was published (YYYY-MM-DD)
- `text` — Full post text (or a summary/first line if long)
- `impressions` — Total impressions
- `reactions` — Total reactions (likes, celebrates, etc.)

**Optional fields:**
- `comments` — Number of comments
- `shares` — Number of reposts/shares
- `profile_visits` — Profile visits attributed to this post (if available)
- `follows` — New followers from this post (if available)
- `format` — Post format: `text`, `image`, `carousel`, `video`, `poll`, `document`
- `pillar` — Content pillar: `infrastructure-gaps`, `education`, `operator-perspective`, `contrarian`, `personal`
- `hook` — The first line of the post (for hook analysis)
- `topic` — Brief topic label (e.g., "volume vs targeting", "CRM migration")
- `day_of_week` — Auto-derived from date if not provided
- `notes` — Any qualitative observations (e.g., "got reshared by someone with 50K followers")

**Process:**
1. Read existing data file at `content/linkedin-performance-data.json` (create if missing)
2. Parse user input — they may paste raw metrics, use a structured format, or describe casually
3. Calculate derived fields:
   - `engagement_rate` = (reactions + comments + shares) / impressions × 100
   - `day_of_week` from date
4. Append the new entry to the `posts` array
5. Write updated data file
6. Confirm what was logged and show the calculated engagement rate

**If user provides multiple posts at once**, log them all in a single batch.

### 2. Analyze — Review performance patterns

Reads all logged data and identifies patterns. Run this after logging 5+ posts.

**Process:**
1. Read `content/linkedin-performance-data.json`
2. Calculate aggregate stats — see `references/analysis-framework.md`
3. Present findings using the analysis template
4. Write analysis to `content/linkedin-performance-analysis.md`
5. Also regenerate the performance brief at `content/linkedin-performance-brief.md` by calling the brief API (`POST /api/content/brief`) or, if running outside the app context, by reading engager data from Supabase directly. The brief uses ICP-weighted scoring from the `post_engagers` table — see `lib/performance-brief.ts` for the generator.

**Key analyses:**
- Overall stats (total posts, avg impressions, avg engagement rate)
- Top 5 and bottom 5 posts by engagement rate
- Performance by content pillar
- Performance by format
- Performance by day of week
- Hook pattern analysis (what opening styles work)
- Trend over time (are metrics improving?)
- Engagement rate distribution

### 3. Recommend — Suggest next content

Uses analysis to recommend what to post next. Best used right before invoking `linkedin-content-creator`.

**Process:**
1. Run analysis (mode 2) if not recently done
2. Identify top-performing patterns **weighted by ICP score, not just raw engagement**. A post with high impressions but low ICP score (many non-buyer engagers) should rank lower than a post with moderate reach but high Tier 1-2 engagement.
3. Read the performance brief at `content/linkedin-performance-brief.md` for pre-computed ICP patterns, tier distribution, and tactical rules.
4. Identify gaps (pillars or formats not tested enough)
4. Generate 3-5 specific recommendations with rationale:
   - "Double down" recs (what's proven to work)
   - "Test" recs (promising areas with insufficient data)
   - "Retire" recs (what consistently underperforms)
5. Output recommendations that can feed directly into content creation

## Data File Format

`content/linkedin-performance-data.json`:
```json
{
  "meta": {
    "account": "Scott Davidson",
    "tracking_since": "YYYY-MM-DD",
    "last_updated": "YYYY-MM-DD"
  },
  "posts": [
    {
      "id": 1,
      "date": "2026-02-10",
      "day_of_week": "Tuesday",
      "text": "Full post text or summary...",
      "hook": "First line of post",
      "topic": "volume vs targeting",
      "pillar": "operator-perspective",
      "format": "text",
      "impressions": 1200,
      "reactions": 45,
      "comments": 12,
      "shares": 3,
      "profile_visits": null,
      "follows": null,
      "engagement_rate": 5.0,
      "notes": ""
    }
  ]
}
```

## Handling Messy Input

Users will often paste raw data from LinkedIn's analytics UI. Handle these cases:

- **Screenshot description**: User describes what they see. Ask clarifying questions for missing numbers.
- **Partial metrics**: Log what's available, set missing fields to `null`. Engagement rate uses only available fields.
- **Bulk paste**: User dumps a week of posts at once. Parse each and log all.
- **Approximate numbers**: "About 1.2K impressions" → store as 1200. LinkedIn rounds these.

## Integration with Other Skills

- **linkedin-content-creator**: After running Recommend mode, pass the insights as context when creating new posts. Example: "Top-performing hooks use contrarian openings. Infrastructure-gaps pillar has 2x the engagement of education posts."
- **linkedin-growth-strategy**: Performance data validates or challenges the strategy assumptions in the growth framework.

## Reference Files

- **`references/analysis-framework.md`** — Detailed calculations, benchmarks, and analysis template
