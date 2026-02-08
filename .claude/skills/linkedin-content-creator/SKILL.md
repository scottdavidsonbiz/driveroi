---
name: linkedin-content-creator
description: Generates LinkedIn posts from raw inputs (transcripts, voice notes, articles, experience descriptions). Extracts key takeaways and creates thought leadership content for B2B founders/decision makers. Use when analyzing transcripts for content ideas, turning experiences into posts, or creating content from voice notes. NOT for general LinkedIn strategy or profile optimization - use linkedin-growth-strategy for that.
type: skill
use-cases:
  - linkedin-strategy
  - content-creation
  - thought-leadership
personas:
  - ceo-founder
  - cro
created: 2026-01-26
last-updated: 2026-01-26
status: active
integrates-with:
  - extract-insights
  - linkedin-growth-strategy
references:
  - voice-examples
  - output-template
tags:
  - linkedin
  - content-creation
  - transcripts
  - thought-leadership
---

# LinkedIn Content Creator Skill

**Version:** 1.0.0
**Purpose:** Turn raw inputs into LinkedIn thought leadership content
**Last Updated:** January 2026

## What This Skill Does

Takes raw material and produces:
1. **Key Takeaways** - Extracted insights from the input
2. **LinkedIn Posts** - Ready-to-publish content grounded in real experience

## Input Types

- Transcripts (call recordings, interviews, podcasts)
- Voice notes (transcribed or summarized)
- Articles or blog posts
- Experience descriptions ("here's what happened when...")
- Case studies or client outcomes
- Data from campaigns or tests

## Step-by-Step Process

### Step 1: Understand the Input

Read the provided material completely. Identify:
- **Core insight** - What's the main learning?
- **Supporting evidence** - What real data or experience backs this up?
- **Audience relevance** - Why would a B2B founder/decision maker care?

### Step 2: Extract Takeaways

Pull out 3-5 concrete takeaways:
- Must be specific (not generic advice)
- Must be grounded in the actual input (no extrapolation)
- Must pass the "so what?" test

**Format each takeaway as:**
```
**Takeaway:** [The insight]
**Evidence:** [Quote or data from input]
**Content angle:** [How this becomes a post]
```

### Step 3: Generate Posts

For each viable takeaway, write a LinkedIn post.

**Post structure:**
1. Hook (first line must grab attention - no "I")
2. Setup (context or problem)
3. Insight (the main point)
4. Supporting details (bullets, examples)
5. Takeaway (what to do with this)

**Do NOT include a CTA unless specifically requested.**

### Step 4: Quality Check

Before presenting output, verify each post:
- [ ] All facts/stats come directly from the input
- [ ] No made-up numbers or percentages
- [ ] Tone is scientific/data-driven, not preachy
- [ ] Shows expertise through content, not credentials
- [ ] Would resonate with a B2B founder who needs clients

## Target Audience

**Primary:** Founders and decision makers at B2B professional services companies

They care about:
- Getting clients consistently (not just referrals)
- Building pipeline that's predictable
- Learning from real-world data
- Avoiding generic advice

**Secondary (contextual):** Marketers and GTM people (when creating lead magnets or content for marketing purposes - will be specified in the request)

## Tone & Voice

**Be:**
- Direct and peer-to-peer
- Scientific and data-driven
- Grounded in real experience
- Confident but not arrogant

**Avoid:**
- Know-it-all energy
- Preachy or lecturing tone
- Generic business advice
- Hype or superlatives

**Never:**
- Make up statistics
- Fabricate case studies
- Add percentages that weren't in the input
- Claim results you can't verify
- Use em dashes (--). Use commas, periods, or colons instead

### Show, Don't Tell

**BAD:** "With my enterprise background, I've learned..."
**GOOD:** Just share the insight. The expertise shows through the content.

**BAD:** "Most companies (about 80%) struggle with..."
**GOOD:** "Most companies I talk to struggle with..." (if that's true)

### Voice References

Study these creators for tone calibration:
- **Maja Voje** - GTM strategy, direct, practical
- **CJ Gustafson** - Finance/ops, data-driven, punchy
- **Kyle Poyar** - PLG/pricing, analytical, clear

See `references/voice-examples.md` for specific examples.

## Output Format

Use the template in `references/output-template.md`.

**Save content to:** `content/linkedin-content-drafts.md` (append to existing or create new)

## When Input is Insufficient

If the input doesn't contain enough concrete detail:

1. **Ask for clarification** - "What was the actual result?" or "Do you have the numbers?"
2. **Request supporting data** - "Can you share the specific metrics?"
3. **Suggest alternatives** - "Without the data, we could frame this as a hypothesis..."

Do NOT fill in gaps with assumptions or fabricated details.

## Quality Checks

Before delivering posts:
- [ ] Every stat comes from the input
- [ ] No generic advice (passes "could anyone say this?" test)
- [ ] Hook is strong (would stop the scroll)
- [ ] Clear takeaway (reader knows what to do)
- [ ] Tone matches voice guidelines

## Reference Files

- **`references/voice-examples.md`** - Example posts and voice calibration
- **`references/output-template.md`** - Standard output format

## When This Skill Needs Improvement

Flag to user if:
- Input format is unclear
- Can't find concrete takeaways in the material
- Tone guidelines conflict with the content
- Output format isn't working
