-- Complete Database Setup for Solar Grind V2
-- This script sets up the entire database schema with all required tables, policies, and data

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS public.solar_calculations CASCADE;
DROP TABLE IF EXISTS public.user_projects CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    trial_ends_at TIMESTAMPTZ,
    pro_trial_used BOOLEAN DEFAULT FALSE,
    calculations_used INTEGER DEFAULT 0,
    monthly_calculation_limit INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_projects table
CREATE TABLE public.user_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    address TEXT,
    system_size_kw DECIMAL(10,2),
    annual_production_kwh DECIMAL(12,2),
    estimated_savings DECIMAL(12,2),
    project_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create solar_calculations table
CREATE TABLE public.solar_calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.user_projects(id) ON DELETE CASCADE,
    calculation_type TEXT DEFAULT 'basic' CHECK (calculation_type IN ('basic', 'advanced', 'pro')),
    input_data JSONB NOT NULL,
    result_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_calculations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for user_projects table
CREATE POLICY "Users can view own projects" ON public.user_projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.user_projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.user_projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.user_projects
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for solar_calculations table
CREATE POLICY "Users can view own calculations" ON public.solar_calculations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calculations" ON public.solar_calculations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_subscription ON public.users(subscription_tier, subscription_status);
CREATE INDEX idx_user_projects_user_id ON public.user_projects(user_id);
CREATE INDEX idx_user_projects_created_at ON public.user_projects(created_at);
CREATE INDEX idx_solar_calculations_user_id ON public.solar_calculations(user_id);
CREATE INDEX idx_solar_calculations_project_id ON public.solar_calculations(project_id);
CREATE INDEX idx_solar_calculations_created_at ON public.solar_calculations(created_at);

-- Create function to automatically update updated_at timestamp
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

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert demo data
INSERT INTO public.users (
    id,
    email,
    full_name,
    subscription_tier,
    subscription_status,
    monthly_calculation_limit,
    pro_trial_used,
    calculations_used
) VALUES 
(
    uuid_generate_v4(),
    'demo@example.com',
    'Demo User',
    'free',
    'active',
    5,
    false,
    0
),
(
    uuid_generate_v4(),
    'pro@example.com',
    'Pro User',
    'pro',
    'active',
    999999,
    true,
    0
);

-- Insert demo projects
INSERT INTO public.user_projects (
    user_id,
    project_name,
    address,
    system_size_kw,
    annual_production_kwh,
    estimated_savings
)
SELECT 
    u.id,
    'Demo Solar Installation',
    '123 Solar Street, Austin, TX 78701',
    10.5,
    15000,
    3500.00
FROM public.users u
WHERE u.email = 'demo@example.com';

INSERT INTO public.user_projects (
    user_id,
    project_name,
    address,
    system_size_kw,
    annual_production_kwh,
    estimated_savings
)
SELECT 
    u.id,
    'Commercial Solar Array',
    '456 Business Blvd, Austin, TX 78702',
    50.0,
    75000,
    18000.00
FROM public.users u
WHERE u.email = 'pro@example.com';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.user_projects TO authenticated;
GRANT ALL ON public.solar_calculations TO authenticated;
GRANT SELECT ON public.users TO anon;

-- Final verification
SELECT 
    'Database setup completed successfully!' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN subscription_tier = 'pro' THEN 1 END) as pro_users,
    COUNT(CASE WHEN subscription_tier = 'free' THEN 1 END) as free_users
FROM public.users;

-- Show created tables
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
