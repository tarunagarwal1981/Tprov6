'use client';

import React, { useEffect } from 'react';
import { useItineraryCreation } from '@/context/ItineraryCreationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Eye,
  User,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PackageSelectionPanel from '../package/PackageSelectionPanel';
import SelectedPackagesPanel from '../package/SelectedPackagesPanel';
import BudgetTracker from '../shared/BudgetTracker';
import DayPlanningInterface from '../day/DayPlanningInterface';
import ValidationPanel from '../shared/ValidationPanel';
import ErrorBoundary from '../shared/ErrorBoundary';
import ItineraryCreationTestUtils from '../shared/ItineraryCreationTestUtils';

interface ItineraryCreationWizardProps {
  leadId: string;
  onBack?: () => void;
  onComplete?: (itineraryId: string) => void;
  className?: string;
}

export default function ItineraryCreationWizard({ 
  leadId, 
  onBack, 
  onComplete,
  className 
}: ItineraryCreationWizardProps) {
  const { state, actions } = useItineraryCreation();

  // Initialize with lead data
  useEffect(() => {
    if (leadId) {
      actions.createSession(leadId);
    }
  }, [leadId, actions]);

  const getStepTitle = () => {
    switch (state.currentStep) {
      case 'PACKAGE_SELECTION':
        return 'Select Packages';
      case 'DAY_PLANNING':
        return 'Plan Days';
      case 'DETAILS':
        return 'Add Details';
      case 'REVIEW':
        return 'Review & Save';
      default:
        return 'Create Itinerary';
    }
  };

  const getStepDescription = () => {
    switch (state.currentStep) {
      case 'PACKAGE_SELECTION':
        return 'Browse and select packages for the itinerary';
      case 'DAY_PLANNING':
        return 'Arrange packages by day and add activities';
      case 'DETAILS':
        return 'Add itinerary details and pricing';
      case 'REVIEW':
        return 'Review and finalize the itinerary';
      default:
        return '';
    }
  };

  const getValidationState = () => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Package validation
    const packagesValid = state.selectedPackages.length > 0;
    if (!packagesValid) {
      errors.push('Please select at least one package');
    }

    // Budget validation
    const budgetValid = !state.budget.overBudget;
    if (state.budget.overBudget) {
      errors.push(`Budget exceeded by $${state.budget.overBudgetAmount.toLocaleString()}`);
    } else if (state.budget.used > state.budget.total * 0.8) {
      warnings.push('Approaching budget limit');
    }

    // Days validation
    const daysValid = state.itineraryDays.length > 0;
    if (!daysValid) {
      errors.push('Please plan at least one day');
    }

    // Step-specific validation
    switch (state.currentStep) {
      case 'PACKAGE_SELECTION':
        if (state.selectedPackages.length === 0) {
          errors.push('Select packages to continue');
        }
        break;
      case 'DAY_PLANNING':
        const daysWithActivities = state.itineraryDays.filter(day => day.activities.length > 0);
        if (daysWithActivities.length === 0) {
          errors.push('Add activities to at least one day');
        }
        break;
      case 'DETAILS':
        // Add details validation here
        break;
      case 'REVIEW':
        // Add review validation here
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      budgetValid,
      daysValid,
      packagesValid
    };
  };

  const canProceedToNext = () => {
    const validation = getValidationState();
    return validation.isValid;
  };

  const handleNext = () => {
    if (canProceedToNext()) {
      actions.nextStep();
    }
  };

  const handlePrevious = () => {
    actions.previousStep();
  };

  const handleSaveDraft = async () => {
    await actions.saveDraft();
  };

  const handleFinalize = async () => {
    const itineraryId = await actions.finalizeItinerary();
    if (onComplete) {
      onComplete(itineraryId);
    }
  };

  const renderStepContent = () => {
    switch (state.currentStep) {
      case 'PACKAGE_SELECTION':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PackageSelectionPanel />
            </div>
            <div className="space-y-4">
              <SelectedPackagesPanel onNext={handleNext} />
            </div>
          </div>
        );
      
      case 'DAY_PLANNING':
        return (
          <DayPlanningInterface />
        );
      
      case 'DETAILS':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Itinerary Details</CardTitle>
                <p className="text-sm text-gray-600">
                  Add final details and pricing information
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Details Form Coming Soon</h3>
                  <p className="text-gray-600">
                    This feature will be available in Phase 4 of the implementation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'REVIEW':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review & Save</CardTitle>
                <p className="text-sm text-gray-600">
                  Review your itinerary before finalizing
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Save className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Review Panel Coming Soon</h3>
                  <p className="text-gray-600">
                    This feature will be available in Phase 4 of the implementation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading itinerary creation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {onBack && (
                  <Button variant="outline" size="sm" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Create Itinerary</h1>
                  <p className="text-gray-600 mt-1">
                    {getStepTitle()} - {getStepDescription()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={handleSaveDraft}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                {state.currentStep === 'REVIEW' ? (
                  <Button size="sm" onClick={handleFinalize}>
                    Finalize Itinerary
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={handleNext}
                    disabled={!canProceedToNext()}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center space-x-4">
              {['PACKAGE_SELECTION', 'DAY_PLANNING', 'DETAILS', 'REVIEW'].map((step, index) => (
                <React.Fragment key={step}>
                  <div className="flex items-center space-x-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      state.currentStep === step
                        ? "bg-blue-600 text-white"
                        : index < ['PACKAGE_SELECTION', 'DAY_PLANNING', 'DETAILS', 'REVIEW'].indexOf(state.currentStep)
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    )}>
                      {index + 1}
                    </div>
                    <span className={cn(
                      "text-sm font-medium",
                      state.currentStep === step
                        ? "text-blue-600"
                        : index < ['PACKAGE_SELECTION', 'DAY_PLANNING', 'DETAILS', 'REVIEW'].indexOf(state.currentStep)
                        ? "text-green-600"
                        : "text-gray-500"
                    )}>
                      {step.replace('_', ' ')}
                    </span>
                  </div>
                  {index < 3 && (
                    <div className={cn(
                      "w-8 h-0.5",
                      index < ['PACKAGE_SELECTION', 'DAY_PLANNING', 'DETAILS', 'REVIEW'].indexOf(state.currentStep)
                        ? "bg-green-600"
                        : "bg-gray-200"
                    )} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lead Information */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium text-gray-900">{state.lead.customerName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Destination:</span>
                <span className="font-medium text-gray-900">{state.lead.destination}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium text-gray-900">{state.lead.duration} days</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Travelers:</span>
                <span className="font-medium text-gray-900">{state.lead.travelers}</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Budget:</span>
                <span className="font-medium text-gray-900">
                  ${state.lead.budget.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorBoundary>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {renderStepContent()}
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Validation Panel */}
              <ValidationPanel validation={getValidationState()} />
              
              {/* Development Tools */}
              <ItineraryCreationTestUtils />
            </div>
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
}
