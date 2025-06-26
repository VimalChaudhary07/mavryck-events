import { toast } from 'react-hot-toast';
import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

interface AuthCredentials {
  email: string;
  password: string;
}

interface LoginAttempt {
  email: string;
  timestamp: number;
  success: boolean;
  ip?: string;
}

const VALID_CREDENTIALS: AuthCredentials = {
  email: 'admin@mavryckevents.com',
  password: 'mavryck_events@admin0000'
};

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const STORAGE_KEYS = {
  AUTH: 'isAuthenticated',
  SESSION: 'sessionData',
  ATTEMPTS: 'loginAttempts',
  LAST_ACTIVITY: 'lastActivity'
};

// Rate limiting storage
let loginAttempts: LoginAttempt[] = [];

// Input validation and sanitization
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
};

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>\"']/g, '');
};

const validatePassword = (password: string): boolean => {
  // Password must be at least 8 characters and contain special characters
  return password.length >= 8 && /[!@#$%^&*(),.?":{}|<>]/.test(password);
};

// Rate limiting functions
const isRateLimited = (email: string): boolean => {
  const now = Date.now();
  const recentAttempts = loginAttempts.filter(
    attempt => attempt.email === email && 
    now - attempt.timestamp < LOCKOUT_DURATION
  );
  
  const failedAttempts = recentAttempts.filter(attempt => !attempt.success);
  return failedAttempts.length >= MAX_LOGIN_ATTEMPTS;
};

const recordLoginAttempt = (email: string, success: boolean): void => {
  const attempt: LoginAttempt = {
    email: sanitizeInput(email),
    timestamp: Date.now(),
    success,
    ip: 'client' // In production, get real IP
  };
  
  loginAttempts.push(attempt);
  
  // Clean old attempts (older than lockout duration)
  const cutoff = Date.now() - LOCKOUT_DURATION;
  loginAttempts = loginAttempts.filter(attempt => attempt.timestamp > cutoff);
  
  // Log attempt
  console.log(`Login attempt: ${email}, Success: ${success}, Time: ${new Date().toISOString()}`);
};

// Session management
const createSecureSession = (email: string): void => {
  const sessionData = {
    email,
    loginTime: Date.now(),
    lastActivity: Date.now(),
    sessionId: crypto.randomUUID()
  };
  
  localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
  localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
};

const updateLastActivity = (): void => {
  const sessionData = getSessionData();
  if (sessionData) {
    sessionData.lastActivity = Date.now();
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
  }
};

const getSessionData = (): any => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SESSION);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const isSessionValid = (): boolean => {
  const sessionData = getSessionData();
  if (!sessionData) return false;
  
  const now = Date.now();
  const lastActivity = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY) || '0');
  
  // Check session timeout
  if (now - lastActivity > SESSION_TIMEOUT) {
    clearSession();
    return false;
  }
  
  return true;
};

const clearSession = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH);
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
};

// CSRF Token management
const generateCSRFToken = (): string => {
  return crypto.randomUUID();
};

const getCSRFToken = (): string => {
  let token = localStorage.getItem('csrfToken');
  if (!token) {
    token = generateCSRFToken();
    localStorage.setItem('csrfToken', token);
  }
  return token;
};

// Hash password for comparison (in production, this would be done server-side)
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// Main authentication functions
export const isAuthenticated = (): boolean => {
  const isAuth = localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  return isAuth && isSessionValid();
};

