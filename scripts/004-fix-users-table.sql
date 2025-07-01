-- Drop existing table if it has issues and recreate properly
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with proper UUID handling
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create updated_at trigger
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some demo data
INSERT INTO users (id, email, full_name) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'demo@example.com', 'Demo User'),
  ('550e8400-e29b-41d4-a716-446655440001', 'user@gmail.com', 'Google User')
ON CONFLICT (email) DO NOTHING;
