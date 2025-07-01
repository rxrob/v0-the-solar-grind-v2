-- Complete Authentication Database Setup
-- This script creates a comprehensive user management system

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS public.usage_tracking CASCADE;
DROP TABLE IF EXISTS public.solar_calculations CASCADE;
DROP TABLE IF EXISTS public.user_projects CASCADE;
DROP TABLE IF EXISTS public.user_sessions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table with comprehensive fields
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    
    -- Account type and subscription info
    account_type TEXT NOT NULL DEFAULT 'free' CHECK (account_type IN ('free', 'pro', 'admin', 'enterprise')),
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due', 'trialing')),
    subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'enterprise')),
    
    -- Stripe integration
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    
    -- Trial and usage tracking
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    pro_trial_used BOOLEAN DEFAULT false,
    calculations_used INTEGER DEFAULT 0,
    monthly_calculation_limit INTEGER DEFAULT 10,
    
    -- Authentication tracking
    email_verified BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_sessions table for session management
CREATE TABLE public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_projects table (user_id is nullable since we primarily use user_email)
CREATE TABLE public.user_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    project_name TEXT NOT NULL,
    property_address TEXT NOT NULL,
    
    -- System specifications
    system_size_kw DECIMAL(10,2) NOT NULL,
    annual_production_kwh DECIMAL(12,2) NOT NULL,
    system_cost DECIMAL(12,2) NOT NULL,
    net_cost DECIMAL(12,2) NOT NULL,
    annual_savings DECIMAL(12,2) NOT NULL,
    
    -- Project status and dates
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'on_hold')),
    notes TEXT,
    installation_date DATE,
    completion_date DATE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create solar_calculations table
