-- Complete cleanup and fresh setup script
-- This will remove all existing objects and recreate them properly

-- Drop all policies first (they depend on tables)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own projects" ON user_projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON user_projects;
DROP POLICY IF EXISTS "Users can update own projects" ON user_projects;
DROP POLICY IF EXISTS "Users can view own calculations" ON solar_calculations;
DROP POLICY IF EXISTS "Users can insert calculations" ON solar_calculations;

-- Drop all triggers first
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_user_projects_updated_at ON user_projects;
DROP TRIGGER IF EXISTS update_solar_calculations_updated_at ON solar_calculations;

-- Drop all indexes
DROP INDEX IF EXISTS idx_solar_calculations_user_id;
DROP INDEX IF EXISTS idx_solar_calculations_user_email;
DROP INDEX IF EXISTS idx_solar_calculations_created_at;
DROP INDEX IF EXISTS idx_user_projects_user_id;
DROP INDEX IF EXISTS idx_user_projects_created_at;
DROP INDEX IF EXISTS idx_user_projects_status;
DROP INDEX IF EXISTS idx_user_projects_customer_email;

-- Drop all tables (CASCADE will handle foreign key constraints)
DROP TABLE IF EXISTS solar_calculations CASCADE;
DROP TABLE IF EXISTS user_projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS increment_user_usage(TEXT);

-- Now recreate everything fresh

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
  subscription_tier VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  monthly_calculations_used INTEGER DEFAULT 0,
  monthly_calculations_limit INTEGER DEFAULT 30,
  billing_period_start DATE DEFAULT CURRENT_DATE,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger for users
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

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
  status VARCHAR(50) DEFAULT 'calculated',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger for user_projects
CREATE TRIGGER update_user_projects_updated_at 
  BEFORE UPDATE ON user_projects 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create solar_calculations table
CREATE TABLE solar_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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
  user_email VARCHAR(255),
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create all indexes
CREATE INDEX idx_user_projects_user_id ON user_projects(user_id);
CREATE INDEX idx_user_projects_created_at ON user_projects(created_at);
CREATE INDEX idx_user_projects_status ON user_projects(status);
CREATE INDEX idx_user_projects_customer_email ON user_projects(customer_email);

CREATE INDEX idx_solar_calculations_user_id ON solar_calculations(user_id);
CREATE INDEX idx_solar_calculations_user_email ON solar_calculations(user_email);
CREATE INDEX idx_solar_calculations_created_at ON solar_calculations(created_at);

-- Insert demo users with proper UUIDs
INSERT INTO users (id, email, full_name, subscription_tier, monthly_calculations_used, monthly_calculations_limit) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'demo@example.com', 'Demo User', 'free', 5, 30),
  ('550e8400-e29b-41d4-a716-446655440001', 'user@gmail.com', 'Google User', 'pro', 47, -1),
  ('550e8400-e29b-41d4-a716-446655440002', 'pro@example.com', 'Pro User', 'pro', 25, -1)
ON CONFLICT (email) DO UPDATE SET
  subscription_tier = EXCLUDED.subscription_tier,
  monthly_calculations_used = EXCLUDED.monthly_calculations_used,
  monthly_calculations_limit = EXCLUDED.monthly_calculations_limit;

-- Insert demo projects
INSERT INTO user_projects (
  user_id,
  customer_name,
  customer_email,
  customer_phone,
  property_address,
  property_sqft,
  residents,
  monthly_kwh,
  current_electric_bill,
  system_size_kw,
  panels_needed,
  panel_wattage,
  annual_production_kwh,
  system_cost,
  net_cost,
  annual_savings,
  monthly_savings,
  roi_years,
  co2_offset_tons,
  trees_equivalent,
  roof_type,
  roof_condition,
  peak_sun_hours,
  status
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Demo User',
  'demo@example.com',
  '(555) 123-4567',
  '123 Solar Street, Austin, TX 78701',
  2500,
  4,
  1200,
  144.00,
  8.5,
  20,
  425,
  12500,
  30175,
  21123,
  1800,
  150,
  11.7,
  5.0,
  80,
  'asphalt_shingle',
  'good',
  5.8,
  'calculated'
), (
  '550e8400-e29b-41d4-a716-446655440001',
  'Google User',
  'user@gmail.com',
  '(555) 987-6543',
  '456 Energy Ave, Dallas, TX 75201',
  3200,
  3,
  1500,
  180.00,
  10.2,
  24,
  425,
  15000,
  36210,
  25347,
  2160,
  180,
  11.7,
  6.0,
  96,
  'metal',
  'excellent',
  6.1,
  'calculated'
), (
  '550e8400-e29b-41d4-a716-446655440002',
  'Pro User',
  'pro@example.com',
  '(555) 555-5555',
  '789 Professional Blvd, Houston, TX 77001',
  4000,
  5,
  1800,
  216.00,
  12.5,
  30,
  425,
  18000,
  44375,
  31063,
  2592,
  216,
  12.1,
  7.2,
  115,
  'tile',
  'excellent',
  6.3,
  'calculated'
) ON CONFLICT DO NOTHING;

-- Insert demo calculations
INSERT INTO solar_calculations (
  user_id, 
  address, 
  monthly_kwh, 
  electricity_rate, 
  utility_company, 
  roof_type, 
  roof_age, 
  shading_level, 
  user_email, 
  results
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '123 Solar Street, Austin, TX 78701',
  1200,
  0.12,
  'Austin Energy',
  'asphalt_shingle',
  '6-10',
  'minimal',
  'demo@example.com',
  '{"systemSizeKw": 8.5, "annualSavings": 1800, "netCost": 18000, "roiYears": 10.0, "monthlySavings": 150, "panelsNeeded": 20, "panelWattage": 425}'::jsonb
), (
  '550e8400-e29b-41d4-a716-446655440001',
  '456 Energy Ave, Dallas, TX 75201',
  1500,
  0.11,
  'Oncor Electric',
  'metal',
  '0-5',
  'none',
  'user@gmail.com',
  '{"systemSizeKw": 10.2, "annualSavings": 2160, "netCost": 25000, "roiYears": 11.6, "monthlySavings": 180, "panelsNeeded": 24, "panelWattage": 425}'::jsonb
), (
  '550e8400-e29b-41d4-a716-446655440002',
  '789 Professional Blvd, Houston, TX 77001',
  1800,
  0.13,
  'CenterPoint Energy',
  'tile',
  '0-5',
  'minimal',
  'pro@example.com',
  '{"systemSizeKw": 12.5, "annualSavings": 2592, "netCost": 31000, "roiYears": 12.0, "monthlySavings": 216, "panelsNeeded": 30, "panelWattage": 425}'::jsonb
) ON CONFLICT DO NOTHING;

-- Create a function to increment user usage (for usage tracking)
CREATE OR REPLACE FUNCTION increment_user_usage(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET monthly_calculations_used = monthly_calculations_used + 1,
      updated_at = NOW()
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql;

-- Verify the setup
SELECT 'Setup completed successfully!' as status;
SELECT 'Users created: ' || COUNT(*) as user_count FROM users;
SELECT 'Projects created: ' || COUNT(*) as project_count FROM user_projects;
SELECT 'Calculations created: ' || COUNT(*) as calc_count FROM solar_calculations;
