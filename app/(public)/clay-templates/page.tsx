'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronDown, ChevronUp, Play, FileText, ExternalLink, ArrowRight, Copy, Check, Table2, Download, Terminal } from 'lucide-react'

type Tier = 'crawl' | 'walk' | 'run'

const USE_CASE_CATEGORIES = [
  'All',
  'Signals & Intent',
  'CRM Enrichment',
  'Inbound Enrichment & Routing',
  'ABM',
  'AI Outbound',
  'Account Research & Scoring',
] as const

type UseCase = (typeof USE_CASE_CATEGORIES)[number]

interface ClayColumn {
  name: string
  type: string
  source: string
}

interface Template {
  id: string
  tier: Tier
  title: string
  useCase: string
  problem: string
  description: string
  timeToValue: string
  columns: ClayColumn[]
  loomUrl?: string
  sopUrl?: string
  sculptorPrompt?: string
  sculptorPromptTemplate?: string
  claygentPrompt?: string
  formulaExample?: string
  sharedTableUrl?: string
  keyBenefit: string
}

const TIER_CONFIG: Record<Tier, {
  label: string
  number: string
  color: string
  glowColor: string
  description: string
}> = {
  crawl: {
    label: 'Crawl',
    number: '01',
    color: '#34D399',
    glowColor: 'rgba(52, 211, 153, 0.15)',
    description: 'One signal, one table, one destination. Detect + enrich.',
  },
  walk: {
    label: 'Walk',
    number: '02',
    color: '#FBBF24',
    glowColor: 'rgba(251, 191, 36, 0.15)',
    description: 'Add scoring, conditional logic, and routing. Multiple outputs.',
  },
  run: {
    label: 'Run',
    number: '03',
    color: '#F97316',
    glowColor: 'rgba(249, 115, 22, 0.15)',
    description: 'Multi-table orchestration with time-based triggers and multi-channel output.',
  },
}

