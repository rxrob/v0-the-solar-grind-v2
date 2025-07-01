-- Create demo admin user in Supabase Auth and database
-- This script should be run after the Supabase project is set up

-- First, ensure the users table exists with proper structure
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    subscription_status TEXT DEFAULT 'active',
    subscription_plan TEXT DEFAULT 'free',
    stripe_customer_id TEXT,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    last_login TIMESTAMP WITH TIME ZONE,
    email_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own data
CREATE POLICY "Users can read own data" ON public.users
    FOR SELECT USING (auth.uid() = id OR email = auth.jwt() ->> 'email');

-- Create policy for users to update their own data
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid() = id OR email = auth.jwt() ->> 'email');

-- Create policy for inserting new users
CREATE POLICY "Users can insert own data" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id OR email = auth.jwt() ->> 'email');

-- Insert demo admin user (this will be linked to Supabase Auth user)
INSERT INTO public.users (
    email,
    name,
    subscription_status,
    subscription_plan,
    email_verified,
    created_at,
    updated_at
) VALUES (
    'rob@mysolarai.com',
    'Rob Solar',
    'active',
    'enterprise',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    subscription_status = EXCLUDED.subscription_status,
    subscription_plan = EXCLUDED.subscription_plan,
    email_verified = EXCLUDED.email_verified,
    updated_at = NOW();

-- Create other necessary tables
CREATE TABLE IF NOT EXISTS public.user_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    project_name TEXT NOT NULL,
    property_address TEXT NOT NULL,
    system_size_kw DECIMAL(10,2) NOT NULL,
    annual_production_kwh DECIMAL(12,2) NOT NULL,
    system_cost DECIMAL(12,2) NOT NULL,
    net_cost DECIMAL(12,2) NOT NULL,
    annual_savings DECIMAL(12,2) NOT NULL,
    status TEXT DEFAULT 'active',
    notes TEXT,
    installation_date DATE,
    completion_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.solar_calculations (
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    address TEXT NOT NULL,
    coordinates TEXT NOT NULL,
    monthly_kwh DECIMAL(10,2) NOT NULL,
    electricity_rate DECIMAL(6,4) NOT NULL,
    results JSONB NOT NULL,
    calculation_type TEXT DEFAULT 'basic',
    system_size_kw DECIMAL(10,2),
    annual_production_kwh DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.usage_tracking (
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    calculation_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for user_projects
CREATE POLICY "Users can manage own projects" ON public.user_projects
    FOR ALL USING (user_email = auth.jwt() ->> 'email');

-- Create policies for solar_calculations
CREATE POLICY "Users can manage own calculations" ON public.solar_calculations
    FOR ALL USING (user_email = auth.jwt() ->> 'email');

-- Create policies for usage_tracking
CREATE POLICY "Users can manage own usage" ON public.usage_tracking
    FOR ALL USING (user_email = auth.jwt() ->> 'email');

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
    'Johnson Family',
    'Residential Solar Installation',
    '123 Maple Street, Austin, TX 78701',
    8.5,
    12750,
    25500,
    17850,
    2340,
    'completed',
    'Standard residential installation with premium panels'
),
(
    'rob@mysolarai.com',
    'Smith Residence',
    'Rooftop Solar System',
    '456 Oak Avenue, Austin, TX 78702',
    12.0,
    18000,
    36000,
    25200,
    3240,
    'active',
    'Large residential system with battery backup'
),
(
    'rob@mysolarai.com',
    'Green Valley Business',
    'Commercial Solar Array',
    '789 Business Park Dr, Austin, TX 78703',
    50.0,
    75000,
    150000,
    105000,
    13500,
    'active',
    'Commercial installation with monitoring system'
) ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
