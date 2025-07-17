-- Fix authentication and session issues
-- Run this in your Supabase SQL Editor

-- 1. Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE solar_calculations ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own projects" ON user_projects;
DROP POLICY IF EXISTS "Users can manage own projects" ON user_projects;
DROP POLICY IF EXISTS "Users can view own calculations" ON solar_calculations;
DROP POLICY IF EXISTS "Users can manage own calculations" ON solar_calculations;

-- 3. Create proper RLS policies for users table
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Create proper RLS policies for user_projects table
CREATE POLICY "Users can view own projects" ON user_projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own projects" ON user_projects
    FOR ALL USING (auth.uid() = user_id);

-- 5. Create proper RLS policies for solar_calculations table
CREATE POLICY "Users can view own calculations" ON solar_calculations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own calculations" ON solar_calculations
    FOR ALL USING (auth.uid() = user_id);

-- 6. Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, subscription_type, subscription_status, single_reports_purchased, single_reports_used, pro_trial_used)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    'free',
    'active',
    0,
    0,
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. Ensure proper column types and constraints
ALTER TABLE users ALTER COLUMN subscription_type SET DEFAULT 'free';
ALTER TABLE users ALTER COLUMN subscription_status SET DEFAULT 'active';
ALTER TABLE users ALTER COLUMN single_reports_purchased SET DEFAULT 0;
ALTER TABLE users ALTER COLUMN single_reports_used SET DEFAULT 0;
ALTER TABLE users ALTER COLUMN pro_trial_used SET DEFAULT false;

-- 9. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_projects_user_id ON user_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_solar_calculations_user_id ON solar_calculations(user_id);

-- 10. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.user_projects TO anon, authenticated;
GRANT ALL ON public.solar_calculations TO anon, authenticated;
