-- Add ICP qualification status and tier to post_engagers
-- icp_status: manual review (qualified/disqualified)
-- icp_tier: auto-computed from title (0=non-ICP, 1=adjacent, 2=influencer, 3=buyer)
ALTER TABLE post_engagers ADD COLUMN IF NOT EXISTS icp_status TEXT;
ALTER TABLE post_engagers ADD COLUMN IF NOT EXISTS icp_tier INTEGER;
