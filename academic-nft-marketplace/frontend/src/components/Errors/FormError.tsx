import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationCircleIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface FormErrorProps {
  errors: string | string[] | Record<string, string | string[]>;
  className?: string;
  showIcon?: boolean;
  onDismiss?: () => void;
  variant?: 'inline' | 'banner' | 'toast';
  title?: string;
}

interface FieldErrorProps {
  error?: string | string[];
  touched?: boolean;
  className?: string;
  showIcon?: boolean;
}

const FormError: React.FC<FormErrorProps> = ({
  errors,
  className = '',
  showIcon = true,
  onDismiss,
  variant = 'banner',
  title = 'Please fix the following errors:'
}) => {
  const getErrorArray = (): string[] => {
    if (typeof errors === 'string') {
      return [errors];
    }
    
    if (Array.isArray(errors)) {
      return errors;
    }
    
    if (typeof errors === 'object') {
      const errorList: string[] = [];
      Object.entries(errors).forEach(([field, error]) => {
        if (typeof error === 'string') {
          errorList.push(`${field}: ${error}`);
        } else if (Array.isArray(error)) {
          error.forEach(err => errorList.push(`${field}: ${err}`));
        }
      });
      return errorList;
    }
    
    return [];
  };

  const errorArray = getErrorArray();
  
  if (errorArray.length === 0) {
    return null;
  }

  const renderContent = () => (
    <>
      {showIcon && (
        <ExclamationCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
      )}
      
      <div className="flex-1">
        {errorArray.length === 1 ? (
          <p className="text-sm text-red-700">{errorArray[0]}</p>
        ) : (
          <div>
            {title && (
              <p className="text-sm font-medium text-red-800 mb-2">{title}</p>
            )}
            <ul className="text-sm text-red-700 space-y-1">
              {errorArray.map((error, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600 transition-colors ml-2"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}
    </>
  );

  if (variant === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className={`flex items-start space-x-2 text-red-600 ${className}`}
      >
        {renderContent()}
      </motion.div>
    );
  }

  if (variant === 'toast') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg ${className}`}
      >
        <div className="flex items-start space-x-3">
          {renderContent()}
        </div>
      </motion.div>
    );
  }

  // Default: banner variant
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start space-x-3">
        {renderContent()}
      </div>
    </motion.div>
  );
};

// Field-level error component
export const FieldError: React.FC<FieldErrorProps> = ({
  error,
  touched = true,
  className = '',
  showIcon = false
}) => {
  const hasError = touched && error;
  
  if (!hasError) {
    return null;
  }

  const errorText = Array.isArray(error) ? error[0] : error;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className={`flex items-center space-x-1 mt-1 ${className}`}
      >
        {showIcon && (
          <ExclamationCircleIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
        )}
        <span className="text-sm text-red-600">{errorText}</span>
      </motion.div>
    </AnimatePresence>
  );
};

// Form validation summary component
interface ValidationSummaryProps {
  errors: Record<string, string | string[]>;
  touched: Record<string, boolean>;
  className?: string;
  title?: string;
  onFieldClick?: (field: string) => void;
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  errors,
  touched,
  className = '',
  title = 'Please fix the following errors:',
  onFieldClick
}) => {
  const visibleErrors = Object.entries(errors).filter(
    ([field, error]) => touched[field] && error
  );

  if (visibleErrors.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start space-x-3">
        <ExclamationCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 mb-2">{title}</h3>
          <ul className="space-y-1">
            {visibleErrors.map(([field, error]) => {
              const errorText = Array.isArray(error) ? error[0] : error;
              return (
                <li key={field}>
                  <button
                    type="button"
                    onClick={() => onFieldClick?.(field)}
                    className="text-sm text-red-700 hover:text-red-900 underline text-left"
                  >
                    {field}: {errorText}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

// Success message component for forms
interface FormSuccessProps {
  message: string;
  className?: string;
  onDismiss?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export const FormSuccess: React.FC<FormSuccessProps> = ({
  message,
  className = '',
  onDismiss,
  autoHide = false,
  autoHideDelay = 5000
}) => {
  React.useEffect(() => {
    if (autoHide && onDismiss) {
      const timer = setTimeout(onDismiss, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start space-x-3">
        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        
        <div className="flex-1">
          <p className="text-sm text-green-700">{message}</p>
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-green-400 hover:text-green-600 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Hook for form error management
export const useFormErrors = () => {
  const [errors, setErrors] = React.useState<Record<string, string | string[]>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const setFieldError = React.useCallback((field: string, error: string | string[]) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearFieldError = React.useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const setFieldTouched = React.useCallback((field: string, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  }, []);

  const clearAllErrors = React.useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const hasErrors = Object.keys(errors).length > 0;
  const visibleErrors = Object.entries(errors).filter(
    ([field]) => touched[field]
  ).reduce((acc, [field, error]) => ({ ...acc, [field]: error }), {});

  return {
    errors,
    touched,
    visibleErrors,
    hasErrors,
    setErrors,
    setFieldError,
    clearFieldError,
    setFieldTouched,
    clearAllErrors
  };
};

export default FormError;