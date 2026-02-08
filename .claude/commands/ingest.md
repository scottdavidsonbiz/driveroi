---
name: ingest
description: Process new content into the Context OS with proper front matter, tags, and connections
type: command
category: [knowledge-management, automation]
tags: [ingest, context-os, automation]
---

# /ingest - Content Ingestion Command

**Purpose:** Systematically add new content to the Context OS with proper metadata, tags, and connections.

---

## How to Use

```
/ingest [file_path] [content_type]
```

**Examples:**
- `/ingest transcripts/2025-11-14_call.txt transcript`
- `/ingest content/new-research.md framework`
- `/ingest Client\ Lead\ Magnets/NewCo-Accounts.md lead-magnet`

**Optional:** If no file path provided, Claude will ask for the content to process.

---

## What This Command Does

### 1. **Analyze Content**
- Read the file/content
- Identify key concepts, insights, frameworks
- Determine lifecycle status (emergent/validated/canonical)

### 2. **Review Taxonomy**
- Check against `docs/taxonomy.md`
- Select appropriate:
  - Content type
  - Categories
  - Use cases
  - Personas
  - Tags

### 3. **Generate Front Matter**
Based on taxonomy rules, create YAML front matter with:

```yaml
---
title: "Clear, descriptive title"
date: YYYY-MM-DD
type: [positioning | skill | case-study | framework | client-feedback | transcript | lead-magnet | resume]
category: [gtm-strategy, revenue-operations, etc.]
use-cases: [specific use cases]
personas: [who this is for]
lifecycle: emergent | validated | canonical
validated-by: [if validated/canonical]
canonical-since: [date if canonical]
integrates-with:
  - path/to/related/doc1.md
  - path/to/related/doc2.md
tags: [specific, relevant, tags]
---
```

### 4. **Identify Connections**
Scan existing knowledge base for related content:
- Skills that could use this content
- Positioning docs that reference similar concepts
- Transcripts with related insights
- Frameworks that this validates or contradicts

### 5. **Add Wiki-Links**
For canonical or validated content, suggest [[wiki-links]] to add:
```markdown
The [[build-run-prove-handoff]] model from 
[[marcos-conversation]] validates our [[premium-positioning]].
```

### 6. **Determine Lifecycle**

**emergent** - Use when:
- First time seeing this concept
- Single source/client mention
- Hypothesis, not yet validated
- Experimental approach

**validated** - Use when:
- Proven with 2+ client engagements
- Consistent pattern across sources
- Successful implementation
- Referenced by multiple other nodes

**canonical** - Use when:
- Core knowledge, foundational
- Stable, not changing frequently
- Referenced by many other nodes
- Part of standard approach/methodology

### 7. **Generate Summary**
Create brief summary for user:
- What was ingested
- Lifecycle status assigned
- Key connections identified
- Suggested next actions

---

## Decision Tree

### Content Type Identification

**Is it raw data from a call/meeting?**
→ `type: transcript`
→ `lifecycle: emergent` (unless pattern from multiple calls)

**Is it extracted insights from transcript(s)?**
→ `type: client-feedback`
→ `lifecycle: validated` (if from 2+ sources)

**Is it a structured approach/methodology?**
→ `type: framework`
→ `lifecycle: canonical` (if proven multiple times)

**Is it how you describe your service?**
→ `type: positioning`
→ `lifecycle: validated` (if client-tested)

**Is it research on target accounts?**
→ `type: lead-magnet`
→ `lifecycle: validated` (if based on real ICP)

**Is it a reusable workflow/process?**
→ `type: skill`
→ `lifecycle: validated` (if used 2+ times)

### Category Selection

**About sales/marketing/positioning?**
→ `category: [gtm-strategy]`

**About operations/processes/systems?**
→ `category: [revenue-operations]`

**About data/metrics/reporting?**
→ `category: [analytics]`

**About client conversations?**
→ `category: [client-discovery]`

**About your service offering?**
→ `category: [premium-service, service-model]`

**About content creation?**
→ `category: [social-media, content-creation]`

### Connection Identification

**Always check these locations:**
1. `positioning/` - Does this inform positioning?
2. `.claude/skills/` - Which skills could use this?
3. `transcripts/` - Related to other conversations?
4. `content/insights/` - Similar patterns?
5. `Client Lead Magnets/` - Related ICP research?

**Connection signals:**
- Same client/company mentioned
- Same problem/pain point discussed
- Same framework/approach referenced
- Same persona/role
- Validates or contradicts existing knowledge

---

## Output Format

After processing, provide:

