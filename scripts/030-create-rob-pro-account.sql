-- Create Rob's Pro Account - Final Version
-- This script creates a definitive Pro account for Rob with unlimited access

-- First, clean up any existing Rob accounts to avoid conflicts
DELETE FROM auth.users WHERE email = 'rob@thesolargrind.com';
DELETE FROM public.users WHERE email = 'rob@thesolargrind.com';

-- Create the auth user first
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'rob@thesolargrind.com',
    crypt('RobSolarPro2024!', gen_salt('bf')),
    NOW(),
    NOW(),
    '',
    NOW(),
    '',
    NULL,
    '',
    '',
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Rob", "full_name": "Rob - Solar Grind Owner"}',
    false,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    '',
    0,
    NULL,
    '',
    NULL,
    false,
    NULL
);

-- Get the created user ID
DO $$
DECLARE
    rob_user_id UUID;
BEGIN
    SELECT id INTO rob_user_id FROM auth.users WHERE email = 'rob@thesolargrind.com';
    
    -- Create the public user record
    INSERT INTO public.users (
        id,
        email,
        full_name,
        subscription_tier,
        subscription_status,
        stripe_customer_id,
        stripe_subscription_id,
        trial_ends_at,
        created_at,
        updated_at,
        pro_trial_used,
        calculations_used,
        monthly_calculation_limit
    ) VALUES (
        rob_user_id,
        'rob@thesolargrind.com',
        'Rob - Solar Grind Owner',
        'pro',
        'active',
        'cus_rob_solar_grind_owner',
        'sub_rob_unlimited_pro',
        NULL, -- No trial end date for permanent Pro
        NOW(),
        NOW(),
        true, -- Trial already used (permanent Pro)
        0, -- Reset calculation count
        999999 -- Unlimited calculations
    );
    
    -- Create some demo projects for Rob
    INSERT INTO public.user_projects (
        id,
        user_id,
        project_name,
        address,
        system_size_kw,
        annual_production_kwh,
        estimated_savings,
        created_at,
        updated_at
    ) VALUES 
    (
        gen_random_uuid(),
        rob_user_id,
        'Solar Grind HQ - Demo Project',
        '123 Solar Street, Austin, TX 78701',
        25.5,
        35000,
        8500.00,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        rob_user_id,
        'Client Demo - Residential',
        '456 Green Energy Ave, Austin, TX 78702',
        12.8,
        18500,
        4200.00,
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Rob Pro account created successfully with ID: %', rob_user_id;
END $$;

-- Verify the account was created correctly
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.subscription_tier,
    u.subscription_status,
    u.monthly_calculation_limit,
    COUNT(p.id) as project_count
FROM public.users u
LEFT JOIN public.user_projects p ON u.id = p.user_id
WHERE u.email = 'rob@thesolargrind.com'
GROUP BY u.id, u.email, u.full_name, u.subscription_tier, u.subscription_status, u.monthly_calculation_limit;
