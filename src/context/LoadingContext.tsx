'use client';

import { createContext, useContext, useReducer, useCallback, ReactNode, useRef, useEffect } from 'react';

// ===== LOADING STATE INTERFACE =====
interface LoadingState {
  isLoading: boolean;
  error: string | null;
  operations: Record<string, boolean>; // Track individual operations
  lastError: string | null;
  retryCount: number;
}

// ===== LOADING ACTION TYPES =====
type LoadingAction =
  | { type: 'START_LOADING'; payload?: string } // Optional operation key
  | { type: 'STOP_LOADING'; payload?: string }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_RETRY_COUNT' }
  | { type: 'INCREMENT_RETRY' };

// ===== INITIAL STATE =====
const initialState: LoadingState = {
  isLoading: false,
  error: null,
  operations: {},
  lastError: null,
  retryCount: 0,
};

// ===== LOADING REDUCER =====
function loadingReducer(state: LoadingState, action: LoadingAction): LoadingState {
  switch (action.type) {
    case 'START_LOADING':
      if (action.payload) {
        return {
          ...state,
          isLoading: true,
          operations: {
            ...state.operations,
            [action.payload]: true,
          },
          error: null,
        };
      }
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'STOP_LOADING':
      if (action.payload) {
        const newOperations = { ...state.operations };
        delete newOperations[action.payload];
        const hasActiveOperations = Object.keys(newOperations).length > 0;
        
        return {
          ...state,
          isLoading: hasActiveOperations,
          operations: newOperations,
        };
      }
      return {
        ...state,
        isLoading: false,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        lastError: action.payload,
        isLoading: false,
        operations: {},
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'RESET_RETRY_COUNT':
      return {
        ...state,
        retryCount: 0,
      };

    case 'INCREMENT_RETRY':
      return {
        ...state,
        retryCount: state.retryCount + 1,
      };

    default:
      return state;
  }
}

// ===== LOADING CONTEXT INTERFACE =====
interface LoadingContextType {
  state: LoadingState;
  startLoading: (operation?: string) => void;
  stopLoading: (operation?: string) => void;
  setError: (error: string) => void;
  clearError: () => void;
  resetRetryCount: () => void;
  incrementRetry: () => void;
  isOperationLoading: (operation: string) => boolean;
  withLoading: <T>(operation: () => Promise<T>, operationKey?: string) => Promise<T>;
}

// ===== LOADING CONTEXT =====
const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// ===== LOADING PROVIDER =====
interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [state, dispatch] = useReducer(loadingReducer, initialState);
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // ===== START LOADING =====
  const startLoading = useCallback((operation?: string) => {
    dispatch({ type: 'START_LOADING', payload: operation });
    
    // Set timeout for operation
    if (operation) {
      const timeout = setTimeout(() => {
        dispatch({ type: 'SET_ERROR', payload: `Operation "${operation}" timed out` });
        timeoutRefs.current.delete(operation);
      }, 30000); // 30 second timeout
      
      timeoutRefs.current.set(operation, timeout);
    }
  }, []);

  // ===== STOP LOADING =====
  const stopLoading = useCallback((operation?: string) => {
    if (operation) {
      const timeout = timeoutRefs.current.get(operation);
      if (timeout) {
        clearTimeout(timeout);
        timeoutRefs.current.delete(operation);
      }
    }
    
    dispatch({ type: 'STOP_LOADING', payload: operation });
  }, []);

  // ===== SET ERROR =====
  const setError = useCallback((error: string) => {
    // Clear all timeouts
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current.clear();
    
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  // ===== CLEAR ERROR =====
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // ===== RESET RETRY COUNT =====
  const resetRetryCount = useCallback(() => {
    dispatch({ type: 'RESET_RETRY_COUNT' });
  }, []);

  // ===== INCREMENT RETRY =====
  const incrementRetry = useCallback(() => {
    dispatch({ type: 'INCREMENT_RETRY' });
  }, []);

  // ===== CHECK IF OPERATION IS LOADING =====
  const isOperationLoading = useCallback((operation: string) => {
    return state.operations[operation] || false;
  }, [state.operations]);

  // ===== WITH LOADING WRAPPER =====
  const withLoading = useCallback(async <T>(
    operation: () => Promise<T>,
    operationKey?: string
  ): Promise<T> => {
    try {
      startLoading(operationKey);
      clearError();
      
      const result = await operation();
      
      stopLoading(operationKey);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      throw error;
    }
  }, [startLoading, stopLoading, setError, clearError]);

  // ===== CLEANUP ON UNMOUNT =====
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current.clear();
    };
  }, []);

  const value: LoadingContextType = {
    state,
    startLoading,
    stopLoading,
    setError,
    clearError,
    resetRetryCount,
    incrementRetry,
    isOperationLoading,
    withLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}

// ===== USE LOADING HOOK =====
export function useLoading(): LoadingContextType {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

// ===== IMPROVED LOADING STATE HOOK =====
export function useImprovedLoadingState(
  timeoutMs: number = 30000,
  autoStart: boolean = false
) {
  const { state, startLoading, stopLoading, setError, clearError, withLoading } = useLoading();
  const [localLoading, setLocalLoading] = useState(autoStart);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startLocalLoading = useCallback(() => {
    if (!isMountedRef.current) return;
    
    setLocalLoading(true);
    clearError();
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        console.warn('⚠️ Local loading timeout reached');
        setLocalLoading(false);
        setError('Operation timed out. Please try again.');
      }
    }, timeoutMs);
  }, [timeoutMs, setError]);

  const stopLocalLoading = useCallback(() => {
    if (!isMountedRef.current) return;
    
    setLocalLoading(false);
    
    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const setLocalError = useCallback((errorMessage: string | null) => {
    if (!isMountedRef.current) return;
    
    setError(errorMessage || 'An error occurred');
    setLocalLoading(false);
    
    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [setError]);

  const clearLocalError = useCallback(() => {
    if (!isMountedRef.current) return;
    clearError();
  }, [clearError]);

  return {
    isLoading: localLoading || state.isLoading,
    error: state.error,
    startLoading: startLocalLoading,
    stopLoading: stopLocalLoading,
    setError: setLocalError,
    clearError: clearLocalError,
    withLoading,
    globalState: state,
  };
}

// ===== LOADING COMPONENT =====
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`} />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
}

// ===== ERROR BOUNDARY COMPONENT =====
interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorDisplay({ error, onRetry, onDismiss, className = '' }: ErrorDisplayProps) {
  return (
    <div className={`rounded-lg bg-red-50 border border-red-200 p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-800">{error}</p>
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex space-x-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="text-sm font-medium text-red-600 hover:text-red-500"
                >
                  Try again
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-sm font-medium text-red-600 hover:text-red-500"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
