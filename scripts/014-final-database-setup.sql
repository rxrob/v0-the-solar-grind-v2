-- Final database setup script that handles all existing objects properly
-- This script will clean everything and set up fresh

-- First, disable RLS temporarily to avoid issues
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS solar_calculations DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies (ignore errors if they don't exist)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on users table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON users';
    END LOOP;
    
    -- Drop all policies on user_projects table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_projects') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON user_projects';
    END LOOP;
    
    -- Drop all policies on solar_calculations table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'solar_calculations') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON solar_calculations';
    END LOOP;
END $$;

-- Drop all existing triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_user_projects_updated_at ON user_projects;
DROP TRIGGER IF EXISTS update_solar_calculations_updated_at ON solar_calculations;

-- Drop all existing indexes
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_google_id;
DROP INDEX IF EXISTS idx_user_projects_user_id;
DROP INDEX IF EXISTS idx_user_projects_created_at;
DROP INDEX IF EXISTS idx_user_projects_status;
DROP INDEX IF EXISTS idx_user_projects_customer_email;
DROP INDEX IF EXISTS idx_solar_calculations_user_id;
DROP INDEX IF EXISTS idx_solar_calculations_user_email;
DROP INDEX IF EXISTS idx_solar_calculations_created_at;

-- Drop all existing tables (CASCADE handles dependencies)
DROP TABLE IF EXISTS solar_calculations CASCADE;
DROP TABLE IF EXISTS user_projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS increment_user_usage(TEXT) CASCADE;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create users table with all required columns
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
  monthly_calculations_used INTEGER DEFAULT 0,
  monthly_calculations_limit INTEGER DEFAULT 30,
  billing_period_start DATE DEFAULT CURRENT_DATE,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  google_id VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  company VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin'))
);

-- Create user_projects table
CREATE TABLE user_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  property_address TEXT,
  property_sqft INTEGER,
  residents INTEGER,
  monthly_kwh INTEGER,
  current_electric_bill DECIMAL(10,2),
  system_size_kw DECIMAL(8,2),
  panels_needed INTEGER,
  panel_wattage INTEGER,
  annual_production_kwh INTEGER,
  system_cost DECIMAL(12,2),
  net_cost DECIMAL(12,2),
  annual_savings DECIMAL(10,2),
  monthly_savings DECIMAL(8,2),
  roi_years DECIMAL(4,1),
  co2_offset_tons DECIMAL(8,2),
  trees_equivalent INTEGER,
  roof_type VARCHAR(50),
  roof_condition VARCHAR(50),
  peak_sun_hours DECIMAL(3,1),
  status VARCHAR(50) DEFAULT 'calculated' CHECK (status IN ('draft', 'calculated', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create solar_calculations table
CREATE TABLE solar_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255),
  address TEXT,
  coordinates TEXT,
  monthly_kwh INTEGER,
  electricity_rate DECIMAL(6,4),
  utility_company VARCHAR(255),
  roof_type VARCHAR(50),
  roof_age VARCHAR(20),
  shading_level VARCHAR(50),
  has_pool BOOLEAN DEFAULT FALSE,
  has_ev BOOLEAN DEFAULT FALSE,
  planning_additions BOOLEAN DEFAULT FALSE,
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create all indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);

CREATE INDEX idx_user_projects_user_id ON user_projects(user_id);
CREATE INDEX idx_user_projects_created_at ON user_projects(created_at);
CREATE INDEX idx_user_projects_status ON user_projects(status);
CREATE INDEX idx_user_projects_customer_email ON user_projects(customer_email);

CREATE INDEX idx_solar_calculations_user_id ON solar_calculations(user_id);
CREATE INDEX idx_solar_calculations_user_email ON solar_calculations(user_email);
CREATE INDEX idx_solar_calculations_created_at ON solar_calculations(created_at);

