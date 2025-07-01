-- Complete database setup for Solar Grind V2 with hardcoded Rob admin account
-- This script creates all necessary tables, functions, and sample data

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET row_security = on;

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS public.solar_calculations CASCADE;
DROP TABLE IF EXISTS public.user_projects CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.create_user_account CASCADE;
DROP FUNCTION IF EXISTS public.update_user_login CASCADE;
DROP FUNCTION IF EXISTS public.check_user_calculation_limit CASCADE;
DROP FUNCTION IF EXISTS public.track_calculation_usage CASCADE;
DROP FUNCTION IF EXISTS public.get_user_account_info CASCADE;

-- Create users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    account_type TEXT NOT NULL DEFAULT 'free' CHECK (account_type IN ('free', 'pro', 'admin', 'enterprise')),
    subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
    subscription_plan TEXT NOT NULL DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'enterprise')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    calculations_used INTEGER NOT NULL DEFAULT 0,
    monthly_calculation_limit INTEGER NOT NULL DEFAULT 10,
    email_verified BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create user_projects table
CREATE TABLE public.user_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL REFERENCES public.users(email) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    project_name TEXT NOT NULL,
    property_address TEXT NOT NULL,
    system_size_kw DECIMAL(10,2) NOT NULL DEFAULT 0,
    annual_production_kwh DECIMAL(12,2) NOT NULL DEFAULT 0,
    system_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    net_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    annual_savings DECIMAL(12,2) NOT NULL DEFAULT 0,
    payback_period_years DECIMAL(5,2) NOT NULL DEFAULT 0,
    roi_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'on_hold')),
    project_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create solar_calculations table
CREATE TABLE public.solar_calculations (
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL REFERENCES public.users(email) ON DELETE CASCADE,
    address TEXT NOT NULL,
    monthly_kwh DECIMAL(10,2) NOT NULL,
    electricity_rate DECIMAL(6,4) NOT NULL,
    calculation_type TEXT NOT NULL DEFAULT 'basic',
    system_size_kw DECIMAL(10,2),
    annual_production_kwh DECIMAL(12,2),
    system_cost DECIMAL(12,2),
    annual_savings DECIMAL(12,2),
    payback_period DECIMAL(5,2),
    calculation_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_calculations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.email() = email OR EXISTS (
        SELECT 1 FROM public.users WHERE email = auth.email() AND account_type = 'admin'
    ));

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.email() = email OR EXISTS (
        SELECT 1 FROM public.users WHERE email = auth.email() AND account_type = 'admin'
    ));

CREATE POLICY "Anyone can insert users" ON public.users
    FOR INSERT WITH CHECK (true);

-- Create RLS policies for user_projects table
CREATE POLICY "Users can view own projects" ON public.user_projects
    FOR SELECT USING (user_email = auth.email() OR EXISTS (
        SELECT 1 FROM public.users WHERE email = auth.email() AND account_type = 'admin'
    ));

CREATE POLICY "Users can insert own projects" ON public.user_projects
    FOR INSERT WITH CHECK (user_email = auth.email() OR EXISTS (
        SELECT 1 FROM public.users WHERE email = auth.email() AND account_type = 'admin'
    ));

CREATE POLICY "Users can update own projects" ON public.user_projects
    FOR UPDATE USING (user_email = auth.email() OR EXISTS (
        SELECT 1 FROM public.users WHERE email = auth.email() AND account_type = 'admin'
    ));

-- Create RLS policies for solar_calculations table
CREATE POLICY "Users can view own calculations" ON public.solar_calculations
    FOR SELECT USING (user_email = auth.email() OR EXISTS (
        SELECT 1 FROM public.users WHERE email = auth.email() AND account_type = 'admin'
    ));

CREATE POLICY "Users can insert own calculations" ON public.solar_calculations
    FOR INSERT WITH CHECK (user_email = auth.email() OR EXISTS (
        SELECT 1 FROM public.users WHERE email = auth.email() AND account_type = 'admin'
    ));

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_account_type ON public.users(account_type);
CREATE INDEX idx_user_projects_user_email ON public.user_projects(user_email);
CREATE INDEX idx_user_projects_status ON public.user_projects(status);
CREATE INDEX idx_solar_calculations_user_email ON public.solar_calculations(user_email);
CREATE INDEX idx_solar_calculations_created_at ON public.solar_calculations(created_at);

