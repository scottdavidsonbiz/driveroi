# Clay M&A Enrichment (Simplified Workflow)

## What n8n Sends You

Raw RSS feed data:
- `title` - Full press release headline
- `link` - URL to press release
- `pub_date` - When it was published
- `description` - Brief summary
- `content` - Full RSS content (if available)
- `creator` - Publisher
- `categories` - RSS categories
- `scraped_at` - Timestamp

**NO pre-processing** - you'll do all the extraction and filtering in Clay.

---

## Clay Enrichment Steps

### Step 1: Extract Company Names with AI
**Column: "Parse Deal Info"**
- **Enrichment:** ChatGPT / Claude
- **Prompt:**
  ```
  Analyze this M&A press release title and description:

  Title: {{ title }}
  Description: {{ description }}

  Extract:
  1. Buyer company name (acquiring company)
  2. Seller company name (company being acquired)
  3. Is this actually an acquisition? (yes/no)

  Return JSON:
  {
    "buyer": "Company Name",
    "seller": "Company Name",
    "is_acquisition": true/false
  }
  ```
- **Parse response as JSON**

---

### Step 2: Filter Actual Acquisitions
**Filter Column: "Is Valid Acquisition?"**
- **Filter:** `{{ parse_deal_info.is_acquisition }} = true`
- This removes press releases that aren't actually acquisitions

---

### Step 3: Get Buyer Domain
**Column: "Buyer Domain"**
- **Enrichment:** Clearbit → "Find Company"
- **Input:** `{{ parse_deal_info.buyer }}`
- **Output:** Domain, Website

**Waterfall option** (save credits):
1. Try Clearbit
2. If fails, try Apollo Company Search
3. If fails, try Hunter Domain Search

---

### Step 4: Enrich Buyer Company Data
**Column: "Buyer Company Info"**
- **Enrichment:** Clearbit → "Enrich Company"
- **Input:** `{{ buyer_domain }}`
- **Get:**
  - Employee count
  - Revenue estimate
  - Industry
  - Type (public/private)
  - Founded year
  - Description

---

### Step 5: Filter for Private Companies Only
**Filter Column: "Is Private?"**
- **Filter:** `{{ buyer_company_info.type }} = "private"`
- OR: `NOT({{ buyer_company_info.type }} CONTAINS "public")`

**Additional filters** (optional):
- Revenue < $100M: `{{ buyer_company_info.metrics.annual_revenue }} < 100000000`
- Employees 10-500: `{{ buyer_company_info.metrics.employees }} > 10 AND < 500`

---

### Step 6: Extract Deal Size (Optional)
**Column: "Deal Value"**
- **Enrichment:** ChatGPT/Claude
- **Prompt:**
  ```
  Extract the deal size from this press release:
  Title: {{ title }}
  Description: {{ description }}

  Return the deal value in format "$25M" or "$1.2B"
  If not disclosed, return "Not disclosed"
  ```

---

### Step 7: Get Seller Domain (Optional)
**Column: "Seller Domain"**
- Same as Step 3, but using `{{ parse_deal_info.seller }}`
- Only needed if you want to enrich seller data

---

## Complete Clay Table Structure

| Column | Type | Purpose |
|--------|------|---------|
| title | from n8n | Raw press release title |
| link | from n8n | URL to announcement |
| pub_date | from n8n | Date announced |
| description | from n8n | Summary |
| parse_deal_info | AI Enrichment | Extract buyer/seller/validation |
| is_valid_acquisition | Filter | TRUE if actually an acquisition |
| buyer_domain | Clearbit | Convert name → domain |
| buyer_company_info | Clearbit | Revenue, employees, public/private |
| is_private | Filter | TRUE if private company |
| deal_value | AI Enrichment | Extracted deal size |

---

## Expected Costs (Clay Credits)

**Per deal that passes all filters:**
- AI extraction (Step 1): 1 credit
- Domain lookup (Step 3): 1 credit
- Company enrichment (Step 4): 1 credit
- Deal size extraction (Step 6): 1 credit (optional)

**Total: 3-4 credits per qualified deal**

**Monthly estimate:**
- 10 deals/day from RSS = 300 deals/month
- If 50% are actual acquisitions = 150 deals
- If 30% are private companies = 45 qualified deals
- 45 × 4 credits = **180 credits/month**

Much cheaper than enriching everything!

---

## Clay Views/Filters

**View 1: All RSS Items**
- No filter - see everything coming in

**View 2: Valid Acquisitions**
- Filter: `is_valid_acquisition = TRUE`
- See which ones AI identified as real acquisitions

**View 3: Private Company Deals (Your Target List)**
- Filter: `is_valid_acquisition = TRUE AND is_private = TRUE`
- This is your qualified outreach list

**View 4: Sub-$100M Buyers**
- Filter: `is_private = TRUE AND buyer_company_info.metrics.annual_revenue < 100000000`
- Even more targeted

---

## Pro Tips

1. **Use AI for parsing first** - It's flexible and handles all title variations
2. **Filter early** - Remove non-acquisitions before enriching domains
3. **Waterfall enrichments** - Try Clearbit first, fall back to Apollo/Hunter
4. **Don't enrich sellers** - Save 50% credits by only enriching buyers
5. **Batch process** - Let deals accumulate, then enrich weekly

---

## Troubleshooting

**Issue: AI can't extract buyer/seller**
- **Fix:** Press release title too vague - AI will return `is_acquisition: false`

**Issue: Domain not found**
- **Fix:** Company name was generic or wrong - use waterfall enrichments

**Issue: Too many public companies**
- **Fix:** Add additional filter in Step 5 for employee count or revenue

---

## Next Steps

1. Import `businesswire-ma-ultra-simple.json` into n8n
2. Test workflow - run manually to send 10 deals to Clay
3. Set up Clay columns following this guide
4. Test AI extraction on 5 deals first
5. Once working, activate n8n daily schedule
6. Monitor Clay table weekly
