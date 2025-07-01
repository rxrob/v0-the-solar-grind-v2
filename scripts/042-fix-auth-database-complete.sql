-- Complete database setup for Solar Grind V2 with proper error handling
-- This script sets up all necessary tables, functions, and demo data

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS public.usage_tracking CASCADE;
DROP TABLE IF EXISTS public.solar_calculations CASCADE;
DROP TABLE IF EXISTS public.user_projects CASCADE;
DROP TABLE IF EXISTS public.user_sessions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_user_login(text) CASCADE;
DROP FUNCTION IF EXISTS public.track_calculation_usage(text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.check_user_calculation_limit(text) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_account_info(text) CASCADE;
DROP FUNCTION IF EXISTS public.update_user_references() CASCADE;

-- Drop existing views
DROP VIEW IF EXISTS public.user_dashboard_stats CASCADE;

-- Create users table with comprehensive fields
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

-- Create user_sessions table for session management
CREATE TABLE public.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_projects table for project management
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
    annual_savings DECIMAL(12,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'on_hold')),
    notes TEXT,
    installation_date DATE,
    completion_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create solar_calculations table for calculation history
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

-- Create usage_tracking table for analytics
CREATE TABLE public.usage_tracking (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    calculation_type TEXT NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_account_type ON public.users(account_type);
CREATE INDEX idx_user_projects_user_email ON public.user_projects(user_email);
CREATE INDEX idx_user_projects_status ON public.user_projects(status);
CREATE INDEX idx_solar_calculations_user_email ON public.solar_calculations(user_email);
CREATE INDEX idx_solar_calculations_type ON public.solar_calculations(calculation_type);
CREATE INDEX idx_usage_tracking_user_email ON public.usage_tracking(user_email);
CREATE INDEX idx_usage_tracking_created_at ON public.usage_tracking(created_at);

-- Create function to handle new user registration
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
    )
    ON CONFLICT (email) DO UPDATE SET
        name = COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', users.name),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update user login tracking
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

-- Create function to track calculation usage
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
    SELECT id INTO user_record FROM public.users WHERE email = user_email;
    
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

-- Create function to check calculation limit
CREATE OR REPLACE FUNCTION public.check_user_calculation_limit(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_record RECORD;
BEGIN
    SELECT calculations_used, monthly_calculation_limit, account_type
    INTO user_record
    FROM public.users 
    WHERE email = user_email;
    
    -- Admin and enterprise users have unlimited calculations
    IF user_record.account_type IN ('admin', 'enterprise') THEN
        RETURN true;
    END IF;
    
    -- Check if user is within their limit
    RETURN user_record.calculations_used < user_record.monthly_calculation_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user account info
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
        u.monthly_calculation_limit,
        GREATEST(0, u.monthly_calculation_limit - u.calculations_used) as calculations_remaining,
        COALESCE(COUNT(p.id), 0) as total_projects,
        COALESCE(SUM(p.annual_savings), 0) as total_savings
    FROM public.users u
    LEFT JOIN public.user_projects p ON u.email = p.user_email
    WHERE u.email = user_email
    GROUP BY u.email, u.name, u.account_type, u.subscription_plan, u.subscription_status, 
             u.calculations_used, u.monthly_calculation_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update user references
CREATE OR REPLACE FUNCTION public.update_user_references()
RETURNS VOID AS $$
BEGIN
    -- Update user_projects with correct user_id
    UPDATE public.user_projects 
    SET user_id = u.id
    FROM public.users u
    WHERE public.user_projects.user_email = u.email
    AND public.user_projects.user_id IS NULL;
    
    -- Update solar_calculations with correct user_id
    UPDATE public.solar_calculations 
    SET user_id = u.id
    FROM public.users u
    WHERE public.solar_calculations.user_email = u.email
    AND public.solar_calculations.user_id IS NULL;
    
    -- Update usage_tracking with correct user_id
    UPDATE public.usage_tracking 
    SET user_id = u.id
    FROM public.users u
    WHERE public.usage_tracking.user_email = u.email
    AND public.usage_tracking.user_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create user dashboard stats view
CREATE VIEW public.user_dashboard_stats AS
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

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text OR email = auth.jwt()->>'email');

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text OR email = auth.jwt()->>'email');

CREATE POLICY "Service role can manage all users" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for user_projects table
CREATE POLICY "Users can view own projects" ON public.user_projects
    FOR SELECT USING (user_email = auth.jwt()->>'email');

CREATE POLICY "Users can insert own projects" ON public.user_projects
    FOR INSERT WITH CHECK (user_email = auth.jwt()->>'email');

CREATE POLICY "Users can update own projects" ON public.user_projects
    FOR UPDATE USING (user_email = auth.jwt()->>'email');

CREATE POLICY "Service role can manage all projects" ON public.user_projects
    FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for solar_calculations table
CREATE POLICY "Users can view own calculations" ON public.solar_calculations
    FOR SELECT USING (user_email = auth.jwt()->>'email');

CREATE POLICY "Users can insert own calculations" ON public.solar_calculations
    FOR INSERT WITH CHECK (user_email = auth.jwt()->>'email');

CREATE POLICY "Service role can manage all calculations" ON public.solar_calculations
    FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for usage_tracking table
CREATE POLICY "Users can view own usage" ON public.usage_tracking
    FOR SELECT USING (user_email = auth.jwt()->>'email');

CREATE POLICY "Service role can manage all usage" ON public.usage_tracking
    FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for user_sessions table
CREATE POLICY "Users can view own sessions" ON public.user_sessions
    FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Service role can manage all sessions" ON public.user_sessions
    FOR ALL USING (auth.role() = 'service_role');

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert demo admin user directly into the database
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
    uuid_generate_v4(),
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
    updated_at = NOW();

-- Insert sample projects for demo admin
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
    status,
    notes
) VALUES 
(
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

-- Insert sample calculations for demo admin
INSERT INTO public.solar_calculations (
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

-- Update user references to ensure consistency
SELECT public.update_user_references();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Refresh statistics
ANALYZE public.users;
ANALYZE public.user_projects;
ANALYZE public.solar_calculations;
ANALYZE public.usage_tracking;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database setup completed successfully!';
    RAISE NOTICE 'Demo admin account created: rob@mysolarai.com';
    RAISE NOTICE 'Sample projects and calculations added';
END $$;
