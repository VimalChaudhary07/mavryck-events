import { supabase } from './supabase';
import toast from 'react-hot-toast';

// Security configuration
const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  ACTIVITY_CHECK_INTERVAL: 60 * 1000, // 1 minute
};

interface LoginAttempt {
  email: string;
  timestamp: number;
  success: boolean;
  ip?: string;
}

// In-memory storage for login attempts (in production, use Redis or database)
let loginAttempts: LoginAttempt[] = [];

// Rate limiting functions
const isRateLimited = (email: string): boolean => {
  const now = Date.now();
  const recentAttempts = loginAttempts.filter(
    attempt => attempt.email === email && 
    now - attempt.timestamp < SECURITY_CONFIG.LOCKOUT_DURATION
  );
  
  const failedAttempts = recentAttempts.filter(attempt => !attempt.success);
  return failedAttempts.length >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS;
};

const recordLoginAttempt = (email: string, success: boolean): void => {
  const attempt: LoginAttempt = {
    email: email.toLowerCase().trim(),
    timestamp: Date.now(),
    success,
    ip: 'client' // In production, get real IP
  };
  
  loginAttempts.push(attempt);
  
  // Clean old attempts
  const cutoff = Date.now() - SECURITY_CONFIG.LOCKOUT_DURATION;
  loginAttempts = loginAttempts.filter(attempt => attempt.timestamp > cutoff);
  
  // Log security events
  console.log(`Login attempt: ${email}, Success: ${success}, Time: ${new Date().toISOString()}`);
};

// Input validation
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
};

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>\"'&]/g, '');
};

// Session management
const createSecureSession = (email: string): void => {
  const sessionData = {
    email,
    loginTime: Date.now(),
    lastActivity: Date.now(),
    sessionId: crypto.randomUUID()
  };
  
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('sessionData', JSON.stringify(sessionData));
  localStorage.setItem('lastActivity', Date.now().toString());
};

const updateLastActivity = (): void => {
  const sessionData = getSessionData();
  if (sessionData) {
    sessionData.lastActivity = Date.now();
    localStorage.setItem('sessionData', JSON.stringify(sessionData));
    localStorage.setItem('lastActivity', Date.now().toString());
  }
};

const getSessionData = (): any => {
  try {
    const data = localStorage.getItem('sessionData');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const isSessionValid = (): boolean => {
  const sessionData = getSessionData();
  if (!sessionData) return false;
  
  const now = Date.now();
  const lastActivity = parseInt(localStorage.getItem('lastActivity') || '0');
  
  // Check session timeout
  if (now - lastActivity > SECURITY_CONFIG.SESSION_TIMEOUT) {
    clearSession();
    return false;
  }
  
  return true;
};

const clearSession = (): void => {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('sessionData');
  localStorage.removeItem('lastActivity');
};

// Main authentication functions
export const isAuthenticated = (): boolean => {
  const isAuth = localStorage.getItem('isAuthenticated') === 'true';
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
    
    // Check rate limiting
    if (isRateLimited(sanitizedEmail)) {
      toast.error('Too many failed attempts. Please try again in 15 minutes.');
      return false;
    }
    
    // Authenticate with Supabase directly
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: sanitizedPassword
      });
      
      if (error) {
        console.error('Authentication failed:', error);
        toast.error('Invalid credentials');
        recordLoginAttempt(sanitizedEmail, false);
        return false;
      }
      
      if (!data.user) {
        toast.error('Authentication failed');
        recordLoginAttempt(sanitizedEmail, false);
        return false;
      }
      
      // Create secure session
      createSecureSession(sanitizedEmail);
      recordLoginAttempt(sanitizedEmail, true);
      toast.success('Welcome back, Admin!');
      return true;
      
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
    if (localStorage.getItem('isAuthenticated') === 'true' && !isSessionValid()) {
      logout();
      toast.error('Session expired due to inactivity');
    }
  }, SECURITY_CONFIG.ACTIVITY_CHECK_INTERVAL);
};

// Get login attempt statistics for monitoring
export const getLoginAttemptStats = () => {
  const now = Date.now();
  const recentAttempts = loginAttempts.filter(
    attempt => now - attempt.timestamp < SECURITY_CONFIG.LOCKOUT_DURATION
  );
  
  return {
    totalAttempts: recentAttempts.length,
    failedAttempts: recentAttempts.filter(a => !a.success).length,
    successfulAttempts: recentAttempts.filter(a => a.success).length,
    isLocked: false // Remove hardcoded email dependency
  };
};

// CSRF Token management
const generateCSRFToken = (): string => {
  return crypto.randomUUID();
};

export const getCSRFTokenForForms = (): string => {
  let token = localStorage.getItem('csrfToken');
  if (!token) {
    token = generateCSRFToken();
    localStorage.setItem('csrfToken', token);
  }
  return token;
};

// Security headers
export const getSecurityHeaders = () => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  };
};

// Initialize authentication
export const initializeAuth = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Failed to initialize auth:', error);
      return false;
    }
    
    if (data.session && data.session.user?.email) {
      createSecureSession(data.session.user.email);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Auth initialization failed:', error);
    return false;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
    return data.user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};

// Update user email
export const updateUserEmail = async (newEmail: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.updateUser({
      email: newEmail
    });
    
    if (error) {
      console.error('Email update error:', error);
      toast.error('Failed to update email');
      return false;
    }
    
    // Update session data
    const sessionData = getSessionData();
    if (sessionData) {
      sessionData.email = newEmail;
      localStorage.setItem('sessionData', JSON.stringify(sessionData));
    }
    
    toast.success('Email updated successfully');
    return true;
  } catch (error) {
    console.error('Email update error:', error);
    toast.error('Failed to update email');
    return false;
  }
};

// Update user password
export const updateUserPassword = async (newPassword: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      console.error('Password update error:', error);
      toast.error('Failed to update password');
      return false;
    }
    
    toast.success('Password updated successfully');
    return true;
  } catch (error) {
    console.error('Password update error:', error);
    toast.error('Failed to update password');
    return false;
  }
};