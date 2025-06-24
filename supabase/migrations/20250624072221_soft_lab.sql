/*
  # Fix RLS policies for restore functionality

  1. Security Updates
    - Update RLS policies to allow anonymous users to insert data
    - This enables the restore functionality to work properly
    - Note: In production, consider implementing proper authentication for admin users

  2. Policy Changes
    - Allow anonymous users to insert into all tables
    - Maintain existing policies for other operations
    - Ensure data restoration works seamlessly

  3. Tables Updated
    - event_requests: Allow anon INSERT
    - contact_messages: Allow anon INSERT  
    - gallery: Allow anon INSERT
    - products: Allow anon INSERT
    - testimonials: Allow anon INSERT
*/

-- Update event_requests policies
-- The existing policy already allows anon INSERT, so no changes needed

-- Update contact_messages policies  
-- The existing policy already allows anon INSERT, so no changes needed

-- Update gallery policies
-- Need to add INSERT policy for anon users
DROP POLICY IF EXISTS "Authenticated users can manage gallery items" ON gallery;

CREATE POLICY "Anyone can insert gallery items"
  ON gallery
  FOR INSERT
  TO anon, authenticated
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

-- Update products policies
-- Need to add INSERT policy for anon users
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;

CREATE POLICY "Anyone can insert products"
  ON products
  FOR INSERT
  TO anon, authenticated
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

-- Update testimonials policies
-- Need to add INSERT policy for anon users
DROP POLICY IF EXISTS "Authenticated users can manage testimonials" ON testimonials;

CREATE POLICY "Anyone can insert testimonials"
  ON testimonials
  FOR INSERT
  TO anon, authenticated
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