"""
orchestrator.py — Autonomous cold email A/B optimization loop for DriveROI.

Adapted from Nick S.'s email-optimizer-demo (Karpathy autoresearch pattern).

Key differences from original:
  - Supabase lead pool (not SQLite)
  - Metric: interested reply rate (total_opportunities / new_leads_contacted), not raw reply rate
  - DriveROI-specific resource.md and cold email course
  - Slack notifications via existing webhook

Runs every 4 hours via GitHub Actions or local cron. Each run:
  1. HARVEST  — collect interested reply rates from experiments deployed 48+ hours ago
  2. GENERATE — Claude generates a challenger (copy-only mutation)
  3. DEPLOY   — create campaigns, draw leads from Supabase pool, activate

Usage:
  python scripts/autoresearch/orchestrator.py                # full run
  python scripts/autoresearch/orchestrator.py --dry-run      # generate challenger, don't deploy
  python scripts/autoresearch/orchestrator.py --harvest-only # just pull results
"""

import os
import sys
import json
import logging
import argparse
from datetime import datetime, timezone, timedelta
from pathlib import Path

import requests
import anthropic
from dotenv import load_dotenv
from supabase import create_client, Client

# Load env
ROOT = Path(__file__).parent
PROJECT_ROOT = ROOT.parent.parent
load_dotenv(PROJECT_ROOT / ".env.local")
load_dotenv(PROJECT_ROOT / ".env")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("autoresearch")

# --- Config ---
BASELINE_FILE = ROOT / "baseline.md"
RESOURCE_FILE = ROOT / "resource.md"
COLD_EMAIL_COURSE = ROOT / "cold-email-course.md"
RESULTS_LOG = ROOT / "results.log"

LEADS_PER_ARM = 250
HARVEST_WINDOW_HOURS = 48
MIN_REPLIES_FOR_WINNER = 1

# --- Clients ---
INSTANTLY_API_KEY = os.environ.get("INSTANTLY_API_KEY", "")
INSTANTLY_BASE = "https://api.instantly.ai/api/v2"

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
SLACK_WEBHOOK = os.environ.get("SLACK_WEBHOOK_URL", "")

# Sending accounts for autoresearch campaigns (proxy domains)
SENDING_ACCOUNTS = [
    "alan@octagammaverse.com",
    "charles@octagammaverse.com",
    "eric@octagammaverse.com",
    "kayla@octagammaverse.com",
    "thomas@octagammaverse.com",
    "evelyn@goprospectbridge.com",
    "lawrence@goprospectbridge.com",
    "ronald@goprospectbridge.com",
    "justin@goprospectbridge.com",
    "larry@goprospectbridge.com",
    "ava@edgeb2b.org",
    "hannah@edgeb2b.org",
    "stephen@edgeb2b.org",
    "steven@edgeb2b.org",
    "daniela@edgeb2b.org",
    "abigail@momentumsigma.com",
    "alan@momentumsigma.com",
    "audrey@momentumsigma.com",
    "charles@momentumsigma.com",
    "kyle@momentumsigma.com",
    "autumn@pentadash.com",
    "benjamin@pentadash.com",
    "zoe@pentadash.com",
    "bryan@pentadash.com",
    "donald@pentadash.com",
    "bryan@nonatechs.com",
    "emily@nonatechs.com",
    "george@nonatechs.com",
    "kenneth@nonatechs.com",
]

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None


# ─────────────────────────────────────────────
# SLACK
# ─────────────────────────────────────────────

def slack_notify(text: str):
    if not SLACK_WEBHOOK:
        return
    try:
        requests.post(SLACK_WEBHOOK, json={"text": text}, timeout=10)
    except Exception as e:
        log.warning("Slack failed: %s", e)


# ─────────────────────────────────────────────
# INSTANTLY API
# ─────────────────────────────────────────────

def _instantly_headers():
    return {"Authorization": f"Bearer {INSTANTLY_API_KEY}", "Content-Type": "application/json"}


