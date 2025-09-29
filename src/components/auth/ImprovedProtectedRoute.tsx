'use client';

import React, { ReactNode, useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useImprovedAuth } from '@/context/ImprovedAuthContext';
import { useLoading } from '@/context/LoadingContext';
import { UserRole } from '@/lib/types';
import { LoadingSpinner, ErrorDisplay } from '@/context/LoadingContext';

// ===== INTERFACES =====
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  redirectTo?: string;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
}

// ===== ROLE-BASED REDIRECTS =====
const defaultRoleRedirects: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: '/admin/dashboard',
  [UserRole.ADMIN]: '/admin/dashboard',
  [UserRole.TOUR_OPERATOR]: '/operator/dashboard',
  [UserRole.TRAVEL_AGENT]: '/agent/dashboard',
};

// ===== IMPROVED PROTECTED ROUTE =====
export function ImprovedProtectedRoute({
  children,
  requiredRoles,
  redirectTo,
  fallback,
  loadingComponent,
  errorComponent,
}: ProtectedRouteProps) {
  const { state: authState } = useImprovedAuth();
  const { state: loadingState, clearError } = useLoading();
  const router = useRouter();
  const pathname = usePathname();
  
  // Local state
  const [isClient, setIsClient] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [forceNoLoading, setForceNoLoading] = useState(false);
  
  // Refs for preventing infinite loops
  const redirectAttemptedRef = useRef(false);
  const lastAuthStateRef = useRef<string>('');
  const effectRunCountRef = useRef(0);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ===== AUTH STATE TRACKING =====
  const currentAuthState = `${authState.isInitialized}-${authState.isLoading}-${authState.isAuthenticated}-${authState.user?.id}`;
  
  // ===== TIMEOUT CLEANUP HELPER =====
  const clearLoadingTimeout = useCallback((reason: string) => {
    if (loadingTimeoutRef.current) {
      console.log(`🧹 ProtectedRoute: Clearing timeout - ${reason}, ID:`, loadingTimeoutRef.current);
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
      console.log('✅ ProtectedRoute: Timeout cleared successfully');
    } else {
      console.log(`ℹ️ ProtectedRoute: No timeout to clear - ${reason}`);
    }
  }, []);

  // ===== CLIENT-SIDE HYDRATION =====
  useEffect(() => {
    setIsClient(true);
    
    console.log('⏰ ProtectedRoute: Setting loading timeout (5s)');
    
    // Set a safety timeout to prevent infinite loading
    loadingTimeoutRef.current = setTimeout(() => {
      console.warn('🚨 ProtectedRoute: Loading timeout reached, forcing no loading state');
      console.log('🔍 Timeout Debug Info:', {
        isInitialized: authState.isInitialized,
        isLoading: authState.isLoading,
        isAuthenticated: authState.isAuthenticated,
        hasUser: !!authState.user,
        userRole: authState.user?.role,
        pathname,
        effectRunCount: effectRunCountRef.current,
        hasRedirected,
        forceNoLoading,
        timeoutId: loadingTimeoutRef.current,
      });
      setForceNoLoading(true);
    }, 5000); // Reduced to 5 seconds for better UX
    
    console.log('⏰ ProtectedRoute: Timeout set with ID:', loadingTimeoutRef.current);
    
    return () => {
      clearLoadingTimeout('initial cleanup');
    };
  }, [clearLoadingTimeout]);
  
  // ===== TIMEOUT CLEANUP ON AUTH RESOLUTION =====
  useEffect(() => {
    console.log('🔍 ProtectedRoute: Auth state changed, checking timeout cleanup:', {
      isInitialized: authState.isInitialized,
      hasUser: !!authState.user,
      isLoading: authState.isLoading,
      timeoutExists: !!loadingTimeoutRef.current,
      timeoutId: loadingTimeoutRef.current,
    });
    
    // Clear timeout if we have a resolved auth state
    if (authState.isInitialized && authState.user && !authState.isLoading) {
      clearLoadingTimeout('auth resolved with user');
    }
  }, [authState.isInitialized, authState.user, authState.isLoading]);
  
  // ===== REDIRECT LOGIC =====
  const handleRedirect = useCallback((targetPath: string) => {
    if (redirectAttemptedRef.current) return;
    
    redirectAttemptedRef.current = true;
    setHasRedirected(true);
    setRedirectPath(targetPath);
    
    console.log('🔄 Redirecting to:', targetPath);
    
    // Use router.push for smooth navigation
    router.push(targetPath);
  }, [router]);

  // ===== MAIN PROTECTION LOGIC =====
  useEffect(() => {
    effectRunCountRef.current += 1;
    
    // Circuit breaker - more aggressive
    if (effectRunCountRef.current > 3) {
      console.error('🚨 ProtectedRoute: Too many effect runs, breaking');
      return;
    }

    // Skip if not client-side or not initialized
    if (!isClient || !authState.isInitialized) {
      console.log('⏳ ProtectedRoute: Waiting for client-side initialization');
      return;
    }

    // Skip if already redirected
    if (hasRedirected) {
      console.log('⏳ ProtectedRoute: Already redirected, skipping');
      return;
    }

    // Skip if auth state hasn't changed
    if (lastAuthStateRef.current === currentAuthState) {
      console.log('⏳ ProtectedRoute: Auth state unchanged, skipping');
      return;
    }

    lastAuthStateRef.current = currentAuthState;
    
    // Reset effect run count when auth state actually changes
    if (effectRunCountRef.current > 0) {
      console.log('🔄 ProtectedRoute: Auth state changed, resetting effect run count');
      effectRunCountRef.current = 0;
    }

    // Force exit loading state if we've been loading too long
    if (authState.isLoading && effectRunCountRef.current > 3) {
      console.warn('🚨 ProtectedRoute: Loading state persisted too long, forcing exit');
      setForceNoLoading(true);
    }

    console.log('🛡️ ProtectedRoute: Processing auth state:', {
      isInitialized: authState.isInitialized,
      isLoading: authState.isLoading,
      isAuthenticated: authState.isAuthenticated,
      hasUser: !!authState.user,
      userRole: authState.user?.role,
      pathname,
    });

    // Clear any previous errors
    clearError();

    // Case 1: Not authenticated (no user AND not authenticated)
    if (!authState.user && !authState.isAuthenticated) {
      console.log('🚫 ProtectedRoute: Not authenticated, redirecting to login');
      const loginUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
      handleRedirect(loginUrl);
      return;
    }

    // Case 1.1: We have a user but isAuthenticated is false (inconsistent state)
    if (authState.user && !authState.isAuthenticated) {
      console.log('⚠️ ProtectedRoute: User exists but isAuthenticated is false, allowing access');
      // Clear timeout since we have a user
      clearLoadingTimeout('user exists');
      // Continue with user access - this is a valid state
    }

    // Case 1.5: Authenticated but user profile still loading
    if (authState.isAuthenticated && !authState.user && authState.isLoading && !forceNoLoading) {
      console.log('⏳ ProtectedRoute: User profile loading, waiting...');
      return;
    }

    // Case 1.5.1: Force exit loading state if timeout reached
    if (forceNoLoading) {
      console.warn('🚨 ProtectedRoute: Forced exit from loading state due to timeout');
      // Clear the loading timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }

    // Case 1.6: Authenticated but no user profile (error case)
    if (authState.isAuthenticated && !authState.user && !authState.isLoading) {
      console.log('❌ ProtectedRoute: Authenticated but no user profile, redirecting to login');
      const loginUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
      handleRedirect(loginUrl);
      return;
    }

    // Case 2: No role requirements
    if (!requiredRoles || requiredRoles.length === 0) {
      console.log('✅ ProtectedRoute: No role requirements, allowing access');
      // Clear timeout since we're allowing access
      clearLoadingTimeout('no role requirements');
      return;
    }

    // Case 3: Check role requirements
    if (authState.user && !requiredRoles.includes(authState.user.role)) {
      console.log('❌ ProtectedRoute: User does not have required role');
      
      if (redirectTo) {
        handleRedirect(redirectTo);
      } else {
        const userDashboard = defaultRoleRedirects[authState.user.role];
        if (userDashboard) {
          console.log('🔄 ProtectedRoute: Redirecting to user dashboard:', userDashboard);
          handleRedirect(userDashboard);
        } else {
          console.log('🏠 ProtectedRoute: Fallback redirect to home');
          handleRedirect('/');
        }
      }
      return;
    }

    // Case 4: All checks passed
    console.log('✅ ProtectedRoute: All checks passed, allowing access');
    console.log('🧹 ProtectedRoute: Clearing timeout since auth is resolved');
    
    // Clear the loading timeout since we're now authenticated
    clearLoadingTimeout('all checks passed');
    
    redirectAttemptedRef.current = false; // Reset for potential future redirects
    
  }, [
    isClient,
    authState.isInitialized,
    authState.isLoading,
    authState.isAuthenticated,
    authState.user?.id,
    authState.user?.role,
    pathname,
    requiredRoles,
    redirectTo,
    hasRedirected,
    currentAuthState,
    handleRedirect,
    clearError,
  ]);

  // ===== RESET REDIRECT STATE ON PATH CHANGE =====
  useEffect(() => {
    if (pathname !== redirectPath) {
      setHasRedirected(false);
      setRedirectPath(null);
      redirectAttemptedRef.current = false;
    }
  }, [pathname, redirectPath]);

  // ===== CLEANUP ON UNMOUNT =====
  useEffect(() => {
    return () => {
      clearLoadingTimeout('component unmounting');
    };
  }, []);

  // ===== RENDER LOGIC =====
  
  // Show loading during client-side hydration
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Initializing..." />
      </div>
    );
  }

  // Show loading while auth is initializing (unless forced to exit)
  if ((!authState.isInitialized || authState.isLoading) && !forceNoLoading) {
    console.log('🔄 ProtectedRoute: Showing loading spinner', {
      isInitialized: authState.isInitialized,
      isLoading: authState.isLoading,
      forceNoLoading,
      hasUser: !!authState.user,
    });
    return loadingComponent || (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Show error if there's an auth error
  if (authState.error) {
    return errorComponent || (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ErrorDisplay 
            error={authState.error}
            onRetry={() => window.location.reload()}
            className="mb-4"
          />
          <div className="text-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading if redirecting
  if (hasRedirected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Redirecting..." />
      </div>
    );
  }

  // Show fallback if not authenticated (no user AND not authenticated)
  if (!authState.user && !authState.isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  // Show loading if user profile is still loading (unless forced to exit)
  if (authState.isAuthenticated && !authState.user && authState.isLoading && !forceNoLoading) {
    return loadingComponent || (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading user profile..." />
      </div>
    );
  }

  // Show fallback if authenticated but no user profile (error case)
  if (authState.isAuthenticated && !authState.user && !authState.isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Profile Error</h2>
          <p className="text-gray-600">Unable to load user profile. Please try logging in again.</p>
        </div>
      </div>
    );
  }

  // Show fallback if role check failed
  if (requiredRoles && requiredRoles.length > 0 && authState.user && !requiredRoles.includes(authState.user.role)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Render children if all checks pass
  console.log('🎉 ProtectedRoute: Rendering children successfully', {
    isInitialized: authState.isInitialized,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    hasUser: !!authState.user,
    userRole: authState.user?.role,
    pathname,
  });
  return <>{children}</>;
}

// ===== HIGHER-ORDER COMPONENT =====
export function withImprovedAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requiredRoles?: UserRole[];
    redirectTo?: string;
    fallback?: ReactNode;
    loadingComponent?: ReactNode;
    errorComponent?: ReactNode;
  }
) {
  const WrappedComponent = (props: P) => (
    <ImprovedProtectedRoute {...options}>
      <Component {...props} />
    </ImprovedProtectedRoute>
  );

  WrappedComponent.displayName = `withImprovedAuth(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// ===== ROLE-SPECIFIC WRAPPERS =====
export function withAdminAuth<P extends object>(Component: React.ComponentType<P>) {
  return withImprovedAuth(Component, {
    requiredRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  });
}

export function withOperatorAuth<P extends object>(Component: React.ComponentType<P>) {
  return withImprovedAuth(Component, {
    requiredRoles: [UserRole.TOUR_OPERATOR],
  });
}

export function withAgentAuth<P extends object>(Component: React.ComponentType<P>) {
  return withImprovedAuth(Component, {
    requiredRoles: [UserRole.TRAVEL_AGENT],
  });
}
