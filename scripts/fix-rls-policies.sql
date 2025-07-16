-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON users;

-- Disable RLS temporarily to clean up
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
CREATE POLICY "Enable read access for users based on user_id" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable insert for service role" ON users
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Enable update for users based on user_id" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable delete for service role" ON users
  FOR DELETE USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT ALL ON users TO service_role;
GRANT SELECT, UPDATE ON users TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';
