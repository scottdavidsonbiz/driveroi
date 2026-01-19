---
title: "SPICED Outbound Methodology for PE/VC and International Companies"
type: framework
validated-by: [q126-business-plan]
use-cases: [lead-generation, outbound-prospecting, account-prioritization]
lifecycle: active
tags: [spiced, outbound, clay-workflows, intent-signals, scoring]
created: 2025-12-19
---

# SPICED Outbound Methodology

**Purpose:** Research-driven outbound prospecting using SPICED framework to prioritize high-intent accounts

**Model:** Research → Target → Personalize → Reach Out

---

## The SPICED Framework

In outbound prospecting, you research SPICED elements **BEFORE** reaching out to:

1. **Build target lists** with high-intent prospects
2. **Personalize messaging** based on specific pain/impact
3. **Prioritize accounts** by urgency and fit

**SPICED Stands For:**
- **S** = Situation
- **P** = Pain
- **I** = Impact
- **C** = Critical Event
- **E** = (omitted in this framework)
- **D** = Decision

---

## Market 1: PE/VC Firms - SPICED Research

### S - SITUATION (Research Sources)

**What to Research:**
- Portfolio size and composition
- Recent acquisitions (last 90 days)
- Operating model (has Operating Partner?)
- Portfolio company characteristics
- Geographic footprint

**Where to Find in Clay:**

**Data Sources:**
- Pitchbook: Portfolio company count, deal history, AUM
- Crunchbase: Recent acquisitions, funding rounds
- LinkedIn: Operating Partner title, job postings
- Claygent: Scrape "Portfolio" page for company list
- Company website: "Team" page for Operating Partners

**Clay Workflow:**
1. Import PE firm list (Pitchbook/Crunchbase)
2. Filter: 5-20 portfolio companies, $100M-$2B AUM
3. Enrich: Operating Partner names from LinkedIn
4. Claygent: Scrape portfolio page, count companies
5. Tag: "Has Operating Partner" = Yes/No

**Personalization Triggers:**
- Recently closed acquisition → "Congrats on the [Company] acquisition"
- New Operating Partner hired → "Saw you recently joined as Operating Partner"
- Portfolio grew rapidly → "Noticed your portfolio expanded from 8 to 14 companies in 18 months"

---

### P - PAIN (Research Sources)

**What to Research:**
- Portfolio companies using different tech stacks
- Portfolio companies with sales/marketing job openings
- Lack of standardization across portfolio
- Portfolio company challenges (layoffs, missed targets)

**Where to Find in Clay:**

**Data Sources:**
- BuiltWith/HG Insights: Tech stack per portfolio company
- LinkedIn Jobs: Count sales/marketing openings per portco
- Layoffs.fyi: Recent portfolio company layoffs
- Crunchbase: Funding down-rounds, negative news
- Claygent: Scrape portfolio company LinkedIn for "challenges"

**Clay Workflow:**
1. For each portfolio company:
   - Check CRM (Salesforce vs HubSpot vs none)
   - Count open sales/marketing roles
   - Check for recent layoffs
2. Aggregate: "8 portcos using 5 different CRMs"
3. Tag pain level: High/Medium/Low

**Personalization Triggers:**
- Tech stack chaos → "Noticed your portfolio uses 6 different CRMs - standardization opportunity?"
- Multiple portcos hiring → "[Portco A], [Portco B], and [Portco C] all hiring sales roles - growth mode or replacement?"
- Recent layoffs → "[Portco] recently had layoffs - helping them stabilize RevOps?"

---

### I - IMPACT (Research Sources)

**What to Research:**
- Fund deployment timeline
- Portfolio company growth targets
- Recent exits (success or struggle)
- Board meeting frequency
- LP reporting requirements

**Where to Find in Clay:**

**Data Sources:**
- Pitchbook: Fund vintage, deployment timeline
- Crunchbase: Recent portfolio exits
- LinkedIn: Posts mentioning "board meeting," "portfolio review"
- Claygent: Scrape annual reports, press releases
- News APIs: Exit announcements, valuations

