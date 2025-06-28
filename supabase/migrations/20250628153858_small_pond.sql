/*
  # Create Site Settings Table for Google Photos URL Storage

  1. New Table
    - `site_settings`
      - `id` (uuid, primary key)
      - `google_photos_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on site_settings table
    - Add policies for authenticated users to manage settings
    - Ensure only authenticated users can read/write settings

  3. Triggers
    - Add updated_at trigger for automatic timestamp updates
*/

-- Create the site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  google_photos_url text DEFAULT 'https://photos.google.com/share/your-album-link',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users only
CREATE POLICY "site_settings_authenticated_select"
  ON site_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "site_settings_authenticated_insert"
  ON site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "site_settings_authenticated_update"
  ON site_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "site_settings_authenticated_delete"
  ON site_settings
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings if none exist
INSERT INTO site_settings (google_photos_url)
SELECT 'https://photos.google.com/share/your-album-link'
WHERE NOT EXISTS (SELECT 1 FROM site_settings);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_site_settings_created_at ON site_settings(created_at DESC);