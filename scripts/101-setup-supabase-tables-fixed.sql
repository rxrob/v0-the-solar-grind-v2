-- Solar Grind V2 Database Setup Script
-- This script creates all necessary tables, RLS policies, and sample data

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS public.usage_tracking CASCADE;
DROP TABLE IF EXISTS public.solar_calculations CASCADE;
DROP TABLE IF EXISTS public.user_projects CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    subscription_status TEXT DEFAULT 'inactive',
    subscription_plan TEXT DEFAULT 'basic',
    stripe_customer_id TEXT,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create solar_calculations table
CREATE TABLE public.solar_calculations (
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    address TEXT NOT NULL,
    coordinates TEXT NOT NULL,
    monthly_kwh NUMERIC NOT NULL,
    electricity_rate NUMERIC NOT NULL,
    calculation_type TEXT DEFAULT 'basic',
    system_size_kw NUMERIC,
    annual_production_kwh NUMERIC,
    results JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_projects table
CREATE TABLE public.user_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    project_name TEXT NOT NULL,
    property_address TEXT NOT NULL,
    system_size_kw NUMERIC NOT NULL,
    annual_production_kwh NUMERIC NOT NULL,
    system_cost NUMERIC NOT NULL,
    net_cost NUMERIC NOT NULL,
    annual_savings NUMERIC NOT NULL,
    status TEXT DEFAULT 'active',
    notes TEXT,
    installation_date DATE,
    completion_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage_tracking table
CREATE TABLE public.usage_tracking (
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    calculation_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text OR auth.jwt() ->> 'email' = email);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text OR auth.jwt() ->> 'email' = email);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = email);

-- Create RLS policies for solar_calculations table
CREATE POLICY "Users can view own calculations" ON public.solar_calculations
    FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can insert own calculations" ON public.solar_calculations
    FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can update own calculations" ON public.solar_calculations
    FOR UPDATE USING (auth.jwt() ->> 'email' = user_email);

-- Create RLS policies for user_projects table
CREATE POLICY "Users can view own projects" ON public.user_projects
    FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can insert own projects" ON public.user_projects
    FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can update own projects" ON public.user_projects
    FOR UPDATE USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can delete own projects" ON public.user_projects
    FOR DELETE USING (auth.jwt() ->> 'email' = user_email);

-- Create RLS policies for usage_tracking table
CREATE POLICY "Users can view own usage" ON public.usage_tracking
    FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can insert own usage" ON public.usage_tracking
    FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_solar_calculations_user_email ON public.solar_calculations(user_email);
CREATE INDEX idx_solar_calculations_created_at ON public.solar_calculations(created_at);
CREATE INDEX idx_user_projects_user_email ON public.user_projects(user_email);
CREATE INDEX idx_user_projects_status ON public.user_projects(status);
CREATE INDEX idx_usage_tracking_user_email ON public.usage_tracking(user_email);
CREATE INDEX idx_usage_tracking_created_at ON public.usage_tracking(created_at);

-- Insert sample data
INSERT INTO public.users (id, email, name, subscription_status, subscription_plan, email_verified, created_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'demo@solargrind.com', 'Demo User', 'active', 'professional', true, NOW()),
    ('550e8400-e29b-41d4-a716-446655440001', 'john@solarpro.com', 'John Smith', 'active', 'basic', true, NOW() - INTERVAL '30 days'),
    ('550e8400-e29b-41d4-a716-446655440002', 'sarah@greenenergy.com', 'Sarah Johnson', 'active', 'enterprise', true, NOW() - INTERVAL '60 days');

-- Insert sample solar calculations
INSERT INTO public.solar_calculations (user_email, address, coordinates, monthly_kwh, electricity_rate, calculation_type, system_size_kw, annual_production_kwh, results) VALUES
    ('demo@solargrind.com', '123 Main St, San Francisco, CA', '37.7749,-122.4194', 800, 0.25, 'basic', 6.5, 9500, '{"annual_savings": 2375, "payback_period": 8.5, "system_cost": 20000}'),
    ('john@solarpro.com', '456 Oak Ave, Los Angeles, CA', '34.0522,-118.2437', 1200, 0.28, 'pro', 9.2, 14500, '{"annual_savings": 4060, "payback_period": 7.2, "system_cost": 29000, "roi": 12.5}'),
    ('sarah@greenenergy.com', '789 Pine St, San Diego, CA', '32.7157,-117.1611', 950, 0.24, 'enterprise', 7.8, 12200, '{"annual_savings": 2928, "payback_period": 8.1, "system_cost": 23500, "roi": 11.8}');

-- Insert sample user projects
INSERT INTO public.user_projects (user_email, customer_name, project_name, property_address, system_size_kw, annual_production_kwh, system_cost, net_cost, annual_savings, status) VALUES
    ('demo@solargrind.com', 'Smith Residence', 'Residential Solar Installation', '123 Main St, San Francisco, CA', 6.5, 9500, 20000, 18000, 2375, 'completed'),
    ('john@solarpro.com', 'Johnson Family', 'Rooftop Solar System', '456 Oak Ave, Los Angeles, CA', 9.2, 14500, 29000, 26000, 4060, 'in_progress'),
    ('sarah@greenenergy.com', 'Green Office Building', 'Commercial Solar Array', '789 Pine St, San Diego, CA', 25.5, 38000, 75000, 67500, 9120, 'planning');

-- Insert sample usage tracking
INSERT INTO public.usage_tracking (user_email, calculation_type, created_at) VALUES
    ('demo@solargrind.com', 'basic', NOW() - INTERVAL '1 day'),
    ('demo@solargrind.com', 'pro', NOW() - INTERVAL '2 days'),
    ('john@solarpro.com', 'basic', NOW() - INTERVAL '3 days'),
    ('sarah@greenenergy.com', 'enterprise', NOW() - INTERVAL '1 hour');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_solar_calculations_updated_at BEFORE UPDATE ON public.solar_calculations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_projects_updated_at BEFORE UPDATE ON public.user_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Solar Grind V2 database setup completed successfully!';
    RAISE NOTICE 'Created tables: users, solar_calculations, user_projects, usage_tracking';
    RAISE NOTICE 'Enabled RLS policies for data security';
    RAISE NOTICE 'Inserted sample data for testing';
    RAISE NOTICE 'Database is ready for use!';
END $$;
