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
      
      // Create a session in Supabase for authenticated operations
      try {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.warn('Failed to create anonymous session:', error);
        } else {
          console.log('Anonymous session created successfully');
        }
      } catch (error) {
        console.warn('Failed to create anonymous session:', error);
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
      const { error } = await supabase.auth.signInAnonymously();
      return !error;
    }
    return false;
  } catch (error) {
    console.error('Session refresh failed:', error);
    return false;
  }
};