```markdown
## ✅ Content Ingested

**File:** [path/to/file.md]
**Type:** [content-type]
**Lifecycle:** [emergent/validated/canonical]

### Front Matter Added
[Show the YAML front matter]

### Key Connections Identified
1. **Links to:** [related-doc-1.md]
   - Why: [reason for connection]
   
2. **Links to:** [related-doc-2.md]
   - Why: [reason for connection]

3. **Used by skills:**
   - [skill-name] - [how it's used]

### Suggested Wiki-Links
[If content warrants wiki-links, suggest where to add them]

### Next Actions
- [ ] Review front matter accuracy
- [ ] Add to relevant skill references if needed
- [ ] Run `/graph-health` to check connections
```

---

## Quality Checks

Before finalizing, verify:

✅ **Title** is clear and descriptive  
✅ **Date** is accurate  
✅ **Type** matches taxonomy.md exactly  
✅ **Categories** are from blessed list  
✅ **Use-cases** are specific and relevant  
✅ **Personas** match target audience  
✅ **Lifecycle** is justified by evidence  
✅ **Integrates-with** paths are correct  
✅ **Tags** are relevant and from taxonomy  
✅ At least 2-3 connections identified  
✅ Wiki-links suggested for canonical content

---

## Special Handling

### Transcripts
- Always check for insights that should become atomic nodes
- Look for new frameworks/patterns
- Identify client feedback that informs positioning
- Create separate client-feedback node if warranted

### Lead Magnets
- Extract ICP characteristics
- Link to cold-email-outreach skill
- Note any new targeting signals
- Update targeting-signals-framework if new patterns

### Frameworks
- Check against existing frameworks for overlap
- Identify which skills could incorporate
- Determine if canonical (proven) or emergent (new)
- Add detailed wiki-links for canonical frameworks

### Skills
- Always validate against skill-creator best practices
- Check progressive disclosure
- Ensure references/ folder used properly
- Link to positioning and relevant frameworks

---

## Integration with Other Commands

**After /ingest:**
- Run `/graph-health` to validate connections
- Use `/quickstart` if major restructuring needed
- Check Foam graph visualization

**Before /ingest:**
- Review `docs/taxonomy.md` for current tags
- Check existing content for similar topics
- Understand current lifecycle distribution

---

## Examples

### Example 1: Ingesting a Transcript

**Input:** `/ingest transcripts/2025-11-20_client-call.txt transcript`

**Process:**
1. Read transcript
2. Identify it's about PE portfolio GTM needs
3. Check taxonomy for transcript tags
4. Set lifecycle: emergent (first mention of this client)
5. Find connections to:
   - positioning/targeting-signals-framework.md (PE focus)
   - skills/refine-positioning/ (could extract insights)
6. Add front matter
7. Suggest creating client-feedback node

**Output:**
```yaml
---
title: "Client Call - PE Operating Partner - GTM Infrastructure"
date: 2025-11-20
type: transcript
category: [client-discovery, revenue-operations]
use-cases: [pe-portfolio, icp-validation]
personas: [pe-operating-partner, ceo-founder]
lifecycle: emergent
integrates-with:
  - positioning/targeting-signals-framework.md
  - skills/refine-positioning/SKILL.md
tags: [transcript, client-discovery, pe-portfolio, gtm-infrastructure]
---
```

### Example 2: Ingesting a Framework

**Input:** `/ingest content/new-outbound-framework.md framework`

**Process:**
1. Read framework
2. Identify it's about cold outreach methodology
3. Check against existing cold-email-outreach skill
4. Set lifecycle: validated (tested with 3 clients)
5. Find connections to:
   - skills/cold-email-outreach/SKILL.md
   - Client Lead Magnets (uses this approach)
6. Suggest wiki-links for [[tell-the-full-story]] references
7. Add to skill as reference file

**Output:**
```yaml
---
title: "Multi-Touch Outbound Framework"
date: 2025-11-20
type: framework
category: [gtm-strategy, sales-enablement]
use-cases: [cold-outreach, email-cadences]
personas: [cro, ceo-founder]
lifecycle: validated
validated-by: [trustap-campaign, beekeeper-campaign, ambry-campaign]
integrates-with:
  - skills/cold-email-outreach/SKILL.md
  - positioning/targeting-signals-framework.md
tags: [cold-email, outreach-framework, validated-approach]
---
```

---

## Tips for Success

1. **Be specific with connections** - Don't just say "related to positioning," say exactly which positioning doc and why

2. **Lifecycle is evidence-based** - emergent = 1 source, validated = 2-3 sources, canonical = 4+ or foundational

3. **Tags should aid discovery** - Think "what would I search for to find this?"

4. **Integrates-with creates the graph** - More connections = more powerful system

5. **Wiki-links for canonical only** - Don't over-link, reserve for stable, frequently referenced concepts

6. **Update taxonomy as needed** - If you find gaps, add new tags to docs/taxonomy.md

---

**Last Updated:** December 16, 2024  
**Part of:** Jacob Dietle's Context OS framework