export const login = async (email: string, password: string): Promise<boolean> => {
  try {
    // Input validation and sanitization
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedPassword = sanitizeInput(password);
    
    if (!validateEmail(sanitizedEmail)) {
      toast.error('Invalid email format');
      recordLoginAttempt(sanitizedEmail, false);
      return false;
    }
    
    if (!validatePassword(sanitizedPassword)) {
      toast.error('Invalid password format');
      recordLoginAttempt(sanitizedEmail, false);
      return false;
    }
    
    // Check rate limiting
    if (isRateLimited(sanitizedEmail)) {
      toast.error('Too many failed attempts. Please try again in 15 minutes.');
      return false;
    }
    
    // Verify credentials
    if (sanitizedEmail !== VALID_CREDENTIALS.email) {
      toast.error('Invalid credentials');
      recordLoginAttempt(sanitizedEmail, false);
      return false;
    }
    
    // In production, compare with hashed password
    if (sanitizedPassword !== VALID_CREDENTIALS.password) {
      toast.error('Invalid credentials');
      recordLoginAttempt(sanitizedEmail, false);
      return false;
    }
    
    // Authenticate with Supabase
    try {
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
              recordLoginAttempt(sanitizedEmail, false);
              return false;
            }
          }
        } else {
          toast.error('Authentication failed. Please try again.');
          recordLoginAttempt(sanitizedEmail, false);
          return false;
        }
      }
      
      // Create secure session
      createSecureSession(sanitizedEmail);
      
      // Verify the session is active
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        console.log('Authentication successful, session active');
        recordLoginAttempt(sanitizedEmail, true);
        toast.success('Welcome back, Admin!');
        return true;
      } else {
        console.warn('Session not found after login');
        createSecureSession(sanitizedEmail); // Still allow local auth
        recordLoginAttempt(sanitizedEmail, true);
        toast.success('Welcome back, Admin!');
        return true;
      }
    } catch (error) {
      console.error('Supabase authentication error:', error);
      recordLoginAttempt(sanitizedEmail, false);
      toast.error('Authentication service unavailable. Please try again.');
      return false;
    }
  } catch (error) {
    console.error('Login error:', error);
    toast.error('Login failed. Please try again.');
    return false;
  }
};

export const logout = async (): Promise<void> => {
  try {
    clearSession();
    
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

// Password reset functionality (admin only)
export const resetAdminPassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
  try {
    if (!isAuthenticated()) {
      toast.error('Authentication required');
      return false;
    }
    
    // Validate current password
    if (currentPassword !== VALID_CREDENTIALS.password) {
      toast.error('Current password is incorrect');
      return false;
    }
    
    // Validate new password
    if (!validatePassword(newPassword)) {
      toast.error('New password must be at least 8 characters and contain special characters');
      return false;
    }
    
    if (newPassword === currentPassword) {
      toast.error('New password must be different from current password');
      return false;
    }
    
    // In production, this would update the password in the database
    // For now, we'll just show a success message
    toast.success('Password reset functionality would be implemented server-side in production');
    return true;
  } catch (error) {
    console.error('Password reset error:', error);
    toast.error('Password reset failed');
    return false;
  }
};

// Check if user has admin privileges
export const hasAdminAccess = (): boolean => {
  return isAuthenticated();
};

// Refresh authentication session
export const refreshSession = async (): Promise<boolean> => {
  try {
    if (!isSessionValid()) {
      return false;
    }
    
    updateLastActivity();
    
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
export const initializeAuth = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Failed to initialize auth:', error);
      return false;
    }
    
    if (data.session && data.session.user?.email === VALID_CREDENTIALS.email) {
      createSecureSession(VALID_CREDENTIALS.email);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Auth initialization failed:', error);
    return false;
  }
};

// Activity monitoring
export const startActivityMonitoring = (): void => {
  // Update activity on user interactions
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  
  const updateActivity = () => {
    if (isAuthenticated()) {
      updateLastActivity();
    }
  };
  
  events.forEach(event => {
    document.addEventListener(event, updateActivity, true);
  });
  
  // Check session validity periodically
  setInterval(() => {
    if (localStorage.getItem(STORAGE_KEYS.AUTH) === 'true' && !isSessionValid()) {
      logout();
      toast.error('Session expired due to inactivity');
    }
  }, 60000); // Check every minute
};

// Get CSRF token for forms
export const getCSRFTokenForForms = (): string => {
  return getCSRFToken();
};

// Validate CSRF token
export const validateCSRFToken = (token: string): boolean => {
  return token === getCSRFToken();
};

// Security headers and middleware functions
export const getSecurityHeaders = () => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  };
};

// Export rate limiting info for monitoring
export const getLoginAttemptStats = () => {
  const now = Date.now();
  const recentAttempts = loginAttempts.filter(
    attempt => now - attempt.timestamp < LOCKOUT_DURATION
  );
  
  return {
    totalAttempts: recentAttempts.length,
    failedAttempts: recentAttempts.filter(a => !a.success).length,
    successfulAttempts: recentAttempts.filter(a => a.success).length,
    isLocked: isRateLimited(VALID_CREDENTIALS.email)
  };
};