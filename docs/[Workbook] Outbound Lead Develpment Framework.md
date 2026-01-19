Lead Generation and Development Model

Using SPICED![][image1]

## **Research → Target → Personalize → Reach Out**

---

## **THE SPICED OUTBOUND METHODOLOGY**

In outbound prospecting, you research SPICED elements **BEFORE** reaching out to:

1. **Build target lists** with high-intent prospects  
2. **Personalize messaging** based on specific pain/impact  
3. **Prioritize accounts** by urgency and fit

---

## **MARKET 1: PE/VC FIRMS \- SPICED OUTBOUND RESEARCH**

### **S \- SITUATION (Research Sources)**

**What to Research:**

* Portfolio size and composition  
* Recent acquisitions (last 90 days)  
* Operating model (has Operating Partner?)  
* Portfolio company characteristics  
* Geographic footprint

**Where to Find in Clay:**

Data Sources:  
→ Pitchbook: Portfolio company count, deal history, AUM  
→ Crunchbase: Recent acquisitions, funding rounds  
→ LinkedIn: Operating Partner title, job postings  
→ Claygent: Scrape "Portfolio" page for company list  
→ Company website: "Team" page for Operating Partners

Clay Workflow:  
1\. Import PE firm list (Pitchbook/Crunchbase)  
2\. Filter: 5-20 portfolio companies, $100M-$2B AUM  
3\. Enrich: Operating Partner names from LinkedIn  
4\. Claygent: Scrape portfolio page, count companies

5\. Tag: "Has Operating Partner" \= Yes/No

**Personalization Trigger:**

* Recently closed acquisition → "Congrats on the \[Company\] acquisition"  
* New Operating Partner hired → "Saw you recently joined as Operating Partner"  
* Portfolio grew rapidly → "Noticed your portfolio expanded from 8 to 14 companies in 18 months"

---

### **P \- PAIN (Research Sources)**

**What to Research:**

* Portfolio companies using different tech stacks  
* Portfolio companies with sales/marketing job openings  
* Lack of standardization across portfolio  
* Portfolio company challenges (layoffs, missed targets)

**Where to Find in Clay:**

Data Sources:  
→ BuiltWith/HG Insights: Tech stack per portfolio company  
→ LinkedIn Jobs: Count sales/marketing openings per portco  
→ Layoffs.fyi: Recent portfolio company layoffs  
→ Crunchbase: Funding down-rounds, negative news  
→ Claygent: Scrape portfolio company LinkedIn for "challenges"

Clay Workflow:  
1\. For each portfolio company:  
   → Check CRM (Salesforce vs HubSpot vs none)  
   → Count open sales/marketing roles  
   → Check for recent layoffs  
2\. Aggregate: "8 portcos using 5 different CRMs"

3\. Tag pain level: High/Medium/Low

**Personalization Trigger:**

* Tech stack chaos → "Noticed your portfolio uses 6 different CRMs \- standardization opportunity?"  
* Multiple portcos hiring → "\[Portco A\], \[Portco B\], and \[Portco C\] all hiring sales roles \- growth mode or replacement?"  
* Recent layoffs → "\[Portco\] recently had layoffs \- helping them stabilize RevOps?"

---

### **I \- IMPACT (Research Sources)**

**What to Research:**

* Fund deployment timeline  
* Portfolio company growth targets  
* Recent exits (success or struggle)  
* Board meeting frequency  
* LP reporting requirements

**Where to Find in Clay:**

Data Sources:  
→ Pitchbook: Fund vintage, deployment timeline  
→ Crunchbase: Recent portfolio exits  
→ LinkedIn: Posts mentioning "board meeting," "portfolio review"  
→ Claygent: Scrape annual reports, press releases  
→ News APIs: Exit announcements, valuations

Clay Workflow:  
1\. Pitchbook: Check fund raised in last 12 months  
2\. Crunchbase: Find recent exits (success metrics)  
3\. Claygent: Search LinkedIn posts for "board," "portfolio performance"  
4\. Calculate: Time since last deal, average hold period

5\. Tag urgency: "Active deployment" or "Value creation focus"

**Personalization Trigger:**

* Fresh fund capital → "With your recent $500M fund raise, standardizing RevOps could accelerate deployment"  
* Recent exit → "Saw the \[Company\] exit \- hoping to replicate that success across portfolio?"  
* Underperforming exit → "After \[Company\]'s exit at 3x vs your typical 5x, portfolio operations top of mind?"

---

### **C \- CRITICAL EVENT (Research Sources)**

**What to Research:**

* New acquisitions (trigger)  
* New hires (Operating Partner)  
* Upcoming board meetings  
* Portfolio company challenges  
* Annual planning season

