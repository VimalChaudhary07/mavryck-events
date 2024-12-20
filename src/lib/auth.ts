import { toast } from 'react-hot-toast';

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

export const login = (email: string, password: string): boolean => {
  if (email === VALID_CREDENTIALS.email && password === VALID_CREDENTIALS.password) {
    localStorage.setItem('isAuthenticated', 'true');
    toast.success('Welcome back, Admin!');
    return true;
  }
  
  toast.error('Invalid credentials');
  return false;
};

export const logout = () => {
  localStorage.removeItem('isAuthenticated');
  toast.success('Logged out successfully');
};