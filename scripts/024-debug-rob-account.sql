-- Comprehensive Debug Script for Rob's Account
-- This script provides detailed debugging information

-- Check if the users table exists and has the expected structure
SELECT 
    'Table Structure Check' as section,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'users'
ORDER BY ordinal_position;

-- Check if there are any users at all
SELECT 
    'Total Users Check' as section,
    COUNT(*) as total_users,
    COUNT(CASE WHEN subscription_tier = 'pro' THEN 1 END) as pro_users,
    COUNT(CASE WHEN subscription_tier = 'free' THEN 1 END) as free_users
FROM public.users;

-- Look for any Rob-related accounts with different variations
SELECT 
    'Rob Account Variations' as section,
    email,
    full_name,
    subscription_tier,
    subscription_status,
    created_at
FROM public.users 
WHERE email ILIKE '%rob%' 
   OR full_name ILIKE '%rob%'
   OR email ILIKE '%solar%'
   OR email ILIKE '%grind%'
ORDER BY created_at DESC;

-- Check for any accounts created recently
SELECT 
    'Recent Accounts' as section,
    email,
    full_name,
    subscription_tier,
    created_at
FROM public.users 
ORDER BY created_at DESC 
LIMIT 10;

-- Check if there are any constraints that might prevent insertion
SELECT 
    'Table Constraints' as section,
    constraint_name,
    constraint_type,
    table_name,
    column_name
FROM information_schema.key_column_usage kcu
JOIN information_schema.table_constraints tc 
    ON kcu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public' 
    AND tc.table_name = 'users';

-- Check for unique constraints specifically
SELECT 
    'Unique Constraints' as section,
    constraint_name,
    column_name
FROM information_schema.constraint_column_usage 
WHERE table_schema = 'public' 
    AND table_name = 'users'
    AND constraint_name LIKE '%unique%' OR constraint_name LIKE '%pkey%';

-- Test if we can insert a simple test record
DO $$
DECLARE
    test_id UUID;
BEGIN
    -- Try to insert a test record
    INSERT INTO public.users (
        email,
        full_name,
        subscription_tier
    ) VALUES (
        'test_debug_' || extract(epoch from now()) || '@example.com',
        'Debug Test User',
        'free'
    ) RETURNING id INTO test_id;
    
    RAISE NOTICE 'Test insert successful. ID: %', test_id;
    
    -- Clean up the test record
    DELETE FROM public.users WHERE id = test_id;
    RAISE NOTICE 'Test record cleaned up';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Test insert failed: %', SQLERRM;
END $$;

-- Check RLS policies that might be blocking
SELECT 
    'RLS Policies' as section,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'users';

-- Check if RLS is enabled
SELECT 
    'RLS Status' as section,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename = 'users';

-- Check current user and permissions
SELECT 
    'Current User Info' as section,
    current_user as current_user,
    session_user as session_user,
    current_database() as database;

-- Check table permissions
SELECT 
    'Table Permissions' as section,
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'users'
ORDER BY grantee, privilege_type;

-- Show all users for context
SELECT 
    'All Users List' as section,
    id,
    email,
    full_name,
    subscription_tier,
    subscription_status,
    monthly_calculation_limit,
    created_at
FROM public.users 
ORDER BY created_at DESC;

-- Check if uuid-ossp extension is available
SELECT 
    'UUID Extension Check' as section,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') 
        THEN 'uuid-ossp extension is installed'
        ELSE 'uuid-ossp extension is NOT installed'
    END as uuid_status;

-- Final diagnostic summary
SELECT 
    'Diagnostic Summary' as section,
    'Debug information collected' as status,
    NOW() as timestamp;
