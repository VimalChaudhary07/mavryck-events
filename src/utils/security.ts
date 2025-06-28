// Production Security Configuration and Utilities

export const SECURITY_CONFIG = {
  // Session configuration
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  ACTIVITY_CHECK_INTERVAL: 60 * 1000, // 1 minute
  
  // Rate limiting
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  
  // Password requirements
  MIN_PASSWORD_LENGTH: 8,
  REQUIRE_SPECIAL_CHARS: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_UPPERCASE: true,
  
  // CSRF protection
  CSRF_TOKEN_LENGTH: 32,
  
  // Content Security Policy
  CSP_DIRECTIVES: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'font-src': ["'self'", 'data:'],
    'connect-src': ["'self'", 'https://*.supabase.co', 'wss://*.supabase.co'],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
  }
};

// Generate secure random string
export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Hash function for sensitive data
export const hashData = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Secure comparison to prevent timing attacks
export const secureCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
};

// Content Security Policy generator
export const generateCSP = (): string => {
  const directives = Object.entries(SECURITY_CONFIG.CSP_DIRECTIVES)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
  
  return directives;
};

// Security headers for production
export const getSecurityHeaders = () => {
  return {
    'Content-Security-Policy': generateCSP(),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  };
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>\"'&]/g, (match) => {
      const entities: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[match] || match;
    });
};

// SQL injection prevention (for display purposes)
export const sanitizeSQL = (input: string): string => {
  return input.replace(/[';--]/g, '');
};

// XSS prevention
export const sanitizeHTML = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

// Validate file uploads
export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' };
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size too large. Maximum size is 5MB.' };
  }
  
  return { isValid: true };
};

// Environment validation
export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check required environment variables
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (!import.meta.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`);
    }
  });
  
  // Validate Supabase URL format
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.match(/^https:\/\/[a-z0-9]+\.supabase\.co$/)) {
    errors.push('Invalid Supabase URL format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Security audit logging
export interface SecurityEvent {
  type: 'login_attempt' | 'login_success' | 'login_failure' | 'logout' | 'session_timeout' | 'rate_limit_exceeded';
  timestamp: number;
  userAgent?: string;
  ip?: string;
  details?: any;
}

class SecurityLogger {
  private events: SecurityEvent[] = [];
  private maxEvents = 1000;

  log(event: Omit<SecurityEvent, 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      ip: 'client' // In production, this would be the real IP
    };

    this.events.push(securityEvent);

    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('Security Event:', securityEvent);
    }

    // In production, send to monitoring service
    if (import.meta.env.PROD) {
      this.sendToMonitoring(securityEvent);
    }
  }

  private sendToMonitoring(event: SecurityEvent): void {
    // Implementation would send to your monitoring service
    // For now, just log critical events
    if (['login_failure', 'rate_limit_exceeded'].includes(event.type)) {
      console.warn('Critical Security Event:', event);
    }
  }

  getEvents(type?: SecurityEvent['type']): SecurityEvent[] {
    if (type) {
      return this.events.filter(event => event.type === type);
    }
    return [...this.events];
  }

  getEventsSince(timestamp: number): SecurityEvent[] {
    return this.events.filter(event => event.timestamp >= timestamp);
  }

  clearEvents(): void {
    this.events = [];
  }
}

export const securityLogger = new SecurityLogger();

// Browser security checks
export const performSecurityChecks = (): { passed: boolean; warnings: string[] } => {
  const warnings: string[] = [];

  // Check if HTTPS is being used in production
  if (import.meta.env.PROD && location.protocol !== 'https:') {
    warnings.push('Application should be served over HTTPS in production');
  }

  // Check if running in a secure context
  if (!window.isSecureContext) {
    warnings.push('Application is not running in a secure context');
  }

  // Check for developer tools (basic check)
  if (import.meta.env.PROD) {
    const devtools = {
      open: false,
      orientation: null as string | null
    };

    const threshold = 160;

    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          securityLogger.log({
            type: 'login_attempt',
            details: { reason: 'Developer tools detected' }
          });
        }
      } else {
        devtools.open = false;
      }
    }, 500);
  }

  return {
    passed: warnings.length === 0,
    warnings
  };
};

// Initialize security measures
export const initializeSecurity = (): void => {
  // Validate environment
  const envValidation = validateEnvironment();
  if (!envValidation.isValid) {
    console.error('Environment validation failed:', envValidation.errors);
  }

  // Perform security checks
  const securityChecks = performSecurityChecks();
  if (!securityChecks.passed) {
    console.warn('Security warnings:', securityChecks.warnings);
  }

  // Set up global error handling
  window.addEventListener('error', (event) => {
    securityLogger.log({
      type: 'login_attempt',
      details: {
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    });
  });

  // Set up unhandled promise rejection handling
  window.addEventListener('unhandledrejection', (event) => {
    securityLogger.log({
      type: 'login_attempt',
      details: {
        type: 'unhandled_promise_rejection',
        reason: event.reason
      }
    });
  });

  // Disable right-click in production
  if (import.meta.env.PROD) {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Disable F12, Ctrl+Shift+I, Ctrl+U
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
      }
    });
  }

  console.log('Security measures initialized for production');
};

// Rate limiting utility
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  constructor(private maxAttempts: number, private windowMs: number) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    const userAttempts = this.attempts.get(identifier) || [];
    const recentAttempts = userAttempts.filter(time => time > windowStart);
    
    this.attempts.set(identifier, recentAttempts);
    
    return recentAttempts.length < this.maxAttempts;
  }

  recordAttempt(identifier: string): void {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    userAttempts.push(now);
    this.attempts.set(identifier, userAttempts);
  }

  getRemainingAttempts(identifier: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const userAttempts = this.attempts.get(identifier) || [];
    const recentAttempts = userAttempts.filter(time => time > windowStart);
    
    return Math.max(0, this.maxAttempts - recentAttempts.length);
  }

  getTimeUntilReset(identifier: string): number {
    const userAttempts = this.attempts.get(identifier) || [];
    if (userAttempts.length === 0) return 0;
    
    const oldestAttempt = Math.min(...userAttempts);
    const resetTime = oldestAttempt + this.windowMs;
    
    return Math.max(0, resetTime - Date.now());
  }
}