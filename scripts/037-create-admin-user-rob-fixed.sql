-- Create admin user Rob with proper UUID and subscription
DO $$
BEGIN
    -- First, check if the user already exists and delete if so
    DELETE FROM auth.users WHERE email = 'rob@mysolarai.com';
    DELETE FROM public.users WHERE email = 'rob@mysolarai.com';
    
    -- Insert into auth.users table (Supabase auth)
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        role,
        aud,
        confirmation_token,
        email_change_token_new,
        recovery_token,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin
    ) VALUES (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'rob@mysolarai.com',
        crypt('Summer69!', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        'authenticated',
        'authenticated',
        '',
        '',
        '',
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "Rob Admin", "role": "admin"}',
        false
    );
    
    -- Get the user ID we just created
    DECLARE
        user_uuid UUID;
    BEGIN
        SELECT id INTO user_uuid FROM auth.users WHERE email = 'rob@mysolarai.com';
        
        -- Insert into public.users table
        INSERT INTO public.users (
            id,
            email,
            name,
            subscription_type,
            subscription_status,
            stripe_customer_id,
            created_at,
            updated_at
        ) VALUES (
            user_uuid,
            'rob@mysolarai.com',
            'Rob Admin',
            'pro',
            'active',
            'cus_admin_rob_12345',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Successfully created admin user Rob with ID: %', user_uuid;
    END;
END $$;

-- Verify the user was created
SELECT 
    u.id,
    u.email,
    u.name,
    u.subscription_type,
    u.subscription_status,
    u.created_at
FROM public.users u 
WHERE u.email = 'rob@mysolarai.com';