def instantly_get_analytics(campaign_id: str) -> dict:
    r = requests.get(f"{INSTANTLY_BASE}/campaigns/analytics", params={"id": campaign_id}, headers=_instantly_headers())
    r.raise_for_status()
    data = r.json()
    return data[0] if isinstance(data, list) and data else data


def instantly_create_campaign(name: str, subject: str, body: str, daily_limit: int = 125) -> str:
    """Create a single-step campaign with proxy sending accounts. Returns campaign_id."""
    payload = {
        "name": name,
        "email_list": SENDING_ACCOUNTS,
        "sequences": [{
            "steps": [{
                "type": "email",
                "delay": 0,
                "variants": [{"subject": subject, "body": body}],
            }]
        }],
        "campaign_schedule": {
            "schedules": [{
                "name": "Default",
                "timezone": "America/New_York",
                "days": {"1": 1, "2": 1, "3": 1, "4": 1, "5": 1},
                "timing": {"from": "08:00", "to": "17:00"},
            }]
        },
        "campaign_settings": {
            "email_gap": 10,
            "daily_limit": daily_limit,
            "stop_on_reply": True,
            "stop_on_auto_reply": True,
            "link_tracking": False,
            "open_tracking": False,
            "text_only": False,
        },
    }
    r = requests.post(f"{INSTANTLY_BASE}/campaigns", json=payload, headers=_instantly_headers())
    r.raise_for_status()
    return r.json()["id"]


def instantly_add_leads(campaign_id: str, leads: list[dict]):
    """Add leads in bulk (up to 1000 per request)."""
    for i in range(0, len(leads), 1000):
        batch = leads[i:i+1000]
        payload = {
            "campaign_id": campaign_id,
            "leads": [{"email": l["email"], "first_name": l.get("first_name", ""), "last_name": l.get("last_name", ""), "company_name": l.get("company_name", "")} for l in batch]
        }
        r = requests.post(f"{INSTANTLY_BASE}/leads/add", json=payload, headers=_instantly_headers())
        r.raise_for_status()
    log.info("Added %d leads to campaign %s", len(leads), campaign_id[:8])


def instantly_activate(campaign_id: str):
    r = requests.post(f"{INSTANTLY_BASE}/campaigns/{campaign_id}/activate", json={"status": 1}, headers=_instantly_headers())
    r.raise_for_status()


# ─────────────────────────────────────────────
# SUPABASE LEAD POOL
# ─────────────────────────────────────────────

def pool_stats() -> dict:
    available = supabase.table("lead_pool").select("id", count="exact").eq("status", "available").execute()
    assigned = supabase.table("lead_pool").select("id", count="exact").eq("status", "assigned").execute()
    return {"available": available.count or 0, "assigned": assigned.count or 0}


def draw_leads(experiment_id: str, count: int) -> list[dict]:
    """Draw `count` available leads, mark as assigned. Returns list of lead dicts."""
    stats = pool_stats()
    if stats["available"] < count:
        raise RuntimeError(f"Lead pool exhausted: need {count}, only {stats['available']} available")

    # Fetch available leads (random order via created_at shuffle)
    result = supabase.table("lead_pool").select("*").eq("status", "available").limit(count).execute()
    leads = result.data or []

    # Mark as assigned
    emails = [l["email"] for l in leads]
    for email in emails:
        supabase.table("lead_pool").update({"status": "assigned", "experiment_id": experiment_id, "updated_at": datetime.now(timezone.utc).isoformat()}).eq("email", email).execute()

    # Record in contacted dedup table
    for l in leads:
        supabase.table("lead_pool_contacted").upsert({"email": l["email"], "experiment_id": experiment_id}, on_conflict="email").execute()

    log.info("Drew %d leads for %s (%d remaining)", len(leads), experiment_id, stats["available"] - len(leads))
    return leads


# ─────────────────────────────────────────────
# BASELINE PARSING
# ─────────────────────────────────────────────

