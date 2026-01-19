---
title: "Targeting Signals Framework: Identifying High-Intent Prospects"
type: framework
created: 2024-12-09
last-updated: 2024-12-09
status: active
use-cases:
  - cold-email
  - icp-definition
  - sales-enablement
personas:
  - ceo-founder
  - cro
  - cmo
integrates-with:
  - cold-email-outreach
  - icp-research-framework
key-concepts:
  - hiring-signals
  - technology-adoption-signals
  - funding-signals
  - growth-signals
  - pain-point-signals
tags:
  - framework
  - targeting
  - signals
  - intent-data
  - cold-email
---

# Targeting Signals Framework: Identifying High-Intent Prospects
**Created:** 2024-12-09
**Purpose:** Identify the highest-leverage public data signals to target ideal prospects

---

## Framework: What Makes a Great Signal?

A targeting signal should be:
1. **Timely** - Happening now, creating urgency (not static firmographic data)
2. **Specific** - Strongly indicates ICP fit and pain point
3. **Accessible** - Publicly available and realistically obtainable
4. **Actionable** - Enables personalized outreach to decision-maker
5. **Scalable** - Can monitor systematically, not just one-off manual research

---

## Signal Categories Brainstorm

### 1. Hiring Signals
- **Job postings** - Role type, seniority, timing, language used
- **LinkedIn hiring announcements** - "We're hiring!" posts from founders
- **New employee announcements** - "Excited to announce [name] joined as..."
- **First-time roles** - First RevOps hire, first VP Sales, etc.
- **Rapid hiring** - Multiple roles posted simultaneously

### 2. Technology Adoption Signals
- **CRM implementation** - HubSpot, Salesforce, Pipedrive newly detected
- **Marketing automation** - Marketo, Pardot, HubSpot Marketing
- **Sales engagement** - Outreach, SalesLoft, Apollo newly added
- **Data tools** - Clay, ZoomInfo, Clearbit recently adopted
- **Tech stack gaps** - Have CRM but no sequencing tool (shows need)
- **Legacy tech** - Using outdated tools (Constant Contact, Act!, Excel)

### 3. Funding & Financial Signals
- **Recent funding** - Series A/B announcements (last 3-6 months)
- **Bootstrapped profitability** - LinkedIn posts about hitting revenue milestones
- **Acquisition/exit** - Company acquired, founders have capital
- **New investors** - Strategic investor added (might push for growth)

### 4. Organizational Change Signals
- **New leadership** - New CEO, CRO, VP Sales, CMO hired
- **Founder/leadership transitions** - Founder stepping into CEO role, new partner added
- **Rebrands** - New domain, new company name, new positioning
- **Office expansion** - Opening new location (shows growth)
- **Ownership changes** - PE acquisition, management buyout

### 5. Market Expansion Signals
- **Product launches** - New product line, new feature announced
- **Market entry** - Expanding to new geography, new vertical
- **Pricing page changes** - New tiers, new packaging (shows GTM shift)
- **Conference presence** - Speaking, sponsoring, exhibiting (shows investment in GTM)

### 6. Content & Engagement Signals
- **Founder posts about challenges** - "Struggling with...", "Looking for..."
- **Hiring posts with pain points** - "Our current process is manual..."
- **Company blog posts** - Discussing growth, scaling, new initiatives
- **Podcast appearances** - Founder interviewed about growth journey
- **Industry awards/recognition** - "Fast-growing company" lists

### 7. Intent Signals
- **Website visitors** - (if you have intent data tool)
- **Content downloads** - Whitepapers, guides on GTM topics
- **Event attendance** - SaaStr, SaaS conferences, GTM summits
- **Software review activity** - Researching CRMs, sales tools on G2/Capterra
- **Competitor research** - Looking at similar consultants/agencies

### 8. Firmographic Signals (Static but Important for Filtering)
- **Employee count** - 15-50 for legacy businesses, 10-50 for SaaS
- **Company age** - 5+ years for legacy, 2-5 years for SaaS
- **Industry** - Professional services, healthcare services, finance SaaS
- **Revenue estimate** - $5M-$50M (indicates budget)
- **Geographic location** - US-based (if preferred)
- **Decision-maker accessibility** - Founder/partner on LinkedIn

---

## TIER 1: Highest Leverage Signals (Top 20%)
**These are gold. Prioritize building systems around these first.**

### For Hypothesis 1: Founder-Led Legacy Services Businesses

