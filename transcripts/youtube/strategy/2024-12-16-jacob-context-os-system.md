---
title: "Jacob's Context Operating System Framework"
date: 2024-12-16
type: framework
category: [knowledge-management, automation]
use-cases: [context-os-implementation, ai-agents, compounding-knowledge]
source: Jacob Dietle
source-url: https://www.youtube.com/watch?v=acI1zRtpgEc
lifecycle: canonical
canonical-since: 2024-12-16
validated-by: [github-repo, implementation-in-progress]
key-insights:
  - claude-md-constitution
  - taxonomy-ontology-governance
  - progressive-disclosure-skills
  - knowledge-graph-foam
  - ingest-command-pattern
integrates-with:
  - .claude.md
  - docs/taxonomy.md
  - .claude/commands/ingest.md
  - .claude/commands/graph-health.md
  - docs/IMPLEMENTATION-STATUS.md
tags: [context-os, knowledge-management, automation, ai-agents, compounding-knowledge, jacob-dietle]
---

# Jacob's Context Operating System - Key Components

**Source:** YouTube  
**URL:** https://www.youtube.com/watch?v=acI1zRtpgEc  
**Channel:** Jacob (Context Engineering)  
**Extracted:** December 16, 2024  
**Use Case:** Strategy - Knowledge Management System  

---

## Executive Summary

Jacob's "Context Operating System" is a framework for building compounding knowledge systems that:
- Use **consistent tagging/taxonomy** to organize information
- Create **knowledge graphs** with linked nodes
- Enable **progressive disclosure** through skills
- **Compound learning over time** by connecting new context to existing knowledge

**Key Insight:** The system adapts to YOUR context while adding structure, meaning, and cross-file integration to create an emergent knowledge graph.

---

## Three Core Components (Foundation)

### 1. `.claude.md` File (The Constitution)
**What it is:** Always loaded into context window, acts as baseline instruction set

**Purpose:**
- "Think of it as your constitution" - how Claude should ALWAYS interact with the system
- Persists beyond individual chat windows
- Defines rules for how the system works

**What to include:**
- System purpose and goals
- How to interact with files/nodes
- Core rules and constraints
- Baseline instruction set

**Implementation for us:**
```markdown
# Context OS Constitution

## Purpose
This is a GTM operations knowledge base for Drive ROI (Scott + Brenda partnership).

## System Goals
1. Compound GTM learnings from client engagements
2. Connect positioning → skills → case studies → frameworks
3. Enable quick retrieval of what works (and what doesn't)
4. Build reusable playbooks that improve over time

## Core Rules
- Every piece of content must be tagged according to taxonomy
- New learnings must reference related existing nodes
- Skills use progressive disclosure (load references as needed)
- Feedback loops: Always capture what worked/didn't work
```

---

### 2. Taxonomy & Ontology (Governing Rule Set)
**What it is:** Rules for naming, grouping, and connecting things

**Taxonomy = Naming conventions**
- How to name files
- What tags are allowed
- Consistent structure

**Ontology = How things relate**
- How files/nodes connect to one another
- What metadata is required
- How to group related content

**Jacob's quote:**
> "Don't let the philosophical names intimidate you. It's just your governing rule set for the system that persists beyond just that AI chat window."

**Why it matters:**
- Keeps system consistent as it grows
- Limits possible tags so everything stays organized
- Each node is unique but follows same rules

**Implementation for us:**

#### Taxonomy (Tags We Use)
```yaml
# Content Types
- positioning
- skill
- case-study
- framework
- client-feedback
- transcript
- email-sequence
- icp-research

# Use Cases
- us-market-entry
- vertical-saas
- pe-portfolio
- cold-email
- linkedin-strategy

# Personas
- cfo
- cro
- cmo
- ceo-founder
- pe-operating-partner

# Status
- draft
- active
- validated
- archived

# Integration Tags (what connects to what)
- integrates-with: [list of related skills/docs]
- references: [list of source documents]
- case-studies: [list of relevant examples]
```

#### Ontology (How Things Connect)
```yaml
# Relationships
- "Cold Email Skill" → references → "Tell The Full Story Framework"
- "Marcos Conversation" → informs → "Premium Positioning Doc"
- "Trustap Lead Magnet" → uses → "Cold Email Skill" + "ICP Research Framework"
- "LinkedIn Skill" → integrates-with → "Extract Insights Skill"

# Metadata Structure (Front Matter)
---
title: [Document Title]
type: [Content Type from taxonomy]
use-cases: [List from taxonomy]
personas: [List from taxonomy]
created: [Date]
last-updated: [Date]
status: [Status from taxonomy]
integrates-with: [Related docs]
references: [Source materials]
---
```