-- Create secure function to create/update user accounts
CREATE OR REPLACE FUNCTION public.create_user_account(
    user_id UUID,
    user_email TEXT,
    user_name TEXT,
    user_account_type TEXT DEFAULT 'free'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    monthly_limit INTEGER;
BEGIN
    -- Set monthly limit based on account type
    CASE user_account_type
        WHEN 'admin' THEN monthly_limit := 999999;
        WHEN 'pro' THEN monthly_limit := 100;
        WHEN 'enterprise' THEN monthly_limit := 999999;
        ELSE monthly_limit := 10;
    END CASE;

    -- Insert or update user record
    INSERT INTO public.users (
        id, email, name, account_type, monthly_calculation_limit,
        subscription_plan, subscription_status, created_at, updated_at
    )
    VALUES (
        user_id, user_email, user_name, user_account_type, monthly_limit,
        CASE WHEN user_account_type = 'admin' THEN 'enterprise' ELSE user_account_type END,
        'active', NOW(), NOW()
    )
    ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        account_type = EXCLUDED.account_type,
        monthly_calculation_limit = EXCLUDED.monthly_calculation_limit,
        subscription_plan = EXCLUDED.subscription_plan,
        updated_at = NOW();

    result := json_build_object('success', true, 'message', 'User account created/updated successfully');
    RETURN result;

EXCEPTION WHEN OTHERS THEN
    result := json_build_object('success', false, 'error', SQLERRM);
    RETURN result;
END;
$$;

-- Create function to update user login timestamp
CREATE OR REPLACE FUNCTION public.update_user_login(user_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.users 
    SET last_login = NOW(), updated_at = NOW()
    WHERE email = user_email;
END;
$$;

-- Create function to check calculation limits
CREATE OR REPLACE FUNCTION public.check_user_calculation_limit(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
    current_month_start DATE;
    calculations_this_month INTEGER;
BEGIN
    -- Get user data
    SELECT * INTO user_record FROM public.users WHERE email = user_email;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Admin users have unlimited calculations
    IF user_record.account_type = 'admin' THEN
        RETURN TRUE;
    END IF;

    -- Calculate start of current month
    current_month_start := DATE_TRUNC('month', CURRENT_DATE);

    -- Count calculations this month
    SELECT COUNT(*) INTO calculations_this_month
    FROM public.solar_calculations
    WHERE user_email = user_email
    AND created_at >= current_month_start;

    -- Check if under limit
    RETURN calculations_this_month < user_record.monthly_calculation_limit;
END;
$$;

-- Create function to track calculation usage
CREATE OR REPLACE FUNCTION public.track_calculation_usage(
    user_email TEXT,
    calc_type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_month_start DATE;
    calculations_this_month INTEGER;
BEGIN
    -- Calculate start of current month
    current_month_start := DATE_TRUNC('month', CURRENT_DATE);

    -- Count calculations this month
    SELECT COUNT(*) INTO calculations_this_month
    FROM public.solar_calculations
    WHERE user_email = user_email
    AND created_at >= current_month_start;

    -- Update user's calculation count
    UPDATE public.users 
    SET calculations_used = calculations_this_month + 1,
        updated_at = NOW()
    WHERE email = user_email;
END;
$$;

-- Create function to get user account info
CREATE OR REPLACE FUNCTION public.get_user_account_info(user_email TEXT)
RETURNS TABLE(
    email TEXT,
    name TEXT,
    account_type TEXT,
    subscription_plan TEXT,
    calculations_used INTEGER,
    monthly_limit INTEGER,
    projects_count BIGINT,
    total_savings DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.email,
        u.name,
        u.account_type,
        u.subscription_plan,
        u.calculations_used,
        u.monthly_calculation_limit,
        COALESCE(p.project_count, 0) as projects_count,
        COALESCE(p.total_savings, 0) as total_savings
    FROM public.users u
    LEFT JOIN (
        SELECT 
            user_email,
            COUNT(*) as project_count,
            SUM(annual_savings) as total_savings
        FROM public.user_projects
        WHERE status = 'active'
        GROUP BY user_email
    ) p ON u.email = p.user_email
    WHERE u.email = user_email;
END;
$$;

-- Insert hardcoded Rob admin account
INSERT INTO public.users (
    id,
    email,
    name,
    account_type,
    subscription_plan,
    subscription_status,
    monthly_calculation_limit,
    calculations_used,
    email_verified,
    created_at,
    updated_at,
    last_login
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'rob@mysolarai.com',
    'Rob Solar - Admin',
    'admin',
    'enterprise',
    'active',
    999999,
    0,
    true,
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    account_type = EXCLUDED.account_type,
    subscription_plan = EXCLUDED.subscription_plan,
    monthly_calculation_limit = EXCLUDED.monthly_calculation_limit,
    updated_at = NOW();

-- Insert sample projects for Rob
INSERT INTO public.user_projects (
    user_email,
    customer_name,
    project_name,
    property_address,
    system_size_kw,
    annual_production_kwh,
    system_cost,
    net_cost,
    annual_savings,
    payback_period_years,
    roi_percentage,
    status,
    created_at
) VALUES 
(
    'rob@mysolarai.com',
    'Johnson Family',
    'Residential Solar - Johnson Family',
    '123 Oak Street, Austin, TX 78701',
    8.5,
    12750,
    25500,
    17850,
    1250,
    14.3,
    7.0,
    'completed',
    '2024-01-15'::timestamp
),
(
    'rob@mysolarai.com',
    'Tech Startup Inc',
    'Commercial Solar - Tech Startup',
    '456 Innovation Drive, San Francisco, CA 94105',
    45.2,
    67800,
    135600,
    94920,
    8500,
    11.2,
    8.9,
    'active',
    '2024-01-20'::timestamp
),
(
    'rob@mysolarai.com',
    'Manufacturing Corp',
    'Industrial Solar - Manufacturing Plant',
    '789 Industrial Blvd, Phoenix, AZ 85001',
    125.8,
    188700,
    377400,
    264180,
    22000,
    12.0,
    8.3,
    'completed',
    '2024-01-25'::timestamp
),
(
    'rob@mysolarai.com',
    'Smith Residence',
    'Residential Solar - Smith Residence',
    '321 Pine Avenue, Denver, CO 80202',
    6.2,
    9300,
    18600,
    13020,
    950,
    13.7,
    7.3,
    'active',
    '2024-02-01'::timestamp
),
(
    'rob@mysolarai.com',
    'Retail Chain LLC',
    'Commercial Solar - Retail Chain',
    '654 Commerce Street, Miami, FL 33101',
    78.5,
    117750,
    235500,
    164850,
    15200,
    10.8,
    9.2,
    'active',
    '2024-02-05'::timestamp
);

-- Insert sample calculations for Rob
INSERT INTO public.solar_calculations (
    user_email,
    address,
    monthly_kwh,
    electricity_rate,
    calculation_type,
    system_size_kw,
    annual_production_kwh,
    system_cost,
    annual_savings,
    payback_period,
    created_at
) VALUES 
(
    'rob@mysolarai.com',
    '123 Oak Street, Austin, TX 78701',
    1062.5,
    0.12,
    'Basic Solar Analysis',
    8.5,
    12750,
    25500,
    1250,
    14.3,
    '2024-01-15'::timestamp
),
(
    'rob@mysolarai.com',
    '456 Innovation Drive, San Francisco, CA 94105',
    5650,
    0.18,
    'Advanced PV Analysis',
    45.2,
    67800,
    135600,
    8500,
    11.2,
    '2024-01-20'::timestamp
),
(
    'rob@mysolarai.com',
    '789 Industrial Blvd, Phoenix, AZ 85001',
    15725,
    0.14,
    'Commercial Solar Study',
    125.8,
    188700,
    377400,
    22000,
    12.0,
    '2024-01-25'::timestamp
),
(
    'rob@mysolarai.com',
    '321 Pine Avenue, Denver, CO 80202',
    775,
    0.13,
    'Residential Assessment',
    6.2,
    9300,
    18600,
    950,
    13.7,
    '2024-02-01'::timestamp
),
(
    'rob@mysolarai.com',
    '654 Commerce Street, Miami, FL 33101',
    9812.5,
    0.15,
    'Smart Solar Analysis',
    78.5,
    117750,
    235500,
    15200,
    10.8,
    '2024-02-05'::timestamp
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER handle_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_user_projects_updated_at
    BEFORE UPDATE ON public.user_projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Verify the setup
DO $$
DECLARE
    user_count INTEGER;
    project_count INTEGER;
    calc_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM public.users WHERE email = 'rob@mysolarai.com';
    SELECT COUNT(*) INTO project_count FROM public.user_projects WHERE user_email = 'rob@mysolarai.com';
    SELECT COUNT(*) INTO calc_count FROM public.solar_calculations WHERE user_email = 'rob@mysolarai.com';
    
    RAISE NOTICE 'Database setup complete!';
    RAISE NOTICE 'Rob admin user: % record(s)', user_count;
    RAISE NOTICE 'Sample projects: % record(s)', project_count;
    RAISE NOTICE 'Sample calculations: % record(s)', calc_count;
    
    IF user_count = 1 AND project_count = 5 AND calc_count = 5 THEN
        RAISE NOTICE 'SUCCESS: All data inserted correctly!';
    ELSE
        RAISE NOTICE 'WARNING: Data counts do not match expected values!';
    END IF;
END;
$$;