#### Signal 1A: Job Posting for First RevOps/Sales Ops Role ⭐⭐⭐⭐⭐
**Why it's high leverage:**
- Shows budget allocation RIGHT NOW
- Indicates pain point (need help scaling GTM)
- Perfect timing trigger (hiring process = 30-60 day window)
- Alternative positioning: "Don't hire full-time yet, pilot with us first"

**Data sources:**
- LinkedIn Jobs API / scraper
- Indeed API
- Company career pages (can scrape)
- Job aggregators (Otta, Wellfound, Greenhouse job boards)

**Search phraseology:**
- "Revenue Operations" OR "RevOps" OR "Sales Operations"
- "Marketing Operations" OR "Growth Operations"
- Company size: 15-50 employees
- Industry: Professional services, healthcare services, industrial
- Filter: First instance of this role type for the company

**Operationalization:**
- Clay table: Daily scrape LinkedIn Jobs for target industries + employee count + "RevOps" keywords
- Enrich: Get founder LinkedIn profiles, tech stack, company age
- Filter: First RevOps hire (check if role exists already)
- Alert: Slack notification when match found
- Outreach: "I saw you're hiring your first RevOps person. Before you hire full-time, consider piloting with a consultant who can set up your infrastructure and prove ROI first."

---

#### Signal 1B: Recently Adopted CRM (Last 90 Days) ⭐⭐⭐⭐⭐
**Why it's high leverage:**
- Perfect timing (need help with setup/configuration)
- Shows investment in modernization
- Window of opportunity (first 90 days is critical for adoption)
- Founder is likely frustrated with setup complexity

**Data sources:**
- BuiltWith (has API, shows tech stack changes with dates)
- Wappalyzer (browser extension, can export)
- SimilarTech
- Datanyze
- Manual: LinkedIn posts announcing CRM selection

**Search phraseology:**
- BuiltWith: Companies that added "HubSpot" OR "Salesforce" in last 90 days
- Filter by: Employee count 15-50, industry, domain age 5+ years
- Bonus: Companies with NO marketing automation or sales engagement tools yet (shows more need)

**Operationalization:**
- BuiltWith API → Clay workflow
- Monitor: Daily checks for new CRM adoptions in target ICP
- Enrich: Founder contacts, current tech stack gaps
- Outreach: "Congrats on implementing HubSpot! Most companies waste the first 6 months with poor setup. We help founder-led businesses configure CRM infrastructure correctly from day one."

---

#### Signal 1C: Founder Posting About Growth/Scaling Challenges ⭐⭐⭐⭐
**Why it's high leverage:**
- Shows active pain point RIGHT NOW
- Founder is publicly asking for help (warm intro opportunity)
- Can engage directly via comment/DM
- Social proof opportunity (help them publicly)

**Data sources:**
- LinkedIn post monitoring (can use Phantombuster, Heyreach)
- Twitter/X monitoring (if founders active there)
- Reddit (r/entrepreneur, r/smallbusiness, industry subreddits)

**Search phraseology (LinkedIn):**
- Founder/Partner posts containing:
  - "struggling with sales" OR "pipeline generation"
  - "hiring first" + ("sales" OR "marketing" OR "RevOps")
  - "need help with" + ("CRM" OR "outreach" OR "lead gen")
  - "stagnant growth" OR "hit a plateau"
  - "cold calling not working" OR "email open rates"
  - "looking for recommendations" + "sales consultant"

**Operationalization:**
- LinkedIn search alert (manual for now, can automate with tools)
- Save search: Posts from Founders/Partners in target industries mentioning challenges
- Daily review: 10-15 mins checking saved searches
- Engagement: Thoughtful comment offering help, then DM

---

#### Signal 1D: Employee Growth Spike (20%+ in Last 12 Months) ⭐⭐⭐⭐
**Why it's high leverage:**
- Indicates scaling phase (growing pains likely)
- More employees = more revenue = budget for GTM investment
- Growth creates operational challenges (perfect pain point)

**Data sources:**
- LinkedIn Sales Navigator (tracks employee count over time)
- Crunchbase (employee count changes)
- ZoomInfo / Apollo (historical employee data)

**Search phraseology:**
- Sales Navigator: Employee count growth filter (if available)
- Manual: Compare current employee count vs 12 months ago (LinkedIn Wayback Machine, archive.org)
- Filter: 15-50 employees currently, was 12-40 twelve months ago (20%+ growth)

