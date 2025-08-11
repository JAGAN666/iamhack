import React, { lazy, Suspense, ComponentType, LazyExoticComponent } from 'react';
import { motion } from 'framer-motion';

// Loading spinner component
const LoadingSpinner: React.FC<{ 
  text?: string; 
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}> = ({ 
  text = 'Loading...', 
  size = 'md',
  fullPage = false 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  const containerClasses = fullPage 
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`${sizeClasses[size]} border-2 border-indigo-500 border-t-transparent rounded-full`}
        />
        <p className="mt-3 text-sm text-gray-600">{text}</p>
      </div>
    </div>
  );
};

// Error boundary for lazy-loaded components
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class LazyLoadErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent />;
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="w-16 h-16 mb-4 text-red-500">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
        />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      Failed to load component
    </h3>
    <p className="text-sm text-gray-600 mb-4">
      There was an error loading this part of the application.
    </p>
    <button
      onClick={() => window.location.reload()}
      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
    >
      Reload Page
    </button>
  </div>
);

// Enhanced lazy loading with preloading capabilities
interface LazyComponentOptions {
  loadingText?: string;
  loadingSize?: 'sm' | 'md' | 'lg';
  fullPageLoading?: boolean;
  errorFallback?: React.ComponentType;
  preloadDelay?: number;
  retryAttempts?: number;
}

export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
): LazyExoticComponent<T> & { preload: () => Promise<void> } {
  const {
    loadingText = 'Loading component...',
    loadingSize = 'md',
    fullPageLoading = false,
    errorFallback,
    preloadDelay = 0,
    retryAttempts = 3
  } = options;

  let importPromise: Promise<{ default: T }> | null = null;
  
  // Create import function with retry logic
  const importWithRetry = async (attempt = 1): Promise<{ default: T }> => {
    try {
      return await importFn();
    } catch (error) {
      if (attempt < retryAttempts) {
        console.warn(`Lazy loading attempt ${attempt} failed, retrying...`, error);
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        return importWithRetry(attempt + 1);
      }
      throw error;
    }
  };

  // Memoize the import promise
  const getImportPromise = () => {
    if (!importPromise) {
      importPromise = importWithRetry();
    }
    return importPromise;
  };

  const LazyComponent = lazy(getImportPromise);

  const WrappedComponent = React.forwardRef<any, any>((props, ref) => (
    <LazyLoadErrorBoundary fallback={errorFallback}>
      <Suspense 
        fallback={
          <LoadingSpinner 
            text={loadingText} 
            size={loadingSize}
            fullPage={fullPageLoading}
          />
        }
      >
        <LazyComponent {...(props as any)} {...(ref ? { ref } : {})} />
      </Suspense>
    </LazyLoadErrorBoundary>
  ));

  // Add preload function
  const preload = async (): Promise<void> => {
    if (preloadDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, preloadDelay));
    }
    try {
      await getImportPromise();
      console.log(`✅ Preloaded component`);
    } catch (error) {
      console.error('❌ Failed to preload component:', error);
    }
  };

  WrappedComponent.displayName = `LazyComponent`;
  (WrappedComponent as any).preload = preload;

  return WrappedComponent as LazyExoticComponent<T> & { preload: () => Promise<void> };
}

// Route-based code splitting helper
export const LazyRoute: React.FC<{
  component: LazyExoticComponent<any>;
  loading?: React.ComponentType;
  error?: React.ComponentType;
  fullPage?: boolean;
}> = ({ 
  component: Component, 
  loading: LoadingComponent = () => <LoadingSpinner fullPage={true} />,
  error: ErrorComponent,
  fullPage = true,
  ...props 
}) => (
  <LazyLoadErrorBoundary fallback={ErrorComponent}>
    <Suspense fallback={<LoadingComponent />}>
      <Component {...props} />
    </Suspense>
  </LazyLoadErrorBoundary>
);

// Intersection Observer based lazy loading for images and components
interface LazyRenderOptions {
  rootMargin?: string;
  threshold?: number;
  fallback?: React.ComponentType;
  placeholder?: React.ComponentType;
}

export const LazyRender: React.FC<{
  children: React.ReactNode;
  options?: LazyRenderOptions;
  className?: string;
}> = ({ 
  children, 
  options = {},
  className = '' 
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const elementRef = React.useRef<HTMLDivElement>(null);

  const {
    rootMargin = '50px',
    threshold = 0.1,
    placeholder: Placeholder,
    fallback: Fallback
  } = options;

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.unobserve(element);
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [rootMargin, threshold, hasLoaded]);

  return (
    <div ref={elementRef} className={className}>
      {isVisible ? (
        children
      ) : Placeholder ? (
        <Placeholder />
      ) : (
        <div className="animate-pulse bg-gray-200 rounded h-32" />
      )}
    </div>
  );
};

// Lazy image component with progressive loading
export const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: (error: Event) => void;
}> = ({ 
  src, 
  alt, 
  className = '', 
  placeholder,
  blurDataURL,
  onLoad,
  onError 
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(img);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(img);

    return () => {
      observer.unobserve(img);
    };
  }, []);

  const handleLoad = React.useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = React.useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    onError?.(event.nativeEvent);
  }, [onError]);

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse">
          {blurDataURL && (
            <img
              src={blurDataURL}
              alt=""
              className="w-full h-full object-cover opacity-50 blur-sm"
              aria-hidden="true"
            />
          )}
        </div>
      )}

      {/* Actual image */}
      {isVisible && (
        <img
          src={hasError ? placeholder || '/images/placeholder.png' : src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-gray-400 text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Image not available</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Preloader for critical components
export class ComponentPreloader {
  private static preloadPromises: Map<string, Promise<void>> = new Map();

  static async preloadRoutes(routes: Array<{ name: string; component: any }>) {
    console.log('🚀 Preloading critical route components...');
    
    const promises = routes.map(async ({ name, component }) => {
      if (this.preloadPromises.has(name)) {
        return this.preloadPromises.get(name);
      }

      const preloadPromise = component.preload?.() || Promise.resolve();
      this.preloadPromises.set(name, preloadPromise);
      
      try {
        await preloadPromise;
        console.log(`✅ Preloaded ${name} component`);
      } catch (error) {
        console.error(`❌ Failed to preload ${name}:`, error);
      }
      
      return preloadPromise;
    });

    await Promise.allSettled(promises);
    console.log('🎉 Route preloading completed');
  }

  static preloadOnHover(element: HTMLElement, component: any) {
    const handleMouseEnter = () => {
      component.preload?.();
      element.removeEventListener('mouseenter', handleMouseEnter);
    };

    element.addEventListener('mouseenter', handleMouseEnter, { once: true });
  }

  static preloadOnIdle(component: any, delay = 2000) {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        setTimeout(() => component.preload?.(), delay);
      });
    } else {
      setTimeout(() => component.preload?.(), delay);
    }
  }
}

export default {
  createLazyComponent,
  LazyRoute,
  LazyRender,
  LazyImage,
  ComponentPreloader,
  LoadingSpinner
};