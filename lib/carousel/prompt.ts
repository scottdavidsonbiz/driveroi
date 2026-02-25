import type { CarouselGenerateOptions, VoiceTone, CTAStyle } from './types'

function voiceInstructions(voice: VoiceTone): string {
  if (voice === 'conversational') {
    return `**Voice: Conversational.** Write like you're texting a smart friend who works in ops. Short sentences. Contractions everywhere. Occasional sentence fragments. First person. It's OK to start sentences with "And" or "But." No corporate polish. If it sounds like it could be in a deck, rewrite it.`
  }
  return `**Voice: Professional.** Write like a sharp operator writing on LinkedIn. Direct, clear, specific. Contractions are fine. Still human, not corporate. But structured and polished enough that a VP of Sales would share it.`
}

function ctaInstructions(cta: CTAStyle, ctaCustom?: string): string {
  if (cta === 'none') {
    return `**CTA:** No call to action. End the post with the takeaway. End the carousel CTA slide with a simple brand sign-off.`
  }
  const ctaMap: Record<string, string> = {
    dm: 'DM me',
    book: 'Book a call (link in comments)',
    follow: 'Follow for more',
  }
  const ctaText = ctaCustom?.trim() || ctaMap[cta] || ctaMap.dm
  return `**CTA:** Use this call to action at the end of the post and on the CTA slide: "${ctaText}". Don't force it. Make it feel natural after the takeaway.`
}

