-- Check if payments are updating user records correctly
SELECT 
    email,
    subscription_tier,
    subscription_status,
    stripe_customer_id,
    billing_period_start,
    created_at,
    updated_at
FROM users 
WHERE stripe_customer_id IS NOT NULL
ORDER BY updated_at DESC;

-- Check recent user activity
SELECT 
    email,
    subscription_tier,
    monthly_calculations_used,
    monthly_calculations_limit,
    pro_calculator_trials_used
FROM users 
ORDER BY updated_at DESC 
LIMIT 10;
