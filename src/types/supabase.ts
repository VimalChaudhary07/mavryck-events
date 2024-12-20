export interface Database {
  public: {
    Tables: {
      contact_messages: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string
          message: string
        }
        Insert: {
          name: string
          email: string
          message: string
        }
      }
      event_requests: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string
          phone: string
          eventType: string
          date: string
          guestCount: string
          requirements: string
        }
        Insert: {
          name: string
          email: string
          phone: string
          eventType: string
          date: string
          guestCount: string
          requirements: string
        }
      }
      gallery: {
        Row: {
          id: string
          created_at: string
          title: string
          image_url: string
          description?: string
        }
        Insert: {
          title: string
          image_url: string
          description?: string
        }
      }
      products: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string
          price?: number
          image_url: string
        }
        Insert: {
          name: string
          description: string
          price?: number
          image_url: string
        }
      }
    }
  }
}