-- Create updated_at triggers
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_projects_updated_at 
  BEFORE UPDATE ON user_projects 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE solar_calculations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for user_projects table
CREATE POLICY "user_projects_select_own" ON user_projects
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_projects_insert_own" ON user_projects
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_projects_update_own" ON user_projects
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "user_projects_delete_own" ON user_projects
  FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for solar_calculations table
CREATE POLICY "solar_calculations_select_own" ON solar_calculations
  FOR SELECT USING (user_id = auth.uid() OR user_email = auth.email());

CREATE POLICY "solar_calculations_insert_any" ON solar_calculations
  FOR INSERT WITH CHECK (true); -- Allow anonymous calculations

-- Create utility function for usage tracking
CREATE OR REPLACE FUNCTION increment_user_usage(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET monthly_calculations_used = monthly_calculations_used + 1,
      updated_at = NOW()
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql;

-- Insert demo data
INSERT INTO users (id, email, full_name, subscription_tier, monthly_calculations_used, monthly_calculations_limit) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'demo@example.com', 'Demo User', 'free', 15, 30),
  ('550e8400-e29b-41d4-a716-446655440001', 'user@gmail.com', 'Google User', 'pro', 47, -1),
  ('550e8400-e29b-41d4-a716-446655440002', 'pro@example.com', 'Pro User', 'pro', 23, -1)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  subscription_tier = EXCLUDED.subscription_tier,
  monthly_calculations_used = EXCLUDED.monthly_calculations_used,
  monthly_calculations_limit = EXCLUDED.monthly_calculations_limit;

-- Insert demo projects
INSERT INTO user_projects (
  user_id, customer_name, customer_email, customer_phone, property_address, 
  monthly_kwh, current_electric_bill, system_size_kw, panels_needed,
  annual_production_kwh, system_cost, net_cost, annual_savings, 
  monthly_savings, roi_years, peak_sun_hours, status
) VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440001', 
    'John Smith', 'john@example.com', '(555) 123-4567', '123 Solar Street, Austin, TX 78701',
    1200, 180.00, 8.5, 19, 12500, 25500, 17850, 2160, 180, 8.3, 5.2, 'calculated'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'Sarah Johnson', 'sarah@example.com', '(555) 987-6543', '456 Green Ave, Dallas, TX 75201', 
    1500, 225.00, 10.2, 23, 15300, 30600, 21420, 2700, 225, 7.9, 5.1, 'calculated'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Mike Wilson', 'mike@example.com', '(555) 555-5555', '789 Energy Blvd, Houston, TX 77001',
    1800, 270.00, 12.8, 29, 18400, 38400, 26880, 3240, 270, 8.3, 4.9, 'calculated'
  )
ON CONFLICT DO NOTHING;

-- Insert demo solar calculations
INSERT INTO solar_calculations (
  user_id, user_email, address, monthly_kwh, electricity_rate, results
) VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'user@gmail.com',
    '123 Solar Street, Austin, TX 78701',
    1200,
    0.12,
    '{"systemSizeKw": 8.5, "annualProductionKwh": 12500, "monthlySavings": 180, "systemCost": 25500, "paybackPeriod": 8.3}'::jsonb
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002', 
    'pro@example.com',
    '789 Energy Blvd, Houston, TX 77001',
    1800,
    0.15,
    '{"systemSizeKw": 12.8, "annualProductionKwh": 18400, "monthlySavings": 270, "systemCost": 38400, "paybackPeriod": 8.3}'::jsonb
  )
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Final verification
SELECT 'Database setup completed successfully!' as status;
SELECT 'Users created: ' || COUNT(*) as user_count FROM users;
SELECT 'Projects created: ' || COUNT(*) as project_count FROM user_projects;
SELECT 'Calculations created: ' || COUNT(*) as calc_count FROM solar_calculations;
SELECT 'Policies created: ' || COUNT(*) as policy_count FROM pg_policies WHERE schemaname = 'public';
