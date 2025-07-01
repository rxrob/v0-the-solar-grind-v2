-- Verify Rob's Pro Status and Account Details
-- This script checks Rob's current account status and provides detailed information

-- Check if Rob's account exists and show all details
SELECT 
    'Rob Account Status' as section,
    CASE 
        WHEN COUNT(*) = 0 THEN 'NOT FOUND'
        WHEN COUNT(*) = 1 THEN 'FOUND'
        ELSE 'MULTIPLE ACCOUNTS FOUND'
    END as account_status,
    COUNT(*) as account_count
FROM public.users 
WHERE email = 'rob@mysolarai.com';

-- Show Rob's detailed account information if it exists
SELECT 
    'Rob Account Details' as section,
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
FROM public.users 
WHERE email = 'rob@mysolarai.com';

-- Check Rob's projects
SELECT 
    'Rob Projects Count' as section,
    COUNT(*) as total_projects
FROM public.user_projects up
JOIN public.users u ON up.user_id = u.id
WHERE u.email = 'rob@mysolarai.com';

-- Show Rob's projects details
SELECT 
    'Rob Projects Details' as section,
    up.project_name,
    up.address,
    up.system_size_kw,
    up.annual_production_kwh,
    up.estimated_savings,
    up.created_at
FROM public.user_projects up
JOIN public.users u ON up.user_id = u.id
WHERE u.email = 'rob@mysolarai.com'
ORDER BY up.created_at DESC;

-- Check Rob's calculations
SELECT 
    'Rob Calculations Count' as section,
    COUNT(*) as total_calculations,
    COUNT(CASE WHEN calculation_type = 'basic' THEN 1 END) as basic_calculations,
    COUNT(CASE WHEN calculation_type = 'advanced' THEN 1 END) as advanced_calculations,
    COUNT(CASE WHEN calculation_type = 'pro' THEN 1 END) as pro_calculations
FROM public.solar_calculations sc
JOIN public.users u ON sc.user_id = u.id
WHERE u.email = 'rob@mysolarai.com';

-- Show recent calculations
SELECT 
    'Rob Recent Calculations' as section,
    sc.calculation_type,
    sc.created_at,
    sc.input_data::text as input_summary,
    sc.result_data::text as result_summary
FROM public.solar_calculations sc
JOIN public.users u ON sc.user_id = u.id
WHERE u.email = 'rob@mysolarai.com'
ORDER BY sc.created_at DESC
LIMIT 5;

-- Compare Rob with other Pro users
SELECT 
    'Pro Users Comparison' as section,
    email,
    full_name,
    subscription_tier,
    monthly_calculation_limit,
    calculations_used,
    created_at
FROM public.users 
WHERE subscription_tier = 'pro'
ORDER BY created_at DESC;

-- Check if Rob has unlimited access
SELECT 
    'Rob Access Level Check' as section,
    email,
    CASE 
        WHEN monthly_calculation_limit = -1 THEN 'UNLIMITED'
        WHEN monthly_calculation_limit >= 999999 THEN 'EFFECTIVELY UNLIMITED'
        WHEN monthly_calculation_limit > 100 THEN 'HIGH LIMIT'
        ELSE 'LIMITED'
    END as access_level,
    monthly_calculation_limit,
    calculations_used,
    CASE 
        WHEN monthly_calculation_limit = -1 THEN 'Perfect'
        WHEN calculations_used >= monthly_calculation_limit THEN 'LIMIT REACHED'
        ELSE 'Within Limits'
    END as usage_status
FROM public.users 
WHERE email = 'rob@mysolarai.com';

-- Check subscription status
SELECT 
    'Rob Subscription Status' as section,
    email,
    subscription_tier,
    subscription_status,
    CASE 
        WHEN subscription_tier = 'pro' AND subscription_status = 'active' THEN 'ACTIVE PRO'
        WHEN subscription_tier = 'pro' AND subscription_status != 'active' THEN 'PRO BUT INACTIVE'
        WHEN subscription_tier != 'pro' THEN 'NOT PRO'
        ELSE 'UNKNOWN STATUS'
    END as overall_status,
    stripe_customer_id IS NOT NULL as has_stripe_customer,
    stripe_subscription_id IS NOT NULL as has_stripe_subscription
FROM public.users 
WHERE email = 'rob@mysolarai.com';

-- Final verification summary
SELECT 
    'Final Verification' as section,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'rob@mysolarai.com') 
        THEN 'ISSUE: Rob account does not exist'
        
        WHEN EXISTS (
            SELECT 1 FROM public.users 
            WHERE email = 'rob@mysolarai.com' 
                AND subscription_tier = 'pro' 
                AND subscription_status = 'active' 
                AND monthly_calculation_limit >= 999999
        ) 
        THEN 'SUCCESS: Rob has unlimited Pro access'
        
        WHEN EXISTS (
            SELECT 1 FROM public.users 
            WHERE email = 'rob@mysolarai.com' 
                AND subscription_tier = 'pro'
        ) 
        THEN 'PARTIAL: Rob is Pro but may have limitations'
        
        ELSE 'ISSUE: Rob exists but is not Pro'
    END as verification_result,
    NOW() as checked_at;

-- Show all users for context
SELECT 
    'All Users Summary' as section,
    COUNT(*) as total_users,
    COUNT(CASE WHEN subscription_tier = 'pro' THEN 1 END) as pro_users,
    COUNT(CASE WHEN subscription_tier = 'free' THEN 1 END) as free_users
FROM public.users;
