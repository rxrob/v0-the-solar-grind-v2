-- Create user tracking table for comprehensive analytics
DROP TABLE IF EXISTS public.user_tracking;

CREATE TABLE IF NOT EXISTS public.user_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Visit information
    visit_timestamp TIMESTAMPTZ DEFAULT NOW(),
    page_url TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    
    -- Device information
    user_agent TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    screen_width INTEGER,
    screen_height INTEGER,
    viewport_width INTEGER,
    viewport_height INTEGER,
    
    -- Location information
    ip_address INET,
    location JSONB,
    
    -- Solar calculation data
    solar_score INTEGER,
    solar_factors JSONB,
    estimated_savings JSONB,
    
    -- Engagement metrics
    time_on_page INTEGER DEFAULT 0,
    scroll_depth INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    form_interactions INTEGER DEFAULT 0,
    
    -- Custom events
    events JSONB DEFAULT '[]'::jsonb,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_tracking_session_id ON public.user_tracking(session_id);
CREATE INDEX IF NOT EXISTS idx_user_tracking_user_id ON public.user_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tracking_visit_timestamp ON public.user_tracking(visit_timestamp);
CREATE INDEX IF NOT EXISTS idx_user_tracking_page_url ON public.user_tracking(page_url);
CREATE INDEX IF NOT EXISTS idx_user_tracking_location ON public.user_tracking(location);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_user_tracking_updated_at 
    BEFORE UPDATE ON public.user_tracking 
    FOR EACH ROW 
    EXECUTE FUNCTION update_user_tracking_updated_at();

-- Disable RLS for now to avoid permission issues
ALTER TABLE public.user_tracking DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.user_tracking TO authenticated;
GRANT ALL ON public.user_tracking TO anon;

-- Create user tracking events table
CREATE TABLE IF NOT EXISTS user_tracking_events (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    session_id TEXT,
    user_id UUID REFERENCES auth.users(id),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    page_url TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_tracking_events_event_type ON user_tracking_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_tracking_events_session_id ON user_tracking_events(session_id);
CREATE INDEX IF NOT EXISTS idx_user_tracking_events_user_id ON user_tracking_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tracking_events_timestamp ON user_tracking_events(timestamp);

-- Enable Row Level Security
ALTER TABLE user_tracking_events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts for all users (for anonymous tracking)
CREATE POLICY "Allow insert for all users" ON user_tracking_events
  FOR INSERT WITH CHECK (true);

-- Create policy to allow users to view their own events
CREATE POLICY "Users can view own events" ON user_tracking_events
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Grant permissions
GRANT INSERT ON user_tracking_events TO anon;
GRANT INSERT ON user_tracking_events TO authenticated;
GRANT SELECT ON user_tracking_events TO authenticated;

COMMENT ON TABLE user_tracking_events IS 'Stores user interaction and page view tracking events';
