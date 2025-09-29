'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TestTube, 
  Play, 
  Pause, 
  RotateCcw, 
  Database,
  User,
  Package,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useItineraryCreation } from '@/context/ItineraryCreationContext';

interface ItineraryCreationTestUtilsProps {
  className?: string;
}

export default function ItineraryCreationTestUtils({ className }: ItineraryCreationTestUtilsProps) {
  const { state, actions } = useItineraryCreation();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const generateMockPackages = () => {
    const mockPackages = [
      {
        id: 'pkg-1',
        title: 'Bali Cultural Tour',
        description: 'Explore traditional Balinese culture and temples',
        type: 'ACTIVITY',
        status: 'ACTIVE',
        pricing: { adult: 150, child: 100, currency: 'USD' },
        destinations: ['Bali'],
        duration: { days: 1, hours: 8 },
        operatorName: 'Bali Adventures',
        operatorId: 'op-1',
        rating: 4.5,
        reviewCount: 120,
        images: [],
        inclusions: ['Guide', 'Transport', 'Lunch'],
        exclusions: ['Personal expenses'],
        tags: ['culture', 'temple', 'traditional'],
        difficulty: 'EASY',
        groupSize: { min: 2, max: 12 },
        recommendedForTripTypes: ['CULTURAL', 'ADVENTURE'],
        averageBookingTime: 3,
        seasonalAvailability: {},
        isRecommended: true,
        recommendationScore: 0.9,
        recommendationReason: 'Matches cultural preferences'
      },
      {
        id: 'pkg-2',
        title: 'Ubud Rice Terraces',
        description: 'Visit the famous rice terraces and learn about farming',
        type: 'ACTIVITY',
        status: 'ACTIVE',
        pricing: { adult: 80, child: 50, currency: 'USD' },
        destinations: ['Ubud'],
        duration: { days: 1, hours: 4 },
        operatorName: 'Ubud Tours',
        operatorId: 'op-2',
        rating: 4.2,
        reviewCount: 85,
        images: [],
        inclusions: ['Guide', 'Transport'],
        exclusions: ['Meals'],
        tags: ['nature', 'rice', 'farming'],
        difficulty: 'EASY',
        groupSize: { min: 1, max: 8 },
        recommendedForTripTypes: ['CULTURAL', 'NATURE'],
        averageBookingTime: 2,
        seasonalAvailability: {},
        isRecommended: true,
        recommendationScore: 0.8,
        recommendationReason: 'Popular cultural attraction'
      },
      {
        id: 'pkg-3',
        title: 'Beach Resort Stay',
        description: 'Luxury beachfront accommodation with all amenities',
        type: 'HOTEL',
        status: 'ACTIVE',
        pricing: { adult: 200, child: 150, currency: 'USD' },
        destinations: ['Seminyak'],
        duration: { days: 1, hours: 24 },
        operatorName: 'Bali Resorts',
        operatorId: 'op-3',
        rating: 4.8,
        reviewCount: 200,
        images: [],
        inclusions: ['Room', 'Breakfast', 'WiFi', 'Pool'],
        exclusions: ['Lunch', 'Dinner'],
        tags: ['luxury', 'beach', 'resort'],
        difficulty: 'EASY',
        groupSize: { min: 1, max: 4 },
        recommendedForTripTypes: ['LUXURY', 'BEACH'],
        averageBookingTime: 7,
        seasonalAvailability: {},
        isRecommended: false,
        recommendationScore: 0.6,
        recommendationReason: 'High-end option'
      }
    ];

    // Simulate loading packages
    actions.loadAvailablePackages();
  };

  const generateMockActivities = () => {
    const mockActivities = [
      {
        id: 'act-1',
        itineraryDayId: 'day-1',
        packageId: 'pkg-1',
        activityName: 'Bali Cultural Tour',
        activityType: 'PACKAGE' as const,
        timeSlot: '09:00 - 17:00',
        durationHours: 8,
        cost: 150,
        location: 'Bali',
        notes: 'Includes temple visits and traditional lunch',
        orderIndex: 0,
        createdAt: new Date()
      },
      {
        id: 'act-2',
        itineraryDayId: 'day-2',
        packageId: 'pkg-2',
        activityName: 'Ubud Rice Terraces',
        activityType: 'PACKAGE' as const,
        timeSlot: '08:00 - 12:00',
        durationHours: 4,
        cost: 80,
        location: 'Ubud',
        notes: 'Morning tour with local guide',
        orderIndex: 0,
        createdAt: new Date()
      }
    ];

    // This would be handled by the context in a real implementation
    console.log('Generated mock activities:', mockActivities);
  };

  const resetToInitialState = () => {
    // Reset all state to initial values
    actions.clearFilters();
    // Clear selected packages
    state.selectedPackages.forEach(pkg => {
      actions.removePackage(pkg.id);
    });
    // Reset to first step
    actions.goToStep('PACKAGE_SELECTION');
  };

  const simulatePackageSelection = () => {
    // Simulate selecting packages
    const mockPackages = [
      {
        id: 'selected-pkg-1',
        packageId: 'pkg-1',
        packageName: 'Bali Cultural Tour',
        operatorId: 'op-1',
        operatorName: 'Bali Adventures',
        price: 150,
        quantity: 1,
        totalPrice: 150,
        duration: { days: 1, hours: 8 },
        type: 'ACTIVITY',
        destinations: ['Bali'],
        addedAt: new Date()
      },
      {
        id: 'selected-pkg-2',
        packageId: 'pkg-2',
        packageName: 'Ubud Rice Terraces',
        operatorId: 'op-2',
        operatorName: 'Ubud Tours',
        price: 80,
        quantity: 1,
        totalPrice: 80,
        duration: { days: 1, hours: 4 },
        type: 'ACTIVITY',
        destinations: ['Ubud'],
        addedAt: new Date()
      }
    ];

    mockPackages.forEach(pkg => {
      // This would be handled by the context in a real implementation
      console.log('Simulating package selection:', pkg);
    });
  };

  const logCurrentState = () => {
    console.log('Current Itinerary Creation State:', {
      currentStep: state.currentStep,
      selectedPackages: state.selectedPackages,
      availablePackages: state.availablePackages,
      itineraryDays: state.itineraryDays,
      budget: state.budget,
      lead: state.lead
    });
  };

  return (
    <Card className={cn("border-orange-200 bg-orange-50", className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-orange-800">
          <TestTube className="w-5 h-5" />
          <span>Development Tools</span>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            DEV ONLY
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current State Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-600" />
            <span>Step: {state.currentStep}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-gray-600" />
            <span>Packages: {state.selectedPackages.length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <span>Days: {state.itineraryDays.length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-gray-600" />
            <span>Budget: ${state.budget.used}/${state.budget.total}</span>
          </div>
        </div>

        {/* Test Actions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-orange-800">Test Actions</h4>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={generateMockPackages}
              className="text-xs"
            >
              <Database className="w-3 h-3 mr-1" />
              Mock Packages
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={generateMockActivities}
              className="text-xs"
            >
              <Calendar className="w-3 h-3 mr-1" />
              Mock Activities
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={simulatePackageSelection}
              className="text-xs"
            >
              <Package className="w-3 h-3 mr-1" />
              Select Packages
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={logCurrentState}
              className="text-xs"
            >
              <TestTube className="w-3 h-3 mr-1" />
              Log State
            </Button>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-orange-800">Navigation</h4>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => actions.goToStep('PACKAGE_SELECTION')}
              className="text-xs"
            >
              <Play className="w-3 h-3 mr-1" />
              Package Step
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => actions.goToStep('DAY_PLANNING')}
              className="text-xs"
            >
              <Play className="w-3 h-3 mr-1" />
              Day Step
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => actions.goToStep('DETAILS')}
              className="text-xs"
            >
              <Play className="w-3 h-3 mr-1" />
              Details Step
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => actions.goToStep('REVIEW')}
              className="text-xs"
            >
              <Play className="w-3 h-3 mr-1" />
              Review Step
            </Button>
          </div>
        </div>

        {/* Reset Actions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-orange-800">Reset</h4>
          
          <Button
            size="sm"
            variant="outline"
            onClick={resetToInitialState}
            className="w-full text-xs text-red-600 border-red-300 hover:bg-red-50"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset All State
          </Button>
        </div>

        {/* Performance Info */}
        <div className="pt-2 border-t border-orange-200">
          <h4 className="text-sm font-medium text-orange-800 mb-2">Performance</h4>
          <div className="text-xs text-orange-700 space-y-1">
            <div>Available Packages: {state.availablePackages.length}</div>
            <div>Selected Packages: {state.selectedPackages.length}</div>
            <div>Itinerary Days: {state.itineraryDays.length}</div>
            <div>Total Activities: {state.itineraryDays.reduce((total, day) => total + day.activities.length, 0)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
