-- First, let's check what exists and clean up properly
DO $$ 
BEGIN
    -- Drop tables in correct order (foreign keys first)
    DROP TABLE IF EXISTS public.solar_calculations CASCADE;
    DROP TABLE IF EXISTS public.user_projects CASCADE;
    DROP TABLE IF EXISTS public.users CASCADE;
    
    -- Drop any existing functions
    DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
    
    RAISE NOTICE 'Existing tables dropped successfully';
END $$;

-- Create the update function first
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create users table with correct schema
CREATE TABLE public.users (
    id UUID PRIMARY KEY,
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

CREATE POLICY "Users can update own calculations" ON public.solar_calculations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calculations" ON public.solar_calculations
    FOR DELETE USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_projects_updated_at 
    BEFORE UPDATE ON public.user_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_subscription_type ON public.users(subscription_type);
CREATE INDEX idx_user_projects_user_id ON public.user_projects(user_id);
CREATE INDEX idx_solar_calculations_user_id ON public.solar_calculations(user_id);
CREATE INDEX idx_solar_calculations_project_id ON public.solar_calculations(project_id);

-- Grant necessary permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.user_projects TO authenticated;
GRANT ALL ON public.solar_calculations TO authenticated;

-- Verify the table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'user_projects', 'solar_calculations')
ORDER BY table_name, ordinal_position;

-- Show success message
DO $$ 
BEGIN
    RAISE NOTICE 'Database schema created successfully!';
    RAISE NOTICE 'Tables created: users, user_projects, solar_calculations';
    RAISE NOTICE 'RLS policies enabled and configured';
    RAISE NOTICE 'Indexes and triggers created';
END $$;
