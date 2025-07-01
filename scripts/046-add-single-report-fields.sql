-- Add fields to support single report purchases
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS single_report_purchased BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS single_report_session_id TEXT,
ADD COLUMN IF NOT EXISTS single_report_used BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS single_report_created_at TIMESTAMP WITH TIME ZONE;

-- Update existing users table to handle single report account type
UPDATE users 
SET account_type = 'single_report' 
WHERE single_report_purchased = TRUE AND account_type = 'free';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_single_report ON users(single_report_purchased, single_report_session_id);

-- Add constraint to ensure single report users have the correct account type
ALTER TABLE users 
ADD CONSTRAINT check_single_report_account 
CHECK (
  (single_report_purchased = FALSE) OR 
  (single_report_purchased = TRUE AND account_type IN ('single_report', 'pro', 'admin'))
);

-- Create function to check single report access
CREATE OR REPLACE FUNCTION check_single_report_access(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_record RECORD;
BEGIN
  SELECT * INTO user_record 
  FROM users 
  WHERE email = user_email;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has purchased single report and hasn't used it yet
  IF user_record.single_report_purchased = TRUE AND user_record.single_report_used = FALSE THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has pro or admin access
  IF user_record.account_type IN ('pro', 'admin') THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create function to mark single report as used
CREATE OR REPLACE FUNCTION mark_single_report_used(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE users 
  SET single_report_used = TRUE,
      single_report_created_at = NOW()
  WHERE email = user_email 
    AND single_report_purchased = TRUE 
    AND single_report_used = FALSE;
    
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;