---

### 3. `.claude/` Folder (Customization)
**What it is:** How you customize Claude's behavior

**Three key types:**

#### **Commands** (Inject Context)
- Take an MD file and inject it into chat window
- Example: `/quickstart` - Reviews raw context and sets up system
- Example: `/ingest [topic]` - Adds new content using existing taxonomy

**For us:**
- `/positioning` - Load current premium positioning
- `/skill [name]` - Load specific skill with progressive disclosure
- `/client-feedback [client]` - Load learnings from specific engagement
- `/framework [name]` - Load specific GTM framework

#### **Agents** (Separate Context Window)
- Create another context window to do something independently
- Reports back to main window
- "Modularize a task and say go off do this thing"

**For us:**
- Agent to analyze transcripts and create case study nodes
- Agent to review cold email sequences and suggest improvements based on past feedback
- Agent to cross-reference new positioning against existing skills for consistency

#### **Skills** (Progressive Disclosure)
**This is the KEY differentiator**

**Jacob's quote:**
> "A way to progressively show more context as it's needed. It's a way to teach Claude a skill. You can say hey this is our copywriting guidelines. Here's where to start to look to understand how we want to do copywriting and then when you need to get more information about the framework go get it right."

**Structure:**
```
.claude/skills/
  cold-email-outreach/
    SKILL.md          # Main instructions (always loaded)
    references/       # Only loaded when needed
      email-templates.md
      subject-lines.md
      13-rules-of-engagement.md
```

**Why this matters:**
- Saves tokens by only loading what's needed
- Can have deep expertise without overwhelming context
- "This is just one file but that's how that works"

**We're already doing this!** Our skills use progressive disclosure pattern.

---

## The Tagging System (How to Implement)

### Front Matter (Metadata)
**What it is:** YAML at top of every file

**Jacob's quote:**
> "Metadata is data about data and in this system it is stored in the format of front matter. Front matter because it goes at the front of the file and all it does is basically a summary for both people and AI agents to understand what's in the document without having to read the whole thing."

**Structure:**
```yaml
---
title: "Marcos Conversation Insights"
type: transcript
use-cases:
  - us-market-entry
  - service-model-refinement
personas:
  - ceo-founder
  - international-founder
created: 2024-12-16
last-updated: 2024-12-16
status: validated
integrates-with:
  - premium-positioning-2024-12-16
  - build-run-prove-handoff-model
references:
  - marcos-x-scott-brenda-transcript
key-insights:
  - Build → Run → Prove → Handoff service model
  - $2K/month budget for 12 months = premium if results proven
  - International positioning validated
tags:
  - client-discovery
  - service-model
  - premium-positioning
---
```

**Benefits:**
1. AI can scan front matter without reading full doc
2. Humans can quickly understand what's in a file
3. Creates connections between related docs
4. Enables knowledge graph visualization

---

## Compounding Context/Learning (The Magic)

### Knowledge Graph Structure

**Jacob's explanation:**
> "Because we are tagging everything properly and then showing how it relates together... this is how you get this emergent knowledge graph that is both human readable and agent navigable."

### How it Compounds

**The Problem:** Most systems create redundant information
**The Solution:** Connect new context to existing nodes

**Jacob's quote:**
> "You get this emergent greater than sum parts behavior. This is really important when you want to say hey like there's this new transcript. How does this relate to existing ideas in the node? You don't produce redundant information and all of the work you've done already can be compounded on itself to better incorporate novel information."

**Example for us:**

**Before (Redundant):**
- Marcos conversation notes (standalone)
- Premium positioning doc (standalone)
- Cold email skill (standalone)
- No connections between them

**After (Compounded):**
```
Marcos Conversation
  ↓ (informs)
Premium Positioning Doc
  ↓ (defines service tiers)
Cold Email Skill
  ↓ (uses for)
Trustap Lead Magnet
  ↓ (generates)
Client Feedback
  ↓ (refines)
Back to Skills & Positioning
```

### Atomic Nodes with Relationships

**What Jacob did:**
1. Started with raw transcripts
2. Used `/ingest` command to process them
3. System created "atomic nodes" (single-concept files)
4. Each node tagged and linked to related nodes
5. Created knowledge graph showing connections

