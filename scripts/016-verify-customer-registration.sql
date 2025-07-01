-- Verify Customer Registration System
-- This script checks that all customer registration components are working properly

-- Check if users table exists and has proper structure
SELECT 'Users Table Structure:' as check_type;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check current user records
SELECT 'Current User Records:' as check_type;
SELECT 
    id,
    email,
    full_name,
    subscription_tier,
    subscription_status,
    created_at,
    updated_at
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- Check user projects table structure
SELECT 'User Projects Table Structure:' as check_type;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_projects' 
ORDER BY ordinal_position;

-- Check solar calculations table structure  
SELECT 'Solar Calculations Table Structure:' as check_type;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'solar_calculations' 
ORDER BY ordinal_position;

-- Check RLS policies are active
SELECT 'Row Level Security Status:' as check_type;
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    forcerowsecurity
FROM pg_tables 
WHERE tablename IN ('users', 'user_projects', 'solar_calculations');

-- Check existing policies
SELECT 'Active RLS Policies:' as check_type;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('users', 'user_projects', 'solar_calculations')
ORDER BY tablename, policyname;

-- Test data counts
SELECT 'Data Summary:' as check_type;
SELECT 
    'users' as table_name,
    COUNT(*) as record_count
FROM users
UNION ALL
SELECT 
    'user_projects' as table_name,
    COUNT(*) as record_count  
FROM user_projects
UNION ALL
SELECT 
    'solar_calculations' as table_name,
    COUNT(*) as record_count
FROM solar_calculations;

-- Check trial tracking columns
SELECT 'Trial Tracking Columns:' as check_type;
SELECT 
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name LIKE '%trial%'
ORDER BY column_name;

SELECT 'Customer Registration System Verification Complete!' as status;