**Clay Workflow:**
1. Pitchbook: Check fund raised in last 12 months
2. Crunchbase: Find recent exits (success metrics)
3. Claygent: Search LinkedIn posts for "board," "portfolio performance"
4. Calculate: Time since last deal, average hold period
5. Tag urgency: "Active deployment" or "Value creation focus"

**Personalization Triggers:**
- Fresh fund capital → "With your recent $500M fund raise, standardizing RevOps could accelerate deployment"
- Recent exit → "Saw the [Company] exit - hoping to replicate that success across portfolio?"
- Underperforming exit → "After [Company]'s exit at 3x vs your typical 5x, portfolio operations top of mind?"

---

### C - CRITICAL EVENT (Research Sources)

**What to Research:**
- New acquisitions (trigger)
- New hires (Operating Partner)
- Upcoming board meetings
- Portfolio company challenges
- Annual planning season

**Where to Find in Clay:**

**Data Sources:**
- PredictLeads: Real-time acquisition announcements
- LinkedIn: Job changes (Operating Partner joined)
- Claygent: Scrape LinkedIn posts for event mentions
- News APIs: Portfolio company press releases
- Calendar: Q4/Q1 = annual planning season

**Clay Workflow:**
1. PredictLeads: Alert on new deals (last 7 days)
2. LinkedIn: Monitor Operating Partner job changes
3. Claygent: Scan for "board meeting," "portfolio review," "annual planning"
4. Track: Days since last acquisition
5. Prioritize: <90 days since trigger = HOT

**Personalization Triggers:**
- New deal → "Congrats on closing [Company] - when do you start RevOps integration?"
- New Operating Partner → "Welcome to [PE Firm]! Are you building your preferred vendor network?"
- Board season → "With Q1 board meetings approaching, portfolio performance top of mind?"

---

### D - DECISION (Research Sources)

**What to Research:**
- Operating Partner background
- Existing vendor relationships
- Technology adoption patterns
- Budget cycles
- Procurement process indicators

**Where to Find in Clay:**

**Data Sources:**
- LinkedIn: Operating Partner previous roles, interests
- BuiltWith: Portfolio company tech adoption
- Claygent: Scrape job postings for "vendor management"
- Company website: "Partners" page for existing vendors
- LinkedIn: Posts about "preferred vendors," "portfolio services"

**Clay Workflow:**
1. LinkedIn: Research Operating Partner background
2. Check: Do they post about RevOps, GTM, portfolio ops?
3. BuiltWith: Count portfolio companies on HubSpot/Salesforce
4. Claygent: Search for existing "preferred vendor" mentions
5. Tag readiness: "Early adopter" vs "Traditional" vs "Tech-forward"

**Personalization Triggers:**
- Tech-forward portfolio → "Saw your portfolio companies use modern stack - automation mindset?"
- Former operator → "With your background as CRO at [Company], you know RevOps pain firsthand"
- Thought leader → "Enjoyed your post on portfolio value creation - similar philosophy here"

---

## Market 2: International Companies - SPICED Research

### S - SITUATION (Research Sources)

**What to Research:**
- US office status
- US employee count
- US market entry timeline
- Product/service type
- Home market success

**Where to Find in Clay:**

**Data Sources:**
- Crunchbase: Office locations, employee geography
- LinkedIn: Filter employees by "United States"
- BuiltWith: Domain (.com vs .co.uk, etc)
- Claygent: Scrape "About" page for US office address
- Company website: "Locations" or "Contact" page

**Clay Workflow:**
1. Crunchbase: Import non-US HQ companies
2. Filter: $2M-$50M revenue, 20-500 employees
3. Check: Has US location? (Yes/No/Recent)
4. LinkedIn: Count US-based employees
5. Tag entry stage: "Planning," "Launched," "Scaling"

**Personalization Triggers:**
- New US office → "Saw you opened your New York office 6 months ago - how's US traction?"
- Growing US team → "Noticed you've hired 12 US employees in last 6 months - scaling fast"
- Planning stage → "Based in [London] with $15M revenue - US expansion on the roadmap?"

