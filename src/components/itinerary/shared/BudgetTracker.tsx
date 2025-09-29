'use client';

import React from 'react';
import { useItineraryCreation } from '@/context/ItineraryCreationContext';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BudgetTrackerProps {
  className?: string;
  showDetails?: boolean;
}

export default function BudgetTracker({ className, showDetails = true }: BudgetTrackerProps) {
  const { state } = useItineraryCreation();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getBudgetPercentage = () => {
    if (state.budget.total === 0) return 0;
    return Math.min((state.budget.used / state.budget.total) * 100, 100);
  };

  const getBudgetStatus = () => {
    const percentage = getBudgetPercentage();
    if (percentage >= 100) return 'over';
    if (percentage >= 80) return 'warning';
    if (percentage >= 50) return 'good';
    return 'excellent';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'good':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'excellent':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'over':
        return 'bg-red-500';
      case 'warning':
        return 'bg-orange-500';
      case 'good':
        return 'bg-blue-500';
      case 'excellent':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const status = getBudgetStatus();
  const percentage = getBudgetPercentage();

  return (
    <Card className={cn("border-2", getStatusColor(status), className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <h3 className="font-semibold text-gray-900">Budget Tracker</h3>
            </div>
            
            <div className="flex items-center space-x-2">
              {status === 'over' && (
                <Badge variant="destructive" className="bg-red-100 text-red-800">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Over Budget
                </Badge>
              )}
              {status === 'warning' && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Near Limit
                </Badge>
              )}
              {status === 'good' && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  On Track
                </Badge>
              )}
              {status === 'excellent' && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Great!
                </Badge>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Budget Usage</span>
              <span className="font-medium text-gray-900">
                {formatPrice(state.budget.used)} / {formatPrice(state.budget.total)}
              </span>
            </div>
            
            <Progress 
              value={percentage} 
              className="h-3"
              style={{
                '--progress-background': getProgressColor(status)
              } as React.CSSProperties}
            />
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{percentage.toFixed(1)}% used</span>
              {state.budget.overBudget ? (
                <span className="text-red-600 font-medium">
                  {formatPrice(state.budget.overBudgetAmount)} over
                </span>
              ) : (
                <span className="text-green-600 font-medium">
                  {formatPrice(state.budget.remaining)} remaining
                </span>
              )}
            </div>
          </div>

          {/* Detailed Breakdown */}
          {showDetails && (
            <div className="space-y-3 pt-2 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>Total Budget</span>
                  </div>
                  <div className="font-semibold text-gray-900 mt-1">
                    {formatPrice(state.budget.total)}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>Used</span>
                  </div>
                  <div className="font-semibold text-gray-900 mt-1">
                    {formatPrice(state.budget.used)}
                  </div>
                </div>
              </div>

              {state.budget.overBudget ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-red-800">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">Over Budget</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    You're {formatPrice(state.budget.overBudgetAmount)} over the customer's budget. 
                    Consider removing some packages or finding lower-cost alternatives.
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-green-800">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Within Budget</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Great! You have {formatPrice(state.budget.remaining)} remaining in the budget.
                  </p>
                </div>
              )}

              {/* Package Count */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Selected Packages</span>
                <span className="font-medium text-gray-900">
                  {state.selectedPackages.length} package{state.selectedPackages.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
