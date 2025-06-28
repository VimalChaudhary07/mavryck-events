/*
  # Fix Contact Messages Anonymous Insert Policy

  1. Security Policy Updates
    - Drop existing conflicting policies for contact_messages
    - Create a clear policy allowing anonymous users to insert contact messages
    - Ensure authenticated users can perform all operations
    - Maintain read restrictions for authenticated users only

  2. Changes Made
    - Remove any conflicting anonymous insert policies
    - Add a simple, clear policy for anonymous INSERT operations
    - Keep existing authenticated user policies intact
*/

-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "contact_messages_anonymous_insert" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_messages_authenticated_insert" ON public.contact_messages;

-- Create a clear policy for anonymous users to insert contact messages
CREATE POLICY "Allow anonymous contact message submission"
  ON public.contact_messages
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create a policy for authenticated users to insert contact messages
CREATE POLICY "Allow authenticated contact message submission"
  ON public.contact_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure the existing SELECT policy for authenticated users remains
-- (This should already exist based on your schema, but let's make sure)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contact_messages' 
    AND policyname = 'contact_messages_authenticated_select'
  ) THEN
    CREATE POLICY "contact_messages_authenticated_select"
      ON public.contact_messages
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Ensure the existing UPDATE policy for authenticated users remains
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contact_messages' 
    AND policyname = 'contact_messages_authenticated_update'
  ) THEN
    CREATE POLICY "contact_messages_authenticated_update"
      ON public.contact_messages
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Ensure the existing DELETE policy for authenticated users remains
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contact_messages' 
    AND policyname = 'contact_messages_authenticated_delete'
  ) THEN
    CREATE POLICY "contact_messages_authenticated_delete"
      ON public.contact_messages
      FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;