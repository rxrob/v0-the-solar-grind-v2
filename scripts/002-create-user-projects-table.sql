-- Create user_projects table to store solar calculations
CREATE TABLE IF NOT EXISTS user_projects (
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

-- Create RLS policies
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;

-- Users can only see their own projects
CREATE POLICY "Users can view own projects" ON user_projects
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own projects" ON user_projects
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects" ON user_projects
  FOR UPDATE USING (user_id = auth.uid());

-- Create updated_at trigger
CREATE TRIGGER update_user_projects_updated_at 
  BEFORE UPDATE ON user_projects 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_projects_user_id ON user_projects(user_id);
CREATE INDEX idx_user_projects_created_at ON user_projects(created_at);
CREATE INDEX idx_user_projects_status ON user_projects(status);
