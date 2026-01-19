---
name: graph-health
description: Check Context OS health - count nodes, check connections, identify orphans, report lifecycle distribution
type: command
category: [knowledge-management, system-health]
tags: [graph-health, context-os, validation]
---

# /graph-health - System Health Check

**Purpose:** Validate the Context OS is properly structured, connected, and compounding knowledge effectively.

---

## How to Use

```
/graph-health
```

**Optional flags:**
- `/graph-health --detailed` - Show all orphaned nodes and weak connections
- `/graph-health --by-type [type]` - Focus on specific content type
- `/graph-health --lifecycle` - Show lifecycle distribution

---

## What This Command Checks

### 1. **Total Node Count**
Count all documents with front matter in:
- `positioning/`
- `.claude/skills/`
- `transcripts/`
- `content/`
- `content/insights/`
- `Client Lead Magnets/`

**Healthy target:** 50+ nodes for mature system

### 2. **Connection Density**
For each document with front matter:
- Count `integrates-with` entries
- Calculate average connections per node

**Healthy target:** 3+ connections per node on average

### 3. **Orphaned Nodes**
Identify documents with:
- 0 connections in `integrates-with`
- Not referenced by any other document
- No tags or <2 tags

**Healthy target:** <10% orphaned nodes

### 4. **Lifecycle Distribution**
Count nodes by lifecycle status:
- `emergent` (new concepts)
- `validated` (proven with clients)
- `canonical` (core stable knowledge)

**Healthy targets:**
- Emergent: 20-30%
- Validated: 40-50%
- Canonical: 20-30%

### 5. **Tag Coverage**
- Documents without tags
- Most used tags (top 10)
- Underutilized categories

**Healthy target:** Every document has 3-5 relevant tags

### 6. **Bidirectional Links**
Check if connections are reciprocal:
- Doc A links to Doc B
- Does Doc B link back to Doc A?

**Healthy target:** 60%+ bidirectional

---

## Output Format

```markdown
# 📊 Context OS Health Report

**Generated:** [timestamp]
**Total Documents Analyzed:** [count]

---

## ✅ Overall Health Score: [0-100]

[Visual health bar]

---

## 📈 Key Metrics

### Node Count
- **Total nodes:** [X]
- **With front matter:** [X] ([%])
- **Target:** 50+ ✓/✗

### Connection Density
- **Average connections per node:** [X.X]
- **Well-connected (3+ links):** [X] nodes ([%])
- **Target:** 3+ average ✓/✗

### Orphaned Nodes
- **Orphaned (0 connections):** [X] nodes ([%])
- **Target:** <10% ✓/✗

**Orphaned nodes found:**
1. [path/to/orphan1.md] - [reason why orphaned]
2. [path/to/orphan2.md] - [reason why orphaned]

### Lifecycle Distribution
- **emergent:** [X] ([%]) [health indicator: ✓/⚠/✗]
- **validated:** [X] ([%]) [health indicator: ✓/⚠/✗]
- **canonical:** [X] ([%]) [health indicator: ✓/⚠/✗]

**Analysis:** [Is distribution healthy? Too much emergent = not validating enough. Too much canonical = not growing.]

### Tag Coverage
- **Documents with tags:** [X] ([%])
- **Average tags per doc:** [X.X]
- **Target:** 3-5 tags ✓/✗

**Most used tags (Top 10):**
1. [tag-name] - [X] uses
2. [tag-name] - [X] uses
...

**Underutilized categories:**
- [category] - only [X] uses (consider if needed)

---

## 🔗 Connection Analysis

### Bidirectional Links
- **Total connections:** [X]
- **Bidirectional:** [X] ([%])
- **One-way only:** [X] ([%])

**Example weak connections:**
- positioning/doc1.md → skills/skill1/SKILL.md (one-way)
  - *Suggestion:* Add positioning/doc1.md to skill1's integrates-with

### Hub Documents (Most Connected)
1. [doc-name.md] - [X] connections
2. [doc-name.md] - [X] connections
3. [doc-name.md] - [X] connections

*These are your knowledge hubs. Keep them up to date.*

### Isolated Clusters
[If found] Documents that only connect to each other but not the broader graph:
- Cluster 1: [doc1.md, doc2.md, doc3.md]
  - *Suggestion:* Connect to [broader concept]

---

## 🎯 Recommended Actions

### High Priority
1. **Fix orphaned nodes:** [X] documents need connections
   - [specific suggestions]

2. **Balance lifecycle:** [if imbalanced]
   - Too much emergent: Validate with client work
   - Too little emergent: Need more innovation/discovery

3. **Add missing tags:** [X] documents have <3 tags
   - [specific suggestions]

### Medium Priority
4. **Strengthen weak connections:** [X] one-way links should be bidirectional

5. **Update hub documents:** These are referenced often, ensure they're current:
   - [hub-doc-1.md] - last updated [date]
   - [hub-doc-2.md] - last updated [date]

### Low Priority
6. **Consider wiki-links:** For canonical documents, add [[wiki-links]]

7. **Review taxonomy:** [if issues found] Consider adding/removing tags

---

## 📋 Content Type Breakdown

| Type              | Count | Avg Connections | Orphans | % of Total |
|-------------------|-------|-----------------|---------|------------|
| positioning       | [X]   | [X.X]           | [X]     | [%]        |
| skill             | [X]   | [X.X]           | [X]     | [%]        |
| transcript        | [X]   | [X.X]           | [X]     | [%]        |
| client-feedback   | [X]   | [X.X]           | [X]     | [%]        |
| framework         | [X]   | [X.X]           | [X]     | [%]        |
| lead-magnet       | [X]   | [X.X]           | [X]     | [%]        |
| **TOTAL**         | **[X]** | **[X.X]**     | **[X]** | **100%**   |

---

## 🔍 Deep Dive (--detailed flag)

[Only shown with --detailed flag]

### All Orphaned Nodes
```
1. transcripts/2025-10-29_call.txt
   - Has front matter: ✓
   - Has tags: ✗ (0 tags)
   - integrates-with: ✗ (0 connections)
   - Referenced by: ✗ (0 references)
   - SUGGESTION: Run /ingest to add proper connections

