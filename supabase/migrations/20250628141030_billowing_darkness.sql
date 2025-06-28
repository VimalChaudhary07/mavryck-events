/*
  # Fix Anonymous User Access for Contact and Event Forms

  1. Security Updates
    - Ensure anonymous users can insert contact messages
    - Ensure anonymous users can insert event requests
    - Verify RLS policies are correctly configured
    - Add missing policies if needed

  2. Changes
    - Update contact_messages policies for anonymous access
    - Update event_requests policies for anonymous access
    - Ensure proper permissions for public form submissions
*/

-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "contact_messages_anonymous_insert" ON contact_messages;
DROP POLICY IF EXISTS "event_requests_anonymous_insert" ON event_requests;

-- Recreate policies with explicit anonymous access
CREATE POLICY "contact_messages_anonymous_insert"
  ON contact_messages
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "event_requests_anonymous_insert"
  ON event_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Ensure authenticated users can also insert
CREATE POLICY "contact_messages_authenticated_insert"
  ON contact_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "event_requests_authenticated_insert"
  ON event_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Verify RLS is enabled (should already be enabled)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_requests ENABLE ROW LEVEL SECURITY;