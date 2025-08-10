import React from 'react';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';

interface PageErrorProps {
  title?: string;
  message?: string;
  error?: Error;
  onRetry?: () => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  showRetry?: boolean;
  showGoBack?: boolean;
  showGoHome?: boolean;
  fullPage?: boolean;
  className?: string;
}

const PageError: React.FC<PageErrorProps> = ({
  title = 'Something went wrong',
  message = 'An error occurred while loading this page. Please try again.',
  error,
  onRetry,
  onGoBack = () => window.history.back(),
  onGoHome = () => window.location.href = '/',
  showRetry = true,
  showGoBack = true,
  showGoHome = true,
  fullPage = false,
  className = ''
}) => {
  const getErrorType = (error?: Error) => {
    if (!error) return 'unknown';
    
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('chunk') || errorMessage.includes('loading')) {
      return 'chunk';
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'network';
    }
    
    if (errorMessage.includes('timeout')) {
      return 'timeout';
    }
    
    if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
      return 'permission';
    }
    
    return 'unknown';
  };

  const errorType = getErrorType(error);

  const getErrorContent = () => {
    switch (errorType) {
      case 'chunk':
        return {
          title: 'Update Available',
          message: 'A new version of the app is available. Please refresh to get the latest version.',
          actionLabel: 'Refresh Page',
          action: () => window.location.reload()
        };
      case 'network':
        return {
          title: 'Connection Error',
          message: 'Unable to load this page due to a network error. Please check your connection and try again.',
          actionLabel: 'Try Again',
          action: onRetry
        };
      case 'timeout':
        return {
          title: 'Request Timeout',
          message: 'The page took too long to load. Please try again.',
          actionLabel: 'Retry',
          action: onRetry
        };
      case 'permission':
        return {
          title: 'Access Denied',
          message: 'You don\'t have permission to view this page.',
          actionLabel: 'Go Home',
          action: onGoHome
        };
      default:
        return {
          title,
          message,
          actionLabel: 'Try Again',
          action: onRetry
        };
    }
  };

  const errorContent = getErrorContent();

  const containerClasses = fullPage 
    ? 'min-h-screen flex items-center justify-center bg-gray-50 px-4'
    : 'flex items-center justify-center py-12 px-4';

  return (
    <div className={`${containerClasses} ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="mx-auto flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6"
        >
          <ExclamationTriangleIcon className="w-10 h-10 text-red-600" />
        </motion.div>

        {/* Error Title */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-gray-900 mb-4"
        >
          {errorContent.title}
        </motion.h2>

        {/* Error Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 mb-8 leading-relaxed"
        >
          {errorContent.message}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {/* Primary Action */}
          {(showRetry && errorContent.action) && (
            <motion.button
              onClick={errorContent.action}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowPathIcon className="w-5 h-5" />
              <span>{errorContent.actionLabel}</span>
            </motion.button>
          )}

          {/* Secondary Actions */}
          <div className="flex space-x-3">
            {showGoBack && (
              <motion.button
                onClick={onGoBack}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-1"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                <span>Go Back</span>
              </motion.button>
            )}
            
            {showGoHome && (
              <motion.button
                onClick={onGoHome}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-1"
              >
                <HomeIcon className="w-4 h-4" />
                <span>Home</span>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && error && (
          <motion.details
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-left bg-gray-100 rounded-lg p-4"
          >
            <summary className="cursor-pointer text-gray-700 font-medium mb-2">
              Error Details
            </summary>
            <div className="text-xs font-mono text-gray-600 space-y-2">
              <div>
                <strong>Name:</strong> {error.name}
              </div>
              <div>
                <strong>Message:</strong> {error.message}
              </div>
              {error.stack && (
                <div>
                  <strong>Stack:</strong>
                  <pre className="mt-1 text-xs overflow-auto max-h-32 bg-white p-2 rounded border">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </motion.details>
        )}

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6"
        >
          <p className="text-sm text-gray-500">
            If this problem persists, please{' '}
            <a 
              href="/contact" 
              className="text-indigo-600 hover:text-indigo-800 underline"
            >
              contact support
            </a>
            {' '}for assistance.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

// Hook for page-level error handling
export const usePageError = () => {
  const [pageError, setPageError] = React.useState<{
    error: Error | null;
    hasError: boolean;
  }>({
    error: null,
    hasError: false
  });

  const capturePageError = React.useCallback((error: Error) => {
    console.error('Page Error:', error);
    setPageError({
      error,
      hasError: true
    });
  }, []);

  const clearPageError = React.useCallback(() => {
    setPageError({
      error: null,
      hasError: false
    });
  }, []);

  const resetPage = React.useCallback(() => {
    clearPageError();
    // Optionally trigger a page refresh or navigation
  }, [clearPageError]);

  // Auto-clear error after some time
  React.useEffect(() => {
    if (pageError.hasError) {
      const timer = setTimeout(() => {
        clearPageError();
      }, 60000); // Clear after 1 minute

      return () => clearTimeout(timer);
    }
  }, [pageError.hasError, clearPageError]);

  return {
    pageError: pageError.error,
    hasPageError: pageError.hasError,
    capturePageError,
    clearPageError,
    resetPage
  };
};

// Page Error Boundary Component
interface PageErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class PageErrorBoundary extends React.Component<
  PageErrorBoundaryProps,
  { hasError: boolean; error: Error | null }
> {
  constructor(props: PageErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
    console.error('Page Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const resetError = () => {
        this.setState({ hasError: false, error: null });
      };

      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={resetError} />;
      }

      return (
        <PageError
          error={this.state.error!}
          onRetry={resetError}
          fullPage={true}
        />
      );
    }

    return this.props.children;
  }
}

export default PageError;