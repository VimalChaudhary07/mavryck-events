import { toast } from 'react-hot-toast';
import { supabase } from './supabase';

interface AuthCredentials {
  email: string;
  password: string;
}

const VALID_CREDENTIALS: AuthCredentials = {
  email: 'admin@mavryck_events',
  password: 'mavryck_events@admin0000'
};

export const isAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

export const login = async (email: string, password: string): Promise<boolean> => {
  try {
    // Check if credentials match our admin credentials
    if (email === VALID_CREDENTIALS.email && password === VALID_CREDENTIALS.password) {
      
      // First, try to sign up the admin user (this will fail if user already exists, which is fine)
      try {
        const { error: signUpError } = await supabase.auth.signUp({
          email: VALID_CREDENTIALS.email,
          password: VALID_CREDENTIALS.password,
          options: {
            emailRedirectTo: undefined // Disable email confirmation
          }
        });
        
        if (signUpError && !signUpError.message.includes('already registered')) {
          console.warn('Sign up error:', signUpError);
        }
      } catch (error) {
        console.log('User might already exist, continuing to sign in');
      }
      
      // Now sign in with the credentials
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: VALID_CREDENTIALS.email,
        password: VALID_CREDENTIALS.password
      });
      
      if (signInError) {
        console.error('Sign in error:', signInError);
        
        // If sign in fails due to invalid credentials, try to handle it
        if (signInError.message.includes('Invalid login credentials')) {
          // Try to sign up again in case the user doesn't exist
          const { error: retrySignUpError } = await supabase.auth.signUp({
            email: VALID_CREDENTIALS.email,
            password: VALID_CREDENTIALS.password,
            options: {
              emailRedirectTo: undefined
            }
          });
          
          if (!retrySignUpError) {
            // Now try to sign in again
            const { error: retrySignInError } = await supabase.auth.signInWithPassword({
              email: VALID_CREDENTIALS.email,
              password: VALID_CREDENTIALS.password
            });
            
            if (retrySignInError) {
              console.error('Retry sign in failed:', retrySignInError);
              toast.error('Authentication setup failed. Please try again.');
              return false;
            }
          }
        } else {
          toast.error('Authentication failed. Please try again.');
          return false;
        }
      }
      
      // Set local authentication state
      localStorage.setItem('isAuthenticated', 'true');
      
      // Verify the session is active
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        console.log('Authentication successful, session active');
        toast.success('Welcome back, Admin!');
        return true;
      } else {
        console.warn('Session not found after login');
        localStorage.setItem('isAuthenticated', 'true'); // Still allow local auth
        toast.success('Welcome back, Admin!');
        return true;
      }
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
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Session refresh failed:', error);
      return false;
    }
    return !!data.session;
  } catch (error) {
    console.error('Session refresh failed:', error);
    return false;
  }
};

// Get current session
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Failed to get session:', error);
      return null;
    }
    return data.session;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
};

// Initialize auth state
export const initializeAuth = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Failed to initialize auth:', error);
      return false;
    }
    
    if (data.session && data.session.user?.email === VALID_CREDENTIALS.email) {
      localStorage.setItem('isAuthenticated', 'true');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Auth initialization failed:', error);
    return false;
  }
};