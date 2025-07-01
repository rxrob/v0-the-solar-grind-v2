-- Verify Database Connection and Structure
-- This script checks if the database is properly connected and has the expected structure

-- Check if we can connect to the database
SELECT 
    'Database connection successful!' as status,
    current_database() as database_name,
    current_user as connected_user,
    version() as postgres_version,
    NOW() as connection_time;

-- Check if required extensions are installed
SELECT 
    'Extensions Status' as section,
    extname as extension_name,
    extversion as version
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto')
ORDER BY extname;

-- Check if required tables exist
SELECT 
    'Tables Status' as section,
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'user_projects', 'solar_calculations')
ORDER BY tablename;

-- Check if auth schema exists (for Supabase)
SELECT 
    'Auth Schema Status' as section,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') 
        THEN 'Auth schema exists'
        ELSE 'Auth schema missing'
    END as auth_status;

-- Check if auth.users table exists
SELECT 
    'Auth Users Table Status' as section,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') 
        THEN 'Auth users table exists'
        ELSE 'Auth users table missing'
    END as auth_users_status;

-- Check RLS policies
SELECT 
    'RLS Policies Status' as section,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check current user count
SELECT 
    'User Count Status' as section,
    COUNT(*) as total_users,
    COUNT(CASE WHEN subscription_tier = 'pro' THEN 1 END) as pro_users,
    COUNT(CASE WHEN subscription_tier = 'free' THEN 1 END) as free_users
FROM public.users;

-- Check for Rob's account specifically
SELECT 
    'Rob Account Status' as section,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.users WHERE email LIKE '%rob%') 
        THEN 'Rob account found'
        ELSE 'Rob account not found'
    END as rob_status;

-- List all users for verification
SELECT 
    'All Users List' as section,
    email,
    full_name,
    subscription_tier,
    subscription_status,
    monthly_calculation_limit,
    created_at
FROM public.users 
ORDER BY created_at DESC;

-- Check database permissions
SELECT 
    'Database Permissions' as section,
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'user_projects', 'solar_calculations')
    AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY table_name, grantee, privilege_type;
