-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON users;
DROP POLICY IF EXISTS "Enable insert for service role" ON users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON users;
DROP POLICY IF EXISTS "Enable delete for service role" ON users;
DROP POLICY IF EXISTS "users_read_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;

-- Disable RLS temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
-- Allow users to read their own profile
CREATE POLICY "users_read_own" ON users
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Allow users to update their own profile
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Grant proper permissions
GRANT ALL ON users TO service_role;
GRANT SELECT, UPDATE ON users TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';
