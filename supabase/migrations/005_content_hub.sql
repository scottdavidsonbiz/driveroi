-- Migration: Content Hub tables for LinkedIn content planning and analytics

-- Content ideas backlog
CREATE TABLE IF NOT EXISTS content_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by TEXT NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'idea',
  priority INTEGER NOT NULL DEFAULT 0,
  theme_tag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_ideas_status ON content_ideas(status);
CREATE INDEX idx_content_ideas_created_by ON content_ideas(created_by);

-- Content themes (weekly/bi-weekly focus areas)
CREATE TABLE IF NOT EXISTS content_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_themes_status ON content_themes(status);

-- Content posts (drafts and published posts)
CREATE TABLE IF NOT EXISTS content_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID REFERENCES content_themes(id) ON DELETE SET NULL,
  idea_id UUID REFERENCES content_ideas(id) ON DELETE SET NULL,
  author TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'tactical',
  funnel_stage TEXT,
  post_text TEXT,
  linkedin_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_posts_author ON content_posts(author);
CREATE INDEX idx_content_posts_theme ON content_posts(theme_id);
CREATE INDEX idx_content_posts_status ON content_posts(status);

-- LinkedIn metrics (imported from CSV)
CREATE TABLE IF NOT EXISTS linkedin_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES content_posts(id) ON DELETE SET NULL,
  author TEXT NOT NULL,
  post_text TEXT,
  published_at TIMESTAMPTZ,
  impressions INTEGER DEFAULT 0,
  reactions INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  reposts INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  engagement_rate NUMERIC DEFAULT 0,
  new_followers INTEGER DEFAULT 0,
  imported_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_linkedin_metrics_author ON linkedin_metrics(author);
CREATE INDEX idx_linkedin_metrics_published ON linkedin_metrics(published_at);

-- Post engagers (ICP-qualified, from Clay webhook)
CREATE TABLE IF NOT EXISTS post_engagers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES content_posts(id) ON DELETE CASCADE,
  linkedin_url TEXT,
  name TEXT,
  title TEXT,
  company TEXT,
  domain TEXT,
  email TEXT,
  enriched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_post_engagers_post ON post_engagers(post_id);

-- RLS policies (allow all — internal tool, auth handled at app layer)
ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_engagers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on content_ideas" ON content_ideas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on content_themes" ON content_themes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on content_posts" ON content_posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on linkedin_metrics" ON linkedin_metrics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on post_engagers" ON post_engagers FOR ALL USING (true) WITH CHECK (true);