const TEMPLATES: Template[] = [
  {
    id: 'job-change-signal',
    tier: 'crawl',
    title: 'Job Change Signal Detection',
    useCase: 'Signals & Intent',
    problem: 'Someone at your target persona just changed jobs. ZoomInfo or your CRM might catch it days later — if at all. By then, the window to reach them while they\'re evaluating new tools is closing.',
    description: 'Use Clay Sculptor to find people who recently changed into your target roles, then enrich with native Clay company data and work email. No outside vendors needed. Sculptor builds the table in minutes — you add two enrichment columns and you\'re live.',
    timeToValue: '< 1 hour',
    keyBenefit: 'Detect job changes into your target persona, enrich with company data and verified email — using only native Clay tools.',
    sculptorPrompt: `Find people who recently changed jobs into compliance officer, privacy officer, or HIPAA officer roles at healthcare organizations in the United States.\n\nFilter to job changes in the last 6 months. Include titles like: Compliance Officer, Chief Compliance Officer, Privacy Officer, HIPAA Officer, Director of Compliance, VP of Compliance, Compliance Manager.`,
    sculptorPromptTemplate: `Find people who recently changed jobs into [TARGET ROLES] at [ORGANIZATION TYPE] in [GEOGRAPHY].\n\nFilter to job changes in the last [TIMEFRAME] months. Include titles like: [TITLE 1], [TITLE 2], [TITLE 3], ...`,
    sharedTableUrl: 'https://app.clay.com/shared-table/share_0tbfovgTkycVgkqKNDe',
    columns: [
      { name: 'Full Name', type: 'Signal', source: 'Clay People Source (Sculptor)' },
      { name: 'Job Title', type: 'Signal', source: 'Clay People Source (Sculptor)' },
      { name: 'Company Name', type: 'Signal', source: 'Clay People Source (Sculptor)' },
      { name: 'Company Domain', type: 'Signal', source: 'Clay People Source (Sculptor)' },
      { name: 'LinkedIn URL', type: 'Signal', source: 'Clay People Source (Sculptor)' },
      { name: 'Company Size', type: 'Enrichment', source: 'Enrich Company (native)' },
      { name: 'Industry', type: 'Enrichment', source: 'Enrich Company (native)' },
      { name: 'HQ Location', type: 'Enrichment', source: 'Enrich Company (native)' },
      { name: 'Work Email', type: 'Enrichment', source: 'Find Work Email (native workflow)' },
      { name: 'Email Status', type: 'Enrichment', source: 'Find Work Email (native workflow)' },
    ],
  },
  {
    id: 'funding-signal-pipeline',
    tier: 'run',
    title: 'Funding Signal Pipeline — BusinessWire to Contacts',
    useCase: 'Signals & Intent',
    problem: 'Seed and Series A companies are your best buyers — they just got funded and need to build their GTM fast. But by the time funding news hits your CRM, your competitors have already reached out.',
    description: 'Monitor BusinessWire for funding announcements via RSS, use Claygent to classify each article (Seed vs. Series A) and extract the funded company\'s domain, generate a personalized pain point hook based on round type, then find founders and revenue leaders at each company. Runs continuously — new funding hits your table automatically.',
    timeToValue: '2-3 hours to build, then runs on autopilot',
    keyBenefit: 'Automatically detect Seed and Series A funding, extract the company, and find decision-makers — before your competitors see the news.',
    sharedTableUrl: 'https://app.clay.com/shared-table/share_0tbgfqf2QzhMsKdswb4',
    claygentPrompt: `## CONTEXT
You are analyzing Business Wire articles to identify seed and Series A fundraising announcements. The goal is to classify each article and extract the domain of the company that received the investment.

## TASK
Visit the provided Business Wire article URL. Determine if the article is about a seed round or Series A round of funding. If it qualifies, extract the website domain of the company that raised the round.

## INPUT
Article URL: {{article_url}}

## QUALIFYING CRITERIA
**QUALIFIES:**
- Seed round / seed funding / seed investment
- Pre-seed round (classify as "Seed")
- Series A round / Series A funding / Series A investment

**DOES NOT QUALIFY:**
- Series B, Series C, or any later-stage round
- Debt financing, venture debt, or credit facilities
- Grants or government funding
- Acquisitions or mergers
- Partnerships, product launches, or hiring announcements
- IPOs or SPACs
- Any article not about fundraising

## OUTPUT FORMAT
Return your response as JSON:

{
  "round_type": "Seed" or "Series A" or null,
  "qualifies": true or false,
  "company_name": "Name of company that raised" or null,
  "company_domain": "company.com" or null,
  "amount_raised": "$XM" or null,
  "reasoning": "one sentence explanation"
}

## INSTRUCTIONS
1. Visit the article URL and read the full content
2. Determine if the article announces a Seed or Series A funding round
3. If it does NOT qualify, set qualifies to false and return null for all other fields
4. If it qualifies, identify the company that RECEIVED the investment (not the investors)
5. Find the company's website domain in the article body, boilerplate/about section, or contact info. Return just the root domain (e.g. acme.com)
6. If you cannot find a specific field, return null - do not guess`,
    formulaExample: `!{{Seed/Series A Extraction}}?.roundType ? ""
: {{Seed/Series A Extraction}}?.roundType?.toLowerCase() === "seed"
  ? "You probably need to validate 1-2 acquisition channels fast before burn creeps up"
: {{Seed/Series A Extraction}}?.roundType?.toLowerCase() === "series a"
  ? "You probably need to turn what's working into something repeatable"
: ""`,
    columns: [
      { name: 'Article Title', type: 'Signal', source: 'RSS Source (via rss.app)' },
      { name: 'Article URL', type: 'Signal', source: 'RSS Source (via rss.app)' },
      { name: 'Published Date', type: 'Signal', source: 'RSS Source (via rss.app)' },
      { name: 'Round Type', type: 'AI Column', source: 'Claygent — "Seed" or "Series A"' },
      { name: 'Qualifies', type: 'AI Column', source: 'Claygent — true/false' },
      { name: 'Company Name', type: 'AI Column', source: 'Claygent — extracted from article' },
      { name: 'Company Domain', type: 'AI Column', source: 'Claygent — extracted from article' },
      { name: 'Amount Raised', type: 'AI Column', source: 'Claygent — "$XM"' },
      { name: 'Pain Point Hook', type: 'Formula', source: 'Round-specific messaging based on stage' },
      { name: 'Founder / CEO', type: 'Enrichment', source: 'Find People (native)' },
      { name: 'Revenue Leader', type: 'Enrichment', source: 'Find People (native)' },
    ],
  },
]

