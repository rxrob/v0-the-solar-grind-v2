-- Fix RLS policies for user_tracking_events table
-- This allows anonymous tracking while maintaining security

-- First, ensure the table exists with proper structure
CREATE TABLE IF NOT EXISTS user_tracking_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(255) NOT NULL,
    event_data JSONB DEFAULT '{}',
    session_id VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    page_url TEXT,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_tracking_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous tracking inserts" ON user_tracking_events;
DROP POLICY IF EXISTS "Allow authenticated user tracking inserts" ON user_tracking_events;
DROP POLICY IF EXISTS "Users can view their own tracking events" ON user_tracking_events;
DROP POLICY IF EXISTS "Allow all tracking inserts" ON user_tracking_events;

-- Create permissive policies for tracking
CREATE POLICY "Allow all tracking inserts" ON user_tracking_events
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Users can view their own tracking events" ON user_tracking_events
    FOR SELECT 
    USING (
        auth.uid() IS NOT NULL AND (
            user_id = auth.uid() OR 
            user_id IS NULL
        )
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT, SELECT ON user_tracking_events TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE user_tracking_events_id_seq TO anon, authenticated;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_tracking_events_user_id ON user_tracking_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tracking_events_session_id ON user_tracking_events(session_id);
CREATE INDEX IF NOT EXISTS idx_user_tracking_events_timestamp ON user_tracking_events(timestamp);
