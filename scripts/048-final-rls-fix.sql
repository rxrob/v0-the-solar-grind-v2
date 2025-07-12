-- This script provides a definitive fix for the user profile access policies.
-- It ensures a clean slate by removing all old policies on the 'users' table
-- before creating the new, correct ones.

-- Step 1: Temporarily disable RLS to drop policies without permission issues.
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies on the 'users' table.
-- A loop is used to handle any number of existing policies gracefully.
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN (SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public')
    LOOP
        -- The 'CASCADE' option removes any dependent objects, which can help avoid errors.
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON public.users CASCADE;';
    END LOOP;
END;
$$;

-- Step 3: Create the new, simple, and non-recursive SELECT policy.
-- This allows authenticated users to read ONLY their own profile.
CREATE POLICY "Users can view their own profile."
ON public.users FOR SELECT
TO authenticated
USING ( auth.uid() = id );

-- Step 4: Create the new, simple, and non-recursive UPDATE policy.
-- This allows authenticated users to update ONLY their own profile.
-- The WITH CHECK clause ensures a user cannot change their ID or update other profiles.
CREATE POLICY "Users can update their own profile."
ON public.users FOR UPDATE
TO authenticated
USING ( auth.uid() = id )
WITH CHECK ( auth.uid() = id );

-- Step 5: Re-enable Row Level Security on the table. This is a critical final step.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Optional: Force RLS to be applied even for table owners (like the postgres user).
-- This is a best practice for security.
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;
