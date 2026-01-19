# Drive ROI Taxonomy & Ontology

**Version:** 1.0  
**Last Updated:** December 16, 2024  
**Purpose:** Defines tags, naming conventions, and relationship rules for Context OS

---

## Content Types

| Type | Description | Example |
|---|---|---|
| `positioning` | Company/partnership positioning documents | Premium positioning doc |
| `skill` | Reusable Claude skills for GTM tasks | Cold email outreach skill |
| `case-study` | Client success stories and examples | Trustap lead magnet |
| `framework` | GTM frameworks and methodologies | Tell The Full Story framework |
| `client-feedback` | Learnings from engagements (atomic nodes) | Build→Run→Prove→Handoff model |
| `transcript` | Conversation transcripts | Marcos discovery call |
| `insight` | Extracted insights from transcripts | Jeff IVS Tax insights |
| `email-sequence` | Cold email sequences and templates | Ambry.io email sequence |
| `icp-research` | Ideal customer profile research | Trustap ICP analysis |
| `lead-magnet` | Lead generation deliverables | 25 target accounts |
| `research` | Market research and competitive analysis | SLED procurement research |

---

## Use Case Tags

| Tag | When to Use | Example |
|---|---|---|
| `us-market-entry` | International → US expansion | Marcos (Spain→US), Brenda's international expertise |
| `vertical-saas` | Vertical software (CFO/HR/construction/legal/healthcare) | Finance SaaS, HR tech |
| `pe-portfolio` | PE portfolio company operations | Brenda's EigenRev work |
| `cold-email` | Cold email outreach | Email sequences, Tell The Full Story |
| `linkedin-strategy` | LinkedIn content and growth | Adam Robinson framework |
| `positioning` | Company positioning | Premium partnership positioning |
| `icp-definition` | Ideal customer profile work | Trustap ICP, Beekeeper mid-market |
| `service-model` | How we deliver services | Build→Run→Prove→Handoff |
| `sales-enablement` | Tools for sales conversations | Lead magnets, case studies |

---

## Persona Tags

| Persona | When to Use | Example Client/Content |
|---|---|---|
| `cfo` | Chief Financial Officer | Finance SaaS companies, Scott's FP&A angle |
| `cro` | Chief Revenue Officer | PE portfolio companies |
| `cmo` | Chief Marketing Officer | Marketing attribution, pipeline |
| `ceo-founder` | CEO or Founder | Marcos, Jeff (IVS), Gautier, Keegan (Voice Brain) |
| `pe-operating-partner` | PE firm operating partner | Brenda's EigenRev clients |
| `international-founder` | Founder based outside US | Marcos (Spain), Treasury Hub (LatAm/Africa) |
| `vp-sales` | VP Sales | Sales infrastructure needs |

---

## Status Tags

| Status | Meaning | When to Use |
|---|---|---|
| `draft` | Work in progress | Initial positioning drafts |
| `active` | Currently using | Current positioning, active skills |
| `validated` | Proven with client work | Trustap lead magnet (delivered), Marcos insights |
| `archived` | Historical reference | Old positioning versions |

---

## Industry Tags

| Industry | Example Companies/Content |
|---|---|
| `fintech` | Trustap, Treasury Hub, PatientFi |
| `saas` | General B2B SaaS |
| `marketplace` | Trustap (payment marketplace) |
| `security` | Security software companies |
| `public-safety` | Voice Brain (police departments) |
| `environmental` | Gautier (environmental data platform) |
| `healthcare` | IVS Home Health |
| `professional-services` | IVS Tax, consulting firms |
| `construction` | Construction software (vertical SaaS focus) |
| `hospitality` | Hotels, restaurants (frontline workforce) |

---

## Client Tags

| Client | Status | Industry | Key Insights |
|---|---|---|---|
| `marcos` | Active prospect | Fintech | Build→Run→Prove→Handoff, US market entry |
| `trustap` | Lead magnet delivered | Fintech/Marketplace | ICP fintech + e-commerce |
| `beekeeper` | Lead magnet delivered | SaaS/Workforce | Mid-market focus |
| `voice-brain` | Discovery | Public Safety | Federal sales, SLED procurement |
| `ivs-tax` | Progressed to kickoff | Professional Services | Founder-led legacy business |
| `ivs-home-health` | Discovery | Healthcare | Territory planning |
| `gautier` | Discovery | Environmental/Data | Early-stage SaaS |
| `ben-patientfi` | Low priority | Fintech | Budget constraints |
| `treasury-hub` | Discovery (no transcript) | Fintech | LatAm/Africa expansion |

---

## Relationship Types

### integrates-with
**Purpose:** Two things work together  
**Example:** 
```yaml
# In cold-email-outreach/SKILL.md
integrates-with:
  - linkedin-growth-strategy
  - icp-research-framework
```

### references
**Purpose:** Source material or inspiration  
**Example:**
```yaml
# In premium-positioning-2024-12-16.md
references:
  - marcos-transcript
  - brenda-resume
  - positioning-combined-partnership-2024-12-09
```

