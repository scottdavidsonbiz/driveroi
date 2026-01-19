# SOP: Clay to Instantly Campaign Push

**Purpose:** Push enriched leads from Clay directly into Instantly campaigns for email outreach.

**Scope:** After email enrichment is complete, before campaign launch.

**Owner:** [Team Member Name]

**Last Updated:** January 19, 2026

---

## Prerequisites

- [ ] Clay table with enriched leads (must have `FinalEmail` column populated)
- [ ] Personalization column (e.g., `RandomCompanyName` for lookalike references)
- [ ] Instantly campaign already created (see: Instantly Sequence Setup SOP)
- [ ] Clay-Instantly integration connected

---

## Procedure

### Step 1: Add Instantly Integration Column

1. In your Clay table, add a new column
2. Search for **"Add Lead to Campaign"** (Instantly integration)
3. Select your Instantly workspace

---

### Step 2: Select the Campaign

1. Click the campaign dropdown
2. Find your target campaign

> **Note:** If you just created the campaign, you may need to **Refresh Fields** for it to appear in the dropdown.

3. Select the campaign you're working on

---

### Step 3: Map Lead Fields

Map the following fields from your Clay table:

| Instantly Field | Clay Column |
|-----------------|-------------|
| **Email** | `FinalEmail` (merged email column) |
| **First Name** | `First Name` |
| **Last Name** | `Last Name` |
| **Personalization** | `RandomCompanyName` (or your lookalike/personalization column) |

> **Important:** The personalization field name must match exactly what you used in your Instantly email templates (e.g., `{{personalization}}`).

---

### Step 4: Set Run Conditions

1. Click **Run Settings** or the settings icon
2. Enable **Auto-update** if you want new rows to automatically push
3. Set conditions so leads only push when ready:

**Required conditions:**
- `RandomCompanyName` **is not empty**
- `FinalEmail` **is not empty**

To set conditions:
1. Type: `/RandomCompanyName is not empty`
2. Click **Generate formula**
3. Add second condition: `/FinalEmail is not empty`

4. Verify the formula output:
   - Rows with both fields populated = **Yes** (will run)
   - Rows missing either field = **No** (will skip)

---

### Step 5: Run the Integration

1. **Save** the column configuration
2. Click **Run** or **Generate going forward**
3. Watch the progress - leads will be added to your Instantly campaign

---

## Post-Push Checklist

- [ ] Verified campaign selection is correct
- [ ] All field mappings confirmed
- [ ] Run conditions prevent incomplete leads from pushing
- [ ] Sample of leads verified in Instantly
- [ ] Campaign not accidentally launched yet

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Campaign not in dropdown | Refresh fields; ensure campaign exists in Instantly |
| Leads not pushing | Check run conditions; verify email/personalization columns aren't empty |
| Wrong personalization | Verify column name matches Instantly template variable exactly |
| Duplicate leads in Instantly | Check if auto-update is causing re-pushes; Instantly should dedupe by email |

---

## Best Practices

- **Always preview in Instantly** after pushing leads before launching
- **Don't launch campaigns immediately** - verify the merge fields look correct
- **Use conditions** to prevent pushing incomplete leads
- **Test with 5-10 leads first** before running on full table

---

## Related SOPs

- [ ] Clay Email Finding Waterfall
- [ ] Instantly Sequence Setup

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-19 | [Name] | Initial version from Loom recording |
