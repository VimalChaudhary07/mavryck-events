export interface Database {
  public: {
    Tables: {
      event_requests: {
        Row: {
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
        };
        Insert: {
          name: string;
          email: string;
          phone: string;
          event_type: string;
          event_date: string;
          guest_count: string;
          requirements?: string;
          status?: 'pending' | 'ongoing' | 'completed';
        };
        Update: {
          name?: string;
          email?: string;
          phone?: string;
          event_type?: string;
          event_date?: string;
          guest_count?: string;
          requirements?: string;
          status?: 'pending' | 'ongoing' | 'completed';
        };
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          message: string;
          viewed: boolean;
          created_at: string;
        };
        Insert: {
          name: string;
          email: string;
          message: string;
          viewed?: boolean;
        };
        Update: {
          name?: string;
          email?: string;
          message?: string;
          viewed?: boolean;
        };
      };
      gallery: {
        Row: {
          id: string;
          title: string;
          image_url: string;
          category: 'Corporate' | 'Wedding' | 'Birthday' | 'Festival' | 'Gala' | 'Anniversary';
          description: string;
          created_at: string;
        };
        Insert: {
          title: string;
          image_url: string;
          category: 'Corporate' | 'Wedding' | 'Birthday' | 'Festival' | 'Gala' | 'Anniversary';
          description?: string;
        };
        Update: {
          title?: string;
          image_url?: string;
          category?: 'Corporate' | 'Wedding' | 'Birthday' | 'Festival' | 'Gala' | 'Anniversary';
          description?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          price: string;
          image_url: string;
          created_at: string;
        };
        Insert: {
          name: string;
          description: string;
          price: string;
          image_url: string;
        };
        Update: {
          name?: string;
          description?: string;
          price?: string;
          image_url?: string;
        };
      };
      testimonials: {
        Row: {
          id: string;
          name: string;
          role: string;
          content: string;
          rating: number;
          avatar_url: string;
          created_at: string;
        };
        Insert: {
          name: string;
          role: string;
          content: string;
          rating: number;
          avatar_url: string;
        };
        Update: {
          name?: string;
          role?: string;
          content?: string;
          rating?: number;
          avatar_url?: string;
        };
      };
    };
  };
}

// Type helpers for easier usage
export type EventRequest = Database['public']['Tables']['event_requests']['Row'];
export type ContactMessage = Database['public']['Tables']['contact_messages']['Row'];
export type GalleryItem = Database['public']['Tables']['gallery']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Testimonial = Database['public']['Tables']['testimonials']['Row'];

export type EventRequestInsert = Database['public']['Tables']['event_requests']['Insert'];
export type ContactMessageInsert = Database['public']['Tables']['contact_messages']['Insert'];
export type GalleryItemInsert = Database['public']['Tables']['gallery']['Insert'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type TestimonialInsert = Database['public']['Tables']['testimonials']['Insert'];