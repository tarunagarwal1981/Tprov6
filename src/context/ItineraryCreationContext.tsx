'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useImprovedAuth } from './ImprovedAuthContext';
import { 
  ItineraryCreationState, 
  ItineraryCreationActions, 
  ItineraryCreationContextType,
  ItineraryCreationStep,
  SelectedPackage,
  EnhancedPackage,
  ItineraryCreationFilters,
  DayAssignment,
  ItineraryDayActivity,
  BudgetTracker,
  PackageRecommendation
} from '@/lib/types/itinerary-creation';
import { ItineraryDay } from '@/lib/types/agent';

// Action types
type ItineraryCreationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'SET_CURRENT_STEP'; payload: ItineraryCreationStep }
  | { type: 'SET_LEAD'; payload: ItineraryCreationState['lead'] }
  | { type: 'SET_AVAILABLE_PACKAGES'; payload: EnhancedPackage[] }
  | { type: 'SET_SELECTED_PACKAGES'; payload: SelectedPackage[] }
  | { type: 'ADD_PACKAGE'; payload: SelectedPackage }
  | { type: 'REMOVE_PACKAGE'; payload: string }
  | { type: 'UPDATE_PACKAGE_QUANTITY'; payload: { packageId: string; quantity: number } }
  | { type: 'SET_FILTERS'; payload: ItineraryCreationFilters }
  | { type: 'SET_RECOMMENDATIONS'; payload: PackageRecommendation[] }
  | { type: 'SET_ITINERARY_DAYS'; payload: ItineraryDay[] }
  | { type: 'SET_DAY_ASSIGNMENTS'; payload: DayAssignment[] }
  | { type: 'UPDATE_BUDGET'; payload: BudgetTracker }
  | { type: 'SET_SELECTED_PACKAGE_IDS'; payload: Set<string> }
  | { type: 'TOGGLE_EXPANDED_DAY'; payload: string }
  | { type: 'SET_UI_STATE'; payload: Partial<Pick<ItineraryCreationState, 'showRecommendations' | 'showFilters'>> }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: ItineraryCreationState = {
  sessionId: '',
  currentStep: 'PACKAGE_SELECTION',
  isLoading: false,
  error: undefined,
  lead: {
    id: '',
    customerName: '',
    email: '',
    destination: '',
    budget: 0,
    tripType: '',
    travelers: 1,
    duration: 0,
    preferences: [],
    specialRequirements: []
  },
  availablePackages: [],
  selectedPackages: [],
  packageFilters: {
    searchTerm: '',
    packageTypes: [],
    priceRange: { min: 0, max: 10000 },
    duration: { min: 1, max: 30 },
    destinations: [],
    operators: [],
    rating: 0,
    sortBy: 'relevance',
    sortOrder: 'desc'
  },
  packageRecommendations: [],
  itineraryDays: [],
  dayAssignments: [],
  budget: {
    total: 0,
    used: 0,
    remaining: 0,
    overBudget: false,
    overBudgetAmount: 0,
    packageCosts: {},
    dailyCosts: {}
  },
  selectedPackageIds: new Set(),
  expandedDays: new Set(),
  showRecommendations: true,
  showFilters: false
};

// Reducer
function itineraryCreationReducer(
  state: ItineraryCreationState,
  action: ItineraryCreationAction
): ItineraryCreationState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    
    case 'SET_LEAD':
      return { ...state, lead: action.payload };
    
    case 'SET_AVAILABLE_PACKAGES':
      return { ...state, availablePackages: action.payload };
    
    case 'SET_SELECTED_PACKAGES':
      return { ...state, selectedPackages: action.payload };
    
    case 'ADD_PACKAGE': {
      const newSelectedPackages = [...state.selectedPackages, action.payload];
      const newSelectedPackageIds = new Set(state.selectedPackageIds);
      newSelectedPackageIds.add(action.payload.id);
      return {
        ...state,
        selectedPackages: newSelectedPackages,
        selectedPackageIds: newSelectedPackageIds
      };
    }
    
    case 'REMOVE_PACKAGE': {
      const newSelectedPackages = state.selectedPackages.filter(p => p.id !== action.payload);
      const newSelectedPackageIds = new Set(state.selectedPackageIds);
      newSelectedPackageIds.delete(action.payload);
      return {
        ...state,
        selectedPackages: newSelectedPackages,
        selectedPackageIds: newSelectedPackageIds
      };
    }
    
    case 'UPDATE_PACKAGE_QUANTITY': {
      const { packageId, quantity } = action.payload;
      const newSelectedPackages = state.selectedPackages.map(p =>
        p.id === packageId ? { ...p, quantity, totalPrice: p.price * quantity } : p
      );
      return { ...state, selectedPackages: newSelectedPackages };
    }
    
    case 'SET_FILTERS':
      return { ...state, packageFilters: action.payload };
    
    case 'SET_RECOMMENDATIONS':
      return { ...state, packageRecommendations: action.payload };
    
    case 'SET_ITINERARY_DAYS':
      return { ...state, itineraryDays: action.payload };
    
    case 'SET_DAY_ASSIGNMENTS':
      return { ...state, dayAssignments: action.payload };
    
    case 'UPDATE_BUDGET':
      return { ...state, budget: action.payload };
    
    case 'SET_SELECTED_PACKAGE_IDS':
      return { ...state, selectedPackageIds: action.payload };
    
    case 'TOGGLE_EXPANDED_DAY': {
      const newExpandedDays = new Set(state.expandedDays);
      if (newExpandedDays.has(action.payload)) {
        newExpandedDays.delete(action.payload);
      } else {
        newExpandedDays.add(action.payload);
      }
      return { ...state, expandedDays: newExpandedDays };
    }
    
    case 'SET_UI_STATE':
      return { ...state, ...action.payload };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// Context
