'use client';

import React, { createContext, useContext, useEffect, useReducer, useState, useRef, useCallback, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User, UserRole } from '@/lib/types';

// ===== IMPROVED AUTH STATE INTERFACE =====
interface AuthState {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean; // New: tracks if auth has been initialized
  error: string | null;
  lastActivity: number; // New: tracks last activity for session management
}

// ===== AUTH ACTION TYPES =====
type AuthAction =
  | { type: 'INITIALIZE'; payload: { session: Session | null; user: SupabaseUser | null } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER_PROFILE'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_ACTIVITY' };

// ===== INITIAL STATE =====
const initialState: AuthState = {
  user: null,
  supabaseUser: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  error: null,
  lastActivity: Date.now(),
};

// ===== IMPROVED AUTH REDUCER =====
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        session: action.payload.session,
        supabaseUser: action.payload.user,
        isAuthenticated: !!action.payload.session,
        isLoading: !!action.payload.session && !state.user, // Only load if we have session but no user
        isInitialized: true,
        error: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_USER_PROFILE':
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        error: null,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
        isInitialized: true,
      };

    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        lastActivity: Date.now(),
      };

    default:
      return state;
  }
}

// ===== AUTH CONTEXT INTERFACE =====
interface AuthContextType {
  state: AuthState;
  signUp: (email: string, password: string, userData?: { name: string; role?: UserRole }) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  clearError: () => void;
  refreshSession: () => Promise<void>; // New: manual session refresh
}

// ===== AUTH CONTEXT =====
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===== IMPROVED AUTH PROVIDER =====
interface AuthProviderProps {
  children: ReactNode;
}