def parse_baseline(config_md: str) -> dict:
    """Parse baseline.md into subject and body."""
    subject = ""
    body_lines = []
    in_body = False

    for line in config_md.split("\n"):
        stripped = line.strip()
        if stripped.startswith("subject:"):
            subject = stripped.split(":", 1)[1].strip().strip('"').strip("'")
        elif stripped == "body: |":
            in_body = True
        elif in_body:
            if stripped.startswith("## ") or stripped.startswith("daily_limit:"):
                break
            body_lines.append(line.rstrip())

    # Dedent body
    body = "\n".join(body_lines).strip()
    return {"subject": subject, "body": body}


# ─────────────────────────────────────────────
# HARVEST
# ─────────────────────────────────────────────

def harvest():
    """Check experiments older than 48h, compare baseline vs challenger."""
    result = supabase.table("autoresearch_experiments").select("*").eq("status", "active").execute()
    experiments = result.data or []

    if not experiments:
        log.info("No active experiments to harvest")
        return []

    harvest_results = []
    cutoff = datetime.now(timezone.utc) - timedelta(hours=HARVEST_WINDOW_HOURS)

    for exp in experiments:
        created = datetime.fromisoformat(exp["created_at"].replace("Z", "+00:00"))
        if created > cutoff:
            log.info("Experiment %s too young (%.1fh), skipping", exp["id"], (datetime.now(timezone.utc) - created).total_seconds() / 3600)
            continue

        # Pull analytics
        b_analytics = instantly_get_analytics(exp["baseline_campaign_id"])
        c_analytics = instantly_get_analytics(exp["challenger_campaign_id"])

        b_sent = b_analytics.get("new_leads_contacted_count", 0)
        c_sent = c_analytics.get("new_leads_contacted_count", 0)
        b_interested = b_analytics.get("total_opportunities", 0)
        c_interested = c_analytics.get("total_opportunities", 0)
        b_replies = b_analytics.get("reply_count", 0)
        c_replies = c_analytics.get("reply_count", 0)

        b_rate = b_interested / b_sent if b_sent > 0 else 0
        c_rate = c_interested / c_sent if c_sent > 0 else 0

        # Determine winner based on interested reply rate
        if b_interested < MIN_REPLIES_FOR_WINNER and c_interested < MIN_REPLIES_FOR_WINNER:
            winner = "tie"
        elif c_rate > b_rate:
            winner = "challenger"
        elif b_rate > c_rate:
            winner = "baseline"
        else:
            winner = "tie"

        # Update experiment record
        supabase.table("autoresearch_experiments").update({
            "baseline_sent": b_sent,
            "baseline_replies": b_replies,
            "baseline_interested": b_interested,
            "challenger_sent": c_sent,
            "challenger_replies": c_replies,
            "challenger_interested": c_interested,
            "winner": winner,
            "harvested_at": datetime.now(timezone.utc).isoformat(),
            "status": "harvested",
        }).eq("id", exp["id"]).execute()

        # If challenger wins, promote to baseline
        if winner == "challenger":
            challenger_config = exp.get("challenger_config", {})
            new_baseline = f"""---
version: {int(datetime.now().strftime('%Y%m%d%H'))}
last_updated: {datetime.now().strftime('%Y-%m-%d')}
experiment_id: {exp['id']}
---

# Baseline Configuration

## Email Sequence

### Step 1 (Day 0)
subject: {challenger_config.get('subject', '')}
body: |
  {challenger_config.get('body', '')}

## Campaign Settings
daily_limit: 125
email_gap: 10
timezone: America/New_York
schedule_start: "08:00"
schedule_end: "17:00"
"""
            BASELINE_FILE.write_text(new_baseline)
            log.info("PROMOTED challenger to baseline (interested rate: %.2f%% vs %.2f%%)", c_rate * 100, b_rate * 100)

        result_entry = {
            "experiment_id": exp["id"],
            "winner": winner,
            "baseline": {"sent": b_sent, "replies": b_replies, "interested": b_interested, "rate": b_rate},
            "challenger": {"sent": c_sent, "replies": c_replies, "interested": c_interested, "rate": c_rate},
            "harvested_at": datetime.now(timezone.utc).isoformat(),
        }
        harvest_results.append(result_entry)

        # Append to results log
        with open(RESULTS_LOG, "a") as f:
            f.write(json.dumps(result_entry) + "\n")

        log.info("Harvested %s: B %.2f%% (%d/%d) vs C %.2f%% (%d/%d) -> %s",
                 exp["id"], b_rate*100, b_interested, b_sent, c_rate*100, c_interested, c_sent, winner)

    return harvest_results


