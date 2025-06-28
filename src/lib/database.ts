import { supabase, handleSupabaseError } from './supabase';
import type { 
  EventRequest, 
  ContactMessage, 
  GalleryItem, 
  Product, 
  Testimonial,
  EventRequestInsert,
  ContactMessageInsert,
  GalleryItemInsert,
  ProductInsert,
  TestimonialInsert
} from '../types/supabase';

// Enhanced error handling for database operations
const handleDatabaseError = (error: any, operation: string) => {
  console.error(`Database ${operation} error:`, error);
  
  if (error?.code === '42501') {
    throw new Error(`Permission denied: ${error.message}`);
  }
  
  if (error?.code === 'PGRST116') {
    throw new Error('The result contains 0 rows');
  }
  
  throw new Error(error?.message || `Failed to ${operation}`);
};

// Wrapper for anonymous access operations (public forms)
const withAnonymousAccess = async <T>(
  operation: () => Promise<T>
): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    console.error('Anonymous access error:', error);
    handleDatabaseError(error, 'perform anonymous operation');
    throw error;
  }
};

// Wrapper for authenticated operations
const withAuth = async <T>(operation: () => Promise<T>): Promise<T> => {
  let retries = 3;
  
  while (retries > 0) {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication session error. Please log in again.');
      }
      
      if (!sessionData.session) {
        console.warn('No active session found, attempting to refresh...');
        
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData.session) {
          throw new Error('Authentication required. Please log in again.');
        }
      }
      
      return await operation();
    } catch (error: any) {
      console.error(`Database operation failed (${retries} retries left):`, error);
      
      if (retries === 1 || error?.message?.includes('Authentication')) {
        throw error;
      }
      
      retries--;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  throw new Error('Operation failed after multiple retries');
};

// Event Requests
export async function createEventRequest(data: EventRequestInsert): Promise<EventRequest> {
  return withAnonymousAccess(async () => {
    console.log('Creating event request with anonymous access:', data);
    
    // Validate required fields
    if (!data.name || !data.email || !data.phone || !data.event_type || !data.event_date || !data.guest_count) {
      throw new Error('All required fields must be provided');
    }
    
    const { data: result, error } = await supabase
      .from('event_requests')
      .insert({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        event_type: data.event_type,
        event_date: data.event_date,
        guest_count: data.guest_count,
        requirements: data.requirements?.trim() || '',
        status: data.status || 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Event request creation error:', error);
      handleSupabaseError(error, 'create event request');
    }
    
    if (!result) {
      throw new Error('Failed to create event request - no data returned');
    }
    
    console.log('Event request created successfully:', result);
    return result;
  });
}

export async function getEventRequests(): Promise<EventRequest[]> {
  return withAuth(async () => {
    const { data, error } = await supabase
      .from('event_requests')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch event requests:', error);
      handleSupabaseError(error, 'fetch event requests');
    }
    
    return data || [];
  });
}

export async function updateEventRequest(id: string, updates: Partial<EventRequest>): Promise<EventRequest> {
  return withAuth(async () => {
    console.log('Updating event request:', id, updates);
    
    const { data, error } = await supabase
      .from('event_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Event request update error:', error);
      handleSupabaseError(error, 'update event request');
    }
    
    return data;
  });
}

export async function deleteEventRequest(id: string): Promise<void> {
  return withAuth(async () => {
    console.log('Soft deleting event request:', id);
    
    const { error } = await supabase
      .from('event_requests')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Event request deletion error:', error);
      handleSupabaseError(error, 'delete event request');
    }
    
    console.log('Event request deleted successfully');
  });
}

// Contact Messages
export async function createContactMessage(data: ContactMessageInsert): Promise<ContactMessage> {
  return withAnonymousAccess(async () => {
    console.log('Creating contact message with anonymous access:', data);
    
    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      throw new Error('Name, email, and message are required');
    }
    
    const { data: result, error } = await supabase
      .from('contact_messages')
      .insert({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        message: data.message.trim(),
        viewed: data.viewed || false
      })
      .select()
      .single();

    if (error) {
      console.error('Contact message creation error:', error);
      handleSupabaseError(error, 'create contact message');
    }
    
    if (!result) {
      throw new Error('Failed to create contact message - no data returned');
    }
    
    console.log('Contact message created successfully:', result);
    return result;
  });
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  return withAuth(async () => {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch contact messages:', error);
      handleSupabaseError(error, 'fetch contact messages');
    }
    
    return data || [];
  });
}

export async function updateContactMessage(id: string, updates: Partial<ContactMessage>): Promise<ContactMessage> {
  return withAuth(async () => {
    console.log('Updating contact message:', id, updates);
    
    const { data, error } = await supabase
      .from('contact_messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Contact message update error:', error);
      handleSupabaseError(error, 'update contact message');
    }
    
    return data;
  });
}

export async function deleteContactMessage(id: string): Promise<void> {
  return withAuth(async () => {
    console.log('Soft deleting contact message:', id);
    
    const { error } = await supabase
      .from('contact_messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Contact message deletion error:', error);
      handleSupabaseError(error, 'delete contact message');
    }
    
    console.log('Contact message deleted successfully');
  });
}

