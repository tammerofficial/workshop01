import toast from 'react-hot-toast';

interface ErrorDetails {
  message: string;
  code?: string;
  status?: number;
  url?: string;
  timestamp?: string;
  requestId?: string;
}

interface LoggedError {
  id: string;
  error: any;
  timestamp: string;
  url: string;
  userAgent: string;
  userId?: string;
  retryCount: number;
}

class ErrorServiceClass {
  private errorQueue: LoggedError[] = [];
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  /**
   * Show user-friendly error message as toast
   */
  showError(message: string, duration: number = 4000): void {
    toast.error(message, {
      duration,
      position: 'top-right',
      style: {
        background: '#ef4444',
        color: 'white',
        fontFamily: 'inherit',
        fontSize: '14px',
        borderRadius: '8px',
      },
      icon: '⚠️',
    });
  }

  /**
   * Show success message
   */
  showSuccess(message: string, duration: number = 3000): void {
    toast.success(message, {
      duration,
      position: 'top-right',
      style: {
        background: '#10b981',
        color: 'white',
        fontFamily: 'inherit',
        fontSize: '14px',
        borderRadius: '8px',
      },
      icon: '✅',
    });
  }

  /**
   * Show warning message
   */
  showWarning(message: string, duration: number = 4000): void {
    toast(message, {
      duration,
      position: 'top-right',
      style: {
        background: '#f59e0b',
        color: 'white',
        fontFamily: 'inherit',
        fontSize: '14px',
        borderRadius: '8px',
      },
      icon: '⚠️',
    });
  }

  /**
   * Show info message
   */
  showInfo(message: string, duration: number = 3000): void {
    toast(message, {
      duration,
      position: 'top-right',
      style: {
        background: '#3b82f6',
        color: 'white',
        fontFamily: 'inherit',
        fontSize: '14px',
        borderRadius: '8px',
      },
      icon: 'ℹ️',
    });
  }

  /**
   * Log error for debugging and monitoring
   */
  logError(error: any): void {
    const errorData: LoggedError = {
      id: this.generateErrorId(),
      error: this.serializeError(error),
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.getCurrentUserId(),
      retryCount: 0,
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.group('🚨 Error Logged');
      console.error('Error:', error);
      console.log('Error Data:', errorData);
      console.log('Stack Trace:', error.stack);
      console.groupEnd();
    }

    // Store in local queue
    this.errorQueue.push(errorData);
    this.limitErrorQueue();

    // Try to send to server for monitoring (non-blocking)
    this.sendErrorToServer(errorData);
  }

  /**
   * Get user-friendly error message from error object
   */
  getErrorMessage(error: any): string {
    // Check for custom error response from our API
    if (error.response?.data?.error) {
      return error.response.data.error;
    }

    // Check for validation errors
    if (error.response?.data?.details?.validation_errors) {
      const validationErrors = error.response.data.details.validation_errors;
      const firstError = Object.values(validationErrors)[0];
      return Array.isArray(firstError) ? firstError[0] : firstError;
    }

    // Default error messages based on status code
    switch (error.response?.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication required. Please login.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 422:
        return 'The provided data is invalid.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error occurred. Please try again.';
      case 502:
        return 'Service temporarily unavailable. Please try again.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        if (error.code === 'ERR_NETWORK') {
          return 'Network error. Please check your connection.';
        }
        return error.message || 'An unexpected error occurred.';
    }
  }

  /**
   * Handle error with automatic retry mechanism
   */
  async handleWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.maxRetries,
    showToast: boolean = true
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx) except 429
        if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
          break;
        }

        if (attempt < maxRetries) {
          await this.delay(this.retryDelay * attempt);
          if (showToast) {
            this.showWarning(`Retrying... (Attempt ${attempt + 1}/${maxRetries})`);
          }
        }
      }
    }

    // All retries failed
    if (showToast) {
      this.showError(this.getErrorMessage(lastError));
    }
    
    this.logError(lastError);
    throw lastError;
  }

  /**
   * Get error statistics for debugging
   */
  getErrorStats(): any {
    const stats = {
      totalErrors: this.errorQueue.length,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      recent: this.errorQueue.slice(-5),
    };

    this.errorQueue.forEach((errorData) => {
      const errorType = errorData.error.response?.data?.code || errorData.error.name || 'unknown';
      const statusCode = errorData.error.response?.status || 'unknown';

      stats.byType[errorType] = (stats.byType[errorType] || 0) + 1;
      stats.byStatus[statusCode] = (stats.byStatus[statusCode] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear error queue
   */
  clearErrorQueue(): void {
    this.errorQueue = [];
  }

  /**
   * Send error to server for centralized monitoring
   */
  private async sendErrorToServer(errorData: LoggedError): Promise<void> {
    try {
      // Only send in production or if explicitly enabled
      if (import.meta.env.PROD || localStorage.getItem('enableErrorReporting') === 'true') {
        // This would be sent to your error monitoring endpoint
        // await fetch('/api/error-monitoring/client-error', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(errorData),
        // });
      }
    } catch (error) {
      // Silently fail - don't create error loops
      console.warn('Failed to send error to server:', error);
    }
  }

  /**
   * Serialize error object for logging
   */
  private serializeError(error: any): any {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
      } : undefined,
      request: error.request ? {
        url: error.request.responseURL || error.config?.url,
        method: error.config?.method?.toUpperCase(),
      } : undefined,
    };
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current user ID from auth context
   */
  private getCurrentUserId(): string | undefined {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id;
    } catch {
      return undefined;
    }
  }

  /**
   * Limit error queue size to prevent memory issues
   */
  private limitErrorQueue(): void {
    if (this.errorQueue.length > 50) {
      this.errorQueue = this.errorQueue.slice(-25); // Keep last 25 errors
    }
  }

  /**
   * Delay utility for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const ErrorService = new ErrorServiceClass();

// Export class for testing
export { ErrorServiceClass };

// Export types
export type { ErrorDetails, LoggedError };