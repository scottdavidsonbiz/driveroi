---
title: "SPICED Scoring Matrix: Legacy B2B Professional Services"
date: 2025-12-26
type: framework
status: active
tags: [spiced, scoring, legacy-b2b, professional-services, account-identification]
---

# SPICED Scoring Matrix: Legacy B2B Professional Services

**Target Segment:** Owner-operated B2B professional services (tax, accounting, legal, consulting)
**Scoring Scale:** 30 points maximum
**Purpose:** Prioritize outreach based on fit and intent signals

---

## Scoring Matrix (30 Points)

| Criteria | 5 Points | 3 Points | 1 Point | Data Source |
|----------|----------|----------|---------|-------------|
| **Headcount** | 50-150 employees | 20-49 or 151-200 | <20 or >200 | LinkedIn (Clay) |
| **Bootstrap Status** | Bootstrapped/No funding | <$5M raised | >$5M raised | Crunchbase |
| **Founder Still Active** | Founder is CEO | Founder on board | Professional CEO | LinkedIn People Search |
| **Modern Tech Stack** | Has basic CRM (HubSpot/Salesforce) | Has email tools only | No marketing stack | BuiltWith |
| **Growth Signals** | Hiring, 10%+ headcount growth | Stable headcount | Shrinking headcount | LinkedIn Jobs API |
| **Industry Fit** | Tax/Accounting/Corporate Law | Management Consulting | IT Services | LinkedIn Industry |

---

## Prioritization Tiers

**🔥 TIER 1 (20-30 points):** Reach out immediately, high personalization
- Perfect fit profile
- Multiple buying signals present
- Likely to close in 2-3 weeks

**🟡 TIER 2 (15-19 points):** Reach out with education content
- Good fit, fewer intent signals
- May need more nurturing
- Likely to close in 4-8 weeks

**❌ TIER 3 (<15 points):** Remove from active outreach
- Poor fit or no buying signals
- Save for future nurture campaigns

---

## Clay Enrichment Waterfall

Use this sequence to build your scoring table in Clay:

| Column | Data Source | Purpose |
|--------|-------------|---------|
| 1. Company LinkedIn URL | DiscoLike or Sales Navigator | Starting point |
| 2. Employee Count | LinkedIn (via Clay) | Headcount scoring |
| 3. Website | LinkedIn Company Page | Get domain |
| 4. Industry | LinkedIn | Industry fit scoring |
| 5. Founder/CEO Name | LinkedIn People Search (Title: "Founder" OR "CEO") | Decision maker + founder status |
| 6. Founder LinkedIn Profile | LinkedIn | For outreach personalization |
| 7. Technologies Used | BuiltWith | Tech stack scoring |
| 8. Revenue Estimate | Clay/Crunchbase | Validate $5M-$50M range |
| 9. Funding Status | Crunchbase | Bootstrap scoring |
| 10. Recent Job Postings | LinkedIn Jobs API | Growth signal scoring |
| 11. Headcount Growth (6mo) | LinkedIn | Growth signal scoring |
| 12. **SCORE** | Formula column | Sum of criteria (max 30) |
| 13. **TIER** | Formula column | IF score ≥20 → "Tier 1", IF ≥15 → "Tier 2", ELSE "Remove" |

---

## Why These Criteria Matter

### **Headcount (Sweet Spot: 50-150)**
- **Too small (<20):** Likely no budget, founder doing everything
- **Sweet spot (50-150):** Has revenue, feels pain of manual processes, can afford $10K-$13.5K/month
- **Too large (>200):** Likely already has marketing team or works with agencies

### **Bootstrap Status**
- **Bootstrapped = owner economics:** Founder keeps profits, more likely to invest in growth
- **VC-backed:** Optimizing for growth at all costs (different mentality)
- **PE-backed:** Usually already has operations support from PE firm

### **Founder Still Active**
- **Founder as CEO:** Single decision maker, moves fast, cares about legacy/growth
- **Founder on board:** Can influence, but not sole decision maker
- **Professional CEO:** Hired gun, more risk-averse, slower decisions

### **Modern Tech Stack**
- **Has CRM:** Understands value of systems, not starting from zero
- **Email tools only:** Knows they need more, ready to upgrade
- **No stack:** Too much education needed, longer sales cycle

