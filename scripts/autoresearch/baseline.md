---
version: 1
last_updated: 2026-03-22
experiment_id: baseline-v1
---

# Baseline Configuration

## Email Sequence

### Step 1 (Day 0)
subject: SDR hiring question
body: |
  {{firstName}}, {{companyName}} has open SDR roles right now.

  Companies like Vercel and ClickUp replaced 10+ SDRs with signal-based automation that runs 24/7. The infrastructure costs a fraction of one hire.

  Is the plan to keep scaling headcount, or is there interest in exploring the automation side?

  {{sendingAccountFirstName}}

## Campaign Settings
daily_limit: 125
email_gap: 10
timezone: America/New_York
schedule_start: "08:00"
schedule_end: "17:00"
