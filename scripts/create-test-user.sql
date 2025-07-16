-- Script to create a test user for authentication testing
-- This helps verify the auth flow works correctly

-- Insert a test user profile (this simulates what happens during signup)
INSERT INTO users (
  id,
  email,
  full_name,
  subscription_tier,
  subscription_status,
  pro_trial_used,
  single_reports_purchased,
  single_reports_used,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'test@example.com',
  'Test User',
  'free',
  'active',
  false,
  0,
  0,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  updated_at = NOW();

-- Insert an ION Solar test user
INSERT INTO users (
  id,
  email,
  full_name,
  subscription_tier,
  subscription_status,
  pro_trial_used,
  single_reports_purchased,
  single_reports_used,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'test@ionsolar.com',
  'ION Solar Test User',
  'pro',
  'active',
  false,
  999,
  0,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  subscription_tier = 'pro',
  single_reports_purchased = 999,
  updated_at = NOW();

-- Verify the test users were created
SELECT 
  email,
  full_name,
  subscription_tier,
  single_reports_purchased,
  CASE 
    WHEN email LIKE '%@ionsolar.com' THEN 'ION SOLAR USER ✅'
    ELSE 'REGULAR USER'
  END as user_type
FROM users 
WHERE email IN ('test@example.com', 'test@ionsolar.com')
ORDER BY email;
