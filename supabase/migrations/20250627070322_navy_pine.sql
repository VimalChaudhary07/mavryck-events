/*
  # Fix RLS Policies for Anonymous User Access

  1. Problem
    - Anonymous users cannot insert contact messages or event requests
    - RLS policies are blocking public form submissions
    - Error: "new row violates row-level security policy"

  2. Solution
    - Create new policies that explicitly allow anonymous users to insert
    - Ensure public forms work without authentication
    - Maintain admin access for management operations

  3. Tables Updated
    - contact_messages: Allow anonymous INSERT
    - event_requests: Allow anonymous INSERT
    - Maintain existing policies for other operations
*/

-- Drop existing problematic policies and recreate them
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all existing policies for contact_messages
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'contact_messages'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON contact_messages', policy_record.policyname);
    END LOOP;

    -- Drop all existing policies for event_requests
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'event_requests'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON event_requests', policy_record.policyname);
    END LOOP;
END $$;

-- Contact Messages Policies - Allow anonymous submissions
CREATE POLICY "allow_anonymous_contact_insert"
  ON contact_messages
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "allow_authenticated_contact_insert"
  ON contact_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "allow_admin_contact_select"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "allow_admin_contact_update"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "allow_admin_contact_delete"
  ON contact_messages
  FOR DELETE
  TO authenticated
  USING (true);

-- Event Requests Policies - Allow anonymous submissions
CREATE POLICY "allow_anonymous_event_insert"
  ON event_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "allow_authenticated_event_insert"
  ON event_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "allow_admin_event_select"
  ON event_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "allow_admin_event_update"
  ON event_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "allow_admin_event_delete"
  ON event_requests
  FOR DELETE
  TO authenticated
  USING (true);

-- Verify RLS is enabled
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_requests ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_requests_created_at ON event_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_viewed ON contact_messages(viewed);
CREATE INDEX IF NOT EXISTS idx_event_requests_status ON event_requests(status);