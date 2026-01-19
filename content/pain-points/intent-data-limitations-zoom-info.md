---
title: "Pain Point: Intent Data Limitations (IP-Level False Positives)"
type: pain-point
validated-by: [ivs-tax-services]
use-cases: [discovery, competitive-differentiation, tool-positioning]
lifecycle: hypothesis
validation-count: 1
needs-validations: 2
tags: [intent-data, zoom-info, false-positives, data-quality, roi-concern]
---

# Pain Point: Intent Data Limitations (IP-Level False Positives)

## The Pain Point
Companies invest heavily in intent data tools (ZoomInfo, 6sense, Bombora, etc.) but struggle with false positives, unactionable signals, and poor ROI due to IP-level tracking limitations.

---

## How It Manifests

### IVS Tax Services Example
- **Investment:** Paying $10K+/year for ZoomInfo intent data
- **Setup:** Weekly intent reports every Tuesday (4-5 configured pulls)
- **Intent signals tracked:** Companies searching "property tax," "business personal property tax," "compliance," "property tax services"
- **Scoring:** Based on company type + search terms

**The Core Problem (Direct Quote):**
> "The problem that our current marketer has had with this... it could be anyone in that IP range that's kind of looking for that. So it might not necessarily be the people that we were looking for." — Jeffrey Cohen

**Translation:**
- IP-level data shows company searched, NOT who searched
- Could be intern researching, could be CFO evaluating, could be anyone
- Can't distinguish decision-maker from random employee

**IVS's Current Workaround:**
- Manually filter by persona (C-suite, accounting department) after pulling intent data
- Still getting false positives
- Effort doesn't match ROI

---

## Why This Matters (Buying Psychology)

### Wasted Investment
- **Expensive tool:** $10K+/year is significant for small business
- **Low ROI:** Paying for data that doesn't convert
- **Opportunity cost:** Could invest that budget elsewhere

### False Hope
- **Intent signals look promising:** "This company searched for property tax!"
- **Reality disappoints:** Can't identify who searched, can't act on it
- **Frustration compounds:** Week after week of unusable data

### Time Sink
- **Manual filtering required:** Can't use data as-is
- **Research needed:** Have to figure out who the right person is after getting signal
- **Defeats purpose:** Intent should accelerate outreach, not slow it down

### Questions Tool Value
- **"Are we getting our money's worth?"**
- **"Should we cancel ZoomInfo?"**
- **"Is there a better way to get intent data?"**

---

## What They've Tried (IVS)

### Setup Intent Pulls
1. Manufacturing companies (US) searching property tax terms
2. Larger companies searching same terms
3. Industrial companies searching property tax services
4. Fortune 500 companies searching property tax services

**Result:** Getting intent signals, but can't act on them effectively

### Manual Filtering
- Filter by C-suite personas
- Filter by accounting department roles
- **Result:** Still false positives (IP-level data issue persists)

### Weekly Review
- Tuesday morning email updates
- Review intent reports
- **Result:** Time-consuming, low conversion

### CSV Exports
- Have 5,000 export credits
- Can dump contact data
- **Result:** Helps with volume, doesn't solve false positive problem

---

## Buying Trigger Formula

```
Expensive tool
+ Low ROI
+ Frustration with data quality
+ Questioning value
= Openness to alternative approach
```

---

## How Scott Addressed It (IVS Engagement)

### Discovery Call (10/29)
1. **Acknowledged limitation:** "Yeah, IP-level data can't tell you WHO searched - that's a known issue"
2. **Validated frustration:** "You're not alone - I've seen this with other ZoomInfo users"
3. **Didn't bash tool:** "ZoomInfo is valuable, but it's ONE source, not the ONLY source"

### Proposal Presentation (11/3)
1. **Offered alternative signals:** Job change intent (new CFO/tax manager = real, person-specific signal)
2. **Positioned Clay:** Multiple intent sources aggregated, scored, filtered systematically
3. **First-party signals:** 10K filings, website visitors (if properly tracked)

### Kickoff Meeting (11/11)
1. **Deep dive into ZoomInfo:** "Let me see what you're getting" (Jeffrey shared screen)
2. **Identified workarounds:** CSV export → Clay import (if no API access)
3. **Positioned as ONE input:** "We'll use ZoomInfo intent + job changes + 10Ks + website visitors"
4. **Systematic scoring:** ICP fit + multiple intent signals = prioritized list

**Key Positioning:**
- Not replacing ZoomInfo (de-risks change)
- Augmenting it with better signals (job changes, 10Ks)
- Systematic approach to scoring/filtering (Clay orchestrates all sources)

