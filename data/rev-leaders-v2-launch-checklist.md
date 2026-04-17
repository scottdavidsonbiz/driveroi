# RevLeaders v2 HeyReach Campaign: Launch Checklist

## Status
- List `DriveROI - Revenue Leaders v2` (ID `614544`) = 241 leads loaded.
- Campaign `New Rev Leaders` (ID `395534`) created in HeyReach, DRAFT status, list attached.
- 241 custom DM1 openers generated, no em dashes, all under 280 chars: `data/rev-leaders-v2-dm1-openers.csv`.
- Sender script written + dry-run tested: `scripts/heyreach-revleaders-sender.py`.

## Your UI steps (in HeyReach)

1. **Reactivate Scott's LinkedIn account.** Currently `isActive: false` on account ID `118220`. Go to HeyReach settings, reconnect if required.
2. **Open campaign `New Rev Leaders` (ID 395534).**
3. **Configure sequence:**
   - Step 1: **Connection request, blank note**. No message. Just the invite.
   - No other steps. Do NOT add an in-sequence DM. The script handles DM1 and DM2 post-accept.
4. **Set daily cap = 20 connection requests / day.**
5. **Verify list 614544 is attached.** (Already attached per API.)
6. **Start the campaign.**

## Daily cadence (after launch)

Once connections start accepting (typically 2-5 days in), run the DM sender script:

```bash
cd C:\Users\scott\context-os
py scripts/heyreach-revleaders-sender.py --dry-run       # Preview what would send
py scripts/heyreach-revleaders-sender.py --max 5         # Live, cap at 5 DMs this run
py scripts/heyreach-revleaders-sender.py                 # Full run, capped at 20/day
```

Run it **once per day**. The state file is idempotent: safe to re-run, won't double-send.

### Script flow per lead
- Accepted + 4+ days elapsed since accept + no DM1 sent  -->  send custom DM1
- DM1 sent + 5+ days elapsed + no reply + no DM2 sent    -->  send templated DM2
- Reply detected                                          -->  stop, mark replied

### Flags
- `--dry-run` : prints intended sends, does not call the send API.
- `--max N`   : caps sends per run (default 20).
- `--only-dm1`: skip DM2 follow-ups (useful if you want to only do the first touch).
- `--verbose` : prints skip reasons per lead.

## Files
- `data/rev-leaders-v2-dm1-openers.csv` - the 241 openers.
- `data/rev-leaders-v2-dm-state.json`   - runtime state (created on first run).
- `data/rev-leaders-v2-dm-log.jsonl`    - append-only log of every send and event.
- `scripts/openers_data.py`             - source of truth for opener text (indexed by email).
- `scripts/heyreach-revleaders-sender.py` - the polling + send script.

## Unmatched leads (4 of 245)

These did not get a LinkedIn URL in enrichment and are NOT in the HeyReach list:
- Keith Wilson (kwilson@eddyfi.com, Eddyfi Technologies, Sales Manager)
- Ryan Bosman (rbosman@wmamerica.com, Way Media, Senior Director of Sales)
- Mehul P. (pm@dev.pro, Dev.Pro, Chief Revenue Officer)
- Rohit Mahna (rmahna@drivewealth.com, DriveWealth, Chief Revenue Officer)

If you want them in a follow-up pass, we can try LinkedIn Sales Navigator search or another enrichment provider later.

## DM2 template (fires 5 days after DM1 if no reply)

> No worries if the timing is off, {first_name}. Happy to send the framework over anyway, 2-minute skim. Want it?

Edit `DM2_TEMPLATE` in `scripts/heyreach-revleaders-sender.py` if you want different wording before running the first DM2.

## Guardrails

- **Don't start two HeyReach campaigns against Scott's account in parallel.** HeyReach action budget is per-account per-day.
- **Run the sender script from one place only.** Two concurrent runs could send twice.
- **Check the log file** (`data/rev-leaders-v2-dm-log.jsonl`) after each run. One line per event.
- **HeyReach rate limit** is 300 requests per 5 minutes across the account. Script paces itself.