// Gallery Items
export async function createGalleryItem(data: GalleryItemInsert): Promise<GalleryItem> {
  return withAuth(async () => {
    console.log('Creating gallery item:', data);
    
    const { data: result, error } = await supabase
      .from('gallery')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Gallery item creation error:', error);
      handleSupabaseError(error, 'create gallery item');
    }
    
    console.log('Gallery item created successfully:', result);
    return result;
  });
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch gallery items:', error);
      handleSupabaseError(error, 'fetch gallery items');
    }
    
    return data || [];
  } catch (error) {
    console.error('Failed to fetch gallery items:', error);
    return [];
  }
}

export async function updateGalleryItem(id: string, updates: Partial<GalleryItem>): Promise<GalleryItem> {
  return withAuth(async () => {
    console.log('Updating gallery item:', id, updates);
    
    const { data, error } = await supabase
      .from('gallery')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Gallery item update error:', error);
      handleSupabaseError(error, 'update gallery item');
    }
    
    if (!data) throw new Error('Gallery item not found');
    return data;
  });
}

export async function deleteGalleryItem(id: string): Promise<void> {
  return withAuth(async () => {
    console.log('Soft deleting gallery item:', id);
    
    const { error } = await supabase
      .from('gallery')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Gallery item deletion error:', error);
      handleSupabaseError(error, 'delete gallery item');
    }
    
    console.log('Gallery item deleted successfully');
  });
}

// Products
export async function createProduct(data: ProductInsert): Promise<Product> {
  return withAuth(async () => {
    console.log('Creating product:', data);
    
    const { data: result, error } = await supabase
      .from('products')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Product creation error:', error);
      handleSupabaseError(error, 'create product');
    }
    
    console.log('Product created successfully:', result);
    return result;
  });
}

export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch products:', error);
      handleSupabaseError(error, 'fetch products');
    }
    
    return data || [];
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  return withAuth(async () => {
    console.log('Updating product:', id, updates);
    
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Product update error:', error);
      handleSupabaseError(error, 'update product');
    }
    
    if (!data) throw new Error('Product not found');
    return data;
  });
}

export async function deleteProduct(id: string): Promise<void> {
  return withAuth(async () => {
    console.log('Soft deleting product:', id);
    
    const { error } = await supabase
      .from('products')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Product deletion error:', error);
      handleSupabaseError(error, 'delete product');
    }
    
    console.log('Product deleted successfully');
  });
}

// Testimonials
export async function createTestimonial(data: TestimonialInsert): Promise<Testimonial> {
  return withAuth(async () => {
    console.log('Creating testimonial:', data);
    
    const { data: result, error } = await supabase
      .from('testimonials')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Testimonial creation error:', error);
      handleSupabaseError(error, 'create testimonial');
    }
    
    console.log('Testimonial created successfully:', result);
    return result;
  });
}

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch testimonials:', error);
      handleSupabaseError(error, 'fetch testimonials');
    }
    
    return data || [];
  } catch (error) {
    console.error('Failed to fetch testimonials:', error);
    return [];
  }
}

export async function updateTestimonial(id: string, updates: Partial<Testimonial>): Promise<Testimonial> {
  return withAuth(async () => {
    console.log('Updating testimonial:', id, updates);
    
    const { data, error } = await supabase
      .from('testimonials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Testimonial update error:', error);
      handleSupabaseError(error, 'update testimonial');
    }
    
    if (!data) throw new Error('Testimonial not found');
    return data;
  });
}

export async function deleteTestimonial(id: string): Promise<void> {
  return withAuth(async () => {
    console.log('Soft deleting testimonial:', id);
    
    const { error } = await supabase
      .from('testimonials')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Testimonial deletion error:', error);
      handleSupabaseError(error, 'delete testimonial');
    }
    
    console.log('Testimonial deleted successfully');
  });
}

// Search functionality
export async function searchContactMessages(query: string): Promise<ContactMessage[]> {
  return withAuth(async () => {
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
  });
}

export async function searchEventRequests(query: string): Promise<EventRequest[]> {
  return withAuth(async () => {
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
  });
}

// Health check function
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('event_requests').select('count', { count: 'exact', head: true });
    return !error;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

// Test anonymous access function
export async function testAnonymousAccess(): Promise<{ canInsertContact: boolean; canInsertEvent: boolean }> {
  try {
    // Test contact message insertion
    let canInsertContact = false;
    try {
      const testContact = {
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message for anonymous access verification'
      };
      
      const { error: contactError } = await supabase
        .from('contact_messages')
        .insert(testContact)
        .select()
        .single();
        
      canInsertContact = !contactError;
      
      // Clean up test data if successful
      if (canInsertContact) {
        await supabase
          .from('contact_messages')
          .delete()
          .eq('email', 'test@example.com')
          .eq('message', 'Test message for anonymous access verification');
      }
    } catch (error) {
      console.warn('Contact message test failed:', error);
    }
    
    // Test event request insertion
    let canInsertEvent = false;
    try {
      const testEvent = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        event_type: 'corporate',
        event_date: new Date().toISOString().split('T')[0],
        guest_count: '50'
      };
      
      const { error: eventError } = await supabase
        .from('event_requests')
        .insert(testEvent)
        .select()
        .single();
        
      canInsertEvent = !eventError;
      
      // Clean up test data if successful
      if (canInsertEvent) {
        await supabase
          .from('event_requests')
          .delete()
          .eq('email', 'test@example.com')
          .eq('phone', '+1234567890');
      }
    } catch (error) {
      console.warn('Event request test failed:', error);
    }
    
    return { canInsertContact, canInsertEvent };
  } catch (error) {
    console.error('Anonymous access test failed:', error);
    return { canInsertContact: false, canInsertEvent: false };
  }
}