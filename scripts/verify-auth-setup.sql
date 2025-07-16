-- Verification script to check authentication setup
-- Run this after setting up RLS policies

-- 1. Check if users table exists and has correct structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Verify RLS is enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN 'RLS ENABLED ✅'
    ELSE 'RLS DISABLED ❌'
  END as rls_status
FROM pg_tables 
WHERE tablename = 'users';

-- 3. List all policies on users table
SELECT 
  policyname,
  permissive,
  roles,
  cmd as command,
  CASE 
    WHEN cmd = 'SELECT' THEN 'READ'
    WHEN cmd = 'INSERT' THEN 'CREATE'
    WHEN cmd = 'UPDATE' THEN 'UPDATE'
    WHEN cmd = 'DELETE' THEN 'DELETE'
    WHEN cmd = 'ALL' THEN 'ALL OPERATIONS'
    ELSE cmd
  END as operation_type
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- 4. Check if auth schema exists and is accessible
SELECT 
  schema_name,
  CASE 
    WHEN schema_name = 'auth' THEN 'AUTH SCHEMA EXISTS ✅'
    ELSE schema_name
  END as status
FROM information_schema.schemata 
WHERE schema_name IN ('auth', 'public');

-- 5. Test basic auth functions (these should not error)
SELECT 
  'auth.uid() function' as test_name,
  CASE 
    WHEN auth.uid() IS NULL THEN 'No current user (expected in SQL editor)'
    ELSE 'User ID: ' || auth.uid()::text
  END as result;

SELECT 
  'auth.role() function' as test_name,
  CASE 
    WHEN auth.role() IS NOT NULL THEN 'Role: ' || auth.role()
    ELSE 'No role detected'
  END as result;

-- 6. Count existing users
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN subscription_tier = 'pro' THEN 1 END) as pro_users,
  COUNT(CASE WHEN subscription_tier = 'free' THEN 1 END) as free_users,
  COUNT(CASE WHEN email LIKE '%@ionsolar.com' THEN 1 END) as ion_solar_users
FROM users;

-- 7. Show sample user data (without sensitive info)
SELECT 
  id,
  email,
  full_name,
  subscription_tier,
  subscription_status,
  single_reports_purchased,
  single_reports_used,
  created_at
FROM users 
ORDER BY created_at DESC 
LIMIT 5;
