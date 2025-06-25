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
  if (email === VALID_CREDENTIALS.email && password === VALID_CREDENTIALS.password) {
    localStorage.setItem('isAuthenticated', 'true');
    
    // Create a session in Supabase for authenticated operations
    try {
      await supabase.auth.signInAnonymously();
    } catch (error) {
      console.warn('Failed to create anonymous session:', error);
    }
    
    toast.success('Welcome back, Admin!');
    return true;
  }
  
  toast.error('Invalid credentials');
  return false;
};

export const logout = async () => {
  localStorage.removeItem('isAuthenticated');
  
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.warn('Failed to sign out from Supabase:', error);
  }
  
  toast.success('Logged out successfully');
};