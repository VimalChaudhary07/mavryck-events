import { toast } from 'react-hot-toast';
import { supabase } from './supabase';

interface AuthCredentials {
  email: string;
  password: string;
}

const VALID_CREDENTIALS: AuthCredentials = {
  email: 'admin@festive.finesse.events',
  password: 'FFE@admin2024'
};

export const isAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

export const login = async (email: string, password: string): Promise<boolean> => {
  try {
    if (email === VALID_CREDENTIALS.email && password === VALID_CREDENTIALS.password) {
      localStorage.setItem('isAuthenticated', 'true');
      
      // Create a proper authenticated session in Supabase
      try {
        // First, try to sign up the admin user (this will fail if user already exists, which is fine)
        await supabase.auth.signUp({
          email: VALID_CREDENTIALS.email,
          password: VALID_CREDENTIALS.password,
          options: {
            emailRedirectTo: undefined // Disable email confirmation
          }
        });
      } catch (error) {
        // User might already exist, continue to sign in
        console.log('User might already exist, attempting sign in');
      }
      
      // Now sign in with the credentials
      try {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: VALID_CREDENTIALS.email,
          password: VALID_CREDENTIALS.password
        });
        
        if (signInError) {
          console.warn('Failed to create authenticated session:', signInError);
          // Continue with local auth even if Supabase auth fails
        } else {
          console.log('Authenticated session created successfully');
        }
      } catch (error) {
        console.warn('Failed to create authenticated session:', error);
        // Continue with local auth even if Supabase auth fails
      }
      
      toast.success('Welcome back, Admin!');
      return true;
    }
    
    toast.error('Invalid credentials');
    return false;
  } catch (error) {
    console.error('Login error:', error);
    toast.error('Login failed. Please try again.');
    return false;
  }
};

export const logout = async () => {
  try {
    localStorage.removeItem('isAuthenticated');
    
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('Failed to sign out from Supabase:', error);
    }
    
    toast.success('Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    toast.error('Logout failed');
  }
};

// Check if user has admin privileges
export const hasAdminAccess = (): boolean => {
  return isAuthenticated();
};

// Refresh authentication session
export const refreshSession = async (): Promise<boolean> => {
  try {
    if (isAuthenticated()) {
      const { error } = await supabase.auth.signInWithPassword({
        email: VALID_CREDENTIALS.email,
        password: VALID_CREDENTIALS.password
      });
      return !error;
    }
    return false;
  } catch (error) {
    console.error('Session refresh failed:', error);
    return false;
  }
};