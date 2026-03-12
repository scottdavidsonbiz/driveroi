-- Add ICP qualification status to post_engagers
-- Allows manual review: qualified = confirmed ICP, disqualified = not ICP
ALTER TABLE post_engagers ADD COLUMN IF NOT EXISTS icp_status TEXT;
