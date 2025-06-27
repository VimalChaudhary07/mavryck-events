/*
  # Fix Anonymous Contact Form Submission

  1. Problem Analysis
    - Anonymous users cannot submit contact forms or event requests
    - RLS policies are blocking public form submissions
    - Error: "new row violates row-level security policy"

  2. Solution
    - Ensure anonymous users can INSERT into contact_messages and event_requests
    - Verify RLS policies are correctly configured
    - Test anonymous access explicitly

  3. Security Considerations
    - Maintain security for admin operations
    - Allow public form submissions as intended
    - Keep read/update/delete restricted to authenticated users
*/

-- First, let's check current policies and clean up if needed
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Check if anonymous insert policies exist for contact_messages
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'contact_messages' 
        AND policyname = 'contact_messages_anonymous_insert'
    ) THEN
        RAISE NOTICE 'Anonymous insert policy missing for contact_messages';
    END IF;

    -- Check if anonymous insert policies exist for event_requests
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'event_requests' 
        AND policyname = 'event_requests_anonymous_insert'
    ) THEN
        RAISE NOTICE 'Anonymous insert policy missing for event_requests';
    END IF;
END $$;

-- Ensure RLS is enabled (should already be enabled)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_requests ENABLE ROW LEVEL SECURITY;

-- Drop and recreate anonymous insert policies to ensure they work correctly
DROP POLICY IF EXISTS "contact_messages_anonymous_insert" ON contact_messages;
DROP POLICY IF EXISTS "event_requests_anonymous_insert" ON event_requests;

-- Create explicit policies for anonymous users to insert contact messages
CREATE POLICY "contact_messages_anonymous_insert"
  ON contact_messages
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create explicit policies for anonymous users to insert event requests  
CREATE POLICY "event_requests_anonymous_insert"
  ON event_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Ensure authenticated users can also insert (for admin operations)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'contact_messages' 
        AND policyname = 'contact_messages_authenticated_insert'
    ) THEN
        CREATE POLICY "contact_messages_authenticated_insert"
          ON contact_messages
          FOR INSERT
          TO authenticated
          WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'event_requests' 
        AND policyname = 'event_requests_authenticated_insert'
    ) THEN
        CREATE POLICY "event_requests_authenticated_insert"
          ON event_requests
          FOR INSERT
          TO authenticated
          WITH CHECK (true);
    END IF;
END $$;

-- Verify other necessary policies exist for authenticated users
DO $$
BEGIN
    -- Contact messages policies for authenticated users
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'contact_messages' 
        AND policyname = 'contact_messages_authenticated_select'
    ) THEN
        CREATE POLICY "contact_messages_authenticated_select"
          ON contact_messages
          FOR SELECT
          TO authenticated
          USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'contact_messages' 
        AND policyname = 'contact_messages_authenticated_update'
    ) THEN
        CREATE POLICY "contact_messages_authenticated_update"
          ON contact_messages
          FOR UPDATE
          TO authenticated
          USING (true)
          WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'contact_messages' 
        AND policyname = 'contact_messages_authenticated_delete'
    ) THEN
        CREATE POLICY "contact_messages_authenticated_delete"
          ON contact_messages
          FOR DELETE
          TO authenticated
          USING (true);
    END IF;

    -- Event requests policies for authenticated users
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'event_requests' 
        AND policyname = 'event_requests_authenticated_select'
    ) THEN
        CREATE POLICY "event_requests_authenticated_select"
          ON event_requests
          FOR SELECT
          TO authenticated
          USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'event_requests' 
        AND policyname = 'event_requests_authenticated_update'
    ) THEN
        CREATE POLICY "event_requests_authenticated_update"
          ON event_requests
          FOR UPDATE
          TO authenticated
          USING (true)
          WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'event_requests' 
        AND policyname = 'event_requests_authenticated_delete'
    ) THEN
        CREATE POLICY "event_requests_authenticated_delete"
          ON event_requests
          FOR DELETE
          TO authenticated
          USING (true);
    END IF;
END $$;

-- Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_viewed ON contact_messages(viewed);
CREATE INDEX IF NOT EXISTS idx_event_requests_created_at ON event_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_requests_status ON event_requests(status);

-- Test the policies by attempting to verify anonymous access
-- This doesn't actually test insertion but verifies the policies exist
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    -- Count anonymous insert policies (fixed type casting issue)
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename IN ('contact_messages', 'event_requests')
    AND policyname LIKE '%anonymous_insert'
    AND 'anon' = ANY(roles::text[]);
    
    IF policy_count = 2 THEN
        RAISE NOTICE 'SUCCESS: Anonymous insert policies are properly configured for both tables';
    ELSE
        RAISE WARNING 'ISSUE: Expected 2 anonymous insert policies, found %', policy_count;
    END IF;
    
    -- Verify RLS is enabled
    SELECT COUNT(*) INTO policy_count
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname IN ('contact_messages', 'event_requests')
    AND n.nspname = 'public'
    AND c.relrowsecurity = true;
    
    IF policy_count = 2 THEN
        RAISE NOTICE 'SUCCESS: RLS is enabled on both tables';
    ELSE
        RAISE WARNING 'ISSUE: RLS should be enabled on both tables';
    END IF;
END $$;

-- Final verification: List all policies for debugging
DO $$
DECLARE
    policy_info RECORD;
BEGIN
    RAISE NOTICE 'Current RLS Policies:';
    
    FOR policy_info IN
        SELECT 
            tablename,
            policyname,
            permissive,
            roles::text[] as roles_text,
            cmd,
            qual,
            with_check
        FROM pg_policies 
        WHERE tablename IN ('contact_messages', 'event_requests')
        ORDER BY tablename, policyname
    LOOP
        RAISE NOTICE 'Table: %, Policy: %, Command: %, Roles: %', 
            policy_info.tablename, 
            policy_info.policyname, 
            policy_info.cmd,
            policy_info.roles_text;
    END LOOP;
END $$;