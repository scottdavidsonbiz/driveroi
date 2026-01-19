# SOP: Instantly Email Sequence Setup

**Purpose:** Create email sequences in Instantly with proper variables, variants, and timing for cold outreach campaigns.

**Scope:** Setting up new campaign sequences before pushing leads from Clay.

**Owner:** [Team Member Name]

**Last Updated:** January 19, 2026

---

## Prerequisites

- [ ] Instantly account access
- [ ] Email copy drafted (Step 1 + follow-ups)
- [ ] Warmed-up email accounts tagged for this client (see: MailPool Client Email Setup SOP)
- [ ] Personalization strategy defined (e.g., lookalike companies)

---

## Email Copy Guidelines

Before setting up in Instantly, ensure your copy follows these principles:

| Guideline | Why |
|-----------|-----|
| **Very few words** | Higher deliverability, easier to read on mobile |
| **All lowercase subject lines** | Feels personal, not marketing |
| **No em dashes (—)** | AI giveaway - remove these |
| **2-3 email steps** | Standard sequence length |
| **Include specific numbers** | "Saved $290K" > "saved thousands" |

---

## Procedure

### Step 1: Create the Campaign

1. Log into Instantly
2. Navigate to **Campaigns**
3. Click **Create Campaign**
4. Name it clearly: `[Client] - [ICP] - [Date]`
   - Example: `WithCoverage - Restaurant CFOs - Jan 2026`

---

### Step 2: Set Up Email Step 1 (Initial Outreach)

1. Click **Add Step** → **Email**
2. Add your subject line

#### Adding Variables

**For subject line variables:**
- Click the **lightning bolt icon** in the subject field
- Select the variable (e.g., `first_name`)

**For body variables:**
- Click the **lightning bolt icon** in the body field
- Select the variable

> **Important:** Instantly adds a space after variables. Delete the extra space if it creates awkward formatting.

3. Write your email body with variables:
   ```
   hey {{first_name}}

   we've helped companies like {{personalization}} save thousands on insurance without changing coverage.

   we're sequoia-backed and work on flat fees with no commission.

   worth a quick call?
   ```

4. Click **Save**

---

### Step 3: Add Email Variants (A/B Testing)

1. With Step 1 selected, click **Add Variant**
2. Write an alternative version of Email 1
3. Repeat to create 2-4 variants total

> **How variants work:** If you're sending 40 emails, Instantly splits evenly (10 to each variant). This helps identify which messaging resonates.

**Variant ideas:**
- Different subject lines
- Different opening hooks
- Different social proof examples
- Different CTAs

4. **Save** each variant

---

### Step 4: Set Up Email Step 2 (Follow-up)

1. Click **Add Step** → **Email**
2. Check **"Use previous subject"** to keep the thread
3. Write a shorter follow-up:
   ```
   {{first_name}} -

   just want to make sure this doesn't get buried.

   we've helped companies like {{personalization}} and would love to do the same for you.

   worth 15 minutes?
   ```

4. **Save**

---

### Step 5: Set Up Email Step 3 (Breakup)

1. Click **Add Step** → **Email**
2. Check **"Use previous subject"**
3. Write a breakup email (short, gives them an out):
   ```
   hey {{first_name}} -

   i'll assume the timing isn't right.

   feel free to reach out if things change.
   ```

4. **Save**

---

### Step 6: Set Timing Between Steps

1. Click on the connection between Step 1 and Step 2
2. Set **Wait days:** `3`
3. Click on the connection between Step 2 and Step 3
4. Set **Wait days:** `3`

> **Recommended timing:** 3 days between each step. Adjust based on urgency and audience.

---

### Step 7: Preview and Test

1. Click **Preview**
2. Select a sample lead (or click through sample data)
3. Verify for each email:
   - [ ] Variables are populating correctly
   - [ ] Spacing looks correct (no weird gaps)
   - [ ] No AI-sounding language (em dashes, etc.)
   - [ ] Tone is consistent across steps

4. **Fix any issues** - common problems:
   - Extra spaces around variables
   - Weird line breaks from copy/paste
   - Missing personalization

---

### Step 8: Configure Send Settings

1. Go to campaign **Settings**
2. Set daily send limit (start conservative: 30/day per account)
3. Select email accounts (use client tag from MailPool setup)
4. Set sending schedule (business hours in recipient timezone)

---

### Step 9: Publish (But Don't Launch Yet)

1. Click **Publish** to save the campaign
2. **Do NOT click Launch** until:
   - [ ] Leads are pushed from Clay
   - [ ] Preview shows correct personalization
   - [ ] Client has approved copy (if applicable)

---

## Post-Setup Checklist

- [ ] Campaign created and named clearly
- [ ] All email steps written with variables
- [ ] Variants created for Step 1
- [ ] Timing set between steps (3 days)
- [ ] Preview checked for all steps
- [ ] Send settings configured
- [ ] Campaign published (not launched)
- [ ] Ready for Clay lead push

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Variables showing as `{{first_name}}` | Check if leads have that field populated |
| Weird spacing in emails | Edit and remove extra spaces/line breaks |
| Personalization blank | Verify Clay column name matches Instantly variable |
| Preview not loading | Refresh page; ensure at least one lead is in campaign |

---

## Related SOPs

- [ ] MailPool Client Email Setup
- [ ] Clay to Instantly Campaign Push
- [ ] Clay Email Finding Waterfall

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-19 | [Name] | Initial version from Loom recording |
