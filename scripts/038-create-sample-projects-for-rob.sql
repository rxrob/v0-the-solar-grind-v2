-- Create sample projects for Rob's dashboard
INSERT INTO user_projects (
    id,
    user_email,
    customer_name,
    project_name,
    property_address,
    system_size_kw,
    annual_production_kwh,
    system_cost,
    net_cost,
    annual_savings,
    status,
    created_at,
    updated_at,
    notes,
    installation_date,
    completion_date
) VALUES 
(
    'proj-johnson-family-001',
    'rob@mysolarai.com',
    'Johnson Family',
    'Residential Solar Installation',
    '123 Oak Street, Austin, TX 78701',
    8.5,
    12750,
    25500,
    17850,
    2340,
    'completed',
    '2024-01-15 10:00:00',
    '2024-02-28 16:30:00',
    'Standard residential installation with premium panels. Customer very satisfied.',
    '2024-02-01',
    '2024-02-28'
),
(
    'proj-smith-residence-002',
    'rob@mysolarai.com',
    'Smith Residence',
    'Rooftop Solar System',
    '456 Pine Avenue, Austin, TX 78702',
    12.0,
    18000,
    36000,
    25200,
    3120,
    'in_progress',
    '2024-02-01 09:15:00',
    '2024-06-15 14:20:00',
    'Large residential system with battery backup. Installation 80% complete.',
    '2024-06-01',
    NULL
),
(
    'proj-green-energy-corp-003',
    'rob@mysolarai.com',
    'Green Energy Corp',
    'Commercial Solar Array',
    '789 Business Park Drive, Austin, TX 78703',
    50.0,
    75000,
    150000,
    105000,
    15600,
    'planning',
    '2024-03-10 11:30:00',
    '2024-06-20 09:45:00',
    'Large commercial installation. Permits approved, waiting for equipment delivery.',
    '2024-07-15',
    NULL
) ON CONFLICT (id) DO UPDATE SET
    user_email = EXCLUDED.user_email,
    customer_name = EXCLUDED.customer_name,
    project_name = EXCLUDED.project_name,
    property_address = EXCLUDED.property_address,
    system_size_kw = EXCLUDED.system_size_kw,
    annual_production_kwh = EXCLUDED.annual_production_kwh,
    system_cost = EXCLUDED.system_cost,
    net_cost = EXCLUDED.net_cost,
    annual_savings = EXCLUDED.annual_savings,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at,
    notes = EXCLUDED.notes,
    installation_date = EXCLUDED.installation_date,
    completion_date = EXCLUDED.completion_date;

-- Create some usage tracking entries for Rob
INSERT INTO usage_tracking (
    user_email,
    calculation_type,
    created_at
) VALUES 
('rob@mysolarai.com', 'pro', '2024-06-01 10:00:00'),
('rob@mysolarai.com', 'pro', '2024-06-02 14:30:00'),
('rob@mysolarai.com', 'pro', '2024-06-03 09:15:00'),
('rob@mysolarai.com', 'pro', '2024-06-05 16:45:00'),
('rob@mysolarai.com', 'pro', '2024-06-08 11:20:00'),
('rob@mysolarai.com', 'basic', '2024-06-10 13:10:00'),
('rob@mysolarai.com', 'pro', '2024-06-12 15:30:00'),
('rob@mysolarai.com', 'pro', '2024-06-15 10:45:00'),
('rob@mysolarai.com', 'pro', '2024-06-18 14:20:00'),
('rob@mysolarai.com', 'pro', '2024-06-20 09:30:00');

-- Verify the data
SELECT 'Projects for Rob:' as info;
SELECT customer_name, project_name, status, annual_savings FROM user_projects WHERE user_email = 'rob@mysolarai.com';

SELECT 'Usage tracking for Rob:' as info;
SELECT calculation_type, COUNT(*) as count FROM usage_tracking WHERE user_email = 'rob@mysolarai.com' GROUP BY calculation_type;

SELECT 'Total savings:' as info;
SELECT SUM(annual_savings) as total_annual_savings FROM user_projects WHERE user_email = 'rob@mysolarai.com';
