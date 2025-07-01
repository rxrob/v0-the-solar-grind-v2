-- Add only the missing Stripe fields to existing users table
DO $$ 
BEGIN
    -- Add stripe_customer_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'stripe_customer_id'
    ) THEN
        ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255);
        RAISE NOTICE 'Added stripe_customer_id column';
    ELSE
        RAISE NOTICE 'stripe_customer_id column already exists';
    END IF;

    -- Add billing_period_start column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'billing_period_start'
    ) THEN
        ALTER TABLE users ADD COLUMN billing_period_start TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added billing_period_start column';
    ELSE
        RAISE NOTICE 'billing_period_start column already exists';
    END IF;

    -- Check if subscription_status column exists and has the right default
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'subscription_status'
    ) THEN
        ALTER TABLE users ADD COLUMN subscription_status VARCHAR(50) DEFAULT 'active';
        RAISE NOTICE 'Added subscription_status column';
    ELSE
        RAISE NOTICE 'subscription_status column already exists';
    END IF;

    -- Create indexes if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'users' AND indexname = 'idx_users_stripe_customer_id'
    ) THEN
        CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);
        RAISE NOTICE 'Created stripe_customer_id index';
    ELSE
        RAISE NOTICE 'stripe_customer_id index already exists';
    END IF;

END $$;

-- Update any NULL subscription_status values
UPDATE users 
SET subscription_status = 'active'
WHERE subscription_status IS NULL;

-- Show the current users table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Show sample data
SELECT 
    id,
    email,
    subscription_tier,
    subscription_status,
    stripe_customer_id,
    created_at
FROM users 
LIMIT 5;
