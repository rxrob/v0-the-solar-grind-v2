-- Recreate Rob's Account with Full Pro Configuration
-- This script completely recreates Rob's account from scratch

-- Step 1: Complete cleanup of any existing Rob accounts
DELETE FROM public.solar_calculations WHERE user_id IN (
    SELECT id FROM public.users WHERE email ILIKE '%rob%'
);

DELETE FROM public.user_projects WHERE user_id IN (
    SELECT id FROM public.users WHERE email ILIKE '%rob%'
);

DELETE FROM public.users WHERE email ILIKE '%rob%';

-- Also clean up from auth.users if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        DELETE FROM auth.users WHERE email ILIKE '%rob%';
    END IF;
END $$;

-- Step 2: Create Rob's account with full Pro privileges
INSERT INTO public.users (
    id,
    email,
    full_name,
    subscription_tier,
    subscription_status,
    stripe_customer_id,
    stripe_subscription_id,
    trial_ends_at,
    pro_trial_used,
    calculations_used,
    monthly_calculation_limit,
    created_at,
    updated_at
) VALUES (
    uuid_generate_v4(),
    'rob@thesolargrind.com',
    'Rob - Solar Grind Owner',
    'pro',
    'active',
    'cus_rob_solar_grind_owner_' || extract(epoch from now())::text,
    'sub_rob_unlimited_pro_' || extract(epoch from now())::text,
    NULL, -- No trial expiration for owner
    true, -- Trial already "used" (permanent Pro)
    0, -- Reset calculation count
    999999, -- Unlimited calculations
    NOW(),
    NOW()
);

-- Step 3: Get Rob's user ID for creating projects
DO $$
DECLARE
    rob_user_id UUID;
BEGIN
    SELECT id INTO rob_user_id FROM public.users WHERE email = 'rob@thesolargrind.com';
    
    -- Create demo projects for Rob
    INSERT INTO public.user_projects (
        id,
        user_id,
        project_name,
        address,
        system_size_kw,
        annual_production_kwh,
        estimated_savings,
        project_data,
        created_at,
        updated_at
    ) VALUES 
    (
        uuid_generate_v4(),
        rob_user_id,
        'Solar Grind HQ - Main Office',
        '123 Solar Innovation Drive, Austin, TX 78701',
        50.0,
        75000,
        18000.00,
        '{"roof_type": "metal", "orientation": "south", "tilt": 30, "shading": "none"}',
        NOW(),
        NOW()
    ),
    (
        uuid_generate_v4(),
        rob_user_id,
        'Residential Demo - Premium Install',
        '456 Green Energy Boulevard, Austin, TX 78702',
        15.6,
        22500,
        5400.00,
        '{"roof_type": "asphalt_shingle", "orientation": "southwest", "tilt": 25, "shading": "minimal"}',
        NOW(),
        NOW()
    ),
    (
        uuid_generate_v4(),
        rob_user_id,
        'Commercial Client - Warehouse',
        '789 Industrial Solar Way, Austin, TX 78703',
        100.0,
        150000,
        36000.00,
        '{"roof_type": "metal", "orientation": "south", "tilt": 10, "shading": "none"}',
        NOW(),
        NOW()
    );
    
    -- Create some demo calculations
    INSERT INTO public.solar_calculations (
        id,
        user_id,
        project_id,
        calculation_type,
        input_data,
        result_data,
        created_at
    ) VALUES 
    (
        uuid_generate_v4(),
        rob_user_id,
        (SELECT id FROM public.user_projects WHERE user_id = rob_user_id AND project_name LIKE '%HQ%' LIMIT 1),
        'pro',
        '{"monthly_usage": 6250, "electricity_rate": 0.12, "roof_area": 5000, "efficiency": 0.85}',
        '{"system_size": 50.0, "annual_production": 75000, "savings": 18000, "payback_period": 7.2}',
        NOW()
    );
    
    RAISE NOTICE 'Rob account recreated successfully with ID: %', rob_user_id;
END $$;

-- Step 4: Verify the recreation was successful
SELECT 
    'Account Recreation Verification' as section,
    u.id,
    u.email,
    u.full_name,
    u.subscription_tier,
    u.subscription_status,
    u.monthly_calculation_limit,
    u.calculations_used,
    COUNT(p.id) as project_count,
    COUNT(c.id) as calculation_count
FROM public.users u
LEFT JOIN public.user_projects p ON u.id = p.user_id
LEFT JOIN public.solar_calculations c ON u.id = c.user_id
WHERE u.email = 'rob@thesolargrind.com'
GROUP BY u.id, u.email, u.full_name, u.subscription_tier, u.subscription_status, u.monthly_calculation_limit, u.calculations_used;

-- Step 5: Show all projects created for Rob
SELECT 
    'Rob Projects List' as section,
    project_name,
    address,
    system_size_kw,
    estimated_savings,
    created_at
FROM public.user_projects 
WHERE user_id = (SELECT id FROM public.users WHERE email = 'rob@thesolargrind.com')
ORDER BY created_at;

-- Step 6: Final status check
SELECT 
    'Final Status Check' as section,
    'Rob account successfully recreated with Pro access' as message,
    NOW() as completed_at;
