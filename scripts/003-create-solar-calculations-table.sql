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

-- Create RLS policies
ALTER TABLE solar_calculations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own calculations
CREATE POLICY "Users can view own calculations" ON solar_calculations
  FOR SELECT USING (user_id = auth.uid() OR user_email = auth.email());

CREATE POLICY "Users can insert calculations" ON solar_calculations
  FOR INSERT WITH CHECK (true); -- Allow anonymous calculations

-- Create indexes for better performance
CREATE INDEX idx_solar_calculations_user_id ON solar_calculations(user_id);
CREATE INDEX idx_solar_calculations_user_email ON solar_calculations(user_email);
CREATE INDEX idx_solar_calculations_created_at ON solar_calculations(created_at);