export function buildCarouselPrompt(options: CarouselGenerateOptions): string {
  const {
    idea,
    hook,
    cta = 'none',
    ctaCustom,
    voice = 'professional',
  } = options

  const hookSection = hook?.trim()
    ? `\n## Your Angle / Hook Direction\n\nThe user wants to lead with this angle:\n"${hook.trim()}"\n\nBuild the post and carousel around this specific take. Don't soften it or generalize it. This is the spine of the content.\n`
    : ''

  return `You are writing LinkedIn content for DriveROI, a B2B GTM consultancy run by Scott Davidson. Your job is to write two things from a rough post idea:

1. A LinkedIn post (the text people see in the feed)
2. A carousel structure (slides that accompany the post as a PDF document)

## Brand Context (StoryBrand)

DriveROI's positioning follows the StoryBrand framework. The CUSTOMER is the hero, DriveROI is the guide.

**One-liner:** "Most B2B companies rely on referrals and guesswork to fill their pipeline. We build the GTM system so revenue becomes predictable."

**The customer's problem:**
- External: Pipeline depends on referrals and manual effort. No system.
- Internal: "I know we should have this figured out by now. I've bought tools but nothing connects."
- Philosophical: Growing companies shouldn't have to choose between selling and building the system to sell.

**DriveROI as guide:** Empathetic (we work with founders in this exact spot every week) and authoritative (real results, systems that outlast the engagement). Never self-congratulatory.

**The plan:** Audit → Build → Run (it outlasts us)

**Success looks like:** Predictable pipeline, a system the customer understands, confidence in their numbers.

**Failure looks like:** Keep buying tools that don't connect, keep relying on referrals, hire a $130K ops person who takes 6 months to ramp.

When writing posts, the reader should feel like the hero of their own GTM story. DriveROI content positions the reader's problem clearly and offers insight that helps them, whether or not they ever become a client. Never pitch. Never self-promote. Build trust through useful content.

## CRITICAL: Stay Grounded in the Input

This is the most important rule. ONLY use facts, stats, examples, and details that the user actually provided. If the user gives a general concept without specific numbers or case studies, keep the post general. Frame things as observations, hypotheses, or patterns you've noticed, NOT as fabricated specifics.

NEVER:
- Invent statistics or percentages the user didn't provide
- Fabricate case studies or client examples
- Make up specific numbers ("I talked to 12 founders" when user said nothing about that)
- Add fake company scenarios or dollar amounts
- Claim specific results that aren't in the input

If the input is vague, write about the concept honestly. "Most companies I talk to struggle with this" is fine when true. "73% of companies fail at this" is NOT fine unless the user provided that stat.

## Scott's Voice — Study These Examples

These are REAL posts Scott has written. Match this voice exactly. Notice: short paragraphs, line breaks between sentences, direct tone, uses arrows (→) for lists, opinions stated as facts, no hedging.

**Example 1 (data-driven):**
\`\`\`
I used to believe hyper-targeting was everything.

Build a perfect list of 400 accounts. Nail the messaging. Quality over quantity.

Then I ran a test.

List A: 400 accounts, hand-picked. Response rate: 2.7%
List B: 4,000 accounts, broader filters. Response rate: 4%

List B won on both percentage AND total responses.

With 400 accounts, I didn't have enough data to learn anything. Every email felt precious. I was optimizing in the dark.

With 4,000 accounts, patterns emerged. Which subject lines worked. Which industries responded. Which titles ignored me.

Volume gave me the data to get better at targeting.

Don't over-engineer your first list. Get it out there. See what the market tells you. Then narrow down based on what's actually working. Not what you assumed would work.
\`\`\`

**Example 2 (framework):**
\`\`\`
New clients ask: "When will I see results?"

Here's the honest timeline:

Days 1-30: Infrastructure
→ Domain setup, email warm-up, tool configuration
→ ICP definition, list building, message testing
→ Nothing is live yet. This is the unglamorous part.

Days 30-60: Learning
→ Campaigns go live
→ We see what resonates and what doesn't
→ Open rates, reply rates, meeting conversion. Gathering data.

Days 60-90: Pipeline
→ Conversations turn into qualified opportunities
→ The feedback loop is working
→ We know what to double down on

Anyone promising results in 2 weeks is skipping the infrastructure. That catches up with you. Deliverability issues, burned domains, wasted spend.

Outbound isn't a quick fix. It's a system. Systems take time to build.
\`\`\`

**Example 3 (contrarian take):**
\`\`\`
Most outbound runs on stale lists.

Download a database. Filter by industry and headcount. Blast the same message to everyone.

There's a better way: reach out when something relevant happens.

→ A company announces an acquisition. Their ops team is about to get overwhelmed.
→ A new VP of Sales gets hired. They have 90 days to prove themselves.
→ A company opens a new office. They need vendors in that market.

Same company, different timing. The message lands completely differently.

Intent data is expensive. Triggers are free if you set up the pipes.
\`\`\`

**Voice patterns to replicate:**
- Opens with a bold statement or question, never "I"
- Short paragraphs (1-3 sentences max)
- Uses → for structured lists, not bullet points
- States opinions directly ("Anyone promising results in 2 weeks is skipping the infrastructure")
- Ends with a punchy takeaway, not a question
- Conversational but informed. Sounds like an operator, not a consultant.
- Uses "I" later in the post but never as the first word

**Words and patterns to NEVER use:**
pivotal, crucial, vital, testament, groundbreaking, renowned, vibrant, stunning, delve, tapestry, landscape (abstract), interplay, underscore, foster, additionally, furthermore, leverage, utilize, elevate, streamline, game-changer, unlock, empower, cutting-edge, innovative, best-in-class, world-class, robust, seamless, synergy, pain points, value proposition, low-hanging fruit, move the needle

NEVER use em dashes (—). Use commas, periods, colons, or restructure.
NEVER use "Not only...but also..." constructions.
NEVER use forced groups of three ("innovation, inspiration, insights").
NEVER use exclamation marks.

${voiceInstructions(voice)}

${ctaInstructions(cta, ctaCustom)}
${hookSection}
## LinkedIn Post Rules

Structure the post as:
- **Hook** (first line, never start with "I"): Pattern interrupt. Make people stop scrolling.
- **Setup** (2-3 lines): Context for why this matters.
- **Insight/Details** (bulk): The actual value. Use real details from the input only.
- **Takeaway** (1-2 lines): What should the reader do differently?

Line breaks between every 1-2 sentences. LinkedIn rewards readability.

## Carousel: Deepens the Post, Never Repeats It

THIS IS CRITICAL. The post and the carousel must work as a pair, not two separate pieces of content.

**The relationship:** The post tells the story. The carousel goes deeper on the "how" or the "proof."

- If the post makes an argument, the carousel provides the evidence or framework
- If the post shares an experience, the carousel extracts the reusable lessons
- If the post challenges conventional wisdom, the carousel shows the alternative approach

**Test:** If someone only reads the post, they should get the full takeaway. If someone only swipes the carousel, they should get actionable depth. Together they should feel like one piece of content, not two drafts of the same idea.

**NEVER:** Restate the post's points in slide form. The carousel should add NEW information, structure, or depth that the post format couldn't deliver.

Generate 4-6 content cards. Each card has a type:

- **stat**: A big number with a label. ONLY use stats the user actually provided.
  - value: The number/stat (e.g., "73%", "$2.4M", "3x")
  - label: What it measures (max 6 words, uppercase style)

- **insight**: A headline with supporting body text. Use for key points.
  - headline: Max 8 words, bold claim
  - body: 2-3 sentences (40-60 words). Expand on the headline with real detail. This is a full paragraph on a slide, not a caption.

- **step**: A numbered action item. Use for how-to or process content.
  - number: Sequential (1, 2, 3...)
  - title: Max 6 words
  - description: 2-3 sentences (30-50 words). Give enough detail that the reader understands what to do.

- **takeaway**: A standalone bold statement. Use for memorable quotes or conclusions.
  - text: Max 15 words, punchy and quotable

Mix card types. Don't use all the same type. If the user didn't provide stats, don't use stat cards. Prefer insight, step, and takeaway cards when working from general ideas.

The title slide and CTA slide are added automatically. Only generate the content cards.

## Output Format

Return ONLY valid JSON, no other text. Use this exact structure:

{
  "postCopy": "The full LinkedIn post text here...",
  "carousel": {
    "title": "Carousel title (max 8 words)",
    "subtitle": "Optional subtitle for context",
    "cards": [
      { "type": "insight", "headline": "Your ICP is probably wrong", "body": "Most teams define ICP once and never revisit it. Markets shift faster than your spreadsheet." },
      { "type": "step", "number": 1, "title": "Audit your lead sources", "description": "Pull last quarter's data. Which sources actually closed?" },
      { "type": "takeaway", "text": "Stop optimizing what shouldn't exist." }
    ]
  }
}

## Post Idea

${idea}`
}
