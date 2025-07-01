-- Add usage tracking columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS monthly_calculations_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_calculations_limit INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS billing_period_start DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS last_reset_date DATE DEFAULT CURRENT_DATE;

-- Update existing demo users with proper subscription info
UPDATE users 
SET 
  subscription_tier = 'free',
  monthly_calculations_used = 5,
  monthly_calculations_limit = 30
WHERE email = 'demo@example.com';

UPDATE users 
SET 
  subscription_tier = 'pro',
  monthly_calculations_used = 15,
  monthly_calculations_limit = -1  -- -1 means unlimited
WHERE email = 'user@gmail.com';

-- Create a pro demo user
INSERT INTO users (id, email, full_name, subscription_tier, monthly_calculations_used, monthly_calculations_limit) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440002', 
  'pro@example.com', 
  'Pro User', 
  'pro', 
  25, 
  -1
) ON CONFLICT (email) DO UPDATE SET
  subscription_tier = 'pro',
  monthly_calculations_used = 25,
  monthly_calculations_limit = -1;
