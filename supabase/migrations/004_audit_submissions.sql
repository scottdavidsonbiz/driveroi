CREATE TABLE IF NOT EXISTS audit_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  answers JSONB NOT NULL,
  category_scores JSONB NOT NULL,
  total_score INTEGER NOT NULL,
  score_tier TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