**Where to Find in Clay:**

Data Sources:  
→ PredictLeads: Real-time acquisition announcements  
→ LinkedIn: Job changes (Operating Partner joined)  
→ Claygent: Scrape LinkedIn posts for event mentions  
→ News APIs: Portfolio company press releases  
→ Calendar: Q4/Q1 \= annual planning season

Clay Workflow:  
1\. PredictLeads: Alert on new deals (last 7 days)  
2\. LinkedIn: Monitor Operating Partner job changes  
3\. Claygent: Scan for "board meeting," "portfolio review," "annual planning"  
4\. Track: Days since last acquisition

5\. Prioritize: \<90 days since trigger \= HOT

**Personalization Trigger:**

* New deal → "Congrats on closing \[Company\] \- when do you start RevOps integration?"  
* New Operating Partner → "Welcome to \[PE Firm\]\! Are you building your preferred vendor network?"  
* Board season → "With Q1 board meetings approaching, portfolio performance top of mind?"

---

### **D \- DECISION (Research Sources)**

**What to Research:**

* Operating Partner background  
* Existing vendor relationships  
* Technology adoption patterns  
* Budget cycles  
* Procurement process indicators

**Where to Find in Clay:**

Data Sources:  
→ LinkedIn: Operating Partner previous roles, interests  
→ BuiltWith: Portfolio company tech adoption  
→ Claygent: Scrape job postings for "vendor management"  
→ Company website: "Partners" page for existing vendors  
→ LinkedIn: Posts about "preferred vendors," "portfolio services"

Clay Workflow:  
1\. LinkedIn: Research Operating Partner background  
2\. Check: Do they post about RevOps, GTM, portfolio ops?  
3\. BuiltWith: Count portfolio companies on HubSpot/Salesforce  
4\. Claygent: Search for existing "preferred vendor" mentions

5\. Tag readiness: "Early adopter" vs "Traditional" vs "Tech-forward"

**Personalization Trigger:**

* Tech-forward portfolio → "Saw your portfolio companies use modern stack \- automation mindset?"  
* Former operator → "With your background as CRO at \[Company\], you know RevOps pain firsthand"  
* Thought leader → "Enjoyed your post on portfolio value creation \- similar philosophy here"

---

## **MARKET 2: INTERNATIONAL COMPANIES \- SPICED OUTBOUND RESEARCH**

### **S \- SITUATION (Research Sources)**

**What to Research:**

* US office status  
* US employee count  
* US market entry timeline  
* Product/service type  
* Home market success

**Where to Find in Clay:**

Data Sources:  
→ Crunchbase: Office locations, employee geography  
→ LinkedIn: Filter employees by "United States"  
→ BuiltWith: Domain (.com vs .co.uk, etc)  
→ Claygent: Scrape "About" page for US office address  
→ Company website: "Locations" or "Contact" page

Clay Workflow:  
1\. Crunchbase: Import non-US HQ companies  
2\. Filter: $2M-$50M revenue, 20-500 employees  
3\. Check: Has US location? (Yes/No/Recent)  
4\. LinkedIn: Count US-based employees

5\. Tag entry stage: "Planning," "Launched," "Scaling"

**Personalization Trigger:**

* New US office → "Saw you opened your New York office 6 months ago \- how's US traction?"  
* Growing US team → "Noticed you've hired 12 US employees in last 6 months \- scaling fast"  
* Planning stage → "Based in \[London\] with $15M revenue \- US expansion on the roadmap?"

---

### **P \- PAIN (Research Sources)**

**What to Research:**

* Founder doing US sales  
* Failed US hires  
* Low US customer base  
* Ineffective US marketing  
* Cultural/buyer psychology gaps

**Where to Find in Clay:**

Data Sources:  
→ LinkedIn: Check if founder/CEO has "US" in job posts  
→ LinkedIn Jobs: Count US sales role openings  
→ G2/Capterra: Count US customer reviews  
→ BuiltWith: Check for US marketing tools  
→ Claygent: Scrape blog for "US challenges," "American market"

Clay Workflow:  
1\. LinkedIn: Check if founder posts about "US sales"  
2\. LinkedIn Jobs: Count US-specific role postings  
3\. G2 API: Count reviews from US customers  
4\. Claygent: Search blog for US market challenges

5\. Tag pain severity: "Struggling," "Early," "Growing"

**Personalization Trigger:**

* Founder selling → "Saw your CEO posting about US meetings \- wearing too many hats?"  
* Multiple job postings → "Hiring US Sales Director for 3rd time \- finding the right talent?"  
* Low US reviews → "5 US customers on G2 \- ready to scale beyond founder sales?"

---

### **I \- IMPACT (Research Sources)**

