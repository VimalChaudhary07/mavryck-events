import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getCSRFTokenForForms, startActivityMonitoring } from '../lib/auth';
import { initializeSecurity } from '../utils/security';
import toast from 'react-hot-toast';

interface SecurityMiddlewareProps {
  children: React.ReactNode;
}

// Protected routes that require authentication
const PROTECTED_ROUTES = ['/admin/dashboard'];

// Routes that should redirect authenticated users
const AUTH_ROUTES = ['/admin'];

export function SecurityMiddleware({ children }: SecurityMiddlewareProps) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Initialize security measures
    initializeSecurity();

    const currentPath = location.pathname;
    const isAuth = isAuthenticated();

    // Check if current route requires authentication
    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
      currentPath.startsWith(route)
    );

    // Check if current route is an auth route
    const isAuthRoute = AUTH_ROUTES.includes(currentPath);

    // Redirect logic
    if (isProtectedRoute && !isAuth) {
      toast.error('Authentication required. Please log in.');
      navigate('/admin', { replace: true });
      return;
    }

    if (isAuthRoute && isAuth) {
      navigate('/admin/dashboard', { replace: true });
      return;
    }

    // Start activity monitoring for authenticated users
    if (isAuth) {
      startActivityMonitoring();
    }

    // Add security headers to the document
    const addSecurityHeaders = () => {
      // Add CSP meta tag if not already present
      if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
        const cspMeta = document.createElement('meta');
        cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
        cspMeta.setAttribute('content', 
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          "style-src 'self' 'unsafe-inline'; " +
          "img-src 'self' data: https: blob:; " +
          "font-src 'self' data:; " +
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co; " +
          "frame-ancestors 'none';"
        );
        document.head.appendChild(cspMeta);
      }

      // Add X-Frame-Options
      if (!document.querySelector('meta[http-equiv="X-Frame-Options"]')) {
        const frameMeta = document.createElement('meta');
        frameMeta.setAttribute('http-equiv', 'X-Frame-Options');
        frameMeta.setAttribute('content', 'DENY');
        document.head.appendChild(frameMeta);
      }

      // Add X-Content-Type-Options
      if (!document.querySelector('meta[http-equiv="X-Content-Type-Options"]')) {
        const contentTypeMeta = document.createElement('meta');
        contentTypeMeta.setAttribute('http-equiv', 'X-Content-Type-Options');
        contentTypeMeta.setAttribute('content', 'nosniff');
        document.head.appendChild(contentTypeMeta);
      }
    };

    addSecurityHeaders();

    // Add CSRF token to all forms
    const addCSRFTokenToForms = () => {
      const forms = document.querySelectorAll('form');
      const csrfToken = getCSRFTokenForForms();

      forms.forEach(form => {
        // Check if CSRF token already exists
        const existingToken = form.querySelector('input[name="csrf_token"]');
        if (!existingToken) {
          const csrfInput = document.createElement('input');
          csrfInput.type = 'hidden';
          csrfInput.name = 'csrf_token';
          csrfInput.value = csrfToken;
          form.appendChild(csrfInput);
        }
      });
    };

    // Add CSRF tokens after a short delay to ensure forms are rendered
    setTimeout(addCSRFTokenToForms, 100);

    // REMOVED: Prevent clickjacking code that was causing SecurityError
    // The frame-busting code has been removed as it causes navigation errors
    // We rely on X-Frame-Options and CSP headers instead

    // Production security measures
    if (import.meta.env.PROD) {
      // Disable right-click context menu
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
      };

      // Disable F12, Ctrl+Shift+I, Ctrl+U
      const handleKeyDown = (e: KeyboardEvent) => {
        // F12
        if (e.key === 'F12') {
          e.preventDefault();
        }
        // Ctrl+Shift+I
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
          e.preventDefault();
        }
        // Ctrl+U
        if (e.ctrlKey && e.key === 'u') {
          e.preventDefault();
        }
        // Ctrl+Shift+C
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
          e.preventDefault();
        }
      };

      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown);

      // Cleanup
      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [location.pathname, navigate]);

  return <>{children}</>;
}

// HOC for protecting individual components
export function withSecurity<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function SecurityWrappedComponent(props: P) {
    return (
      <SecurityMiddleware>
        <Component {...props} />
      </SecurityMiddleware>
    );
  };
}

// Hook for accessing security context
export function useSecurity() {
  const isAuth = isAuthenticated();
  const csrfToken = getCSRFTokenForForms();

  return {
    isAuthenticated: isAuth,
    csrfToken,
    getCSRFToken: getCSRFTokenForForms
  };
}