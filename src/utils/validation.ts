// Production-ready input validation utilities

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export const validatePassword = (password: string): boolean => {
  // Password must be at least 8 characters and contain special characters
  return password.length >= 8 && /[!@#$%^&*(),.?":{}|<>]/.test(password);
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 100;
};

export const validateMessage = (message: string): boolean => {
  return message.trim().length >= 10 && message.trim().length <= 2000;
};

export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateDate = (date: string): boolean => {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate >= today;
};

export const validateGuestCount = (count: string): boolean => {
  const num = parseInt(count);
  return !isNaN(num) && num >= 1 && num <= 10000;
};

// Sanitization utilities
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>\"']/g, '');
};

export const sanitizeHTML = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

export const sanitizeFileName = (fileName: string): string => {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
};

// Form validation schemas
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

export const validateForm = (data: any, schema: ValidationSchema): ValidationResult => {
  const errors: { [key: string]: string } = {};
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    for (const rule of rules) {
      // Required check
      if (rule.required && (!value || value.toString().trim() === '')) {
        errors[field] = rule.message;
        break;
      }
      
      // Skip other validations if field is empty and not required
      if (!value || value.toString().trim() === '') continue;
      
      // Min length check
      if (rule.minLength && value.toString().length < rule.minLength) {
        errors[field] = rule.message;
        break;
      }
      
      // Max length check
      if (rule.maxLength && value.toString().length > rule.maxLength) {
        errors[field] = rule.message;
        break;
      }
      
      // Pattern check
      if (rule.pattern && !rule.pattern.test(value.toString())) {
        errors[field] = rule.message;
        break;
      }
      
      // Custom validation
      if (rule.custom && !rule.custom(value)) {
        errors[field] = rule.message;
        break;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Common validation schemas
export const eventRequestSchema: ValidationSchema = {
  name: [
    { required: true, message: 'Name is required' },
    { minLength: 2, message: 'Name must be at least 2 characters' },
    { maxLength: 100, message: 'Name must be less than 100 characters' }
  ],
  email: [
    { required: true, message: 'Email is required' },
    { custom: validateEmail, message: 'Please enter a valid email address' }
  ],
  phone: [
    { required: true, message: 'Phone number is required' },
    { custom: validatePhone, message: 'Please enter a valid phone number' }
  ],
  event_date: [
    { required: true, message: 'Event date is required' },
    { custom: validateDate, message: 'Event date cannot be in the past' }
  ],
  guest_count: [
    { required: true, message: 'Number of guests is required' },
    { custom: validateGuestCount, message: 'Please enter a valid number of guests (1-10000)' }
  ]
};

export const contactMessageSchema: ValidationSchema = {
  name: [
    { required: true, message: 'Name is required' },
    { minLength: 2, message: 'Name must be at least 2 characters' },
    { maxLength: 100, message: 'Name must be less than 100 characters' }
  ],
  email: [
    { required: true, message: 'Email is required' },
    { custom: validateEmail, message: 'Please enter a valid email address' }
  ],
  message: [
    { required: true, message: 'Message is required' },
    { minLength: 10, message: 'Message must be at least 10 characters' },
    { maxLength: 2000, message: 'Message must be less than 2000 characters' }
  ]
};

export const loginSchema: ValidationSchema = {
  email: [
    { required: true, message: 'Email is required' },
    { custom: validateEmail, message: 'Please enter a valid email address' }
  ],
  password: [
    { required: true, message: 'Password is required' },
    { minLength: 8, message: 'Password must be at least 8 characters' }
  ]
};