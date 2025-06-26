/*
  # Fix RLS Policies and Database Issues

  1. Security Updates
    - Remove duplicate policies safely
    - Fix policy conflicts
    - Ensure proper access control for all operations

  2. Policy Fixes
    - Remove conflicting policies
    - Add proper INSERT/UPDATE/DELETE policies
    - Maintain security while allowing necessary operations
*/

-- Function to safely drop policies if they exist
DO $$
DECLARE
    policy_name TEXT;
    policy_names TEXT[] := ARRAY[
        'Anyone can submit event requests',
        'Public can submit event requests',
        'Public can view event requests',
        'Authenticated users can view all event requests',
        'Authenticated users can update event requests',
        'Authenticated users can delete event requests',
        'event_requests_insert_policy',
        'event_requests_select_policy',
        'event_requests_update_policy',
        'event_requests_delete_policy'
    ];
BEGIN
    FOREACH policy_name IN ARRAY policy_names
    LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON event_requests', policy_name);
        EXCEPTION WHEN OTHERS THEN
            -- Ignore errors if policy doesn't exist
            NULL;
        END;
    END LOOP;
END $$;

DO $$
DECLARE
    policy_name TEXT;
    policy_names TEXT[] := ARRAY[
        'Anyone can submit contact messages',
        'Public can submit contact messages',
        'Public can view contact messages',
        'Authenticated users can view all contact messages',
        'Authenticated users can update contact messages',
        'Authenticated users can delete contact messages',
        'contact_messages_insert_policy',
        'contact_messages_select_policy',
        'contact_messages_update_policy',
        'contact_messages_delete_policy'
    ];
BEGIN
    FOREACH policy_name IN ARRAY policy_names
    LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON contact_messages', policy_name);
        EXCEPTION WHEN OTHERS THEN
            -- Ignore errors if policy doesn't exist
            NULL;
        END;
    END LOOP;
END $$;

DO $$
DECLARE
    policy_name TEXT;
    policy_names TEXT[] := ARRAY[
        'Anyone can view gallery items',
        'Public can view gallery items',
        'Anyone can insert gallery items',
        'Authenticated users can insert gallery items',
        'Authenticated users can update gallery items',
        'Authenticated users can delete gallery items',
        'Authenticated users can manage gallery items',
        'gallery_select_policy',
        'gallery_insert_policy',
        'gallery_update_policy',
        'gallery_delete_policy'
    ];
BEGIN
    FOREACH policy_name IN ARRAY policy_names
    LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON gallery', policy_name);
        EXCEPTION WHEN OTHERS THEN
            -- Ignore errors if policy doesn't exist
            NULL;
        END;
    END LOOP;
END $$;

DO $$
DECLARE
    policy_name TEXT;
    policy_names TEXT[] := ARRAY[
        'Anyone can view products',
        'Public can view products',
        'Anyone can insert products',
        'Authenticated users can insert products',
        'Authenticated users can update products',
        'Authenticated users can delete products',
        'Authenticated users can manage products',
        'products_select_policy',
        'products_insert_policy',
        'products_update_policy',
        'products_delete_policy'
    ];
BEGIN
    FOREACH policy_name IN ARRAY policy_names
    LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON products', policy_name);
        EXCEPTION WHEN OTHERS THEN
            -- Ignore errors if policy doesn't exist
            NULL;
        END;
    END LOOP;
END $$;

DO $$
DECLARE
    policy_name TEXT;
    policy_names TEXT[] := ARRAY[
        'Anyone can view testimonials',
        'Public can view testimonials',
        'Anyone can insert testimonials',
        'Authenticated users can insert testimonials',
        'Authenticated users can update testimonials',
        'Authenticated users can delete testimonials',
        'Authenticated users can manage testimonials',
        'testimonials_select_policy',
        'testimonials_insert_policy',
        'testimonials_update_policy',
        'testimonials_delete_policy'
    ];
BEGIN
    FOREACH policy_name IN ARRAY policy_names
    LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON testimonials', policy_name);
        EXCEPTION WHEN OTHERS THEN
            -- Ignore errors if policy doesn't exist
            NULL;
        END;
    END LOOP;
END $$;

-- Now create the policies with unique names to avoid conflicts
-- Event Requests Policies
CREATE POLICY "event_requests_insert_policy_v2"
  ON event_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "event_requests_select_policy_v2"
  ON event_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "event_requests_update_policy_v2"
  ON event_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "event_requests_delete_policy_v2"
  ON event_requests
  FOR DELETE
  TO authenticated
  USING (true);

-- Contact Messages Policies
CREATE POLICY "contact_messages_insert_policy_v2"
  ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "contact_messages_select_policy_v2"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "contact_messages_update_policy_v2"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "contact_messages_delete_policy_v2"
  ON contact_messages
  FOR DELETE
  TO authenticated
  USING (true);

-- Gallery Policies
CREATE POLICY "gallery_select_policy_v2"
  ON gallery
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "gallery_insert_policy_v2"
  ON gallery
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "gallery_update_policy_v2"
  ON gallery
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "gallery_delete_policy_v2"
  ON gallery
  FOR DELETE
  TO authenticated
  USING (true);

-- Products Policies
CREATE POLICY "products_select_policy_v2"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "products_insert_policy_v2"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "products_update_policy_v2"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "products_delete_policy_v2"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- Testimonials Policies
CREATE POLICY "testimonials_select_policy_v2"
  ON testimonials
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "testimonials_insert_policy_v2"
  ON testimonials
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "testimonials_update_policy_v2"
  ON testimonials
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "testimonials_delete_policy_v2"
  ON testimonials
  FOR DELETE
  TO authenticated
  USING (true);