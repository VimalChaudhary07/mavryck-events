/*
  # Fix RLS policies for event_requests table

  1. Security Updates
    - Drop existing conflicting policies for event_requests
    - Create new comprehensive policies that allow anonymous insertions
    - Ensure authenticated users can perform all operations
    - Maintain data security while allowing public form submissions

  2. Changes
    - Allow anonymous users to insert event requests (public form submissions)
    - Allow authenticated users full CRUD access
    - Ensure policies don't conflict with each other
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "event_requests_anonymous_insert" ON event_requests;
DROP POLICY IF EXISTS "event_requests_authenticated_insert" ON event_requests;
DROP POLICY IF EXISTS "event_requests_authenticated_select" ON event_requests;
DROP POLICY IF EXISTS "event_requests_authenticated_update" ON event_requests;
DROP POLICY IF EXISTS "event_requests_authenticated_delete" ON event_requests;

-- Create new comprehensive policies
-- Allow anonymous users to insert event requests (for public forms)
CREATE POLICY "Allow anonymous event request submission"
  ON event_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to insert event requests
CREATE POLICY "Allow authenticated event request submission"
  ON event_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to select all event requests
CREATE POLICY "Allow authenticated users to view event requests"
  ON event_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update event requests
CREATE POLICY "Allow authenticated users to update event requests"
  ON event_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete event requests
CREATE POLICY "Allow authenticated users to delete event requests"
  ON event_requests
  FOR DELETE
  TO authenticated
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE event_requests ENABLE ROW LEVEL SECURITY;