**What to Research:**

* US investor on cap table  
* US revenue targets in public statements  
* Board pressure indicators  
* Competitor US success  
* Next funding round timing

**Where to Find in Clay:**

Data Sources:  
→ Crunchbase: Investor list (US-based VCs)  
→ Pitchbook: Funding round details  
→ Claygent: Scrape blog for "US revenue," "North America growth"  
→ News APIs: Press releases mentioning US targets  
→ LinkedIn: CEO posts about US priorities

Clay Workflow:  
1\. Crunchbase: Check for US investors  
2\. Claygent: Search blog/news for "US market" \+ "growth" \+ "$"  
3\. LinkedIn: Scan CEO posts for US mention frequency  
4\. Calculate: Months since last funding round

5\. Tag impact: "Critical," "High," "Medium"

**Personalization Trigger:**

* US investor → "\[US VC\] on your cap table \- pressure to show US traction?"  
* Public targets → "Read your Series B announcement \- 40% US revenue by 2026?"  
* Funding timing → "18 months post-Series B \- US numbers matter for Series C?"

---

### **C \- CRITICAL EVENT (Research Sources)**

**What to Research:**

* Recent US executive hire  
* US funding round  
* Compliance certifications  
* Conference participation  
* Product launches

**Where to Find in Clay:**

Data Sources:  
→ LinkedIn: Job changes (US-based CRO/VP Sales hired)  
→ SignalHire: New US executive contact info  
→ Crunchbase: Recent funding with US investors  
→ Claygent: Scrape for SOC2, HIPAA, FedRAMP mentions  
→ LinkedIn Events: US conference registrations

Clay Workflow:  
1\. LinkedIn: Alert on US executive hires (last 90 days)  
2\. Crunchbase: Check funding rounds (last 12 months)  
3\. Claygent: Search for compliance certifications  
4\. Track: Days since trigger event

5\. Prioritize: \<60 days \= HOT, 60-120 \= WARM

**Personalization Trigger:**

* New US exec → "Congrats on hiring \[Name\] as US CRO \- setting up their pipeline engine?"  
* Fresh funding → "With your $25M Series B led by \[US VC\], US GTM infrastructure critical?"  
* Compliance push → "Saw SOC2 certification \- serious about US enterprise sales?"

---

### **D \- DECISION (Research Sources)**

**What to Research:**

* CEO/CRO background  
* Budget indicators  
* Organizational structure  
* Previous US experience  
* Technology adoption

**Where to Find in Clay:**

Data Sources:  
→ LinkedIn: CEO/CRO previous companies, education  
→ Claygent: Scrape job postings for budget mentions  
→ BuiltWith: Technology stack (modern vs traditional)  
→ LinkedIn: Check if US experience in background  
→ Company size: Revenue per employee (efficiency indicator)

Clay Workflow:  
1\. LinkedIn: Research CEO/Founder background  
2\. Check: Previous US company experience? (Yes/No)  
3\. BuiltWith: Adopted HubSpot/Salesforce already?  
4\. Claygent: Search job postings for "budget," "investment"

5\. Tag decision readiness: "Ready," "Needs education," "Not ready"

**Personalization Trigger:**

* US experience → "Saw you were VP Sales at \[US Company\] \- bringing that US GTM playbook?"  
* Tech adoption → "Already using HubSpot \- understand the value of proven infrastructure"  
* No US experience → "First time building US GTM \- avoiding the common pitfalls?"

---

## **SPICED SCORING FOR OUTBOUND PRIORITIZATION**

### **PE/VC Firm Scoring Matrix:**

| SPICED Element | 5 Points | 3 Points | 1 Point | Clay Source |
| ----- | ----- | ----- | ----- | ----- |
| **S \- Portfolio Size** | 8-15 companies | 5-7 or 16-20 | \<5 or \>20 | Pitchbook count |
| **S \- Operating Partner** | Hired last 6 months | Has OP \>6 months | No OP | LinkedIn job change |
| **P \- Tech Stack Chaos** | 4+ different CRMs | 2-3 different CRMs | Standardized | BuiltWith aggregation |
| **P \- Hiring Activity** | 5+ sales roles open | 2-4 sales roles | 0-1 roles | LinkedIn Jobs count |
| **I \- Recent Exit** | Exit in last 12 months | Exit 12-24 months | No recent exit | Crunchbase exit data |
| **I \- Fund Status** | Raised fund last 12 months | Fund 1-2 years old | Fund \>3 years | Pitchbook fund data |
| **C \- Recent Acquisition** | Deal last 90 days | Deal 90-180 days | No recent deal | PredictLeads alert |
| **C \- Board Season** | Q4/Q1 annual planning | Mid-year review | No indicators | Calendar \+ LinkedIn |
| **D \- Tech Forward** | 70%+ portcos modern stack | 40-70% | \<40% | BuiltWith analysis |
| **D \- Active LinkedIn** | Posts about portfolio ops | Occasional posts | No posts | LinkedIn activity |

