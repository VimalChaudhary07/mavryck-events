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

interface ProgressCallback {
  (progress: number, status: string, details?: {
    currentTable?: string;
    recordsProcessed?: number;
    totalRecords?: number;
  }): void;
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

// Enhanced backup export to Excel with real-time progress indicators
export const exportDatabaseBackup = async (onProgress?: ProgressCallback): Promise<string | null> => {
  try {
    // Define the specific tables we want to backup
    const targetTables = [
      { name: 'event_requests', displayName: 'Event Requests' },
      { name: 'contact_messages', displayName: 'Contact Messages' },
      { name: 'gallery', displayName: 'Gallery Items' },
      { name: 'products', displayName: 'Products & Services' },
      { name: 'testimonials', displayName: 'Customer Testimonials' }
    ];
    
    onProgress?.(0, 'Initializing enhanced backup...', { totalRecords: targetTables.length });
    
    // Create Excel workbook
    const workbook = XLSX.utils.book_new();
    
    // Add overview/metadata sheet first
    onProgress?.(5, 'Creating overview sheet...', { currentTable: 'Overview' });
    
    let totalRecords = 0;
    const tableStats: any[] = [];
    
    // First pass: collect statistics
    for (const table of targetTables) {
      try {
        let query = supabase.from(table.name).select('*', { count: 'exact', head: true });
        
        // Only add deleted_at filter for tables that have this column
        const tablesWithDeletedAt = ['event_requests', 'gallery', 'products', 'testimonials', 'contact_messages'];
        if (tablesWithDeletedAt.includes(table.name)) {
          query = query.is('deleted_at', null);
        }
        
        const { count, error } = await query;
        
        if (!error && count !== null) {
          totalRecords += count;
          tableStats.push({
            'Section': table.displayName,
            'Records': count,
            'Status': count > 0 ? 'Has Data' : 'Empty',
            'Last Updated': new Date().toLocaleDateString()
          });
        }
      } catch (error) {
        console.warn(`Failed to get count for ${table.name}:`, error);
        tableStats.push({
          'Section': table.displayName,
          'Records': 0,
          'Status': 'Error',
          'Last Updated': 'N/A'
        });
      }
    }
    
    // Create overview sheet
    const overviewData = [
      { 'Metric': 'Backup Date', 'Value': new Date().toLocaleDateString() },
      { 'Metric': 'Backup Time', 'Value': new Date().toLocaleTimeString() },
      { 'Metric': 'Total Sections', 'Value': targetTables.length },
      { 'Metric': 'Total Records', 'Value': totalRecords },
      { 'Metric': 'System Version', 'Value': '2.0' },
      { 'Metric': 'Generated By', 'Value': 'Mavryck Events Admin' },
      {},
      { 'Metric': 'Section Breakdown', 'Value': '' },
      ...tableStats
    ];
    
    const overviewSheet = XLSX.utils.json_to_sheet(overviewData);
    overviewSheet['!cols'] = [{ wch: 25 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');
    
    let processedTables = 0;
    let processedRecords = 0;
    
    // Second pass: export actual data
    for (const table of targetTables) {
      try {
        onProgress?.(
          10 + Math.round((processedTables / targetTables.length) * 80), 
          `Exporting ${table.displayName}...`,
          { 
            currentTable: table.displayName,
            recordsProcessed: processedRecords,
            totalRecords: totalRecords
          }
        );
        
        let query = supabase.from(table.name).select('*');
        
        // Only add deleted_at filter for tables that have this column
        const tablesWithDeletedAt = ['event_requests', 'gallery', 'products', 'testimonials', 'contact_messages'];
        if (tablesWithDeletedAt.includes(table.name)) {
          query = query.is('deleted_at', null);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error(`Error backing up ${table.name}:`, error);
          processedTables++;
          continue;
        }
        
        // Process and clean data for Excel
        if (data && data.length > 0) {
          const cleanData = data.map((row: any, index: number) => {
            const cleanRow: any = { 'Row #': index + 1 };
            
            Object.keys(row).forEach(key => {
              let value = row[key];
              
              // Handle different data types
              if (typeof value === 'object' && value !== null) {
                if (value instanceof Date) {
                  value = value.toLocaleDateString();
                } else {
                  value = JSON.stringify(value);
                }
              }
              
              // Handle boolean values
              if (typeof value === 'boolean') {
                value = value ? 'Yes' : 'No';
              }
              
              // Handle null/undefined
              if (value === null || value === undefined) {
                value = '';
              }
              
              // Format column names for better readability
              const formattedKey = key
                .replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
              
              cleanRow[formattedKey] = value;
            });
            
            return cleanRow;
          });
          
          const worksheet = XLSX.utils.json_to_sheet(cleanData);
          
          // Auto-size columns with limits
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
          
          XLSX.utils.book_append_sheet(workbook, worksheet, table.displayName);
          processedRecords += data.length;
        } else {
          // Add empty sheet for tables with no data
          const emptySheet = XLSX.utils.json_to_sheet([{ 
            'Message': `No ${table.displayName.toLowerCase()} found`,
            'Note': 'This section contains no records at the time of backup'
          }]);
          XLSX.utils.book_append_sheet(workbook, emptySheet, table.displayName);
        }
        
        processedTables++;
        
        // Update progress
        onProgress?.(
          10 + Math.round((processedTables / targetTables.length) * 80),
          `Completed ${table.displayName}`,
          { 
            currentTable: table.displayName,
            recordsProcessed: processedRecords,
            totalRecords: totalRecords
          }
        );
        
      } catch (error) {
        console.error(`Error processing ${table.name}:`, error);
        processedTables++;
      }
    }
    
    onProgress?.(95, 'Generating Excel file...', { recordsProcessed: processedRecords, totalRecords: totalRecords });
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const timeString = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    const filename = `mavryck-events-backup-${timestamp}-${timeString}.xlsx`;
    
    // Write Excel file
    XLSX.writeFile(workbook, filename);
    
    onProgress?.(100, 'Backup completed successfully!', { recordsProcessed: processedRecords, totalRecords: totalRecords });
    
    toast.success(`Database backup exported successfully! ${processedRecords} records backed up.`);
    return filename;
  } catch (error) {
    console.error('Backup export error:', error);
    toast.error('Failed to export backup');
    onProgress?.(0, 'Backup failed');
    return null;
  }
};

// Enhanced import with progress indicators and XLSX support
export const importDatabaseBackup = async (
  file: File, 
  onProgress?: ProgressCallback
): Promise<boolean> => {
  try {
    onProgress?.(0, 'Reading Excel file...', {});
    
    // Read the Excel file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    
    onProgress?.(10, 'Validating backup structure...', {});
    
    // Define expected sheets and their corresponding table names
    const sheetMappings = [
      { sheetName: 'Event Requests', tableName: 'event_requests' },
      { sheetName: 'Contact Messages', tableName: 'contact_messages' },
      { sheetName: 'Gallery Items', tableName: 'gallery' },
      { sheetName: 'Products & Services', tableName: 'products' },
      { sheetName: 'Customer Testimonials', tableName: 'testimonials' }
    ];
    
    let totalRecords = 0;
    const sheetsToProcess: any[] = [];
    
    // Validate and count records
    for (const mapping of sheetMappings) {
      if (workbook.SheetNames.includes(mapping.sheetName)) {
        const worksheet = workbook.Sheets[mapping.sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Filter out empty rows and metadata rows
        const validData = jsonData.filter((row: any) => {
          return row && typeof row === 'object' && Object.keys(row).length > 1;
        });
        
        if (validData.length > 0) {
          sheetsToProcess.push({
            ...mapping,
            data: validData,
            recordCount: validData.length
          });
          totalRecords += validData.length;
        }
      }
    }
    
    if (sheetsToProcess.length === 0) {
      toast.error('No valid data sheets found in backup file');
      onProgress?.(0, 'No valid data found');
      return false;
    }
    
    onProgress?.(20, `Found ${totalRecords} records to restore...`, { totalRecords });
    
    let processedSheets = 0;
    let processedRecords = 0;
    let successCount = 0;
    let errorCount = 0;
    
    for (const sheet of sheetsToProcess) {
      try {
        onProgress?.(
          20 + Math.round((processedSheets / sheetsToProcess.length) * 70),
          `Restoring ${sheet.sheetName}...`,
          { 
            currentTable: sheet.sheetName,
            recordsProcessed: processedRecords,
            totalRecords: totalRecords
          }
        );
        
        // Convert Excel data back to database format
        const dbData = sheet.data.map((row: any) => {
          const dbRow: any = {};
          
          Object.keys(row).forEach(key => {
            if (key === 'Row #') return; // Skip row number column
            
            // Convert formatted column names back to database format
            const dbKey = key
              .toLowerCase()
              .replace(/\s+/g, '_')
              .replace(/[^a-z0-9_]/g, '');
            
            let value = row[key];
            
            // Handle boolean conversions
            if (value === 'Yes') value = true;
            if (value === 'No') value = false;
            
            // Handle empty strings
            if (value === '') value = null;
            
            // Handle date fields
            if (dbKey.includes('date') || dbKey.includes('created_at') || dbKey.includes('updated_at')) {
              if (value && typeof value === 'string') {
                try {
                  const date = new Date(value);
                  if (!isNaN(date.getTime())) {
                    value = date.toISOString();
                  }
                } catch (e) {
                  // Keep original value if date parsing fails
                }
              }
            }
            
            dbRow[dbKey] = value;
          });
          
          // Remove any undefined or invalid fields
          Object.keys(dbRow).forEach(key => {
            if (dbRow[key] === undefined || key === '') {
              delete dbRow[key];
            }
          });
          
          return dbRow;
        });
        
        // Clear existing data (soft delete for supported tables)
        const tablesWithDeletedAt = ['event_requests', 'gallery', 'products', 'testimonials', 'contact_messages'];
        
        if (tablesWithDeletedAt.includes(sheet.tableName)) {
          await supabase
            .from(sheet.tableName)
            .update({ deleted_at: new Date().toISOString() })
            .is('deleted_at', null);
        }
        
        // Insert data in batches
        const batchSize = 25; // Smaller batches for better reliability
        const batches = [];
        
        for (let i = 0; i < dbData.length; i += batchSize) {
          batches.push(dbData.slice(i, i + batchSize));
        }
        
        let batchErrors = 0;
        for (const [batchIndex, batch] of batches.entries()) {
          try {
            const { error } = await supabase
              .from(sheet.tableName)
              .insert(batch);
            
            if (error) {
              console.error(`Error restoring batch ${batchIndex + 1} in ${sheet.tableName}:`, error);
              batchErrors++;
            } else {
              processedRecords += batch.length;
              
              // Update progress for each batch
              onProgress?.(
                20 + Math.round((processedRecords / totalRecords) * 70),
                `Restoring ${sheet.sheetName}... (${processedRecords}/${totalRecords})`,
                { 
                  currentTable: sheet.sheetName,
                  recordsProcessed: processedRecords,
                  totalRecords: totalRecords
                }
              );
            }
          } catch (batchError) {
            console.error(`Batch error in ${sheet.tableName}:`, batchError);
            batchErrors++;
          }
        }
        
        if (batchErrors === 0) {
          successCount++;
        } else {
          errorCount++;
          console.warn(`${sheet.sheetName} had ${batchErrors} batch errors out of ${batches.length} batches`);
        }
        
      } catch (error) {
        console.error(`Error processing ${sheet.sheetName}:`, error);
        errorCount++;
      }
      
      processedSheets++;
    }
    
    onProgress?.(100, 'Restoration completed!', { recordsProcessed: processedRecords, totalRecords: totalRecords });
    
    if (successCount > 0) {
      toast.success(`Database restored successfully! ${processedRecords} records restored from ${successCount} sections.`);
      if (errorCount > 0) {
        toast.error(`${errorCount} sections had errors during restore. Check console for details.`);
      }
      return true;
    } else {
      toast.error('Failed to restore database - no sections were successfully restored');
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