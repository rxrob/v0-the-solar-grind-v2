-- Final clean setup script that handles existing policies and structure
-- Drop existing policies if they exist
DO $$ 
BEGIN
    -- Drop existing policies for users table
    DROP POLICY IF EXISTS "Users can view own profile" ON users;
    DROP POLICY IF EXISTS "Users can update own profile" ON users;
    DROP POLICY IF EXISTS "Users can insert own profile" ON users;
    
    -- Drop existing policies for user_projects table  
    DROP POLICY IF EXISTS "Users can view own projects" ON user_projects;
    DROP POLICY IF EXISTS "Users can insert own projects" ON user_projects;
    DROP POLICY IF EXISTS "Users can update own projects" ON user_projects;
    
    -- Drop existing policies for solar_calculations table
    DROP POLICY IF EXISTS "Users can view own calculations" ON solar_calculations;
    DROP POLICY IF EXISTS "Users can insert calculations" ON solar_calculations;
    DROP POLICY IF EXISTS "Users can update calculations" ON solar_calculations;
EXCEPTION
    WHEN undefined_object THEN
        NULL; -- Ignore if policies don't exist
END $$;

-- Drop existing tables if they exist (cascade to handle dependencies)
DROP TABLE IF EXISTS solar_calculations CASCADE;
DROP TABLE IF EXISTS user_projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  monthly_calculations_used INTEGER DEFAULT 0,
  monthly_calculations_limit INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  status VARCHAR(50) DEFAULT 'calculated',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create solar_calculations table with user_email column
CREATE TABLE solar_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255), -- Added this column
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

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE solar_calculations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for user_projects table
CREATE POLICY "Users can view own projects" ON user_projects
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own projects" ON user_projects
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects" ON user_projects
  FOR UPDATE USING (user_id = auth.uid());

-- Create RLS policies for solar_calculations table
CREATE POLICY "Users can view own calculations" ON solar_calculations
  FOR SELECT USING (user_id = auth.uid() OR user_email = auth.email());

CREATE POLICY "Users can insert calculations" ON solar_calculations
  FOR INSERT WITH CHECK (true); -- Allow anonymous calculations

-- Create updated_at triggers
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_projects_updated_at 
  BEFORE UPDATE ON user_projects 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_projects_user_id ON user_projects(user_id);
CREATE INDEX idx_user_projects_created_at ON user_projects(created_at);
CREATE INDEX idx_user_projects_status ON user_projects(status);
CREATE INDEX idx_solar_calculations_user_id ON solar_calculations(user_id);
CREATE INDEX idx_solar_calculations_user_email ON solar_calculations(user_email);
CREATE INDEX idx_solar_calculations_created_at ON solar_calculations(created_at);

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
  user_id, customer_name, customer_email, property_address, 
  monthly_kwh, current_electric_bill, system_size_kw, panels_needed,
  annual_production_kwh, system_cost, net_cost, annual_savings, 
  monthly_savings, roi_years, peak_sun_hours, status
) VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440001', 
    'John Smith', 'john@example.com', '123 Solar Street, Austin, TX 78701',
    1200, 180.00, 8.5, 19, 12500, 25500, 17850, 2160, 180, 8.3, 5.2, 'calculated'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'Sarah Johnson', 'sarah@example.com', '456 Green Ave, Dallas, TX 75201', 
    1500, 225.00, 10.2, 23, 15300, 30600, 21420, 2700, 225, 7.9, 5.1, 'calculated'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Mike Wilson', 'mike@example.com', '789 Energy Blvd, Houston, TX 77001',
    1800, 270.00, 12.8, 29, 18400, 38400, 26880, 3240, 270, 8.3, 4.9, 'calculated'
  )
ON CONFLICT DO NOTHING;

-- Insert demo solar calculations
INSERT INTO solar_calculations (
  user_id, user_email, address, monthly_kwh, electricity_rate,
  results
) VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'user@gmail.com',
    '123 Solar Street, Austin, TX 78701',
    1200,
    0.12,
    '{"systemSizeKw": 8.5, "annualProductionKwh": 12500, "monthlySavings": 180, "systemCost": 25500}'::jsonb
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002', 
    'pro@example.com',
    '789 Energy Blvd, Houston, TX 77001',
    1800,
    0.15,
    '{"systemSizeKw": 12.8, "annualProductionKwh": 18400, "monthlySavings": 270, "systemCost": 38400}'::jsonb
  )
ON CONFLICT DO NOTHING;

-- Verify the setup
SELECT 'Users table created' as status, count(*) as records FROM users;
SELECT 'User projects table created' as status, count(*) as records FROM user_projects;  
SELECT 'Solar calculations table created' as status, count(*) as records FROM solar_calculations;
