---
name: refine-positioning
description: Synthesizes insights from 3+ transcripts to refine ICP, identify market patterns, and update positioning. Use when analyzing conversation patterns or deciding which market segments to target.
type: skill
use-cases:
  - positioning
  - icp-definition
  - service-model
personas:
  - ceo-founder
  - cro
created: 2024-12-09
last-updated: 2024-12-16
status: active
integrates-with:
  - extract-insights
  - premium-positioning-2024-12-16
references:
  - output-template
validates:
  - positioning-update-2024-12-09
  - premium-positioning-2024-12-16
tags:
  - positioning
  - icp-research
  - market-analysis
---

# Refine Positioning Skill

**Version:** 1.0.0
**Purpose:** Cross-analyze insights to refine market positioning and ICP definition
**Last Updated:** 2024-12-09

## What This Skill Does

Takes multiple insight files and identifies:
1. **Common patterns** across conversations (what keeps coming up?)
2. **Market segments** that emerge (SaaS vs non-SaaS, company size, etc.)
3. **Buying triggers** that indicate readiness to purchase
4. **Value propositions** that resonate most
5. **Positioning gaps** where we're unclear or inconsistent

## Step-by-Step Process

### Step 1: Gather All Insights
- Read all files in `content/insights/`
- Count how many conversations we're analyzing
- Note the date range of conversations

### Step 2: Identify Recurring Patterns

**Pain Points Analysis:**
- Which pain points appear in multiple conversations?
- Are there patterns by company type (SaaS vs non-SaaS)?
- Which pain points seem most urgent/acute?
- Group similar pain points together

**Buying Triggers Analysis:**
- What triggers appear most frequently?
- Are there temporal patterns? (Q1 planning, just got funding, just hired team, etc.)
- Which triggers indicate highest urgency?
- Group by trigger type: timing-based, event-based, pain-based

**Objections Analysis:**
- What concerns come up repeatedly?
- Are objections consistent across segments?
- Which objections are we not addressing well?

### Step 3: Segment Discovery

Look for natural groupings:
- **By company type:** SaaS vs non-SaaS, industry clusters
- **By stage:** Pre-revenue, 0-5 people, 5-20 people, 20-50 people
- **By need:** Infrastructure setup, team scaling, specific expertise gaps
- **By timeline:** Immediate need, Q1 planning, exploring
- **By current state:** Has CRM vs doesn't, has team vs solo, has data vs doesn't

For each segment, note:
- How many conversations fit this profile?
- What are their specific pain points?
- What triggers make them buy?
- What value props resonate?

### Step 4: Market Saturation Analysis

Specifically call out:
- **SaaS companies:** How many conversations? What patterns? Where's it saturated?
- **Non-SaaS companies:** How many conversations? What's different about their needs?
- **Opportunity assessment:** Where's the white space?

### Step 5: Value Proposition Mapping

For each major pain point identified:
- How do we solve it?
- What's unique about our approach?
- What evidence do we have that it resonates?
- What segments care most about this?

### Step 6: Identify Gaps & Questions

What don't we know yet?
- Segments we haven't talked to
- Questions we keep getting that we can't answer
- Positioning claims we can't back up yet
- Areas where conversations diverge (no pattern yet)

## Output Format

Use the detailed template in `references/output-template.md` to create comprehensive positioning updates.

**Save to:** `positioning/positioning-update-YYYY-MM-DD.md`

**Key sections to include:**
- Executive Summary (2-3 sentences)
- Pain Point Patterns (high frequency, segment-specific)
- Buying Trigger Analysis (types and frequency)
- Market Segmentation (including SaaS vs Non-SaaS)
- Value Proposition Hierarchy
- Objections & Concerns
- Open Questions & Gaps
- Recommended Positioning Updates
- Action Items

## Quality Checks

Before finishing, verify:
- [ ] Did I analyze ALL insights files available?
- [ ] Are patterns backed by specific evidence (not assumptions)?
- [ ] Did I call out both SaaS and non-SaaS observations?
- [ ] Did I identify actionable next steps?
- [ ] Did I highlight where we lack data/need more conversations?
- [ ] Is this actually useful for positioning decisions?

## When to Use This Skill

Use this skill when:
- You have multiple insight files (3+) to synthesize
- You're trying to refine your ICP
- You need to update positioning based on real conversations
- You're deciding which market segment to focus on
- You want to identify patterns across discovery calls

Don't use this skill when:
- You only have 1-2 conversations (not enough for patterns)
- You're just extracting insights from a single transcript (use extract-insights instead)

## Notes for Improvement

Tell Scott if:
- Output format isn't useful for decision-making
- Missing important analysis dimensions
- Need different segment breakdowns
- Pattern identification is too loose/rigid
