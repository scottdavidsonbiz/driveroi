"""
HeyReach Revenue Leaders v2 DM Sender

Polls HeyReach campaign 395534 for accepted LinkedIn connections and sends
per-lead custom DM1 and templated DM2 via the HeyReach public API.

Run:
    py scripts/heyreach-revleaders-sender.py --dry-run
    py scripts/heyreach-revleaders-sender.py --max 2
    py scripts/heyreach-revleaders-sender.py

Sequence logic:
    - Lead connected, no DM1 sent, wait_after_accept_days elapsed -> send DM1 (custom)
    - DM1 sent, no reply, wait_after_dm1_days elapsed, no DM2 -> send DM2 (templated)
    - Reply detected -> mark replied, send nothing else

State lives in data/rev-leaders-v2-dm-state.json. Idempotent: safe to re-run.
"""

import argparse
import csv
import json
import os
import sys
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone, timedelta
from pathlib import Path

# ---------- Config ----------
API_KEY = os.environ.get("HEYREACH_API_KEY") or "VABg9HQtk/AvkNzs9edMl2KtFB4EnKfWtXZXWHyD6Zc="
BASE_URL = "https://api.heyreach.io/api/public"
CAMPAIGN_ID = 395534  # "New Rev Leaders"
LIST_ID = 614544
LINKEDIN_ACCOUNT_ID = 118220  # Scott Davidson

WAIT_AFTER_ACCEPT_DAYS = 1
WAIT_AFTER_DM1_DAYS = 5
WAIT_AFTER_DM2_DAYS = 5
MAX_SENDS_PER_RUN_DEFAULT = 20
SEND_PAUSE_SECONDS = 2.0

BASE_DIR = Path(__file__).resolve().parent.parent
OPENERS_CSV = BASE_DIR / "data" / "rev-leaders-v2-dm1-openers.csv"
STATE_FILE = BASE_DIR / "data" / "rev-leaders-v2-dm-state.json"
LOG_FILE = BASE_DIR / "data" / "rev-leaders-v2-dm-log.jsonl"

DM1_SUBJECT = ""  # LinkedIn DMs in standing conversations don't need a subject; leave empty.

# DM2: Agitational thought bump (Kellen Casemir framework). Soft pull — makes them own the "no."
DM2_TEMPLATE = (
    "Has cold outbound fallen off the priority list for your team right now?"
)

# DM3: Pitch & exit. Soft re-offer + permission to disengage.
DM3_TEMPLATE = (
    "Asking because we have been helping a few teams build signal-based outbound systems "
    "that run alongside what their reps are already doing. Happy to show you what that "
    "looks like on a call. Would be great to hear back either way, {first_name}."
)


