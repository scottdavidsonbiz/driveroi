#!/usr/bin/env python3
"""
Generate a branded DriveROI ICP deliverable page from a Clay CSV export.

Usage:
    python generate-deliverable.py \
        --csv path/to/clay-export.csv \
        --prospect "CourtReserve" \
        --cal-link "https://cal.com/driveroi/30min" \
        --output public/leads/courtreserve.html

The Clay CSV must have these columns (exact names, order doesn't matter):
    Club Name, Domain, First Name, Last Name, Full Name, Job Title,
    Location, LinkedIn Profile, Valid Email
"""

import argparse
import csv
import re
import html
import sys
from collections import defaultdict, Counter
from pathlib import Path
from datetime import datetime


# ---------------------------------------------------------------------------
# Email pattern detection & inference
# ---------------------------------------------------------------------------

PATTERNS = {
    "first_only":      lambda f, l: f,                          # ryan@
    "first_last_init": lambda f, l: f + l[0],                   # danag@
    "first_init_last": lambda f, l: f[0] + l,                   # tbayliss@
    "first_dot_last":  lambda f, l: f + "." + l,                # fernando.fry@
    "first_last":      lambda f, l: f + l,                      # gregbowler@
}


def detect_pattern(local_part, first_name, last_name):
    """Try to classify an email's local part against known patterns."""
    f = first_name.lower().strip()
    l = last_name.lower().strip()
    lp = local_part.lower().strip()

    if not f or not l:
        return None

    for name, fn in PATTERNS.items():
        try:
            if fn(f, l) == lp:
                return name
        except IndexError:
            continue

    # Try common nicknames / shortened first names
    for length in range(3, len(f)):
        short = f[:length]
        for name, fn in PATTERNS.items():
            try:
                if fn(short, l) == lp:
                    return name
            except IndexError:
                continue

    return None


def infer_company_pattern(contacts):
    """Given a list of contacts for one company, return the dominant email pattern."""
    patterns = []
    for c in contacts:
        if not c["email"]:
            continue
        local = c["email"].split("@")[0]
        pat = detect_pattern(local, c["first_name"], c["last_name"])
        if pat:
            patterns.append(pat)

    if not patterns:
        return None

    most_common = Counter(patterns).most_common(1)[0]
    # Require at least 1 match; prefer 2+ for confidence
    return most_common[0]


def infer_email(first_name, last_name, domain, pattern):
    """Generate an email address from a name + detected pattern."""
    f = first_name.lower().strip()
    l = last_name.lower().strip()
    if not f or not l:
        return None
    try:
        local = PATTERNS[pattern](f, l)
        return f"{local}@{domain}"
    except (IndexError, KeyError):
        return None


# ---------------------------------------------------------------------------
# HTML generation
# ---------------------------------------------------------------------------

def esc(text):
    """HTML-escape a string."""
    return html.escape(str(text)) if text else ""


