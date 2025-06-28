// Performance optimization utilities

// Debounce function for search and input handling
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for scroll and resize events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Lazy loading for images
export function lazyLoadImage(img: HTMLImageElement, src: string): void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = src;
          img.classList.remove('skeleton');
          observer.unobserve(img);
        }
      });
    },
    { threshold: 0.1 }
  );
  observer.observe(img);
}

// Preload critical resources
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Memory management
export function cleanupEventListeners(element: HTMLElement): void {
  const clone = element.cloneNode(true);
  element.parentNode?.replaceChild(clone, element);
}

// Performance monitoring
export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();

  startTiming(label: string): void {
    this.metrics.set(label, performance.now());
  }

  endTiming(label: string): number {
    const startTime = this.metrics.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      console.log(`${label}: ${duration.toFixed(2)}ms`);
      this.metrics.delete(label);
      return duration;
    }
    return 0;
  }

  measureComponent(componentName: string, fn: () => void): void {
    this.startTiming(componentName);
    fn();
    this.endTiming(componentName);
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Web Vitals monitoring
export function measureWebVitals(): void {
  // Only measure web vitals in production and if the library is available
  if (import.meta.env.PROD && typeof window !== 'undefined') {
    // Dynamically import web-vitals only when needed
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS((metric) => {
        console.log('CLS:', metric);
      });
      getFID((metric) => {
        console.log('FID:', metric);
      });
      getFCP((metric) => {
        console.log('FCP:', metric);
      });
      getLCP((metric) => {
        console.log('LCP:', metric);
      });
      getTTFB((metric) => {
        console.log('TTFB:', metric);
      });
    }).catch((error) => {
      console.warn('Failed to load web-vitals:', error);
    });
  }
}

// Resource hints
export function addResourceHints(): void {
  if (typeof document === 'undefined') return;
  
  const head = document.head;

  // Preconnect to external domains
  const preconnectDomains = [
    'https://fonts.googleapis.com',
    'https://images.unsplash.com',
    'https://photos.google.com'
  ];

  preconnectDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    head.appendChild(link);
  });

  // DNS prefetch for other domains
  const dnsPrefetchDomains = [
    'https://api.supabase.co'
  ];

  dnsPrefetchDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    head.appendChild(link);
  });
}

// Initialize performance optimizations
export function initializePerformanceOptimizations(): void {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  // Add resource hints
  addResourceHints();

  // Measure web vitals in production
  if (import.meta.env.PROD) {
    measureWebVitals();
  }

  // Optimize images
  const images = document.querySelectorAll('img[data-src]');
  images.forEach((img) => {
    const src = img.getAttribute('data-src');
    if (src) {
      lazyLoadImage(img as HTMLImageElement, src);
    }
  });

  // Enable passive event listeners for better scroll performance
  document.addEventListener('touchstart', () => {}, { passive: true });
  document.addEventListener('touchmove', () => {}, { passive: true });
  document.addEventListener('wheel', () => {}, { passive: true });
}

// Optimize React rendering
export function shouldComponentUpdate(prevProps: any, nextProps: any): boolean {
  return JSON.stringify(prevProps) !== JSON.stringify(nextProps);
}

// Memoization helper
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}