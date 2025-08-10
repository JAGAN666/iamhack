import { ErrorDetails, ErrorType } from '../services/errorService';

// Error classification utilities
export const classifyError = (error: any): ErrorType => {
  if (!error) return 'unknown';

  // Check error properties
  if (error.name === 'NetworkError' || !navigator.onLine) return 'network';
  if (error.name === 'ValidationError' || error.status === 400) return 'validation';
  if (error.status === 401) return 'authentication';
  if (error.status === 403) return 'authorization';
  if (error.status === 404) return 'not_found';
  if (error.status >= 500) return 'server';
  if (error.name === 'TimeoutError') return 'timeout';
  if (error.name === 'ChunkLoadError') return 'chunk_load';

  // Check error message
  const message = error.message?.toLowerCase() || '';
  if (message.includes('network') || message.includes('fetch')) return 'network';
  if (message.includes('timeout')) return 'timeout';
  if (message.includes('chunk') || message.includes('loading')) return 'chunk_load';
  if (message.includes('validation') || message.includes('invalid')) return 'validation';
  if (message.includes('unauthorized') || message.includes('login')) return 'authentication';
  if (message.includes('forbidden') || message.includes('permission')) return 'authorization';
  if (message.includes('not found')) return 'not_found';

  return 'unknown';
};

// Error message formatting
export const formatErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.statusText) return error.response.statusText;
  return 'An unexpected error occurred';
};

// Extract error details from various error formats
export const extractErrorDetails = (error: any): Partial<ErrorDetails> => {
  const baseDetails = {
    message: formatErrorMessage(error),
    type: classifyError(error),
    timestamp: Date.now()
  };

  // Axios error format
  if (error?.response) {
    return {
      ...baseDetails,
      code: error.response.status,
      message: error.response.data?.message || error.response.statusText || baseDetails.message,
      context: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.response.data
      }
    };
  }

  // Fetch error format
  if (error?.status !== undefined) {
    return {
      ...baseDetails,
      code: error.status,
      context: {
        url: error.url,
        statusText: error.statusText
      }
    };
  }

  // Validation error format
  if (error?.errors || error?.fields) {
    return {
      ...baseDetails,
      type: 'validation',
      context: {
        errors: error.errors,
        fields: error.fields
      }
    };
  }

  return baseDetails;
};

// Check if error should be retried
export const isRetryableError = (error: any): boolean => {
  const type = classifyError(error);
  const code = error?.status || error?.code;

  // Always retryable
  if (['network', 'timeout'].includes(type)) return true;
  
  // Server errors are usually retryable
  if (type === 'server') return true;
  
  // Specific HTTP status codes
  if (code === 408 || code === 429 || code === 502 || code === 503 || code === 504) {
    return true;
  }

  // Chunk loading errors should trigger a refresh
  if (type === 'chunk_load') return true;

  return false;
};

// Get retry delay based on attempt number
export const getRetryDelay = (attemptNumber: number): number => {
  // Exponential backoff with jitter
  const baseDelay = 1000; // 1 second
  const maxDelay = 30000; // 30 seconds
  
  const delay = Math.min(baseDelay * Math.pow(2, attemptNumber), maxDelay);
  const jitter = Math.random() * 0.1 * delay; // Add 10% jitter
  
  return delay + jitter;
};

// Check if error indicates offline status
export const isOfflineError = (error: any): boolean => {
  return !navigator.onLine || 
         error?.message?.includes('Network request failed') ||
         error?.code === 'NETWORK_ERROR' ||
         error?.name === 'NetworkError';
};

// Check if error is a client-side error
export const isClientError = (error: any): boolean => {
  const code = error?.status || error?.response?.status;
  return code >= 400 && code < 500;
};

// Check if error is a server-side error
export const isServerError = (error: any): boolean => {
  const code = error?.status || error?.response?.status;
  return code >= 500 && code < 600;
};

