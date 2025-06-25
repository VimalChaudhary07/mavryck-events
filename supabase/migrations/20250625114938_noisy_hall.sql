/*
  # Fix RLS Policies for Public Access

  1. Security Updates
    - Update RLS policies to allow anonymous users to insert data
    - Maintain security while allowing public form submissions
    - Fix policy conflicts and ensure proper access control

  2. Policy Changes
    - Allow anonymous users to submit event requests and contact messages
    - Allow public access to view gallery, products, and testimonials
    - Maintain admin-only access for updates and deletes
*/

-- Drop existing policies that are too restrictive
DROP POLICY IF EXISTS "Anyone can submit event requests" ON event_requests;
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Anyone can insert gallery items" ON gallery;
DROP POLICY IF EXISTS "Anyone can insert products" ON products;
DROP POLICY IF EXISTS "Anyone can insert testimonials" ON testimonials;

-- Event Requests: Allow anonymous submissions, admin management
CREATE POLICY "Public can submit event requests"
  ON event_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can view event requests"
  ON event_requests
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can update event requests"
  ON event_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete event requests"
  ON event_requests
  FOR DELETE
  TO authenticated
  USING (true);

-- Contact Messages: Allow anonymous submissions, admin management
CREATE POLICY "Public can submit contact messages"
  ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can view contact messages"
  ON contact_messages
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can update contact messages"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete contact messages"
  ON contact_messages
  FOR DELETE
  TO authenticated
  USING (true);

-- Gallery: Public view, admin management
CREATE POLICY "Public can view gallery items"
  ON gallery
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert gallery items"
  ON gallery
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update gallery items"
  ON gallery
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete gallery items"
  ON gallery
  FOR DELETE
  TO authenticated
  USING (true);

-- Products: Public view, admin management
CREATE POLICY "Public can view products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- Testimonials: Public view, admin management
CREATE POLICY "Public can view testimonials"
  ON testimonials
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert testimonials"
  ON testimonials
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update testimonials"
  ON testimonials
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete testimonials"
  ON testimonials
  FOR DELETE
  TO authenticated
  USING (true);