2. content/random-notes.md
   - Has front matter: ✗
   - SUGGESTION: Add front matter or archive
```

### Weak Connections (1-2 links only)
```
1. positioning/old-positioning.md
   - Connections: 1
   - Last updated: 2024-11-15 (30+ days ago)
   - SUGGESTION: Archive or strengthen connections

2. Client Lead Magnets/Draft-Accounts.md
   - Connections: 2
   - Missing lifecycle field
   - SUGGESTION: Complete front matter, validate status
```

### Missing Front Matter
```
1. content/scratchpad.md - No front matter
2. transcripts/old-call.txt - No front matter
3. positioning/draft.md - No front matter

SUGGESTION: Run /ingest on each or archive if not needed
```

---

## 💡 System Growth Indicators

### Knowledge Compounding Rate
**New content reusing existing nodes:** [%]
- Last 5 documents added
- How many referenced existing knowledge?
- **Target:** 80%+ (shows compounding)

### Feedback Loop Speed
**Client feedback → skill update time:**
- Average: [X] days
- **Target:** <7 days

### Reuse Rate
**Skills/frameworks used in multiple engagements:**
- cold-email-outreach: Used in [X] lead magnets
- linkedin-growth-strategy: Used in [X] posts
- refine-positioning: Used in [X] discovery processes
- **Target:** 60%+ reuse

---

## 🎯 Health Score Calculation

**Formula:**
```
Health Score = 
  (Node Count Score * 0.20) +
  (Connection Density * 0.25) +
  (Orphan Score * 0.20) +
  (Lifecycle Balance * 0.15) +
  (Tag Coverage * 0.10) +
  (Bidirectional Links * 0.10)
```

**Your Score Breakdown:**
- Node Count: [X]/20 points
- Connection Density: [X]/25 points
- Orphan Score: [X]/20 points
- Lifecycle Balance: [X]/15 points
- Tag Coverage: [X]/10 points
- Bidirectional Links: [X]/10 points

**Total: [X]/100**

**Rating:**
- 90-100: Excellent - Mature, well-connected system
- 75-89: Good - Solid foundation, minor improvements
- 60-74: Fair - Working but needs attention
- <60: Needs Work - Focus on connections and lifecycle

---

## 🚀 Next Steps

Based on your score:

**If 90-100 (Excellent):**
- Focus on growth (add new content)
- Validate emergent nodes
- Extract more atomic concepts

**If 75-89 (Good):**
- Fix orphaned nodes
- Add bidirectional links
- Balance lifecycle distribution

**If 60-74 (Fair):**
- Run /ingest on documents missing front matter
- Connect isolated clusters
- Update hub documents

**If <60 (Needs Work):**
- Start with /quickstart to review structure
- Add front matter systematically
- Focus on tag coverage first

---

## 📚 Related Commands

- `/ingest` - Add new content with proper metadata
- `/quickstart` - Initial setup/restructure
- Foam: Show Graph - Visual representation

---

## Example Output

```markdown
# 📊 Context OS Health Report

**Generated:** December 16, 2024 8:45 PM
**Total Documents Analyzed:** 42

---

## ✅ Overall Health Score: 78/100

[███████████████░░░░░] Good - Solid foundation

---

## 📈 Key Metrics

### Node Count
- **Total nodes:** 42
- **With front matter:** 35 (83%)
- **Target:** 50+ ✗ (need 8 more)

### Connection Density
- **Average connections per node:** 3.2
- **Well-connected (3+ links):** 24 nodes (69%)
- **Target:** 3+ average ✓

### Orphaned Nodes
- **Orphaned (0 connections):** 4 nodes (11%)
- **Target:** <10% ✗ (just over threshold)

**Orphaned nodes found:**
1. transcripts/2025-11-20_quick-call.txt - No connections, missing insights extraction
2. content/random-research.md - No front matter
3. positioning/draft-old.md - Outdated, consider archiving

### Lifecycle Distribution
- **emergent:** 12 (34%) ⚠ (slightly high)
- **validated:** 16 (46%) ✓
- **canonical:** 7 (20%) ✓

**Analysis:** Slightly too much emergent content. Validate with client work or promote proven concepts.

---

## 🎯 Recommended Actions

### High Priority
1. **Validate 3-4 emergent concepts** with upcoming client work
2. **Add front matter to 7 documents** currently missing it
3. **Connect 4 orphaned nodes** to the broader graph

### Medium Priority
4. **Add 8+ new documents** to reach 50-node target
5. **Strengthen bidirectional links** (currently 64%, target 70%)

**Estimated time to 90+ score:** 2-3 hours of focused work
```

---

**Last Updated:** December 16, 2024  
**Part of:** Jacob Dietle's Context OS framework




