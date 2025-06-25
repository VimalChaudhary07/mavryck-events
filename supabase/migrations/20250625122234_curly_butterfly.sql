/*
  # Fix RLS Policies and Database Issues

  1. Security Updates
    - Remove duplicate policies
    - Fix policy conflicts
    - Ensure proper access control for all operations

  2. Policy Fixes
    - Remove conflicting policies
    - Add proper INSERT/UPDATE/DELETE policies
    - Maintain security while allowing necessary operations
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can submit event requests" ON event_requests;
DROP POLICY IF EXISTS "Public can submit event requests" ON event_requests;
DROP POLICY IF EXISTS "Public can view event requests" ON event_requests;
DROP POLICY IF EXISTS "Authenticated users can view all event requests" ON event_requests;
DROP POLICY IF EXISTS "Authenticated users can update event requests" ON event_requests;
DROP POLICY IF EXISTS "Authenticated users can delete event requests" ON event_requests;

DROP POLICY IF EXISTS "Anyone can submit contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Public can submit contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Public can view contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can view all contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can update contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can delete contact messages" ON contact_messages;

DROP POLICY IF EXISTS "Anyone can view gallery items" ON gallery;
DROP POLICY IF EXISTS "Public can view gallery items" ON gallery;
DROP POLICY IF EXISTS "Anyone can insert gallery items" ON gallery;
DROP POLICY IF EXISTS "Authenticated users can insert gallery items" ON gallery;
DROP POLICY IF EXISTS "Authenticated users can update gallery items" ON gallery;
DROP POLICY IF EXISTS "Authenticated users can delete gallery items" ON gallery;
DROP POLICY IF EXISTS "Authenticated users can manage gallery items" ON gallery;

DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Public can view products" ON products;
DROP POLICY IF EXISTS "Anyone can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;

DROP POLICY IF EXISTS "Anyone can view testimonials" ON testimonials;
DROP POLICY IF EXISTS "Public can view testimonials" ON testimonials;
DROP POLICY IF EXISTS "Anyone can insert testimonials" ON testimonials;
DROP POLICY IF EXISTS "Authenticated users can insert testimonials" ON testimonials;
DROP POLICY IF EXISTS "Authenticated users can update testimonials" ON testimonials;
DROP POLICY IF EXISTS "Authenticated users can delete testimonials" ON testimonials;
DROP POLICY IF EXISTS "Authenticated users can manage testimonials" ON testimonials;

-- Event Requests Policies
CREATE POLICY "event_requests_insert_policy"
  ON event_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "event_requests_select_policy"
  ON event_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "event_requests_update_policy"
  ON event_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "event_requests_delete_policy"
  ON event_requests
  FOR DELETE
  TO authenticated
  USING (true);

-- Contact Messages Policies
CREATE POLICY "contact_messages_insert_policy"
  ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "contact_messages_select_policy"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "contact_messages_update_policy"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "contact_messages_delete_policy"
  ON contact_messages
  FOR DELETE
  TO authenticated
  USING (true);

-- Gallery Policies
CREATE POLICY "gallery_select_policy"
  ON gallery
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "gallery_insert_policy"
  ON gallery
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "gallery_update_policy"
  ON gallery
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "gallery_delete_policy"
  ON gallery
  FOR DELETE
  TO authenticated
  USING (true);

-- Products Policies
CREATE POLICY "products_select_policy"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "products_insert_policy"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "products_update_policy"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "products_delete_policy"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- Testimonials Policies
CREATE POLICY "testimonials_select_policy"
  ON testimonials
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "testimonials_insert_policy"
  ON testimonials
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "testimonials_update_policy"
  ON testimonials
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "testimonials_delete_policy"
  ON testimonials
  FOR DELETE
  TO authenticated
  USING (true);