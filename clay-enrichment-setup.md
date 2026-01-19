# Clay Enrichment Setup for M&A Deals

## What n8n Sends to Clay

Your n8n workflow sends these fields:
- `buyer_name` - Company doing the acquisition
- `seller_name` - Company being acquired
- `deal_date` - Announcement date
- `deal_size` - "$25M" or "Not disclosed"
- `press_release_title` - Full headline
- `press_release_url` - Link to announcement
- `description` - Brief summary
- `scraped_at` - Timestamp

---

## Clay Enrichment Workflow

### Step 1: Find Company Domains

**Column: Buyer Domain**
- **Enrichment:** Clearbit → "Find Company" or Apollo → "Company Search"
- **Input:** `{{ buyer_name }}`
- **Get:** Domain, Website
- **Why:** Converts "UserTesting" → "usertesting.com"

**Column: Seller Domain**
- **Enrichment:** Clearbit → "Find Company" or Apollo → "Company Search"
- **Input:** `{{ seller_name }}`
- **Get:** Domain, Website

---

### Step 2: Get Company Details (Buyer)

**Column: Buyer Company Data**
- **Enrichment:** Clearbit → "Enrich Company"
- **Input:** `{{ buyer_domain }}`
- **Get:**
  - Employee count
  - Estimated revenue
  - Industry
  - Founded year
  - Description
  - Tags (Public/Private)

---

### Step 3: Get Company Details (Seller)

**Column: Seller Company Data**
- **Enrichment:** Clearbit → "Enrich Company"
- **Input:** `{{ seller_domain }}`
- **Get:**
  - Employee count
  - Estimated revenue
  - Industry

---

### Step 4: Check if Public Company (Buyer)

**Column: Is Buyer Public?**
- **Enrichment:** Clearbit Company Data → Extract "type" field
- **Formula:**
  ```
  IF(
    OR(
      CONTAINS({{ buyer_company_data.tags }}, "public"),
      CONTAINS({{ buyer_company_data.type }}, "public")
    ),
    "Public",
    "Private"
  )
  ```

**Alternative:** LinkedIn Company Enrichment
- **Enrichment:** LinkedIn → "Company Lookup"
- **Input:** `{{ buyer_domain }}`
- **Get:** Company Type (Public/Private)

---

### Step 5: Filter Private Companies Only

**Filter Column: Deal Qualified?**
- **Formula:**
  ```
  IF(
    AND(
      {{ is_buyer_public }} = "Private",
      {{ buyer_revenue }} < 100000000,
      {{ buyer_employees }} > 10
    ),
    "Qualified",
    "Skip"
  )
  ```

**Filter criteria:**
- Buyer is private
- Buyer revenue < $100M (if available)
- Buyer has > 10 employees (filters out solopreneurs)

---

### Step 6: Additional Enrichments (Optional)

**Funding Data (Buyer)**
- **Enrichment:** Crunchbase → "Organization Lookup"
- **Input:** `{{ buyer_domain }}`
- **Get:**
  - Total funding raised
  - Latest funding round
  - Funding stage (Series A/B/C)
  - Investors

**LinkedIn Company Details**
- **Enrichment:** LinkedIn → "Company Info"
- **Input:** `{{ buyer_domain }}`
- **Get:**
  - Follower count
  - Specialties
  - Company page URL

**People/Contacts (for outreach)**
- **Enrichment:** Apollo → "Find People at Company"
- **Input:** `{{ buyer_domain }}`
- **Filters:**
  - Job titles: CEO, VP Corp Dev, M&A, Corporate Development
- **Get:**
  - Name, Title, Email, LinkedIn URL

---

## Complete Clay Table Structure

| Column | Source | Purpose |
|--------|--------|---------|
| buyer_name | n8n webhook | Raw company name |
| seller_name | n8n webhook | Raw company name |
| buyer_domain | Clearbit Find Company | Convert name → domain |
| seller_domain | Clearbit Find Company | Convert name → domain |
| buyer_company_data | Clearbit Enrich | Revenue, employees, industry |
| seller_company_data | Clearbit Enrich | Company details |
| is_buyer_public | Formula | Public/Private check |
| buyer_revenue | Extract from Clearbit | Revenue estimate |
| buyer_employees | Extract from Clearbit | Employee count |
| deal_qualified | Formula | Qualified = Private + Sub-$100M |
| buyer_funding | Crunchbase | Funding data |
| deal_date | n8n webhook | When announced |
| deal_size | n8n webhook | Deal value |
| press_release_url | n8n webhook | Link to announcement |

---

## Filter Settings in Clay

**View 1: All Deals**
- No filter, see everything

**View 2: Qualified Private Deals**
- Filter: `deal_qualified = "Qualified"`
- This is your target list

**View 3: Sub-$50M Buyers**
- Filter: `buyer_revenue < 50000000 AND is_buyer_public = "Private"`
- Even more targeted

---

## Waterfall Enrichment Strategy (Save Credits)

Instead of enriching ALL fields for ALL companies, use Clay's waterfall feature:

### Domain Lookup Waterfall
1. **Try:** Clearbit Find Company
2. **If fails:** Apollo Company Search
3. **If fails:** Hunter Domain Search
4. **If fails:** Skip (bad data from n8n)

### Company Data Waterfall
1. **Try:** Clearbit Enrich Company (most accurate)
2. **If fails:** Apollo Company Data
3. **If fails:** LinkedIn Company Info
4. **If fails:** Mark as "Data unavailable"

This saves credits by only using backup enrichments when primary fails.

---

## Expected Costs (Clay Credits)

**Per deal (both buyer + seller):**
- Domain lookup: 2 credits (1 per company)
- Company enrichment: 2 credits (1 per company)
- LinkedIn enrichment: 2 credits (optional)
- Crunchbase enrichment: 2 credits (optional)

**Total: 4-8 credits per deal**

**Monthly estimate:**
- 10 deals/day from RSS = 300 deals/month
- 300 deals × 4 credits = **1,200 credits/month**
- 300 deals × 8 credits (with extras) = **2,400 credits/month**

Clay pricing: ~$349/month for 3,000 credits

---

## Pro Tips

1. **Don't enrich sellers** unless you need to (saves 50% of credits)
   - Focus on buyers (your potential customers)

2. **Use filters BEFORE enrichments**
   - Filter out obvious public companies by name first
   - Example: If `buyer_name` contains "Inc." or ends with "PLC", likely public

3. **Batch enrich weekly, not daily**
   - Let deals accumulate for a week
   - Enrich 70 deals at once instead of 10/day
   - Clay credits don't expire

4. **Export qualified deals to CRM**
   - Once filtered to "Qualified", export to Airtable/HubSpot/etc.
   - Build outbound list from there

---

## Common Issues & Fixes

**Issue: "Domain not found"**
- **Fix:** Company name from press release was too generic
- **Solution:** Manually Google the company, add domain to Clay

**Issue: "Private/Public classification wrong"**
- **Fix:** Clearbit data is outdated
- **Solution:** Check LinkedIn Company page manually, override in Clay

**Issue: "Too many public companies"**
- **Fix:** Your RSS feed isn't filtered enough
- **Solution:** Adjust RSS feed filters or add name-based filters in Clay first

---

## Next Steps

1. **Import n8n workflow** (`businesswire-ma-final.json`)
2. **Test workflow** - should get 5-10 deals in Clay
3. **Set up enrichments** following this guide
4. **Test on 5 deals** before running on all
5. **Activate n8n daily schedule**
6. **Monitor Clay table weekly**
