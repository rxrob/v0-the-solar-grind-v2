-- First, check if the table exists and drop it
DROP TABLE IF EXISTS public.user_tracking_events CASCADE;

-- Create the user_tracking_events table with proper structure
CREATE TABLE public.user_tracking_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL CHECK (event_type != ''),
    event_data JSONB DEFAULT '{}' NOT NULL,
    session_id TEXT NOT NULL CHECK (session_id != ''),
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
CREATE INDEX idx_user_tracking_events_timestamp ON public.user_tracking_events(timestamp DESC);
CREATE INDEX idx_user_tracking_events_user_id ON public.user_tracking_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_user_tracking_events_created_at ON public.user_tracking_events(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_tracking_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.user_tracking_events;
DROP POLICY IF EXISTS "Allow authenticated inserts" ON public.user_tracking_events;
DROP POLICY IF EXISTS "Users can view their own events" ON public.user_tracking_events;
DROP POLICY IF EXISTS "Service role full access" ON public.user_tracking_events;

-- Create RLS policies
CREATE POLICY "Allow anonymous inserts" ON public.user_tracking_events
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "Allow authenticated inserts" ON public.user_tracking_events
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can view their own events" ON public.user_tracking_events
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Service role full access" ON public.user_tracking_events
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT INSERT ON public.user_tracking_events TO anon;
GRANT INSERT ON public.user_tracking_events TO authenticated;
GRANT SELECT ON public.user_tracking_events TO authenticated;
GRANT ALL ON public.user_tracking_events TO service_role;

-- Grant usage on the sequence (for UUID generation)
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Add helpful comments
COMMENT ON TABLE public.user_tracking_events IS 'Stores user interaction and page view tracking events with proper RLS';
COMMENT ON COLUMN public.user_tracking_events.event_type IS 'Type of event (page_view, user_visit, button_click, etc.)';
COMMENT ON COLUMN public.user_tracking_events.event_data IS 'Additional event data stored as JSONB';
COMMENT ON COLUMN public.user_tracking_events.session_id IS 'Unique session identifier for tracking user sessions';

-- Verify table creation and structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_tracking_events' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test insert to verify permissions work
DO $$
BEGIN
    INSERT INTO public.user_tracking_events (event_type, session_id, event_data, page_url) 
    VALUES ('test_event', 'test_session_123', '{"test": true}', '/test');
    
    RAISE NOTICE 'Test insert successful';
    
    -- Clean up test data
    DELETE FROM public.user_tracking_events WHERE event_type = 'test_event';
    
    RAISE NOTICE 'Test cleanup successful';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Test failed: %', SQLERRM;
END $$;

-- Show final table info
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE tablename = 'user_tracking_events';
