-- Lead pool for autoresearch email optimization
-- Clay pushes enriched leads here via webhook
-- Orchestrator draws leads for baseline/challenger experiments

CREATE TABLE IF NOT EXISTS lead_pool (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  company_domain TEXT,
  job_title TEXT,
  industry TEXT,
  location TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'contacted', 'replied')),
  experiment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_lead_pool_status ON lead_pool(status);
CREATE INDEX idx_lead_pool_experiment ON lead_pool(experiment_id);

-- Contacted leads dedup table (never email anyone twice)
CREATE TABLE IF NOT EXISTS lead_pool_contacted (
  email TEXT PRIMARY KEY,
  experiment_id TEXT,
  campaign_id TEXT,
  contacted_at TIMESTAMPTZ DEFAULT now()
);

-- Experiment results log
CREATE TABLE IF NOT EXISTS autoresearch_experiments (
  id TEXT PRIMARY KEY,
  baseline_campaign_id TEXT,
  challenger_campaign_id TEXT,
  baseline_config JSONB,
  challenger_config JSONB,
  baseline_sent INTEGER DEFAULT 0,
  baseline_replies INTEGER DEFAULT 0,
  baseline_interested INTEGER DEFAULT 0,
  challenger_sent INTEGER DEFAULT 0,
  challenger_replies INTEGER DEFAULT 0,
  challenger_interested INTEGER DEFAULT 0,
  winner TEXT CHECK (winner IN ('baseline', 'challenger', 'tie', 'pending')),
  hypothesis TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  harvested_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'harvested', 'failed'))
);
