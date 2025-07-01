-- Add trial tracking columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS pro_calculator_trials_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pro_calculator_trial_limit INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_pro_calculator_trial TIMESTAMP;

-- Update existing users to have trial available
UPDATE users 
SET pro_calculator_trials_used = 0, 
    pro_calculator_trial_limit = 1 
WHERE pro_calculator_trials_used IS NULL;

-- Create function to check and increment trial usage
CREATE OR REPLACE FUNCTION check_and_use_pro_trial(user_email TEXT)
RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    result JSON;
BEGIN
    -- Get user's current trial status
    SELECT subscription_tier, pro_calculator_trials_used, pro_calculator_trial_limit
    INTO user_record
    FROM users 
    WHERE email = user_email;
    
    -- If user not found, return error
    IF NOT FOUND THEN
        RETURN json_build_object(
            'canUsePro', false,
            'reason', 'user_not_found',
            'trialsRemaining', 0
        );
    END IF;
    
    -- If already pro user, allow unlimited access
    IF user_record.subscription_tier = 'pro' THEN
        RETURN json_build_object(
            'canUsePro', true,
            'reason', 'pro_subscriber',
            'trialsRemaining', -1
        );
    END IF;
    
    -- Check if free user has trials remaining
    IF user_record.pro_calculator_trials_used >= user_record.pro_calculator_trial_limit THEN
        RETURN json_build_object(
            'canUsePro', false,
            'reason', 'trial_exhausted',
            'trialsRemaining', 0
        );
    END IF;
    
    -- Increment trial usage
    UPDATE users 
    SET pro_calculator_trials_used = pro_calculator_trials_used + 1,
        last_pro_calculator_trial = NOW()
    WHERE email = user_email;
    
    -- Return success with remaining trials
    RETURN json_build_object(
        'canUsePro', true,
        'reason', 'trial_used',
        'trialsRemaining', user_record.pro_calculator_trial_limit - user_record.pro_calculator_trials_used - 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_and_use_pro_trial(TEXT) TO authenticated, anon;