---

### P - PAIN (Research Sources)

**What to Research:**
- Founder doing US sales
- Failed US hires
- Low US customer base
- Ineffective US marketing
- Cultural/buyer psychology gaps

**Where to Find in Clay:**

**Data Sources:**
- LinkedIn: Check if founder/CEO has "US" in job posts
- LinkedIn Jobs: Count US sales role openings
- G2/Capterra: Count US customer reviews
- BuiltWith: Check for US marketing tools
- Claygent: Scrape blog for "US challenges," "American market"

**Clay Workflow:**
1. LinkedIn: Check if founder posts about "US sales"
2. LinkedIn Jobs: Count US-specific role postings
3. G2 API: Count reviews from US customers
4. Claygent: Search blog for US market challenges
5. Tag pain severity: "Struggling," "Early," "Growing"

**Personalization Triggers:**
- Founder selling → "Saw your CEO posting about US meetings - wearing too many hats?"
- Multiple job postings → "Hiring US Sales Director for 3rd time - finding the right talent?"
- Low US reviews → "5 US customers on G2 - ready to scale beyond founder sales?"

---

### I - IMPACT (Research Sources)

**What to Research:**
- US investor on cap table
- US revenue targets in public statements
- Board pressure indicators
- Competitor US success
- Next funding round timing

**Where to Find in Clay:**

**Data Sources:**
- Crunchbase: Investor list (US-based VCs)
- Pitchbook: Funding round details
- Claygent: Scrape blog for "US revenue," "North America growth"
- News APIs: Press releases mentioning US targets
- LinkedIn: CEO posts about US priorities

**Clay Workflow:**
1. Crunchbase: Check for US investors
2. Claygent: Search blog/news for "US market" + "growth" + "$"
3. LinkedIn: Scan CEO posts for US mention frequency
4. Calculate: Months since last funding round
5. Tag impact: "Critical," "High," "Medium"

**Personalization Triggers:**
- US investor → "[US VC] on your cap table - pressure to show US traction?"
- Public targets → "Read your Series B announcement - 40% US revenue by 2026?"
- Funding timing → "18 months post-Series B - US numbers matter for Series C?"

---

### C - CRITICAL EVENT (Research Sources)

**What to Research:**
- Recent US executive hire
- US funding round
- Compliance certifications
- Conference participation
- Product launches

**Where to Find in Clay:**

**Data Sources:**
- LinkedIn: Job changes (US-based CRO/VP Sales hired)
- SignalHire: New US executive contact info
- Crunchbase: Recent funding with US investors
- Claygent: Scrape for SOC2, HIPAA, FedRAMP mentions
- LinkedIn Events: US conference registrations

**Clay Workflow:**
1. LinkedIn: Alert on US executive hires (last 90 days)
2. Crunchbase: Check funding rounds (last 12 months)
3. Claygent: Search for compliance certifications
4. Track: Days since trigger event
5. Prioritize: <60 days = HOT, 60-120 = WARM

**Personalization Triggers:**
- New US exec → "Congrats on hiring [Name] as US CRO - setting up their pipeline engine?"
- Fresh funding → "With your $25M Series B led by [US VC], US GTM infrastructure critical?"
- Compliance push → "Saw SOC2 certification - serious about US enterprise sales?"

---

### D - DECISION (Research Sources)

**What to Research:**
- CEO/CRO background
- Budget indicators
- Organizational structure
- Previous US experience
- Technology adoption

**Where to Find in Clay:**

**Data Sources:**
- LinkedIn: CEO/CRO previous companies, education
- Claygent: Scrape job postings for budget mentions
- BuiltWith: Technology stack (modern vs traditional)
- LinkedIn: Check if US experience in background
- Company size: Revenue per employee (efficiency indicator)

**Clay Workflow:**
1. LinkedIn: Research CEO/Founder background
2. Check: Previous US company experience? (Yes/No)
3. BuiltWith: Adopted HubSpot/Salesforce already?
4. Claygent: Search job postings for "budget," "investment"
5. Tag decision readiness: "Ready," "Needs education," "Not ready"

