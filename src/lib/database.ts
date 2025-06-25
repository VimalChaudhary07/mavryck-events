import { supabase, handleSupabaseError, withAuth } from './supabase';
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

// Event Requests
export async function createEventRequest(data: EventRequestInsert): Promise<EventRequest> {
  try {
    const { data: result, error } = await supabase
      .from('event_requests')
      .insert(data)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return result;
  } catch (error) {
    console.error('Failed to create event request:', error);
    handleSupabaseError(error);
    throw error;
  }
}

export async function getEventRequests(): Promise<EventRequest[]> {
  try {
    const { data, error } = await supabase
      .from('event_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch event requests:', error);
    return [];
  }
}

export async function updateEventRequest(id: string, updates: Partial<EventRequest>): Promise<EventRequest> {
  return withAuth(async () => {
    const { data, error } = await supabase
      .from('event_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return data;
  });
}

export async function deleteEventRequest(id: string): Promise<void> {
  return withAuth(async () => {
    const { error } = await supabase
      .from('event_requests')
      .delete()
      .eq('id', id);

    if (error) handleSupabaseError(error);
  });
}

// Contact Messages
export async function createContactMessage(data: ContactMessageInsert): Promise<ContactMessage> {
  try {
    const { data: result, error } = await supabase
      .from('contact_messages')
      .insert(data)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return result;
  } catch (error) {
    console.error('Failed to create contact message:', error);
    handleSupabaseError(error);
    throw error;
  }
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch contact messages:', error);
    return [];
  }
}

export async function updateContactMessage(id: string, updates: Partial<ContactMessage>): Promise<ContactMessage> {
  return withAuth(async () => {
    const { data, error } = await supabase
      .from('contact_messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return data;
  });
}

export async function deleteContactMessage(id: string): Promise<void> {
  return withAuth(async () => {
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) handleSupabaseError(error);
  });
}

// Gallery Items
export async function createGalleryItem(data: GalleryItemInsert): Promise<GalleryItem> {
  return withAuth(async () => {
    const { data: result, error } = await supabase
      .from('gallery')
      .insert(data)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return result;
  });
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch gallery items:', error);
    return [];
  }
}

export async function updateGalleryItem(id: string, updates: Partial<GalleryItem>): Promise<GalleryItem> {
  return withAuth(async () => {
    const { data, error } = await supabase
      .from('gallery')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle(); // Use maybeSingle instead of single to handle no results

    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Gallery item not found');
    return data;
  });
}

export async function deleteGalleryItem(id: string): Promise<void> {
  return withAuth(async () => {
    const { error } = await supabase
      .from('gallery')
      .delete()
      .eq('id', id);

    if (error) handleSupabaseError(error);
  });
}

// Products
export async function createProduct(data: ProductInsert): Promise<Product> {
  return withAuth(async () => {
    const { data: result, error } = await supabase
      .from('products')
      .insert(data)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return result;
  });
}

export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  return withAuth(async () => {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Product not found');
    return data;
  });
}

export async function deleteProduct(id: string): Promise<void> {
  return withAuth(async () => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) handleSupabaseError(error);
  });
}

// Testimonials
export async function createTestimonial(data: TestimonialInsert): Promise<Testimonial> {
  return withAuth(async () => {
    const { data: result, error } = await supabase
      .from('testimonials')
      .insert(data)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return result;
  });
}

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch testimonials:', error);
    return [];
  }
}

export async function updateTestimonial(id: string, updates: Partial<Testimonial>): Promise<Testimonial> {
  return withAuth(async () => {
    const { data, error } = await supabase
      .from('testimonials')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Testimonial not found');
    return data;
  });
}

export async function deleteTestimonial(id: string): Promise<void> {
  return withAuth(async () => {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) handleSupabaseError(error);
  });
}