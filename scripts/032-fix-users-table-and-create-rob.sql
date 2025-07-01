-- First, let's add any missing columns to the users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

-- Now create Rob's admin account with proper data
INSERT INTO users (
    id,
    email,
    name,
    subscription_status,
    subscription_plan,
    email_verified,
    phone,
    company,
    created_at,
    updated_at,
    last_login,
    stripe_customer_id,
    trial_ends_at,
    usage_count
) VALUES (
    'rob-admin-uuid-12345',
    'rob@mysolarai.com',
    'Rob Anderson',
    'active',
    'professional',
    true,
    '+1-555-0123',
    'Solar Grind Pro',
    NOW(),
    NOW(),
    NOW(),
    'cus_rob_stripe_12345',
    NOW() + INTERVAL '30 days',
    0
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    subscription_status = EXCLUDED.subscription_status,
    subscription_plan = EXCLUDED.subscription_plan,
    email_verified = EXCLUDED.email_verified,
    phone = EXCLUDED.phone,
    company = EXCLUDED.company,
    updated_at = NOW(),
    last_login = NOW();

-- Insert sample projects for Rob
INSERT INTO user_projects (
    id,
    user_email,
    customer_name,
    project_name,
    property_address,
    system_size_kw,
    annual_production_kwh,
    system_cost,
    net_cost,
    annual_savings,
    status,
    created_at,
    updated_at,
    notes,
    installation_date
) VALUES 
(
    'proj-001-rob',
    'rob@mysolarai.com',
    'Johnson Family',
    'Residential Solar Installation',
    '123 Maple Street, Austin, TX 78701',
    8.5,
    12750,
    25500,
    17850,
    2340,
    'active',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '5 days',
    'Premium installation with Tesla Powerwall',
    NOW() + INTERVAL '30 days'
),
(
    'proj-002-rob',
    'rob@mysolarai.com',
    'Smith Residence',
    'Rooftop Solar System',
    '456 Oak Avenue, Dallas, TX 75201',
    12.0,
    18000,
    36000,
    25200,
    3120,
    'completed',
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '10 days',
    'Ground mount system with battery backup',
    NOW() - INTERVAL '5 days'
),
(
    'proj-003-rob',
    'rob@mysolarai.com',
    'Green Energy Corp',
    'Commercial Solar Array',
    '789 Business Blvd, Houston, TX 77001',
    50.0,
    75000,
    150000,
    105000,
    15600,
    'proposal',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '2 days',
    'Large commercial installation with monitoring',
    NOW() + INTERVAL '60 days'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample calculations for Rob
INSERT INTO solar_calculations (
    user_email,
    address,
    coordinates,
    monthly_kwh,
    electricity_rate,
    results,
    created_at,
    updated_at,
    calculation_type,
    system_size_kw,
    annual_production_kwh
) VALUES 
(
    'rob@mysolarai.com',
    '123 Maple Street, Austin, TX 78701',
    '30.2672,-97.7431',
    850,
    0.12,
    '{"systemSize": 8.5, "annualProduction": 12750, "monthlySavings": 195, "paybackPeriod": 7.6, "co2Offset": 8950}',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '15 days',
    'pro',
    8.5,
    12750
),
(
    'rob@mysolarai.com',
    '456 Oak Avenue, Dallas, TX 75201',
    '32.7767,-96.7970',
    1200,
    0.11,
    '{"systemSize": 12.0, "annualProduction": 18000, "monthlySavings": 260, "paybackPeriod": 8.1, "co2Offset": 12600}',
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '45 days',
    'pro',
    12.0,
    18000
);

-- Insert usage tracking for Rob
INSERT INTO usage_tracking (
    user_email,
    calculation_type,
    created_at
) VALUES 
('rob@mysolarai.com', 'pro', NOW() - INTERVAL '15 days'),
('rob@mysolarai.com', 'pro', NOW() - INTERVAL '45 days'),
('rob@mysolarai.com', 'basic', NOW() - INTERVAL '30 days');

-- Verify the account was created
SELECT 
    email,
    name,
    subscription_status,
    subscription_plan,
    email_verified,
    created_at
FROM users 
WHERE email = 'rob@mysolarai.com';