**Personalization Triggers:**
- US experience → "Saw you were VP Sales at [US Company] - bringing that US GTM playbook?"
- Tech adoption → "Already using HubSpot - understand the value of proven infrastructure"
- No US experience → "First time building US GTM - avoiding the common pitfalls?"

---

## SPICED Scoring for Outbound Prioritization

### PE/VC Firm Scoring Matrix (50-Point Scale)

| SPICED Element | 5 Points | 3 Points | 1 Point | Clay Source |
|----------------|----------|----------|---------|-------------|
| **S - Portfolio Size** | 8-15 companies | 5-7 or 16-20 | <5 or >20 | Pitchbook count |
| **S - Operating Partner** | Hired last 6 months | Has OP >6 months | No OP | LinkedIn job change |
| **P - Tech Stack Chaos** | 4+ different CRMs | 2-3 different CRMs | Standardized | BuiltWith aggregation |
| **P - Hiring Activity** | 5+ sales roles open | 2-4 sales roles | 0-1 roles | LinkedIn Jobs count |
| **I - Recent Exit** | Exit in last 12 months | Exit 12-24 months | No recent exit | Crunchbase exit data |
| **I - Fund Status** | Raised fund last 12 months | Fund 1-2 years old | Fund >3 years | Pitchbook fund data |
| **C - Recent Acquisition** | Deal last 90 days | Deal 90-180 days | No recent deal | PredictLeads alert |
| **C - Board Season** | Q4/Q1 annual planning | Mid-year review | No indicators | Calendar + LinkedIn |
| **D - Tech Forward** | 70%+ portcos modern stack | 40-70% | <40% | BuiltWith analysis |
| **D - Active LinkedIn** | Posts about portfolio ops | Occasional posts | No posts | LinkedIn activity |

**Prioritization:**
- **40-50 points** = 🔥 **TIER 1** - Reach out immediately, high personalization
- **25-39 points** = 🟡 **TIER 2** - Reach out with education, medium personalization
- **<25 points** = ❌ **TIER 3** - Nurture list, low priority

---

### International Company Scoring Matrix (50-Point Scale)

| SPICED Element | 5 Points | 3 Points | 1 Point | Clay Source |
|----------------|----------|----------|---------|-------------|
| **S - US Office** | Opened last 6 months | Open 6-18 months | No office | Crunchbase location |
| **S - US Employees** | 5+ US employees | 2-4 US employees | 0-1 US employee | LinkedIn filter |
| **P - Founder Selling** | CEO posting US sales | US team but small | Established US team | LinkedIn posts |
| **P - Job Openings** | 3+ US sales roles | 1-2 US roles | No openings | LinkedIn Jobs |
| **I - US Investor** | US lead investor | US co-investor | No US investors | Crunchbase cap table |
| **I - US Revenue Talk** | Mentioned in press | Mentioned on blog | Not mentioned | Claygent search |
| **C - US Exec Hire** | Hired last 90 days | Hired 90-180 days | No recent hire | LinkedIn job change |
| **C - Recent Funding** | Raised last 6 months | Raised 6-12 months | >12 months | Crunchbase funding |
| **D - CEO Background** | Previous US company | Visited US frequently | No US experience | LinkedIn history |
| **D - Tech Stack** | HubSpot/Salesforce adopted | Traditional CRM | No CRM | BuiltWith |

**Prioritization:**
- **40-50 points** = 🔥 **TIER 1** - Reach out immediately, high personalization
- **25-39 points** = 🟡 **TIER 2** - Reach out with education, medium personalization
- **<25 points** = ❌ **TIER 3** - Nurture list, low priority

---

## Outbound Message Templates by SPICED Score

### PE/VC Template - High SPICED Score (45+ points)

**Subject:** [PE Firm] + [Portfolio Company] RevOps

[Operating Partner Name],

Congrats on closing the [Portfolio Company] acquisition last month (S - Recent acquisition trigger).

