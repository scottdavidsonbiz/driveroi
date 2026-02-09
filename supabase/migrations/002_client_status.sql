ALTER TABLE clients ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'prospect';
-- Values: 'client', 'prospect', 'internal', 'churned'

-- Set existing data
UPDATE clients SET status = 'client' WHERE name = 'IVS';
UPDATE clients SET status = 'internal' WHERE name = 'DriveROI';
