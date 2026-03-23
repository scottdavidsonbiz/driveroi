CREATE TABLE IF NOT EXISTS personalized_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  company_name TEXT,
  company_domain TEXT,
  job_title TEXT,
  employees TEXT,
  location TEXT,
  linkedin_url TEXT,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'researched', 'email_drafted', 'email_found', 'pushed_to_instantly', 'skipped')),
  campaign_id TEXT,
  subject_1 TEXT,
  body_1 TEXT,
  subject_2 TEXT,
  body_2 TEXT,
  subject_3 TEXT,
  body_3 TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(email, company_domain)
);

CREATE INDEX idx_personalized_queue_status ON personalized_queue(status);
