import { supabase, handleSupabaseError } from './supabase';
import type { 
  EventCategory, 
  EventTemplate, 
  Vendor, 
  EventAttachment, 
  EventTimeline, 
  Invoice, 
  InvoiceItem,
  UserPreferences,
  AuditLog,
  ActiveEventView,
  EventCategoryInsert,
  EventTemplateInsert,
  VendorInsert,
  EventAttachmentInsert,
  EventTimelineInsert,
  InvoiceInsert,
  InvoiceItemInsert,
  UserPreferencesInsert
} from '../types/supabase-enhanced';

// Event Categories
export async function getEventCategories(): Promise<EventCategory[]> {
  try {
    const { data, error } = await supabase
      .from('event_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch event categories:', error);
    return [];
  }
}

export async function createEventCategory(data: EventCategoryInsert): Promise<EventCategory> {
  const { data: result, error } = await supabase
    .from('event_categories')
    .insert(data)
    .select()
    .single();

  if (error) handleSupabaseError(error);
  return result;
}

export async function updateEventCategory(id: string, updates: Partial<EventCategory>): Promise<EventCategory> {
  const { data, error } = await supabase
    .from('event_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) handleSupabaseError(error);
  return data;
}

// Event Templates
export async function getEventTemplates(): Promise<EventTemplate[]> {
  try {
    const { data, error } = await supabase
      .from('event_templates')
      .select(`
        *,
        event_categories(name, color_code)
      `)
      .eq('is_active', true)
      .order('name');

    if (error) handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch event templates:', error);
    return [];
  }
}

export async function createEventTemplate(data: EventTemplateInsert): Promise<EventTemplate> {
  const { data: result, error } = await supabase
    .from('event_templates')
    .insert(data)
    .select()
    .single();

  if (error) handleSupabaseError(error);
  return result;
}

// Vendors
export async function getVendors(): Promise<Vendor[]> {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false });

    if (error) handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch vendors:', error);
    return [];
  }
}

export async function getVendorsByCategory(category: string): Promise<Vendor[]> {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('rating', { ascending: false });

    if (error) handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch vendors by category:', error);
    return [];
  }
}

export async function createVendor(data: VendorInsert): Promise<Vendor> {
  const { data: result, error } = await supabase
    .from('vendors')
    .insert(data)
    .select()
    .single();

  if (error) handleSupabaseError(error);
  return result;
}

export async function updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor> {
  const { data, error } = await supabase
    .from('vendors')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) handleSupabaseError(error);
  return data;
}

// Event Attachments
export async function getEventAttachments(eventId: string): Promise<EventAttachment[]> {
  try {
    const { data, error } = await supabase
      .from('event_attachments')
      .select('*')
      .eq('event_request_id', eventId)
      .order('created_at', { ascending: false });

    if (error) handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch event attachments:', error);
    return [];
  }
}

export async function createEventAttachment(data: EventAttachmentInsert): Promise<EventAttachment> {
  const { data: result, error } = await supabase
    .from('event_attachments')
    .insert(data)
    .select()
    .single();

  if (error) handleSupabaseError(error);
  return result;
}

export async function deleteEventAttachment(id: string): Promise<void> {
  const { error } = await supabase
    .from('event_attachments')
    .delete()
    .eq('id', id);

  if (error) handleSupabaseError(error);
}

// Event Timeline
export async function getEventTimeline(eventId: string): Promise<EventTimeline[]> {
  try {
    const { data, error } = await supabase
      .from('event_timeline')
      .select('*')
      .eq('event_request_id', eventId)
      .order('due_date');

    if (error) handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch event timeline:', error);
    return [];
  }
}

export async function createEventMilestone(data: EventTimelineInsert): Promise<EventTimeline> {
  const { data: result, error } = await supabase
    .from('event_timeline')
    .insert(data)
    .select()
    .single();

  if (error) handleSupabaseError(error);
  return result;
}

export async function updateEventMilestone(id: string, updates: Partial<EventTimeline>): Promise<EventTimeline> {
  const { data, error } = await supabase
    .from('event_timeline')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) handleSupabaseError(error);
  return data;
}

