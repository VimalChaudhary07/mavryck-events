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
export function handleSupabaseError(error: any, operation: string = 'operation') {
  console.error(`Supabase ${operation} error details:`, {
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
    // RLS policy violation - provide user-friendly message
    if (error?.message?.includes('contact_messages')) {
      throw new Error('Unable to send message at this time. Please try again or contact us directly at mavryckevents@gmail.com or +91 7045712235');
    }
    if (error?.message?.includes('event_requests')) {
      throw new Error('Unable to submit event request at this time. Please try again or contact us directly at mavryckevents@gmail.com or +91 7045712235');
    }
    throw new Error('Access denied. Please try again or contact support.');
  }

  if (error?.code === 'PGRST301') {
    throw new Error('Database connection failed. Please check your network connection.');
  }
  
  if (error?.message?.includes('JWT')) {
    throw new Error('Session expired. Please refresh the page and try again.');
  }
  
  if (error?.message?.includes('row-level security')) {
    throw new Error('Access denied. Please try again or contact support.');
  }
  
  if (error?.message) {
    throw new Error(error.message);
  }
  
  throw new Error(`An unexpected database error occurred during ${operation}`);
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
  
  if (event === 'SIGNED_IN' && session?.user?.email === 'admin@mavryckevents.com') {
    localStorage.setItem('isAuthenticated', 'true');
  } else if (event === 'SIGNED_OUT') {
    localStorage.removeItem('isAuthenticated');
  }
});

// Helper function to ensure anonymous access
export async function ensureAnonymousAccess(): Promise<void> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (session.session) {
      // If there's an active session that might be interfering, sign out
      await supabase.auth.signOut();
    }
  } catch (error) {
    console.warn('Error ensuring anonymous access:', error);
    // Continue anyway, as this is just a cleanup operation
  }
}

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper function to check if user is authenticated
export const isUserAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

export default supabase;