-- DriveROI Ops Database Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/pgnkxiykkurujpaitobh/sql

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client ICP and positioning (AI-generated, human-edited)
CREATE TABLE IF NOT EXISTS client_icp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE UNIQUE,
  buyer_persona TEXT,
  company_size TEXT,
  industry TEXT,
  geography TEXT,
  triggers JSONB DEFAULT '[]',
  pain_points JSONB DEFAULT '[]',
  positioning TEXT,
  email_angles JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client materials (transcripts, notes, etc.)
CREATE TABLE IF NOT EXISTS client_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  filename TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads (enriched, for deduplication)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  email TEXT,
  domain TEXT,
  first_name TEXT,
  last_name TEXT,
  title TEXT,
  company TEXT,
  linkedin_url TEXT,
  enriched_at TIMESTAMPTZ,
  source TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_email UNIQUE (email)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_leads_domain ON leads(domain);
CREATE INDEX IF NOT EXISTS idx_leads_client ON leads(client_id);
CREATE INDEX IF NOT EXISTS idx_client_materials_client ON client_materials(client_id);

-- Campaign stats snapshots (for future Instantly/HeyReach integration)
CREATE TABLE IF NOT EXISTS campaign_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  campaign_id TEXT,
  campaign_name TEXT,
  snapshot_date DATE DEFAULT CURRENT_DATE,
  sent INTEGER DEFAULT 0,
  opened INTEGER DEFAULT 0,
  replied INTEGER DEFAULT 0,
  bounced INTEGER DEFAULT 0,
  meetings INTEGER DEFAULT 0,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(platform, campaign_id, snapshot_date)
);

-- Client integrations (maps external campaigns to clients)
CREATE TABLE IF NOT EXISTS client_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'heyreach' | 'instantly'
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

-- Enable Row Level Security (but allow all for now since no auth)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_icp ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_stats ENABLE ROW LEVEL SECURITY;

-- Policies to allow all operations (no auth for V1)
CREATE POLICY "Allow all on clients" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on client_icp" ON client_icp FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on client_materials" ON client_materials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on campaign_stats" ON campaign_stats FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE client_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on client_integrations" ON client_integrations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on client_updates" ON client_updates FOR ALL USING (true) WITH CHECK (true);
