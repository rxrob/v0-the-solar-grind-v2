-- Drop existing table if it exists
DROP TABLE IF EXISTS public.user_tracking_events;

-- Create user_tracking_events table
CREATE TABLE public.user_tracking_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    event_data JSONB,
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    page_url TEXT,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_user_tracking_events_session_id ON public.user_tracking_events(session_id);
CREATE INDEX idx_user_tracking_events_event_type ON public.user_tracking_events(event_type);
CREATE INDEX idx_user_tracking_events_timestamp ON public.user_tracking_events(timestamp);
CREATE INDEX idx_user_tracking_events_user_id ON public.user_tracking_events(user_id);

-- Enable RLS
ALTER TABLE public.user_tracking_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow anonymous inserts" ON public.user_tracking_events
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "Allow authenticated inserts" ON public.user_tracking_events
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can view their own events" ON public.user_tracking_events
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Service role can do everything" ON public.user_tracking_events
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Grant permissions
GRANT INSERT ON public.user_tracking_events TO anon;
GRANT INSERT ON public.user_tracking_events TO authenticated;
GRANT SELECT ON public.user_tracking_events TO authenticated;
GRANT ALL ON public.user_tracking_events TO service_role;

-- Verify table creation
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_tracking_events' 
ORDER BY ordinal_position;
