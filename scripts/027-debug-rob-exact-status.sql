-- Debug Rob's Exact Account Status
-- This script provides comprehensive debugging information about Rob's account

-- Check if Rob exists in public.users
SELECT 
    'Rob in public.users' as check_type,
    CASE 
        WHEN COUNT(*) > 0 THEN 'FOUND'
        ELSE 'NOT FOUND'
    END as status,
    COUNT(*) as count
FROM public.users 
WHERE email ILIKE '%rob%';

-- Show exact Rob records if they exist
SELECT 
    'Rob Records Details' as section,
    id,
    email,
    full_name,
    subscription_tier,
    subscription_status,
    monthly_calculation_limit,
    calculations_used,
    pro_trial_used,
    stripe_customer_id,
    created_at,
    updated_at
FROM public.users 
WHERE email ILIKE '%rob%'
ORDER BY created_at DESC;

-- Check if Rob exists in auth.users (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        RAISE NOTICE 'Checking auth.users table...';
        
        -- Check for Rob in auth.users
        PERFORM 1 FROM auth.users WHERE email ILIKE '%rob%';
        
        IF FOUND THEN
            RAISE NOTICE 'Rob found in auth.users';
        ELSE
            RAISE NOTICE 'Rob NOT found in auth.users';
        END IF;
    ELSE
        RAISE NOTICE 'auth.users table does not exist';
    END IF;
END $$;

-- Check all users with similar emails
SELECT 
    'Similar Email Check' as section,
    email,
    full_name,
    subscription_tier,
    created_at
FROM public.users 
WHERE email ILIKE '%rob%' 
   OR email ILIKE '%solar%' 
   OR email ILIKE '%grind%'
ORDER BY created_at DESC;

-- Check for any Pro users
SELECT 
    'All Pro Users' as section,
    email,
    full_name,
    subscription_tier,
    subscription_status,
    monthly_calculation_limit
FROM public.users 
WHERE subscription_tier = 'pro'
ORDER BY created_at DESC;

-- Check table structure
SELECT 
    'Users Table Structure' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'users'
ORDER BY ordinal_position;

-- Check for any constraints or issues
SELECT 
    'Table Constraints' as section,
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
    AND table_name = 'users';

-- Check RLS policies that might affect Rob
SELECT 
    'RLS Policies on Users' as section,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'users';

-- Check if there are any triggers that might interfere
SELECT 
    'Triggers on Users Table' as section,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'public' 
    AND event_object_table = 'users';

-- Show total user count and breakdown
SELECT 
    'User Statistics' as section,
    COUNT(*) as total_users,
    COUNT(CASE WHEN subscription_tier = 'pro' THEN 1 END) as pro_users,
    COUNT(CASE WHEN subscription_tier = 'free' THEN 1 END) as free_users,
    COUNT(CASE WHEN email ILIKE '%rob%' THEN 1 END) as rob_accounts
FROM public.users;

-- Check for any recent activity
SELECT 
    'Recent User Activity' as section,
    email,
    subscription_tier,
    created_at,
    updated_at
FROM public.users 
ORDER BY updated_at DESC 
LIMIT 10;

-- Final comprehensive check
SELECT 
    'Comprehensive Rob Check' as section,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.users WHERE email = 'rob@thesolargrind.com') THEN 'rob@thesolargrind.com EXISTS'
        WHEN EXISTS (SELECT 1 FROM public.users WHERE email = 'rob@mysolarai.com') THEN 'rob@mysolarai.com EXISTS'
        WHEN EXISTS (SELECT 1 FROM public.users WHERE email ILIKE '%rob%') THEN 'Some Rob account EXISTS'
        ELSE 'NO Rob account found'
    END as rob_status,
    NOW() as checked_at;
