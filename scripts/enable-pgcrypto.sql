-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop old tables if they exist
DROP TABLE IF EXISTS public.solar_calculations CASCADE;
DROP TABLE IF EXISTS public.user_projects CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Create the update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    subscription_type TEXT DEFAULT 'free' CHECK (subscription_type IN ('free', 'pro')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_projects table
CREATE TABLE public.user_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    address TEXT NOT NULL,
    system_size DECIMAL(10,2) NOT NULL,
    estimated_cost DECIMAL(12,2) NOT NULL,
    annual_savings DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create solar_calculations table
CREATE TABLE public.solar_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.user_projects(id) ON DELETE CASCADE,
    calculation_type TEXT NOT NULL,
    input_data JSONB NOT NULL,
    result_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_calculations ENABLE ROW LEVEL SECURITY;

-- RLS for users
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- RLS for projects
CREATE POLICY "Users can view own projects" ON public.user_projects
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own projects" ON public.user_projects
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own projects" ON public.user_projects
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own projects" ON public.user_projects
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- RLS for calculations
CREATE POLICY "Users can view own calculations" ON public.solar_calculations
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own calculations" ON public.solar_calculations
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own calculations" ON public.solar_calculations
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own calculations" ON public.solar_calculations
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Triggers for updated_at
CREATE TRIGGER trg_update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_projects_updated_at
BEFORE UPDATE ON public.user_projects
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_subscription_type ON public.users(subscription_type);
CREATE INDEX idx_user_projects_user_id ON public.user_projects(user_id);
CREATE INDEX idx_solar_calculations_user_id ON public.solar_calculations(user_id);
CREATE INDEX idx_solar_calculations_project_id ON public.solar_calculations(project_id);

-- Grant access
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.user_projects TO authenticated;
GRANT ALL ON public.solar_calculations TO authenticated;

-- Show confirmation
SELECT '✅ Schema created with RLS, UUIDs, and Stripe fields';
