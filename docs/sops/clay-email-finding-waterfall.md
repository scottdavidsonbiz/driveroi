# SOP: Clay Email Finding Waterfall

**Purpose:** Find verified email addresses for leads using a waterfall approach in Clay - starting with AnyMailFinder API, then falling back to Clay's Find People enrichment.

**Scope:** Lead enrichment in Clay tables before campaign launch.

**Owner:** [Team Member Name]

**Last Updated:** January 20, 2026

**Loom:** https://www.loom.com/share/ad34dcd82c704ef3a31fba095ff4e9ee
---

## Prerequisites

- [ ] Clay account access
- [ ] AnyMailFinder account with API key
- [ ] Lead table with: First Name, Last Name, Full Name, Company Domain
- [ ] Company LinkedIn URL (optional, improves Find People results)

---

## Procedure

### Step 1: Set Up AnyMailFinder API Column

1. In your Clay table, add a new **HTTP API** column
2. Name it `Email API` or similar
3. Configure the API call:
   - Delete any existing fields (use X to remove)
   - Use backslash (`/`) to link fields:
     - **Domain:** Link to company domain column
     - **Company Name:** Link to company name column
     - **First Name:** Link to first name column
     - **Last Name:** Link to last name column
     - **Full Name:** Link to full name column

4. Add Authorization header:
   - Header name: `authorization` (lowercase)
   - Value: Your AnyMailFinder API key

> **Getting your API key:** Log into AnyMailFinder → API section → Click copy button

5. **Save** the column configuration
6. **Run on 10 rows** to test

---

### Step 2: Extract Valid Emails

1. Check the API response:
   - `StatusCode 200` = successful call
   - Look for `valid` emails vs `risky` emails

2. Add a new **Formula** column named `ValidEmail`
3. Extract only valid emails from the API response:
   - Map to the valid email field from AnyMailFinder response

4. Delete the raw API response column (right-click → Delete) to keep table clean

---

### Step 3: Set Up Find People Fallback

For leads where AnyMailFinder couldn't find an email:

1. Add Clay's **Find People** enrichment column
2. Configure the inputs:
   - **Full Name:** Link to full name column
   - **Company Domain:** Link to company domain column
   - **Work Email:** Leave blank (we're trying to find it)
   - **Social Profile:** Link to their LinkedIn profile (if available)
   - **Company LinkedIn:** Link to company LinkedIn (if available, otherwise leave blank)

3. Click **Run Settings**
4. Enable **Use AI**
5. Set condition: Only run if `ValidEmail` **is empty**
   - Type: `/ValidEmail is empty`
   - Click "Generate formula"
   - Verify the condition shows correct rows (empty = true, has email = false)

6. **Save** and **Run**

---

### Step 4: Merge Email Columns

1. Add a **Merge Columns** enrichment
2. Name it `FinalEmail`
3. Set priority order:
   - **First:** `ValidEmail` (from AnyMailFinder)
   - **Second:** `WorkEmail` (from Find People)

4. **Save** - this creates a single column with the best available email

> **Note:** Some blanks are expected. Not every lead will have a findable email.

---

## Post-Enrichment Checklist

- [ ] AnyMailFinder API configured and tested
- [ ] ValidEmail column extracting only verified emails
- [ ] Find People fallback running on empty rows only
- [ ] FinalEmail column merging both sources
- [ ] Reviewed sample of results for accuracy

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API returns errors | Check API key is correct and has credits |
| No emails found | Verify domain and name fields are populated correctly |
| Find People not running | Check the "is empty" condition is set correctly |
| Duplicate enrichment spend | Ensure condition prevents re-running on found emails |

---

## Cost Optimization Tips

- Always run AnyMailFinder first (typically cheaper)
- Use conditions to prevent running Find People on already-found emails
- Test on 10 rows before running full table
- Delete unused API response columns to reduce clutter

---

## Related SOPs

- [ ] Clay to Instantly Campaign Push
- [ ] Instantly Sequence Setup

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-19 | [Name] | Initial version from Loom recording |
