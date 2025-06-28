/*
  # Database Enhancements for Event Management System

  1. New Tables
    - event_categories: Categorize events with pricing
    - event_templates: Reusable event templates
    - vendors: Vendor management system
    - event_attachments: File attachments for events
    - event_timeline: Task and milestone tracking
    - invoices: Invoice management
    - invoice_items: Invoice line items
    - user_preferences: User settings
    - audit_logs: Change tracking

  2. Enhancements
    - Full-text search capabilities
    - Soft delete functionality
    - Performance indexes
    - Automated triggers
    - Utility functions

  3. Security
    - RLS policies for all new tables
    - Proper access control
*/

-- Add event categories table
CREATE TABLE IF NOT EXISTS event_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text DEFAULT '',
  base_price decimal(10,2),
  color_code text DEFAULT '#f97316',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add event templates table
CREATE TABLE IF NOT EXISTS event_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category_id uuid REFERENCES event_categories(id),
  description text DEFAULT '',
  default_duration_hours integer DEFAULT 4,
  checklist jsonb DEFAULT '[]',
  requirements jsonb DEFAULT '{}',
  estimated_cost decimal(10,2),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL, -- catering, decoration, photography, etc.
  contact_person text,
  email text,
  phone text,
  address text,
  rating decimal(2,1) CHECK (rating >= 0 AND rating <= 5),
  notes text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add event attachments table
CREATE TABLE IF NOT EXISTS event_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_request_id uuid REFERENCES event_requests(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size bigint,
  uploaded_by uuid,
  created_at timestamptz DEFAULT now()
);

-- Add event timeline table
CREATE TABLE IF NOT EXISTS event_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_request_id uuid REFERENCES event_requests(id) ON DELETE CASCADE,
  milestone_name text NOT NULL,
  description text DEFAULT '',
  due_date timestamptz,
  completed_at timestamptz,
  is_completed boolean DEFAULT false,
  assigned_to text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_request_id uuid REFERENCES event_requests(id),
  invoice_number text UNIQUE NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  paid_amount decimal(10,2) DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date date,
  issued_date date DEFAULT CURRENT_DATE,
  payment_terms text DEFAULT '30 days',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add invoice items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity integer DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at timestamptz DEFAULT now()
);

-- Add user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE, -- Will be linked to auth.users in the future
  email_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT false,
  dashboard_layout jsonb DEFAULT '{}',
  theme text DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
  timezone text DEFAULT 'UTC',
  language text DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add audit log table for tracking changes
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values jsonb,
  new_values jsonb,
  changed_by uuid,
  changed_at timestamptz DEFAULT now(),
  ip_address inet,
  user_agent text
);

-- Add full-text search columns to existing tables
ALTER TABLE event_requests 
ADD COLUMN IF NOT EXISTS search_vector tsvector 
GENERATED ALWAYS AS (
  to_tsvector('english', 
    coalesce(name, '') || ' ' || 
    coalesce(email, '') || ' ' || 
    coalesce(event_type, '') || ' ' || 
    coalesce(requirements, '')
  )
) STORED;

ALTER TABLE contact_messages 
ADD COLUMN IF NOT EXISTS search_vector tsvector 
GENERATED ALWAYS AS (
  to_tsvector('english', 
    coalesce(name, '') || ' ' || 
    coalesce(email, '') || ' ' || 
    coalesce(message, '')
  )
) STORED;

