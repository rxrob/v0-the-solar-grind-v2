-- Verify Authentication Flow and User Creation Process
-- This script checks the complete authentication setup

-- Check if auth schema and tables exist
SELECT 
    'Auth Schema Check' as section,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') 
        THEN 'Auth schema exists'
        ELSE 'Auth schema missing - this might be a regular PostgreSQL setup'
    END as auth_schema_status;

-- Check auth.users table structure if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        RAISE NOTICE 'Auth users table exists - checking structure...';
    ELSE
        RAISE NOTICE 'Auth users table does not exist - this is likely a standard PostgreSQL setup without Supabase auth';
    END IF;
END $$;

-- Check public.users table structure and constraints
SELECT 
    'Public Users Table Structure' as section,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'users'
ORDER BY ordinal_position;

-- Check for the handle_new_user function
SELECT 
    'Handle New User Function' as section,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_schema = 'public' 
                AND routine_name = 'handle_new_user'
        ) 
        THEN 'handle_new_user function exists'
        ELSE 'handle_new_user function missing'
    END as function_status;

-- Check for triggers on auth.users (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        -- Check for trigger
        IF EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE event_object_schema = 'auth' 
                AND event_object_table = 'users' 
                AND trigger_name = 'on_auth_user_created'
        ) THEN
            RAISE NOTICE 'Auth trigger exists';
        ELSE
            RAISE NOTICE 'Auth trigger missing';
        END IF;
    ELSE
        RAISE NOTICE 'Skipping auth trigger check - auth.users table does not exist';
    END IF;
END $$;

-- Check RLS policies on public.users
SELECT 
    'RLS Policies Check' as section,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'users'
ORDER BY policyname;

-- Check if RLS is enabled on public.users
SELECT 
    'RLS Status' as section,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename = 'users';

-- Test direct user creation (this should work regardless of auth setup)
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Try to create a test user directly
    INSERT INTO public.users (
        id,
        email,
        full_name,
        subscription_tier,
        subscription_status,
        monthly_calculation_limit
    ) VALUES (
        uuid_generate_v4(),
        'test_auth_flow@example.com',
        'Test Auth Flow User',
        'free',
        'active',
        5
    ) RETURNING id INTO test_user_id;
    
    RAISE NOTICE 'Test user created successfully with ID: %', test_user_id;
    
    -- Clean up test user
    DELETE FROM public.users WHERE id = test_user_id;
    RAISE NOTICE 'Test user cleaned up successfully';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating test user: %', SQLERRM;
END $$;

-- Check permissions for different roles
SELECT 
    'Table Permissions' as section,
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'users'
    AND grantee IN ('anon', 'authenticated', 'service_role', 'postgres')
ORDER BY grantee, privilege_type;

-- Show current database configuration
SELECT 
    'Database Configuration' as section,
    current_database() as database_name,
    current_user as current_user,
    session_user as session_user,
    version() as postgres_version;

-- Check for any existing users to understand the current state
SELECT 
    'Existing Users Summary' as section,
    COUNT(*) as total_users,
    COUNT(CASE WHEN subscription_tier = 'pro' THEN 1 END) as pro_users,
    COUNT(CASE WHEN subscription_tier = 'free' THEN 1 END) as free_users,
    MIN(created_at) as oldest_user,
    MAX(created_at) as newest_user
FROM public.users;

-- List all existing users
SELECT 
    'All Existing Users' as section,
    email,
    full_name,
    subscription_tier,
    subscription_status,
    created_at
FROM public.users 
ORDER BY created_at DESC;

-- Final recommendation
SELECT 
    'Authentication Setup Recommendation' as section,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') 
        THEN 'This appears to be a Supabase setup. Rob can be created through Supabase auth or directly in public.users.'
        ELSE 'This appears to be a standard PostgreSQL setup. Rob should be created directly in public.users table.'
    END as recommendation;
