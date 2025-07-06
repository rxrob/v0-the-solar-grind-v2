-- Enable RLS on all tables (skip if already enabled)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE solar_calculations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

DROP POLICY IF EXISTS "Users can view own projects" ON user_projects;
DROP POLICY IF EXISTS "Users can create own projects" ON user_projects;
DROP POLICY IF EXISTS "Users can update own projects" ON user_projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON user_projects;

DROP POLICY IF EXISTS "Users can view own calculations" ON solar_calculations;
DROP POLICY IF EXISTS "Users can create own calculations" ON solar_calculations;
DROP POLICY IF EXISTS "Users can update own calculations" ON solar_calculations;

-- Create policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for user_projects table
CREATE POLICY "Users can view own projects" ON user_projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" ON user_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON user_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON user_projects
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for solar_calculations table
CREATE POLICY "Users can view own calculations" ON solar_calculations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own calculations" ON solar_calculations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calculations" ON solar_calculations
  FOR UPDATE USING (auth.uid() = user_id);

-- Free user limits policy for advanced reports
CREATE POLICY "Free user advanced report limit" ON solar_calculations
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    (
      -- Allow if user has pro subscription
      (SELECT subscription_type FROM users WHERE id = auth.uid()) = 'pro'
      OR
      -- Allow if user has unused single reports
      (SELECT single_reports_purchased - COALESCE(single_reports_used, 0) FROM users WHERE id = auth.uid()) > 0
      OR
      -- Allow if this is their first advanced report (free tier)
      (SELECT COUNT(*) FROM solar_calculations WHERE user_id = auth.uid() AND calculation_type = 'advanced') = 0
      OR
      -- Allow basic calculations
      calculation_type = 'basic'
    )
  );

-- Free user daily basic calculation limit
CREATE POLICY "Free user daily basic calculation limit" ON solar_calculations
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    (
      -- Allow if user has pro subscription
      (SELECT subscription_type FROM users WHERE id = auth.uid()) = 'pro'
      OR
      -- Allow if advanced calculation (handled by other policy)
      calculation_type = 'advanced'
      OR
      -- Allow if less than 1 basic calculation today
      (
        calculation_type = 'basic' AND
        (SELECT COUNT(*) FROM solar_calculations 
         WHERE user_id = auth.uid() 
         AND calculation_type = 'basic' 
         AND DATE(created_at) = CURRENT_DATE) = 0
      )
    )
  );

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('users', 'user_projects', 'solar_calculations')
ORDER BY tablename, policyname;
