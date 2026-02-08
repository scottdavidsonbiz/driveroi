# IVS Company Acquisition Trigger Campaign

**Target:** Companies that recently completed M&A/acquisition activity
**Trigger Source:** BusinessWire RSS feed, PitchBook, LinkedIn alerts
**Channels:** HeyReach (LinkedIn) → Instantly (Email)
**ICP:** VP Tax, Tax Director, CFO, Controller at acquiring companies with significant industrial assets
**Offer:** Free review of property tax exposure post-acquisition

---

## Campaign Flow

```
Trigger: Company acquisition announced
Day 1: LinkedIn Connection Request (HeyReach)
Day 3: LinkedIn DM #1 (if connected)
Day 5: Email #1 (Instantly)
Day 8: Email #2
Day 14: Email #3 (Breakup)
```

---

## Trigger Variables

**Required:**
- `{{first_name}}` — First name
- `{{company}}` — Acquiring company name
- `{{acquisition_target}}` — Name of acquired company
- `{{transaction_type}}` — "acquisition", "merger", "purchase"

**Optional:**
- `{{deal_value}}` — Transaction value if public
- `{{acquisition_date}}` — When deal closed
- `{{industry}}` — Industry of acquired company

---

## HeyReach (LinkedIn)

### Connection Request

**Option A: No note** (highest accept rate)

**Option B: Short note**
```
Hey {{first_name}} — saw the news about {{acquisition_target}}. Congrats on the deal. Would love to connect.
```

---

### LinkedIn DM #1 (Day 3)

**Version A: Property Tax Angle**
```
Hey {{first_name}} — congrats on the {{acquisition_target}} {{transaction_type}}.

Quick question: do you know what property tax exposure is coming with that deal?

Most acquirers inherit inflated equipment valuations — assessors don't reset values just because ownership changed.

We help companies get a clear picture of property tax liability post-acquisition. Happy to do a quick review if it would help.
```

**Version B: Due Diligence Angle**
```
Hey {{first_name}} — congrats on the {{acquisition_target}} {{transaction_type}}.

One thing that often gets missed in M&A due diligence: property tax exposure.

Equipment and facilities often carry inflated assessments from the previous owner. We've helped acquirers find 30-50% reductions post-close.

Worth a conversation if that's on your radar?
```

---

## Instantly (Email)

### Email #1: Congrats + Problem (Day 5)

**Subject lines (A/B test):**
- Congrats on the {{acquisition_target}} deal
- Quick question about {{acquisition_target}}
- Property tax after the {{acquisition_target}} acquisition

**Version A: Free Review Offer**
```
Hi {{first_name}},

Congrats on the {{acquisition_target}} {{transaction_type}}.

One thing that often gets overlooked in acquisitions: property tax exposure.

Equipment and facilities usually come with inflated assessments — assessors don't adjust values just because ownership changed. And most acquirers don't realize they're inheriting overstated liabilities until the first tax bill shows up.

We specialize in property tax for industrial companies. Happy to do a free review of the acquired assets to see if there's money left on the table.

Worth a look?

—[Name]
IVS (Industrial Valuation Services)
```

**Version B: Call CTA**
```
Hi {{first_name}},

Congrats on the {{acquisition_target}} {{transaction_type}}.

One thing that often gets overlooked in acquisitions: property tax exposure.

Equipment and facilities usually come with inflated assessments — assessors don't adjust values just because ownership changed. And most acquirers don't realize they're inheriting overstated liabilities until the first tax bill shows up.

We specialize in property tax for industrial companies. If property tax wasn't part of your due diligence, it might be worth a quick conversation now.

Worth 15 minutes?

—[Name]
IVS (Industrial Valuation Services)
```

---

### Email #2: Case Study (Day 8)

**Subject:** Re: Congrats on the {{acquisition_target}} deal

