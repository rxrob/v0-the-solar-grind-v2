-- Insert Demo Projects and Supporting Data for Solar Grind V2
-- This script creates comprehensive demo data for testing and demonstration

BEGIN;

-- First, let's create the equipment catalog table if it doesn't exist
CREATE TABLE IF NOT EXISTS equipment_catalog (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL, -- 'panel', 'inverter', 'battery'
    manufacturer VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    specifications JSONB NOT NULL,
    cost_per_unit DECIMAL(10,2) NOT NULL,
    warranty_years INTEGER NOT NULL,
    efficiency_rating DECIMAL(5,2),
    wattage INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create project clients table
CREATE TABLE IF NOT EXISTS project_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    company VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create project financing table
CREATE TABLE IF NOT EXISTS project_financing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES user_projects(id),
    financing_type VARCHAR(50) NOT NULL, -- 'cash', 'loan', 'lease', 'ppa'
    down_payment DECIMAL(10,2),
    monthly_payment DECIMAL(10,2),
    interest_rate DECIMAL(5,4),
    term_years INTEGER,
    total_financed DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create project status updates table
CREATE TABLE IF NOT EXISTS project_status_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES user_projects(id),
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    updated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create weather data table
CREATE TABLE IF NOT EXISTS weather_data (
    id SERIAL PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    avg_sun_hours DECIMAL(4,2),
    monthly_irradiance DECIMAL[] DEFAULT ARRAY[0,0,0,0,0,0,0,0,0,0,0,0],
    peak_sun_hours DECIMAL(4,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create system performance table
CREATE TABLE IF NOT EXISTS system_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES user_projects(id),
    month_year DATE,
    actual_production_kwh DECIMAL(10,2),
    expected_production_kwh DECIMAL(10,2),
    performance_ratio DECIMAL(5,4),
    weather_factor DECIMAL(5,4),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert equipment catalog data
INSERT INTO equipment_catalog (category, manufacturer, model, specifications, cost_per_unit, warranty_years, efficiency_rating, wattage) VALUES
-- Solar Panels
('panel', 'Silfab Solar', 'SIL-440 NX', '{"type": "monocrystalline", "dimensions": "79.1 x 39.4 x 1.57 inches", "weight": "48.5 lbs"}', 280.00, 25, 22.6, 440),
('panel', 'Silfab Solar', 'SIL-420 NX', '{"type": "monocrystalline", "dimensions": "79.1 x 39.4 x 1.57 inches", "weight": "47.6 lbs"}', 260.00, 25, 21.8, 420),
('panel', 'Silfab Solar', 'SIL-460 NX', '{"type": "monocrystalline", "dimensions": "79.1 x 39.4 x 1.57 inches", "weight": "49.2 lbs"}', 300.00, 25, 23.1, 460),
('panel', 'REC Solar', 'REC400AA', '{"type": "monocrystalline", "dimensions": "78.7 x 39.4 x 1.38 inches", "weight": "44.1 lbs"}', 290.00, 20, 20.8, 400),
('panel', 'Panasonic', 'EVPV370', '{"type": "HIT", "dimensions": "62.6 x 41.5 x 1.57 inches", "weight": "41.9 lbs"}', 320.00, 25, 21.7, 370),

-- Inverters
('inverter', 'Enphase', 'IQ8M-72-2-US', '{"type": "microinverter", "max_power": "330W", "efficiency": "97.8%"}', 180.00, 25, 97.8, 330),
('inverter', 'Enphase', 'IQ8A-72-2-US', '{"type": "microinverter", "max_power": "366W", "efficiency": "97.7%"}', 200.00, 25, 97.7, 366),
('inverter', 'Enphase', 'IQ8H-72-2-US', '{"type": "microinverter", "max_power": "384W", "efficiency": "97.5%"}', 220.00, 25, 97.5, 384),
('inverter', 'SolarEdge', 'SE7600H-US', '{"type": "string", "max_power": "7600W", "efficiency": "99.0%"}', 1200.00, 12, 99.0, 7600),
('inverter', 'SMA', 'SB7.7-1 SP-US', '{"type": "string", "max_power": "7700W", "efficiency": "98.0%"}', 1100.00, 10, 98.0, 7700),

-- Batteries
('battery', 'Tesla', 'Powerwall 3', '{"capacity": "13.5 kWh", "power": "11.5 kW", "type": "lithium-ion"}', 15000.00, 10, NULL, NULL),
('battery', 'Enphase', 'IQ Battery 5P', '{"capacity": "5.0 kWh", "power": "3.84 kW", "type": "lithium-ion"}', 8000.00, 15, NULL, NULL),
('battery', 'Enphase', 'IQ Battery 10', '{"capacity": "10.1 kWh", "power": "5.76 kW", "type": "lithium-ion"}', 12000.00, 15, NULL, NULL),
('battery', 'LG Chem', 'RESU10H', '{"capacity": "9.8 kWh", "power": "5.0 kW", "type": "lithium-ion"}', 9500.00, 10, NULL, NULL);

-- Insert weather data for demo locations
INSERT INTO weather_data (location, latitude, longitude, avg_sun_hours, monthly_irradiance, peak_sun_hours) VALUES
('Salt Lake City, UT', 40.7608, -111.8910, 5.8, ARRAY[3.2, 4.1, 5.3, 6.8, 7.9, 8.5, 8.7, 8.1, 6.9, 5.2, 3.8, 2.9], 5.8),
('Phoenix, AZ', 33.4484, -112.0740, 6.5, ARRAY[4.2, 5.1, 6.8, 8.2, 9.1, 9.8, 9.5, 8.9, 7.8, 6.4, 4.8, 3.9], 6.5),
('Los Angeles, CA', 34.0522, -118.2437, 5.2, ARRAY[3.8, 4.6, 5.9, 7.1, 7.8, 8.2, 8.5, 8.0, 6.9, 5.7, 4.2, 3.5], 5.2),
('Austin, TX', 30.2672, -97.7431, 5.0, ARRAY[3.1, 4.0, 5.2, 6.5, 7.2, 7.8, 8.1, 7.6, 6.4, 5.1, 3.7, 2.8], 5.0),
('Denver, CO', 39.7392, -104.9903, 5.7, ARRAY[3.5, 4.4, 5.7, 6.9, 7.6, 8.2, 8.4, 7.9, 6.8, 5.4, 4.0, 3.2], 5.7);

-- Insert demo clients
INSERT INTO project_clients (id, name, email, phone, address, company) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'John Smith', 'john.smith@email.com', '(555) 123-4567', '123 Solar Street, Salt Lake City, UT 84101', NULL),
('550e8400-e29b-41d4-a716-446655440002', 'Sarah Johnson', 'sarah.johnson@email.com', '(555) 234-5678', '456 Green Avenue, Phoenix, AZ 85001', NULL),
('550e8400-e29b-41d4-a716-446655440003', 'Michael Brown', 'michael.brown@email.com', '(555) 345-6789', '789 Eco Drive, Los Angeles, CA 90210', 'Brown Enterprises'),
('550e8400-e29b-41d4-a716-446655440004', 'Emily Davis', 'emily.davis@email.com', '(555) 456-7890', '321 Renewable Road, Austin, TX 78701', NULL),
('550e8400-e29b-41d4-a716-446655440005', 'David Wilson', 'david.wilson@email.com', '(555) 567-8901', '654 Solar Circle, Denver, CO 80202', 'Wilson Solar Solutions');

-- Insert demo projects
INSERT INTO user_projects (
    id, user_email, customer_name, customer_email, customer_phone, project_name, 
    property_address, system_size_kw, panelsNeeded, panelWattage, microinverterType,
    annual_production_kwh, monthly_kwh, current_electric_bill, system_cost, net_cost,
    annual_savings, monthly_savings, roi_years, co2_offset_tons, trees_equivalent,
    peak_sun_hours, roof_condition, roof_type, selected_financing, status,
    pdf_generated, edit_count, state_code, created_at, updated_at
) VALUES
-- Project 1: Salt Lake City Residential
('550e8400-e29b-41d4-a716-446655440001', 'demo@solargrind.com', 'John Smith', 'john.smith@email.com', '(555) 123-4567',
 'Smith Residence Solar Installation', '123 Solar Street, Salt Lake City, UT 84101',
 8.8, 20, 440, 'Enphase IQ8M', 12500, 950, 145, 26400, 18480, 1740, 145, 10.6, 5.5, 88,
 5.8, 'Good', 'Asphalt Shingle', 'Solar Loan', 'active', true, 2, 'UT', NOW() - INTERVAL '15 days', NOW() - INTERVAL '2 days'),

-- Project 2: Phoenix Commercial
('550e8400-e29b-41d4-a716-446655440002', 'demo@solargrind.com', 'Sarah Johnson', 'sarah.johnson@email.com', '(555) 234-5678',
 'Johnson Commercial Solar Array', '456 Green Avenue, Phoenix, AZ 85001',
 45.2, 98, 460, 'Enphase IQ8H', 72800, 4200, 630, 135600, 94920, 7560, 630, 12.6, 32.1, 515,
 6.5, 'Excellent', 'TPO Membrane', 'Cash Purchase', 'completed', true, 5, 'AZ', NOW() - INTERVAL '45 days', NOW() - INTERVAL '5 days'),

-- Project 3: Los Angeles Luxury Home
('550e8400-e29b-41d4-a716-446655440003', 'demo@solargrind.com', 'Michael Brown', 'michael.brown@email.com', '(555) 345-6789',
 'Brown Estate Solar System', '789 Eco Drive, Los Angeles, CA 90210',
 12.6, 30, 420, 'Enphase IQ8A', 16800, 1250, 185, 37800, 26460, 2220, 185, 11.9, 7.4, 119,
 5.2, 'Good', 'Clay Tile', 'Solar Lease', 'in_progress', false, 3, 'CA', NOW() - INTERVAL '8 days', NOW() - INTERVAL '1 day'),

-- Project 4: Austin Starter Home
('550e8400-e29b-41d4-a716-446655440004', 'demo@solargrind.com', 'Emily Davis', 'emily.davis@email.com', '(555) 456-7890',
 'Davis Home Solar Project', '321 Renewable Road, Austin, TX 78701',
 6.3, 15, 420, 'Enphase IQ8M', 8400, 720, 108, 18900, 13230, 1296, 108, 10.2, 3.7, 59,
 5.0, 'Fair', 'Asphalt Shingle', 'PPA Agreement', 'draft', false, 1, 'TX', NOW() - INTERVAL '3 days', NOW()),

-- Project 5: Denver Mountain Home
('550e8400-e29b-41d4-a716-446655440005', 'demo@solargrind.com', 'David Wilson', 'david.wilson@email.com', '(555) 567-8901',
 'Wilson Mountain Solar Installation', '654 Solar Circle, Denver, CO 80202',
 10.4, 26, 400, 'Enphase IQ8M', 14200, 1050, 158, 31200, 21840, 1896, 158, 11.5, 6.3, 101,
 5.7, 'Good', 'Metal Standing Seam', 'Solar Loan', 'active', true, 4, 'CO', NOW() - INTERVAL '22 days', NOW() - INTERVAL '3 days');

-- Insert financing options for projects
INSERT INTO project_financing (project_id, financing_type, down_payment, monthly_payment, interest_rate, term_years, total_financed) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'loan', 2640.00, 185.50, 0.0599, 20, 23760.00),
('550e8400-e29b-41d4-a716-446655440002', 'cash', 135600.00, 0.00, 0.0000, 0, 0.00),
('550e8400-e29b-41d4-a716-446655440003', 'lease', 0.00, 165.00, 0.0000, 20, 39600.00),
('550e8400-e29b-41d4-a716-446655440004', 'ppa', 0.00, 95.00, 0.0000, 25, 28500.00),
('550e8400-e29b-41d4-a716-446655440005', 'loan', 3120.00, 210.75, 0.0649, 20, 28080.00);

-- Insert project status updates
INSERT INTO project_status_updates (project_id, status, notes, updated_by) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'draft', 'Initial project created', 'demo@solargrind.com'),
('550e8400-e29b-41d4-a716-446655440001', 'active', 'Customer approved proposal', 'demo@solargrind.com'),
('550e8400-e29b-41d4-a716-446655440002', 'draft', 'Commercial project initiated', 'demo@solargrind.com'),
('550e8400-e29b-41d4-a716-446655440002', 'active', 'Permits approved', 'demo@solargrind.com'),
('550e8400-e29b-41d4-a716-446655440002', 'completed', 'Installation completed and PTO received', 'demo@solargrind.com'),
('550e8400-e29b-41d4-a716-446655440003', 'draft', 'Luxury home assessment completed', 'demo@solargrind.com'),
('550e8400-e29b-41d4-a716-446655440003', 'in_progress', 'Installation in progress', 'demo@solargrind.com'),
('550e8400-e29b-41d4-a716-446655440004', 'draft', 'Initial consultation completed', 'demo@solargrind.com'),
('550e8400-e29b-41d4-a716-446655440005', 'draft', 'Mountain home site survey completed', 'demo@solargrind.com'),
('550e8400-e29b-41d4-a716-446655440005', 'active', 'Engineering design approved', 'demo@solargrind.com');

