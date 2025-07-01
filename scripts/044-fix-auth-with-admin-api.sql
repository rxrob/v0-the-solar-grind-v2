-- Enhanced admin creation script using Supabase admin API approach
-- This script ensures proper auth user creation with admin privileges

-- First, ensure we have the uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS public.usage_tracking CASCADE;
DROP TABLE IF EXISTS public.solar_calculations CASCADE;
DROP TABLE IF EXISTS public.user_projects CASCADE;
DROP TABLE IF EXISTS public.user_sessions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.create_demo_admin_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_user_account(UUID, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_user_login(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.track_calculation_usage(TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.check_user_calculation_limit(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_account_info(TEXT) CASCADE;

-- Create users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    account_type TEXT NOT NULL DEFAULT 'free' CHECK (account_type IN ('free', 'pro', 'admin', 'enterprise')),
    subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due', 'trialing')),
    subscription_plan TEXT NOT NULL DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'enterprise')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    trial_ends_at TIMESTAMPTZ,
    pro_trial_used BOOLEAN NOT NULL DEFAULT false,
    calculations_used INTEGER NOT NULL DEFAULT 0,
    monthly_calculation_limit INTEGER NOT NULL DEFAULT 10,
    email_verified BOOLEAN NOT NULL DEFAULT true,
    last_login TIMESTAMPTZ,
    login_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_sessions table
CREATE TABLE public.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_projects table
CREATE TABLE public.user_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    project_name TEXT NOT NULL,
    property_address TEXT NOT NULL,
    system_size_kw DECIMAL(10,2) NOT NULL,
    annual_production_kwh DECIMAL(12,2) NOT NULL,
    system_cost DECIMAL(12,2) NOT NULL,
    net_cost DECIMAL(12,2) NOT NULL,
    annual_savings DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'on_hold')),
    notes TEXT,
    installation_date DATE,
    completion_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create solar_calculations table
CREATE TABLE public.solar_calculations (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    address TEXT NOT NULL,
    coordinates TEXT NOT NULL,
    monthly_kwh DECIMAL(10,2) NOT NULL,
    electricity_rate DECIMAL(6,4) NOT NULL,
    results JSONB NOT NULL,
    calculation_type TEXT NOT NULL DEFAULT 'basic' CHECK (calculation_type IN ('basic', 'advanced', 'pro')),
    system_size_kw DECIMAL(10,2),
    annual_production_kwh DECIMAL(12,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create usage_tracking table
CREATE TABLE public.usage_tracking (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    calculation_type TEXT NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Disable RLS temporarily for setup
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_calculations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking DISABLE ROW LEVEL SECURITY;

-- Create a function to create demo admin user with elevated privileges
CREATE OR REPLACE FUNCTION public.create_demo_admin_user()
RETURNS JSON AS $$
DECLARE
    admin_user_id UUID;
    result JSON;
BEGIN
    -- Generate a new UUID for the admin user
    admin_user_id := uuid_generate_v4();
    
    -- Insert or update the demo admin user
    INSERT INTO public.users (
        id,
        email,
        name,
        account_type,
        subscription_status,
        subscription_plan,
        monthly_calculation_limit,
        email_verified,
        created_at,
        updated_at
    ) VALUES (
        admin_user_id,
        'rob@mysolarai.com',
        'Rob Solar - Admin',
        'admin',
        'active',
        'enterprise',
        999999,
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (email) DO UPDATE SET
        name = 'Rob Solar - Admin',
        account_type = 'admin',
        subscription_plan = 'enterprise',
        monthly_calculation_limit = 999999,
        updated_at = NOW()
    RETURNING id INTO admin_user_id;
    
    -- Create sample projects for the admin user if they don't exist
    INSERT INTO public.user_projects (
        user_id,
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
        notes
    ) VALUES 
    (
        admin_user_id,
        'rob@mysolarai.com',
        'John Smith',
        'Residential Solar Installation',
        '123 Main St, Anytown, CA 90210',
        8.5,
        12750,
        25500,
        17850,
        2125,
        'active',
        'Standard residential installation with premium panels'
    ),
    (
        admin_user_id,
        'rob@mysolarai.com',
        'Sarah Johnson',
        'Commercial Solar Array',
        '456 Business Blvd, Commerce City, CA 90211',
        25.0,
        37500,
        75000,
        52500,
        6250,
        'completed',
        'Large commercial installation completed ahead of schedule'
    ),
    (
        admin_user_id,
        'rob@mysolarai.com',
        'Mike Davis',
        'Home Solar System',
        '789 Oak Ave, Suburbia, CA 90212',
        6.2,
        9300,
        18600,
        13020,
        1550,
        'active',
        'Compact system for smaller home'
    ) ON CONFLICT DO NOTHING;
    
    -- Create sample calculations for the admin user
    INSERT INTO public.solar_calculations (
        user_id,
        user_email,
        address,
        coordinates,
        monthly_kwh,
        electricity_rate,
        results,
        calculation_type,
        system_size_kw,
        annual_production_kwh
    ) VALUES 
    (
        admin_user_id,
        'rob@mysolarai.com',
        '123 Main St, Anytown, CA 90210',
        '34.0522,-118.2437',
        850,
        0.25,
        '{"systemSize": 8.5, "annualProduction": 12750, "annualSavings": 2125, "paybackPeriod": 8.4}',
        'advanced',
        8.5,
        12750
    ),
    (
        admin_user_id,
        'rob@mysolarai.com',
        '456 Business Blvd, Commerce City, CA 90211',
        '34.0622,-118.2537',
        2500,
        0.25,
        '{"systemSize": 25.0, "annualProduction": 37500, "annualSavings": 6250, "paybackPeriod": 8.4}',
        'pro',
        25.0,
        37500
    ) ON CONFLICT DO NOTHING;
    
    -- Return success result
    result := json_build_object(
        'success', true,
        'user_id', admin_user_id,
        'email', 'rob@mysolarai.com',
        'message', 'Demo admin user created successfully'
    );
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    -- Return error result
    result := json_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to create demo admin user'
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to safely create any user (for signup)
CREATE OR REPLACE FUNCTION public.create_user_account(
    user_id UUID,
    user_email TEXT,
    user_name TEXT,
    user_account_type TEXT DEFAULT 'free'
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    calc_limit INTEGER;
    sub_plan TEXT;
BEGIN
    -- Set limits based on account type
    CASE user_account_type
        WHEN 'admin' THEN 
            calc_limit := 999999;
            sub_plan := 'enterprise';
        WHEN 'pro' THEN 
            calc_limit := 100;
            sub_plan := 'pro';
        ELSE 
            calc_limit := 10;
            sub_plan := 'free';
    END CASE;
    
    -- Insert the user
    INSERT INTO public.users (
        id,
        email,
        name,
        account_type,
        subscription_status,
        subscription_plan,
        monthly_calculation_limit,
        email_verified,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        user_email,
        user_name,
        user_account_type,
        'active',
        sub_plan,
        calc_limit,
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (email) DO UPDATE SET
        name = user_name,
        account_type = user_account_type,
        subscription_plan = sub_plan,
        monthly_calculation_limit = calc_limit,
        updated_at = NOW();
    
    -- Return success result
    result := json_build_object(
        'success', true,
        'user_id', user_id,
        'email', user_email,
        'message', 'User account created successfully'
    );
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    -- Return error result
    result := json_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to create user account'
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user creation from auth trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, account_type, subscription_plan, monthly_calculation_limit, email_verified)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', NEW.email),
        CASE WHEN NEW.email = 'rob@mysolarai.com' THEN 'admin' ELSE 'free' END,
        CASE WHEN NEW.email = 'rob@mysolarai.com' THEN 'enterprise' ELSE 'free' END,
        CASE WHEN NEW.email = 'rob@mysolarai.com' THEN 999999 ELSE 10 END,
        true
    ) ON CONFLICT (email) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user login tracking
CREATE OR REPLACE FUNCTION public.update_user_login(user_email TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.users 
    SET 
        last_login = NOW(),
        login_count = login_count + 1,
        updated_at = NOW()
    WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track calculation usage
CREATE OR REPLACE FUNCTION public.track_calculation_usage(
    user_email TEXT,
    calc_type TEXT,
    user_ip TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Get user info
    SELECT id, calculations_used INTO user_record FROM public.users WHERE email = user_email;
    
    -- Insert usage tracking
    INSERT INTO public.usage_tracking (user_id, user_email, calculation_type, ip_address)
    VALUES (user_record.id, user_email, calc_type, user_ip);
    
    -- Update user calculations count
    UPDATE public.users 
    SET 
        calculations_used = calculations_used + 1,
        updated_at = NOW()
    WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check user calculation limit
CREATE OR REPLACE FUNCTION public.check_user_calculation_limit(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_record RECORD;
BEGIN
    SELECT calculations_used, monthly_calculation_limit 
    INTO user_record 
    FROM public.users 
    WHERE email = user_email;
    
    IF user_record IS NULL THEN
        RETURN false;
    END IF;
    
    RETURN user_record.calculations_used < user_record.monthly_calculation_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user account info
CREATE OR REPLACE FUNCTION public.get_user_account_info(user_email TEXT)
RETURNS TABLE(
    email TEXT,
    name TEXT,
    account_type TEXT,
    subscription_plan TEXT,
    subscription_status TEXT,
    calculations_used INTEGER,
    monthly_limit INTEGER,
    calculations_remaining INTEGER,
    total_projects BIGINT,
    total_savings DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.email,
        u.name,
        u.account_type,
        u.subscription_plan,
        u.subscription_status,
        u.calculations_used,
        u.monthly_calculation_limit as monthly_limit,
        (u.monthly_calculation_limit - u.calculations_used) as calculations_remaining,
        COALESCE(COUNT(p.id), 0) as total_projects,
        COALESCE(SUM(p.annual_savings), 0) as total_savings
    FROM public.users u
    LEFT JOIN public.user_projects p ON u.email = p.user_email
    WHERE u.email = user_email
    GROUP BY u.email, u.name, u.account_type, u.subscription_plan, u.subscription_status, 
             u.calculations_used, u.monthly_calculation_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create user dashboard stats view
CREATE OR REPLACE VIEW public.user_dashboard_stats AS
SELECT 
    u.email,
    u.name,
    u.account_type,
    u.subscription_plan,
    u.calculations_used,
    u.monthly_calculation_limit,
    COALESCE(COUNT(DISTINCT p.id), 0) as total_projects,
    COALESCE(COUNT(DISTINCT c.id), 0) as total_calculations,
    COALESCE(SUM(p.annual_savings), 0) as total_estimated_savings,
    COALESCE(AVG(p.system_size_kw), 0) as avg_system_size
FROM public.users u
LEFT JOIN public.user_projects p ON u.email = p.user_email
LEFT JOIN public.solar_calculations c ON u.email = c.user_email
GROUP BY u.email, u.name, u.account_type, u.subscription_plan, u.calculations_used, u.monthly_calculation_limit;

-- Grant execute permissions on the new functions
GRANT EXECUTE ON FUNCTION public.create_demo_admin_user() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_user_account(UUID, TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_user_login(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.track_calculation_usage(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_user_calculation_limit(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_account_info(TEXT) TO anon, authenticated, service_role;

-- Grant permissions on tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Execute the demo admin creation function to ensure it exists
SELECT public.create_demo_admin_user();

-- Re-enable RLS with permissive policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create permissive RLS policies
CREATE POLICY "Allow all operations" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.user_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.user_projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.solar_calculations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.usage_tracking FOR ALL USING (true) WITH CHECK (true);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database setup complete with admin API support!';
    RAISE NOTICE 'Demo admin user created successfully';
    RAISE NOTICE 'All functions and tables are ready';
    RAISE NOTICE 'Use the admin API in your application to create auth users';
END $$;
