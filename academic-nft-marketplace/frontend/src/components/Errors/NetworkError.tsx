import React from 'react';
import { motion } from 'framer-motion';
import {
  WifiIcon,
  SignalSlashIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface NetworkErrorProps {
  type?: 'offline' | 'timeout' | 'server' | 'api' | 'generic';
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryLabel?: string;
  className?: string;
  showDismiss?: boolean;
  compact?: boolean;
}

const NetworkError: React.FC<NetworkErrorProps> = ({
  type = 'generic',
  message,
  onRetry,
  onDismiss,
  retryLabel = 'Try Again',
  className = '',
  showDismiss = true,
  compact = false
}) => {
  const getErrorContent = () => {
    switch (type) {
      case 'offline':
        return {
          icon: SignalSlashIcon,
          title: 'You\'re Offline',
          description: message || 'Check your internet connection and try again.',
          color: 'text-red-500',
          bg: 'bg-red-50',
          border: 'border-red-200'
        };
      case 'timeout':
        return {
          icon: ArrowPathIcon,
          title: 'Connection Timeout',
          description: message || 'The request took too long. Please try again.',
          color: 'text-orange-500',
          bg: 'bg-orange-50',
          border: 'border-orange-200'
        };
      case 'server':
        return {
          icon: ExclamationTriangleIcon,
          title: 'Server Error',
          description: message || 'Our servers are experiencing issues. Please try again later.',
          color: 'text-red-500',
          bg: 'bg-red-50',
          border: 'border-red-200'
        };
      case 'api':
        return {
          icon: WifiIcon,
          title: 'API Error',
          description: message || 'Unable to connect to our services. Please check your connection.',
          color: 'text-yellow-500',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200'
        };
      default:
        return {
          icon: WifiIcon,
          title: 'Connection Error',
          description: message || 'Something went wrong with the network connection.',
          color: 'text-gray-500',
          bg: 'bg-gray-50',
          border: 'border-gray-200'
        };
    }
  };

  const errorContent = getErrorContent();
  const IconComponent = errorContent.icon;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-center space-x-3 p-3 ${errorContent.bg} ${errorContent.border} border rounded-lg ${className}`}
      >
        <IconComponent className={`w-5 h-5 ${errorContent.color}`} />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">{errorContent.title}</p>
          <p className="text-xs text-gray-600">{errorContent.description}</p>
        </div>
        {onRetry && (
          <motion.button
            onClick={onRetry}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors"
          >
            {retryLabel}
          </motion.button>
        )}
        {showDismiss && onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`${errorContent.bg} ${errorContent.border} border-2 rounded-xl p-6 text-center ${className}`}
    >
      {/* Error Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className={`mx-auto w-16 h-16 ${errorContent.color} mb-4`}
      >
        <IconComponent className="w-full h-full" />
      </motion.div>

      {/* Error Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-semibold text-gray-800 mb-2"
      >
        {errorContent.title}
      </motion.h3>

      {/* Error Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-600 mb-6"
      >
        {errorContent.description}
      </motion.p>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3 justify-center"
      >
        {onRetry && (
          <motion.button
            onClick={onRetry}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>{retryLabel}</span>
          </motion.button>
        )}
        
        {showDismiss && onDismiss && (
          <motion.button
            onClick={onDismiss}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Dismiss
          </motion.button>
        )}
      </motion.div>

      {/* Connection Tips */}
      {type === 'offline' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-white rounded-lg border border-gray-200"
        >
          <h4 className="font-medium text-gray-800 mb-2">Quick fixes:</h4>
          <ul className="text-sm text-gray-600 text-left space-y-1">
            <li>• Check your WiFi or mobile data connection</li>
            <li>• Try moving to a different location</li>
            <li>• Restart your router or device</li>
            <li>• Contact your internet service provider</li>
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
};

// Hook for network error handling
export const useNetworkError = () => {
  const [networkError, setNetworkError] = React.useState<{
    type: NetworkErrorProps['type'];
    message?: string;
    timestamp: number;
  } | null>(null);

  const showNetworkError = React.useCallback((type: NetworkErrorProps['type'], message?: string) => {
    setNetworkError({
      type,
      message,
      timestamp: Date.now()
    });
  }, []);

  const clearNetworkError = React.useCallback(() => {
    setNetworkError(null);
  }, []);

  const handleNetworkError = React.useCallback((error: any) => {
    if (!navigator.onLine) {
      showNetworkError('offline');
      return;
    }

    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network')) {
      showNetworkError('api', error.message);
      return;
    }

    if (error.code === 'TIMEOUT_ERROR' || error.message?.includes('timeout')) {
      showNetworkError('timeout', error.message);
      return;
    }

    if (error.status >= 500) {
      showNetworkError('server', 'Server is currently unavailable');
      return;
    }

    showNetworkError('generic', error.message || 'An unexpected error occurred');
  }, [showNetworkError]);

  return {
    networkError,
    showNetworkError,
    clearNetworkError,
    handleNetworkError
  };
};

export default NetworkError;