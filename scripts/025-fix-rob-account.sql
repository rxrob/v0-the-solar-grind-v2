-- Smart Fix for Rob's Account
-- This script intelligently handles Rob's account creation based on current state

-- First, let's check what exists and fix accordingly
DO $$
DECLARE
    rob_exists BOOLEAN := FALSE;
    rob_user_id UUID;
    rob_is_pro BOOLEAN := FALSE;
BEGIN
    -- Check if Rob already exists
    SELECT EXISTS(SELECT 1 FROM public.users WHERE email ILIKE '%rob%') INTO rob_exists;
    
    IF rob_exists THEN
        -- Rob exists, let's check his status
        SELECT id, (subscription_tier = 'pro') 
        INTO rob_user_id, rob_is_pro
        FROM public.users 
        WHERE email ILIKE '%rob%' 
        LIMIT 1;
        
        RAISE NOTICE 'Rob account found with ID: %. Pro status: %', rob_user_id, rob_is_pro;
        
        IF NOT rob_is_pro THEN
            -- Upgrade Rob to Pro
            UPDATE public.users 
            SET 
                subscription_tier = 'pro',
                subscription_status = 'active',
                monthly_calculation_limit = 999999,
                pro_trial_used = true,
                calculations_used = 0,
                stripe_customer_id = 'cus_rob_solar_grind_' || extract(epoch from now())::text,
                stripe_subscription_id = 'sub_rob_pro_' || extract(epoch from now())::text,
                updated_at = NOW()
            WHERE id = rob_user_id;
            
            RAISE NOTICE 'Rob upgraded to Pro successfully';
        ELSE
            -- Rob is already Pro, just ensure unlimited access
            UPDATE public.users 
            SET 
                monthly_calculation_limit = 999999,
                calculations_used = 0,
                subscription_status = 'active',
                updated_at = NOW()
            WHERE id = rob_user_id;
            
            RAISE NOTICE 'Rob Pro account refreshed with unlimited access';
        END IF;
        
    ELSE
        -- Rob doesn't exist, create him
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
            'cus_rob_solar_grind_owner',
            'sub_rob_unlimited_pro',
            NULL, -- No trial expiration
            true, -- Trial already used (permanent Pro)
            0, -- Reset calculations
            999999, -- Unlimited
            NOW(),
            NOW()
        ) RETURNING id INTO rob_user_id;
        
        RAISE NOTICE 'Rob Pro account created successfully with ID: %', rob_user_id;
        
        -- Create some demo projects for the new account
        INSERT INTO public.user_projects (
            id,
            user_id,
            project_name,
            address,
            system_size_kw,
            annual_production_kwh,
            estimated_savings,
            created_at,
            updated_at
        ) VALUES 
        (
            uuid_generate_v4(),
            rob_user_id,
            'Solar Grind HQ',
            '123 Solar Innovation Drive, Austin, TX 78701',
            25.0,
            37500,
            9000.00,
            NOW(),
            NOW()
        ),
        (
            uuid_generate_v4(),
            rob_user_id,
            'Demo Residential Project',
            '456 Green Energy Street, Austin, TX 78702',
            12.0,
            18000,
            4320.00,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Demo projects created for Rob';
    END IF;
    
    -- Final verification
    SELECT 
        u.id,
        u.email,
        u.subscription_tier,
        u.monthly_calculation_limit,
        COUNT(p.id) as project_count
    FROM public.users u
    LEFT JOIN public.user_projects p ON u.id = p.user_id
    WHERE u.email ILIKE '%rob%'
    GROUP BY u.id, u.email, u.subscription_tier, u.monthly_calculation_limit
    INTO rob_user_id;
    
    RAISE NOTICE 'Rob account verification complete';
    
END $$;

-- Show final status
SELECT 
    'Rob Account Final Status' as section,
    u.id,
    u.email,
    u.full_name,
    u.subscription_tier,
    u.subscription_status,
    u.monthly_calculation_limit,
    u.calculations_used,
    u.pro_trial_used,
    COUNT(p.id) as total_projects,
    u.created_at,
    u.updated_at
FROM public.users u
LEFT JOIN public.user_projects p ON u.id = p.user_id
WHERE u.email ILIKE '%rob%'
GROUP BY u.id, u.email, u.full_name, u.subscription_tier, u.subscription_status, 
         u.monthly_calculation_limit, u.calculations_used, u.pro_trial_used, 
         u.created_at, u.updated_at;

-- Show Rob's projects
SELECT 
    'Rob Projects' as section,
    project_name,
    address,
    system_size_kw,
    estimated_savings,
    created_at
FROM public.user_projects 
WHERE user_id = (SELECT id FROM public.users WHERE email ILIKE '%rob%' LIMIT 1)
ORDER BY created_at;

-- Success message
SELECT 
    'Success' as status,
    'Rob account has been successfully configured with Pro access!' as message,
    NOW() as completed_at;