# ─────────────────────────────────────────────
# GENERATE CHALLENGER
# ─────────────────────────────────────────────

def generate_challenger() -> dict:
    """Use Claude to generate a challenger variant of the baseline."""
    baseline_text = BASELINE_FILE.read_text()
    resource_text = RESOURCE_FILE.read_text() if RESOURCE_FILE.exists() else ""
    course_text = COLD_EMAIL_COURSE.read_text() if COLD_EMAIL_COURSE.exists() else ""

    # Load experiment history
    history = ""
    if RESULTS_LOG.exists():
        lines = RESULTS_LOG.read_text().strip().split("\n")
        last_10 = lines[-10:] if len(lines) > 10 else lines
        history = "\n".join(last_10)

    # Sample leads from pool for context
    sample_result = supabase.table("lead_pool").select("company_name, job_title, industry").eq("status", "available").limit(10).execute()
    lead_sample = sample_result.data or []
    lead_context = "\n".join([f"  - {l.get('job_title', '?')} at {l.get('company_name', '?')} ({l.get('industry', '?')})" for l in lead_sample])

    prompt = f"""You are the mutation engine for an autonomous cold email optimization system.

CURRENT BASELINE (the email to beat):
{baseline_text}

PRODUCT CONTEXT:
{resource_text}

COLD EMAIL KNOWLEDGE:
{course_text}

EXPERIMENT HISTORY (most recent):
{history if history else "No experiments yet. This is the first challenger."}

SAMPLE LEADS IN POOL:
{lead_context if lead_context else "No sample available"}

YOUR TASK:
Generate a challenger variant that tests a specific hypothesis to improve the INTERESTED REPLY RATE.

The metric is interested replies (prospects who respond positively), not total replies. Auto-replies, "not interested," and "remove me" don't count.

Rules:
- Output ONLY the new email: subject line and body. Nothing else.
- Keep body under 80 words. Every character is an enemy.
- Subject: 2-5 words, lowercase, no punctuation
- No em dashes. No corporate jargon. No exclamation marks.
- Use {{{{firstName}}}} and {{{{companyName}}}} merge tags
- CTA must be a question, not a meeting request
- State your hypothesis as a comment at the top

IMPORTANT: Always end the body with {{{{sendingAccountFirstName}}}} as the signature. Never hardcode a name.

Format your response EXACTLY like this:
<!-- Hypothesis: [your hypothesis here] -->
subject: [subject line]
body: |
  [email body]

  {{{{sendingAccountFirstName}}}}
"""

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}],
    )

    text = response.content[0].text.strip()

    # Parse response
    hypothesis = ""
    subject = ""
    body_lines = []
    in_body = False

    for line in text.split("\n"):
        stripped = line.strip()
        if stripped.startswith("<!-- Hypothesis:"):
            hypothesis = stripped.replace("<!-- Hypothesis:", "").replace("-->", "").strip()
        elif stripped.startswith("subject:"):
            subject = stripped.split(":", 1)[1].strip().strip('"').strip("'")
        elif stripped == "body: |":
            in_body = True
        elif in_body:
            body_lines.append(line.rstrip())

    body = "\n".join(body_lines).strip()

    log.info("Generated challenger: subject='%s', hypothesis='%s'", subject, hypothesis)
    return {"subject": subject, "body": body, "hypothesis": hypothesis, "raw": text}


