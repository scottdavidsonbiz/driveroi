# SOP: Clay Lead Deduplication

**Purpose:** Check leads against your database before enrichment to avoid duplicate spend and keep your lead database clean.

**Scope:** Any Clay table before running paid enrichments (AnyMailFinder, Find People, etc.)

**Owner:** [Team Member Name]

**Last Updated:** January 20, 2026

---

## Prerequisites

- [ ] DriveROI Ops app running (local or deployed)
- [ ] Supabase database with leads table created
- [ ] Clay table with email column populated
- [ ] API endpoint URL (e.g., `https://your-app.vercel.app` or `http://localhost:3000`)

---

## Procedure

### Step 1: Add Dedup Check Column

1. In your Clay table, add a new **HTTP API** column
2. Name it `DedupCheck`
3. Configure the request:
   - **Method:** POST
   - **URL:** `{{your-api-url}}/api/leads/check`
   - **Headers:**
     - `Content-Type`: `application/json`
   - **Body (use what you have available):**

     **Option A: LinkedIn URL (most reliable)**
     ```json
     {
       "linkedin_url": "{{linkedin_url}}"
     }
     ```

     **Option B: Name + Domain**
     ```json
     {
       "first_name": "{{first_name}}",
       "last_name": "{{last_name}}",
       "domain": "{{domain}}"
     }
     ```

     **Option C: Full Name + Company**
     ```json
     {
       "full_name": "{{full_name}}",
       "company": "{{company}}"
     }
     ```

4. Map each field to your table columns using `/`

5. **Save** and **Run on 5 rows** to test

---

### Step 2: Extract the Exists Flag

1. Add a **Formula** column named `AlreadyExists`
2. Extract the `exists` field from the API response:
   ```
   /DedupCheck.exists
   ```
3. This will return `true` or `false` for each row

---

### Step 3: Set Conditional Enrichment

For your enrichment columns (AnyMailFinder, Find People, etc.):

1. Click on the enrichment column settings
2. Click **Run Settings**
3. Add a condition: **Only run if** `AlreadyExists` **equals** `false`
   - Type: `/AlreadyExists equals false`
   - Or use: `/AlreadyExists is false`
4. **Save**

This ensures you only spend credits on new leads.

---

### Step 4: Push Enriched Leads to Database

After enrichment completes, push the new leads back to your database:

1. Add another **HTTP API** column named `SaveLead`
2. Configure the request:
   - **Method:** POST
   - **URL:** `{{your-api-url}}/api/leads`
   - **Headers:**
     - `Content-Type`: `application/json`
   - **Body:**
     ```json
     {
       "email": "{{email}}",
       "first_name": "{{first_name}}",
       "last_name": "{{last_name}}",
       "company": "{{company}}",
       "domain": "{{domain}}",
       "title": "{{title}}",
       "linkedin_url": "{{linkedin_url}}",
       "source": "clay"
     }
     ```

3. Map each field to your table columns using `/`

4. Set **Run Settings** condition: Only run if `AlreadyExists` **equals** `false`

5. **Save** and **Run**

---

## API Reference

### Check Endpoint

The check endpoint supports multiple lookup methods. It will use the first available method based on what you provide.

**Priority order:** email → linkedin_url → name+domain → domain only

```
POST /api/leads/check
Content-Type: application/json
```

**Method 1: By LinkedIn URL (recommended before email enrichment)**
```json
// Request
{ "linkedin_url": "https://www.linkedin.com/in/johndoe" }

// Response
{
  "method": "linkedin_url",
  "query": { "linkedin_url": "..." },
  "exists": false
}

// If exists
{
  "method": "linkedin_url",
  "exists": true,
  "existing": {
    "email": "john@acme.com",
    "first_name": "John",
    "last_name": "Doe",
    "company": "Acme Inc"
  }
}
```

**Method 2: By Name + Domain**
```json
// Request
{
  "first_name": "John",
  "last_name": "Doe",
  "domain": "acme.com"
}

// Response
{
  "method": "name_domain",
  "exists": true,
  "existing": { ... },
  "candidates": 5  // total leads at this domain
}
```

**Method 3: By Email (after enrichment)**
```json
// Request
{ "email": "john@acme.com" }

// Response
{
  "method": "email",
  "exists": true,
  "existing": { ... }
}
```

**Method 4: Domain only (check if we have anyone at company)**
```json
// Request
{ "domain": "acme.com" }

// Response
{
  "method": "domain_only",
  "exists": true,
  "count": 5,
  "sample": [...]  // first 5 leads at this domain
}
```

### Add Leads Endpoint

```
POST /api/leads
Content-Type: application/json

// Single lead
{
  "email": "john@acme.com",
  "first_name": "John",
  "last_name": "Doe",
  "company": "Acme Inc",
  "title": "VP Sales",
  "source": "clay"
}

// Response
{
  "success": true,
  "summary": {
    "total": 1,
    "new": 1,
    "duplicates": 0
  },
  "inserted": [...],
  "duplicates": []
}
```

### Batch Check (Optional)

For checking multiple emails at once:

```
POST /api/leads/check
Content-Type: application/json

{ "emails": ["john@acme.com", "jane@acme.com"] }

// Response
{
  "total": 2,
  "existing": 1,
  "new": 1,
  "results": [
    { "email": "john@acme.com", "exists": true },
    { "email": "jane@acme.com", "exists": false }
  ]
}
```

---

## Post-Setup Checklist

- [ ] DedupCheck column returning `exists` values
- [ ] AlreadyExists formula extracting boolean correctly
- [ ] Enrichment columns have "if not exists" condition
- [ ] SaveLead column pushing new leads only
- [ ] Tested on 5-10 rows before full run

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API returns error | Check URL is correct and app is running |
| All leads show `exists: true` | Verify email column is mapped correctly |
| Enrichment still running on all | Check condition is `equals false` not `is empty` |
| Leads not saving | Verify all required fields are mapped |

---

## Cost Optimization

- **Check first, enrich second** - The check endpoint is free (just a DB lookup)
- **Batch your checks** - If possible, check multiple emails per API call
- **Run daily** - Dedup before each enrichment run to catch leads added from other sources

---

## Related SOPs

- [ ] Clay Email Finding Waterfall
- [ ] Clay to Instantly Campaign Push

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-20 | [Name] | Initial version |
