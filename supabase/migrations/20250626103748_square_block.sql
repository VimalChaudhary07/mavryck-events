/*
  # Fix Row Level Security Policies

  1. Security Updates
    - Update contact_messages policies to allow anonymous users to insert
    - Ensure admin operations work with authenticated users
    - Fix RLS policies for all tables

  2. Policy Changes
    - Allow anon users to insert contact messages
    - Allow anon users to insert event requests
    - Ensure authenticated users can manage all content
*/

-- Update contact_messages policies to allow anonymous inserts
DROP POLICY IF EXISTS "contact_messages_insert_policy_v2" ON contact_messages;
CREATE POLICY "contact_messages_insert_policy_v3"
  ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Update event_requests policies to allow anonymous inserts
DROP POLICY IF EXISTS "event_requests_insert_policy_v2" ON event_requests;
CREATE POLICY "event_requests_insert_policy_v3"
  ON event_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Ensure gallery policies work for authenticated users
DROP POLICY IF EXISTS "gallery_insert_policy_v2" ON gallery;
CREATE POLICY "gallery_insert_policy_v3"
  ON gallery
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "gallery_update_policy_v2" ON gallery;
CREATE POLICY "gallery_update_policy_v3"
  ON gallery
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "gallery_delete_policy_v2" ON gallery;
CREATE POLICY "gallery_delete_policy_v3"
  ON gallery
  FOR DELETE
  TO authenticated
  USING (true);

-- Ensure products policies work for authenticated users
DROP POLICY IF EXISTS "products_insert_policy_v2" ON products;
CREATE POLICY "products_insert_policy_v3"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "products_update_policy_v2" ON products;
CREATE POLICY "products_update_policy_v3"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "products_delete_policy_v2" ON products;
CREATE POLICY "products_delete_policy_v3"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- Ensure testimonials policies work for authenticated users
DROP POLICY IF EXISTS "testimonials_insert_policy_v2" ON testimonials;
CREATE POLICY "testimonials_insert_policy_v3"
  ON testimonials
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "testimonials_update_policy_v2" ON testimonials;
CREATE POLICY "testimonials_update_policy_v3"
  ON testimonials
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "testimonials_delete_policy_v2" ON testimonials;
CREATE POLICY "testimonials_delete_policy_v3"
  ON testimonials
  FOR DELETE
  TO authenticated
  USING (true);

-- Update contact_messages policies for authenticated users
DROP POLICY IF EXISTS "contact_messages_select_policy_v2" ON contact_messages;
CREATE POLICY "contact_messages_select_policy_v3"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "contact_messages_update_policy_v2" ON contact_messages;
CREATE POLICY "contact_messages_update_policy_v3"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "contact_messages_delete_policy_v2" ON contact_messages;
CREATE POLICY "contact_messages_delete_policy_v3"
  ON contact_messages
  FOR DELETE
  TO authenticated
  USING (true);

-- Update event_requests policies for authenticated users
DROP POLICY IF EXISTS "event_requests_select_policy_v2" ON event_requests;
CREATE POLICY "event_requests_select_policy_v3"
  ON event_requests
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "event_requests_update_policy_v2" ON event_requests;
CREATE POLICY "event_requests_update_policy_v3"
  ON event_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "event_requests_delete_policy_v2" ON event_requests;
CREATE POLICY "event_requests_delete_policy_v3"
  ON event_requests
  FOR DELETE
  TO authenticated
  USING (true);