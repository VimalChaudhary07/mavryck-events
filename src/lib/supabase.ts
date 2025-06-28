import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create the main Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'mavryck-events-app'
    }
  }
});

// Enhanced error handling for Supabase operations
export const handleSupabaseError = (error: any, operation: string = 'operation') => {
  console.error(`Supabase ${operation} error:`, error);
  
  // Handle specific error codes
  if (error?.code === '42501') {
    console.error('RLS Policy violation:', error.message);
    throw new Error(`Permission denied: ${error.message}`);
  }
  
  if (error?.code === 'PGRST116') {
    throw new Error('No data found');
  }
  
  if (error?.code === '23505') {
    throw new Error('Duplicate entry found');
  }
  
  // Generic error handling
  const message = error?.message || `Failed to complete ${operation}`;
  throw new Error(message);
};

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper function for anonymous operations
export const executeAnonymousOperation = async <T>(
  operation: () => Promise<{ data: T | null; error: any }>
): Promise<T> => {
  try {
    const { data, error } = await operation();
    
    if (error) {
      console.error('Anonymous operation error:', error);
      handleSupabaseError(error, 'anonymous operation');
    }
    
    if (!data) {
      throw new Error('No data returned from operation');
    }
    
    return data;
  } catch (error) {
    console.error('Execute anonymous operation failed:', error);
    throw error;
  }
};

export default supabase;