**TOTAL: /50 points**

**Prioritization:**

* **40-50 points** \= 🔥 **TIER 1** \- Reach out immediately, high personalization  
* **25-39 points** \= 🟡 **TIER 2** \- Reach out with education, medium personalization  
* **\<25 points** \= ❌ **TIER 3** \- Nurture list, low priority

---

### **International Company Scoring Matrix:**

| SPICED Element | 5 Points | 3 Points | 1 Point | Clay Source |
| ----- | ----- | ----- | ----- | ----- |
| **S \- US Office** | Opened last 6 months | Open 6-18 months | No office | Crunchbase location |
| **S \- US Employees** | 5+ US employees | 2-4 US employees | 0-1 US employee | LinkedIn filter |
| **P \- Founder Selling** | CEO posting US sales | US team but small | Established US team | LinkedIn posts |
| **P \- Job Openings** | 3+ US sales roles | 1-2 US roles | No openings | LinkedIn Jobs |
| **I \- US Investor** | US lead investor | US co-investor | No US investors | Crunchbase cap table |
| **I \- US Revenue Talk** | Mentioned in press | Mentioned on blog | Not mentioned | Claygent search |
| **C \- US Exec Hire** | Hired last 90 days | Hired 90-180 days | No recent hire | LinkedIn job change |
| **C \- Recent Funding** | Raised last 6 months | Raised 6-12 months | \>12 months | Crunchbase funding |
| **D \- CEO Background** | Previous US company | Visited US frequently | No US experience | LinkedIn history |
| **D \- Tech Stack** | HubSpot/Salesforce adopted | Traditional CRM | No CRM | BuiltWith |

**TOTAL: /50 points**

**Prioritization:**

* **40-50 points** \= 🔥 **TIER 1** \- Reach out immediately, high personalization  
* **25-39 points** \= 🟡 **TIER 2** \- Reach out with education, medium personalization  
* **\<25 points** \= ❌ **TIER 3** \- Nurture list, low priority

---

## **OUTBOUND MESSAGE TEMPLATES BY SPICED**

### **PE/VC Template \- High SPICED Score (45+ points):**

Subject: \[PE Firm\] \+ \[Portfolio Company\] RevOps

\[Operating Partner Name\],

Congrats on closing the \[Portfolio Company\] acquisition last month   
(S \- Recent acquisition trigger). 

I noticed \[Portfolio Company\] is hiring 3 sales roles (P \- Hiring activity)   
and you've got \[Company A\] on Salesforce, \[Company B\] on HubSpot,   
and \[Company C\] with no CRM (P \- Tech chaos).

With 12 portfolio companies and a new fund to deploy (I \- Fund status),   
standardizing RevOps could save your portfolio $600K+ annually while   
accelerating time-to-revenue post-acquisition (I \- Impact).

We help PE firms like \[Similar PE Firm\] build preferred vendor models   
for automated demand gen \- consistent processes, better benchmarking,   
faster onboarding.

Worth 15 minutes before your Q1 board meetings? (C \- Board season)

\[Your Name\]

### **PE/VC Template \- Medium SPICED Score (30-40 points):**

Subject: Portfolio RevOps standardization

\[Operating Partner Name\],

Quick question: When \[Company A\], \[Company B\], and \[Company C\]   
each build their own RevOps from scratch, how do you benchmark   
pipeline performance across the portfolio? (P \- Visibility gap)

We work with PE firms to standardize automated demand generation   
across portfolio companies \- same methodology, better cost, real-time   
visibility.

Similar to your role: \[Brief relevant experience\]

Worth exploring?

\[Your Name\]

### **International Company Template \- High SPICED Score (45+ points):**

Subject: \[Company\] US market entry \- GTM infrastructure

\[CEO Name\],

Saw you hired \[US CRO Name\] as your US Chief Revenue Officer last month   
(C \- Executive hire) and opened your New York office (S \- US office).

With \[US VC\] on your cap table (I \- US investor) and 4 open US sales roles   
(P \- Hiring activity), setting up scalable US demand gen infrastructure   
seems critical.

We help international B2B companies like \[Similar Company \- same country\]   
build their US-focused GTM engine \- from zero to 30-50 qualified US meetings   
per month in 90 days.

Your background at \[Previous Company\] gives you US market experience,   
but your team is still learning the nuances (D \- Background).

Worth 15 minutes to discuss before your board meeting next month? (C \- Board timing)

