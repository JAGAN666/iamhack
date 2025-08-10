import toast from 'react-hot-toast';

// Error types
export type ErrorType = 
  | 'network'
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'not_found'
  | 'server'
  | 'client'
  | 'timeout'
  | 'chunk_load'
  | 'unknown';

export interface ErrorDetails {
  type: ErrorType;
  message: string;
  code?: string | number;
  field?: string;
  context?: Record<string, any>;
  timestamp: number;
  stack?: string;
  componentName?: string;
}

export interface ErrorHandler {
  canHandle: (error: any) => boolean;
  handle: (error: any, context?: Record<string, any>) => ErrorDetails;
}

class ErrorService {
  private handlers: ErrorHandler[] = [];
  private errorHistory: ErrorDetails[] = [];
  private maxHistorySize = 50;

  constructor() {
    this.registerDefaultHandlers();
    this.setupGlobalErrorHandlers();
  }

  // Register error handlers
  registerHandler(handler: ErrorHandler) {
    this.handlers.push(handler);
  }

  // Process and categorize errors
  processError(error: any, context?: Record<string, any>): ErrorDetails {
    // Find appropriate handler
    const handler = this.handlers.find(h => h.canHandle(error));
    
    let errorDetails: ErrorDetails;
    
    if (handler) {
      errorDetails = handler.handle(error, context);
    } else {
      errorDetails = this.createGenericError(error, context);
    }

    // Add to history
    this.addToHistory(errorDetails);

    // Log error
    this.logError(errorDetails);

    return errorDetails;
  }

  // Handle and display error
  handleError(error: any, options: {
    context?: Record<string, any>;
    showToast?: boolean;
    toastType?: 'error' | 'warning' | 'info';
    silent?: boolean;
  } = {}) {
    const {
      context,
      showToast = true,
      toastType = 'error',
      silent = false
    } = options;

    const errorDetails = this.processError(error, context);

    if (!silent && showToast) {
      this.showErrorToast(errorDetails, toastType);
    }

    return errorDetails;
  }

  // Show error toast notification
  private showErrorToast(errorDetails: ErrorDetails, type: 'error' | 'warning' | 'info' = 'error') {
    const message = this.getDisplayMessage(errorDetails);
    
    switch (type) {
      case 'error':
        toast.error(message, {
          duration: 6000,
          position: 'top-right'
        });
        break;
      case 'warning':
        toast(message, {
          icon: '⚠️',
          duration: 5000,
          position: 'top-right'
        });
        break;
      case 'info':
        toast(message, {
          icon: 'ℹ️',
          duration: 4000,
          position: 'top-right'
        });
        break;
    }
  }

  // Get user-friendly display message
  private getDisplayMessage(errorDetails: ErrorDetails): string {
    switch (errorDetails.type) {
      case 'network':
        return 'Network error. Please check your connection and try again.';
      case 'authentication':
        return 'Please log in to continue.';
      case 'authorization':
        return 'You don\'t have permission to perform this action.';
      case 'validation':
        return errorDetails.field 
          ? `${errorDetails.field}: ${errorDetails.message}`
          : errorDetails.message;
      case 'not_found':
        return 'The requested resource was not found.';
      case 'server':
        return 'Server error. Please try again later.';
      case 'timeout':
        return 'Request timeout. Please try again.';
      case 'chunk_load':
        return 'Failed to load application resources. Please refresh the page.';
      default:
        return errorDetails.message || 'An unexpected error occurred.';
    }
  }

