-- Setup Row Level Security policies for the users table
-- This script ensures proper access control for user profiles

-- First, enable RLS on the users table if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON users;

-- Policy 1: Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy 3: Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy 4: Allow service role to manage all profiles (for admin operations)
CREATE POLICY "Service role can manage all profiles"
  ON users
  FOR ALL
  USING (auth.role() = 'service_role');

-- Verify that RLS is properly enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN 'RLS ENABLED ✅'
    ELSE 'RLS DISABLED ❌'
  END as status
FROM pg_tables 
WHERE tablename = 'users';

-- Show all policies on the users table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- Test query to verify policies work
-- This should only return the current user's profile
SELECT 
  id,
  email,
  full_name,
  subscription_tier,
  subscription_status,
  created_at
FROM users 
WHERE id = auth.uid();
