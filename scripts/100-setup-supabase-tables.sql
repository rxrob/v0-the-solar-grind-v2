-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_subscription_tier CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  CONSTRAINT check_subscription_status CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due'))
);

-- Create solar_calculations table if it doesn't exist
CREATE TABLE IF NOT EXISTS solar_calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  monthly_kwh DECIMAL(10,2) NOT NULL,
  electricity_rate DECIMAL(10,4) NOT NULL,
  results JSONB NOT NULL,
  calculation_type VARCHAR(50) DEFAULT 'basic',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_calculation_type CHECK (calculation_type IN ('basic', 'advanced', 'pro'))
);

-- Create user_projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  property_address TEXT NOT NULL,
  system_size_kw DECIMAL(10,2) NOT NULL,
  annual_production_kwh DECIMAL(12,2) NOT NULL,
  system_cost DECIMAL(12,2) NOT NULL,
  net_cost DECIMAL(12,2) NOT NULL,
  annual_savings DECIMAL(12,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  project_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_project_status CHECK (status IN ('active', 'completed', 'cancelled', 'on_hold'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_tier, subscription_status);
CREATE INDEX IF NOT EXISTS idx_solar_calculations_user_email ON solar_calculations(user_email);
CREATE INDEX IF NOT EXISTS idx_solar_calculations_created_at ON solar_calculations(created_at);
CREATE INDEX IF NOT EXISTS idx_user_projects_user_email ON user_projects(user_email);
CREATE INDEX IF NOT EXISTS idx_user_projects_status ON user_projects(status);

-- Insert a test user if it doesn't exist
INSERT INTO users (email, name, subscription_tier, subscription_status)
VALUES ('test@mysolarai.com', 'Test User', 'pro', 'active')
ON CONFLICT (email) DO NOTHING;

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_solar_calculations_updated_at ON solar_calculations;
CREATE TRIGGER update_solar_calculations_updated_at
    BEFORE UPDATE ON solar_calculations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_projects_updated_at ON user_projects;
CREATE TRIGGER update_user_projects_updated_at
    BEFORE UPDATE ON user_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
