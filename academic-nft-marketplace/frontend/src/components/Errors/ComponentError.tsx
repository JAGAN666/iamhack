import React from 'react';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface ComponentErrorProps {
  error?: Error;
  resetError?: () => void;
  componentName?: string;
  onHide?: () => void;
  showDetails?: boolean;
  minimal?: boolean;
  className?: string;
}

const ComponentError: React.FC<ComponentErrorProps> = ({
  error,
  resetError,
  componentName = 'Component',
  onHide,
  showDetails = false,
  minimal = false,
  className = ''
}) => {
  if (minimal) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}
      >
        <div className="flex items-center space-x-2 text-red-600">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Failed to load {componentName}</span>
          {resetError && (
            <button
              onClick={resetError}
              className="ml-2 text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-red-50 border-2 border-red-200 rounded-lg p-6 ${className}`}
    >
      <div className="text-center">
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="mx-auto flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4"
        >
          <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
        </motion.div>

        {/* Error Title */}
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-semibold text-red-800 mb-2"
        >
          {componentName} Error
        </motion.h3>

        {/* Error Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-red-700 mb-4"
        >
          This component failed to load properly. You can try refreshing it or continue without it.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-2 justify-center"
        >
          {resetError && (
            <motion.button
              onClick={resetError}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Retry</span>
            </motion.button>
          )}
          
          {onHide && (
            <motion.button
              onClick={onHide}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <EyeSlashIcon className="w-4 h-4" />
              <span>Hide</span>
            </motion.button>
          )}
        </motion.div>

        {/* Error Details */}
        {showDetails && error && (
          <motion.details
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-left"
          >
            <summary className="cursor-pointer text-red-700 font-medium mb-2">
              Error Details
            </summary>
            <div className="bg-red-100 rounded p-3 text-xs font-mono text-red-800">
              <div className="mb-1">
                <strong>Error:</strong> {error.name}
              </div>
              <div className="mb-1">
                <strong>Message:</strong> {error.message}
              </div>
              {error.stack && (
                <div>
                  <strong>Stack:</strong>
                  <pre className="mt-1 text-xs overflow-auto max-h-24">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </motion.details>
        )}
      </div>
    </motion.div>
  );
};

// Component Error Boundary
interface ComponentErrorBoundaryProps {
  children: React.ReactNode;
  componentName?: string;
  fallback?: React.ComponentType<ComponentErrorProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  minimal?: boolean;
  showRetry?: boolean;
  showHide?: boolean;
}

export class ComponentErrorBoundary extends React.Component<
  ComponentErrorBoundaryProps,
  { hasError: boolean; error: Error | null; isHidden: boolean }
> {
  constructor(props: ComponentErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      isHidden: false 
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
    console.error(`Component Error (${this.props.componentName}):`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, isHidden: false });
  };

  handleHide = () => {
    this.setState({ isHidden: true });
  };

  render() {
    if (this.state.isHidden) {
      return null;
    }

    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || ComponentError;
      
      return (
        <FallbackComponent
          error={this.state.error!}
          resetError={this.props.showRetry !== false ? this.handleRetry : undefined}
          componentName={this.props.componentName}
          onHide={this.props.showHide !== false ? this.handleHide : undefined}
          minimal={this.props.minimal}
          showDetails={process.env.NODE_ENV === 'development'}
        />
      );
    }

    return this.props.children;
  }
}

// Hook for component error handling
export const useComponentError = (componentName?: string) => {
  const [componentError, setComponentError] = React.useState<{
    error: Error | null;
    hasError: boolean;
    isRetrying: boolean;
  }>({
    error: null,
    hasError: false,
    isRetrying: false
  });

  const captureComponentError = React.useCallback((error: Error) => {
    console.error(`Component Error${componentName ? ` (${componentName})` : ''}:`, error);
    setComponentError({
      error,
      hasError: true,
      isRetrying: false
    });
  }, [componentName]);

  const retryComponent = React.useCallback(async () => {
    setComponentError(prev => ({ ...prev, isRetrying: true }));
    
    // Small delay to show retry state
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setComponentError({
      error: null,
      hasError: false,
      isRetrying: false
    });
  }, []);

  const clearComponentError = React.useCallback(() => {
    setComponentError({
      error: null,
      hasError: false,
      isRetrying: false
    });
  }, []);

  return {
    componentError: componentError.error,
    hasComponentError: componentError.hasError,
    isRetrying: componentError.isRetrying,
    captureComponentError,
    retryComponent,
    clearComponentError
  };
};

// Higher-order component for error handling
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    componentName?: string;
    fallback?: React.ComponentType<ComponentErrorProps>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    minimal?: boolean;
  } = {}
) {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => (
    <ComponentErrorBoundary
      componentName={options.componentName || Component.displayName || Component.name}
      fallback={options.fallback}
      onError={options.onError}
      minimal={options.minimal}
    >
      <Component {...(props as P)} ref={ref} />
    </ComponentErrorBoundary>
  ));

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default ComponentError;