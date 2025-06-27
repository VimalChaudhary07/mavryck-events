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

// Helper function for anonymous operations (no auth required)
async function withAnonymousAccess<T>(operation: () => Promise<T>): Promise<T> {
  try {
    // For anonymous operations, we don't need any authentication
    // Just execute the operation directly
    return await operation();
  } catch (error: any) {
    console.error('Anonymous operation failed:', error);
    
    // If it's an RLS error, provide helpful message
    if (error?.code === '42501') {
      if (error?.message?.includes('contact_messages')) {
        throw new Error('Unable to send message. Please try refreshing the page or contact us directly at mavryckevents@gmail.com');
      }
      if (error?.message?.includes('event_requests')) {
        throw new Error('Unable to submit event request. Please try refreshing the page or contact us directly at mavryckevents@gmail.com');
      }
    }
    
    throw error;
  }
}

// Helper function for authenticated operations with better error handling
async function withAuth<T>(operation: () => Promise<T>): Promise<T> {
  let retries = 3;
  
  while (retries > 0) {
    try {
      // Check if we have a valid session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication session error. Please log in again.');
      }
      
      if (!sessionData.session) {
        console.warn('No active session found, attempting to refresh...');
        
        // Try to refresh the session
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
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  throw new Error('Operation failed after multiple retries');
}

// Event Requests
export async function createEventRequest(data: EventRequestInsert): Promise<EventRequest> {
  return withAnonymousAccess(async () => {
    console.log('Creating event request:', data);
    
    // Clear any existing session that might interfere with anonymous access
    try {
      const { data: session } = await supabase.auth.getSession();
      if (session.session) {
        console.log('Clearing existing session for anonymous operation');
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.warn('Could not clear session, continuing with operation:', error);
    }
    
    const { data: result, error } = await supabase
      .from('event_requests')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Event request creation error:', error);
      handleSupabaseError(error);
    }
    
    console.log('Event request created successfully:', result);
    return result;
  });
}

export async function getEventRequests(): Promise<EventRequest[]> {
  try {
    const { data, error } = await supabase
      .from('event_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch event requests:', error);
      handleSupabaseError(error);
    }
    
    return data || [];
  } catch (error) {
    console.error('Failed to fetch event requests:', error);
    return [];
  }
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
      handleSupabaseError(error);
    }
    
    return data;
  });
}

export async function deleteEventRequest(id: string): Promise<void> {
  return withAuth(async () => {
    console.log('Deleting event request:', id);
    
    const { error } = await supabase
      .from('event_requests')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Event request deletion error:', error);
      handleSupabaseError(error);
    }
    
    console.log('Event request deleted successfully');
  });
}

// Contact Messages
export async function createContactMessage(data: ContactMessageInsert): Promise<ContactMessage> {
  return withAnonymousAccess(async () => {
    console.log('Creating contact message:', data);
    
    // Clear any existing session that might interfere with anonymous access
    try {
      const { data: session } = await supabase.auth.getSession();
      if (session.session) {
        console.log('Clearing existing session for anonymous operation');
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.warn('Could not clear session, continuing with operation:', error);
    }
    
    const { data: result, error } = await supabase
      .from('contact_messages')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Contact message creation error:', error);
      handleSupabaseError(error);
    }
    
    console.log('Contact message created successfully:', result);
    return result;
  });
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch contact messages:', error);
      handleSupabaseError(error);
    }
    
    return data || [];
  } catch (error) {
    console.error('Failed to fetch contact messages:', error);
    return [];
  }
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
      handleSupabaseError(error);
    }
    
    return data;
  });
}

export async function deleteContactMessage(id: string): Promise<void> {
  return withAuth(async () => {
    console.log('Deleting contact message:', id);
    
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Contact message deletion error:', error);
      handleSupabaseError(error);
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
      handleSupabaseError(error);
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
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch gallery items:', error);
      handleSupabaseError(error);
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
      handleSupabaseError(error);
    }
    
    if (!data) throw new Error('Gallery item not found');
    return data;
  });
}

export async function deleteGalleryItem(id: string): Promise<void> {
  return withAuth(async () => {
    console.log('Deleting gallery item:', id);
    
    const { error } = await supabase
      .from('gallery')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Gallery item deletion error:', error);
      handleSupabaseError(error);
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
      handleSupabaseError(error);
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
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch products:', error);
      handleSupabaseError(error);
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
      handleSupabaseError(error);
    }
    
    if (!data) throw new Error('Product not found');
    return data;
  });
}

export async function deleteProduct(id: string): Promise<void> {
  return withAuth(async () => {
    console.log('Deleting product:', id);
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Product deletion error:', error);
      handleSupabaseError(error);
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
      handleSupabaseError(error);
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
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch testimonials:', error);
      handleSupabaseError(error);
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
      handleSupabaseError(error);
    }
    
    if (!data) throw new Error('Testimonial not found');
    return data;
  });
}

export async function deleteTestimonial(id: string): Promise<void> {
  return withAuth(async () => {
    console.log('Deleting testimonial:', id);
    
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Testimonial deletion error:', error);
      handleSupabaseError(error);
    }
    
    console.log('Testimonial deleted successfully');
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