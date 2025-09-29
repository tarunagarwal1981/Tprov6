'use client';

import { useEffect, useRef, useCallback } from 'react';

// ===== PERFORMANCE OPTIMIZATION HOOK =====
export function usePerformanceOptimization() {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());
  const performanceMetricsRef = useRef<{
    renderCount: number;
    averageRenderTime: number;
    lastRenderTime: number;
  }>({
    renderCount: 0,
    averageRenderTime: 0,
    lastRenderTime: 0,
  });

  // Track render performance
  useEffect(() => {
    const now = Date.now();
    const renderTime = now - lastRenderTimeRef.current;
    
    renderCountRef.current += 1;
    performanceMetricsRef.current = {
      renderCount: renderCountRef.current,
      averageRenderTime: (performanceMetricsRef.current.averageRenderTime + renderTime) / 2,
      lastRenderTime: renderTime,
    };
    
    lastRenderTimeRef.current = now;

    // Log performance warnings
    if (renderTime > 100) {
      console.warn(`🐌 Slow render detected: ${renderTime}ms (render #${renderCountRef.current})`);
    }

    if (renderCountRef.current > 10 && performanceMetricsRef.current.averageRenderTime > 50) {
      console.warn(`⚠️ High render frequency detected: ${renderCountRef.current} renders, avg ${performanceMetricsRef.current.averageRenderTime.toFixed(2)}ms`);
    }
  });

  // Debounce function for performance
  const debounce = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);

  // Throttle function for performance
  const throttle = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let lastCall = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  }, []);

  // Get performance metrics
  const getMetrics = useCallback(() => {
    return { ...performanceMetricsRef.current };
  }, []);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    renderCountRef.current = 0;
    lastRenderTimeRef.current = Date.now();
    performanceMetricsRef.current = {
      renderCount: 0,
      averageRenderTime: 0,
      lastRenderTime: 0,
    };
  }, []);

  return {
    debounce,
    throttle,
    getMetrics,
    resetMetrics,
  };
}

// ===== FAST REFRESH OPTIMIZATION =====
export function useFastRefreshOptimization() {
  const isFirstRender = useRef(true);
  const lastPropsRef = useRef<any>(null);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Log Fast Refresh events
    console.log('🔄 Fast Refresh detected');
  });

  // Memoize props comparison for better performance
  const propsChanged = useCallback((newProps: any) => {
    if (lastPropsRef.current === null) {
      lastPropsRef.current = newProps;
      return false;
    }

    const changed = JSON.stringify(lastPropsRef.current) !== JSON.stringify(newProps);
    lastPropsRef.current = newProps;
    return changed;
  }, []);

  return {
    propsChanged,
    isFirstRender: isFirstRender.current,
  };
}

// ===== LOADING STATE OPTIMIZATION =====
export function useLoadingOptimization(timeoutMs: number = 5000) {
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingStartTimeRef = useRef<number>(0);

  const startLoading = useCallback(() => {
    loadingStartTimeRef.current = Date.now();
    
    // Clear existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    // Set new timeout
    loadingTimeoutRef.current = setTimeout(() => {
      console.warn(`⏰ Loading timeout reached after ${timeoutMs}ms`);
    }, timeoutMs);
  }, [timeoutMs]);

  const stopLoading = useCallback(() => {
    const loadingTime = Date.now() - loadingStartTimeRef.current;
    
    if (loadingTime > 1000) {
      console.log(`⏱️ Loading completed in ${loadingTime}ms`);
    }

    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  return {
    startLoading,
    stopLoading,
  };
}
