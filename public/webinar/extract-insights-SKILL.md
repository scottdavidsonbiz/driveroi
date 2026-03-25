---
name: extract-insights
description: Extracts actionable insights from meeting transcripts — pain points, buying triggers, objections, opportunities, next steps, competitive intel, and optionally drafts a follow-up email. Use when analyzing any call transcript or meeting notes.
type: skill
use-cases:
  - discovery-call-debrief
  - sales-enablement
  - icp-definition
  - positioning
  - service-model
created: 2024-12-09
last-updated: 2026-03-20
status: active
integrates-with:
  - linkedin-growth-strategy
  - refine-positioning
references:
  - output-template
tags:
  - transcripts
  - insights
  - discovery
  - pain-points
  - meeting-debrief
---

# Extract Insights Skill

**Version:** 2.0.0
**Purpose:** Pull actionable insights from meeting transcripts automatically
**Last Updated:** 2026-03-20

## What This Skill Does

Point it at a transcript file and it produces a complete meeting debrief:

1. **Participants** — who was on the call, their role, their company
2. **Pain points** — specific problems they're experiencing
3. **Buying triggers** — what would make them act now
4. **Objections** — concerns they raised
5. **Opportunities** — what you could do for them
6. **Competitive intel** — competitors mentioned, tools being evaluated, vendors they're comparing
7. **Decision criteria & timeline** — how they'll decide, who's involved, when
8. **Next steps & action items** — who owes what, by when
9. **Follow-up email draft** — ready to send after the call (when relevant)
10. **Content ideas** — angles for LinkedIn posts, articles, or case studies

## Input

A transcript file. Common sources:

- Zoom transcript (.txt or .vtt)
- Otter.ai export
- Fathom notes
- Fireflies.ai transcript
- Any plain text with speaker labels and timestamps

**Tip for users:** Most transcription tools export to .txt. If your tool exports a different format, paste the text content into a .txt file. The skill needs speaker labels (e.g., "Scott Davidson:" or "[Speaker 1]") to identify participants.

## Step-by-Step Process

### Step 1: Read the Transcript

- Open the specified transcript file
- Read it completely — do not skim or sample
- If the file is large, read in chunks but cover the entire transcript

### Step 2: Identify Participants

For each person on the call, extract:
- **Name** (as it appears in the transcript)
- **Company** (inferred from context, introductions, or email domains mentioned)
- **Role/Title** (if stated or inferable)
- **Disposition** (buyer, seller, advisor, technical evaluator, etc.)

If roles aren't explicitly stated, infer from the conversation. The person asking about pricing and timelines is likely the buyer. The person describing services and asking discovery questions is likely the seller.

### Step 3: Extract Pain Points

Look for:
- "The problem is..."
- "We're struggling with..."
- "It's frustrating that..."
- "We lose [X] because..."
- "We don't have a way to..."
- "Right now we're doing [manual thing]..."

**Criteria:** Must be specific, not generic. Cite the actual quote.

**Good:** "We lose 30% of calls after 5pm" — Quote: "After five o'clock, those calls just go to voicemail and we never get them back."
**Bad:** "Communication is hard"

### Step 4: Identify Buying Triggers

What's creating urgency?
- Time pressure ("need this by Q1", "board meeting next month")
- Cost of inaction ("losing $X per month", "we've been bleeding leads")
- Recent change ("just hired a new VP Sales", "we got acquired")
- Competitive pressure ("competitors are doing this", "we're losing deals to...")
- Executive mandate ("CEO told me to figure this out")
- Budget cycle ("I have budget now but it goes away in April")

### Step 5: Note Objections

What concerns did they raise?
- Price / budget constraints
- Implementation complexity or timeline
- Integration with existing tools
- Team adoption or change management
- Past bad experiences with similar vendors/projects
- Need for internal buy-in from others

### Step 6: Spot Opportunities

What could you help with?
- Direct solutions to their stated pain points
- Adjacent problems they mentioned but aren't actively solving
- Connections you could make
- Quick wins that would build trust
- Longer-term strategic plays

### Step 7: Capture Competitive Intel

Look for mentions of:
- Competitors they're evaluating or currently using
- Tools and platforms in their stack (named specifically)
- Vendors they've worked with before (positive or negative experiences)
- Pricing benchmarks they've mentioned
- Feature comparisons or wish lists

Only include what was actually said. Do not infer competitors that weren't mentioned.

### Step 8: Decision Criteria & Timeline

Extract:
- **Decision maker(s)** — who has final sign-off
- **Influencers** — who else needs to weigh in
- **Blockers** — anyone who could kill the deal
- **Evaluation criteria** — what matters most to them (speed, cost, expertise, specific capabilities)
- **Timeline** — when they need to decide, when they want to start, any hard deadlines
- **Budget** — any numbers or ranges mentioned
- **Process** — do they need a formal proposal, board approval, legal review, etc.

### Step 9: Next Steps & Action Items

List every commitment made on the call:
- **Action item** — what needs to happen
- **Owner** — who said they'd do it
- **Deadline** — by when (if stated)

Include items from both sides. If someone said "I'll send that over by Wednesday," capture it.

### Step 10: Draft Follow-Up Email (When Relevant)

If this was a sales or business development conversation, draft a follow-up email:
- Reference 2-3 specific things discussed (not generic)
- State any deliverables you committed to and when
- Confirm the next meeting if one was scheduled
- Keep it under 10 sentences
- No flattery, no filler, just specifics and next steps

Skip this step if the transcript is an internal meeting, a podcast, or a non-sales conversation.

### Step 11: Content Ideas

Identify angles that could become:
- LinkedIn posts (specific insights, not generic advice)
- Case study material (if outcomes were discussed)
- Blog/article topics
- Content that addresses the pain points or objections raised

## Output Format

Use the template in `references/output-template.md` for consistent documentation.

**Save to:** `content/insights/YYYY-MM-DD-[topic].md`

## Quality Checks

Before finishing:
- [ ] Every insight cites an actual quote or specific reference from the transcript
- [ ] Participants are correctly identified with roles
- [ ] Pain points are specific, not generic
- [ ] Next steps have owners and deadlines where stated
- [ ] Competitive intel only includes what was actually mentioned
- [ ] Follow-up email references specifics from the call, not boilerplate
- [ ] Nothing is fabricated or extrapolated beyond what was said