**Operationalization:**
- Sales Navigator saved search: Target industries, 15-50 employees
- Monthly tracking: Export list, compare employee count month-over-month
- Clay enrichment: Identify companies with 20%+ growth
- Outreach: "I noticed you've grown from X to Y employees in the last year. Congrats! That growth usually creates GTM infrastructure challenges. We help founder-led businesses scale their sales operations during rapid growth."

---

### For Hypothesis 2: Finance/Accounting SaaS Companies

#### Signal 2A: Series A/B Funding Announcement (Last 6 Months) ⭐⭐⭐⭐⭐
**Why it's high leverage:**
- Budget just unlocked (cash in bank)
- Board pressure to scale GTM and show growth
- 6-18 month window to deploy capital
- Public announcement = easy to find and congratulate

**Data sources:**
- Crunchbase (funding announcements, has API)
- TechCrunch, VentureBeat (news mentions)
- LinkedIn founder posts announcing funding
- Company press releases

**Search phraseology:**
- Crunchbase filters:
  - Funding round: Series A or Series B
  - Date: Last 6 months
  - Categories: Fintech, SaaS, Financial Services, Accounting, FP&A
  - Employee count: 10-50
- News alerts: "Series A" + ("fintech" OR "accounting" OR "FP&A" OR "treasury")

**Operationalization:**
- Crunchbase API → Clay workflow
- Daily/weekly: Check new funding rounds in target categories
- Enrich: Founder/CEO LinkedIn, tech stack, hiring activity
- Outreach: "Congrats on your Series A! With my FP&A background from 6sense, I help finance/accounting SaaS companies set up RevOps infrastructure to scale efficiently post-funding. Most founders waste 6 months figuring this out—I can accelerate your GTM."

---

#### Signal 2B: Hiring GTM Roles (AE, SDR, VP Sales) ⭐⭐⭐⭐⭐
**Why it's high leverage:**
- Building sales team = need infrastructure BEFORE reps start
- Shows budget and hiring urgency
- Can position as "set up infrastructure first, then hire reps"
- Rep productivity depends on having proper systems

**Data sources:**
- LinkedIn Jobs (finance SaaS companies posting GTM roles)
- Company career pages
- Job boards (Wellfound for startups)

**Search phraseology:**
- Job title: "Account Executive" OR "SDR" OR "BDR" OR "VP Sales" OR "Sales Manager"
- Company category: Fintech, accounting software, FP&A, treasury management
- Employee count: 10-50
- Bonus: Look for "first AE hire" or "founding AE" language

**Operationalization:**
- Clay scraper: LinkedIn Jobs daily for target roles at finance SaaS companies
- Filter: Identify first sales hires vs scaling existing team
- Outreach: "I saw you're hiring [role]. Before they start, let's set up your CRM, enrichment workflows, and sequencing infrastructure so they can be productive from day one. My FP&A background from 6sense means I understand finance SaaS GTM metrics deeply."

---

#### Signal 2C: G2/Capterra Presence in Finance/Accounting Categories ⭐⭐⭐⭐
**Why it's high leverage:**
- Confirms ICP fit (definitely finance/accounting SaaS)
- Public reviews show customer base and maturity
- Can identify companies with <50 reviews (still growing, need GTM help)
- Recent reviews = recent customer growth

**Data sources:**
- G2.com category pages (FP&A Software, Accounting, Treasury Management, etc.)
- Capterra category pages
- Can scrape or manually browse

**Search phraseology (categories to explore):**
- FP&A Software
- Accounting Software
- Treasury Management
- Expense Management
- Revenue Recognition Software
- Billing Software
- Financial Reporting
- Corporate Performance Management (CPM)

**Operationalization:**
- Manual: Browse G2/Capterra categories monthly
- Identify: Companies with 10-50 employees, <100 reviews (still scaling)
- Enrich in Clay: Employee count, tech stack, recent hiring, founder LinkedIn
- Stack with other signals: Funding, hiring, tech adoption
- Outreach: "I noticed [company] on G2 in the [category]. With my FP&A background from 6sense, I help finance/accounting SaaS companies scale their RevOps infrastructure. I'd love to share how we've helped similar companies."

---

#### Signal 2D: Product Launch or Market Expansion Announcement ⭐⭐⭐⭐
**Why it's high leverage:**
- New product = need new ICP definition, messaging, positioning
- Market expansion = need GTM playbook for new segment
- Shows growth momentum and investment
- Creates immediate need for strategic GTM help

**Data sources:**
- Product Hunt (new launches)
- Company blog posts
- LinkedIn founder announcements
- Press releases
- TechCrunch product launch coverage