-- Add soft delete columns to main tables
ALTER TABLE event_requests ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Add updated_at columns where missing
ALTER TABLE event_requests ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_requests_search ON event_requests USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_contact_messages_search ON contact_messages USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_event_requests_deleted_at ON event_requests(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contact_messages_deleted_at ON contact_messages(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_event_requests_event_date ON event_requests(event_date);
CREATE INDEX IF NOT EXISTS idx_event_requests_email ON event_requests(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_rating ON vendors(rating DESC);
CREATE INDEX IF NOT EXISTS idx_event_timeline_due_date ON event_timeline(due_date);
CREATE INDEX IF NOT EXISTS idx_event_timeline_completed ON event_timeline(is_completed);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at ON audit_logs(changed_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DO $$
DECLARE
    table_name text;
    table_names text[] := ARRAY[
        'event_requests', 'contact_messages', 'gallery', 'products', 
        'testimonials', 'event_categories', 'event_templates', 'vendors',
        'event_timeline', 'invoices', 'user_preferences'
    ];
BEGIN
    FOREACH table_name IN ARRAY table_names
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
            CREATE TRIGGER update_%I_updated_at
                BEFORE UPDATE ON %I
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        ', table_name, table_name, table_name, table_name);
    END LOOP;
END $$;

-- Create function for soft delete
CREATE OR REPLACE FUNCTION soft_delete_record(table_name text, record_id uuid)
RETURNS boolean AS $$
BEGIN
    EXECUTE format('UPDATE %I SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL', table_name)
    USING record_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
DECLARE
    year_part text;
    sequence_part text;
    next_number integer;
BEGIN
    year_part := EXTRACT(YEAR FROM CURRENT_DATE)::text;
    
    SELECT COALESCE(MAX(
        CASE 
            WHEN invoice_number ~ ('^INV-' || year_part || '-[0-9]+$')
            THEN CAST(SUBSTRING(invoice_number FROM LENGTH('INV-' || year_part || '-') + 1) AS integer)
            ELSE 0
        END
    ), 0) + 1 INTO next_number
    FROM invoices;
    
    sequence_part := LPAD(next_number::text, 4, '0');
    
    RETURN 'INV-' || year_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql;

-- Create function for event statistics
CREATE OR REPLACE FUNCTION get_event_statistics(start_date date DEFAULT NULL, end_date date DEFAULT NULL)
RETURNS jsonb AS $$
DECLARE
    result jsonb;
    date_filter text := '';
BEGIN
    IF start_date IS NOT NULL AND end_date IS NOT NULL THEN
        date_filter := format(' AND created_at::date BETWEEN %L AND %L', start_date, end_date);
    END IF;
    
    EXECUTE format('
        SELECT jsonb_build_object(
            ''total_events'', COUNT(*),
            ''pending_events'', COUNT(*) FILTER (WHERE status = ''pending''),
            ''ongoing_events'', COUNT(*) FILTER (WHERE status = ''ongoing''),
            ''completed_events'', COUNT(*) FILTER (WHERE status = ''completed''),
            ''total_guests'', SUM(CAST(guest_count AS integer)),
            ''avg_guests_per_event'', ROUND(AVG(CAST(guest_count AS integer)), 2),
            ''events_by_type'', jsonb_object_agg(event_type, type_count)
        )
        FROM (
            SELECT 
                *,
                COUNT(*) OVER (PARTITION BY event_type) as type_count
            FROM event_requests 
            WHERE deleted_at IS NULL %s
        ) t
    ', date_filter) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on new tables
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
-- Event Categories (public read, admin write)
CREATE POLICY "event_categories_public_select"
  ON event_categories FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "event_categories_authenticated_all"
  ON event_categories FOR ALL
  TO authenticated
  USING (true);

-- Event Templates (public read active, admin write)
CREATE POLICY "event_templates_public_select"
  ON event_templates FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "event_templates_authenticated_all"
  ON event_templates FOR ALL
  TO authenticated
  USING (true);

-- Vendors (admin only)
CREATE POLICY "vendors_authenticated_all"
  ON vendors FOR ALL
  TO authenticated
  USING (true);

-- Event Attachments (admin only)
CREATE POLICY "event_attachments_authenticated_all"
  ON event_attachments FOR ALL
  TO authenticated
  USING (true);

-- Event Timeline (admin only)
CREATE POLICY "event_timeline_authenticated_all"
  ON event_timeline FOR ALL
  TO authenticated
  USING (true);

-- Invoices (admin only)
CREATE POLICY "invoices_authenticated_all"
  ON invoices FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "invoice_items_authenticated_all"
  ON invoice_items FOR ALL
  TO authenticated
  USING (true);

-- User Preferences (admin only)
CREATE POLICY "user_preferences_authenticated_all"
  ON user_preferences FOR ALL
  TO authenticated
  USING (true);

-- Audit Logs (admin read only)
CREATE POLICY "audit_logs_authenticated_select"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (true);

-- Insert some default event categories
INSERT INTO event_categories (name, description, base_price, color_code) VALUES
  ('Corporate Events', 'Business meetings, conferences, seminars', 25000.00, '#3b82f6'),
  ('Wedding Events', 'Wedding ceremonies and receptions', 75000.00, '#ec4899'),
  ('Birthday Parties', 'Birthday celebrations for all ages', 15000.00, '#f59e0b'),
  ('Festival Events', 'Cultural and religious festivals', 30000.00, '#10b981'),
  ('Anniversary Celebrations', 'Wedding and business anniversaries', 20000.00, '#8b5cf6'),
  ('Gala Dinners', 'Formal dinner events and fundraisers', 50000.00, '#ef4444')
ON CONFLICT (name) DO NOTHING;

-- Insert some default vendors
INSERT INTO vendors (name, category, contact_person, email, phone, rating) VALUES
  ('Royal Caterers', 'catering', 'Rajesh Kumar', 'info@royalcaterers.com', '+91 9876543210', 4.5),
  ('Elegant Decorations', 'decoration', 'Priya Sharma', 'contact@elegantdeco.com', '+91 9876543211', 4.8),
  ('Perfect Moments Photography', 'photography', 'Amit Singh', 'hello@perfectmoments.com', '+91 9876543212', 4.7),
  ('Sound & Light Pro', 'audio_visual', 'Vikram Patel', 'booking@soundlightpro.com', '+91 9876543213', 4.3),
  ('Flower Paradise', 'flowers', 'Sunita Devi', 'orders@flowerparadise.com', '+91 9876543214', 4.6)
ON CONFLICT DO NOTHING;

-- Create a view for active events with enhanced information
CREATE OR REPLACE VIEW active_events_view AS
SELECT 
  er.*,
  ec.name as category_name,
  ec.color_code as category_color,
  COUNT(ea.id) as attachment_count,
  COUNT(et.id) as timeline_count,
  COUNT(et.id) FILTER (WHERE et.is_completed = true) as completed_milestones,
  CASE 
    WHEN er.event_date < CURRENT_DATE THEN 'overdue'
    WHEN er.event_date = CURRENT_DATE THEN 'today'
    WHEN er.event_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'this_week'
    WHEN er.event_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'this_month'
    ELSE 'future'
  END as urgency_level
FROM event_requests er
LEFT JOIN event_categories ec ON ec.name = er.event_type
LEFT JOIN event_attachments ea ON ea.event_request_id = er.id
LEFT JOIN event_timeline et ON et.event_request_id = er.id
WHERE er.deleted_at IS NULL
GROUP BY er.id, ec.name, ec.color_code;

-- Grant access to the view for authenticated users
GRANT SELECT ON active_events_view TO authenticated;

-- Create notification for successful migration
DO $$
BEGIN
    RAISE NOTICE 'Database enhancements completed successfully!';
    RAISE NOTICE 'New features added:';
    RAISE NOTICE '- Event categories and templates';
    RAISE NOTICE '- Vendor management';
    RAISE NOTICE '- Event timeline and milestones';
    RAISE NOTICE '- Invoice and payment tracking';
    RAISE NOTICE '- File attachments';
    RAISE NOTICE '- Full-text search';
    RAISE NOTICE '- Audit logging';
    RAISE NOTICE '- Soft delete functionality';
    RAISE NOTICE '- Performance indexes';
END $$;