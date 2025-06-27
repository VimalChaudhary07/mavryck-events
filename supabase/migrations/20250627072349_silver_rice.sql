/*
  # Fix RLS policies for anonymous user submissions

  1. Security Updates
    - Drop existing problematic policies for contact_messages and event_requests
    - Create new, properly configured policies for anonymous INSERT operations
    - Ensure authenticated users maintain full access
    - Keep public SELECT access for gallery, products, and testimonials

  2. Policy Changes
    - contact_messages: Allow anonymous INSERT, authenticated full access
    - event_requests: Allow anonymous INSERT, authenticated full access
    - Maintain existing policies for other tables

  This migration ensures that contact forms and event request forms work properly
  for anonymous users while maintaining security for authenticated operations.
*/

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "contact_messages_anonymous_insert" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_authenticated_insert" ON contact_messages;
DROP POLICY IF EXISTS "event_requests_anonymous_insert" ON event_requests;
DROP POLICY IF EXISTS "event_requests_authenticated_insert" ON event_requests;

-- Create new policies for contact_messages
CREATE POLICY "contact_messages_allow_anonymous_insert"
  ON contact_messages
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "contact_messages_allow_authenticated_insert"
  ON contact_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "contact_messages_authenticated_select"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "contact_messages_authenticated_update"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "contact_messages_authenticated_delete"
  ON contact_messages
  FOR DELETE
  TO authenticated
  USING (true);

-- Create new policies for event_requests
CREATE POLICY "event_requests_allow_anonymous_insert"
  ON event_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "event_requests_allow_authenticated_insert"
  ON event_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "event_requests_authenticated_select"
  ON event_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "event_requests_authenticated_update"
  ON event_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "event_requests_authenticated_delete"
  ON event_requests
  FOR DELETE
  TO authenticated
  USING (true);

-- Ensure RLS is enabled on both tables
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_requests ENABLE ROW LEVEL SECURITY;

-- Verify the policies are working by testing anonymous access
-- This is a comment for documentation - the actual test will be done by the application