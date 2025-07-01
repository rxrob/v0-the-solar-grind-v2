-- Add Stripe-related fields to users table
DO $$ 
BEGIN
    -- Add stripe_customer_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'stripe_customer_id'
    ) THEN
        ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255);
        CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
    END IF;

    -- Add billing_period_start column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'billing_period_start'
    ) THEN
        ALTER TABLE users ADD COLUMN billing_period_start TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add subscription_status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'subscription_status'
    ) THEN
        ALTER TABLE users ADD COLUMN subscription_status VARCHAR(50) DEFAULT 'active';
    END IF;

    -- Update existing users to have proper subscription status
    UPDATE users 
    SET subscription_status = CASE 
        WHEN subscription_tier = 'pro' THEN 'active'
        ELSE 'active'
    END
    WHERE subscription_status IS NULL;

END $$;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
    AND column_name IN ('stripe_customer_id', 'billing_period_start', 'subscription_status')
ORDER BY column_name;

-- Show sample of updated users table structure
SELECT 
    id,
    email,
    subscription_tier,
    subscription_status,
    stripe_customer_id,
    billing_period_start,
    created_at
FROM users 
LIMIT 3;
