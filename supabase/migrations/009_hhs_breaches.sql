-- Migration 009: HHS OCR breach portal ingestion
-- Stores organization-level breach records scraped from ocrportal.hhs.gov.
-- Contact enrichment happens downstream (Clay table or follow-up script),
-- which reads from this table and pushes enriched leads to Instantly.

CREATE TABLE IF NOT EXISTS hhs_breaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  breach_id TEXT UNIQUE NOT NULL, -- stable hash of (name + date + type)
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  covered_entity_name TEXT NOT NULL,
  state TEXT,
  entity_type TEXT, -- Healthcare Provider / Health Plan / Business Associate / Healthcare Clearing House
  individuals_affected INTEGER,
  breach_submission_date DATE,
  breach_type TEXT,
  location_of_breached_info TEXT,
  ba_present BOOLEAN DEFAULT FALSE,
  web_description TEXT,
  raw_row JSONB,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  enriched_at TIMESTAMPTZ,
  pushed_to_instantly_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hhs_breaches_detected_at ON hhs_breaches(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_hhs_breaches_client ON hhs_breaches(client_id);
CREATE INDEX IF NOT EXISTS idx_hhs_breaches_state ON hhs_breaches(state);
CREATE INDEX IF NOT EXISTS idx_hhs_breaches_ba_present ON hhs_breaches(ba_present);
CREATE INDEX IF NOT EXISTS idx_hhs_breaches_submission_date ON hhs_breaches(breach_submission_date DESC);

ALTER TABLE hhs_breaches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on hhs_breaches" ON hhs_breaches FOR ALL USING (true) WITH CHECK (true);
