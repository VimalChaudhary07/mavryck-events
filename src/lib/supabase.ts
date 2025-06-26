import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseKey
  });
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'X-Client-Info': 'mavryck-events-app'
    }
  },
  db: {
    schema: 'public'
  }
});

// Test connection on initialization
supabase.from('event_requests').select('count', { count: 'exact', head: true })
  .then(({ error }) => {
    if (error) {
      console.error('Supabase connection test failed:', error);
    } else {
      console.log('Supabase connection successful');
    }
  });

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any) {
  console.error('Supabase error details:', {
    message: error?.message,
    code: error?.code,
    details: error?.details,
    hint: error?.hint
  });
  
  // Handle specific error types
  if (error?.code === 'PGRST116') {
    throw new Error('Record not found or no data returned');
  }
  
  if (error?.code === '42501') {
    throw new Error('Permission denied. Please check your authentication status and try logging in again.');
  }

  if (error?.code === 'PGRST301') {
    throw new Error('Database connection failed. Please check your network connection.');
  }
  
  if (error?.message?.includes('JWT')) {
    throw new Error('Authentication token expired. Please refresh the page and log in again.');
  }
  
  if (error?.message?.includes('row-level security')) {
    throw new Error('Access denied. Please ensure you are logged in with proper permissions.');
  }
  
  if (error?.message) {
    throw new Error(error.message);
  }
  
  throw new Error('An unexpected database error occurred');
}

// Helper function for authenticated operations with retry logic
export async function withAuth<T>(operation: () => Promise<T>): Promise<T> {
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

// Connection health check
export async function checkConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('event_requests').select('count', { count: 'exact', head: true });
    return !error;
  } catch (error) {
    console.error('Connection check failed:', error);
    return false;
  }
}

// Auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session?.user?.email);
  
  if (event === 'SIGNED_IN' && session?.user?.email === 'admin@mavryck_events') {
    localStorage.setItem('isAuthenticated', 'true');
  } else if (event === 'SIGNED_OUT') {
    localStorage.removeItem('isAuthenticated');
  }
});