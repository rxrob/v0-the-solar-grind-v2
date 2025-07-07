-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE solar_calculations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own projects" ON user_projects;
DROP POLICY IF EXISTS "Users can create own projects" ON user_projects;
DROP POLICY IF EXISTS "Users can update own projects" ON user_projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON user_projects;
DROP POLICY IF EXISTS "Users can view own calculations" ON solar_calculations;
DROP POLICY IF EXISTS "Users can create own calculations" ON solar_calculations;
DROP POLICY IF EXISTS "Free user advanced report limit" ON solar_calculations;
DROP POLICY IF EXISTS "Free user basic calculation limit" ON solar_calculations;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- User projects table policies
CREATE POLICY "Users can view own projects" ON user_projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" ON user_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON user_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON user_projects
  FOR DELETE USING (auth.uid() = user_id);

-- Solar calculations table policies
CREATE POLICY "Users can view own calculations" ON solar_calculations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own calculations" ON solar_calculations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Free user limits
CREATE POLICY "Free user advanced report limit" ON solar_calculations
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    (
      -- Allow if user has pro subscription
      (SELECT subscription_type FROM users WHERE id = auth.uid()) = 'pro' OR
      -- Allow if user has single reports remaining
      (
        SELECT single_reports_purchased - COALESCE(single_reports_used, 0) 
        FROM users 
        WHERE id = auth.uid()
      ) > 0 OR
      -- Allow if this is their first advanced report (free trial)
      (
        calculation_type = 'advanced' AND
        (SELECT COUNT(*) FROM solar_calculations WHERE user_id = auth.uid() AND calculation_type = 'advanced') = 0
      ) OR
      -- Always allow basic calculations (with daily limit handled in application)
      calculation_type = 'basic'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_type);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_projects_user_id ON user_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_solar_calculations_user_id ON solar_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_solar_calculations_type ON solar_calculations(calculation_type);
CREATE INDEX IF NOT EXISTS idx_solar_calculations_created ON solar_calculations(created_at);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_projects TO authenticated;
GRANT SELECT, INSERT ON solar_calculations TO authenticated;

-- Ensure the authenticated role can access the tables
GRANT USAGE ON SCHEMA public TO authenticated;
