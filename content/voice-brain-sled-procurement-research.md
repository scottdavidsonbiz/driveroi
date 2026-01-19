---
title: "Voice Brain: SLED Procurement Database Research"
date: 2024-12-09
type: framework
category: [govcon, research]
use-cases: [rfp-monitoring, procurement-intelligence, federal-sales]
personas: [vp-gtm, coo]
client: voice-brain
lifecycle: canonical
canonical-since: 2024-12-09
validated-by: [sam-gov, publicpurchase-com]
integrates-with:
  - content/voice-brain-pvp-sled-opportunities.md
  - content/voice-brain-email-draft.md
  - transcripts/2025-11-24_10-30_voice-brain-and-drive-roi-intro_transcript.txt
tags: [framework, govcon, sled, procurement-databases, rfp-monitoring, sam-gov]
---

# Voice Brain: SLED Government Radio Procurement Research
**Created:** 2024-12-09  
**Purpose:** Find public databases/RSS feeds for SLED governments procuring radio equipment

## Target Profile
- **Who:** State, Local, Education (SLED) governments
- **What:** Procuring new radio equipment
- **For:** Police, Fire, EMS, emergency services
- **Voice Brain's value:** AI transcription/alerting for radio communications

---

## Public Procurement Databases (Free & Paid)

### 1. SAM.gov (System for Award Management) ⭐⭐⭐⭐⭐
**Type:** Federal database (but includes some state/local contracts)
**URL:** https://sam.gov/
**Cost:** FREE
**Coverage:** Federal contracts, some state/local

**How to use:**
- Search contract opportunities
- Keywords: "radio equipment", "public safety communications", "P25 radio", "two-way radio"
- Filter by: NAICS codes (334220 - Radio and TV Broadcasting and Wireless Communications Equipment)
- Set up email alerts for new opportunities

**RSS/API:**
- Yes, SAM.gov has an API (free but requires registration)
- Can set up automated alerts

**Value for Voice Brain:**
- Federal contracts often cascade to state/local (federal grant programs)
- Shows which agencies are modernizing communications

---

### 2. PublicPurchase.com ⭐⭐⭐⭐⭐
**Type:** Aggregator of government RFPs/bids
**URL:** https://www.publicpurchase.com/
**Cost:** Free basic access, paid for full features (~$500-1000/year)

**Coverage:**
- State procurement portals
- County and city RFPs
- School district procurement

**How to use:**
- Search by keyword: "radio", "communications equipment", "public safety"
- Filter by: State, contract value, bid due date
- Set up email alerts

**RSS/API:**
- Email alerts available
- No public RSS feed, but has alert system

**Value for Voice Brain:**
- Aggregates 1000s of state/local procurement portals
- Shows active RFPs (not just awarded contracts)

---

### 3. State Procurement Portals (Individual States) ⭐⭐⭐⭐⭐
**Type:** Official state government procurement sites
**Cost:** FREE
**Coverage:** State-level contracts

