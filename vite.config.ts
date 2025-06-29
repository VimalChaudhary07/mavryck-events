import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    // Optimize build for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          vendor: ['react', 'react-dom'],
          ui: ['framer-motion', 'lucide-react'],
          utils: ['react-hot-toast', 'react-router-dom'],
          supabase: ['@supabase/supabase-js']
        }
      }
    },
    // Enable source maps for production debugging
    sourcemap: false,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Target modern browsers for better optimization
    target: 'esnext',
    // Ensure proper asset handling
    assetsDir: 'assets',
    // Generate manifest for better caching
    manifest: true
  },
  optimizeDeps: {
    // Pre-bundle dependencies for faster dev server startup
    include: [
      'react',
      'react-dom',
      'framer-motion',
      'lucide-react',
      'react-hot-toast',
      'react-router-dom',
      '@supabase/supabase-js',
      'web-vitals'
    ]
  },
  // Enable CSS code splitting
  css: {
    devSourcemap: false
  },
  // Define environment variables for build optimization
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production')
  },
  // Ensure proper base path for deployment
  base: './'
});