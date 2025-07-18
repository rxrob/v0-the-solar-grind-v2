-- Create a simple user tracking table without complex dependencies
CREATE TABLE IF NOT EXISTS user_tracking_events (
    id SERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    session_id TEXT NOT NULL,
    user_id TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    page_url TEXT,
    user_agent TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_tracking_events_session_id ON user_tracking_events(session_id);
CREATE INDEX IF NOT EXISTS idx_user_tracking_events_event_type ON user_tracking_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_tracking_events_timestamp ON user_tracking_events(timestamp);

-- Test insert
INSERT INTO user_tracking_events (event_type, session_id, event_data, page_url) 
VALUES ('test_event', 'test_session_123', '{"test": true}', '/test')
ON CONFLICT DO NOTHING;

-- Clean up test data
DELETE FROM user_tracking_events WHERE event_type = 'test_event';

-- Show table structure
\d user_tracking_events;