export async function completeEventMilestone(id: string): Promise<EventTimeline> {
  return updateEventMilestone(id, {
    is_completed: true,
    completed_at: new Date().toISOString()
  });
}

// Invoices
export async function getInvoices(): Promise<Invoice[]> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        event_requests(name, event_type, event_date)
      `)
      .order('created_at', { ascending: false });

    if (error) handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch invoices:', error);
    return [];
  }
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        event_requests(name, event_type, event_date, email, phone),
        invoice_items(*)
      `)
      .eq('id', id)
      .single();

    if (error) handleSupabaseError(error);
    return data;
  } catch (error) {
    console.error('Failed to fetch invoice:', error);
    return null;
  }
}

export async function createInvoice(data: Omit<InvoiceInsert, 'invoice_number'>): Promise<Invoice> {
  // Generate invoice number
  const { data: invoiceNumber, error: numberError } = await supabase
    .rpc('generate_invoice_number');

  if (numberError) handleSupabaseError(numberError);

  const { data: result, error } = await supabase
    .from('invoices')
    .insert({
      ...data,
      invoice_number: invoiceNumber
    })
    .select()
    .single();

  if (error) handleSupabaseError(error);
  return result;
}

export async function updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) handleSupabaseError(error);
  return data;
}

// Invoice Items
export async function createInvoiceItem(data: InvoiceItemInsert): Promise<InvoiceItem> {
  const { data: result, error } = await supabase
    .from('invoice_items')
    .insert(data)
    .select()
    .single();

  if (error) handleSupabaseError(error);
  return result;
}

export async function updateInvoiceItem(id: string, updates: Partial<InvoiceItem>): Promise<InvoiceItem> {
  const { data, error } = await supabase
    .from('invoice_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) handleSupabaseError(error);
  return data;
}

export async function deleteInvoiceItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('invoice_items')
    .delete()
    .eq('id', id);

  if (error) handleSupabaseError(error);
}

// User Preferences
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') handleSupabaseError(error);
    return data;
  } catch (error) {
    console.error('Failed to fetch user preferences:', error);
    return null;
  }
}

export async function createOrUpdateUserPreferences(data: UserPreferencesInsert): Promise<UserPreferences> {
  const { data: result, error } = await supabase
    .from('user_preferences')
    .upsert(data, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) handleSupabaseError(error);
  return result;
}

// Enhanced Event Views
export async function getActiveEventsView(): Promise<ActiveEventView[]> {
  try {
    const { data, error } = await supabase
      .from('active_events_view')
      .select('*')
      .order('event_date');

    if (error) handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch active events view:', error);
    return [];
  }
}

// Statistics and Analytics
export async function getEventStatistics(startDate?: string, endDate?: string): Promise<Record<string, any>> {
  try {
    const { data, error } = await supabase
      .rpc('get_event_statistics', {
        start_date: startDate,
        end_date: endDate
      });

    if (error) handleSupabaseError(error);
    return data || {};
  } catch (error) {
    console.error('Failed to fetch event statistics:', error);
    return {};
  }
}

// Search Functions
export async function searchEvents(query: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('event_requests')
      .select('*')
      .textSearch('search_vector', query)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Failed to search events:', error);
    return [];
  }
}

export async function searchContactMessages(query: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .textSearch('search_vector', query)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Failed to search contact messages:', error);
    return [];
  }
}

// Soft Delete Functions
export async function softDeleteRecord(tableName: string, recordId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('soft_delete_record', {
        table_name: tableName,
        record_id: recordId
      });

    if (error) handleSupabaseError(error);
    return data || false;
  } catch (error) {
    console.error('Failed to soft delete record:', error);
    return false;
  }
}

// Audit Logs
export async function getAuditLogs(tableName?: string, recordId?: string): Promise<AuditLog[]> {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('changed_at', { ascending: false })
      .limit(100);

    if (tableName) {
      query = query.eq('table_name', tableName);
    }

    if (recordId) {
      query = query.eq('record_id', recordId);
    }

    const { data, error } = await query;

    if (error) handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return [];
  }
}