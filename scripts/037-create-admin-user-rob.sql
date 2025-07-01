-- Create the admin user Rob with proper credentials
-- First, let's make sure we have the right structure

-- Insert or update the admin user
INSERT INTO users (
    id,
    email,
    name,
    subscription_status,
    subscription_plan,
    email_verified,
    usage_count,
    trial_ends_at,
    created_at,
    updated_at,
    last_login,
    phone,
    company
) VALUES (
    'rob-admin-uuid-12345',
    'rob@mysolarai.com',
    'Rob Solar Admin',
    'active',
    'professional',
    true,
    47,
    NULL, -- No trial end date for professional
    NOW(),
    NOW(),
    NOW(),
    '+1-555-0123',
    'Solar Grind Inc'
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    subscription_status = EXCLUDED.subscription_status,
    subscription_plan = EXCLUDED.subscription_plan,
    email_verified = EXCLUDED.email_verified,
    usage_count = EXCLUDED.usage_count,
    updated_at = NOW(),
    last_login = NOW(),
    phone = EXCLUDED.phone,
    company = EXCLUDED.company;

-- Verify the user was created
SELECT * FROM users WHERE email = 'rob@mysolarai.com';
