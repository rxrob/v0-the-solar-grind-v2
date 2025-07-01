-- Drop existing indexes and table if they have issues
DROP INDEX IF EXISTS idx_solar_calculations_user_id;
DROP INDEX IF EXISTS idx_solar_calculations_user_email;
DROP INDEX IF EXISTS idx_solar_calculations_created_at;
DROP TABLE IF EXISTS solar_calculations CASCADE;

-- Create solar_calculations table for storing calculation history
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

-- Create indexes for better performance
CREATE INDEX idx_solar_calculations_user_id ON solar_calculations(user_id);
CREATE INDEX idx_solar_calculations_user_email ON solar_calculations(user_email);
CREATE INDEX idx_solar_calculations_created_at ON solar_calculations(created_at);

-- Insert some demo calculation data
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
  '{"systemSizeKw": 8.5, "annualSavings": 1800, "netCost": 18000, "roiYears": 10.0}'::jsonb
) ON CONFLICT DO NOTHING;
