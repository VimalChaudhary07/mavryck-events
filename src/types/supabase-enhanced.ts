// Enhanced TypeScript types for the new database schema

export interface EventCategory {
  id: string;
  name: string;
  description: string;
  base_price: number;
  color_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventTemplate {
  id: string;
  name: string;
  category_id: string;
  description: string;
  default_duration_hours: number;
  checklist: any[];
  requirements: Record<string, any>;
  estimated_cost: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventAttachment {
  id: string;
  event_request_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
}

export interface EventTimeline {
  id: string;
  event_request_id: string;
  milestone_name: string;
  description: string;
  due_date: string;
  completed_at: string | null;
  is_completed: boolean;
  assigned_to: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  event_request_id: string;
  invoice_number: string;
  total_amount: number;
  paid_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  issued_date: string;
  payment_terms: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  dashboard_layout: Record<string, any>;
  theme: 'light' | 'dark' | 'auto';
  timezone: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  changed_by: string;
  changed_at: string;
  ip_address: string;
  user_agent: string;
}

export interface ActiveEventView {
  id: string;
  name: string;
  email: string;
  phone: string;
  event_type: string;
  event_date: string;
  guest_count: string;
  requirements: string;
  status: 'pending' | 'ongoing' | 'completed';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  category_name: string;
  category_color: string;
  attachment_count: number;
  timeline_count: number;
  completed_milestones: number;
  urgency_level: 'overdue' | 'today' | 'this_week' | 'this_month' | 'future';
}

// Enhanced database interface
export interface EnhancedDatabase {
  public: {
    Tables: {
      event_categories: {
        Row: EventCategory;
        Insert: Omit<EventCategory, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<EventCategory, 'id' | 'created_at' | 'updated_at'>>;
      };
      event_templates: {
        Row: EventTemplate;
        Insert: Omit<EventTemplate, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<EventTemplate, 'id' | 'created_at' | 'updated_at'>>;
      };
      vendors: {
        Row: Vendor;
        Insert: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Vendor, 'id' | 'created_at' | 'updated_at'>>;
      };
      event_attachments: {
        Row: EventAttachment;
        Insert: Omit<EventAttachment, 'id' | 'created_at'>;
        Update: Partial<Omit<EventAttachment, 'id' | 'created_at'>>;
      };
      event_timeline: {
        Row: EventTimeline;
        Insert: Omit<EventTimeline, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<EventTimeline, 'id' | 'created_at' | 'updated_at'>>;
      };
      invoices: {
        Row: Invoice;
        Insert: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Invoice, 'id' | 'created_at' | 'updated_at'>>;
      };
      invoice_items: {
        Row: InvoiceItem;
        Insert: Omit<InvoiceItem, 'id' | 'total_price' | 'created_at'>;
        Update: Partial<Omit<InvoiceItem, 'id' | 'total_price' | 'created_at'>>;
      };
      user_preferences: {
        Row: UserPreferences;
        Insert: Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'>>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'changed_at'>;
        Update: never; // Audit logs should not be updated
      };
    };
    Views: {
      active_events_view: {
        Row: ActiveEventView;
      };
    };
    Functions: {
      get_event_statistics: {
        Args: { start_date?: string; end_date?: string };
        Returns: Record<string, any>;
      };
      generate_invoice_number: {
        Args: {};
        Returns: string;
      };
      soft_delete_record: {
        Args: { table_name: string; record_id: string };
        Returns: boolean;
      };
    };
  };
}

// Export enhanced types for easier usage
export type EventCategoryInsert = EnhancedDatabase['public']['Tables']['event_categories']['Insert'];
export type EventTemplateInsert = EnhancedDatabase['public']['Tables']['event_templates']['Insert'];
export type VendorInsert = EnhancedDatabase['public']['Tables']['vendors']['Insert'];
export type EventAttachmentInsert = EnhancedDatabase['public']['Tables']['event_attachments']['Insert'];
export type EventTimelineInsert = EnhancedDatabase['public']['Tables']['event_timeline']['Insert'];
export type InvoiceInsert = EnhancedDatabase['public']['Tables']['invoices']['Insert'];
export type InvoiceItemInsert = EnhancedDatabase['public']['Tables']['invoice_items']['Insert'];
export type UserPreferencesInsert = EnhancedDatabase['public']['Tables']['user_preferences']['Insert'];