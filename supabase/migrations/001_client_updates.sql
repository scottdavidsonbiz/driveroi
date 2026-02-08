-- Migration: Add client_integrations and client_updates tables
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/pgnkxiykkurujpaitobh/sql

-- Client integrations (maps external campaigns to clients)
CREATE TABLE IF NOT EXISTS client_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  external_campaign_id TEXT NOT NULL,
  campaign_name TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, external_campaign_id)
);

-- Client updates (generated weekly update snapshots)
CREATE TABLE IF NOT EXISTS client_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  period_start DATE,
  period_end DATE,
  metrics_snapshot JSONB,
  previous_snapshot JSONB,
  narrative TEXT,
  recommendations JSONB,
  markdown_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_integrations_client ON client_integrations(client_id);
CREATE INDEX IF NOT EXISTS idx_client_updates_client ON client_updates(client_id);

ALTER TABLE client_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on client_integrations" ON client_integrations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on client_updates" ON client_updates FOR ALL USING (true) WITH CHECK (true);

-- Seed IVS/IBS campaign mappings
-- NOTE: Replace the client_id UUID below with the actual IVS client UUID from the clients table
-- You can find it with: SELECT id FROM clients WHERE name ILIKE '%IVS%' OR name ILIKE '%IBS%';
--
-- INSERT INTO client_integrations (client_id, platform, external_campaign_id, campaign_name) VALUES
--   ('YOUR-IVS-CLIENT-UUID', 'heyreach', '296817', 'IVS marketing list - connection'),
--   ('YOUR-IVS-CLIENT-UUID', 'heyreach', '312975', 'Oilfield Svc'),
--   ('YOUR-IVS-CLIENT-UUID', 'heyreach', '324743', 'Chem Mfg');