// Sanitize error for logging (remove sensitive data)
export const sanitizeError = (error: any): any => {
  const sensitiveFields = [
    'password', 'token', 'authorization', 'cookie', 'session',
    'key', 'secret', 'private', 'credentials', 'auth'
  ];

  const sanitize = (obj: any, depth = 0): any => {
    if (depth > 5) return '[Max Depth Exceeded]'; // Prevent infinite recursion
    
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
      // Check if string contains sensitive patterns
      const lower = obj.toLowerCase();
      if (sensitiveFields.some(field => lower.includes(field))) {
        return '[REDACTED]';
      }
      return obj;
    }
    
    if (typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => sanitize(item, depth + 1));
    }
    
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitize(value, depth + 1);
      }
    }
    
    return sanitized;
  };

  return sanitize(error);
};

// Create error boundary fallback props
export const createErrorFallbackProps = (error: Error, componentName?: string) => {
  return {
    error,
    resetError: () => window.location.reload(),
    componentName: componentName || 'Component'
  };
};

// Error aggregation for multiple errors
export const aggregateErrors = (errors: any[]): {
  total: number;
  byType: Record<ErrorType, number>;
  messages: string[];
  firstError: any;
  lastError: any;
} => {
  const byType: Record<ErrorType, number> = {} as any;
  const messages: string[] = [];
  
  errors.forEach(error => {
    const type = classifyError(error);
    byType[type] = (byType[type] || 0) + 1;
    
    const message = formatErrorMessage(error);
    if (!messages.includes(message)) {
      messages.push(message);
    }
  });
  
  return {
    total: errors.length,
    byType,
    messages,
    firstError: errors[0],
    lastError: errors[errors.length - 1]
  };
};

// Create user-friendly error summary
export const createErrorSummary = (errors: any[]): string => {
  if (errors.length === 0) return 'No errors';
  if (errors.length === 1) return formatErrorMessage(errors[0]);
  
  const aggregated = aggregateErrors(errors);
  const types = Object.keys(aggregated.byType);
  
  if (types.length === 1) {
    return `${aggregated.total} ${types[0]} errors occurred`;
  }
  
  return `${aggregated.total} errors occurred (${types.join(', ')})`;
};

// Debounce error reporting to prevent spam
export const createErrorDebouncer = (delay = 1000) => {
  const errorMap = new Map<string, { count: number; timer: NodeJS.Timeout | null }>();
  
  return (errorKey: string, callback: () => void) => {
    const existing = errorMap.get(errorKey);
    
    if (existing) {
      existing.count++;
      if (existing.timer) {
        clearTimeout(existing.timer);
      }
    } else {
      errorMap.set(errorKey, { count: 1, timer: null });
    }
    
    const entry = errorMap.get(errorKey)!;
    entry.timer = setTimeout(() => {
      callback();
      errorMap.delete(errorKey);
    }, delay);
  };
};

// Rate limit error reporting
export const createErrorRateLimiter = (maxErrors = 10, windowMs = 60000) => {
  const errorCounts = new Map<string, { count: number; resetTime: number }>();
  
  return (errorKey: string): boolean => {
    const now = Date.now();
    const existing = errorCounts.get(errorKey);
    
    if (!existing || now > existing.resetTime) {
      errorCounts.set(errorKey, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (existing.count < maxErrors) {
      existing.count++;
      return true;
    }
    
    return false; // Rate limited
  };
};

// Generate error ID for tracking
export const generateErrorId = (): string => {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Create error context
export const createErrorContext = (additionalContext?: Record<string, any>) => {
  return {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    userId: getCurrentUserId(),
    sessionId: getSessionId(),
    buildVersion: process.env.NEXT_PUBLIC_BUILD_VERSION || 'unknown',
    ...additionalContext
  };
};

// Helper functions for context
const getCurrentUserId = (): string | undefined => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).id : undefined;
  } catch {
    return undefined;
  }
};

const getSessionId = (): string | undefined => {
  try {
    return sessionStorage.getItem('sessionId') || undefined;
  } catch {
    return undefined;
  }
};

// Export all utilities
export const ErrorUtils = {
  classifyError,
  formatErrorMessage,
  extractErrorDetails,
  isRetryableError,
  getRetryDelay,
  isOfflineError,
  isClientError,
  isServerError,
  sanitizeError,
  createErrorFallbackProps,
  aggregateErrors,
  createErrorSummary,
  createErrorDebouncer,
  createErrorRateLimiter,
  generateErrorId,
  createErrorContext
};