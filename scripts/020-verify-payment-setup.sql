-- Verify all required tables and columns exist for payment system
DO $$
DECLARE
    missing_items TEXT[] := ARRAY[]::TEXT[];
    table_issues TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Check users table columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stripe_customer_id') THEN
        missing_items := array_append(missing_items, 'users.stripe_customer_id');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_tier') THEN
        missing_items := array_append(missing_items, 'users.subscription_tier');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_status') THEN
        missing_items := array_append(missing_items, 'users.subscription_status');
    END IF;

    -- Check if trial_usage table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trial_usage') THEN
        missing_items := array_append(missing_items, 'trial_usage table');
    END IF;

    -- Check for duplicate columns (common issue from multiple migrations)
    SELECT array_agg(column_name || ' (' || count(*) || ' duplicates)')
    INTO table_issues
    FROM information_schema.columns 
    WHERE table_name = 'users'
    GROUP BY column_name
    HAVING count(*) > 1;

    -- Report results
    IF array_length(missing_items, 1) > 0 THEN
        RAISE NOTICE 'Missing items: %', array_to_string(missing_items, ', ');
    ELSE
        RAISE NOTICE '✅ All payment system components are ready!';
    END IF;

    IF array_length(table_issues, 1) > 0 THEN
        RAISE NOTICE '⚠️  Table structure issues detected: %', array_to_string(table_issues, ', ');
        RAISE NOTICE 'These duplicate columns may cause issues. Consider running a cleanup script.';
    END IF;
END $$;

-- Show current payment-related data with better formatting
SELECT 
    '📊 User Statistics' as info,
    COUNT(*) as total_users,
    COUNT(CASE WHEN subscription_tier = 'pro' THEN 1 END) as pro_users,
    COUNT(CASE WHEN subscription_tier = 'free' THEN 1 END) as free_users,
    COUNT(CASE WHEN stripe_customer_id IS NOT NULL THEN 1 END) as users_with_stripe
FROM users;

-- Show trial usage if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trial_usage') THEN
        RAISE NOTICE '📈 Trial Usage Data:';
        PERFORM * FROM (
            SELECT 
                COUNT(*) as total_trial_records,
                COUNT(CASE WHEN calculations_used > 0 THEN 1 END) as active_trial_users,
                AVG(calculations_used) as avg_calculations_used
            FROM trial_usage
        ) t;
    ELSE
        RAISE NOTICE '⚠️  Trial usage table not found - this may affect free user limits';
    END IF;
END $$;