**For us:**

**Atomic Node Example:**
```
client-feedback/
  marcos-build-run-prove-handoff.md  ← Single insight
    - Tags: service-model, us-market-entry
    - Links: premium-positioning, cold-email-skill
  
  ambry-emails-too-long.md  ← Single feedback point
    - Tags: email-length, feedback
    - Links: cold-email-skill, tell-full-story-framework
    
  trustap-icp-analysis.md  ← Single client work
    - Tags: icp-research, fintech
    - Links: cold-email-skill, lead-magnet-process
```

**Result:** 
- New Marcos conversation → Links to build-run-prove model
- Ambry feedback → Refines cold email skill
- Trustap work → Validates ICP research framework
- Everything compounds!

---

## Progressive Disclosure in Skills (Already Doing This!)

### What We Have
```
.claude/skills/
  cold-email-outreach/
    SKILL.md                    # Loaded first (core instructions)
    references/                 # Loaded only when needed
      email-templates.md
      13-rules-of-engagement.md
      buyer-psychology.md
      phrases-to-avoid.md
```

### Why This Works

**Jacob's explanation:**
> "Here's where to start to look to understand how we want to do copywriting and then when you need to get more information about the framework go get it right."

**Flow:**
1. Ask Claude to write cold email using skill
2. Claude loads `SKILL.md` (main instructions)
3. If needs specific framework → loads `13-rules-of-engagement.md`
4. If needs templates → loads `email-templates.md`
5. Only loads what's needed for the specific task

**We're already implementing this correctly!**

---

## Commands to Implement

### `/quickstart` Command
**What it does:**
1. Looks at raw context in your repository
2. Asks what main purpose of system is
3. Creates taxonomy and ontology based on your context
4. Structures the cloud.md file
5. Creates initial knowledge base

**For us:**
- Already have structure (positioning/, skills/, client-lead-magnets/, transcripts/)
- Could use to AUDIT and improve consistency
- Or use when starting new client engagement (create client-specific context OS)

### `/ingest` Command
**What it does:**
1. Takes new content (transcripts, docs, emails)
2. Reviews against existing taxonomy/ontology
3. Creates atomic nodes
4. Tags appropriately
5. Links to related existing nodes

**For us:**
Example: `/ingest marcos-transcript`
- Creates atomic nodes for each key insight
- Tags with: client-discovery, service-model, premium-positioning
- Links to: premium-positioning-doc, cold-email-skill, us-market-entry docs
- Updates knowledge graph

### Custom Commands We Could Build

```bash
# Load current positioning context
/positioning

# Load specific client context
/client [trustap|beekeeper|marcos]

# Generate lead magnet for new client
/lead-magnet [client-name] [industry]

# Review skill for improvements
/skill-review [skill-name]

# Analyze what's working across clients
/feedback-analysis

# Create case study from client work
/case-study [client-name]
```

---

## Knowledge Graph Visualization

### Tool: Foam Extension
**What it is:** VS Code extension that visualizes markdown knowledge graphs

**Jacob's quote:**
> "Install it as an extension... it's called foam, super easy, it's free. Install it and then show commands, type 'foam show graph' so you can view your actual knowledge graph as a real graph."

**How it works:**
1. Reads front matter from all markdown files
2. Parses tags and links
3. Creates visual graph showing connections
4. Clickable nodes to navigate
5. Shows "emergent knowledge graph that is both human readable and agent navigable"

**For us:**
```bash
# Install Foam extension in Cursor/VS Code
# Then run:
Command Palette → "Foam: Show Graph"

# Would show:
- Premium Positioning (center node)
  ↓ Connected to
- US Market Entry Segment
- Cold Email Skill
- Marcos Insights
- Lead Magnet Examples
- Client Feedback
```

**Benefits:**
- SEE how everything connects
- Find gaps (unconnected nodes)
- Identify redundancies (multiple nodes for same concept)
- Navigate knowledge base visually

---

## What We Can Implement NOW

### 1. ✅ Add Front Matter to Existing Docs

**Start with key documents:**
```yaml
# positioning/premium-positioning-2024-12-16.md
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
created: 2024-12-16
status: active
integrates-with:
  - cold-email-outreach
  - linkedin-growth-strategy
  - marcos-insights
references:
  - brenda-resume
  - marcos-transcript
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

### 2. ✅ Create `.claude.md` Constitution

**File:** `.claude.md` (root of repository)

```markdown
# Drive ROI Context Operating System

