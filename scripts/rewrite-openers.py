"""One-time script to rewrite DM1 openers from career-arc style to Kellen Casemir's
company-focused Full Story format."""

import csv
import re
import random

CSV_PATH = "data/rev-leaders-v2-dm1-openers.csv"

MANUAL = {
    "zv@constructor.tech": (
        "Great to connect. Zoran, was looking at Constructor Tech trying to understand "
        "how the team is reaching edtech buyers at the university level. Are you seeing "
        "traction from direct outbound right now? Curious to hear how others selling into "
        "higher ed tech are building pipeline these days, Scott."
    ),
    "nate.gosselin@mybrightwheel.com": (
        "Great to connect. Nate, was looking at brightwheel trying to understand how the "
        "sales team is reaching childcare operators who are juggling everything. Is cold "
        "outbound part of the motion or mostly inbound and referral? Curious to hear how "
        "others selling into that space are building pipeline right now, Scott."
    ),
    "david.howard@dsisystemsinc.com": (
        "Great to connect. David, was looking at DSI trying to understand how the team "
        "finds new retail partners and distributors. Is outbound working in distribution "
        "or is it mostly relationship-driven? Curious to hear how others selling into "
        "retail distribution are building pipeline right now, Scott."
    ),
    "kelly.green@circles.co": (
        "Great to connect. Kelly, was looking at Circles trying to understand how the "
        "team is reaching telco buyers who are rethinking their stack. Is outbound part "
        "of the motion or mostly partner-driven right now? Curious to hear how others "
        "selling into telecom are building pipeline these days, Scott."
    ),
    "sunny.joshi@veritasprime.com": (
        "Great to connect. Sunny, was looking at Veritas Prime trying to understand how "
        "a boutique SAP shop approaches outbound to SuccessFactors buyers. Is the team "
        "doing direct outreach or mostly referral-based? Curious to hear how others "
        "selling into the SAP ecosystem are building pipeline right now, Scott."
    ),
    "jkoronich@kpa.io": (
        "Great to connect. Josh, was looking at KPA trying to understand how the sales "
        "team is generating pipeline in the compliance space. Is cold outbound working "
        "or mostly channel and referral? Curious to hear how others selling into EHS "
        "and compliance are building pipeline right now, Scott."
    ),
    "ryan.biever@optibus.com": (
        "Great to connect. Ryan, was looking at Optibus trying to understand how the "
        "team knows when a transit agency is ready to buy vs. just evaluating. Is there "
        "a signal the team trusts for that? Curious to hear how others selling into "
        "public transit tech are building pipeline right now, Scott."
    ),
    "sonny.pannu@adroll.com": (
        "Great to connect. Sonny, was looking at AdRoll trying to understand how the "
        "team is cutting through the noise to reach midmarket ecommerce buyers. Is "
        "outbound part of the revenue acceleration motion right now? Curious to hear "
        "how others selling into ecommerce tech are building pipeline these days, Scott."
    ),
}

INDUSTRY_MAP = [
    (r"healthcare|health|medical|clinical|pharma|HIPAA|patient|therapy|hospital", "healthcare tech"),
    (r"fintech|financial|banking|payments|lending|insurance|insurtech|billing|invoice|treasury", "financial services"),
    (r"cybersecurity|cyber|security|infosec|CISO|threat|vulnerability", "cybersecurity"),
    (r"edtech|education|university|K-12|school|learning|LMS|training", "edtech"),
    (r"ecommerce|e-commerce|retail|DTC|consumer|shopping", "ecommerce"),
    (r"telecom|telco|5G|BSS|OSS|mobile|carrier", "telecom"),
    (r"legal|law firm|CLM|contract|compliance|regulatory|ethics", "legal and compliance tech"),
    (r"HR|human resources|recruiting|talent|staffing|workforce|payroll|PEO", "HR tech"),
    (r"construction|building|capital project|contractor", "construction tech"),
    (r"manufacturing|industrial|supply chain|logistics|warehouse|fulfillment|distribution", "industrial tech"),
    (r"government|public sector|federal|muni|transit|agency|defense|DoD", "government tech"),
    (r"developer|DevOps|engineering|API|open.?source|code", "developer tools"),
    (r"real estate|property|CRE|multifamily", "real estate tech"),
    (r"energy|oil|gas|utility|solar|cleantech", "energy tech"),
    (r"media|advertising|ad.?tech|marketing.?tech|programmatic|intent|ABM", "ad and marketing tech"),
    (r"data|analytics|AI|machine learning|observability|monitoring", "data and analytics"),
    (r"SaaS|software|B2B|enterprise|platform|cloud", "B2B SaaS"),
]


def detect_industry(text):
    for pattern, label in INDUSTRY_MAP:
        if re.search(pattern, text, re.IGNORECASE):
            return label
    return "your space"


def extract_curious_part(opener):
    """Pull out the 'Curious ...' portion from the opener."""
    # Match from Curious/Always curious to end
    m = re.search(r"(Always c|C)urious\s+.+", opener)
    if m:
        return m.group(0).rstrip(".")
    return None


def rewrite(row):
    email = row["email"].lower()
    if email in MANUAL:
        return MANUAL[email]

    opener = row["dm1_opener"]
    first_name = row["first_name"]
    company = row["company_name"]

    # Strip existing 'Great to connect.' prefix
    opener = re.sub(r"^Great to connect\.\s*", "", opener)

    curious = extract_curious_part(opener)
    if not curious:
        # Fallback: wrap the whole thing
        return (
            f"Great to connect. {first_name}, was looking at {company}. "
            f"{opener} Scott."
        )

    # Transform 'Curious what/how...' -> 'trying to understand what/how...'
    understanding = re.sub(
        r"^(Always c|C)urious", "trying to understand", curious
    )
    # Remove any trailing name mention like ", Sunny" or ", Emad"
    understanding = re.sub(r",\s*\w+\s*$", "", understanding).rstrip(".")

    industry = detect_industry(opener)

    return (
        f"Great to connect. {first_name}, was looking at {company} and "
        f"{understanding}. Curious to hear how others selling into "
        f"{industry} are building pipeline right now, Scott."
    )


def main():
    with open(CSV_PATH, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fields = reader.fieldnames
        rows = list(reader)

    for row in rows:
        row["dm1_opener"] = rewrite(row)

    with open(CSV_PATH, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Rewrote {len(rows)} openers.\n")

    print("=== ACCEPTED (hand-crafted) ===\n")
    for row in rows:
        if row.get("accepted") == "yes":
            print(f"-- {row['first_name']} {row['last_name']} ({row['company_name']})")
            print(f"   {row['dm1_opener']}")
            print()

    print("=== SAMPLES (programmatic) ===\n")
    random.seed(7)
    non_accepted = [r for r in rows if r.get("accepted") != "yes"]
    for r in random.sample(non_accepted, 6):
        print(f"-- {r['first_name']} {r['last_name']} ({r['company_name']})")
        print(f"   {r['dm1_opener']}")
        print()


if __name__ == "__main__":
    main()
