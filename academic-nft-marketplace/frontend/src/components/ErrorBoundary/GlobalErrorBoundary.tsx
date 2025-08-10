import React, { Component, ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon,
  BugAntIcon
} from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class GlobalErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error for monitoring and debugging
    this.logError(error, errorInfo);

    // Report to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    // Auto-reset error boundary after some user interactions
    if (prevState.hasError && this.state.hasError) {
      this.scheduleReset();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }
  }

  private logError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.group('🚨 Global Error Boundary Caught Error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Stack Trace:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
  };

  private reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    // This would typically send to an error monitoring service like Sentry
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Example: Send to monitoring service
    // Sentry.captureException(error, { contexts: { react: errorInfo } });
    
    console.log('Error Report:', errorReport);
  };

  private scheduleReset = () => {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }

    // Auto-reset after 30 seconds of inactivity
    this.resetTimeoutId = window.setTimeout(() => {
      this.handleReset();
    }, 30000);
  };

  private handleReset = () => {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private getErrorSeverity = (error: Error): 'low' | 'medium' | 'high' | 'critical' => {
    const errorMessage = error.message.toLowerCase();
    const errorStack = error.stack?.toLowerCase() || '';
    
    // Critical errors
    if (errorMessage.includes('chunkloaderror') || 
        errorMessage.includes('loading chunk') ||
        errorStack.includes('chunk')) {
      return 'critical';
    }
    
    // High severity
    if (errorMessage.includes('network') || 
        errorMessage.includes('fetch') ||
        errorMessage.includes('timeout')) {
      return 'high';
    }
    
    // Medium severity
    if (errorMessage.includes('render') ||
        errorMessage.includes('hook') ||
        errorMessage.includes('state')) {
      return 'medium';
    }
    
    return 'low';
  };

  private getSeverityStyles = (severity: string) => {
    const styles = {
      low: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        icon: 'text-yellow-600',
        title: 'text-yellow-800'
      },
      medium: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        icon: 'text-orange-600',
        title: 'text-orange-800'
      },
      high: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: 'text-red-600',
        title: 'text-red-800'
      },
      critical: {
        bg: 'bg-red-100',
        border: 'border-red-300',
        icon: 'text-red-700',
        title: 'text-red-900'
      }
    };
    
    return styles[severity as keyof typeof styles] || styles.medium;
  };

  render() {
    if (this.state.hasError) {
      const { error } = this.state;
      
      // Use custom fallback component if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={error!} resetError={this.handleReset} />;
      }

      const severity = this.getErrorSeverity(error!);
      const styles = this.getSeverityStyles(severity);
      const isChunkError = error?.message.toLowerCase().includes('chunk');

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full"
          >
            <div className={`${styles.bg} border-2 ${styles.border} rounded-xl p-6 shadow-2xl`}>
              {/* Error Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className={`mx-auto flex items-center justify-center w-16 h-16 ${styles.icon} mb-4`}
              >
                {severity === 'critical' ? (
                  <BugAntIcon className="w-8 h-8" />
                ) : (
                  <ExclamationTriangleIcon className="w-8 h-8" />
                )}
              </motion.div>

              {/* Error Title */}
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`text-2xl font-bold ${styles.title} text-center mb-4`}
              >
                {isChunkError ? 'Update Required' : 'Something Went Wrong'}
              </motion.h1>

              {/* Error Message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-700 text-center mb-6"
              >
                {isChunkError ? (
                  <p>
                    A new version of the application is available. 
                    Please refresh the page to get the latest updates.
                  </p>
                ) : (
                  <p>
                    An unexpected error occurred while loading this page. 
                    Our team has been automatically notified.
                  </p>
                )}
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                {/* Primary Action */}
                <motion.button
                  onClick={isChunkError ? this.handleReload : this.handleReset}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                  <span>{isChunkError ? 'Refresh Page' : 'Try Again'}</span>
                </motion.button>

                {/* Secondary Actions */}
                <div className="flex space-x-3">
                  {!isChunkError && (
                    <motion.button
                      onClick={this.handleReload}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Reload
                    </motion.button>
                  )}
                  
                  <motion.button
                    onClick={this.handleGoHome}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-1"
                  >
                    <HomeIcon className="w-4 h-4" />
                    <span>Home</span>
                  </motion.button>
                </div>
              </motion.div>

              {/* Error Details for Development */}
              {process.env.NODE_ENV === 'development' && (
                <motion.details
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6"
                >
                  <summary className="cursor-pointer text-gray-600 font-medium mb-2">
                    Debug Information
                  </summary>
                  <div className="bg-gray-100 rounded p-3 text-xs font-mono text-gray-800">
                    <div className="mb-2">
                      <strong>Error:</strong> {error?.name}
                    </div>
                    <div className="mb-2">
                      <strong>Message:</strong> {error?.message}
                    </div>
                    {error?.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="mt-1 text-xs overflow-auto max-h-32">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </motion.details>
              )}
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  // Reset error when component unmounts
  React.useEffect(() => {
    return () => {
      setError(null);
    };
  }, []);

  return {
    error,
    resetError,
    captureError,
    hasError: error !== null
  };
};

export default GlobalErrorBoundary;