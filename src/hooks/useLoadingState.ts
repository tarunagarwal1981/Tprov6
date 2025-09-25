'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  startLoading: () => void;
  stopLoading: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

/**
 * Custom hook for managing loading states with automatic timeout
 * Prevents infinite loading states and provides consistent error handling
 */
export function useLoadingState(
  timeoutMs: number = 10000,
  autoStart: boolean = false
): LoadingState {
  const [isLoading, setIsLoading] = useState(autoStart);
  const [error, setErrorState] = useState<string | null>(null);
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

  const startLoading = useCallback(() => {
    if (!isMountedRef.current) return;
    
    setIsLoading(true);
    setErrorState(null);
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        console.warn('⚠️ Loading timeout reached, stopping loading state');
        setIsLoading(false);
        setErrorState('Operation timed out. Please try again.');
      }
    }, timeoutMs);
  }, [timeoutMs]);

  const stopLoading = useCallback(() => {
    if (!isMountedRef.current) return;
    
    setIsLoading(false);
    
    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const setError = useCallback((errorMessage: string | null) => {
    if (!isMountedRef.current) return;
    
    setErrorState(errorMessage);
    setIsLoading(false);
    
    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const clearError = useCallback(() => {
    if (!isMountedRef.current) return;
    setErrorState(null);
  }, []);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setError,
    clearError,
  };
}

/**
 * Hook for managing multiple loading states
 */
export function useMultipleLoadingStates(states: string[] = []) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    states.reduce((acc, state) => ({ ...acc, [state]: false }), {})
  );

  const setLoading = useCallback((state: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [state]: isLoading
    }));
  }, []);

  const isAnyLoading = Object.values(loadingStates).some(Boolean);
  const isLoading = (state: string) => loadingStates[state] || false;

  return {
    loadingStates,
    setLoading,
    isAnyLoading,
    isLoading,
  };
}
