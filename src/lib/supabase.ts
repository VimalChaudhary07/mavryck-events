import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'mavryck-events-app'
    }
  }
});

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any) {
  console.error('Supabase error:', error);
  
  // Handle specific error types
  if (error?.code === 'PGRST116') {
    throw new Error('Record not found or no data returned');
  }
  
  if (error?.code === '42501') {
    throw new Error('Permission denied. Please check your access rights.');
  }
  
  if (error?.message) {
    throw new Error(error.message);
  }
  
  throw new Error('An unexpected database error occurred');
}

// Helper function for authenticated operations
export async function withAuth<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error('Database operation failed:', error);
    throw error;
  }
}