  // Register default error handlers
  private registerDefaultHandlers() {
    // Network errors
    this.registerHandler({
      canHandle: (error) => 
        error?.name === 'NetworkError' ||
        error?.message?.includes('Network') ||
        error?.message?.includes('fetch') ||
        !navigator.onLine,
      handle: (error, context) => ({
        type: 'network',
        message: error.message || 'Network connection failed',
        code: error.code,
        context,
        timestamp: Date.now(),
        stack: error.stack
      })
    });

    // Validation errors
    this.registerHandler({
      canHandle: (error) => 
        error?.name === 'ValidationError' ||
        error?.status === 400 ||
        error?.response?.status === 400,
      handle: (error, context) => ({
        type: 'validation',
        message: error.message || 'Validation failed',
        code: error.code || error.status,
        field: error.field,
        context,
        timestamp: Date.now(),
        stack: error.stack
      })
    });

    // Authentication errors
    this.registerHandler({
      canHandle: (error) => 
        error?.status === 401 ||
        error?.response?.status === 401 ||
        error?.name === 'AuthenticationError',
      handle: (error, context) => ({
        type: 'authentication',
        message: error.message || 'Authentication required',
        code: 401,
        context,
        timestamp: Date.now(),
        stack: error.stack
      })
    });

    // Authorization errors
    this.registerHandler({
      canHandle: (error) => 
        error?.status === 403 ||
        error?.response?.status === 403 ||
        error?.name === 'AuthorizationError',
      handle: (error, context) => ({
        type: 'authorization',
        message: error.message || 'Access denied',
        code: 403,
        context,
        timestamp: Date.now(),
        stack: error.stack
      })
    });

    // Not found errors
    this.registerHandler({
      canHandle: (error) => 
        error?.status === 404 ||
        error?.response?.status === 404,
      handle: (error, context) => ({
        type: 'not_found',
        message: error.message || 'Resource not found',
        code: 404,
        context,
        timestamp: Date.now(),
        stack: error.stack
      })
    });

    // Server errors
    this.registerHandler({
      canHandle: (error) => 
        (error?.status >= 500 && error?.status < 600) ||
        (error?.response?.status >= 500 && error?.response?.status < 600),
      handle: (error, context) => ({
        type: 'server',
        message: error.message || 'Internal server error',
        code: error.status || error.response?.status,
        context,
        timestamp: Date.now(),
        stack: error.stack
      })
    });

    // Timeout errors
    this.registerHandler({
      canHandle: (error) => 
        error?.name === 'TimeoutError' ||
        error?.code === 'ECONNABORTED' ||
        error?.message?.includes('timeout'),
      handle: (error, context) => ({
        type: 'timeout',
        message: error.message || 'Request timeout',
        code: error.code,
        context,
        timestamp: Date.now(),
        stack: error.stack
      })
    });

    // Chunk loading errors (dynamic imports)
    this.registerHandler({
      canHandle: (error) => 
        error?.name === 'ChunkLoadError' ||
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('Loading CSS chunk'),
      handle: (error, context) => ({
        type: 'chunk_load',
        message: error.message || 'Failed to load application chunk',
        code: 'CHUNK_LOAD_ERROR',
        context,
        timestamp: Date.now(),
        stack: error.stack
      })
    });
  }

  // Create generic error details
  private createGenericError(error: any, context?: Record<string, any>): ErrorDetails {
    return {
      type: 'unknown',
      message: error?.message || String(error) || 'Unknown error occurred',
      code: error?.code || error?.status,
      context,
      timestamp: Date.now(),
      stack: error?.stack
    };
  }

  // Add error to history
  private addToHistory(errorDetails: ErrorDetails) {
    this.errorHistory.unshift(errorDetails);
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
    }
  }

  // Log error for debugging and monitoring
  private logError(errorDetails: ErrorDetails) {
    const logLevel = this.getLogLevel(errorDetails.type);
    const logData = {
      ...errorDetails,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId()
    };

    switch (logLevel) {
      case 'error':
        console.error('Error:', logData);
        break;
      case 'warn':
        console.warn('Warning:', logData);
        break;
      case 'info':
        console.info('Info:', logData);
        break;
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportToMonitoring(logData);
    }
  }

  // Get log level based on error type
  private getLogLevel(type: ErrorType): 'error' | 'warn' | 'info' {
    switch (type) {
      case 'server':
      case 'chunk_load':
      case 'unknown':
        return 'error';
      case 'network':
      case 'timeout':
      case 'authentication':
        return 'warn';
      case 'validation':
      case 'authorization':
      case 'not_found':
        return 'info';
      default:
        return 'info';
    }
  }

  // Report to monitoring service
  private reportToMonitoring(errorData: any) {
    // This would integrate with services like Sentry, LogRocket, etc.
    // Example:
    // Sentry.captureException(new Error(errorData.message), {
    //   contexts: { error: errorData }
    // });
    
    console.log('Would report to monitoring:', errorData);
  }

  // Get current user ID for context
  private getCurrentUserId(): string | undefined {
    try {
      // This would integrate with your auth system
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user).id : undefined;
    } catch {
      return undefined;
    }
  }

  // Setup global error handlers
  private setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, {
        context: { type: 'unhandledPromiseRejection' },
        showToast: true
      });
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message), {
        context: { 
          type: 'globalError',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        },
        showToast: true
      });
    });
  }

  // Get error history
  getErrorHistory(): ErrorDetails[] {
    return [...this.errorHistory];
  }

  // Clear error history
  clearErrorHistory() {
    this.errorHistory = [];
  }

  // Get error statistics
  getErrorStats() {
    const stats = {
      total: this.errorHistory.length,
      byType: {} as Record<ErrorType, number>,
      recent: this.errorHistory.filter(e => 
        Date.now() - e.timestamp < 60 * 60 * 1000 // Last hour
      ).length
    };

    this.errorHistory.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
    });

    return stats;
  }
}

// Create singleton instance
export const errorService = new ErrorService();

// Convenience function for handling errors
export const handleError = (error: any, options?: Parameters<typeof errorService.handleError>[1]) => {
  return errorService.handleError(error, options);
};

// Convenience function for processing errors without showing toast
export const processError = (error: any, context?: Record<string, any>) => {
  return errorService.processError(error, context);
};

export default errorService;