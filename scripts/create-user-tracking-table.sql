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