# ─────────────────────────────────────────────
# DEPLOY
# ─────────────────────────────────────────────

def deploy(challenger: dict) -> dict:
    """Deploy baseline + challenger as two Instantly campaigns with fresh leads."""
    baseline_config = parse_baseline(BASELINE_FILE.read_text())
    exp_id = f"exp-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M')}"

    # Draw leads
    b_leads = draw_leads(f"{exp_id}-baseline", LEADS_PER_ARM)
    c_leads = draw_leads(f"{exp_id}-challenger", LEADS_PER_ARM)

    # Create campaigns
    b_campaign_id = instantly_create_campaign(
        name=f"AR-B-{exp_id}",
        subject=baseline_config["subject"],
        body=baseline_config["body"],
    )
    c_campaign_id = instantly_create_campaign(
        name=f"AR-C-{exp_id}",
        subject=challenger["subject"],
        body=challenger["body"],
    )

    # Add leads
    instantly_add_leads(b_campaign_id, b_leads)
    instantly_add_leads(c_campaign_id, c_leads)

    # Activate
    instantly_activate(b_campaign_id)
    instantly_activate(c_campaign_id)

    # Record experiment
    supabase.table("autoresearch_experiments").insert({
        "id": exp_id,
        "baseline_campaign_id": b_campaign_id,
        "challenger_campaign_id": c_campaign_id,
        "baseline_config": baseline_config,
        "challenger_config": {"subject": challenger["subject"], "body": challenger["body"]},
        "hypothesis": challenger.get("hypothesis", ""),
        "status": "active",
    }).execute()

    log.info("Deployed %s: baseline=%s (%d leads), challenger=%s (%d leads)",
             exp_id, b_campaign_id[:8], len(b_leads), c_campaign_id[:8], len(c_leads))

    return {
        "experiment_id": exp_id,
        "baseline_id": b_campaign_id,
        "challenger_id": c_campaign_id,
        "b_leads": len(b_leads),
        "c_leads": len(c_leads),
        "hypothesis": challenger.get("hypothesis", ""),
    }


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Generate challenger but don't deploy")
    parser.add_argument("--harvest-only", action="store_true", help="Only harvest results")
    parser.add_argument("--stats", action="store_true", help="Show pool stats and exit")
    args = parser.parse_args()

    if args.stats:
        stats = pool_stats()
        print(f"Lead pool: {stats['available']} available, {stats['assigned']} assigned")
        return

    # Phase 1: Harvest
    log.info("=== HARVEST ===")
    harvest_results = harvest()

    if args.harvest_only:
        return

    # Phase 2: Generate challenger
    log.info("=== GENERATE ===")
    challenger = generate_challenger()

    if args.dry_run:
        print(f"\n--- DRY RUN ---")
        print(f"Hypothesis: {challenger['hypothesis']}")
        print(f"Subject: {challenger['subject']}")
        print(f"Body:\n{challenger['body']}")
        return

    # Phase 3: Deploy
    log.info("=== DEPLOY ===")
    stats = pool_stats()
    needed = LEADS_PER_ARM * 2
    if stats["available"] < needed:
        msg = f"Not enough leads: need {needed}, have {stats['available']}. Replenish pool."
        log.error(msg)
        slack_notify(f"Autoresearch BLOCKED: {msg}")
        return

    deploy_info = deploy(challenger)

    # Notify
    summary = (
        f"Autoresearch deployed {deploy_info['experiment_id']}\n"
        f"Hypothesis: {deploy_info['hypothesis']}\n"
        f"Baseline: {deploy_info['b_leads']} leads\n"
        f"Challenger: {deploy_info['c_leads']} leads\n"
        f"Pool remaining: {pool_stats()['available']}"
    )
    log.info(summary)
    slack_notify(summary)


if __name__ == "__main__":
    main()
