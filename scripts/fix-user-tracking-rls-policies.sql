-- This script provides the definitive fix for the RLS insert issue.
-- It removes all ambiguity by deleting old policies and creating one simple, permissive rule for inserts.

-- Ensure the table exists and RLS is enabled.
ALTER TABLE public.user_tracking_events ENABLE ROW LEVEL SECURITY;

-- Forcefully drop ALL existing policies on the table to ensure a clean slate.
-- This is the most critical step to resolve conflicts.
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_tracking_events' AND schemaname = 'public') LOOP
        RAISE NOTICE 'Dropping policy % on user_tracking_events', r.policyname;
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.user_tracking_events;';
    END LOOP;
END;
$$;

-- Create a SINGLE, UNAMBIGUOUS policy for INSERT operations.
-- This policy allows ONLY authenticated users to insert data.
-- The `WITH CHECK (true)` clause is a condition that always evaluates to true, thus allowing the insert.
CREATE POLICY "Enable insert for authenticated users only"
ON public.user_tracking_events
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create a policy for SELECT operations.
-- This allows authenticated users to view ONLY their own tracking data.
CREATE POLICY "Enable select for authenticated users on their own data"
ON public.user_tracking_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Confirm permissions are granted.
-- We no longer grant INSERT to 'public' or 'anon'.
GRANT INSERT, SELECT ON TABLE public.user_tracking_events TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.user_tracking_events_id_seq TO authenticated;

RAISE NOTICE 'RLS policies for user_tracking_events have been reset to allow authenticated inserts only.';
