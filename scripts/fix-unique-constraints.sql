-- Remove any duplicate users first
WITH duplicates AS (
  SELECT id, email, ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at) as rn
  FROM users
  WHERE email IS NOT NULL
)
DELETE FROM users 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Drop existing constraints if they exist
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_unique;

-- Add proper unique constraint on email (allowing NULL)
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription_type ON users(subscription_type);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Ensure no NULL emails exist
UPDATE users SET email = id || '@placeholder.com' WHERE email IS NULL;

-- Verify the fix
SELECT 
  COUNT(*) as total_users,
  COUNT(DISTINCT email) as unique_emails,
  COUNT(*) - COUNT(DISTINCT email) as duplicates
FROM users;