function ColumnTypeTag({ type }: { type: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    'CRM Import': { bg: 'rgba(148, 163, 184, 0.15)', text: '#94A3B8' },
    'Signal': { bg: 'rgba(96, 165, 250, 0.15)', text: '#60A5FA' },
    'Enrichment': { bg: 'rgba(34, 211, 238, 0.15)', text: '#22D3EE' },
    'Formula': { bg: 'rgba(251, 191, 36, 0.15)', text: '#FBBF24' },
    'AI Column': { bg: 'rgba(192, 132, 252, 0.15)', text: '#C084FC' },
    'Action': { bg: 'rgba(52, 211, 153, 0.15)', text: '#34D399' },
    'Seed List': { bg: 'rgba(148, 163, 184, 0.15)', text: '#94A3B8' },
    'Lookup': { bg: 'rgba(148, 163, 184, 0.15)', text: '#94A3B8' },
  }
  const c = colors[type] || { bg: 'rgba(148, 163, 184, 0.15)', text: '#94A3B8' }
  return (
    <span
      className="inline-block rounded px-2 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: c.bg,
        color: c.text,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.65rem',
        letterSpacing: '0.02em',
      }}
    >
      {type}
    </span>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors"
      style={{
        backgroundColor: copied ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255,255,255,0.06)',
        color: copied ? '#34D399' : 'rgba(232, 230, 227, 0.5)',
      }}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function TemplateCard({ template, index }: { template: Template; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const tier = TIER_CONFIG[template.tier]

  return (
    <div
      className="template-card overflow-hidden rounded-lg border transition-all duration-300"
      style={{
        borderColor: expanded ? tier.color : 'rgba(255,255,255,0.08)',
        backgroundColor: expanded ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.02)',
        animationDelay: `${0.3 + index * 0.1}s`,
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-5 text-left transition-colors hover:bg-white/[0.03]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span
                className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-widest"
                style={{
                  backgroundColor: tier.glowColor,
                  color: tier.color,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.65rem',
                }}
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tier.color }} />
                {tier.label}
              </span>
              <span
                className="text-xs uppercase tracking-wider"
                style={{
                  color: 'rgba(232, 230, 227, 0.4)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.6rem',
                }}
              >
                {template.useCase}
              </span>
              <span
                className="text-xs"
                style={{
                  color: 'rgba(232, 230, 227, 0.3)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.6rem',
                }}
              >
                {template.timeToValue}
              </span>
            </div>
            <h3
              className="text-xl font-semibold"
              style={{
                color: '#E8E6E3',
                letterSpacing: '-0.01em',
              }}
            >
              {template.title}
            </h3>
            <p className="mt-1.5 text-sm" style={{ color: 'rgba(232, 230, 227, 0.5)' }}>
              {template.keyBenefit}
            </p>
          </div>
          <div className="mt-2 flex-shrink-0" style={{ color: 'rgba(232, 230, 227, 0.3)' }}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t px-6 py-6 space-y-6" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h4
                className="mb-2 text-xs font-semibold uppercase tracking-widest"
                style={{ color: tier.color, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}
              >
                The Problem
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(232, 230, 227, 0.6)' }}>
                {template.problem}
              </p>
            </div>
            <div>
              <h4
                className="mb-2 text-xs font-semibold uppercase tracking-widest"
                style={{ color: tier.color, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}
              >
                What This Builds
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(232, 230, 227, 0.6)' }}>
                {template.description}
              </p>
            </div>
          </div>

          {/* Clay Table */}
          <div>
            <h4
              className="mb-3 text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'rgba(232, 230, 227, 0.35)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}
            >
              Clay Table Schema
            </h4>
            <div
              className="overflow-x-auto rounded-lg border"
              style={{ borderColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(0,0,0,0.3)' }}
            >
              <table className="w-full text-sm" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(232, 230, 227, 0.35)', fontSize: '0.6rem' }}>Column</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(232, 230, 227, 0.35)', fontSize: '0.6rem' }}>Type</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(232, 230, 227, 0.35)', fontSize: '0.6rem' }}>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {template.columns.map((col, i) => (
                    <tr
                      key={col.name}
                      style={{
                        borderBottom: i < template.columns.length - 1 ? '1px solid rgba(255,255,255,0.03)' : undefined,
                      }}
                    >
                      <td className="px-4 py-2 text-xs font-medium" style={{ color: '#E8E6E3' }}>{col.name}</td>
                      <td className="px-4 py-2"><ColumnTypeTag type={col.type} /></td>
                      <td className="px-4 py-2 text-xs" style={{ color: 'rgba(232, 230, 227, 0.4)' }}>{col.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sculptor Prompt */}
          {template.sculptorPrompt && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'rgba(232, 230, 227, 0.35)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}
                >
                  Sculptor Prompt — Example
                </h4>
                <CopyButton text={template.sculptorPrompt} />
              </div>
              <div
                className="rounded-lg border p-4"
                style={{
                  borderColor: 'rgba(255,255,255,0.06)',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.75rem',
                  lineHeight: 1.7,
                  color: 'rgba(232, 230, 227, 0.6)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {template.sculptorPrompt}
              </div>
              {template.sculptorPromptTemplate && (
                <div className="mt-3">
                  <div className="mb-2 flex items-center justify-between">
                    <h4
                      className="text-xs font-semibold uppercase tracking-widest"
                      style={{ color: 'rgba(232, 230, 227, 0.25)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem' }}
                    >
                      Reusable Template — Fill in the brackets
                    </h4>
                    <CopyButton text={template.sculptorPromptTemplate} />
                  </div>
                  <div
                    className="rounded-lg border p-4"
                    style={{
                      borderColor: 'rgba(251, 191, 36, 0.15)',
                      backgroundColor: 'rgba(251, 191, 36, 0.03)',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.75rem',
                      lineHeight: 1.7,
                      color: 'rgba(232, 230, 227, 0.45)',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {template.sculptorPromptTemplate}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Claygent Prompt */}
          {template.claygentPrompt && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'rgba(232, 230, 227, 0.35)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}
                >
                  Claygent Prompt
                </h4>
                <CopyButton text={template.claygentPrompt} />
              </div>
              <div
                className="max-h-64 overflow-y-auto rounded-lg border p-4"
                style={{
                  borderColor: 'rgba(192, 132, 252, 0.15)',
                  backgroundColor: 'rgba(192, 132, 252, 0.03)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.7rem',
                  lineHeight: 1.7,
                  color: 'rgba(232, 230, 227, 0.55)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {template.claygentPrompt}
              </div>
            </div>
          )}

          {/* Formula Example */}
          {template.formulaExample && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'rgba(232, 230, 227, 0.35)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}
                >
                  Formula — Pain Point Hook
                </h4>
                <CopyButton text={template.formulaExample} />
              </div>
              <div
                className="rounded-lg border p-4"
                style={{
                  borderColor: 'rgba(251, 191, 36, 0.15)',
                  backgroundColor: 'rgba(251, 191, 36, 0.03)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.7rem',
                  lineHeight: 1.7,
                  color: 'rgba(232, 230, 227, 0.5)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {template.formulaExample}
              </div>
            </div>
          )}

          {/* Shared Table Link */}
          {template.sharedTableUrl && (
            <a
              href={template.sharedTableUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(0,0,0,0.15)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${tier.color}33`
                e.currentTarget.style.backgroundColor = tier.glowColor
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.15)'
              }}
            >
              <Table2 className="h-4 w-4 flex-shrink-0" style={{ color: tier.color }} />
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: '#E8E6E3' }}>View Shared Clay Table</p>
                <p className="text-xs" style={{ color: 'rgba(232, 230, 227, 0.35)' }}>
                  Open this template in Clay to see the live table structure
                </p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'rgba(232, 230, 227, 0.3)' }} />
            </a>
          )}

          {/* Loom + SOP row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div
              className="rounded-lg border p-4"
              style={{ borderColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(0,0,0,0.2)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Play className="h-3.5 w-3.5" style={{ color: 'rgba(232, 230, 227, 0.35)' }} />
                <h4
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'rgba(232, 230, 227, 0.35)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}
                >
                  Video Walkthrough
                </h4>
              </div>
              {template.loomUrl ? (
                <div className="aspect-video overflow-hidden rounded">
                  <iframe src={template.loomUrl} className="h-full w-full" allowFullScreen title={`${template.title} walkthrough`} />
                </div>
              ) : (
                <div
                  className="flex aspect-video items-center justify-center rounded border border-dashed"
                  style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(0,0,0,0.2)' }}
                >
                  <p className="text-xs" style={{ color: 'rgba(232, 230, 227, 0.2)', fontFamily: "'JetBrains Mono', monospace" }}>
                    Coming soon
                  </p>
                </div>
              )}
            </div>

            <div
              className="rounded-lg border p-4"
              style={{ borderColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(0,0,0,0.2)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-3.5 w-3.5" style={{ color: 'rgba(232, 230, 227, 0.35)' }} />
                <h4
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'rgba(232, 230, 227, 0.35)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}
                >
                  SOP Document
                </h4>
              </div>
              {template.sopUrl ? (
                <a
                  href={template.sopUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded border px-4 py-3 text-sm font-medium transition-colors"
                  style={{ borderColor: 'rgba(255,255,255,0.08)', color: tier.color }}
                >
                  <FileText className="h-4 w-4" />
                  View Full SOP
                  <ExternalLink className="ml-auto h-3.5 w-3.5" />
                </a>
              ) : (
                <div
                  className="flex min-h-[60px] items-center justify-center rounded border border-dashed"
                  style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(0,0,0,0.2)' }}
                >
                  <p className="text-xs" style={{ color: 'rgba(232, 230, 227, 0.2)', fontFamily: "'JetBrains Mono', monospace" }}>
                    Coming soon
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const CLAYGENT_SKILL_CONTENT = `# Claygent Prompt Writer

## Metadata
- **Name:** claygent-prompt-writer
- **Description:** Creates optimized Claygent prompts for Clay.com workflows. Handles research, categorization, data extraction, and qualification use cases with JSON output.
- **Invocation:** /claygent or "write a claygent prompt"

---

## Instructions

When the user asks you to write a Claygent prompt, follow this process:

### Step 1: Gather Requirements

Ask the user for:
1. **Use case:** What are you trying to accomplish? (research, categorization, qualification, data extraction)
2. **Data source:** What input will Claygent receive? (URL, company name, LinkedIn profile, etc.)
3. **Desired outputs:** What specific fields/information do you need returned?
4. **Qualifying/disqualifying criteria:** (if applicable) What makes something a yes vs. no?
5. **Examples:** Can you share 2-3 example inputs and what the ideal output would look like?

If the user provides most of this upfront, skip redundant questions.

---

### Step 2: Write the Prompt Using This Structure

All Claygent prompts should follow this template:

\\\`\\\`\\\`
## CONTEXT
[Explain what this prompt does and why - helps the AI understand the goal]

## TASK
[Clear, specific instructions on what the AI should do]

## INPUT
[Describe what data the AI will receive - use {{column_name}} syntax for Clay variables]

## QUALIFYING CRITERIA (if applicable)
**QUALIFIES:**
- [Criterion 1]
- [Criterion 2]

**DOES NOT QUALIFY:**
- [Criterion 1]
- [Criterion 2]

## OUTPUT FORMAT
Return your response as JSON with the following structure:

{
  "field_1": "description of what goes here",
  "field_2": "description of what goes here",
  "field_3": "description of what goes here"
}

## INSTRUCTIONS
1. [Step 1]
2. [Step 2]
3. [Step 3]
4. If you cannot find the information, return null for that field - do not guess.

## EXAMPLES

**Input:** [Example input 1]
**Output:**
{
  "field_1": "example value",
  "field_2": "example value",
  "field_3": "example value"
}
\\\`\\\`\\\`

---

### Step 3: Apply Claygent Best Practices

**Clarity & Structure:**
- Use clear section headers (##) to organize the prompt
- Number your instructions for step-by-step tasks
- Be explicit about output format - Claygent performs better with structure

**JSON Output:**
- Always specify the exact JSON schema you want returned
- Use \\\`null\\\` for missing values, not empty strings or "N/A"
- Keep field names lowercase with underscores (snake_case)
- Include 2-3 examples showing the expected JSON output

**Avoiding Hallucination:**
- Tell Claygent to return \\\`null\\\` if information cannot be found
- Ask for source URLs when possible to verify accuracy
- For boolean/qualification prompts, require explicit criteria

**Few-Shot Prompting:**
- Always include 2-3 examples covering different scenarios
- Include at least one "negative" example (doesn't qualify, info not found)
- Keep example JSON clean - no markdown formatting inside the JSON

**Model-Specific Tips:**
- For data extraction and formatting: Neon model works well
- For complex reasoning and research: GPT-4 or Claude works better

**Source Specification:**
- If the data should come from a specific source (Google, LinkedIn, the provided URL), say so explicitly
- For URL-based research, tell it to extract from "the page at {{url}}" not to search the web

---

### Step 4: Deliver the Prompt

Provide:
1. The complete Claygent prompt (in a code block for easy copy/paste)
2. Recommended AI model (Neon, GPT-4, or Claude)
3. Expected output fields (so they know what columns to create in Clay)
4. Any notes on edge cases or limitations

---

## Common Use Case Templates

### 1. URL Research / Data Extraction
- Extract specific fields from a webpage
- Works best with: Neon model
- Key: Specify exactly which page element contains the data

### 2. Categorization / Qualification
- Determine if something meets criteria (yes/no)
- Works best with: GPT-4 or Claude (needs reasoning)
- Key: Explicit qualifying/disqualifying criteria with examples

### 3. Web Research (no URL provided)
- Find information about a company/person via search
- Works best with: GPT-4 or Claude
- Key: Specify which sources to prioritize (LinkedIn, company website, news)

### 4. Multi-Step Research
- Chain multiple research tasks together
- Works best with: GPT-4 or Claude
- Key: Number your steps clearly, specify what to do if step fails
`

function ClaygentSkillSection() {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(CLAYGENT_SKILL_CONTENT)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className="mt-20 mb-0">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Terminal className="h-4 w-4" style={{ color: '#C084FC' }} />
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: '#C084FC', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem' }}
          >
            Bonus
          </span>
        </div>
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: '#E8E6E3', letterSpacing: '-0.02em' }}
        >
          Claygent Prompt Writer
          <span className="font-light" style={{ color: 'rgba(232, 230, 227, 0.45)' }}>
            {' '}— AI Skill
          </span>
        </h2>
        <p className="text-sm leading-relaxed max-w-lg" style={{ color: 'rgba(232, 230, 227, 0.45)' }}>
          Drop this file into your Claude Code <code className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.06)', fontFamily: "'JetBrains Mono', monospace" }}>.claude/skills/claygent-prompt-writer/</code> directory.
          Say <code className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.06)', fontFamily: "'JetBrains Mono', monospace" }}>/claygent</code> and it writes production-ready Claygent prompts with structured JSON output, few-shot examples, and best practices baked in.
        </p>
      </div>

      <div
        className="rounded-lg border overflow-hidden"
        style={{ borderColor: 'rgba(192, 132, 252, 0.2)', backgroundColor: 'rgba(192, 132, 252, 0.03)' }}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <span
            className="text-xs font-medium"
            style={{ color: 'rgba(232, 230, 227, 0.4)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem' }}
          >
            SKILL.md
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors"
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                color: 'rgba(232, 230, 227, 0.5)',
              }}
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? 'Collapse' : 'Preview'}
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors"
              style={{
                backgroundColor: copied ? 'rgba(52, 211, 153, 0.15)' : 'rgba(192, 132, 252, 0.15)',
                color: copied ? '#34D399' : '#C084FC',
              }}
            >
              {copied ? <Check className="h-3 w-3" /> : <Download className="h-3 w-3" />}
              {copied ? 'Copied to clipboard' : 'Copy SKILL.md'}
            </button>
          </div>
        </div>

        {expanded && (
          <div
            className="px-5 py-4 max-h-96 overflow-y-auto"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.7rem',
              lineHeight: 1.7,
              color: 'rgba(232, 230, 227, 0.5)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {CLAYGENT_SKILL_CONTENT}
          </div>
        )}

        {!expanded && (
          <div className="px-5 py-4">
            <p className="text-xs" style={{ color: 'rgba(232, 230, 227, 0.3)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem' }}>
              Covers 4 use case templates: URL Research, Categorization, Web Research, Multi-Step Research.
              Includes prompt structure, JSON output best practices, model recommendations, and few-shot examples.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(232, 230, 227, 0.25)' }}>
          <strong style={{ color: 'rgba(232, 230, 227, 0.35)' }}>Setup:</strong>{' '}
          Create <code className="px-1 py-0.5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.04)', fontFamily: "'JetBrains Mono', monospace" }}>.claude/skills/claygent-prompt-writer/SKILL.md</code> in your project, paste the contents, and invoke with <code className="px-1 py-0.5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.04)', fontFamily: "'JetBrains Mono', monospace" }}>/claygent</code> in Claude Code.
        </p>
      </div>
    </div>
  )
}

export default function ClayTemplatesPage() {
  const [activeCategory, setActiveCategory] = useState<UseCase>('All')

  const filteredTemplates = activeCategory === 'All'
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.useCase === activeCategory)

  return (
    <>
      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInFromLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .hero-title {
          animation: fadeUp 0.8s ease-out both;
        }
        .hero-subtitle {
          animation: fadeUp 0.8s ease-out 0.15s both;
        }
        .hero-cta {
          animation: fadeUp 0.8s ease-out 0.3s both;
        }
        .tier-card {
          animation: fadeUp 0.6s ease-out both;
        }
        .tier-card:nth-child(1) { animation-delay: 0.2s; }
        .tier-card:nth-child(2) { animation-delay: 0.3s; }
        .tier-card:nth-child(3) { animation-delay: 0.4s; }
        .template-card {
          animation: fadeUp 0.6s ease-out both;
        }
        .bottom-cta {
          animation: fadeIn 0.8s ease-out 0.6s both;
        }
        .grain-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none;
          z-index: 50;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 256px 256px;
        }
        .connector-line {
          width: 1px;
          height: 24px;
          margin: 0 auto;
          background: linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
        }
      `}</style>

      <div className="grain-overlay" />

      <div className="relative mx-auto max-w-3xl px-6 py-16 sm:py-24">
        {/* Hero */}
        <div className="mb-20">
          <div className="hero-title mb-8 flex items-center gap-3">
            <Image
              src="/logo-white.png"
              alt="DriveROI"
              width={130}
              height={34}
              priority
              style={{ opacity: 0.9 }}
            />
          </div>

          <h1
            className="hero-title mb-6 font-bold"
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: '#E8E6E3',
            }}
          >
            Clay Templates
            <br />
            <span className="font-light" style={{ color: 'rgba(232, 230, 227, 0.45)' }}>
              Crawl, Walk, Run
            </span>
          </h1>

          <p
            className="hero-subtitle mb-8 max-w-lg text-base leading-relaxed"
            style={{ color: 'rgba(232, 230, 227, 0.45)' }}
          >
            Clay workflows for Signals &amp; Intent, CRM Enrichment, Inbound Routing, ABM, and more &mdash; at every level of complexity.
          </p>

          <a
            href="https://cal.com/driveroi/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-cta group inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-200 hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #814ac8 0%, #9f5de8 100%)',
              color: '#fff',
              boxShadow: '0 0 20px rgba(129, 74, 200, 0.3)',
            }}
          >
            Want these built for you? Book a call
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Tier Legend */}
        <div className="mb-16 space-y-0">
          {(['crawl', 'walk', 'run'] as Tier[]).map((tier, i) => {
            const config = TIER_CONFIG[tier]
            return (
              <div key={tier}>
                {i > 0 && <div className="connector-line" />}
                <div
                  className="tier-card flex items-start gap-5 rounded-lg border px-5 py-4 transition-colors"
                  style={{
                    borderColor: 'rgba(255,255,255,0.06)',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${config.color}33`
                    e.currentTarget.style.backgroundColor = config.glowColor
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'
                  }}
                >
                  <span
                    className="mt-0.5 text-xs font-medium"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: 'rgba(232, 230, 227, 0.2)',
                      fontSize: '0.65rem',
                    }}
                  >
                    {config.number}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: config.color,
                          boxShadow: `0 0 8px ${config.color}66`,
                        }}
                      />
                      <span
                        className="text-sm font-semibold uppercase tracking-widest"
                        style={{
                          color: config.color,
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '0.7rem',
                        }}
                      >
                        {config.label}
                      </span>
                    </div>
                    <p
                      className="mt-1.5 text-sm leading-relaxed"
                      style={{ color: 'rgba(232, 230, 227, 0.45)' }}
                    >
                      {config.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Divider */}
        <div className="mb-12" style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)' }} />

        {/* Category Filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          {USE_CASE_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat
            const count = cat === 'All' ? TEMPLATES.length : TEMPLATES.filter((t) => t.useCase === cat).length
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.65rem',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                  color: isActive ? '#E8E6E3' : 'rgba(232, 230, 227, 0.35)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: isActive ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)',
                }}
              >
                {cat}
                {count > 0 && cat !== 'All' && (
                  <span
                    className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[0.55rem]"
                    style={{
                      backgroundColor: isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
                      color: isActive ? '#E8E6E3' : 'rgba(232, 230, 227, 0.25)',
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Templates */}
        <div className="space-y-3">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((template, i) => (
              <TemplateCard key={template.id} template={template} index={i} />
            ))
          ) : (
            <div
              className="template-card rounded-lg border border-dashed px-8 py-16 text-center"
              style={{
                borderColor: 'rgba(255,255,255,0.08)',
                backgroundColor: 'rgba(255,255,255,0.01)',
              }}
            >
              <p
                className="text-lg font-semibold"
                style={{
                  color: 'rgba(232, 230, 227, 0.25)',
                }}
              >
                {activeCategory === 'All' ? 'Templates launching soon' : `${activeCategory} templates coming soon`}
              </p>
              <p
                className="mx-auto mt-3 max-w-md text-xs leading-relaxed"
                style={{
                  color: 'rgba(232, 230, 227, 0.2)',
                }}
              >
                {activeCategory === 'All'
                  ? <>Clay table blueprints with video walkthroughs and step-by-step SOPs.</>
                  : <>More templates for this category are on the way. Check back soon.</>
                }
              </p>
            </div>
          )}
        </div>

        {/* Bonus: Claygent Prompt Writer Skill */}
        <ClaygentSkillSection />

        {/* Bottom CTA */}
        <div
          className="bottom-cta mt-20 rounded-lg border px-8 py-10 sm:py-12"
          style={{
            borderColor: 'rgba(255,255,255,0.06)',
            background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.04) 0%, rgba(249, 115, 22, 0.04) 100%)',
          }}
        >
          <h3
            className="mb-3 text-2xl font-bold"
            style={{
              color: '#E8E6E3',
              letterSpacing: '-0.02em',
            }}
          >
            These are the blueprints.
            <br />
            <span className="font-light" style={{ color: 'rgba(232, 230, 227, 0.45)' }}>
              We build the machine.
            </span>
          </h3>
          <p
            className="mb-6 max-w-md text-sm leading-relaxed"
            style={{ color: 'rgba(232, 230, 227, 0.4)' }}
          >
            Book a 30-minute call. We&apos;ll assess your current stack and tell you exactly
            which template fits &mdash; and what it takes to go live.
          </p>
          <a
            href="https://cal.com/driveroi/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-200 hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #814ac8 0%, #9f5de8 100%)',
              color: '#fff',
              boxShadow: '0 0 20px rgba(129, 74, 200, 0.3)',
            }}
          >
            Book a strategy call
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p
            className="text-xs"
            style={{
              color: 'rgba(232, 230, 227, 0.15)',
              fontSize: '0.7rem',
              letterSpacing: '0.03em',
            }}
          >
            &copy; {new Date().getFullYear()} DriveROI &mdash; Signal-to-pipeline infrastructure built on Clay
          </p>
        </div>
      </div>
    </>
  )
}