---

## Discovery Questions That Surface This Pain

1. **"Are you using any intent data tools right now?"**
   - Listen for: ZoomInfo, 6sense, Bombora, etc.

2. **"How's that working for you? What's the ROI like?"**
   - Listen for: Frustration, low conversion, questioning value

3. **"What's the biggest challenge with [intent tool]?"**
   - Listen for: False positives, can't identify decision-maker, data quality

4. **"How much time do you spend filtering/researching after getting an intent signal?"**
   - Listen for: Manual work, time sink, defeats purpose

5. **"Have you thought about canceling it, or are you locked in?"**
   - Listen for: Contract commitment, sunk cost, openness to alternatives

---

## Competitive Differentiation

### What Most Agencies Do
- **Also use ZoomInfo:** No differentiation
- **Also face same problem:** IP-level limitations affect everyone
- **No alternative:** Just push volume, hope for best

### What Scott Offers
1. **Multiple intent sources:** Not just ZoomInfo
   - Job changes (LinkedIn, Clay)
   - 10K filings (SEC, public companies)
   - Website visitors (first-party, if tracked)
   - ZoomInfo (as ONE input, not only input)

2. **Person-specific signals:** Job changes = know WHO is new, not just IP-level company data

3. **Systematic orchestration:** Clay aggregates all sources, scores based on ICP fit + intent strength

4. **Actionable personalization:** "Congrats on new CFO role at [Company]" = relevant, timely, person-specific

**Result:** Better targeting, higher reply rates, less waste

---

## Pattern Status

**Validation Count:** 1 client (IVS Tax Services - ZoomInfo user)

**Status:** Hypothesis (need 2 more validations to promote to pattern)

**Next Validations:**
- [ ] Client 2: Are they also using expensive intent tool with low ROI?
- [ ] Client 3: Do they also struggle with false positives/data quality?
- [ ] If YES to both → Promote to **Pattern: "Expensive tool, low ROI"**

**Potential Generalization:**
- Not just intent data tools (ZoomInfo, 6sense, Bombora)
- Could be CRM (Salesforce, HubSpot), marketing automation (Marketo, Pardot)
- **Broader pattern:** "Invested in expensive enterprise tool, not getting ROI, questioning value"

---

## When to Reference This Pain Point

### In Future Client Conversations
- **If prospect mentions:** Using ZoomInfo, 6sense, Bombora, or similar
- **If prospect mentions:** "We're not getting ROI from our tools"
- **If prospect mentions:** "Intent data isn't converting"

### In Content/Marketing
- **LinkedIn post idea:** "Why IP-level intent data fails (and what to use instead)"
- **Blog post:** "The ZoomInfo false positive problem: How to supplement with person-specific signals"
- **Email subject line:** "Re: Getting better ROI from your intent data"

### In Sales Enablement
- **Qualification:** Using expensive tool + low ROI = budget exists + urgency
- **Competitive positioning:** "We don't replace your tools, we make them more effective"
- **Objection prep:** "Won't this add more tools?" → "Yes, but we orchestrate them systematically, not add complexity"

---

## Technical Solution (Clay-Based)

### How Scott's Approach Works

**Intent Sources:**
1. **ZoomInfo intent** (company-level, IP-based)
2. **Job changes** (person-specific, LinkedIn/Clay)
3. **10K filings** (public companies, financial disclosures)
4. **Website visitors** (first-party, company-specific)

**Clay Orchestration:**
```
Input: ZoomInfo intent (Company X searched "property tax")
↓
Enrich: Find decision-makers at Company X (CFO, tax manager, controller)
↓
Layer: Check for recent job changes (new CFO? new tax manager?)
↓
Score: ICP fit (industrial? right size? right geography?)
↓
Priority: ZoomInfo intent + new CFO = high score → prioritize
↓
Personalize: "Congrats on new role at [Company]. Noticed you're in [industry]. We helped [similar company] save $X on property tax."
↓
Output: Actionable, personalized, high-intent lead
```

**Result:** ZoomInfo data becomes USEFUL (not just false positives)

---

## Related Context
- [[content/insights/2025-11-11_11-00_ivs-kickoff-meeting_insights]] - Deep dive into ZoomInfo limitations
- [[content/pain-points/stagnant-growth-post-covid]] - Amplifies this pain (expensive tool not delivering growth)
- [[content/pain-points/marketer-ineffectiveness-spray-and-pray]] - Marketer can't use ZoomInfo data effectively
- [[positioning/service-differentiation-intent-sources]] - How Scott differentiates with multiple intent sources