**Search phraseology:**
- Product Hunt: Finance/accounting category launches
- LinkedIn: Posts from finance SaaS founders with "launching" OR "excited to announce" OR "new product"
- Google News alerts: [company name] + "launches" OR "expands"

**Operationalization:**
- Product Hunt daily digest: Finance/fintech categories
- LinkedIn saved search: Founder posts with launch keywords
- Weekly review: 15-20 mins scanning for announcements
- Outreach: "Congrats on launching [product]! Expanding into a new market/product requires tight ICP definition and messaging. My FP&A background means I understand your buyer deeply. Let's chat about setting up your GTM infrastructure for this launch."

---

## TIER 2: High Value Signals (Next 30%)
**Worth implementing after Tier 1 is operationalized.**

### Signal 3: Tech Stack Analysis for Gaps
- Companies with CRM but NO sales engagement tool (Outreach, SalesLoft, instantly)
- Companies with CRM but NO enrichment tool (Clay, Clearbit, ZoomInfo)
- Companies with outdated tech (Constant Contact, MailChimp for B2B sales)
- **Source:** BuiltWith, Datanyze
- **Use case:** "I noticed you have Salesforce but no sequencing tool. Let me show you how to add automation."

### Signal 4: Recent Leadership Changes
- New CRO, VP Sales, VP Marketing hired (last 90 days)
- New leaders = new priorities = budget to spend on initiatives
- **Source:** LinkedIn job change announcements, company press releases
- **Phraseology:** "Excited to announce [name] joined as CRO"

### Signal 5: Company Rebranding
- New domain, new positioning, new website design
- Shows investment in GTM and repositioning
- **Source:** BuiltWith (domain changes), LinkedIn announcements
- **Use case:** "I saw you rebranded recently. That's a great time to refresh your GTM infrastructure too."

### Signal 6: Conference Speaking/Sponsorship
- Founder speaking at SaaStr, GTM Summit, industry conferences
- Sponsoring events = marketing budget unlocked
- **Source:** Conference agendas, LinkedIn posts, event websites
- **Use case:** "Saw you're speaking at [conference]. Companies investing in brand like this usually need to scale their pipeline too."

### Signal 7: Awards & Recognition
- "Fastest growing company" lists (Inc 5000, Deloitte Fast 500)
- Industry awards for innovation
- **Source:** Press releases, LinkedIn posts, award websites
- **Use case:** Fast growth = GTM infrastructure challenges

### Signal 8: Domain Age + Poor Tech Stack
- Company domain registered 5+ years ago
- Still using legacy/outdated tools (or no tools detected)
- **Source:** WHOIS lookup + BuiltWith
- **Use case:** Legacy businesses with no modern GTM infrastructure

---

## TIER 3: Moderate Value Signals (Lower Priority)
**Consider these if Tier 1 and 2 are saturated.**

- Website traffic growth (SimilarWeb, Ahrefs)
- Social media follower growth
- Glassdoor reviews mentioning sales challenges
- Industry-specific signals (e.g., tax season for tax consultants)
- Partnership announcements
- Customer case study publications (shows marketing maturity)

---

## Recommended Implementation Roadmap

### Phase 1: Quick Wins (Week 1-2)
**Goal:** Get first 50 high-intent leads in the door

1. **Manual LinkedIn Searches (2 hours/week)**
   - Saved search: Founder posts mentioning GTM challenges
   - Saved search: Job postings for first RevOps hire
   - Daily engagement: Comment/DM on relevant posts

2. **Crunchbase Funding Alerts (30 mins/week)**
   - Set up alerts for Series A/B in finance/accounting SaaS
   - Weekly review of funded companies
   - Immediate outreach with funding congratulations

3. **G2/Capterra Manual Browse (1 hour/week)**
   - Identify 10-20 finance SaaS companies per week
   - Enrich with LinkedIn, check tech stack
   - Personalized outreach

**Expected output:** 20-30 high-intent leads/week from manual effort

---

### Phase 2: Automation (Week 3-4)
**Goal:** Set up Clay workflows for systematic monitoring

1. **Build Clay Table 1: Job Posting Monitor**
   - Input: LinkedIn Jobs scraper for RevOps roles
   - Enrichment: Company age, tech stack, founder LinkedIn
   - Filter: 15-50 employees, 5+ years old, first RevOps hire
   - Output: Daily Slack alert with 5-10 leads

2. **Build Clay Table 2: CRM Adoption Monitor**
   - Input: BuiltWith API for HubSpot/Salesforce adoptions (last 90 days)
   - Enrichment: Employee count, industry, founder contact
   - Filter: Target ICP criteria
   - Output: Weekly email with 10-20 leads