\[Your Name\]

### **International Company Template \- Medium SPICED Score (30-40 points):**

Subject: \[Country\] → US: GTM playbook

\[CEO Name\],

As a \[Country\]-based B2B company with $\[X\]M revenue (S \- Home success),   
US expansion is likely on your roadmap.

Quick question: If you could compress 12 months of US market trial-and-error   
into 90 days of proven GTM infrastructure, what would that be worth? (I \- Impact)

We specialize in helping international software companies build automated   
US demand gen engines.

Interested in learning how \[Similar Company\] went from zero to 47 US meetings   
in their first quarter?

\[Your Name\]

---

## **CLAY WORKFLOW SUMMARY**

### **Step 1: Import & Filter**

PE/VC: Pitchbook → Filter 5-20 portcos, $100M-$2B AUM, B2B focus

International: Crunchbase → Filter non-US HQ, $2M-$50M revenue, B2B SaaS

### **Step 2: SPICED Enrichment**

For each prospect:  
S \- Portfolio size / US office status  
P \- Tech stack / Hiring activity / Challenges  
I \- Fund status / US investors / Revenue targets  
C \- Recent deals / Executive hires / Events

D \- Operating Partner background / Tech adoption

### **Step 3: Score & Prioritize**

Calculate SPICED score (0-50 points)

Tag: Tier 1 (40-50) / Tier 2 (25-39) / Tier 3 (\<25)

### **Step 4: Personalize**

Use SPICED research to craft specific triggers

Reference 2-3 SPICED elements per message

### **Step 5: Export to Outreach**

Tier 1 → Immediately to Instantly.ai / Smartlead  
Tier 2 → Educational sequence first