**Version A: Free Review Offer**
```
Hi {{first_name}},

Following up on my note about the {{acquisition_target}} {{transaction_type}}.

Quick example of what we've seen:

A company acquired a manufacturing facility and inherited equipment assessed at $4M. After we reviewed the assessments:

→ Showed assessors that older equipment was fully depreciated
→ Documented equipment that was idle or awaiting disposal
→ Adjusted for market conditions the previous owner never contested

Result: Assessment reduced to $2.1M. $75K+ in annual tax savings.

If {{company}} inherited industrial assets in this deal, there's a good chance the valuations are inflated.

Happy to do a free review if you want to see what's there.

—[Name]
IVS
```

**Version B: Call CTA**
```
Hi {{first_name}},

Following up on my note about the {{acquisition_target}} {{transaction_type}}.

Quick example of what we've seen:

A company acquired a manufacturing facility and inherited equipment assessed at $4M. After we reviewed the assessments:

→ Showed assessors that older equipment was fully depreciated
→ Documented equipment that was idle or awaiting disposal
→ Adjusted for market conditions the previous owner never contested

Result: Assessment reduced to $2.1M. $75K+ in annual tax savings.

If {{company}} inherited industrial assets in this deal, there's a good chance the valuations are inflated.

Worth a quick call?

—[Name]
IVS
```

---

### Email #3: Breakup (Day 14)

**Subject:** Should I close your file?

```
Hi {{first_name}},

I've reached out a couple times about property tax on the {{acquisition_target}} deal.

Haven't heard back, which usually means one of three things:

1. Property tax wasn't part of this acquisition (fair enough)
2. You've already got someone reviewing it (great)
3. My emails got buried (less great)

Either way, I'll stop filling your inbox.

If property tax ever becomes a focus — especially after acquiring facilities or equipment — we're easy to find. We've helped acquirers reduce inherited valuations by 30-50%.

Good luck with the integration.

—[Name]
IVS
```

---

## Key Messaging Points

### Pain Points (Acquisition-specific)
- Property tax exposure often missed in due diligence
- Assessors don't reset values when ownership changes
- Previous owner may not have contested inflated assessments
- First tax bill post-close is often a surprise
- Multiple facilities = compounding exposure

### Value Proposition
- We review property tax exposure post-acquisition
- We know what to look for (idle equipment, obsolescence, overstated values)
- We've done this for other acquirers
- Typical results: 30-50% reduction in inherited valuations

### Proof Points

**Case Study: Manufacturing Acquisition**
- Challenge: Acquired facility with equipment assessed at $4M
- What IVS did: Reviewed assessments, documented depreciation, idle equipment, and market conditions previous owner never contested
- Result: Assessment reduced to $2.1M. $75K+ in annual tax savings.

---

## Tone Guidelines

| Aspect | Approach |
|--------|----------|
| Voice | Congratulatory opener, then direct and helpful |
| Length | Short (under 100 words for first touch) |
| Timing | Strike while deal is fresh (within 30 days of announcement) |
| CTA | Free review offer (primary) or soft call ask (variant) |
| Angle | "One thing that gets overlooked" — helpful, not salesy |

---

## Suppression List

Before launching, confirm:
- [ ] Existing IVS clients removed
- [ ] Active conversations removed
- [ ] Companies IVS is already targeting

---

## Metrics to Track

| Channel | Metric | Target |
|---------|--------|--------|
| LinkedIn | Connection acceptance | 35%+ |
| LinkedIn | DM reply rate | 10-15% |
| Email | Open rate | 55%+ |
| Email | Reply rate | 8-12% |
| Overall | Meetings booked | 2-4/month |

---

## Trigger Sources

1. **BusinessWire RSS Feed** (already configured)
   - Filter for: M&A announcements, acquisitions, mergers

2. **LinkedIn Sales Navigator**
   - Company news alerts for "acquired" or "acquisition"

3. **PitchBook / Crunchbase** (if available)
   - Closed deals in target industries

4. **Clay Table**
   - Build trigger table that monitors for acquisition announcements
   - Auto-enrich with contact info for tax/finance leadership

---

**Last Updated:** February 4, 2026
