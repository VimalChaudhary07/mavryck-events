/*
  # Fix Anonymous User Access for Contact and Event Forms

  1. Problem Analysis
    - Anonymous users cannot submit contact messages and event requests
    - Some policies already exist and need to be handled carefully
    - Need to ensure proper RLS configuration for anonymous access

  2. Solution
    - Check existing policies before creating new ones
    - Ensure anonymous users can INSERT into both tables
    - Maintain security for admin operations
    - Handle policy conflicts gracefully

  3. Security Considerations
    - Allow public form submissions as intended
    - Keep read/update/delete restricted to authenticated users
    - Maintain existing authenticated user policies
*/

-- Function to safely create policy if it doesn't exist
CREATE OR REPLACE FUNCTION create_policy_if_not_exists(
    policy_name text,
    table_name text,
    policy_definition text
) RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = table_name AND policyname = policy_name
    ) THEN
        EXECUTE policy_definition;
        RAISE NOTICE 'Created policy: % on table: %', policy_name, table_name;
    ELSE
        RAISE NOTICE 'Policy already exists: % on table: %', policy_name, table_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Ensure RLS is enabled on both tables
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_requests ENABLE ROW LEVEL SECURITY;

-- Create anonymous insert policies if they don't exist
SELECT create_policy_if_not_exists(
    'contact_messages_anonymous_insert',
    'contact_messages',
    'CREATE POLICY "contact_messages_anonymous_insert" ON contact_messages FOR INSERT TO anon WITH CHECK (true);'
);

SELECT create_policy_if_not_exists(
    'event_requests_anonymous_insert',
    'event_requests',
    'CREATE POLICY "event_requests_anonymous_insert" ON event_requests FOR INSERT TO anon WITH CHECK (true);'
);

-- Create authenticated insert policies if they don't exist
SELECT create_policy_if_not_exists(
    'contact_messages_authenticated_insert',
    'contact_messages',
    'CREATE POLICY "contact_messages_authenticated_insert" ON contact_messages FOR INSERT TO authenticated WITH CHECK (true);'
);

SELECT create_policy_if_not_exists(
    'event_requests_authenticated_insert',
    'event_requests',
    'CREATE POLICY "event_requests_authenticated_insert" ON event_requests FOR INSERT TO authenticated WITH CHECK (true);'
);

-- Ensure other necessary policies exist for authenticated users
SELECT create_policy_if_not_exists(
    'contact_messages_authenticated_select',
    'contact_messages',
    'CREATE POLICY "contact_messages_authenticated_select" ON contact_messages FOR SELECT TO authenticated USING (true);'
);

SELECT create_policy_if_not_exists(
    'contact_messages_authenticated_update',
    'contact_messages',
    'CREATE POLICY "contact_messages_authenticated_update" ON contact_messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);'
);

SELECT create_policy_if_not_exists(
    'contact_messages_authenticated_delete',
    'contact_messages',
    'CREATE POLICY "contact_messages_authenticated_delete" ON contact_messages FOR DELETE TO authenticated USING (true);'
);

SELECT create_policy_if_not_exists(
    'event_requests_authenticated_select',
    'event_requests',
    'CREATE POLICY "event_requests_authenticated_select" ON event_requests FOR SELECT TO authenticated USING (true);'
);

SELECT create_policy_if_not_exists(
    'event_requests_authenticated_update',
    'event_requests',
    'CREATE POLICY "event_requests_authenticated_update" ON event_requests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);'
);

SELECT create_policy_if_not_exists(
    'event_requests_authenticated_delete',
    'event_requests',
    'CREATE POLICY "event_requests_authenticated_delete" ON event_requests FOR DELETE TO authenticated USING (true);'
);

-- Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_viewed ON contact_messages(viewed);
CREATE INDEX IF NOT EXISTS idx_event_requests_created_at ON event_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_requests_status ON event_requests(status);

-- Clean up the helper function
DROP FUNCTION create_policy_if_not_exists(text, text, text);

-- Verify the policies are working
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    -- Count anonymous insert policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename IN ('contact_messages', 'event_requests')
    AND policyname LIKE '%anonymous_insert'
    AND 'anon' = ANY(string_to_array(roles::text, ','));
    
    IF policy_count >= 2 THEN
        RAISE NOTICE 'SUCCESS: Anonymous insert policies are properly configured';
    ELSE
        RAISE WARNING 'ISSUE: Expected at least 2 anonymous insert policies, found %', policy_count;
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

-- Final verification: List current policies for debugging
DO $$
DECLARE
    policy_info RECORD;
BEGIN
    RAISE NOTICE 'Current RLS Policies for contact_messages and event_requests:';
    
    FOR policy_info IN
        SELECT 
            tablename,
            policyname,
            permissive,
            roles::text as roles_text,
            cmd
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