## System Purpose
This is a GTM operations knowledge base for Drive ROI, a premium partnership (Scott Davidson + Brenda Hali) specializing in:
- Foreign companies entering US market
- Vertical SaaS GTM operations
- PE portfolio revenue operations

## How to Use This System

### When Creating Content
1. Always add front matter with proper taxonomy tags
2. Link to related existing nodes (use `integrates-with` and `references`)
3. Create atomic nodes (one concept per file when possible)
4. Update connections when adding new content

### Taxonomy (Required Tags)

**Content Types:**
- positioning, skill, case-study, framework, client-feedback, transcript, email-sequence, icp-research, lead-magnet

**Use Cases:**
- us-market-entry, vertical-saas, pe-portfolio, cold-email, linkedin-strategy

**Personas:**
- cfo, cro, cmo, ceo-founder, pe-operating-partner, international-founder

**Status:**
- draft, active, validated, archived

### Knowledge Compounding Rules
1. Before creating new content, search for existing related nodes
2. Reference existing frameworks/skills instead of duplicating
3. Client feedback should update related skills/positioning
4. Transcripts should create atomic insight nodes, not standalone docs

### Progressive Disclosure
Skills use references/ folder for detailed content.
Load main SKILL.md first, then references as needed.

### Git Workflow
- Commit atomic changes with clear messages
- Tag major updates (v1.0, v2.0, etc.)
- Use branches for experimental positioning/skills
```

### 3. ✅ Create Taxonomy Document

**File:** `docs/taxonomy.md`

```markdown
# Drive ROI Taxonomy & Ontology

## Content Types
- `positioning` - Company/partnership positioning documents
- `skill` - Reusable Claude skills for GTM tasks
- `case-study` - Client success stories and examples
- `framework` - GTM frameworks and methodologies
- `client-feedback` - Learnings from engagements
- `transcript` - Conversation transcripts and notes
- `email-sequence` - Cold email sequences and templates
- `icp-research` - Ideal customer profile research
- `lead-magnet` - Lead generation deliverables

## Use Case Tags
- `us-market-entry` - International → US expansion
- `vertical-saas` - CFO/HR/construction/legal/healthcare software
- `pe-portfolio` - PE portfolio company operations
- `cold-email` - Cold email outreach
- `linkedin-strategy` - LinkedIn content and growth

## Persona Tags
- `cfo` - Chief Financial Officer
- `cro` - Chief Revenue Officer
- `cmo` - Chief Marketing Officer
- `ceo-founder` - CEO or Founder
- `pe-operating-partner` - PE firm operating partner
- `international-founder` - Founder based outside US

## Relationship Types
- `integrates-with` - Works together with (skills, frameworks)
- `references` - Source material (transcripts, docs)
- `case-studies` - Real examples
- `informs` - Provides insights for
- `validates` - Proves effectiveness of
- `refines` - Improves based on feedback

## File Naming Conventions
- **Positioning:** `positioning-[topic]-[YYYY-MM-DD].md`
- **Skills:** `.claude/skills/[skill-name]/SKILL.md`
- **Transcripts:** `transcripts/[yyyy-mm-dd]-[title].md`
- **Lead Magnets:** `Client Lead Magnets/[Client]-[Deliverable].md`
- **Feedback:** `client-feedback/[client]-[insight].md`
```

### 4. ⏭️ Install Foam Extension

**Steps:**
1. Open Cursor/VS Code
2. Extensions → Search "Foam"
3. Install "Foam" extension
4. Command Palette → "Foam: Show Graph"
5. View knowledge graph!

### 5. ⏭️ Create `/ingest` Command Template

**File:** `.claude/commands/ingest.md`

```markdown
# Ingest New Context

**Purpose:** Add new content to knowledge base using existing taxonomy

**Process:**
1. Review the content provided
2. Check against existing taxonomy and ontology
3. Create atomic nodes (one concept per file)
4. Add proper front matter with tags
5. Identify connections to existing nodes
6. Update related documents if needed
7. Summarize what was added and how it connects

**Usage:**
/ingest [description of content]

Example: "/ingest marcos transcript about build-run-prove model"
```

### 6. ⏭️ Create Client Feedback Loop

**Structure:**
```
client-feedback/
  [client-name]-[insight-slug].md
  
