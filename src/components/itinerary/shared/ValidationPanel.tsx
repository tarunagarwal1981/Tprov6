'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info,
  Package,
  Calendar,
  DollarSign,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ItineraryCreationValidation } from '@/lib/types/itinerary-creation';

interface ValidationPanelProps {
  validation: ItineraryCreationValidation;
  className?: string;
}

export default function ValidationPanel({ validation, className }: ValidationPanelProps) {
  const getValidationIcon = (isValid: boolean, hasWarnings: boolean) => {
    if (isValid && !hasWarnings) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (hasWarnings) {
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getValidationColor = (isValid: boolean, hasWarnings: boolean) => {
    if (isValid && !hasWarnings) {
      return 'text-green-600 bg-green-50 border-green-200';
    } else if (hasWarnings) {
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    } else {
      return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getValidationBadge = (isValid: boolean, hasWarnings: boolean) => {
    if (isValid && !hasWarnings) {
      return <Badge className="bg-green-100 text-green-800">Valid</Badge>;
    } else if (hasWarnings) {
      return <Badge className="bg-yellow-100 text-yellow-800">Warnings</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Issues</Badge>;
    }
  };

  if (validation.isValid && validation.errors.length === 0 && validation.warnings.length === 0) {
    return (
      <Card className={cn("border-green-200 bg-green-50", className)}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Itinerary is ready to proceed
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-2", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Info className="w-5 h-5" />
            <span>Validation Status</span>
          </div>
          {getValidationBadge(validation.isValid, validation.warnings.length > 0)}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Validation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Packages Validation */}
          <div className={cn(
            "p-3 rounded-lg border",
            getValidationColor(validation.packagesValid, false)
          )}>
            <div className="flex items-center space-x-2 mb-2">
              {getValidationIcon(validation.packagesValid, false)}
              <span className="text-sm font-medium">Packages</span>
            </div>
            {validation.packagesValid ? (
              <p className="text-xs">Packages selected and valid</p>
            ) : (
              <p className="text-xs">No packages selected</p>
            )}
          </div>

          {/* Days Validation */}
          <div className={cn(
            "p-3 rounded-lg border",
            getValidationColor(validation.daysValid, false)
          )}>
            <div className="flex items-center space-x-2 mb-2">
              {getValidationIcon(validation.daysValid, false)}
              <span className="text-sm font-medium">Days</span>
            </div>
            {validation.daysValid ? (
              <p className="text-xs">Days planned and valid</p>
            ) : (
              <p className="text-xs">Days need to be planned</p>
            )}
          </div>

          {/* Budget Validation */}
          <div className={cn(
            "p-3 rounded-lg border",
            getValidationColor(validation.budgetValid, false)
          )}>
            <div className="flex items-center space-x-2 mb-2">
              {getValidationIcon(validation.budgetValid, false)}
              <span className="text-sm font-medium">Budget</span>
            </div>
            {validation.budgetValid ? (
              <p className="text-xs">Within budget limits</p>
            ) : (
              <p className="text-xs">Exceeds budget</p>
            )}
          </div>

          {/* Overall Status */}
          <div className={cn(
            "p-3 rounded-lg border",
            getValidationColor(validation.isValid, validation.warnings.length > 0)
          )}>
            <div className="flex items-center space-x-2 mb-2">
              {getValidationIcon(validation.isValid, validation.warnings.length > 0)}
              <span className="text-sm font-medium">Overall</span>
            </div>
            {validation.isValid ? (
              <p className="text-xs">Ready to proceed</p>
            ) : (
              <p className="text-xs">Issues need to be resolved</p>
            )}
          </div>
        </div>

        {/* Errors */}
        {validation.errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-red-800">Errors</h4>
            <div className="space-y-1">
              {validation.errors.map((error, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm text-red-700">
                  <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {validation.warnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-yellow-800">Warnings</h4>
            <div className="space-y-1">
              {validation.warnings.map((warning, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm text-yellow-700">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {!validation.isValid && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Quick Actions</h4>
            <div className="flex flex-wrap gap-2">
              {!validation.packagesValid && (
                <Badge variant="outline" className="text-xs">
                  <Package className="w-3 h-3 mr-1" />
                  Select Packages
                </Badge>
              )}
              {!validation.daysValid && (
                <Badge variant="outline" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  Plan Days
                </Badge>
              )}
              {!validation.budgetValid && (
                <Badge variant="outline" className="text-xs">
                  <DollarSign className="w-3 h-3 mr-1" />
                  Adjust Budget
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