Tier 3 → Quarterly nurture campaign

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqwAAAEXCAYAAABoJxYbAAB/DklEQVR4XuydB7gUVba2BQUDoAKCgoComBBUMCdMGDBgThhAHUyYUUQkmBVEx4QJFVEwR9TRa8KAAfAaR9FREb0q6jWLo15npv7/3c7as3t3dZ/uc/ocuvt87/PU01W78q7qqq/WXnutRRIhhBBCCCHKmEXiAiGEEEIIIcoJCVYhhBBCCFHWSLAKIYQQQoiyRoJVCCGEEEKUNRKsQgghhBCirJFgFUIIIYQQZY0EqxBCCCGEKGtSBeu3336bjBgxIhkzZkzy888/x7NrpGPHjskii6Ruut5o6P0JIYQQQoiGIUvl/fTTT078hcPo0aPjxbJguS222MKNS7AKIYQQQohSkaXymjZtmtx2221++oILLvBisF27dsmiiy7q59k4vyzTpEmTZO7cuV6wXnTRRUmLFi2SI444wq+DIN56662Tli1bJq+99povZxsrrriiG99xxx39trfbbrvkpJNOSvr3758stdRSyTnnnOPXOfnkk932KZNgFUIIIYSoTjJUHq4ACL/QDWD+/Pmu7J///GfSpk2bDGFo40OGDHHjCM6vv/7aC9bmzZs7kck4QnXBggXearvCCiu434cffthvq0OHDm68b9++ftvbbLONG+/UqZMTxIy/+eabyaBBg/w+llhiCQlWIYQQQogqJUPlzZs3L0v4/fjjj64MMZtLsNp4LpeAtm3bJuPGjUsGDhzoyj/55BNXjgBdbrnl/Pq5BOtOO+3kxmfPnu3Kr7rqKmcJRqwa8XELIYQQQojqIEPlfffdd074YQ01PvvsMy8GaytYN9xww2TAgAHJuuuum1HeunVrP12IYP3rX//qyi+99FL3u9pqq/2xoX+vL4QQQgghqo8slbfYYosll19+uZ8+/fTTvRjEUhqL1HA8l2Dt0qVLMnz48KRfv36u/Pvvv3fl7KtVq1Z+fdwEoFDBioA2JFiFEEIIIaqTLJX3+++/O/EXDjfccIObN3bs2Kx5xpJLLummX3jhBSdYrSNWvNzSSy/ty3AJwNUATKQyIGRtnVyCddq0aRnbZx0hhBBCCFF9ZAlWoIPVnXfemdxzzz3xrOTDDz9Mbr75ZidsY+6+++7k119/9dMsM2nSJNcRK+Stt95y5TEvvfSS236h0ImLY/ntt9/iWUIIIYQQokpIFaxCCCGEEEKUCxKsQgghhBCirJFgFUIIIYQQZY0EqxBCCCGEKGskWIUQQgghRFkjwSqEEEIIIcoaCVYhhBBCCFHWSLAKIYQQQoiyRoJVCCGEEEKUNRKsQgghhBCirJFgFUIIIYQQZY0EqxBCCCGEKGskWIUQQgghRFkjwSqEEEIIIcoaCVYhhBBCCFHWSLAKIYQQQoiyRoJVCCGEEEKUNVmCddy4cclRRx2VHHfcccntt98ez87itttuS3755Ze4uF7Yb7/94qKKYpNNNomLGhVXXHFFXNSgnH/++XFRBtzLQgghhCg/sgTrpptumjG9+eabJwsWLMgoW1g0lGDt2LFjXOR4//33k0suuSQuzsk///nPZNttt/XTC1uw9u/fv8E+LioRCVYhhBCiPKlRsJ522mnJxx9/7Ma//vrrpGfPnsmKK66YvPHGG67swAMPTL7//ns3jtAbOnRo0qJFi+Too4/224A111wz6dSpU/LXv/7VrR+z/PLLJ0899VSy3XbbuelwX0YoWNOOBetwSJcuXdzv008/7Y6NYcaMGa6M30ceecQf76effurKF1100aRJkybuN+Tqq692ZU2bNk1ee+01V/bVV18lvXr1Stq2bZv89ttvGctDvC0E6/XXX58su+yyyQ477JCx7MCBA5NWrVolY8aMySg3fvrpJ7cfrs+vv/7qyqivkPXXX9+PDxo0KGnZsmWy2267OeFMvduxXHrppW4ZjrlDhw5Jjx49ki+//NKv+8wzzySHH364O55hw4a5srXXXjtp3759MmvWLL8c9UAdM++bb75xZXzgfPLJJ+66vPDCC35Z2GKLLfx43759Xb0PGTIkWOI/cL7UV3i+1M2HH37ojhfatWsXrpIceeSRfvyqq65y9UV9GyuvvLIf53pyHdZYY43k888/d2USrEIIIUR5klew/vjjj0mbNm38+Hrrrefn9enTx/0iIr/77js3jgBAHMG1116b3HXXXW581KhRf6z0/5kyZYoTpzGsyzyI94UohFCwxsfyxRdfJMstt5wv+/nnn51Fcfr06cno0aN9OYIKnn/+eXccdrxLLbWUX6YQCysivXv37n7eMsss47dlpFlYTdghIA899FA3zv5MlHG8J510kl8H2E4o3BGS8MQTT/gysDrZYIMN/EcE1vHOnTu78djCSp0biE4EOITXZ+zYsV74Q1g3uI0YiEeOk3McPHiwLw+xe4tzNKiHPffc009DrvPlOobX3e5N44gjjnC/fITYh8nNN9+cTJgwwY3beQwfPjxD7Nt2JFiFEEKI8iRVsPbr188NiIaRI0e68gMOOMBZNY358+e731Cwtm7d2s9HmJmACIURpAnWcN14X2uttZb7NcH6j3/8I+tYsNQdf/zxTrjCOeeck8ybN88vY9xzzz3uF8Ea+uiG1slCBOu+++7rRSE899xzyY033uinIU2whmB1hlNPPTWjPKwLuOWWW5KXX37ZT99xxx3uN5dg7d27txP9MaFgnTx5sqsDg2u4xx57uPGHHnrIl1Ofhx12mJ8+5phjXH1j6QyZNm2as1jH5xhigvXJJ5+M5mSS63wRrOE1zSVYY8vrGWec4X5D4R1iHw4SrEIIIUR5kipYQ+67777k7rvvduIKK2Q4IBxDwRoKCMpolgaaZkPSBGu4br59AU248XysdAhImrJhhRVW8Ns79thjXVP+qquu6sUoYs0swLDxxhv78UIEq4lN49tvv/Xna9QkWFdffXX3u8QSS2SdTwgWV/tACMklWAHxRvN/KIZDwYoVNBT9YMeD8DRwFQib7U888URX/w8++GDWMSPY43MMCe8tXCKWXHJJ13Qfk+t8EazmngK5BKu5DMSEgnWnnXZKmjVrlnTr1s1Zx0GCVQghhChPahSss2fPdr2rsbTGVjUoRLDGPqs1CdZ8+zLS5gPCFSsqxw1bbrllxvxbb73V/dZVsI4YMSKZM2eOn4dYs2Zoo1DBOmDAgIzyGJrQ77zzTj999tlnu9/QCgkmoi+++OKMcrNwh4IVP9WJEyf6ZTgXc50oRLAi0H///XdfbsTnGGL31k033ZRRHt8fuc43Fqyx5d4Ea/yBZJZjE6yx0MVaDhKsQgghRHmSKlix3DEgFOi4Y+BLOHfuXDduzaiFCFbEIx10EHAIyJoEK4T7Mh/MULDGx/LSSy+5cQTNYost5pdDlJnVFR/Zrbbayo3nE6x0Dkqz8NHMHgp66ob9cV5du3YNlvwP4XnFYs4EK+d12WWXuXHqHetfjFmMX331VWcpNqyj2UUXXeSbwvHpNfGF+DR3B9wkHn/88T9WTP7ohMSx00nK/EShEMEK+AzTOQrrN24IiNj4HEOs7hDLnAdccMEFySmnnBIu5uB833333YzzjQUr1uPw/E2wPvvss8lee+3lxvlgePPNN924CdZ99tnHdbqCM88809ePBKsQQghRnmQJ1pqYOXOm8/2MOxjVBFazBx54wI3nEncxtq9cFHosiM9Jkya5jliFkku8YGUNxSzCF5eJXCDi6PhTE7ac+eCmgXX4nXfeySij0xI+n4jGEKIeYMk0UW/gn2piEai/F198MViiOBDAuAcUy+uvv+78aO1jJw0+dOLzjcl1/kybNT0NROzUqVNrvHeEEEIIsfApWrDWhtCSiSi77rrrgrlCCCGEEELkpkEEK9DsShMylk4hhBBCCCEKpcEEqxBCCCGEELVBglUIIYQQQpQ1EqxCCCGEEKKskWAVQgghhBBljQSrEEIIIYQoayRYhRBCCCFEWSPBKoQQQgghyhoJViFE0ShDmBBCiIZEglUIUTQ9e/ZMll566WSRRRZxQ/v27ZNDDjkkefnll5N//etf8eJCCCFEnUgVrCuttFIyePDguLhBWG211eKieuXXX39Ndtlll7g42XTTTeOionn99deTG264IS4uO7777rvksccei4uFyMm6664bFyU//PBDcuGFFyZbbbWVF7IMe+yxR3LNNdckH330UbyKEEIIURBZgnX27NlxUb3Ttm1bPy7B2jDcdNNNyWuvvRYXC1EQaYK1UD7++ONk2LBhbhuhsB00aFBy++23uw8oIYQQIiRDsD744IPJoosu6obLLrvMlX311VdJr169km222Sb57bff/LJrrLFG0qNHj+Tcc8/1ZcZ5552XLLvsshnrnHbaacn8+fP9Mk888UTy+++/u33xsuL3l19+cYIVMcX6ffv2zfCVu+uuu5IOHTq4/RpPPfVU8vDDD/vp9ddf3/1+//33yZAhQ5KNN944adOmTTJ9+nS/zF//+tekY8eOydprr518+eWXNQrWc845xzV/Hnzwwb5s3rx5rg44zokTJ/ryf/zjH0mfPn3cPhGEaYL1zTff9PvnOFnHGDhwYNKqVavkm2++cdN2Htdff33WeUCXLl3cdsLlP/nkk2TFFVdMXnjhBVe25557JksuuWQyY8YMN73TTjslTZs29XWOgDj77LP9Nrfffnt3viNHjvRlHO9nn32WdOvWLencuXPy6aef+nmi8VEXwZqLb7/91glWhOsKK6zghSz7Ov3005Onn35avrNCCNFIybKwzpw5048jfrp37+6nl1lmGf/CQOykse222yZz5szx07bOKaecknz++ee+/PHHH/fjoYW1SZMmXgwtWLAg6dSpkxs///zzk8mTJ/vltthiC/eL8J02bZovX2+99dwvVhr2bSCyjPBle/TRR+cVrDvssIMTp2DiHXFIs6cRCjvOBastsJ9YsPJSDveP64UJVkShrduuXTtXb3YeJkjD82B5I1w+dOdo3bq13/7mm2/utxNaWDm/0aNHu3Hq2Xj77bd9PSPMx48f7+cttdRSflw0PupDsObj3XffdR/R/fr180KWZxD/z0suuST5+9//Hq8ihBCiisgrWPfdd18nWo3nnnsuufHGG914165dfXkIFs0QW6dQwRq7BGBlBayLIbaffIL1gAMO8OU0QRoffvihH8/nEoDQ6927d0b5WmutlTENWDTh66+/dnVmpLkEYGkO94+Fk/1Qduqpp/pyzumRRx7JeR75ls/FPffc462suQRrrnpG+IaYJVs0ThpasOaCDl7PPvtsst9++2V1AjvrrLPUCUwIIaqEvIJ1zTXXDOb8YR2kuQ5WWWWVjHlGKKLA1qmtYB06dKj7jQXSiBEj3G8+wXrQQQf58lGjRrlf3BAQiUY+wcrxNmvWzFkTwwGuvPJK16yOcF955ZVdGRbJ0AqZJlhpjg/3b4IVd4wlllgiYz8I/VznkW/5EJr7eXlTx1hkn3/+eVeeS7DmqudcQlY0TspFsObj1VdfzeoExv/EOoHNnTs3XkUIIUSZklewIlbC5n0EkVnocglWa8I3bB38WsNtPfDAA348FKzxdk00x4IJ303AghL6kNryuYQe2DkAgjGXYIX4eIBm89BKauP464a+r2k+rNddd13G/n/++WcnWBH2AwYMCJb8g1znkW9546effnL+q8att97qBeukSZNSBWuueo7LJVgbN5UgWAulpk5g/NeEEEIsXPIKVmjZsqV7oCN0QjeANCEHV111VXLEEUe48XAdOjdhPcXPEksknXcMxBCWT8AaaD6hV199tYvtCFgrsf6xPk3wWDgNjhHhd9FFFzlfTsgl9KBFixbOH5V1iCeZT7BiiTGr8gcffOB8SN955x3ny8qxvPjiixluA2xr6tSpbpzOULFghXD/q666qvcxpVnTOruxTV6U+c6D5RGl5rpgy4dghcUnmOWwNJk1+qWXXvLW01CwUs80sQK+sFbPuQTrhAkTkkcffTRjnqh+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EPvkk0/ScqMWVgSc6lLfIK6nvh1//PFl2bJly2rcC2DRokXFnXfemZY///zzsg37779/sW7durSscwQI96rrJoLAluhE4H/88cdpmWslctBBB6VPRHu8brbeeuv0ecMNNxQLFiwoy7k+jDHGGNP9aViw5sPKu+22W7KIIhIiEqzDhg1LIlV/WOQg1v/HH38ksZH7YuaCFRBDixcvLp544olkRWttqBtLp2iPS4D6hGCKfUC8zZ07t2bdKFjHjh1b893LL79cLmPpnThxYhKsZ5999r8r/R+yvgKClTqnTp2ahBnC96yzzgpr/0ujgjUeJ/WNfVx//fWVfcOiDfFciWiBryKeI5ClWXDd5OQuAXvttVf6zPcfBWtE5zsXuFHUGmOMMab70iHBikV12rRpNeUSrPvss09NuchFCPz222/JEjpmzJj0fy5YseIq+gCWuLYEa7TIdkSwtiXOoDME66WXXpo+6T9D44B1GmGGdfKCCy6Iq5d0RLAiUhnar+Kkk05K++Wc5ODuUMU555xTXHvttWlZ5wjaI1hxUYD8WmlLsObrW7AaY4wxmwYtBGu0Un3zzTetCta//vqrFBFCgrWesImiAnEWh9gleHLBunLlyprltgQrQ+sCK257BStCqK2QV50hWBcuXFj8+uuvNW4J+F9KmOGrKRCSGpLviGClHQy/V4F1fNKkSZU+u/vtt1/NOZNYlAUddI6gEcE6atSochmxq2suF6BtCdbYBpg+fXrN/8YYY4zpnrQQrAxP41OJoMGntDXBCohBhoABS6EE60cffZSsrAxxM0FKltgoQpYsWVIcddRRaZl18LUUcb299947iaR333031clEsFyIRe65557iyiuvTMt77rlnpWDFz/Xbb79Ny/UEKyIS4c0n/WDfHJdIewQrfWPoHLBMii233DIJNvaHlRghCzfddFNx++23J/E8YsSIZJGGW265pdw2kvetSrDCqaeeWtk3xHI+vC6wunPu2YZJV7NmzUrl+OsyGSqeI2hEsA4dOjT5vfJywbHhEzZUsK5YsaKc4EdbJGDvv//+5HtrjDHGmO5JC8EKCJb33nsvL64Lk2mefPLJvDjB0DbCtB4IHwSvJukIxNOcOXPSMgIaaywW30ZBIGr7esyfP78Udq2BuGTCVGcgCytC8dFHH20hgDleVYkOWL+qDfX62JG+ff3118XMmTNrynKY3KTJdoJ2b8g5ivBCQps7Cm3iuOLzfM011+RfG2OMMaYbUilYTddR5RLQbOShrboLWHexchNaDHeHPGSYMcYYY7onFqymhtas4cYYY4wx/wUWrMYYY4wxpqmxYDXGGGOMMU2NBasxxhhjjGlqLFiNMcYYY0xTY8FqjDHGGGOaGgtWY4wxxhjT1FiwGmOMMcaYpsaC1RhjjDHGNDX/A1o99eR7nDRgAAAAAElFTkSuQmCC>