CREATE TABLE public.solar_calculations (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    
    -- Input data
    address TEXT NOT NULL,
    coordinates TEXT NOT NULL,
    monthly_kwh DECIMAL(10,2) NOT NULL,
    electricity_rate DECIMAL(6,4) NOT NULL,
    
    -- Calculation results
    results JSONB NOT NULL,
    calculation_type TEXT DEFAULT 'basic' CHECK (calculation_type IN ('basic', 'advanced', 'pro')),
    system_size_kw DECIMAL(10,2),
    annual_production_kwh DECIMAL(12,2),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage_tracking table
CREATE TABLE public.usage_tracking (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    calculation_type TEXT NOT NULL,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_account_type ON public.users(account_type);
CREATE INDEX idx_users_subscription_status ON public.users(subscription_status);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON public.user_sessions(expires_at);
CREATE INDEX idx_user_projects_user_email ON public.user_projects(user_email);
CREATE INDEX idx_user_projects_status ON public.user_projects(status);
CREATE INDEX idx_solar_calculations_user_email ON public.solar_calculations(user_email);
CREATE INDEX idx_solar_calculations_type ON public.solar_calculations(calculation_type);
CREATE INDEX idx_usage_tracking_user_email ON public.usage_tracking(user_email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can read own data" ON public.users
    FOR SELECT USING (
        auth.uid() = id OR 
        email = auth.jwt() ->> 'email' OR
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (
        auth.uid() = id OR 
        email = auth.jwt() ->> 'email' OR
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Users can insert own data" ON public.users
    FOR INSERT WITH CHECK (
        auth.uid() = id OR 
        email = auth.jwt() ->> 'email' OR
        auth.jwt() ->> 'role' = 'admin'
    );

-- Create RLS policies for user_sessions
CREATE POLICY "Users can manage own sessions" ON public.user_sessions
    FOR ALL USING (
        user_id = auth.uid() OR
        auth.jwt() ->> 'role' = 'admin'
    );

-- Create RLS policies for user_projects
CREATE POLICY "Users can manage own projects" ON public.user_projects
    FOR ALL USING (
        user_email = auth.jwt() ->> 'email' OR
        user_id = auth.uid() OR
        auth.jwt() ->> 'role' = 'admin'
    );

-- Create RLS policies for solar_calculations
CREATE POLICY "Users can manage own calculations" ON public.solar_calculations
    FOR ALL USING (
        user_email = auth.jwt() ->> 'email' OR
        user_id = auth.uid() OR
        auth.jwt() ->> 'role' = 'admin'
    );

-- Create RLS policies for usage_tracking
CREATE POLICY "Users can manage own usage" ON public.usage_tracking
    FOR ALL USING (
        user_email = auth.jwt() ->> 'email' OR
        user_id = auth.uid() OR
        auth.jwt() ->> 'role' = 'admin'
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_projects_updated_at BEFORE UPDATE ON public.user_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_solar_calculations_updated_at BEFORE UPDATE ON public.solar_calculations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create user record when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id,
        email,
        name,
        account_type,
        subscription_status,
        subscription_plan,
        email_verified,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', NEW.email),
        CASE 
            WHEN NEW.email = 'rob@mysolarai.com' THEN 'admin'
            ELSE 'free'
        END,
        'active',
        CASE 
            WHEN NEW.email = 'rob@mysolarai.com' THEN 'enterprise'
            ELSE 'free'
        END,
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, users.name),
        email_verified = COALESCE(EXCLUDED.email_verified, users.email_verified),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update login tracking
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

-- Create function to track usage
CREATE OR REPLACE FUNCTION public.track_calculation_usage(
    user_email TEXT,
    calc_type TEXT,
    user_ip INET DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Insert usage tracking record
    INSERT INTO public.usage_tracking (user_email, calculation_type, ip_address)
    VALUES (user_email, calc_type, user_ip);
    
    -- Update user's calculation count
    UPDATE public.users 
    SET 
        calculations_used = calculations_used + 1,
        updated_at = NOW()
    WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check user limits
CREATE OR REPLACE FUNCTION public.check_user_calculation_limit(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_record RECORD;
    monthly_usage INTEGER;
BEGIN
    -- Get user information
    SELECT * INTO user_record FROM public.users WHERE email = user_email;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Admin and enterprise users have unlimited access
    IF user_record.account_type IN ('admin', 'enterprise') THEN
        RETURN TRUE;
    END IF;
    
    -- Check monthly usage
    SELECT COUNT(*) INTO monthly_usage
    FROM public.usage_tracking
    WHERE user_email = user_email
    AND created_at >= DATE_TRUNC('month', NOW());
    
    RETURN monthly_usage < user_record.monthly_calculation_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert demo admin account first
INSERT INTO public.users (
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
    'rob@mysolarai.com',
    'Rob Solar - Admin',
    'admin',
    'active',
    'enterprise',
    999999, -- Unlimited for admin
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    account_type = EXCLUDED.account_type,
    subscription_status = EXCLUDED.subscription_status,
    subscription_plan = EXCLUDED.subscription_plan,
    monthly_calculation_limit = EXCLUDED.monthly_calculation_limit,
    email_verified = EXCLUDED.email_verified,
    updated_at = NOW();

-- Now insert sample projects for demo admin (user_id will be set by trigger if needed)
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
    'Johnson Family Residence',
    'Premium Residential Solar Installation',
    '123 Maple Street, Austin, TX 78701',
    8.5,
    12750,
    25500,
    17850,
    2340,
    'completed',
    'High-efficiency panels with 25-year warranty. Customer extremely satisfied.'
),
(
    'rob@mysolarai.com',
    'Smith Family Home',
    'Rooftop Solar with Battery Storage',
    '456 Oak Avenue, Austin, TX 78702',
    12.0,
    18000,
    36000,
    25200,
    3240,
    'active',
    'Large residential system with Tesla Powerwall integration'
),
(
    'rob@mysolarai.com',
    'Green Valley Business Center',
    'Commercial Solar Array Project',
    '789 Business Park Drive, Austin, TX 78703',
    50.0,
    75000,
    150000,
    105000,
    13500,
    'active',
    'Large commercial installation with real-time monitoring and maintenance contract'
),
(
    'rob@mysolarai.com',
    'Martinez Residence',
    'Eco-Friendly Solar Solution',
    '321 Pine Street, Austin, TX 78704',
    6.8,
    10200,
    20400,
    14280,
    1836,
    'completed',
    'Compact system optimized for smaller roof space'
),
(
    'rob@mysolarai.com',
    'Tech Startup Office',
    'Office Building Solar Installation',
    '654 Innovation Way, Austin, TX 78705',
    25.0,
    37500,
    75000,
    52500,
    6750,
    'active',
    'Mid-size commercial project with employee education program'
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
    '123 Demo Street, Austin, TX',
    '30.2672,-97.7431',
    850,
    0.12,
    '{"systemSize": 8.5, "annualProduction": 12750, "annualSavings": 2340, "roiYears": 7.6}',
    'pro',
    8.5,
    12750
),
(
    'rob@mysolarai.com',
    '456 Sample Ave, Austin, TX',
    '30.2672,-97.7431',
    1200,
    0.11,
    '{"systemSize": 12.0, "annualProduction": 18000, "annualSavings": 3240, "roiYears": 7.8}',
    'advanced',
    12.0,
    18000
) ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create view for user dashboard stats
CREATE OR REPLACE VIEW public.user_dashboard_stats AS
SELECT 
    u.email,
    u.name,
    u.account_type,
    u.subscription_plan,
    u.calculations_used,
    u.monthly_calculation_limit,
    COUNT(DISTINCT up.id) as total_projects,
    COUNT(DISTINCT sc.id) as total_calculations,
    COALESCE(SUM(up.annual_savings), 0) as total_estimated_savings,
    COALESCE(AVG(up.system_size_kw), 0) as avg_system_size
FROM public.users u
LEFT JOIN public.user_projects up ON u.email = up.user_email
LEFT JOIN public.solar_calculations sc ON u.email = sc.user_email
GROUP BY u.email, u.name, u.account_type, u.subscription_plan, u.calculations_used, u.monthly_calculation_limit;

-- Grant access to the view
GRANT SELECT ON public.user_dashboard_stats TO anon, authenticated;

-- Create function to get user account info
CREATE OR REPLACE FUNCTION public.get_user_account_info(user_email TEXT)
RETURNS TABLE (
    email TEXT,
    name TEXT,
    account_type TEXT,
    subscription_plan TEXT,
    subscription_status TEXT,
    calculations_used INTEGER,
    monthly_limit INTEGER,
    calculations_remaining INTEGER,
    total_projects BIGINT,
    total_savings NUMERIC
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
        (u.monthly_calculation_limit - u.calculations_used) as calculations_remaining,
        COUNT(DISTINCT up.id) as total_projects,
        COALESCE(SUM(up.annual_savings), 0) as total_savings
    FROM public.users u
    LEFT JOIN public.user_projects up ON u.email = up.user_email
    WHERE u.email = user_email
    GROUP BY u.email, u.name, u.account_type, u.subscription_plan, u.subscription_status, 
             u.calculations_used, u.monthly_calculation_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update user_id in existing records when user signs up
CREATE OR REPLACE FUNCTION public.update_user_references()
RETURNS VOID AS $$
BEGIN
    -- Update user_projects with user_id where missing
    UPDATE public.user_projects 
    SET user_id = u.id
    FROM public.users u
    WHERE user_projects.user_email = u.email 
    AND user_projects.user_id IS NULL;
    
    -- Update solar_calculations with user_id where missing
    UPDATE public.solar_calculations 
    SET user_id = u.id
    FROM public.users u
    WHERE solar_calculations.user_email = u.email 
    AND solar_calculations.user_id IS NULL;
    
    -- Update usage_tracking with user_id where missing
    UPDATE public.usage_tracking 
    SET user_id = u.id
    FROM public.users u
    WHERE usage_tracking.user_email = u.email 
    AND usage_tracking.user_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the update function to link existing records
SELECT public.update_user_references();

-- Final verification query
SELECT 
    'Database setup complete!' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN account_type = 'admin' THEN 1 END) as admin_users,
    COUNT(CASE WHEN account_type = 'free' THEN 1 END) as free_users,
    COUNT(CASE WHEN account_type = 'pro' THEN 1 END) as pro_users
FROM public.users;

-- Show sample data
SELECT 'Sample Projects Created:' as info, COUNT(*) as project_count FROM public.user_projects WHERE user_email = 'rob@mysolarai.com';
SELECT 'Sample Calculations Created:' as info, COUNT(*) as calc_count FROM public.solar_calculations WHERE user_email = 'rob@mysolarai.com';