**Major state portals:**
- **California:** Cal eProcure (https://www.caleprocure.ca.gov/)
- **Texas:** ESBD (https://www.txsmartbuy.com/)
- **Florida:** MyFloridaMarketPlace (https://www.myfloridamarketplace.com/)
- **New York:** NY State Contract Reporter
- **Pennsylvania:** PA Supplier Portal
- **Illinois:** BidBuy (https://www.purchase.uic.edu/bidbuy)

**How to use:**
- Each state has its own portal
- Search: "radio equipment", "communications", "public safety"
- Many have RSS feeds or email alert options

**RSS/API:**
- Varies by state
- Most have email alerts
- Some have RSS feeds (check individual sites)

**Value for Voice Brain:**
- Most authoritative source for state contracts
- Often includes county/city contracts on state cooperative purchasing agreements

---

### 4. BidNet / Onvia (Now Deltek) ⭐⭐⭐⭐
**Type:** Commercial bid aggregator
**URL:** https://www.bidnet.com/
**Cost:** Paid subscription (~$100-300/month)

**Coverage:**
- 90,000+ government agencies
- Federal, state, local, education

**How to use:**
- Keyword search and saved searches
- Daily email alerts
- Advanced filtering by agency type, location, contract value

**RSS/API:**
- Email alerts (very robust)
- API available for enterprise customers

**Value for Voice Brain:**
- Most comprehensive commercial aggregator
- Worth the cost if serious about SLED market

---

### 5. GovSpend ⭐⭐⭐⭐
**Type:** Government spending intelligence platform
**URL:** https://www.govspend.com/
**Cost:** Paid (~$200-400/month)

**Coverage:**
- Historical spending data
- Contract awards (not just opportunities)
- 150,000+ agencies

**How to use:**
- See which agencies have purchased radio equipment recently
- Track spending patterns
- Identify agencies due for refresh cycles (equipment typically 5-10 year lifespan)

**RSS/API:**
- Email alerts
- Data export capabilities

**Value for Voice Brain:**
- **BEST FOR TIMING:** Can identify agencies that purchased radios 5-8 years ago (due for replacement)
- Shows actual spending, not just RFPs

---

### 6. FedBizOpps Successor (now on SAM.gov) ⭐⭐⭐⭐
**Type:** Federal business opportunities
**URL:** https://sam.gov/content/opportunities (replaces FBO.gov)
**Cost:** FREE

**How to use:**
- Filter by NAICS: 334220, 517410
- Keywords: "radio", "P25", "LMR" (Land Mobile Radio), "emergency communications"
- Set up saved searches with email alerts

---

### 7. DemandStar ⭐⭐⭐
**Type:** Bid aggregator
**URL:** https://www.demandstar.com/
**Cost:** Free trial, then ~$50-100/month

**Coverage:**
- State and local government bids
- Education sector

---

### 8. Individual County/City Procurement Sites ⭐⭐⭐
**Type:** Local government websites
**Cost:** FREE
**Examples:**
- LAPD procurement
- NYPD procurement
- Chicago FD procurement
- Houston EMS procurement

**How to use:**
- Target major metro areas first (largest budgets)
- Most have "Bids & RFPs" section on official sites
- Set up browser bookmarks, check monthly

**RSS/API:**
- Some have RSS feeds (rare)
- Most require manual checking

**Value for Voice Brain:**
- Most direct source for local contracts
- Can build relationships with specific departments

---

## Specific Search Keywords for Radio Equipment

### Primary Keywords:
- "Public safety radio"
- "P25 radio system"
- "Two-way radio equipment"
- "Land Mobile Radio (LMR)"
- "Emergency communications system"
- "Radio infrastructure"
- "Digital radio"
- "Trunked radio system"

### Secondary Keywords:
- "Dispatch communications"
- "Interoperable communications"
- "FirstNet" (AT&T's public safety network)
- "Mission critical communications"
- "APCO P25" (Association of Public Communications Officials standard)

### NAICS Codes to Monitor:
- **334220** - Radio and Television Broadcasting and Wireless Communications Equipment Manufacturing
- **517410** - Satellite Telecommunications
- **517911** - Telecommunications Resellers

### Agency Types to Target:
- Police departments
- Fire departments
- Sheriff's offices
- EMS/Ambulance services
- Emergency management agencies
- 911/Dispatch centers
- County emergency services
- State patrol/highway patrol

---

## RSS Feed Options

### Federal:
- SAM.gov has RSS capabilities (set up custom search, then subscribe to RSS)
- URL format: https://sam.gov/api/prod/opps/v3/opportunities?...

### State-specific (examples):
- **Texas:** https://www.txsmartbuy.com/esbd has RSS
- **California:** Cal eProcure has email alerts
- **Many states:** Check procurement portal for "RSS" or "Alerts" link

### Aggregators:
- PublicPurchase.com - Email alerts (no public RSS)
- BidNet - Email alerts
- DemandStar - Email alerts

### Workaround for sites without RSS:
- Use **Visualping.io** or **ChangeDetection.io** to monitor specific pages
- Set up alerts when procurement pages change

---

## Recommended Setup for Voice Brain

### Phase 1: Free Sources (This Week)
1. **SAM.gov**
   - Create free account
   - Set up saved search: "public safety radio" OR "P25" OR "emergency communications"
   - Enable email alerts

2. **PublicPurchase.com**
   - Free account
   - Set up alerts for: "radio equipment" + "police" OR "fire" OR "EMS"

3. **Top 10 State Portals**
   - California, Texas, Florida, New York, Pennsylvania, Illinois, Ohio, Georgia, North Carolina, Michigan
   - Bookmark procurement pages
   - Check monthly for radio/communications RFPs

4. **Visualping.io** (Free tier: 65 checks/month)
   - Monitor key county/city procurement pages
   - Example: LAPD, NYPD, Chicago Fire, Houston EMS bid pages

**Time investment:** 2-3 hours setup, 30 mins/week monitoring

---

### Phase 2: Paid Tools (If Phase 1 Validates Opportunity)
1. **BidNet** ($100-300/mo)
   - Most comprehensive aggregator
   - Worth it if SLED is primary market

2. **GovSpend** ($200-400/mo)
   - BEST for identifying agencies with aging equipment
   - Find agencies that bought radios 5-8 years ago (due for replacement)

**Expected ROI:** If one SLED contract is worth $50K-500K, these tools pay for themselves with 1 win.

---

## Clay Workflow for Automation

### Workflow 1: SAM.gov Monitor
1. **Input:** SAM.gov API (daily scrape)
2. **Filter:** Keywords: "radio", "P25", "public safety communications"
3. **Enrich:**
   - Agency contact info
   - Decision-maker research (LinkedIn for IT Director, Police Chief, etc.)
4. **Output:** Slack alert with contract details + decision-maker LinkedIn profile

### Workflow 2: State Portal Aggregation
1. **Input:** Web scraper for top 10 state procurement sites (weekly)
2. **Filter:** "radio", "communications equipment"
3. **Enrich:** Agency budget data, recent spending
4. **Output:** Weekly email digest with opportunities

### Workflow 3: Aging Equipment Tracker (if GovSpend available)
1. **Input:** GovSpend historical data
2. **Filter:** Agencies that purchased radio equipment 5-8 years ago
3. **Enrich:** Agency contact, budget cycle
4. **Output:** Quarterly prospect list of agencies due for refresh

---

## Permissionless Value Prop for Voice Brain

**Concept:** Deliver value BEFORE asking for a meeting. Show you understand their business deeply.

**Permissionless Value Deliverable:**
"I spent 2 hours researching upcoming radio equipment procurements in your target SLED market. Here are 15 active RFPs for public safety radio systems from agencies that would be perfect fits for Voice Brain's AI transcription platform. Each includes the agency contact, bid due date, and procurement portal link. No strings attached—thought this might be helpful as you scale into the SLED market."

**Attach:** Excel/CSV with:
- Agency name
- Location
- Contract title
- Bid due date
- Estimated contract value
- Procurement portal link
- Decision-maker (if found)

**Why this works:**
- Shows you understand Voice Brain's ICP (SLED agencies buying radios)
- Demonstrates research capability (you could do this ongoing)
- Provides immediate actionable value (these are real leads)
- No ask, just giving
- Positions you as expert in their market

---

## Quick Win: 15 Active RFPs for Voice Brain (Research Now)

I can help you compile this list right now if you want. We'd:
1. Search SAM.gov for active "radio equipment" RFPs
2. Check PublicPurchase.com for state/local opportunities
3. Scan top 5 state portals for current RFPs
4. Compile into clean spreadsheet
5. Enrich with agency contact info where possible

**Time to execute:** 1-2 hours
**Deliverable:** Spreadsheet of 10-20 active SLED radio procurement opportunities

Would you like me to help you research and compile this now?

---

## Key Takeaway

**YES, there are excellent public databases for SLED radio procurement.** The best free sources are:
1. SAM.gov (federal + some state/local)
2. State procurement portals (each state's official site)
3. PublicPurchase.com (aggregator with free tier)

**For RSS/automation:**
- SAM.gov has API/RSS capabilities
- Most state portals have email alerts
- Use Visualping.io for sites without RSS
- Clay can automate monitoring across multiple sources

**The permissionless value play:**
Spend 2 hours compiling active SLED radio RFPs, package it beautifully, and send it to Keegan with no ask. This demonstrates expertise and creates reciprocity without being salesy.
