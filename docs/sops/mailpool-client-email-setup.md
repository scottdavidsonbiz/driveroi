# SOP: Client Email Account Setup (MailPool + Instantly)

**Purpose:** Set up new email domains and inboxes for client outbound campaigns using MailPool, then connect to Instantly for warm-up and sending.

**Scope:** New client onboarding for cold email infrastructure.

**Owner:** [Team Member Name]

**Last Updated:** January 18, 2026

---

## Prerequisites

- [ ] MailPool account access
- [ ] Instantly account access
- [ ] Client's primary domain (e.g., `clientwebsite.com`)
- [ ] Number of domains/inboxes needed (see Volume Guidelines below)
- [ ] Client contact names (optional, for inbox personalization)

---

## Volume Guidelines

*Reference for determining how many domains/inboxes to purchase:*

| Monthly Email Volume | Domains Needed | Inboxes per Domain | Total Inboxes |
|---------------------|----------------|-------------------|---------------|
| TBD | TBD | 3 | TBD |

> **Note:** Separate section of SOP will define volume requirements.

---

## Procedure

### Step 1: Create Client Workspace in MailPool

1. Log into MailPool
2. Click **"Create a new workspace"**
3. Name the workspace with the client name (e.g., "IVS" or "DriveROI")
4. Save the workspace

---

### Step 2: Generate Domains

1. Navigate to **Domains** in the left sidebar
2. Click **"Create Domain"**
3. Select **"AI Domain Generator"**
4. Enter the client's primary domain (e.g., `driveroi.ai`)
5. Enter the number of domains to generate (e.g., 5)
6. Review the generated domain suggestions
   - Green checkmark = available
   - Red X = not available
7. (Optional) Manually add domain ideas by typing them in and clicking check

> **Tip:** Generated domains should be similar to the client's brand but distinct enough for deliverability.

---

### Step 3: Configure Domain Settings

For each domain:

1. **Redirect URL:** Set to the client's actual website
   - Example: `https://clientwebsite.com`

2. **DMARC Reports:** Set to `dmarc@driveroi.ai`
   - This centralizes all DMARC reports to our monitoring inbox

3. Click **"Next"** to proceed

---

### Step 4: Purchase Domains

1. Review the domain order summary
2. Click **"Proceed to Checkout"**
3. Complete the purchase

---

### Step 5: Create Inboxes

1. Navigate to the purchased domains
2. Click **"Create Inboxes"** or **"AI Generate Inbox"**
3. Configure inbox settings:

| Setting | Value |
|---------|-------|
| **Domains to use** | Select all client domains |
| **Inboxes per domain** | 3 (recommended starting point) |
| **Provider split** | 50% Google / 50% Outlook |
| **Names** | Use client team names if available, otherwise generate |
| **Gender mix** | Random assortment of male and female names |

4. Click **"Generate"** or **"Create"**

> **Best Practice:** 50-50 split between Google and Outlook improves deliverability diversity.

---

### Step 6: Wait for Provisioning

- Inbox provisioning takes **2-3 business days**
- Status will show as "Pending" until complete
- **Action:** Check MailPool each morning until status changes to "Active"

---

### Step 7: Connect to Instantly

Once inboxes are active:

1. **Get Instantly Workspace ID:**
   - Open Instantly
   - Go to **Settings** → **Accounts and Settings** → **Workspace and Members**
   - Copy the **Workspace ID**

2. **Request Connection in MailPool:**
   - Go to the MailPool chat/support
   - Send message: *"Please connect these inboxes to my Instantly account. Workspace ID: [paste ID]"*
   - Wait for confirmation from MailPool team

---

### Step 8: Enable Warm-Up in Instantly

Once MailPool confirms the connection:

1. Open Instantly
2. Go to **Email Accounts** tab
3. Locate the newly imported accounts (filter by domain if needed)
4. Select all accounts for this client
5. Toggle **Warm-Up** to ON for each account
   - Verify the warm-up indicator is active

---

### Step 9: Tag Accounts by Client

1. In Instantly **Email Accounts** tab
2. Select all accounts for the client
3. Click **"Tag"**
4. Create a new tag with the client name (e.g., "IVS")
5. Apply the tag

> **Why:** Tags ensure the correct accounts are used when setting up campaigns for each client.

---

## Post-Setup Checklist

- [ ] Workspace created in MailPool
- [ ] Domains purchased and active
- [ ] Inboxes created (50/50 Google/Outlook split)
- [ ] Inboxes connected to Instantly
- [ ] Warm-up enabled on all accounts
- [ ] Accounts tagged by client name
- [ ] Warm-up running for 2+ weeks before sending campaigns

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Domain shows as unavailable | Try variations or use manual entry to check alternatives |
| Inboxes stuck in "Pending" | Contact MailPool support if >3 business days |
| Accounts not appearing in Instantly | Verify Workspace ID was correct; contact MailPool |
| Warm-up not starting | Check account connection status in Instantly |

---

## Related SOPs

- [ ] Campaign Volume Guidelines (TBD)
- [ ] Instantly Campaign Setup (TBD)
- [ ] Email Warm-Up Monitoring (TBD)

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-18 | [Name] | Initial version from Loom recording |
