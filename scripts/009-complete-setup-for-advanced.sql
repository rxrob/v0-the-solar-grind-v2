-- Complete cleanup and setup for advanced calculator
-- This will handle existing objects and add new fields needed

-- First, let's safely add any missing columns to existing tables
DO $$ 
BEGIN
    -- Add advanced calculator fields to user_projects if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'calculation_type') THEN
        ALTER TABLE user_projects ADD COLUMN calculation_type VARCHAR(20) DEFAULT 'basic';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'satellite_data') THEN
        ALTER TABLE user_projects ADD COLUMN satellite_data JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'battery_storage_kwh') THEN
        ALTER TABLE user_projects ADD COLUMN battery_storage_kwh DECIMAL(6,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'has_battery') THEN
        ALTER TABLE user_projects ADD COLUMN has_battery BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'financing_option') THEN
        ALTER TABLE user_projects ADD COLUMN financing_option VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'loan_term_years') THEN
        ALTER TABLE user_projects ADD COLUMN loan_term_years INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'interest_rate') THEN
        ALTER TABLE user_projects ADD COLUMN interest_rate DECIMAL(5,3);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'monthly_payment') THEN
        ALTER TABLE user_projects ADD COLUMN monthly_payment DECIMAL(8,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'roof_orientation') THEN
        ALTER TABLE user_projects ADD COLUMN roof_orientation VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'roof_tilt') THEN
        ALTER TABLE user_projects ADD COLUMN roof_tilt INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'shading_percentage') THEN
        ALTER TABLE user_projects ADD COLUMN shading_percentage INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'system_efficiency') THEN
        ALTER TABLE user_projects ADD COLUMN system_efficiency DECIMAL(5,3);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'performance_ratio') THEN
        ALTER TABLE user_projects ADD COLUMN performance_ratio DECIMAL(4,3);
    END IF;
    
    -- Add advanced fields to solar_calculations if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'solar_calculations' AND column_name = 'calculation_type') THEN
        ALTER TABLE solar_calculations ADD COLUMN calculation_type VARCHAR(20) DEFAULT 'basic';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'solar_calculations' AND column_name = 'advanced_results') THEN
        ALTER TABLE solar_calculations ADD COLUMN advanced_results JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'solar_calculations' AND column_name = 'property_type') THEN
        ALTER TABLE solar_calculations ADD COLUMN property_type VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'solar_calculations' AND column_name = 'time_of_use_rate') THEN
        ALTER TABLE solar_calculations ADD COLUMN time_of_use_rate BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'solar_calculations' AND column_name = 'peak_rate') THEN
        ALTER TABLE solar_calculations ADD COLUMN peak_rate DECIMAL(6,4);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'solar_calculations' AND column_name = 'off_peak_rate') THEN
        ALTER TABLE solar_calculations ADD COLUMN off_peak_rate DECIMAL(6,4);
    END IF;
END $$;

-- Update existing projects to have calculation_type
UPDATE user_projects SET calculation_type = 'basic' WHERE calculation_type IS NULL;
UPDATE solar_calculations SET calculation_type = 'basic' WHERE calculation_type IS NULL;

-- Insert some advanced demo projects for Pro users
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
  status,
  calculation_type,
  has_battery,
  battery_storage_kwh,
  financing_option,
  loan_term_years,
  interest_rate,
  monthly_payment,
  roof_orientation,
  roof_tilt,
  shading_percentage,
  system_efficiency,
  performance_ratio
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'Advanced Pro Project',
  'user@gmail.com',
  '(555) 987-6543',
  '789 Advanced Solar Blvd, Austin, TX 78701',
  3500,
  4,
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
  12.0,
  7.2,
  115,
  'metal',
  'excellent',
  6.2,
  'calculated',
  'advanced',
  TRUE,
  13.5,
  'loan',
  20,
  4.5,
  285.50,
  'south',
  30,
  5,
  0.85,
  0.82
), (
  '550e8400-e29b-41d4-a716-446655440002',
  'Premium Advanced System',
  'pro@example.com',
  '(555) 555-5555',
  '456 Premium Energy Way, Dallas, TX 75201',
  4200,
  5,
  2200,
  264.00,
  15.0,
  36,
  425,
  21600,
  53250,
  37275,
  3168,
  264,
  11.8,
  8.6,
  138,
  'tile',
  'excellent',
  6.4,
  'calculated',
  'advanced',
  TRUE,
  16.0,
  'cash',
  0,
  0.0,
  0.00,
  'southwest',
  25,
  3,
  0.87,
  0.84
) ON CONFLICT DO NOTHING;

-- Insert advanced calculations
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
  results,
  calculation_type,
  property_type,
  time_of_use_rate,
  peak_rate,
  off_peak_rate,
  advanced_results
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  '789 Advanced Solar Blvd, Austin, TX 78701',
  1800,
  0.12,
  'Austin Energy',
  'metal',
  '0-5',
  'minimal',
  'user@gmail.com',
  '{"systemSizeKw": 12.5, "annualSavings": 2592, "netCost": 31000, "roiYears": 12.0, "monthlySavings": 216, "panelsNeeded": 30, "panelWattage": 425}'::jsonb,
  'advanced',
  'residential',
  TRUE,
  0.15,
  0.08,
  '{"batteryBackupHours": 8, "systemEfficiency": 0.85, "performanceRatio": 0.82, "orientationFactor": 0.95, "shadingLoss": 5, "financialProjections": {"year1": 2592, "year5": 13500, "year10": 28000, "year25": 75000}}'::jsonb
), (
  '550e8400-e29b-41d4-a716-446655440002',
  '456 Premium Energy Way, Dallas, TX 75201',
  2200,
  0.13,
  'Oncor Electric',
  'tile',
  '0-5',
  'none',
  'pro@example.com',
  '{"systemSizeKw": 15.0, "annualSavings": 3168, "netCost": 37000, "roiYears": 11.7, "monthlySavings": 264, "panelsNeeded": 36, "panelWattage": 425}'::jsonb,
  'advanced',
  'residential',
  TRUE,
  0.16,
  0.09,
  '{"batteryBackupHours": 10, "systemEfficiency": 0.87, "performanceRatio": 0.84, "orientationFactor": 0.98, "shadingLoss": 3, "financialProjections": {"year1": 3168, "year5": 16500, "year10": 34000, "year25": 92000}}'::jsonb
) ON CONFLICT DO NOTHING;

-- Create indexes for advanced calculator fields if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_projects_calculation_type') THEN
        CREATE INDEX idx_user_projects_calculation_type ON user_projects(calculation_type);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_solar_calculations_calculation_type') THEN
        CREATE INDEX idx_solar_calculations_calculation_type ON solar_calculations(calculation_type);
    END IF;
END $$;

-- Verify the advanced setup
SELECT 'Advanced calculator setup completed!' as status;
SELECT 'Total users: ' || COUNT(*) as user_count FROM users;
SELECT 'Total projects: ' || COUNT(*) as project_count FROM user_projects;
SELECT 'Advanced projects: ' || COUNT(*) as advanced_project_count FROM user_projects WHERE calculation_type = 'advanced';
SELECT 'Total calculations: ' || COUNT(*) as calc_count FROM solar_calculations;
SELECT 'Advanced calculations: ' || COUNT(*) as advanced_calc_count FROM solar_calculations WHERE calculation_type = 'advanced';
