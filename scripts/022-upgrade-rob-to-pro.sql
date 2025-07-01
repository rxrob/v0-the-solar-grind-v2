-- Upgrade Rob to Pro Account
-- This script ensures Rob has unlimited Pro access to the Solar Grind platform

-- First, check if Rob already exists
DO $$
DECLARE
    rob_user_id UUID;
    rob_exists BOOLEAN := FALSE;
BEGIN
    -- Check if Rob exists
    SELECT id INTO rob_user_id 
    FROM public.users 
    WHERE email = 'rob@mysolarai.com';
    
    IF FOUND THEN
        rob_exists := TRUE;
        RAISE NOTICE 'Rob account found with ID: %', rob_user_id;
        
        -- Update existing Rob account to Pro
        UPDATE public.users 
        SET 
            subscription_tier = 'pro',
            subscription_status = 'active',
            monthly_calculations_limit = -1, -- Unlimited
            pro_calculator_trials_used = 0,
            pro_calculator_trial_limit = 999999,
            billing_period_start = CURRENT_DATE,
            last_reset_date = CURRENT_DATE,
            updated_at = NOW()
        WHERE id = rob_user_id;
        
        RAISE NOTICE 'Rob upgraded to Pro with unlimited access';
        
    ELSE
        -- Create new Rob Pro account
        INSERT INTO public.users (
            id,
            email,
            full_name,
            subscription_tier,
            subscription_status,
            monthly_calculations_used,
            monthly_calculations_limit,
            pro_calculator_trials_used,
            pro_calculator_trial_limit,
            billing_period_start,
            last_reset_date,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            'rob@mysolarai.com',
            'Rob - Solar Grind Owner',
            'pro',
            'active',
            0,
            -1, -- Unlimited calculations
            0,
            999999, -- Unlimited pro trials
            CURRENT_DATE,
            CURRENT_DATE,
            NOW(),
            NOW()
        ) RETURNING id INTO rob_user_id;
        
        RAISE NOTICE 'New Rob Pro account created with ID: %', rob_user_id;
    END IF;
    
    -- Create some demo projects for Rob if they don't exist
    IF NOT EXISTS (SELECT 1 FROM public.user_projects WHERE user_id = rob_user_id) THEN
        INSERT INTO public.user_projects (
            user_id,
            customer_name,
            customer_email,
            property_address,
            monthly_kwh,
            current_electric_bill,
            system_size_kw,
            panels_needed,
            annual_production_kwh,
            system_cost,
            net_cost,
            annual_savings,
            monthly_savings,
            roi_years
        ) VALUES 
        (
            rob_user_id,
            'Solar Grind Demo Project',
            'demo@thesolargrind.com',
            '123 Solar Street, Austin, TX 78701',
            2000.00,
            300.00,
            15.0,
            38,
            22500,
            45000,
            31500,
            3600,
            300,
            8.8
        ),
        (
            rob_user_id,
            'Rob Personal Residence',
            'rob@mysolarai.com',
            '456 Green Energy Ave, Austin, TX 78702',
            1500.00,
            225.00,
            12.0,
            30,
            18000,
            36000,
            25200,
            2700,
            225,
            9.3
        );
        
        RAISE NOTICE 'Demo projects created for Rob';
    END IF;
    
END $$;

-- Verify Rob's Pro status
SELECT 
    'Rob Pro Account Verification' as status,
    u.id,
    u.email,
    u.full_name,
    u.subscription_tier,
    u.subscription_status,
    u.monthly_calculations_limit,
    u.pro_calculator_trial_limit,
    COUNT(p.id) as total_projects,
    u.created_at,
    u.updated_at
FROM public.users u
LEFT JOIN public.user_projects p ON u.id = p.user_id
WHERE u.email = 'rob@mysolarai.com'
GROUP BY u.id, u.email, u.full_name, u.subscription_tier, u.subscription_status, 
         u.monthly_calculations_limit, u.pro_calculator_trial_limit, u.created_at, u.updated_at;

-- Show Rob's projects
SELECT 
    'Rob Projects' as section,
    customer_name,
    property_address,
    system_size_kw,
    annual_savings,
    created_at
FROM public.user_projects 
WHERE user_id = (SELECT id FROM public.users WHERE email = 'rob@mysolarai.com')
ORDER BY created_at;

-- Show all Pro users for comparison
SELECT 
    'All Pro Users' as section,
    email,
    full_name,
    subscription_tier,
    monthly_calculations_limit,
    created_at
FROM public.users 
WHERE subscription_tier = 'pro'
ORDER BY created_at DESC;

-- Final success message
SELECT 
    'Success!' as result,
    'Rob now has unlimited Pro access to the Solar Grind platform' as message,
    NOW() as completed_at;
