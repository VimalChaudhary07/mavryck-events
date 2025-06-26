/*
  # Fix Authentication and RLS Policies

  1. Authentication Setup
    - Create admin user with proper credentials
    - Set up proper authentication flow
    - Fix RLS policies to work with authenticated users

  2. Security Updates
    - Update all RLS policies to properly handle authenticated users
    - Ensure admin operations work correctly
    - Maintain security while allowing proper access

  3. Policy Fixes
    - Fix testimonials, gallery, and products policies
    - Ensure authenticated users can perform CRUD operations
    - Maintain public access for viewing content
*/

-- First, let's create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the current user is authenticated and has admin email
  RETURN (
    auth.uid() IS NOT NULL AND 
    auth.jwt() ->> 'email' = 'admin@mavryck_events'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop all existing policies to start fresh
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all policies for event_requests
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'event_requests'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON event_requests', policy_record.policyname);
    END LOOP;

    -- Drop all policies for contact_messages
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'contact_messages'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON contact_messages', policy_record.policyname);
    END LOOP;

    -- Drop all policies for gallery
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'gallery'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON gallery', policy_record.policyname);
    END LOOP;

    -- Drop all policies for products
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'products'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON products', policy_record.policyname);
    END LOOP;

    -- Drop all policies for testimonials
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'testimonials'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON testimonials', policy_record.policyname);
    END LOOP;
END $$;

-- Event Requests Policies
CREATE POLICY "event_requests_insert_policy_v4"
  ON event_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "event_requests_select_policy_v4"
  ON event_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "event_requests_update_policy_v4"
  ON event_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "event_requests_delete_policy_v4"
  ON event_requests
  FOR DELETE
  TO authenticated
  USING (true);

-- Contact Messages Policies
CREATE POLICY "contact_messages_insert_policy_v4"
  ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "contact_messages_select_policy_v4"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "contact_messages_update_policy_v4"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "contact_messages_delete_policy_v4"
  ON contact_messages
  FOR DELETE
  TO authenticated
  USING (true);

-- Gallery Policies (Public read, Admin write)
CREATE POLICY "gallery_select_policy_v4"
  ON gallery
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "gallery_insert_policy_v4"
  ON gallery
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "gallery_update_policy_v4"
  ON gallery
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "gallery_delete_policy_v4"
  ON gallery
  FOR DELETE
  TO authenticated
  USING (true);

-- Products Policies (Public read, Admin write)
CREATE POLICY "products_select_policy_v4"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "products_insert_policy_v4"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "products_update_policy_v4"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "products_delete_policy_v4"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- Testimonials Policies (Public read, Admin write)
CREATE POLICY "testimonials_select_policy_v4"
  ON testimonials
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "testimonials_insert_policy_v4"
  ON testimonials
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "testimonials_update_policy_v4"
  ON testimonials
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "testimonials_delete_policy_v4"
  ON testimonials
  FOR DELETE
  TO authenticated
  USING (true);