3. **Build Clay Table 3: Funding Monitor**
   - Input: Crunchbase API for Series A/B (last 6 months)
   - Filter: Finance/accounting SaaS categories, 10-50 employees
   - Enrichment: Hiring activity, tech stack
   - Output: Weekly Slack alert with 5-10 funded companies

**Expected output:** 50-75 leads/week automated + manual effort

---

### Phase 3: Advanced Signals (Month 2+)
**Goal:** Layer in secondary signals for higher precision

1. **LinkedIn Post Monitoring Automation**
   - Use tool like Phantombuster to monitor founder posts
   - Alert when keywords match (GTM challenges, hiring, scaling)

2. **Employee Growth Tracking**
   - Monthly export from Sales Navigator
   - Compare employee counts month-over-month
   - Flag 20%+ growth companies

3. **Tech Stack Gap Analysis**
   - Cross-reference BuiltWith data
   - Identify companies with CRM but missing key tools
   - Proactive outreach about infrastructure gaps

**Expected output:** 100+ qualified leads/week

---

## Key Data Sources Summary

| Data Source | Cost | What It Provides | Best For |
|------------|------|------------------|----------|
| **LinkedIn Sales Navigator** | $99/mo | Company data, employee counts, job postings, founder profiles | All signals, essential |
| **BuiltWith** | $295/mo Pro | Tech stack, adoption dates, historical data | CRM adoption, tech gaps |
| **Crunchbase Pro** | $49/mo | Funding data, employee counts, categories | Funding signals, SaaS targeting |
| **Clay** | $349/mo | Automation, enrichment, workflow builder | Operationalizing all signals |
| **Phantombuster** | $30/mo | LinkedIn scrapers, post monitors | Social listening, engagement |
| **G2/Capterra** | Free | Software categories, company lists | Finance SaaS ICP validation |
| **Product Hunt** | Free | New product launches | Market expansion signals |
| **Apollo / ZoomInfo** | $99-149/mo | Contact data, tech stack, intent | Alternative to LinkedIn, enrichment |

**Total investment for comprehensive system:** ~$800-1000/month

**ROI:** If this generates 10 qualified convos/month → 2-3 clients → $12-18K MRR, it pays for itself 12-18x.

---

## Prioritized Action Plan (Start Here)

### This Week (Manual, No Tools Required):

1. ☑️ **Set up LinkedIn saved searches** (30 mins)
   - Search 1: Founder posts with "struggling with sales" OR "hiring first RevOps"
   - Search 2: Job postings for "Revenue Operations" at 15-50 employee companies
   - Review daily, engage with 3-5 posts

2. ☑️ **Set up Crunchbase funding alerts** (15 mins)
   - Alert: Series A/B in fintech, accounting, FP&A categories
   - Review weekly, outreach to 5 newly funded companies

3. ☑️ **Browse G2 finance categories** (1 hour)
   - Identify 20 companies in FP&A, accounting, treasury categories
   - Enrich with LinkedIn (find founders), check if hiring
   - Personalized outreach to 10

**Expected: 15-25 high-intent leads this week from 2-3 hours of work**

---

### Next Week (If Manual Works, Start Automating):

1. ☑️ **Set up Clay account** ($349/mo trial)
   - Build table 1: Job posting scraper
   - Connect BuiltWith API (trial)
   - Test workflow with 50 companies

2. ☑️ **Document outreach templates** for each signal
   - Template: Job posting trigger
   - Template: CRM adoption trigger
   - Template: Funding announcement trigger
   - Template: Founder post engagement

3. ☑️ **Track results**
   - Which signals got highest response rates?
   - Which signals led to conversations?
   - Double down on what works

---

## The Bottom Line

**Highest ROI signals to implement first:**

**For Founder-Led Legacy Businesses:**
1. Job postings for first RevOps hire (LinkedIn Jobs)
2. Recently adopted CRM in last 90 days (BuiltWith)
3. Founder posts about GTM challenges (LinkedIn)

**For Finance/Accounting SaaS:**
1. Series A/B funding in last 6 months (Crunchbase)
2. Hiring GTM roles (LinkedIn Jobs)
3. G2/Capterra presence (manual browse)

**Start with manual effort this week. If you get 5+ quality conversations from 3 hours of work, invest in automation tools next month.**

The key is not having perfect data—it's having TIMELY data that indicates someone is ready to buy RIGHT NOW. These signals do that.
