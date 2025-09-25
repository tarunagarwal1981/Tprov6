'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// ===== ERROR BOUNDARY STATE =====
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

// ===== ERROR BOUNDARY PROPS =====
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

// ===== ERROR BOUNDARY COMPONENT =====
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to external service (if needed)
    this.logErrorToService(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && resetOnPropsChange) {
      if (resetKeys) {
        const hasResetKeyChanged = resetKeys.some((key, index) => 
          key !== prevProps.resetKeys?.[index]
        );
        if (hasResetKeyChanged) {
          this.resetErrorBoundary();
        }
      } else {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Here you can integrate with error logging services like Sentry, LogRocket, etc.
    console.error('Error logged to service:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  };

  private resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      this.setState(prevState => ({
        retryCount: prevState.retryCount + 1,
      }));
      this.resetErrorBoundary();
    } else {
      console.error('🚨 Max retries reached for ErrorBoundary');
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    const { hasError, error, retryCount } = this.state;
    const { children, fallback, maxRetries = 3 } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  We encountered an unexpected error. This has been logged and we're working to fix it.
                </p>
                
                {process.env.NODE_ENV === 'development' && error && (
                  <details className="text-left bg-gray-100 p-3 rounded text-xs">
                    <summary className="cursor-pointer font-medium mb-2">
                      Error Details (Development)
                    </summary>
                    <pre className="whitespace-pre-wrap text-red-600">
                      {error.message}
                      {error.stack && `\n\nStack Trace:\n${error.stack}`}
                    </pre>
                  </details>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                {retryCount < maxRetries && (
                  <Button
                    onClick={this.handleRetry}
                    className="w-full"
                    variant="default"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again ({retryCount + 1}/{maxRetries})
                  </Button>
                )}
                
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
                
                <div className="flex space-x-2">
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1"
                  >
                    <Link href="/">
                      <Home className="w-4 h-4 mr-2" />
                      Go Home
                    </Link>
                  </Button>
                  
                  <Button
                    onClick={() => window.history.back()}
                    variant="outline"
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}

// ===== HIGHER-ORDER COMPONENT WRAPPER =====
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// ===== LOADING FALLBACK COMPONENTS =====
interface LoadingFallbackProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingFallback({ 
  message = 'Loading...', 
  size = 'md',
  className = ''
}: LoadingFallbackProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 p-8 ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`} />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
}

// ===== EMPTY STATE COMPONENT =====
interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ 
  title, 
  description, 
  icon, 
  action,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

// ===== NETWORK ERROR COMPONENT =====
interface NetworkErrorProps {
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
}

export function NetworkError({ onRetry, onGoHome, className = '' }: NetworkErrorProps) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="h-6 w-6 text-red-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Connection Error</h3>
      <p className="text-sm text-gray-600 mb-6">
        Unable to connect to the server. Please check your internet connection and try again.
      </p>
      <div className="flex justify-center space-x-3">
        {onRetry && (
          <Button onClick={onRetry} variant="default">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
        {onGoHome && (
          <Button onClick={onGoHome} variant="outline">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        )}
      </div>
    </div>
  );
}

// ===== AUTH ERROR COMPONENT =====
interface AuthErrorProps {
  error: string;
  onRetry?: () => void;
  onLogin?: () => void;
  className?: string;
}

export function AuthError({ error, onRetry, onLogin, className = '' }: AuthErrorProps) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
        <AlertTriangle className="h-6 w-6 text-yellow-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Error</h3>
      <p className="text-sm text-gray-600 mb-6">{error}</p>
      <div className="flex justify-center space-x-3">
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        )}
        {onLogin && (
          <Button onClick={onLogin} variant="default">
            Sign In
          </Button>
        )}
      </div>
    </div>
  );
}

// ===== SUSPENSE WRAPPER =====
interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorBoundary?: boolean;
}

export function SuspenseWrapper({ 
  children, 
  fallback = <LoadingFallback />,
  errorBoundary = true 
}: SuspenseWrapperProps) {
  const content = errorBoundary ? (
    <ErrorBoundary fallback={<LoadingFallback message="Something went wrong" />}>
      {children}
    </ErrorBoundary>
  ) : children;

  return (
    <React.Suspense fallback={fallback}>
      {content}
    </React.Suspense>
  );
}
