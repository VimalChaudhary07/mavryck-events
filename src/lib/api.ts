// API utility functions for making requests to the backend
const API_BASE = '/api';

interface APIResponse<T> {
  data?: T;
  error?: string;
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return { data };
  } catch (error) {
    console.error('API Error:', error);
    return { 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

export const api = {
  // Events
  createEvent: (data: any) => fetchAPI('/events', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getEvents: () => fetchAPI('/events'),
  deleteEvent: (id: string) => fetchAPI(`/events/${id}`, {
    method: 'DELETE',
  }),

  // Messages
  createMessage: (data: any) => fetchAPI('/messages', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getMessages: () => fetchAPI('/messages'),
  deleteMessage: (id: string) => fetchAPI(`/messages/${id}`, {
    method: 'DELETE',
  }),

  // Gallery
  createGalleryItem: (data: any) => fetchAPI('/gallery', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getGallery: () => fetchAPI('/gallery'),
  deleteGalleryItem: (id: string) => fetchAPI(`/gallery/${id}`, {
    method: 'DELETE',
  }),

  // Products
  createProduct: (data: any) => fetchAPI('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getProducts: () => fetchAPI('/products'),
  deleteProduct: (id: string) => fetchAPI(`/products/${id}`, {
    method: 'DELETE',
  }),

  // Testimonials
  createTestimonial: (data: any) => fetchAPI('/testimonials', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getTestimonials: () => fetchAPI('/testimonials'),
  deleteTestimonial: (id: string) => fetchAPI(`/testimonials/${id}`, {
    method: 'DELETE',
  }),
};