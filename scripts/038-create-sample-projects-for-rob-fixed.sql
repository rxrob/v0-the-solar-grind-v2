-- Create sample projects for Rob's pro account
DO $$
DECLARE
    rob_user_id UUID;
BEGIN
    -- Get Rob's user ID
    SELECT id INTO rob_user_id FROM public.users WHERE email = 'rob@mysolarai.com';
    
    IF rob_user_id IS NULL THEN
        RAISE EXCEPTION 'Rob user not found. Please run script 037 first.';
    END IF;
    
    -- Clear existing projects for Rob
    DELETE FROM public.user_projects WHERE user_id = rob_user_id;
    DELETE FROM public.solar_calculations WHERE user_id = rob_user_id;
    
    -- Insert sample projects
    INSERT INTO public.user_projects (
        id,
        user_id,
        name,
        description,
        status,
        created_at,
        updated_at
    ) VALUES 
    (gen_random_uuid(), rob_user_id, 'Johnson Residence Solar', 'Residential 8.5kW system installation', 'completed', NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), rob_user_id, 'Smith Family Home', '12kW rooftop solar with battery backup', 'completed', NOW() - INTERVAL '25 days', NOW() - INTERVAL '3 days'),
    (gen_random_uuid(), rob_user_id, 'Green Valley Office', 'Commercial 25kW solar installation', 'in_progress', NOW() - INTERVAL '20 days', NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), rob_user_id, 'Martinez Duplex', 'Dual-unit residential solar system', 'completed', NOW() - INTERVAL '18 days', NOW() - INTERVAL '2 days'),
    (gen_random_uuid(), rob_user_id, 'Riverside Warehouse', 'Large commercial 50kW system', 'in_progress', NOW() - INTERVAL '15 days', NOW()),
    (gen_random_uuid(), rob_user_id, 'Thompson Cottage', 'Small residential 6kW system', 'completed', NOW() - INTERVAL '12 days', NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), rob_user_id, 'Downtown Retail Store', 'Commercial rooftop 18kW system', 'planning', NOW() - INTERVAL '10 days', NOW()),
    (gen_random_uuid(), rob_user_id, 'Wilson Estate', 'Large residential 15kW with pool heating', 'completed', NOW() - INTERVAL '8 days', NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), rob_user_id, 'Tech Startup Office', 'Modern office 22kW solar system', 'in_progress', NOW() - INTERVAL '6 days', NOW()),
    (gen_random_uuid(), rob_user_id, 'Community Center', 'Public building 35kW installation', 'planning', NOW() - INTERVAL '4 days', NOW()),
    (gen_random_uuid(), rob_user_id, 'Rodriguez Family', 'Residential 9.5kW system with EV charging', 'completed', NOW() - INTERVAL '3 days', NOW()),
    (gen_random_uuid(), rob_user_id, 'Manufacturing Plant', 'Industrial 75kW solar array', 'planning', NOW() - INTERVAL '2 days', NOW()),
    (gen_random_uuid(), rob_user_id, 'Suburban Mall', 'Large commercial 100kW system', 'in_progress', NOW() - INTERVAL '1 day', NOW()),
    (gen_random_uuid(), rob_user_id, 'Davis Farmhouse', 'Rural residential 11kW system', 'completed', NOW(), NOW()),
    (gen_random_uuid(), rob_user_id, 'City Library', 'Municipal 28kW solar installation', 'completed', NOW(), NOW());
    
    -- Insert corresponding solar calculations
    INSERT INTO public.solar_calculations (
        id,
        user_id,
        address,
        system_size_kw,
        annual_production_kwh,
        annual_savings,
        total_cost,
        payback_period_years,
        co2_reduction_lbs,
        created_at
    ) VALUES 
    (gen_random_uuid(), rob_user_id, '123 Oak Street, Sacramento, CA', 8.5, 12750, 2890, 25500, 8.8, 15300, NOW() - INTERVAL '30 days'),
    (gen_random_uuid(), rob_user_id, '456 Pine Avenue, Davis, CA', 12.0, 18000, 4080, 36000, 8.8, 21600, NOW() - INTERVAL '25 days'),
    (gen_random_uuid(), rob_user_id, '789 Business Blvd, Folsom, CA', 25.0, 37500, 8500, 75000, 8.8, 45000, NOW() - INTERVAL '20 days'),
    (gen_random_uuid(), rob_user_id, '321 Duplex Drive, Roseville, CA', 10.0, 15000, 3400, 30000, 8.8, 18000, NOW() - INTERVAL '18 days'),
    (gen_random_uuid(), rob_user_id, '654 Warehouse Way, Elk Grove, CA', 50.0, 75000, 17000, 150000, 8.8, 90000, NOW() - INTERVAL '15 days'),
    (gen_random_uuid(), rob_user_id, '987 Cottage Lane, Placerville, CA', 6.0, 9000, 2040, 18000, 8.8, 10800, NOW() - INTERVAL '12 days'),
    (gen_random_uuid(), rob_user_id, '147 Retail Row, Citrus Heights, CA', 18.0, 27000, 6120, 54000, 8.8, 32400, NOW() - INTERVAL '10 days'),
    (gen_random_uuid(), rob_user_id, '258 Estate Drive, El Dorado Hills, CA', 15.0, 22500, 5100, 45000, 8.8, 27000, NOW() - INTERVAL '8 days'),
    (gen_random_uuid(), rob_user_id, '369 Tech Park, Rancho Cordova, CA', 22.0, 33000, 7480, 66000, 8.8, 39600, NOW() - INTERVAL '6 days'),
    (gen_random_uuid(), rob_user_id, '741 Community Center Dr, Fair Oaks, CA', 35.0, 52500, 11900, 105000, 8.8, 63000, NOW() - INTERVAL '4 days'),
    (gen_random_uuid(), rob_user_id, '852 Family Circle, Carmichael, CA', 9.5, 14250, 3230, 28500, 8.8, 17100, NOW() - INTERVAL '3 days'),
    (gen_random_uuid(), rob_user_id, '963 Industrial Blvd, West Sacramento, CA', 75.0, 112500, 25500, 225000, 8.8, 135000, NOW() - INTERVAL '2 days'),
    (gen_random_uuid(), rob_user_id, '159 Mall Drive, Arden-Arcade, CA', 100.0, 150000, 34000, 300000, 8.8, 180000, NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), rob_user_id, '357 Farm Road, Galt, CA', 11.0, 16500, 3740, 33000, 8.8, 19800, NOW()),
    (gen_random_uuid(), rob_user_id, '468 Library Lane, Woodland, CA', 28.0, 42000, 9520, 84000, 8.8, 50400, NOW());
    
    RAISE NOTICE 'Successfully created 15 sample projects and calculations for Rob';
END $$;

-- Verify the projects were created
SELECT 
    COUNT(*) as project_count,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
    COUNT(CASE WHEN status = 'planning' THEN 1 END) as planning
FROM public.user_projects 
WHERE user_id = (SELECT id FROM public.users WHERE email = 'rob@mysolarai.com');

-- Show total savings
SELECT 
    COUNT(*) as calculation_count,
    SUM(annual_savings) as total_annual_savings,
    SUM(system_size_kw) as total_system_capacity,
    AVG(total_cost) as avg_project_cost
FROM public.solar_calculations 
WHERE user_id = (SELECT id FROM public.users WHERE email = 'rob@mysolarai.com');
