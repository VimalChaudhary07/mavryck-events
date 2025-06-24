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
    handleSupabaseError(error);
    return [];
  }
}

export async function updateEventRequest(id: string, updates: Partial<EventRequest>): Promise<EventRequest> {
  try {
    const { data, error } = await supabase
      .from('event_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return data;
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
}

export async function deleteEventRequest(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('event_requests')
      .delete()
      .eq('id', id);

    if (error) handleSupabaseError(error);
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
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
    handleSupabaseError(error);
    return [];
  }
}

export async function updateContactMessage(id: string, updates: Partial<ContactMessage>): Promise<ContactMessage> {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return data;
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
}

export async function deleteContactMessage(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) handleSupabaseError(error);
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
}

// Gallery Items
export async function createGalleryItem(data: GalleryItemInsert): Promise<GalleryItem> {
  try {
    const { data: result, error } = await supabase
      .from('gallery')
      .insert(data)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return result;
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
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
    handleSupabaseError(error);
    return [];
  }
}

export async function updateGalleryItem(id: string, updates: Partial<GalleryItem>): Promise<GalleryItem> {
  try {
    const { data, error } = await supabase
      .from('gallery')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return data;
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
}

export async function deleteGalleryItem(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('gallery')
      .delete()
      .eq('id', id);

    if (error) handleSupabaseError(error);
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
}

// Products
export async function createProduct(data: ProductInsert): Promise<Product> {
  try {
    const { data: result, error } = await supabase
      .from('products')
      .insert(data)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return result;
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
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
    handleSupabaseError(error);
    return [];
  }
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return data;
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) handleSupabaseError(error);
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
}

// Testimonials
export async function createTestimonial(data: TestimonialInsert): Promise<Testimonial> {
  try {
    const { data: result, error } = await supabase
      .from('testimonials')
      .insert(data)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return result;
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
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
    handleSupabaseError(error);
    return [];
  }
}

export async function updateTestimonial(id: string, updates: Partial<Testimonial>): Promise<Testimonial> {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return data;
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
}

export async function deleteTestimonial(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) handleSupabaseError(error);
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
}