const ItineraryCreationContext = createContext<ItineraryCreationContextType | undefined>(undefined);

// Provider component
interface ItineraryCreationProviderProps {
  children: React.ReactNode;
  leadId?: string;
}

export function ItineraryCreationProvider({ children, leadId }: ItineraryCreationProviderProps) {
  const { state: authState } = useImprovedAuth();
  const [state, dispatch] = useReducer(itineraryCreationReducer, initialState);

  // Calculate budget
  const calculateBudget = useCallback((): BudgetTracker => {
    const total = state.lead.budget;
    const used = state.selectedPackages.reduce((sum, pkg) => sum + pkg.totalPrice, 0);
    const remaining = total - used;
    const overBudget = used > total;
    const overBudgetAmount = overBudget ? used - total : 0;

    const packageCosts = state.selectedPackages.reduce((acc, pkg) => {
      acc[pkg.id] = pkg.totalPrice;
      return acc;
    }, {} as Record<string, number>);

    const dailyCosts = state.dayAssignments.reduce((acc, day) => {
      acc[day.dayId] = day.totalCost;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      used,
      remaining,
      overBudget,
      overBudgetAmount,
      packageCosts,
      dailyCosts
    };
  }, [state.lead.budget, state.selectedPackages, state.dayAssignments]);

  // Update budget when dependencies change
  useEffect(() => {
    const newBudget = calculateBudget();
    dispatch({ type: 'UPDATE_BUDGET', payload: newBudget });
  }, [calculateBudget]);

  // Actions
  const actions: ItineraryCreationActions = {
    // Session management
    createSession: useCallback(async (leadId: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        // TODO: Implement session creation API call
        console.log('Creating session for lead:', leadId);
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to create session' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, []),

    updateSession: useCallback(async (updates) => {
      // TODO: Implement session update API call
      console.log('Updating session:', updates);
    }, []),

    loadSession: useCallback(async (sessionId: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        // TODO: Implement session loading API call
        console.log('Loading session:', sessionId);
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load session' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, []),

    // Package selection
    loadAvailablePackages: useCallback(async (filters) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        // TODO: Implement package loading API call
        console.log('Loading packages with filters:', filters);
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load packages' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, []),

    addPackage: useCallback((pkg: EnhancedPackage) => {
      const selectedPackage: SelectedPackage = {
        id: `selected-${pkg.id}`,
        packageId: pkg.id,
        packageName: pkg.title,
        operatorId: pkg.operatorId,
        operatorName: pkg.operatorName,
        price: pkg.pricing.adult,
        quantity: 1,
        totalPrice: pkg.pricing.adult,
        duration: pkg.duration,
        type: pkg.type,
        destinations: pkg.destinations,
        addedAt: new Date()
      };
      dispatch({ type: 'ADD_PACKAGE', payload: selectedPackage });
    }, []),

    removePackage: useCallback((packageId: string) => {
      dispatch({ type: 'REMOVE_PACKAGE', payload: packageId });
    }, []),

    updatePackageQuantity: useCallback((packageId: string, quantity: number) => {
      dispatch({ type: 'UPDATE_PACKAGE_QUANTITY', payload: { packageId, quantity } });
    }, []),

    // Filtering and search
    updateFilters: useCallback((filters) => {
      const newFilters = { ...state.packageFilters, ...filters };
      dispatch({ type: 'SET_FILTERS', payload: newFilters });
    }, [state.packageFilters]),

    clearFilters: useCallback(() => {
      dispatch({ type: 'SET_FILTERS', payload: initialState.packageFilters });
    }, []),

    searchPackages: useCallback((searchTerm: string) => {
      dispatch({ type: 'SET_FILTERS', payload: { ...state.packageFilters, searchTerm } });
    }, [state.packageFilters]),

    // Recommendations
    loadRecommendations: useCallback(async () => {
      // TODO: Implement recommendations loading
      console.log('Loading recommendations');
    }, []),

    refreshRecommendations: useCallback(async () => {
      // TODO: Implement recommendations refresh
      console.log('Refreshing recommendations');
    }, []),

    // Day planning
    loadItineraryDays: useCallback(() => {
      // Create initial days if none exist
      if (state.itineraryDays.length === 0 && state.lead.duration > 0) {
        const initialDays = Array.from({ length: state.lead.duration }, (_, index) => ({
          id: `day-${index + 1}`,
          dayNumber: index + 1,
          date: new Date(Date.now() + index * 24 * 60 * 60 * 1000),
          location: state.lead.destination,
          activities: [],
          accommodation: undefined,
          meals: [],
          transportation: undefined,
          notes: ''
        }));
        
        dispatch({ type: 'SET_ITINERARY_DAYS', payload: initialDays });
      }
    }, [state.itineraryDays.length, state.lead.duration, state.lead.destination]),

    assignPackageToDay: useCallback((packageId: string, dayId: string) => {
      // TODO: Implement package assignment
      console.log('Assigning package', packageId, 'to day', dayId);
    }, []),

    removePackageFromDay: useCallback((packageId: string, dayId: string) => {
      // TODO: Implement package removal from day
      console.log('Removing package', packageId, 'from day', dayId);
    }, []),

    addCustomActivity: useCallback((dayId: string, activity) => {
      // TODO: Implement custom activity addition
      console.log('Adding custom activity to day', dayId, activity);
    }, []),

    updateActivity: useCallback((activityId: string, updates) => {
      // TODO: Implement activity update
      console.log('Updating activity', activityId, updates);
    }, []),

    removeActivity: useCallback((activityId: string) => {
      // TODO: Implement activity removal
      console.log('Removing activity', activityId);
    }, []),

    reorderActivities: useCallback((dayId: string, activityIds: string[]) => {
      // TODO: Implement activity reordering
      console.log('Reordering activities for day', dayId, activityIds);
    }, []),

    // Budget management
    updateBudget: useCallback(() => {
      const newBudget = calculateBudget();
      dispatch({ type: 'UPDATE_BUDGET', payload: newBudget });
    }, [calculateBudget]),

    validateBudget: useCallback(() => {
      return !state.budget.overBudget;
    }, [state.budget.overBudget]),

    // Navigation
    goToStep: useCallback((step: ItineraryCreationStep) => {
      dispatch({ type: 'SET_CURRENT_STEP', payload: step });
    }, []),

    nextStep: useCallback(() => {
      const steps: ItineraryCreationStep[] = ['PACKAGE_SELECTION', 'DAY_PLANNING', 'DETAILS', 'REVIEW'];
      const currentIndex = steps.indexOf(state.currentStep);
      if (currentIndex < steps.length - 1) {
        dispatch({ type: 'SET_CURRENT_STEP', payload: steps[currentIndex + 1] });
      }
    }, [state.currentStep]),

    previousStep: useCallback(() => {
      const steps: ItineraryCreationStep[] = ['PACKAGE_SELECTION', 'DAY_PLANNING', 'DETAILS', 'REVIEW'];
      const currentIndex = steps.indexOf(state.currentStep);
      if (currentIndex > 0) {
        dispatch({ type: 'SET_CURRENT_STEP', payload: steps[currentIndex - 1] });
      }
    }, [state.currentStep]),

    // Save and finalize
    saveDraft: useCallback(async () => {
      // TODO: Implement draft saving
      console.log('Saving draft');
    }, []),

    finalizeItinerary: useCallback(async () => {
      // TODO: Implement itinerary finalization
      console.log('Finalizing itinerary');
      return 'temp-itinerary-id';
    }, [])
  };

  // Initialize with lead data if provided
  useEffect(() => {
    if (leadId && authState.user?.id) {
      actions.createSession(leadId);
      // Set mock lead data for testing
      const mockLead = {
        id: leadId,
        customerName: 'Sarah Johnson',
        email: 'sarah@example.com',
        destination: 'Bali',
        budget: 2000,
        tripType: 'ADVENTURE',
        travelers: 2,
        duration: 5,
        preferences: ['Cultural Tours', 'Water Sports', 'Local Cuisine'],
        specialRequirements: []
      };
      dispatch({ type: 'SET_LEAD', payload: mockLead });
    }
  }, [leadId, authState.user?.id, actions]);

  // Load itinerary days when lead data is available
  useEffect(() => {
    if (state.lead.duration > 0 && state.itineraryDays.length === 0) {
      actions.loadItineraryDays();
    }
  }, [state.lead.duration, state.itineraryDays.length, actions]);

  const contextValue: ItineraryCreationContextType = {
    state,
    actions
  };

  return (
    <ItineraryCreationContext.Provider value={contextValue}>
      {children}
    </ItineraryCreationContext.Provider>
  );
}

// Hook to use the context
export function useItineraryCreation() {
  const context = useContext(ItineraryCreationContext);
  if (context === undefined) {
    throw new Error('useItineraryCreation must be used within an ItineraryCreationProvider');
  }
  return context;
}
