-- Create ion_projects table for Ion Solar professional tier
CREATE TABLE IF NOT EXISTS ion_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Project Basic Info
  project_name VARCHAR(255) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  client_phone VARCHAR(50),
  property_address TEXT NOT NULL,
  
  -- System Specifications
  system_size_kw DECIMAL(10,2),
  panel_type VARCHAR(100),
  inverter_type VARCHAR(100),
  battery_storage BOOLEAN DEFAULT FALSE,
  battery_capacity_kwh DECIMAL(10,2),
  
  -- Energy & Financial Data
  monthly_bill DECIMAL(10,2),
  annual_usage_kwh DECIMAL(12,2),
  electricity_rate DECIMAL(6,4),
  installation_cost DECIMAL(12,2),
  incentives DECIMAL(12,2),
  
  -- Deal Management
  deal_status VARCHAR(50) DEFAULT 'prospect',
  deal_value DECIMAL(12,2),
  commission_rate DECIMAL(5,2),
  referral_source VARCHAR(255),
  
  -- Financing Information
  financing_type VARCHAR(50),
  loan_amount DECIMAL(12,2),
  monthly_payment DECIMAL(10,2),
  loan_term_years INTEGER,
  interest_rate DECIMAL(5,2),
  lender_info JSONB,
  
  -- Contractor Information
  contractor_name VARCHAR(255),
  contractor_contact VARCHAR(255),
  installation_date DATE,
  contractor_info JSONB,
  
  -- Project Details
  roof_type VARCHAR(100),
  roof_age INTEGER,
  shading_level VARCHAR(50),
  permit_status VARCHAR(50),
  hoa_approval BOOLEAN DEFAULT FALSE,
  
  -- Calculations & Results
  annual_production_kwh DECIMAL(12,2),
  annual_savings DECIMAL(10,2),
  payback_period_years DECIMAL(5,2),
  roi_25_year DECIMAL(12,2),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_deal_status CHECK (deal_status IN ('prospect', 'qualified', 'proposal', 'contract', 'installed', 'cancelled')),
  CONSTRAINT valid_financing_type CHECK (financing_type IN ('cash', 'loan', 'lease', 'ppa')),
  CONSTRAINT positive_system_size CHECK (system_size_kw > 0),
  CONSTRAINT positive_deal_value CHECK (deal_value >= 0)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ion_projects_user_id ON ion_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_ion_projects_deal_status ON ion_projects(deal_status);
CREATE INDEX IF NOT EXISTS idx_ion_projects_created_at ON ion_projects(created_at);

-- Enable Row Level Security
ALTER TABLE ion_projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own ion projects" ON ion_projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ion projects" ON ion_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ion projects" ON ion_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ion projects" ON ion_projects
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_ion_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ion_projects_updated_at
  BEFORE UPDATE ON ion_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_ion_projects_updated_at();

-- Insert some sample data for testing
INSERT INTO ion_projects (
  user_id,
  project_name,
  client_name,
  client_email,
  client_phone,
  property_address,
  system_size_kw,
  panel_type,
  inverter_type,
  battery_storage,
  monthly_bill,
  annual_usage_kwh,
  electricity_rate,
  installation_cost,
  incentives,
  deal_status,
  deal_value,
  commission_rate,
  financing_type,
  loan_amount,
  monthly_payment,
  contractor_name,
  roof_type,
  annual_production_kwh,
  annual_savings,
  payback_period_years,
  roi_25_year
) VALUES 
(
  (SELECT id FROM auth.users WHERE email LIKE '%@%' LIMIT 1),
  'Johnson Residence Solar',
  'Mike Johnson',
  'mike.johnson@email.com',
  '(555) 123-4567',
  '123 Oak Street, Dallas, TX 75201',
  12.5,
  'Monocrystalline',
  'String Inverter',
  true,
  185.50,
  15000,
  0.12,
  35000,
  10500,
  'proposal',
  35000,
  8.5,
  'loan',
  24500,
  145.30,
  'ABC Solar Installers',
  'Asphalt Shingle',
  18750,
  2250,
  10.9,
  56250
),
(
  (SELECT id FROM auth.users WHERE email LIKE '%@%' LIMIT 1),
  'Smith Commercial Project',
  'Sarah Smith',
  'sarah.smith@business.com',
  '(555) 987-6543',
  '456 Business Blvd, Houston, TX 77001',
  50.0,
  'Monocrystalline',
  'Power Optimizer',
  false,
  850.00,
  72000,
  0.11,
  125000,
  37500,
  'contract',
  125000,
  12.0,
  'cash',
  0,
  0,
  'Solar Pro Contractors',
  'Metal',
  75000,
  8250,
  10.6,
  206250
);
