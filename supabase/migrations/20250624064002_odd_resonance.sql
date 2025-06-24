/*
  # Create Events Management Schema

  1. New Tables
    - `event_requests`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `event_type` (text)
      - `event_date` (date)
      - `guest_count` (text)
      - `requirements` (text)
      - `status` (text, default 'pending')
      - `created_at` (timestamp)
    
    - `contact_messages`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `message` (text)
      - `viewed` (boolean, default false)
      - `created_at` (timestamp)
    
    - `gallery`
      - `id` (uuid, primary key)
      - `title` (text)
      - `image_url` (text)
      - `category` (text)
      - `description` (text)
      - `created_at` (timestamp)
    
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (text)
      - `image_url` (text)
      - `created_at` (timestamp)
    
    - `testimonials`
      - `id` (uuid, primary key)
      - `name` (text)
      - `role` (text)
      - `content` (text)
      - `rating` (integer, 1-5)
      - `avatar_url` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage data
    - Add policies for anonymous users to submit event requests and contact messages
*/

-- Create event_requests table
CREATE TABLE IF NOT EXISTS event_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  event_type text NOT NULL,
  event_date date NOT NULL,
  guest_count text NOT NULL,
  requirements text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'ongoing', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  viewed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  category text NOT NULL CHECK (category IN ('Corporate', 'Wedding', 'Birthday', 'Festival', 'Gala', 'Anniversary')),
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  avatar_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE event_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Policies for event_requests
CREATE POLICY "Anyone can submit event requests"
  ON event_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all event requests"
  ON event_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update event requests"
  ON event_requests
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete event requests"
  ON event_requests
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies for contact_messages
CREATE POLICY "Anyone can submit contact messages"
  ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all contact messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update contact messages"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete contact messages"
  ON contact_messages
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies for gallery
CREATE POLICY "Anyone can view gallery items"
  ON gallery
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage gallery items"
  ON gallery
  FOR ALL
  TO authenticated
  USING (true);

-- Policies for products
CREATE POLICY "Anyone can view products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (true);

-- Policies for testimonials
CREATE POLICY "Anyone can view testimonials"
  ON testimonials
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage testimonials"
  ON testimonials
  FOR ALL
  TO authenticated
  USING (true);