# ---------- HTTP ----------
def api_post(path: str, body: dict) -> dict:
    data = json.dumps(body).encode()
    req = urllib.request.Request(
        BASE_URL + path,
        data=data,
        headers={"X-API-KEY": API_KEY, "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body_text = e.read().decode()
        raise RuntimeError(f"HTTP {e.code} {path}: {body_text[:400]}") from None


# ---------- Helpers ----------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def parse_iso(s: str | None) -> datetime | None:
    if not s:
        return None
    return datetime.fromisoformat(s.replace("Z", "+00:00"))


def days_since(iso_ts: str | None) -> float:
    t = parse_iso(iso_ts)
    if not t:
        return 1e9
    return (datetime.now(timezone.utc) - t).total_seconds() / 86400


def normalize_profile_url(u: str) -> str:
    if not u:
        return ""
    u = u.strip().lower()
    u = u.replace("http://", "https://")
    if u.endswith("/"):
        u = u[:-1]
    return u


def load_openers() -> dict:
    """Returns {normalized_profile_url: {email, first_name, last_name, dm1_opener}}."""
    result = {}
    with open(OPENERS_CSV, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            key = normalize_profile_url(row["linkedin_url"])
            result[key] = row
            # Also index by email as a fallback
            result[row["email"].lower()] = row
    return result


def load_state() -> dict:
    if not STATE_FILE.exists():
        return {}
    with open(STATE_FILE, encoding="utf-8") as f:
        return json.load(f)


def save_state(state: dict) -> None:
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, sort_keys=True)


def log_event(event: dict) -> None:
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps({"ts": now_iso(), **event}) + "\n")


# ---------- HeyReach reads ----------
def fetch_conversations(offset: int = 0, limit: int = 100) -> list[dict]:
    """Returns conversation items for our LinkedIn account.

    Filtering by campaignIds is unreliable: HeyReach never populates campaignId on
    conversation rows, so a campaign filter returns 0. We filter by account only and
    match leads to openers downstream via profileUrl.
    """
    body = {
        "offset": offset,
        "limit": limit,
        "filters": {
            "linkedInAccountIds": [LINKEDIN_ACCOUNT_ID],
        },
    }
    resp = api_post("/inbox/GetConversationsV2", body)
    return resp.get("items", []) or []


def fetch_all_conversations() -> list[dict]:
    all_items = []
    offset = 0
    page_size = 100
    while True:
        batch = fetch_conversations(offset=offset, limit=page_size)
        if not batch:
            break
        all_items.extend(batch)
        if len(batch) < page_size:
            break
        offset += page_size
    return all_items


def fetch_campaign_leads() -> list[dict]:
    """Get leads with their status. Returns items with 'status' field."""
    all_items = []
    offset = 0
    page_size = 100
    while True:
        body = {"campaignId": CAMPAIGN_ID, "offset": offset, "limit": page_size}
        resp = api_post("/campaign/GetLeadsFromCampaign", body)
        items = resp.get("items", []) or []
        if not items:
            break
        all_items.extend(items)
        if len(items) < page_size:
            break
        offset += page_size
    return all_items


# ---------- Conversation parsing ----------
def extract_conversation_facts(conv: dict) -> dict:
    """Normalize a conversation dict to a uniform shape using HeyReach v2 fields."""
    profile_url = normalize_profile_url(
        (conv.get("correspondentProfile") or {}).get("profileUrl") or ""
    )
    conv_id = conv.get("id")
    messages = conv.get("messages") or []
    last_message_at = conv.get("lastMessageAt")
    last_message_sender = conv.get("lastMessageSender")  # "ME" | "CORRESPONDENT"

    # Reply = any message where sender == "CORRESPONDENT"
    last_reply_at = None
    has_me_message = False
    for m in messages:
        sender = m.get("sender")
        ts = m.get("createdAt")
        if sender == "CORRESPONDENT" and ts:
            if last_reply_at is None or ts > last_reply_at:
                last_reply_at = ts
        if sender == "ME":
            has_me_message = True

    # Fallback: if messages list not returned, use lastMessageSender
    if last_reply_at is None and last_message_sender == "CORRESPONDENT":
        last_reply_at = last_message_at

    return {
        "profile_url": profile_url,
        "conversation_id": conv_id,
        "last_reply_at": last_reply_at,
        "has_me_message": has_me_message,
        "last_message_at": last_message_at,
        "raw": conv,
    }


# ---------- Sends ----------
def send_dm(conversation_id: str, message: str, dry_run: bool, pending_sends: list | None = None) -> dict:
    if dry_run or pending_sends is not None:
        result = {"dry_run": True, "conversation_id": conversation_id, "message_preview": message[:120]}
        if pending_sends is not None:
            pending_sends.append({"conversation_id": str(conversation_id), "message": message})
        return result
    body = {
        "conversationId": str(conversation_id),
        "linkedInAccountId": LINKEDIN_ACCOUNT_ID,
        "subject": DM1_SUBJECT,
        "message": message,
    }
    return api_post("/message/SendMessage", body)


# ---------- Main loop ----------
def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="Print intended sends, do not call SendMessage or persist state.")
    ap.add_argument("--max", type=int, default=MAX_SENDS_PER_RUN_DEFAULT, help="Max DM sends per run (default 20).")
    ap.add_argument("--only-dm1", action="store_true", help="Only send DM1s (skip DM2 follow-ups).")
    ap.add_argument("--verbose", action="store_true")
    ap.add_argument("--leads-file", help="Path to pre-fetched campaign leads JSON (skips GetLeadsFromCampaign API call).")
    ap.add_argument("--conversations-file", help="Path to pre-fetched conversations JSON (skips GetConversationsV2 API call).")
    ap.add_argument("--output-sends", help="Write pending sends to this JSON file instead of calling SendMessage API.")
    args = ap.parse_args()

    openers = load_openers()
    state = load_state()

    print(f"Loaded {len(openers)//2} openers (indexed by URL + email).")
    print(f"State: {len(state)} leads tracked.")

    # 1) Acceptance truth lives on campaign lead records, not inbox conversations.
    # Inbox rows don't exist for accepted-but-not-yet-messaged leads, so polling
    # /inbox misses them entirely. Poll /campaign leads and key off leadConnectionStatus.
    if args.leads_file:
        print(f"Loading campaign leads from {args.leads_file}...")
        with open(args.leads_file, encoding="utf-8") as lf:
            campaign_leads = json.load(lf)
    else:
        print(f"Fetching campaign {CAMPAIGN_ID} leads...")
        try:
            campaign_leads = fetch_campaign_leads()
        except RuntimeError as e:
            print(f"ERROR fetching campaign leads: {e}")
            return 1
    print(f"Got {len(campaign_leads)} leads in campaign.")

    accepted = [cl for cl in campaign_leads if cl.get("leadConnectionStatus") == "ConnectionAccepted"]
    print(f"  ConnectionAccepted: {len(accepted)}")
    if not accepted:
        print("No accepted leads to process.")
        return 0

    # 2) Conversation index: all inbox convos for our account, keyed by profileUrl.
    # We still need this to find the conversationId required by SendMessage and to
    # detect replies. No campaign filter — HeyReach doesn't tag convos with campaignId.
    if args.conversations_file:
        print(f"Loading conversations from {args.conversations_file}...")
        with open(args.conversations_file, encoding="utf-8") as cf:
            conversations = json.load(cf)
    else:
        print(f"Fetching inbox conversations for account {LINKEDIN_ACCOUNT_ID}...")
        try:
            conversations = fetch_all_conversations()
        except RuntimeError as e:
            print(f"ERROR fetching conversations: {e}")
            return 1
    print(f"Got {len(conversations)} conversations.")

    conv_by_url: dict = {}
    for conv in conversations:
        facts = extract_conversation_facts(conv)
        if facts["profile_url"]:
            conv_by_url[facts["profile_url"]] = facts

    pending_sends: list | None = [] if args.output_sends else None
    sends = 0
    blocked_no_thread = 0

    for cl in accepted:
        if sends >= args.max:
            print(f"Hit --max {args.max}, stopping.")
            break

        profile = cl.get("linkedInUserProfile") or {}
        profile_url = normalize_profile_url(profile.get("profileUrl") or "")
        email_from_hr = (profile.get("customEmailAddress") or profile.get("emailAddress") or "").lower()

        lead = openers.get(profile_url) or openers.get(email_from_hr)
        if not lead:
            if args.verbose:
                print(f"No opener for {profile_url or email_from_hr}, skipping.")
            continue

        opener_email = lead["email"]
        st = state.setdefault(opener_email, {})
        st["profile_url"] = profile_url

        # Accept timestamp lives on the campaign lead record (lastActionTime while
        # status is ConnectionAccepted). Preserve the first one we see.
        accept_ts = cl.get("lastActionTime") or cl.get("creationTime")
        if accept_ts:
            st.setdefault("accepted_at", accept_ts)

        # Already replied previously? Stop.
        if st.get("replied_at"):
            continue

        facts = conv_by_url.get(profile_url)
        conv_id = facts["conversation_id"] if facts else None
        if conv_id:
            st["conversation_id"] = conv_id

        # Reply detection (only possible once a conversation exists).
        if facts and facts["last_reply_at"] and not st.get("replied_at"):
            st["replied_at"] = facts["last_reply_at"]
            log_event({"event": "reply_detected", "email": opener_email, "at": facts["last_reply_at"]})
            print(f"REPLY from {opener_email}")
            continue

        # DM1
        if not st.get("dm1_sent_at"):
            # If HeyReach inbox shows a message from us, record and skip — don't double-send.
            if facts and facts["has_me_message"]:
                st["dm1_sent_at"] = facts["last_message_at"] or now_iso()
                st["dm1_text"] = "(sent outside this script)"
                log_event({"event": "dm1_detected_external", "email": opener_email})
                continue

            wait_days = days_since(st.get("accepted_at"))
            if wait_days < WAIT_AFTER_ACCEPT_DAYS:
                if args.verbose:
                    print(f"{opener_email}: accepted {wait_days:.1f}d ago, waiting {WAIT_AFTER_ACCEPT_DAYS}d before DM1.")
                continue

            if not conv_id:
                # HeyReach public SendMessage needs an existing conversationId, but
                # accepted-only leads don't have inbox threads yet. Can't send via API.
                blocked_no_thread += 1
                if args.verbose:
                    print(f"{opener_email}: eligible for DM1 but no inbox thread yet (send blocked).")
                log_event({
                    "event": "dm1_blocked_no_thread",
                    "email": opener_email,
                    "accepted_at": st.get("accepted_at"),
                })
                continue

            message = lead["dm1_opener"]
            print(f"SEND DM1 -> {opener_email} ({lead['first_name']} {lead['last_name']})")
            print(f"  {message[:140]}...")
            try:
                resp = send_dm(conv_id, message, args.dry_run, pending_sends)
                if not args.dry_run:
                    st["dm1_sent_at"] = now_iso()
                    st["dm1_text"] = message
                log_event({"event": "dm1_sent", "email": opener_email, "dry_run": args.dry_run, "response": resp})
                sends += 1
                time.sleep(SEND_PAUSE_SECONDS)
            except RuntimeError as e:
                print(f"  ERROR: {e}")
                log_event({"event": "dm1_error", "email": opener_email, "error": str(e)})
            continue

        # DM2: Agitational thought bump
        if args.only_dm1:
            continue
        if not st.get("dm2_sent_at"):
            if days_since(st["dm1_sent_at"]) < WAIT_AFTER_DM1_DAYS:
                continue
            if not conv_id:
                if args.verbose:
                    print(f"{opener_email}: DM2 due but no inbox thread. Skipping.")
                continue

            dm2 = DM2_TEMPLATE.format(first_name=lead["first_name"])
            print(f"SEND DM2 -> {opener_email} ({lead['first_name']} {lead['last_name']})")
            print(f"  {dm2}")
            try:
                resp = send_dm(conv_id, dm2, args.dry_run, pending_sends)
                if not args.dry_run:
                    st["dm2_sent_at"] = now_iso()
                    st["dm2_text"] = dm2
                log_event({"event": "dm2_sent", "email": opener_email, "dry_run": args.dry_run, "response": resp})
                sends += 1
                time.sleep(SEND_PAUSE_SECONDS)
            except RuntimeError as e:
                print(f"  ERROR: {e}")
                log_event({"event": "dm2_error", "email": opener_email, "error": str(e)})
            continue

        # DM3: Pitch & exit
        if st.get("dm3_sent_at"):
            continue
        if days_since(st["dm2_sent_at"]) < WAIT_AFTER_DM2_DAYS:
            continue
        if not conv_id:
            if args.verbose:
                print(f"{opener_email}: DM3 due but no inbox thread. Skipping.")
            continue

        dm3 = DM3_TEMPLATE.format(first_name=lead["first_name"])
        print(f"SEND DM3 -> {opener_email} ({lead['first_name']} {lead['last_name']})")
        print(f"  {dm3}")
        try:
            resp = send_dm(conv_id, dm3, args.dry_run, pending_sends)
            if not args.dry_run:
                st["dm3_sent_at"] = now_iso()
                st["dm3_text"] = dm3
            log_event({"event": "dm3_sent", "email": opener_email, "dry_run": args.dry_run, "response": resp})
            sends += 1
            time.sleep(SEND_PAUSE_SECONDS)
        except RuntimeError as e:
            print(f"  ERROR: {e}")
            log_event({"event": "dm3_error", "email": opener_email, "error": str(e)})

    if args.output_sends:
        with open(args.output_sends, "w", encoding="utf-8") as osf:
            json.dump(pending_sends, osf, indent=2)
        print(f"Pending sends written to {args.output_sends} ({len(pending_sends)} messages).")
        save_state(state)
    elif not args.dry_run:
        save_state(state)
    print(f"\nDone. Queued {sends} messages{' (dry-run)' if args.dry_run else ''}.")
    if blocked_no_thread:
        print(f"Blocked (no inbox thread yet): {blocked_no_thread} lead(s). "
              f"HeyReach SendMessage requires an existing conversationId — see launch checklist.")
    print(f"State: {STATE_FILE}")
    print(f"Log:   {LOG_FILE}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
