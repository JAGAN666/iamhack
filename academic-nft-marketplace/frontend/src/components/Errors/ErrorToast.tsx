import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { ErrorDetails } from '../../services/errorService';

interface ErrorToastProps {
  error: ErrorDetails;
  onDismiss: () => void;
  onRetry?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

interface ToastManagerProps {
  toasts: Array<{
    id: string;
    error: ErrorDetails;
    onRetry?: () => void;
    autoHide?: boolean;
  }>;
  onDismiss: (id: string) => void;
  position?: ErrorToastProps['position'];
}

const ErrorToast: React.FC<ErrorToastProps> = ({
  error,
  onDismiss,
  onRetry,
  autoHide = true,
  autoHideDelay = 6000,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 200); // Wait for animation
  };

  const getToastStyles = () => {
    const baseStyles = "fixed z-50 max-w-md w-full";
    
    switch (position) {
      case 'top-right':
        return `${baseStyles} top-4 right-4`;
      case 'top-left':
        return `${baseStyles} top-4 left-4`;
      case 'bottom-right':
        return `${baseStyles} bottom-4 right-4`;
      case 'bottom-left':
        return `${baseStyles} bottom-4 left-4`;
      case 'top-center':
        return `${baseStyles} top-4 left-1/2 transform -translate-x-1/2`;
      case 'bottom-center':
        return `${baseStyles} bottom-4 left-1/2 transform -translate-x-1/2`;
      default:
        return `${baseStyles} top-4 right-4`;
    }
  };

  const getErrorConfig = () => {
    switch (error.type) {
      case 'network':
        return {
          icon: ExclamationTriangleIcon,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-500',
          textColor: 'text-red-800'
        };
      case 'validation':
        return {
          icon: InformationCircleIcon,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-500',
          textColor: 'text-yellow-800'
        };
      case 'authentication':
      case 'authorization':
        return {
          icon: ExclamationTriangleIcon,
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          iconColor: 'text-orange-500',
          textColor: 'text-orange-800'
        };
      case 'server':
        return {
          icon: ExclamationTriangleIcon,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-500',
          textColor: 'text-red-800'
        };
      default:
        return {
          icon: InformationCircleIcon,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-500',
          textColor: 'text-gray-800'
        };
    }
  };

  const config = getErrorConfig();
  const IconComponent = config.icon;

  const getAnimationVariants = () => {
    const isTop = position.includes('top');
    const isRight = position.includes('right');
    const isLeft = position.includes('left');
    
    return {
      initial: {
        opacity: 0,
        x: isRight ? 100 : isLeft ? -100 : 0,
        y: isTop ? -20 : 20,
        scale: 0.95
      },
      animate: {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1
      },
      exit: {
        opacity: 0,
        x: isRight ? 100 : isLeft ? -100 : 0,
        y: isTop ? -20 : 20,
        scale: 0.95
      }
    };
  };

  const variants = getAnimationVariants();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={getToastStyles()}
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className={`${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg p-4`}>
            <div className="flex items-start space-x-3">
              {/* Error Icon */}
              <IconComponent className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
              
              {/* Error Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${config.textColor} mb-1`}>
                  {getErrorTitle(error.type)}
                </p>
                <p className={`text-sm ${config.textColor} opacity-90`}>
                  {error.message}
                </p>
                
                {/* Error Code */}
                {error.code && (
                  <p className={`text-xs ${config.textColor} opacity-70 mt-1`}>
                    Code: {error.code}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1">
                {onRetry && (
                  <motion.button
                    onClick={onRetry}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-1 rounded hover:bg-white/50 transition-colors ${config.iconColor}`}
                    title="Retry"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                  </motion.button>
                )}
                
                <motion.button
                  onClick={handleDismiss}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-1 rounded hover:bg-white/50 transition-colors ${config.iconColor}`}
                  title="Dismiss"
                >
                  <XMarkIcon className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Progress Bar for Auto-hide */}
            {autoHide && (
              <motion.div
                className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  className={`h-full ${config.iconColor.replace('text-', 'bg-')}`}
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: autoHideDelay / 1000, ease: 'linear' }}
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Success Toast Component
interface SuccessToastProps {
  message: string;
  onDismiss: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
  position?: ErrorToastProps['position'];
}

export const SuccessToast: React.FC<SuccessToastProps> = ({
  message,
  onDismiss,
  autoHide = true,
  autoHideDelay = 4000,
  position = 'top-right'
}) => {
  React.useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(onDismiss, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, onDismiss]);

  return (
    <motion.div
      className={`fixed z-50 max-w-md w-full ${
        position === 'top-right' ? 'top-4 right-4' : 'top-4 left-4'
      }`}
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">Success</p>
            <p className="text-sm text-green-700">{message}</p>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 rounded hover:bg-white/50 transition-colors text-green-500"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Toast Manager Component
export const ToastManager: React.FC<ToastManagerProps> = ({
  toasts,
  onDismiss,
  position = 'top-right'
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {toasts.map((toast, index) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              transform: `translateY(${index * 80}px)`
            }}
            className="pointer-events-auto"
          >
            <ErrorToast
              error={toast.error}
              onDismiss={() => onDismiss(toast.id)}
              onRetry={toast.onRetry}
              autoHide={toast.autoHide}
              position={position}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Helper function to get error title
const getErrorTitle = (type: string): string => {
  switch (type) {
    case 'network':
      return 'Connection Error';
    case 'validation':
      return 'Validation Error';
    case 'authentication':
      return 'Authentication Required';
    case 'authorization':
      return 'Access Denied';
    case 'server':
      return 'Server Error';
    case 'timeout':
      return 'Request Timeout';
    case 'chunk_load':
      return 'Loading Error';
    case 'not_found':
      return 'Not Found';
    default:
      return 'Error';
  }
};

// Hook for managing toast notifications
export const useToasts = () => {
  const [toasts, setToasts] = React.useState<Array<{
    id: string;
    error: ErrorDetails;
    onRetry?: () => void;
    autoHide?: boolean;
  }>>([]);

  const addToast = React.useCallback((
    error: ErrorDetails,
    options: { onRetry?: () => void; autoHide?: boolean } = {}
  ) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setToasts(prev => [...prev, { id, error, ...options }]);
    return id;
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts
  };
};

export default ErrorToast;