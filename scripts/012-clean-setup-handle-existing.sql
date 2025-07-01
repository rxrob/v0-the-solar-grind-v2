-- Clean setup script that handles existing policies
-- Drop existing policies if they exist, then recreate everything

-- Drop existing policies (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own projects" ON user_projects;
DROP POLICY IF EXISTS "Users can manage own projects" ON user_projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON user_projects;
DROP POLICY IF EXISTS "Users can update own projects" ON user_projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON user_projects;
DROP POLICY IF EXISTS "Users can view own calculations" ON solar_calculations;
DROP POLICY IF EXISTS "Users can manage own calculations" ON solar_calculations;
DROP POLICY IF EXISTS "Users can insert own calculations" ON solar_calculations;
DROP POLICY IF EXISTS "Users can update own calculations" ON solar_calculations;
DROP POLICY IF EXISTS "Users can delete own calculations" ON solar_calculations;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS solar_calculations CASCADE;
DROP TABLE IF EXISTS user_projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  subscription_type VARCHAR(50) DEFAULT 'free' CHECK (subscription_type IN ('free', 'pro')),
  subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
  usage_count INTEGER DEFAULT 0,
  usage_limit INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  google_id VARCHAR(255) UNIQUE,
  avatar_url TEXT,
  phone VARCHAR(20),
  company VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin'))
);

-- Create user_projects table
CREATE TABLE user_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  coordinates VARCHAR(100),
  system_size_kw DECIMAL(10,2),
  annual_production_kwh INTEGER,
  total_cost DECIMAL(12,2),
  monthly_savings DECIMAL(10,2),
  payback_period DECIMAL(5,2),
  project_data JSONB,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create solar_calculations table
CREATE TABLE solar_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES user_projects(id) ON DELETE CASCADE,
  calculation_type VARCHAR(100) NOT NULL,
  input_data JSONB NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON user_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON user_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON user_projects
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for solar_calculations table
CREATE POLICY "Users can view own calculations" ON solar_calculations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calculations" ON solar_calculations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calculations" ON solar_calculations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calculations" ON solar_calculations
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_user_projects_user_id ON user_projects(user_id);
CREATE INDEX idx_user_projects_created_at ON user_projects(created_at);
CREATE INDEX idx_solar_calculations_user_id ON solar_calculations(user_id);
CREATE INDEX idx_solar_calculations_project_id ON solar_calculations(project_id);
CREATE INDEX idx_solar_calculations_created_at ON solar_calculations(created_at);

-- Insert demo data
INSERT INTO users (id, email, full_name, subscription_type, usage_count, usage_limit) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'demo@example.com', 'Demo User', 'free', 1, 3),
  ('550e8400-e29b-41d4-a716-446655440002', 'pro@example.com', 'Pro User', 'pro', 5, 999)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  subscription_type = EXCLUDED.subscription_type,
  usage_count = EXCLUDED.usage_count,
  usage_limit = EXCLUDED.usage_limit;

-- Insert demo projects
INSERT INTO user_projects (id, user_id, project_name, address, coordinates, system_size_kw, annual_production_kwh, total_cost, monthly_savings, payback_period, status) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Home Solar Project', '123 Main St, Dallas, TX 75201', '32.7767,-96.7970', 8.5, 12500, 25000, 150, 8.5, 'completed'),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Commercial Solar Array', '456 Business Ave, Austin, TX 78701', '30.2672,-97.7431', 25.0, 35000, 75000, 450, 7.2, 'completed')
ON CONFLICT (id) DO UPDATE SET
  project_name = EXCLUDED.project_name,
  address = EXCLUDED.address,
  coordinates = EXCLUDED.coordinates,
  system_size_kw = EXCLUDED.system_size_kw,
  annual_production_kwh = EXCLUDED.annual_production_kwh,
  total_cost = EXCLUDED.total_cost,
  monthly_savings = EXCLUDED.monthly_savings,
  payback_period = EXCLUDED.payback_period,
  status = EXCLUDED.status;

-- Insert demo calculations
INSERT INTO solar_calculations (id, user_id, project_id, calculation_type, input_data, results) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'basic_solar', 
   '{"monthly_bill": 180, "roof_area": 800, "location": "Dallas, TX"}',
   '{"system_size": 8.5, "annual_production": 12500, "monthly_savings": 150, "payback_period": 8.5}'),
  ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 'advanced_solar',
   '{"monthly_bill": 540, "roof_area": 2400, "location": "Austin, TX", "shading": "minimal"}',
   '{"system_size": 25.0, "annual_production": 35000, "monthly_savings": 450, "payback_period": 7.2}')
ON CONFLICT (id) DO UPDATE SET
  calculation_type = EXCLUDED.calculation_type,
  input_data = EXCLUDED.input_data,
  results = EXCLUDED.results;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_projects_updated_at ON user_projects;
CREATE TRIGGER update_user_projects_updated_at BEFORE UPDATE ON user_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_solar_calculations_updated_at ON solar_calculations;
CREATE TRIGGER update_solar_calculations_updated_at BEFORE UPDATE ON solar_calculations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

SELECT 'Database setup completed successfully!' as status;