Example:
client-feedback/
  marcos-build-run-prove-handoff.md
  marcos-budget-2k-monthly.md
  marcos-international-positioning.md
  ambry-emails-too-long.md
  trustap-icp-fintech-marketplaces.md
```

**Template:**
```yaml
---
title: "Marcos: Build → Run → Prove → Handoff Model"
type: client-feedback
client: marcos
created: 2024-12-16
status: validated
integrates-with:
  - premium-positioning-2024-12-16
  - cold-email-outreach
refines:
  - service-delivery-model
  - engagement-structure
tags:
  - service-model
  - engagement-duration
  - premium-justification
---

## Insight
Clients don't want consultants who "deliver 4 campaigns and disappear."
They want 12-month partnerships: Build → Run → Prove → Handoff.

## What This Changes
1. **Positioning:** Emphasize ongoing partnership vs. project-based
2. **Pricing:** Justify $2K/month × 12 = $24K engagement
3. **Service tiers:** Add "Run" phase (months 3-9) to all tiers
4. **Marketing:** "We don't just build it—we run it with you until proven"

## Evidence
- Marcos quote: "I need to run it. It's not 4 campaigns and done."
- Wanted weekly coaching, iterative optimization
- Goal: 50 demos/month PROVEN before handoff

## Action Items
- [x] Update premium positioning doc
- [ ] Revise website to emphasize Build → Run → Prove → Handoff
- [ ] Update proposal templates
- [ ] Create case study after Marcos engagement

## Related Nodes
- [[premium-positioning-2024-12-16]]
- [[marcos-conversation-insights]]
- [[cold-email-outreach]]
```

---

## Implementation Priority

### WEEK 1: Foundation
1. ✅ Create `.claude.md` constitution
2. ✅ Create `docs/taxonomy.md`
3. ✅ Add front matter to 5 key docs:
   - Premium positioning
   - Cold email skill
   - LinkedIn skill
   - Marcos insights
   - Trustap lead magnet

### WEEK 2: Connections
4. ⏭️ Install Foam extension
5. ⏭️ View knowledge graph
6. ⏭️ Identify missing connections
7. ⏭️ Add `integrates-with` links across docs

### WEEK 3: Compounding
8. ⏭️ Create client feedback nodes (atomic)
9. ⏭️ Link feedback → skills/positioning
10. ⏭️ Test `/ingest` workflow with new transcript

### WEEK 4: Automation
11. ⏭️ Create custom commands (`/positioning`, `/client`, `/lead-magnet`)
12. ⏭️ Document knowledge compounding process
13. ⏭️ Train on updating graph as you work

---

## Key Quotes from Jacob

### On Compounding Knowledge
> "You get this emergent greater than sum parts behavior. When you want to say hey like there's this new transcript. How does this relate to existing ideas in the node? You don't produce redundant information and all of the work you've done already can be compounded on itself to better incorporate novel information."

### On Progressive Disclosure
> "It's a way to teach Claude a skill. Here's where to start to look to understand how we want to do copywriting and then when you need to get more information about the framework go get it right."

### On System Adaptation
> "It's meant to conform and adapt to the context you give it while adding structure, meaning and integrating across all the different files to create a knowledge graph."

### On Practical Value
> "It is always a million times more obvious how this is valuable and helpful when you actually bring in your own context. The actual magic is when you're using it for your own context."

---

## Bottom Line: What Makes This Powerful

### Without Context OS (Current State)
- **Marcos conversation:** Standalone transcript
- **Premium positioning:** Standalone doc
- **Cold email skill:** Standalone skill
- **No connections, no compounding**

### With Context OS (Future State)
- **Marcos conversation** → Creates atomic insight nodes
- **Insight nodes** → Update premium positioning
- **Premium positioning** → Informs cold email skill updates
- **Cold email skill** → Used in Trustap lead magnet
- **Trustap feedback** → Refines skill again
- **Everything compounds!**

**Result:** 
- Every client teaches you something
- Every engagement improves your system
- Past work makes future work better
- Knowledge compounds over time

**Jacob's vision:** "Context systems are the foundation of a new internet."

For us: **It's a competitive moat. Your knowledge gets smarter while competitors start from scratch every time.**

---

**Next Steps:**
1. Review this analysis
2. Decide which components to implement first
3. Start with `.claude.md` and taxonomy
4. Add front matter to existing docs
5. Install Foam to visualize graph

---

**Date Analyzed:** December 16, 2024  
**Recommended Implementation:** Start Week 1 foundation immediately