def generate_html(prospect_name, cal_link, companies, month_year):
    """Build the full HTML deliverable string."""

    # Compute stats
    total_accounts = len(companies)
    total_contacts = sum(len(cs) for cs in companies.values())
    verified = sum(1 for cs in companies.values() for c in cs if c["email"] and not c.get("inferred"))
    inferred = sum(1 for cs in companies.values() for c in cs if c.get("inferred"))
    total_emails = verified + inferred
    states = set()
    for cs in companies.values():
        for c in cs:
            loc = c.get("location", "")
            parts = [p.strip() for p in loc.split(",")]
            if len(parts) >= 2:
                states.add(parts[-2] if "United States" in loc else parts[-1])

    # Build company sections
    company_sections = []
    for (company_name, company_domain), contacts in sorted(companies.items()):
        # Extract city/state from first contact's location
        loc_parts = [p.strip() for p in contacts[0].get("location", "").split(",")]
        if len(loc_parts) >= 3:
            city_state = f"{loc_parts[0]}, {loc_parts[1]}"
        elif len(loc_parts) >= 2:
            city_state = f"{loc_parts[0]}, {loc_parts[1]}"
        else:
            city_state = contacts[0].get("location", "")

        rows = []
        for c in contacts:
            badges = []
            if c.get("linkedin"):
                badges.append(
                    f'<a class="badge badge-linkedin" href="{esc(c["linkedin"])}" target="_blank">LinkedIn</a>'
                )
            if c.get("email"):
                email = esc(c["email"])
                if c.get("inferred"):
                    badges.append(
                        f'<span class="badge badge-inferred"><a href="mailto:{email}">{email}</a></span>'
                    )
                else:
                    badges.append(
                        f'<span class="badge badge-email"><a href="mailto:{email}">{email}</a></span>'
                    )

            rows.append(f"""          <tr>
            <td class="contact-name">{esc(c["full_name"])}</td>
            <td class="contact-title">{esc(c["title"])}</td>
            <td class="contact-location">{esc(c["location"])}</td>
            <td class="badges">{''.join(badges)}</td>
          </tr>""")

        company_sections.append(f"""
    <div class="company-group">
      <div class="company-header">
        <div class="company-name">{esc(company_name)}</div>
        <div class="company-location">{esc(city_state)}</div>
        <a class="company-domain" href="https://{esc(company_domain)}" target="_blank">{esc(company_domain)}</a>
      </div>
      <table class="contacts-table">
        <thead><tr><th>Contact</th><th>Title</th><th>Location</th><th></th></tr></thead>
        <tbody>
{chr(10).join(rows)}
        </tbody>
      </table>
    </div>""")

    email_sublabel = ""
    if inferred > 0:
        email_sublabel = f'<div class="stat-sublabel">{verified} verified, {inferred} inferred</div>'

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ICP Target List — Prepared for {esc(prospect_name)}</title>
<style>
  :root {{
    --purple: #8B7FD4;
    --purple-light: #f0eef9;
    --purple-dark: #6b5fb4;
    --text: #1a1a1a;
    --text-secondary: #6b7280;
    --border: #e5e7eb;
    --bg: #ffffff;
    --bg-alt: #f9fafb;
    --success: #059669;
    --amber: #d97706;
    --amber-bg: #fffbeb;
  }}
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: var(--text); background: var(--bg-alt); line-height: 1.6; -webkit-font-smoothing: antialiased;
  }}
  .container {{ max-width: 960px; margin: 0 auto; background: var(--bg); min-height: 100vh; }}
  .header {{ padding: 40px 48px 32px; border-bottom: 1px solid var(--border); }}
  .logo {{ font-size: 28px; font-weight: 900; letter-spacing: -0.5px; color: var(--text); display: inline-block; margin-bottom: 24px; }}
  .logo span {{ position: relative; }}
  .logo span::after {{ content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 4px; background: var(--purple); border-radius: 2px; }}
  .header h1 {{ font-size: 22px; font-weight: 700; color: var(--text); margin-bottom: 4px; }}
  .header .subtitle {{ font-size: 15px; color: var(--text-secondary); }}
  .stats {{ display: flex; gap: 0; padding: 0 48px; border-bottom: 1px solid var(--border); }}
  .stat {{ flex: 1; padding: 20px 0; text-align: center; border-right: 1px solid var(--border); }}
  .stat:last-child {{ border-right: none; }}
  .stat-value {{ font-size: 28px; font-weight: 800; color: var(--text); }}
  .stat-label {{ font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-secondary); margin-top: 2px; }}
  .stat-sublabel {{ font-size: 11px; color: var(--text-secondary); margin-top: 2px; }}
  .intro {{ padding: 28px 48px; border-bottom: 1px solid var(--border); text-align: center; }}
  .intro p {{ font-size: 15px; color: var(--text-secondary); max-width: 680px; margin: 0 auto; line-height: 1.7; }}
  .legend {{ padding: 16px 48px; border-bottom: 1px solid var(--border); display: flex; gap: 20px; align-items: center; }}
  .legend-item {{ display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-secondary); }}
  .legend-dot {{ width: 10px; height: 10px; border-radius: 3px; }}
  .legend-dot-verified {{ background: #ecfdf5; border: 1px solid var(--success); }}
  .legend-dot-inferred {{ background: var(--amber-bg); border: 1px solid var(--amber); }}
  .table-section {{ padding: 0 48px; }}
  .company-group {{ border-bottom: 1px solid var(--border); }}
  .company-header {{ display: flex; align-items: baseline; gap: 12px; padding: 20px 0 8px; }}
  .company-name {{ font-size: 16px; font-weight: 700; color: var(--text); }}
  .company-location {{ font-size: 13px; color: var(--text-secondary); }}
  .company-domain {{ font-size: 13px; color: var(--purple); margin-left: auto; text-decoration: none; }}
  .company-domain:hover {{ text-decoration: underline; }}
  .contacts-table {{ width: 100%; border-collapse: collapse; margin-bottom: 16px; }}
  .contacts-table th {{ text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-secondary); padding: 6px 12px 6px 0; border-bottom: 1px solid var(--border); }}
  .contacts-table td {{ padding: 10px 12px 10px 0; font-size: 14px; vertical-align: middle; }}
  .contacts-table tr:not(:last-child) td {{ border-bottom: 1px solid #f3f4f6; }}
  .contact-name {{ font-weight: 600; color: var(--text); }}
  .contact-title {{ color: var(--text-secondary); font-size: 13px; }}
  .contact-location {{ color: var(--text-secondary); font-size: 13px; }}
  .badge {{ display: inline-flex; align-items: center; gap: 4px; font-size: 12px; padding: 3px 8px; border-radius: 4px; font-weight: 500; text-decoration: none; }}
  .badge-linkedin {{ background: #f0f0f0; color: #0077b5; }}
  .badge-linkedin:hover {{ background: #e0e0e0; }}
  .badge-email {{ background: #ecfdf5; color: var(--success); }}
  .badge-email a {{ color: var(--success); text-decoration: none; }}
  .badge-email a:hover {{ text-decoration: underline; }}
  .badge-inferred {{ background: var(--amber-bg); color: var(--amber); }}
  .badge-inferred a {{ color: var(--amber); text-decoration: none; }}
  .badge-inferred a:hover {{ text-decoration: underline; }}
  .badges {{ display: flex; gap: 6px; flex-wrap: wrap; }}
  .cta-section {{ padding: 48px; text-align: center; background: var(--purple-light); }}
  .cta-section h2 {{ font-size: 20px; font-weight: 700; color: var(--text); margin-bottom: 8px; }}
  .cta-section p {{ font-size: 15px; color: var(--text-secondary); max-width: 520px; margin: 0 auto 24px; line-height: 1.7; }}
  .cta-button {{ display: inline-block; background: var(--purple); color: white; font-size: 15px; font-weight: 600; padding: 12px 32px; border-radius: 8px; text-decoration: none; transition: background 0.2s; }}
  .cta-button:hover {{ background: var(--purple-dark); }}
  .footer {{ padding: 24px 48px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }}
  .footer-logo {{ font-size: 16px; font-weight: 800; color: var(--text); }}
  .footer-logo span {{ position: relative; }}
  .footer-logo span::after {{ content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 3px; background: var(--purple); border-radius: 2px; }}
  .footer-text {{ font-size: 13px; color: var(--text-secondary); }}
  .footer-text a {{ color: var(--purple); text-decoration: none; }}
  .header-top {{ display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }}
  .header-cta {{ display: inline-block; background: var(--purple); color: white; font-size: 14px; font-weight: 600; padding: 10px 24px; border-radius: 8px; text-decoration: none; transition: background 0.2s; white-space: nowrap; }}
  .header-cta:hover {{ background: var(--purple-dark); }}
  .floating-bar {{ position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: var(--bg); border-bottom: 1px solid var(--border); padding: 12px 24px; display: flex; justify-content: center; align-items: center; gap: 24px; transform: translateY(-100%); transition: transform 0.3s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }}
  .floating-bar.visible {{ transform: translateY(0); }}
  .floating-bar-logo {{ font-size: 18px; font-weight: 900; letter-spacing: -0.5px; color: var(--text); }}
  .floating-bar-logo span {{ position: relative; }}
  .floating-bar-logo span::after {{ content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 3px; background: var(--purple); border-radius: 2px; }}
  .floating-bar-cta {{ display: inline-block; background: var(--purple); color: white; font-size: 13px; font-weight: 600; padding: 8px 20px; border-radius: 6px; text-decoration: none; transition: background 0.2s; }}
  .floating-bar-cta:hover {{ background: var(--purple-dark); }}
  @media (max-width: 640px) {{
    .header, .intro, .table-section, .cta-section, .footer, .legend {{ padding-left: 24px; padding-right: 24px; }}
    .stats {{ padding: 0 24px; flex-wrap: wrap; }}
    .stat {{ min-width: 50%; }}
    .company-header {{ flex-wrap: wrap; }}
    .company-domain {{ margin-left: 0; }}
    .header-cta {{ font-size: 13px; padding: 8px 16px; }}
  }}
</style>
</head>
<body>
<div class="floating-bar" id="floatingBar">
  <div class="floating-bar-logo">Drive<span>ROI</span></div>
  <a class="floating-bar-cta" href="{esc(cal_link)}" target="_blank">Schedule a Call &rarr;</a>
</div>
<div class="container">
  <div class="header" id="header">
    <div class="header-top">
      <div class="logo">Drive<span>ROI</span></div>
      <a class="header-cta" href="{esc(cal_link)}" target="_blank">Schedule a Call &rarr;</a>
    </div>
    <h1>ICP Target List</h1>
    <div class="subtitle">Prepared for {esc(prospect_name)} &mdash; {esc(month_year)}</div>
  </div>
  <div class="stats">
    <div class="stat">
      <div class="stat-value">{total_accounts}</div>
      <div class="stat-label">Accounts</div>
    </div>
    <div class="stat">
      <div class="stat-value">{total_contacts}</div>
      <div class="stat-label">Decision Makers</div>
    </div>
    <div class="stat">
      <div class="stat-value">{total_emails}</div>
      <div class="stat-label">Emails</div>
      {email_sublabel}
    </div>
    <div class="stat">
      <div class="stat-value">{len(states)}</div>
      <div class="stat-label">States</div>
    </div>
  </div>
  <div class="intro">
    <p>These accounts were identified using firmographic data, technology signals, and semantic matching against {esc(prospect_name)}'s ideal customer profile. Key contacts were selected based on decision-making authority for operations and technology purchases.</p>
  </div>
  {"" if inferred == 0 else '''<div class="legend">
    <div class="legend-item"><div class="legend-dot legend-dot-verified"></div> Verified email</div>
    <div class="legend-item"><div class="legend-dot legend-dot-inferred"></div> Inferred from company pattern</div>
  </div>'''}
  <div class="table-section">
{''.join(company_sections)}
  </div>
  <div class="cta-section">
    <h2>This is a sample of what we can build.</h2>
    <p>We source the accounts, find the right people, and give your team a list they can actually work. Let's talk about building pipeline for {esc(prospect_name)}.</p>
    <a class="cta-button" href="{esc(cal_link)}" target="_blank">Schedule a Call &rarr;</a>
  </div>
  <div class="footer">
    <div class="footer-logo">Drive<span>ROI</span></div>
    <div class="footer-text"><a href="https://driveroi.ai">driveroi.ai</a></div>
  </div>
</div>
<script>
(function() {{
  var header = document.getElementById('header');
  var bar = document.getElementById('floatingBar');
  if (!header || !bar) return;
  var threshold = header.offsetTop + header.offsetHeight;
  window.addEventListener('scroll', function() {{
    if (window.scrollY > threshold) {{
      bar.classList.add('visible');
    }} else {{
      bar.classList.remove('visible');
    }}
  }});
}})();
</script>
</body>
</html>"""


# ---------------------------------------------------------------------------
# CSV parsing
# ---------------------------------------------------------------------------

# Map common Clay column name variations to our internal keys
COLUMN_MAP = {
    "club name":        "company_name",
    "company name":     "company_name",
    "company":          "company_name",
    "domain":           "domain",
    "company domain":   "domain",
    "first name":       "first_name",
    "last name":        "last_name",
    "full name":        "full_name",
    "job title":        "title",
    "title":            "title",
    "location":         "location",
    "linkedin profile": "linkedin",
    "linkedin":         "linkedin",
    "linkedin url":     "linkedin",
    "valid email":      "email",
    "email":            "email",
    "work email":       "email",
}


def normalize_col(col):
    return col.strip().lower()


def parse_clay_csv(csv_path):
    """Parse a Clay CSV export into a list of contact dicts."""
    contacts = []
    with open(csv_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)

        # Build column mapping
        col_map = {}
        for raw_col in reader.fieldnames:
            normalized = normalize_col(raw_col)
            if normalized in COLUMN_MAP:
                col_map[raw_col] = COLUMN_MAP[normalized]

        for row in reader:
            contact = {}
            for raw_col, key in col_map.items():
                contact[key] = (row.get(raw_col) or "").strip()

            # Skip rows with no name
            if not contact.get("full_name") and not contact.get("first_name"):
                continue

            # Build full_name if missing
            if not contact.get("full_name"):
                contact["full_name"] = f"{contact.get('first_name', '')} {contact.get('last_name', '')}".strip()

            # Use company domain as fallback for domain
            if not contact.get("domain") and contact.get("company_domain"):
                contact["domain"] = contact["company_domain"]

            contacts.append(contact)

    return contacts


def filter_non_us(contacts):
    """Remove contacts obviously located outside the US."""
    non_us_indicators = [
        "south africa", "united kingdom", "canada", "australia",
        "india", "germany", "france", "brazil", "mexico",
        "johannesburg", "london", "toronto", "mumbai", "berlin",
    ]
    filtered = []
    for c in contacts:
        loc = (c.get("location") or "").lower()
        if any(indicator in loc for indicator in non_us_indicators):
            continue
        filtered.append(c)
    return filtered


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Generate a DriveROI ICP deliverable page")
    parser.add_argument("--csv", required=True, help="Path to Clay CSV export")
    parser.add_argument("--prospect", required=True, help="Prospect company name")
    parser.add_argument("--cal-link", default="https://cal.com/driveroi/30min", help="Scheduling link for CTA")
    parser.add_argument("--output", required=True, help="Output HTML file path")
    parser.add_argument("--no-filter", action="store_true", help="Skip filtering non-US contacts")
    parser.add_argument("--no-infer", action="store_true", help="Skip email inference")
    args = parser.parse_args()

    # Parse CSV
    contacts = parse_clay_csv(args.csv)
    print(f"Parsed {len(contacts)} contacts from CSV")

    # Filter non-US
    if not args.no_filter:
        before = len(contacts)
        contacts = filter_non_us(contacts)
        removed = before - len(contacts)
        if removed:
            print(f"Removed {removed} non-US contacts")

    # Group by company
    companies = defaultdict(list)
    for c in contacts:
        key = (c.get("company_name", "Unknown"), c.get("domain", ""))
        companies[key].append(c)

    print(f"Found {len(companies)} companies")

    # Infer emails
    if not args.no_infer:
        inferred_count = 0
        for key, cs in companies.items():
            _, domain = key
            if not domain:
                continue
            pattern = infer_company_pattern(cs)
            if not pattern:
                continue
            for c in cs:
                if c.get("email"):
                    continue
                first = c.get("first_name", "")
                last = c.get("last_name", "")
                if not first or not last:
                    continue
                inferred = infer_email(first, last, domain, pattern)
                if inferred:
                    c["email"] = inferred
                    c["inferred"] = True
                    inferred_count += 1
        if inferred_count:
            print(f"Inferred {inferred_count} emails from company patterns")

    # Generate HTML
    month_year = datetime.now().strftime("%B %Y")
    html_content = generate_html(args.prospect, args.cal_link, companies, month_year)

    # Write output
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(html_content, encoding="utf-8")
    print(f"Deliverable written to {output_path}")
    print(f"Deploy and share: driveroi.vercel.app/leads/{output_path.name}")


if __name__ == "__main__":
    main()
