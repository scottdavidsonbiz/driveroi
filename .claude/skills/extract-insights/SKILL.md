---
name: extract-insights
description: Extracts actionable insights from conversation transcripts including pain points, buying triggers, objections, and opportunities. Use when analyzing transcripts or call notes.
type: skill
use-cases:
  - icp-definition
  - positioning
  - sales-enablement
  - service-model
personas:
  - ceo-founder
  - cro
created: 2024-12-09
last-updated: 2024-12-16
status: active
integrates-with:
  - linkedin-growth-strategy
  - refine-positioning
references:
  - output-template
validates:
  - client-feedback-atomic-nodes
  - positioning-updates
tags:
  - transcripts
  - insights
  - discovery
  - pain-points
---

# Extract Insights Skill

**Version:** 1.0.0
**Purpose:** Pull actionable insights from conversation transcripts
**Last Updated:** 2024-12-09

## What This Skill Does

Reads a transcript and identifies:
1. Pain points (what problems are they experiencing?)
2. Buying triggers (what would make them act now?)
3. Objections (what concerns did they raise?)
4. Opportunities (what could we do for them?)

## Step-by-Step Process

### Step 1: Read the Transcript
- Open the specified transcript file
- Read it completely
- Note the context and participants

### Step 2: Extract Pain Points
Look for phrases like:
- "The problem is..."
- "We're struggling with..."
- "It's frustrating that..."
- "We lose [X] because..."

**Criteria:** Must be specific, not generic

**Good:** "We lose 30% of calls after 5pm"
**Bad:** "Communication is hard"

### Step 3: Identify Buying Triggers
Look for urgency signals:
- Time pressure ("need this by Q1")
- Cost of inaction ("losing $X per month")
- Recent change ("just hired new team")
- Competitive pressure ("competitors are doing this")

### Step 4: Note Objections
What concerns did they raise?
- Price sensitivity
- Implementation complexity
- Integration with existing tools
- Team adoption concerns

### Step 5: Spot Opportunities
What could we help with?
- Solutions to their pain points
- Ways to accelerate their timeline
- Connections we could make
- Resources we could provide

## Output Format

Use the template in `references/output-template.md` for consistent insight documentation.

**Save to:** `content/insights/YYYY-MM-DD-[topic].md`

## Quality Checks

Before finishing, ask yourself:
- [ ] Are insights specific? (not generic advice)
- [ ] Did I cite actual quotes?
- [ ] Would Scott find this useful?
- [ ] Could this inform content or positioning?

## When This Skill Needs Improvement

Tell Scott if:
- Transcript format is unclear
- Missing important insight types
- Output format isn't useful
- Process is too rigid/loose