### **Growth Signals**
- **Hiring sales roles:** Moving from referrals to outbound (PERFECT timing)
- **Stable:** May be open to growth conversation
- **Shrinking:** Either struggling or winding down (avoid)

### **Industry Fit**
- **Tax/Accounting/Corp Law:** IVS peer set, easy to reference case study
- **Management Consulting:** Similar buyer, good fit
- **IT Services:** More competitive, harder to differentiate

---

## Example: Scoring a Real Company

**Company:** ABC Tax Advisors (fictional example)

| Criteria | Finding | Points |
|----------|---------|--------|
| Headcount | 85 employees | 5 |
| Bootstrap Status | Bootstrapped, no funding | 5 |
| Founder Active | Jane Smith, Founder & CEO | 5 |
| Tech Stack | HubSpot CRM + Mailchimp | 5 |
| Growth Signals | Posted "SDR" job 30 days ago | 5 |
| Industry | Tax Advisory | 5 |
| **TOTAL** | | **30** |

**Result:** 🔥 TIER 1 - Reach out immediately with IVS case study

---

## Outreach Personalization Based on Score

### **Tier 1 (20-30 points): High Personalization**

```
Hi [Founder Name],

Noticed [Company] is growing—saw you recently posted for [sales role].
Congratulations on the expansion.

Quick question: How much of your revenue still comes from referrals vs.
outbound? Most tax/accounting firms we talk to are 70-80% referral-dependent.

We're helping owner-operated firms like IVS Tax build predictable outbound
engines—went from 0 to 30+ qualified meetings/month in 90 days.

Worth a 15-min conversation to share what's working in your industry?

Best,
Scott
```

### **Tier 2 (15-19 points): Medium Personalization**

```
Hi [Founder Name],

Following [Company]'s work in [tax/accounting/legal]. Most firms in your
space are 70%+ dependent on referrals—works great until a key relationship
retires or market shifts.

We're helping B2B professional services firms modernize demand gen. Our
client IVS Tax went from pure referrals to 30+ outbound meetings/month.

Open to a brief call to share what we're seeing work?

Best,
Scott
```

---

## Filter Logic (Before Scoring)

**Pre-filters to apply before scoring:**

✅ **Include:**
- B2B professional services only
- 20-200 employees
- $5M-$50M revenue (estimated)
- United States-based
- Industries: Tax, Accounting, Corporate Law, M&A Advisory, Management Consulting, Fractional Executive Services

❌ **Exclude:**
- Executive recruiting/staffing
- Consumer-facing services (personal injury law, individual tax prep)
- Companies with >$5M VC funding
- Companies with <20 employees or >200 employees
- Non-US companies

---

## Target List Size Recommendations

**For Q1 2026 Pilot:**
- **Total universe:** 200-300 companies (after pre-filters)
- **Tier 1 targets:** 40-60 companies (top priority)
- **Tier 2 targets:** 60-80 companies (secondary outreach)
- **Remove rest:** Save for future nurture

**Outreach Velocity:**
- Week 1: Reach out to 20 Tier 1 companies
- Week 2: Follow up Tier 1 + start Tier 2
- Week 3-4: Continue cadence, book discovery calls

**Goal:** 5-7 discovery calls → 2-3 closed pilots by end of January

---

## Clay Formula Examples

### **Score Calculation (Formula Column):**
```
{Headcount Score} + {Bootstrap Score} + {Founder Score} +
{Tech Stack Score} + {Growth Score} + {Industry Score}
```

### **Tier Assignment (Formula Column):**
```
IF({Score} >= 20, "🔥 Tier 1",
  IF({Score} >= 15, "🟡 Tier 2",
    "❌ Remove"))
```

### **Headcount Score (Formula Column):**
```
IF(AND({Employee Count} >= 50, {Employee Count} <= 150), 5,
  IF(OR(AND({Employee Count} >= 20, {Employee Count} < 50),
        AND({Employee Count} > 150, {Employee Count} <= 200)), 3, 1))
```

---

**Last Updated:** December 26, 2025
**Next Review:** February 2026 (after Q1 pilot results)
**Related Files:**
- [[content/frameworks/spiced-outbound-methodology]] - Full SPICED framework
- [[positioning/BLENDED-STRATEGY-SUMMARY]] - Overall strategy
- [[positioning/scott-brenda-partnership-notes-2025-12-19-BLENDED]] - Service models and pricing