export function ImprovedAuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const loadingProfileRef = useRef<Set<string>>(new Set());
  const initializationRef = useRef<boolean>(false);
  const sessionRefreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const profileCacheRef = useRef<Map<string, User>>(new Map()); // Add profile caching
  const lastProcessedEventRef = useRef<string>(''); // Track last processed event to prevent duplicates
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Add loading timeout

  // ===== LOAD USER PROFILE WITH IMPROVED ERROR HANDLING =====
  const loadUserProfile = useCallback(async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      // Check cache first
      const cachedProfile = profileCacheRef.current.get(supabaseUser.id);
      if (cachedProfile) {
        console.log('📋 Using cached profile for user:', supabaseUser.id);
        return cachedProfile;
      }

      // Prevent multiple simultaneous loads
      if (loadingProfileRef.current.has(supabaseUser.id)) {
        console.log('⏳ Profile already loading for user:', supabaseUser.id);
        // Wait for existing load to complete with a shorter timeout
        let waitCount = 0;
        while (loadingProfileRef.current.has(supabaseUser.id) && waitCount < 50) {
          await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
          waitCount++;
        }
        // Return cached profile if available after wait
        return profileCacheRef.current.get(supabaseUser.id) || null;
      }

      loadingProfileRef.current.add(supabaseUser.id);
      console.log('🔍 Loading profile for user:', supabaseUser.id);

      // Shorter timeout for better UX
      const queryPromise = supabase
        .from('users')
        .select('role, name, profile')
        .eq('id', supabaseUser.id)
        .single();
      
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Profile loading timeout')), 5000) // Reduced to 5 seconds
      );
      
      const { data: userProfile, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error('❌ Error loading user profile:', error);
        // Create fallback user with default role
        const fallbackUser: User = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.email?.split('@')[0] || 'User',
          role: UserRole.TOUR_OPERATOR,
          profile: { firstName: '', lastName: '' },
          createdAt: new Date(supabaseUser.created_at),
          updatedAt: new Date(supabaseUser.updated_at || supabaseUser.created_at),
          isActive: true,
          lastLoginAt: new Date()
        };
        console.warn('⚠️ Using fallback user profile due to error');
        // Cache the fallback profile
        profileCacheRef.current.set(supabaseUser.id, fallbackUser);
        return fallbackUser;
      }

      if (!userProfile) {
        console.error('❌ User profile not found in database');
        const fallbackUser: User = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.email?.split('@')[0] || 'User',
          role: UserRole.TOUR_OPERATOR,
          profile: { firstName: '', lastName: '' },
          createdAt: new Date(supabaseUser.created_at),
          updatedAt: new Date(supabaseUser.updated_at || supabaseUser.created_at),
          isActive: true,
          lastLoginAt: new Date()
        };
        console.warn('⚠️ Using fallback user profile - no data found');
        // Cache the fallback profile
        profileCacheRef.current.set(supabaseUser.id, fallbackUser);
        return fallbackUser;
      }

      // Create user profile from database data
      const user: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: userProfile.name || supabaseUser.email?.split('@')[0] || 'User',
        role: userProfile.role as UserRole,
        profile: userProfile.profile || {},
        createdAt: new Date(supabaseUser.created_at),
        updatedAt: new Date(supabaseUser.updated_at || supabaseUser.created_at),
        isActive: true,
        lastLoginAt: new Date()
      };

      console.log('✅ User profile loaded successfully from database');
      
      // Cache the profile
      profileCacheRef.current.set(supabaseUser.id, user);
      
      return user;

    } catch (error) {
      console.error('❌ Critical error in loadUserProfile:', error);
      // Always return fallback user on any error to prevent loading loops
      const fallbackUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.email?.split('@')[0] || 'User',
        role: UserRole.TOUR_OPERATOR,
        profile: { firstName: '', lastName: '' },
        createdAt: new Date(supabaseUser.created_at),
        updatedAt: new Date(supabaseUser.updated_at || supabaseUser.created_at),
        isActive: true,
        lastLoginAt: new Date()
      };
      console.warn('⚠️ Using fallback user profile due to critical error');
      // Cache the fallback profile
      profileCacheRef.current.set(supabaseUser.id, fallbackUser);
      return fallbackUser;
    } finally {
      // Always cleanup loading state
      loadingProfileRef.current.delete(supabaseUser.id);
      console.log('🧹 Cleaned up loading state for user:', supabaseUser.id);
    }
  }, []);

  // ===== IMPROVED INITIALIZATION =====
  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    // Set a global loading timeout to prevent infinite loading
    loadingTimeoutRef.current = setTimeout(() => {
      console.warn('🚨 AuthContext: Global loading timeout reached, forcing loading to false');
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 8000); // 8 second global timeout

    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing authentication...');
        
        // Get initial session with longer timeout and better error handling
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Session initialization timeout')), 5000) // Reduced to 5 seconds
        );
        
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]);
        
        if (error) {
          console.error('❌ Error getting session:', error);
          // Initialize with no session and clear loading
          dispatch({ 
            type: 'INITIALIZE', 
            payload: { 
              session: null, 
              user: null 
            } 
          });
          console.log('⚠️ Initialized with no session due to error');
          return;
        }

        console.log('📋 Initial session:', session ? 'Found' : 'None');
        
        // Initialize with session data (even if null)
        dispatch({ 
          type: 'INITIALIZE', 
          payload: { 
            session, 
            user: session?.user || null 
          } 
        });

        // Load user profile if session exists
        if (session?.user) {
          try {
            console.log('🔄 Loading user profile during initialization...');
            const userProfile = await loadUserProfile(session.user);
            if (userProfile) {
              dispatch({ type: 'SET_USER_PROFILE', payload: userProfile });
              console.log('✅ User profile loaded during initialization');
            } else {
              console.warn('⚠️ No user profile returned, setting loading to false');
              dispatch({ type: 'SET_LOADING', payload: false });
            }
          } catch (profileError) {
            console.error('❌ Error loading profile during init:', profileError);
            // Force loading to false to prevent infinite loading
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } else {
          // No session, loading should already be false from INITIALIZE action
          console.log('✅ No session, initialization complete');
        }

        console.log('✅ Authentication initialized successfully');
        
        // Clear the global loading timeout since initialization is complete
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }

      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        // Set initialization as complete even on error to prevent infinite loading
        dispatch({ 
          type: 'INITIALIZE', 
          payload: { 
            session: null, 
            user: null 
          } 
        });
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize authentication' });
        
        // Clear the global loading timeout on error
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }
      }
    };

    initializeAuth();

    // Listen for auth changes with improved duplicate prevention
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        console.log('🔐 Auth state changed:', event, session?.user?.id);
        
        if (!initializationRef.current) return;

        // Update activity
        dispatch({ type: 'UPDATE_ACTIVITY' });

        // Prevent duplicate processing of the same session
        const currentSessionId = state.session?.user?.id;
        const newSessionId = session?.user?.id;
        const currentEventKey = `${event}-${newSessionId}`;
        
        // Check if we've already processed this exact event
        if (lastProcessedEventRef.current === currentEventKey) {
          console.log('⏭️ Skipping duplicate event:', currentEventKey);
          return;
        }
        lastProcessedEventRef.current = currentEventKey;

        // Handle different events
        switch (event) {
          case 'SIGNED_IN':
            if (session?.user && (!state.user || currentSessionId !== newSessionId)) {
              console.log('✅ Processing SIGNED_IN event');
              dispatch({ 
                type: 'INITIALIZE', 
                payload: { 
                  session, 
                  user: session.user 
                } 
              });
              // Load profile with error handling
              try {
                const userProfile = await loadUserProfile(session.user);
                if (userProfile) {
                  dispatch({ type: 'SET_USER_PROFILE', payload: userProfile });
                  console.log('✅ User profile set after SIGNED_IN');
                } else {
                  console.warn('⚠️ No user profile returned in SIGNED_IN, forcing loading to false');
                  dispatch({ type: 'SET_LOADING', payload: false });
                }
              } catch (error) {
                console.error('❌ Error loading profile in SIGNED_IN:', error);
                // Force loading to false to prevent infinite loading
                dispatch({ type: 'SET_LOADING', payload: false });
              }
            } else {
              console.log('⏭️ Skipping SIGNED_IN - already processed or no session');
            }
            break;

          case 'SIGNED_OUT':
            console.log('🚪 Processing SIGNED_OUT event');
            dispatch({ type: 'LOGOUT' });
            // Clear profile cache on logout
            profileCacheRef.current.clear();
            break;

          case 'TOKEN_REFRESHED':
            if (session?.user && !state.user) {
              console.log('🔄 Processing TOKEN_REFRESHED event');
              // Only load profile if we don't have it yet
              try {
                const userProfile = await loadUserProfile(session.user);
                if (userProfile) {
                  dispatch({ type: 'SET_USER_PROFILE', payload: userProfile });
                  console.log('✅ User profile set after TOKEN_REFRESHED');
                } else {
                  console.warn('⚠️ No user profile returned in TOKEN_REFRESHED, forcing loading to false');
                  dispatch({ type: 'SET_LOADING', payload: false });
                }
              } catch (error) {
                console.error('❌ Error loading profile in TOKEN_REFRESHED:', error);
                // Force loading to false to prevent infinite loading
                dispatch({ type: 'SET_LOADING', payload: false });
              }
            } else {
              console.log('⏭️ Skipping TOKEN_REFRESHED - user already loaded');
            }
            break;

          case 'USER_UPDATED':
            if (session?.user) {
              console.log('👤 Processing USER_UPDATED event');
              dispatch({ 
                type: 'INITIALIZE', 
                payload: { 
                  session, 
                  user: session.user 
                } 
              });
              // Clear cache for this user to force reload
              profileCacheRef.current.delete(session.user.id);
              // Load fresh profile
              try {
                const userProfile = await loadUserProfile(session.user);
                if (userProfile) {
                  dispatch({ type: 'SET_USER_PROFILE', payload: userProfile });
                } else {
                  dispatch({ type: 'SET_LOADING', payload: false });
                }
              } catch (error) {
                console.error('❌ Error loading profile in USER_UPDATED:', error);
                dispatch({ type: 'SET_LOADING', payload: false });
              }
            }
            break;

          case 'INITIAL_SESSION':
            // Handle initial session event
            if (session?.user && !state.user) {
              console.log('🔄 Processing INITIAL_SESSION event');
              try {
                const userProfile = await loadUserProfile(session.user);
                if (userProfile) {
                  dispatch({ type: 'SET_USER_PROFILE', payload: userProfile });
                  console.log('✅ User profile set after INITIAL_SESSION');
                } else {
                  console.warn('⚠️ No user profile returned in INITIAL_SESSION, forcing loading to false');
                  dispatch({ type: 'SET_LOADING', payload: false });
                }
              } catch (error) {
                console.error('❌ Error loading profile in INITIAL_SESSION:', error);
                // Force loading to false to prevent infinite loading
                dispatch({ type: 'SET_LOADING', payload: false });
              }
            }
            break;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      if (sessionRefreshTimeoutRef.current) {
        clearTimeout(sessionRefreshTimeoutRef.current);
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  // ===== IMPROVED SIGN IN =====
  const signIn = async (
    email: string, 
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Don't set loading to false here - let the auth state change handler manage it
        return { success: true };
      }

      return { success: false, error: 'Sign in failed' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // ===== IMPROVED SIGN OUT =====
  const signOut = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to sign out' });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      console.error('Error in signOut:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to sign out' });
    }
  };

  // ===== MANUAL SESSION REFRESH =====
  const refreshSession = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh session' });
      } else {
        console.log('✅ Session refreshed successfully');
        dispatch({ type: 'UPDATE_ACTIVITY' });
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh session' });
    }
  };

  // ===== OTHER METHODS (keeping existing implementations) =====
  const signUp = async (
    email: string, 
    password: string, 
    userData?: { name: string; role?: UserRole }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData?.name || email.split('@')[0],
            role: userData?.role || 'TRAVEL_AGENT',
            profile: {}
          }
        }
      });

      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        return { success: false, error: error.message };
      }

      if (data.user) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: true };
      }

      return { success: false, error: 'Sign up failed' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!state.supabaseUser) {
        return { success: false, error: 'No user logged in' };
      }

      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const { error } = await supabase.auth.updateUser({
        data: {
          name: updates.name || state.supabaseUser.user_metadata?.name,
          role: updates.role || state.supabaseUser.user_metadata?.role,
          profile: updates.profile || state.supabaseUser.user_metadata?.profile || {}
        }
      });

      if (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to update profile' });
        return { success: false, error: 'Failed to update profile' };
      }

      const updatedUser: User = {
        ...state.user!,
        ...updates,
        updatedAt: new Date()
      };
      
      dispatch({ type: 'SET_USER_PROFILE', payload: updatedUser });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Update failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        return { success: false, error: error.message };
      }

      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const updatePassword = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        return { success: false, error: error.message };
      }

      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update password';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return state.user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return state.user ? roles.includes(state.user.role) : false;
  };

  const clearError = useCallback((): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const logout = async (): Promise<void> => {
    return signOut();
  };

  const value: AuthContextType = {
    state,
    signUp,
    signIn,
    signOut,
    logout,
    updateProfile,
    resetPassword,
    updatePassword,
    hasRole,
    hasAnyRole,
    clearError,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ===== USE AUTH HOOK =====
export function useImprovedAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useImprovedAuth must be used within an ImprovedAuthProvider');
  }
  return context;
}