### case-studies
**Purpose:** Real client examples proving effectiveness  
**Example:**
```yaml
# In cold-email-outreach/SKILL.md
case-studies:
  - trustap-lead-magnet
  - ambry-email-sequence
```

### informs
**Purpose:** Provides insights that shaped this content  
**Example:**
```yaml
# In premium-positioning-2024-12-16.md
informs:
  - marcos-conversation-insights
  - positioning-update-2024-12-09
```

### validates
**Purpose:** Proves this works in practice  
**Example:**
```yaml
# In icp-research-framework.md
validates:
  - trustap-icp-analysis
  - beekeeper-mid-market-list
```

### refines
**Purpose:** Improves based on feedback  
**Example:**
```yaml
# In client-feedback/ambry-emails-too-long.md
refines:
  - cold-email-outreach-skill
  - tell-full-story-framework
```

---

## File Naming Conventions

### Positioning Documents
**Format:** `positioning-[topic]-[YYYY-MM-DD].md`

**Examples:**
- `positioning-premium-partnership-2024-12-16.md`
- `positioning-combined-partnership-2024-12-09.md`
- `positioning-update-2024-12-09.md`

### Skills
**Format:** `.claude/skills/[skill-name]/SKILL.md`

**Examples:**
- `.claude/skills/cold-email-outreach/SKILL.md`
- `.claude/skills/linkedin-growth-strategy/SKILL.md`
- `.claude/skills/extract-insights/SKILL.md`

### Transcripts
**Format:** `transcripts/[YYYY-MM-DD]_[HH-MM]_[participants]-[topic]_transcript.txt`

**Examples:**
- `2025-11-24_10-30_voice-brain-and-drive-roi-intro_transcript.txt`
- `2025-10-29_11-30_jeff-scott-sync_transcript.txt`

### Insights
**Format:** `content/insights/[YYYY-MM-DD]_[HH-MM]_[participants]-[topic]_insights.md`

**Examples:**
- `2025-11-24_10-30_voice-brain-and-drive-roi-intro_insights.md`
- `2025-10-29_11-30_jeff-scott-sync_insights.md`

### Client Feedback (Atomic Nodes)
**Format:** `client-feedback/[client]-[insight-slug].md`

**Examples:**
- `client-feedback/marcos-build-run-prove-handoff.md`
- `client-feedback/marcos-international-positioning-validated.md`
- `client-feedback/ambry-emails-too-long.md`
- `client-feedback/trustap-icp-fintech-marketplaces.md`
- `client-feedback/jeff-founder-led-legacy-business-pattern.md`

### Lead Magnets
**Format:** `Client Lead Magnets/[Client]-[Deliverable].md`

**Examples:**
- `Trustap-25-Target-Accounts.md`
- `Beekeeper-25-Mid-Market-Target-Accounts.md`

### Research Documents
**Format:** `content/[client]-[topic]-research.md`

**Examples:**
- `voice-brain-sled-procurement-research.md`
- `voice-brain-pvp-sled-opportunities.md`

---

## Front Matter Template

### Standard Template (All Documents)
```yaml
---
title: "[Document Title]"
type: [Content Type from taxonomy]
use-cases: [List from taxonomy]
personas: [List from taxonomy]
created: [YYYY-MM-DD]
last-updated: [YYYY-MM-DD]
status: [Status from taxonomy]
integrates-with: [Related docs]
references: [Source materials]
tags: [Additional tags]
---
```

### Positioning Document Template
```yaml
---
title: "Premium GTM Operations Partnership"
type: positioning
use-cases:
  - us-market-entry
  - vertical-saas
  - pe-portfolio
personas:
  - cfo
  - cro
  - ceo-founder
  - pe-operating-partner
  - international-founder
created: 2024-12-16
last-updated: 2024-12-16
status: active
integrates-with:
  - cold-email-outreach
  - linkedin-growth-strategy
references:
  - marcos-conversation-insights
  - brenda-resume
  - positioning-combined-partnership-2024-12-09
key-concepts:
  - build-run-prove-handoff
  - premium-credentials
  - foreign-to-us-market-entry
tags:
  - positioning
  - premium
  - partnership
---
```

### Skill Template
```yaml
---
name: cold-email-outreach
description: Write effective cold email sequences using Tell The Full Story framework and 13 Rules of Engagement
type: skill
use-cases:
  - cold-email
  - us-market-entry
  - icp-definition
personas:
  - ceo-founder
  - cro
  - international-founder
created: 2024-12-09
last-updated: 2024-12-16
status: active
integrates-with:
  - linkedin-growth-strategy
  - icp-research-framework
references:
  - tell-full-story-framework
  - 13-rules-of-engagement
  - buyer-psychology
case-studies:
  - trustap-lead-magnet
  - ambry-email-sequence
tags:
  - cold-email
  - automation
  - frameworks
---
```

### Transcript Template
```yaml
---
title: "Marcos × Scott × Brenda Discovery Call"
type: transcript
participants:
  - marcos
  - scott
  - brenda
date: 2024-12-16
client: marcos
use-cases:
  - us-market-entry
  - service-model
personas:
  - ceo-founder
  - international-founder
status: validated
informs:
  - marcos-conversation-insights
  - premium-positioning-2024-12-16
key-topics:
  - build-run-prove-handoff-model
  - budget-2k-monthly
  - international-positioning
tags:
  - client-discovery
  - service-model
  - premium
---
```