-- Insert system performance data (for completed and active projects)
INSERT INTO system_performance (project_id, month_year, actual_production_kwh, expected_production_kwh, performance_ratio, weather_factor) VALUES
-- Smith Residence (Active project - 2 months of data)
('550e8400-e29b-41d4-a716-446655440001', '2024-01-01', 980, 1042, 0.9405, 0.95),
('550e8400-e29b-41d4-a716-446655440001', '2024-02-01', 1120, 1180, 0.9492, 0.98),

-- Johnson Commercial (Completed project - 6 months of data)
('550e8400-e29b-41d4-a716-446655440002', '2023-09-01', 5850, 6067, 0.9642, 1.02),
('550e8400-e29b-41d4-a716-446655440002', '2023-10-01', 6420, 6533, 0.9827, 1.05),
('550e8400-e29b-41d4-a716-446655440002', '2023-11-01', 5680, 5733, 0.9908, 0.98),
('550e8400-e29b-41d4-a716-446655440002', '2023-12-01', 5120, 5267, 0.9721, 0.94),
('550e8400-e29b-41d4-a716-446655440002', '2024-01-01', 5890, 6067, 0.9708, 1.01),
('550e8400-e29b-41d4-a716-446655440002', '2024-02-01', 6250, 6400, 0.9766, 1.03),