I noticed [Portfolio Company] is hiring 3 sales roles (P - Hiring activity) and you've got [Company A] on Salesforce, [Company B] on HubSpot, and [Company C] with no CRM (P - Tech chaos).

With 12 portfolio companies and a new fund to deploy (I - Fund status), standardizing RevOps could save your portfolio $600K+ annually while accelerating time-to-revenue post-acquisition (I - Impact).

We help PE firms like [Similar PE Firm] build preferred vendor models for automated demand gen - consistent processes, better benchmarking, faster onboarding.

Worth 15 minutes before your Q1 board meetings? (C - Board season)

[Your Name]

---

### International Company Template - High SPICED Score (45+ points)

**Subject:** [Company] US market entry - GTM infrastructure

[CEO Name],

Saw you hired [US CRO Name] as your US Chief Revenue Officer last month (C - Executive hire) and opened your New York office (S - US office).

With [US VC] on your cap table (I - US investor) and 4 open US sales roles (P - Hiring activity), setting up scalable US demand gen infrastructure seems critical.

We help international B2B companies like [Similar Company - same country] build their US-focused GTM engine - from zero to 30-50 qualified US meetings per month in 90 days.

Your background at [Previous Company] gives you US market experience, but your team is still learning the nuances (D - Background).

Worth 15 minutes to discuss before your board meeting next month? (C - Board timing)

[Your Name]

---

## Intent Signal Hierarchy

### PRIMARY INTENT SIGNALS ⭐⭐⭐ (Highest Priority)

**PE/VC:**
- Closed acquisition in last 90 days
- New Operating Partner hired in last 6 months
- 3+ portfolio companies with sales/marketing job openings
- Recent portfolio company layoff or underperformance

**International:**
- Hired US CRO/VP Sales in last 90 days
- Raised funding from US VC in last 6 months
- Posted 3+ US sales job openings
- SOC2/HIPAA/FedRAMP certification obtained

---

### SECONDARY INTENT SIGNALS ⭐⭐ (Medium Priority)

**PE/VC:**
- Portfolio grew from 5→10+ companies in last 18 months
- Recent exit (good or bad - creates learning opportunity)
- Q4/Q1 annual planning season
- Operating Partner posts about portfolio operations

**International:**
- Opened US office 6-18 months ago
- US investor on cap table
- CEO posting about US sales on LinkedIn
- 18 months post-Series B (Series C timing)

---

### TERTIARY INTENT SIGNALS ⭐ (Lower Priority)

**PE/VC:**
- 70%+ portfolio companies use modern tech stack
- Fund raised in last 2-3 years (still deploying)
- Portfolio size 8-15 companies (sweet spot)

**International:**
- $10M+ revenue in home market (can afford US expansion)
- Already using HubSpot/Salesforce (tech adoption)
- Previous US company experience on CEO's LinkedIn

---

## Using SPICED in Clay Workflows

### Recommended Clay Table Structure:

**Table 1: Target Companies**
- Company Name
- Website
- LinkedIn URL
- Location
- Employee Count
- Revenue Estimate

**Table 2: SPICED Enrichment**
- S - Situation Score (1-10)
- P - Pain Score (1-10)
- I - Impact Score (1-10)
- C - Critical Event Score (1-10)
- D - Decision Score (1-10)
- **Total SPICED Score (5-50)**
- **Priority Tier** (1/2/3)

**Table 3: Personalization Data**
- Specific trigger (what to reference)
- Pain point (what to mention)
- Impact statement (ROI to emphasize)
- Call to action (meeting ask)

**Table 4: Contact Enrichment**
- Decision-maker name
- Title
- LinkedIn URL
- Email
- Phone (if available)

---

## Related Context

- [[positioning/scott-brenda-partnership-notes-2025-12-19-BLENDED]] - Blended pricing model
- [[positioning/Q126-business-plan]] - Source document for SPICED framework
- [[content/frameworks/outbound-lead-development]] - Full outbound framework (to create)

---

**Last Updated:** December 19, 2025
**Next Review:** After Q1 2026 pilot (refine scoring based on actual conversion data)
