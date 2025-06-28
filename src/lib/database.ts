import { supabase } from './supabase';
import type { Database } from '../types/supabase';

type Tables = Database['public']['Tables'];
type ContactMessage = Tables['contact_messages']['Insert'];
type EventRequest = Tables['event_requests']['Insert'];
type GalleryItem = Tables['gallery']['Row'];
type Product = Tables['products']['Row'];
type Testimonial = Tables['testimonials']['Row'];

// Enhanced error handling for database operations
export const handleDatabaseError = (error: any, operation: string) => {
  console.error(`Database ${operation} error:`, error);
  
  if (error?.code === '42501') {
    throw new Error(`Permission denied: ${error.message}`);
  }
  
  if (error?.code === 'PGRST116') {
    throw new Error('The result contains 0 rows');
  }
  
  throw new Error(error?.message || `Failed to ${operation}`);
};

// Wrapper for anonymous access operations
export const withAnonymousAccess = async <T>(
  operation: () => Promise<T>
): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    console.error('Anonymous access error:', error);
    handleDatabaseError(error, 'perform anonymous operation');
    throw error; // This line won't be reached due to handleDatabaseError throwing
  }
};

// Contact Messages
export const createContactMessage = async (message: ContactMessage) => {
  return withAnonymousAccess(async () => {
    console.log('Creating contact message:', message);
    
    // Use the anon client explicitly for public operations
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([{
        name: message.name,
        email: message.email,
        message: message.message,
        viewed: false
      }])
      .select()
      .single();

    if (error) {
      console.error('Contact message creation error:', error);
      throw error;
    }

    console.log('Contact message created successfully:', data);
    return data;
  });
};

export const getContactMessages = async () => {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    handleDatabaseError(error, 'fetch contact messages');
  }

  return data || [];
};

export const markMessageAsViewed = async (id: string) => {
  const { data, error } = await supabase
    .from('contact_messages')
    .update({ viewed: true })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    handleDatabaseError(error, 'mark message as viewed');
  }

  return data;
};

export const deleteContactMessage = async (id: string) => {
  const { data, error } = await supabase
    .from('contact_messages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    handleDatabaseError(error, 'delete contact message');
  }

  return data;
};

// Event Requests
export const createEventRequest = async (request: EventRequest) => {
  return withAnonymousAccess(async () => {
    console.log('Creating event request:', request);
    
    // Use the anon client explicitly for public operations
    const { data, error } = await supabase
      .from('event_requests')
      .insert([{
        name: request.name,
        email: request.email,
        phone: request.phone,
        event_type: request.event_type,
        event_date: request.event_date,
        guest_count: request.guest_count,
        requirements: request.requirements || '',
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      console.error('Event request creation error:', error);
      throw error;
    }

    console.log('Event request created successfully:', data);
    return data;
  });
};

export const getEventRequests = async () => {
  const { data, error } = await supabase
    .from('event_requests')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    handleDatabaseError(error, 'fetch event requests');
  }

  return data || [];
};

export const updateEventRequestStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from('event_requests')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    handleDatabaseError(error, 'update event request status');
  }

  return data;
};

export const deleteEventRequest = async (id: string) => {
  const { data, error } = await supabase
    .from('event_requests')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    handleDatabaseError(error, 'delete event request');
  }

  return data;
};

// Gallery
export const getGalleryItems = async (): Promise<GalleryItem[]> => {
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    handleDatabaseError(error, 'fetch gallery items');
  }

  return data || [];
};

export const createGalleryItem = async (item: Omit<GalleryItem, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
  const { data, error } = await supabase
    .from('gallery')
    .insert([item])
    .select()
    .single();

  if (error) {
    handleDatabaseError(error, 'create gallery item');
  }

  return data;
};

export const updateGalleryItem = async (id: string, updates: Partial<GalleryItem>) => {
  const { data, error } = await supabase
    .from('gallery')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    handleDatabaseError(error, 'update gallery item');
  }

  return data;
};

export const deleteGalleryItem = async (id: string) => {
  const { data, error } = await supabase
    .from('gallery')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    handleDatabaseError(error, 'delete gallery item');
  }

  return data;
};

// Products
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    handleDatabaseError(error, 'fetch products');
  }

  return data || [];
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) {
    handleDatabaseError(error, 'create product');
  }

  return data;
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    handleDatabaseError(error, 'update product');
  }

  return data;
};

export const deleteProduct = async (id: string) => {
  const { data, error } = await supabase
    .from('products')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    handleDatabaseError(error, 'delete product');
  }

  return data;
};

// Testimonials
export const getTestimonials = async (): Promise<Testimonial[]> => {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    handleDatabaseError(error, 'fetch testimonials');
  }

  return data || [];
};

export const createTestimonial = async (testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
  const { data, error } = await supabase
    .from('testimonials')
    .insert([testimonial])
    .select()
    .single();

  if (error) {
    handleDatabaseError(error, 'create testimonial');
  }

  return data;
};

export const updateTestimonial = async (id: string, updates: Partial<Testimonial>) => {
  const { data, error } = await supabase
    .from('testimonials')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    handleDatabaseError(error, 'update testimonial');
  }

  return data;
};

export const deleteTestimonial = async (id: string) => {
  const { data, error } = await supabase
    .from('testimonials')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    handleDatabaseError(error, 'delete testimonial');
  }

  return data;
};

// Search functionality
export const searchContactMessages = async (query: string) => {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .textSearch('search_vector', query)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    handleDatabaseError(error, 'search contact messages');
  }

  return data || [];
};

export const searchEventRequests = async (query: string) => {
  const { data, error } = await supabase
    .from('event_requests')
    .select('*')
    .textSearch('search_vector', query)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    handleDatabaseError(error, 'search event requests');
  }

  return data || [];
};