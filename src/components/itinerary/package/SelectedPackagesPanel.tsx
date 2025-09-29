'use client';

import React from 'react';
import { useItineraryCreation } from '@/context/ItineraryCreationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  AlertTriangle, 
  CheckCircle,
  ArrowRight,
  Package,
  Clock,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import BudgetTracker from '../shared/BudgetTracker';

interface SelectedPackagesPanelProps {
  className?: string;
  onNext?: () => void;
}

export default function SelectedPackagesPanel({ className, onNext }: SelectedPackagesPanelProps) {
  const { state, actions } = useItineraryCreation();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleQuantityChange = (packageId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      actions.removePackage(packageId);
    } else {
      actions.updatePackageQuantity(packageId, newQuantity);
    }
  };

  const getTotalCost = () => {
    return state.selectedPackages.reduce((total, pkg) => total + pkg.totalPrice, 0);
  };

  const getTotalDuration = () => {
    return state.selectedPackages.reduce((total, pkg) => total + pkg.duration.days, 0);
  };

  const canProceed = () => {
    return state.selectedPackages.length > 0 && !state.budget.overBudget;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Selected Packages</h3>
          <p className="text-sm text-gray-600">
            {state.selectedPackages.length} package{state.selectedPackages.length !== 1 ? 's' : ''} selected
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {state.selectedPackages.length > 0 && (
            <Badge variant="secondary" className="bg-green-50 text-green-700">
              <CheckCircle className="w-3 h-3 mr-1" />
              Ready to plan
            </Badge>
          )}
        </div>
      </div>

      {/* Budget Tracker */}
      <BudgetTracker />

      {/* Selected Packages List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5" />
            <span>Your Selection</span>
            {state.selectedPackages.length > 0 && (
              <Badge variant="outline">
                {state.selectedPackages.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.selectedPackages.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No packages selected</h3>
              <p className="text-gray-600 mb-4">
                Browse and select packages from the left panel to build your itinerary.
              </p>
              <div className="text-sm text-gray-500">
                <p>• Look for recommended packages based on {state.lead.customerName}'s preferences</p>
                <p>• Filter by type, price, or duration to find the perfect packages</p>
                <p>• Each package will be added to your selection for day-by-day planning</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {state.selectedPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* Package Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {pkg.packageName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          by {pkg.operatorName}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{pkg.duration.days} day{pkg.duration.days !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Package className="w-4 h-4" />
                            <span>{pkg.type}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {formatPrice(pkg.totalPrice)}
                        </div>
                        {pkg.quantity > 1 && (
                          <div className="text-sm text-gray-500">
                            {formatPrice(pkg.price)} × {pkg.quantity}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuantityChange(pkg.id, pkg.quantity - 1)}
                      disabled={pkg.quantity <= 1}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    
                    <span className="w-8 text-center font-medium">
                      {pkg.quantity}
                    </span>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuantityChange(pkg.id, pkg.quantity + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Remove Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => actions.removePackage(pkg.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {state.selectedPackages.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Packages</span>
                <span className="text-sm text-gray-900">{state.selectedPackages.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Duration</span>
                <span className="text-sm text-gray-900">
                  {getTotalDuration()} day{getTotalDuration() !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Cost</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatPrice(getTotalCost())}
                </span>
              </div>
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Customer Budget</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(state.lead.budget)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        <div className="text-sm text-gray-600">
          {state.selectedPackages.length === 0 ? (
            "Select packages to continue"
          ) : state.budget.overBudget ? (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span>Over budget by {formatPrice(state.budget.overBudgetAmount)}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Within budget - {formatPrice(state.budget.remaining)} remaining</span>
            </div>
          )}
        </div>

        {onNext && (
          <Button
            onClick={onNext}
            disabled={!canProceed()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Plan Days
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