-- Wilson Mountain Home (Active project - 1 month of data)
('550e8400-e29b-41d4-a716-446655440005', '2024-02-01', 1180, 1183, 0.9975, 1.01);

-- Insert some demo project data
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
) ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_equipment_catalog_category ON equipment_catalog(category);
CREATE INDEX IF NOT EXISTS idx_equipment_catalog_manufacturer ON equipment_catalog(manufacturer);
CREATE INDEX IF NOT EXISTS idx_project_clients_email ON project_clients(email);
CREATE INDEX IF NOT EXISTS idx_project_financing_project_id ON project_financing(project_id);
CREATE INDEX IF NOT EXISTS idx_project_status_updates_project_id ON project_status_updates(project_id);
CREATE INDEX IF NOT EXISTS idx_weather_data_location ON weather_data(location);
CREATE INDEX IF NOT EXISTS idx_system_performance_project_id ON system_performance(project_id);
CREATE INDEX IF NOT EXISTS idx_system_performance_month_year ON system_performance(month_year);

-- Update user_projects table to add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add customer_email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'customer_email') THEN
        ALTER TABLE user_projects ADD COLUMN customer_email VARCHAR(255);
    END IF;
    
    -- Add customer_phone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'customer_phone') THEN
        ALTER TABLE user_projects ADD COLUMN customer_phone VARCHAR(50);
    END IF;
    
    -- Add panelsNeeded column if it doesn't exist (note the camelCase)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'panelsneeded') THEN
        ALTER TABLE user_projects ADD COLUMN panelsNeeded INTEGER;
    END IF;
    
    -- Add panelWattage column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'panelwattage') THEN
        ALTER TABLE user_projects ADD COLUMN panelWattage INTEGER;
    END IF;
    
    -- Add microinverterType column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'microinvertertype') THEN
        ALTER TABLE user_projects ADD COLUMN microinverterType VARCHAR(100);
    END IF;
    
    -- Add monthly_kwh column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'monthly_kwh') THEN
        ALTER TABLE user_projects ADD COLUMN monthly_kwh DECIMAL(10,2);
    END IF;
    
    -- Add current_electric_bill column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'current_electric_bill') THEN
        ALTER TABLE user_projects ADD COLUMN current_electric_bill DECIMAL(10,2);
    END IF;
    
    -- Add monthly_savings column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'monthly_savings') THEN
        ALTER TABLE user_projects ADD COLUMN monthly_savings DECIMAL(10,2);
    END IF;
    
    -- Add roi_years column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'roi_years') THEN
        ALTER TABLE user_projects ADD COLUMN roi_years DECIMAL(5,2);
    END IF;
    
    -- Add co2_offset_tons column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'co2_offset_tons') THEN
        ALTER TABLE user_projects ADD COLUMN co2_offset_tons DECIMAL(8,2);
    END IF;
    
    -- Add trees_equivalent column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'trees_equivalent') THEN
        ALTER TABLE user_projects ADD COLUMN trees_equivalent INTEGER;
    END IF;
    
    -- Add peak_sun_hours column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'peak_sun_hours') THEN
        ALTER TABLE user_projects ADD COLUMN peak_sun_hours DECIMAL(4,2);
    END IF;
    
    -- Add roof_condition column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'roof_condition') THEN
        ALTER TABLE user_projects ADD COLUMN roof_condition VARCHAR(50);
    END IF;
    
    -- Add roof_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'roof_type') THEN
        ALTER TABLE user_projects ADD COLUMN roof_type VARCHAR(50);
    END IF;
    
    -- Add selected_financing column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'selected_financing') THEN
        ALTER TABLE user_projects ADD COLUMN selected_financing VARCHAR(50);
    END IF;
    
    -- Add pdf_generated column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'pdf_generated') THEN
        ALTER TABLE user_projects ADD COLUMN pdf_generated BOOLEAN DEFAULT false;
    END IF;
    
    -- Add edit_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'edit_count') THEN
        ALTER TABLE user_projects ADD COLUMN edit_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add state_code column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'state_code') THEN
        ALTER TABLE user_projects ADD COLUMN state_code VARCHAR(2);
    END IF;
END $$;

COMMIT;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Demo projects and supporting data inserted successfully!';
    RAISE NOTICE 'Created % demo projects with comprehensive data', (SELECT COUNT(*) FROM user_projects WHERE user_email = 'demo@solargrind.com');
    RAISE NOTICE 'Equipment catalog contains % items', (SELECT COUNT(*) FROM equipment_catalog);
    RAISE NOTICE 'Weather data available for % locations', (SELECT COUNT(*) FROM weather_data);
END $$;