### Client Feedback (Atomic Node) Template
```yaml
---
title: "[Client]: [Specific Insight]"
type: client-feedback
client: [client-tag]
created: [YYYY-MM-DD]
status: validated
integrates-with:
  - [related-skills]
  - [related-positioning]
refines:
  - [what-this-improves]
references:
  - [source-transcript]
  - [source-insight-doc]
tags:
  - [specific-tags]
---

## Insight
[One-sentence summary of the learning]

## What This Changes
[Bullet points of specific updates needed]

## Evidence
[Quotes, data, or observations supporting this]

## Action Items
- [ ] Update X
- [ ] Revise Y
- [ ] Create Z

## Related Nodes
- [[related-doc-1]]
- [[related-doc-2]]
```

### Lead Magnet Template
```yaml
---
title: "[Client] - [Deliverable Title]"
type: lead-magnet
client: [client-tag]
industry: [industry-tag]
created: [YYYY-MM-DD]
last-updated: [YYYY-MM-DD]
status: [draft/delivered]
use-cases:
  - [relevant-use-cases]
personas:
  - [target-personas]
integrates-with:
  - [skills-used]
  - [frameworks-used]
validates:
  - [what-this-proves]
references:
  - [research-docs]
  - [transcripts]
tags:
  - lead-magnet
  - [industry]
  - [specific-tags]
---
```

---

## Tag Usage Guidelines

### Required Tags (Every Document)
- `title`
- `type`
- `created`
- `status`

### Strongly Recommended
- `use-cases` (what problem does this solve?)
- `personas` (who is this for?)
- `integrates-with` (what does this connect to?)

### Optional But Valuable
- `references` (source material)
- `case-studies` (real examples)
- `validates` (what this proves)
- `refines` (what this improves)
- `key-concepts` (main ideas)
- `tags` (additional searchable tags)

---

## Common Tagging Patterns

### Pattern 1: Positioning Document
```yaml
type: positioning
status: active
integrates-with: [skills, frameworks]
references: [transcripts, insights, research]
key-concepts: [main-ideas]
```

### Pattern 2: Skill
```yaml
type: skill
status: active
use-cases: [problems-it-solves]
personas: [who-uses-it]
integrates-with: [other-skills]
references: [frameworks, source-material]
case-studies: [real-examples]
```

### Pattern 3: Client Feedback (Atomic Node)
```yaml
type: client-feedback
client: [client-name]
status: validated
refines: [what-it-improves]
references: [source-transcript]
integrates-with: [related-skills-or-positioning]
```

### Pattern 4: Lead Magnet
```yaml
type: lead-magnet
client: [client-name]
industry: [industry]
status: delivered
use-cases: [what-it-demonstrates]
integrates-with: [skills-used]
validates: [frameworks-proven]
```

### Pattern 5: Transcript
```yaml
type: transcript
participants: [people-on-call]
client: [client-if-applicable]
date: [YYYY-MM-DD]
status: validated
informs: [what-it-influenced]
key-topics: [main-discussion-points]
```

---

## Quality Checks

### Before Tagging a Document
- [ ] Is `type` from approved taxonomy?
- [ ] Are `use-cases` from approved list?
- [ ] Are `personas` from approved list?
- [ ] Are `integrates-with` links valid (documents exist)?
- [ ] Is `status` accurate?
- [ ] Are industry tags consistent with other documents?

### After Adding Front Matter
- [ ] Can you understand the document from metadata alone?
- [ ] Are all connections to other documents listed?
- [ ] Would someone else know when to use this document?
- [ ] Is the metadata specific enough to be useful?

---

## Evolution of Taxonomy

### When to Add New Tags

**Add new content type when:**
- Existing types don't accurately describe new content
- New content serves fundamentally different purpose
- Multiple documents would benefit from this type

**Add new use case when:**
- New problem/solution pattern emerges across multiple clients
- Existing use cases don't capture the value
- This becomes a repeatable offering

**Add new persona when:**
- Targeting new decision-maker role
- Multiple pieces of content serve this persona
- This represents significant market segment

**Add new industry when:**
- Serving new industry vertical
- Industry-specific content accumulates
- This represents focus area

### How to Evolve Taxonomy
1. Propose change in this document
2. Review impact on existing documents
3. Update this taxonomy
4. Update `.claude.md` if needed
5. Retroactively update affected documents
6. Commit with clear message

---

## Maintenance

### Weekly
- Review new documents for proper tagging
- Check for broken `integrates-with` links
- Identify documents missing front matter

### Monthly
- Review tag usage frequency
- Identify underutilized or duplicate tags
- Consolidate similar tags if needed
- Add new tags based on patterns

### Quarterly
- Major taxonomy review
- Client tag updates (status changes)
- Archive old content appropriately
- Validate all connections still make sense

---

**Last Updated:** December 16, 2024  
**Next Review:** January 15, 2025  
**Maintained by:** Scott Davidson & Brenda Hali




