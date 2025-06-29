import { supabase } from './supabase';
import toast from 'react-hot-toast';
import { validateEmail } from '../utils/validation';
import * as XLSX from 'xlsx';

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

// Simple input sanitization
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
    // Simple sanitization - just trim and lowercase
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = sanitizeInput(password);
    
    if (!validateEmail(cleanEmail)) {
      toast.error('Invalid email format');
      recordLoginAttempt(cleanEmail, false);
      return false;
    }
    
    // Check rate limiting
    if (isRateLimited(cleanEmail)) {
      toast.error('Too many failed attempts. Please try again in 15 minutes.');
      return false;
    }
    
    // Authenticate with Supabase directly
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword
      });
      
      if (error) {
        console.error('Authentication failed:', error);
        toast.error('Invalid credentials');
        recordLoginAttempt(cleanEmail, false);
        return false;
      }
      
      if (!data.user) {
        toast.error('Authentication failed');
        recordLoginAttempt(cleanEmail, false);
        return false;
      }
      
      // Create secure session
      createSecureSession(cleanEmail);
      recordLoginAttempt(cleanEmail, true);
      toast.success('Welcome back, Admin!');
      return true;
      
    } catch (error) {
      console.error('Supabase authentication error:', error);
      recordLoginAttempt(cleanEmail, false);
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

// Fixed email update with minimal processing
export const updateUserEmail = async (newEmail: string): Promise<boolean> => {
  try {
    // Simple sanitization - just trim and lowercase
    const cleanEmail = newEmail.trim().toLowerCase();
    
    // Validate the email
    if (!validateEmail(cleanEmail)) {
      toast.error('Invalid email format. Please check your email address.');
      return false;
    }
    
    // Additional basic checks
    if (cleanEmail.length < 5 || cleanEmail.length > 254) {
      toast.error('Email address length is invalid.');
      return false;
    }
    
    console.log('Attempting to update email to:', cleanEmail);
    
    const { error } = await supabase.auth.updateUser({
      email: cleanEmail
    });
    
    if (error) {
      console.error('Email update error:', error);
      
      // Handle specific Supabase errors
      if (error.message.includes('email_address_invalid')) {
        toast.error('The email address format is not accepted by the system. Please try a different email.');
      } else if (error.message.includes('email_address_not_confirmed')) {
        toast.error('Please confirm your current email before changing it.');
      } else if (error.message.includes('email_change_token_already_sent')) {
        toast.error('Email change request already sent. Please check your inbox.');
      } else {
        toast.error(`Failed to update email: ${error.message}`);
      }
      return false;
    }
    
    // Update session data
    const sessionData = getSessionData();
    if (sessionData) {
      sessionData.email = cleanEmail;
      localStorage.setItem('sessionData', JSON.stringify(sessionData));
    }
    
    toast.success('Email update request sent. Please check your inbox to confirm the change.');
    return true;
  } catch (error) {
    console.error('Email update error:', error);
    toast.error('Failed to update email. Please try again.');
    return false;
  }
};

// Update user password
export const updateUserPassword = async (newPassword: string): Promise<boolean> => {
  try {
    // Validate password strength
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      console.error('Password update error:', error);
      
      if (error.message.includes('password_too_short')) {
        toast.error('Password is too short. Please use at least 6 characters.');
      } else if (error.message.includes('password_too_weak')) {
        toast.error('Password is too weak. Please use a stronger password.');
      } else {
        toast.error(`Failed to update password: ${error.message}`);
      }
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

// Enhanced backup export to Excel with progress indicators
export const exportDatabaseBackup = async (onProgress?: (progress: number, status: string) => void): Promise<string | null> => {
  try {
    const tables = [
      'event_requests',
      'gallery',
      'products',
      'testimonials',
      'contact_messages',
      'event_categories',
      'event_templates',
      'vendors',
      'site_settings',
      'invoices',
      'invoice_items',
      'event_timeline',
      'event_attachments',
      'user_preferences',
      'admin_users'
    ];
    
    onProgress?.(0, 'Initializing backup...');
    
    const backup: any = {
      timestamp: new Date().toISOString(),
      version: '2.0',
      data: {}
    };
    
    // Create Excel workbook
    const workbook = XLSX.utils.book_new();
    
    // Add metadata sheet
    const metadataSheet = XLSX.utils.json_to_sheet([{
      'Backup Date': new Date().toLocaleDateString(),
      'Backup Time': new Date().toLocaleTimeString(),
      'Version': '2.0',
      'Total Tables': tables.length,
      'Generated By': 'Mavryck Events Admin System'
    }]);
    XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Backup Info');
    
    let processedTables = 0;
    
    for (const table of tables) {
      try {
        onProgress?.(
          Math.round((processedTables / tables.length) * 80), 
          `Backing up ${table}...`
        );
        
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .is('deleted_at', null);
        
        if (error) {
          console.error(`Error backing up ${table}:`, error);
          continue;
        }
        
        backup.data[table] = data;
        
        // Add table data to Excel workbook
        if (data && data.length > 0) {
          // Clean data for Excel export
          const cleanData = data.map(row => {
            const cleanRow: any = {};
            Object.keys(row).forEach(key => {
              let value = row[key];
              // Handle JSON fields
              if (typeof value === 'object' && value !== null) {
                value = JSON.stringify(value);
              }
              // Handle dates
              if (value instanceof Date) {
                value = value.toISOString();
              }
              cleanRow[key] = value;
            });
            return cleanRow;
          });
          
          const worksheet = XLSX.utils.json_to_sheet(cleanData);
          
          // Auto-size columns
          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
          const colWidths: any[] = [];
          for (let C = range.s.c; C <= range.e.c; ++C) {
            let maxWidth = 10;
            for (let R = range.s.r; R <= range.e.r; ++R) {
              const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
              const cell = worksheet[cellAddress];
              if (cell && cell.v) {
                const cellLength = cell.v.toString().length;
                maxWidth = Math.max(maxWidth, Math.min(cellLength, 50));
              }
            }
            colWidths[C] = { wch: maxWidth };
          }
          worksheet['!cols'] = colWidths;
          
          XLSX.utils.book_append_sheet(workbook, worksheet, table.replace('_', ' ').substring(0, 31));
        } else {
          // Add empty sheet for tables with no data
          const emptySheet = XLSX.utils.json_to_sheet([{ 'No Data': 'This table contains no records' }]);
          XLSX.utils.book_append_sheet(workbook, emptySheet, table.replace('_', ' ').substring(0, 31));
        }
        
        processedTables++;
      } catch (error) {
        console.error(`Error processing ${table}:`, error);
        processedTables++;
      }
    }
    
    onProgress?.(90, 'Generating Excel file...');
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `mavryck-events-backup-${timestamp}.xlsx`;
    
    // Write Excel file
    XLSX.writeFile(workbook, filename);
    
    onProgress?.(100, 'Backup completed successfully!');
    
    // Also create JSON backup for import functionality
    const backupJson = JSON.stringify(backup, null, 2);
    
    toast.success('Database backup exported successfully as Excel file');
    return backupJson;
  } catch (error) {
    console.error('Backup export error:', error);
    toast.error('Failed to export backup');
    onProgress?.(0, 'Backup failed');
    return null;
  }
};

// Enhanced import with progress indicators
export const importDatabaseBackup = async (
  backupData: string, 
  onProgress?: (progress: number, status: string) => void
): Promise<boolean> => {
  try {
    onProgress?.(0, 'Validating backup file...');
    
    const backup = JSON.parse(backupData);
    
    if (!backup.data || !backup.timestamp) {
      toast.error('Invalid backup file format');
      onProgress?.(0, 'Invalid backup file');
      return false;
    }
    
    const tables = Object.keys(backup.data);
    let processedTables = 0;
    let successCount = 0;
    let errorCount = 0;
    
    onProgress?.(10, 'Starting data restoration...');
    
    for (const [tableName, tableData] of Object.entries(backup.data)) {
      if (!Array.isArray(tableData)) continue;
      
      try {
        onProgress?.(
          10 + Math.round((processedTables / tables.length) * 80), 
          `Restoring ${tableName}...`
        );
        
        // Clear existing data (soft delete)
        await supabase
          .from(tableName)
          .update({ deleted_at: new Date().toISOString() })
          .is('deleted_at', null);
        
        // Insert backup data in batches
        if ((tableData as any[]).length > 0) {
          const batchSize = 100;
          const batches = [];
          
          for (let i = 0; i < (tableData as any[]).length; i += batchSize) {
            batches.push((tableData as any[]).slice(i, i + batchSize));
          }
          
          for (const batch of batches) {
            const { error } = await supabase
              .from(tableName)
              .insert(batch);
            
            if (error) {
              console.error(`Error restoring ${tableName}:`, error);
              errorCount++;
              break;
            }
          }
          
          if (errorCount === 0) {
            successCount++;
          }
        } else {
          successCount++;
        }
      } catch (error) {
        console.error(`Error processing ${tableName}:`, error);
        errorCount++;
      }
      
      processedTables++;
    }
    
    onProgress?.(100, 'Restoration completed!');
    
    if (successCount > 0) {
      toast.success(`Database restored successfully. ${successCount} tables restored.`);
      if (errorCount > 0) {
        toast.error(`${errorCount} tables had errors during restore.`);
      }
      return true;
    } else {
      toast.error('Failed to restore database');
      return false;
    }
  } catch (error) {
    console.error('Backup import error:', error);
    toast.error('Failed to import backup. Please check the file format.');
    onProgress?.(0, 'Import failed');
    return false;
  }
};

// Site settings functions
export const updateGooglePhotosUrl = async (url: string): Promise<boolean> => {
  try {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return false;
    }
    
    // Get existing settings or create new one
    const { data: existingSettings } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .single();
    
    if (existingSettings) {
      const { error } = await supabase
        .from('site_settings')
        .update({ google_photos_url: url.trim() })
        .eq('id', existingSettings.id);
      
      if (error) {
        console.error('Error updating Google Photos URL:', error);
        toast.error('Failed to update Google Photos URL');
        return false;
      }
    } else {
      const { error } = await supabase
        .from('site_settings')
        .insert({ google_photos_url: url.trim() });
      
      if (error) {
        console.error('Error creating site settings:', error);
        toast.error('Failed to save Google Photos URL');
        return false;
      }
    }
    
    toast.success('Gallery URL updated successfully');
    return true;
  } catch (error) {
    console.error('Google Photos URL update error:', error);
    toast.error('Failed to update Gallery URL');
    return false;
  }
};

export const getGooglePhotosUrl = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('google_photos_url')
      .limit(1)
      .single();
    
    if (error || !data) {
      return 'https://photos.google.com/share/your-album-link';
    }
    
    return data.google_photos_url || 'https://photos.google.com/share/your-album-link';
  } catch (error) {
    console.error('Error fetching Google Photos URL:', error);
    return 'https://photos.google.com/share/your-album-link';
  }
};