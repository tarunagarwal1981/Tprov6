'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Checkbox,
} from '@/components/ui/checkbox';
import { 
  X, 
  Filter, 
  DollarSign,
  Clock,
  Star,
  MapPin,
  Package as PackageIcon
} from 'lucide-react';
import { ItineraryCreationFilters } from '@/lib/types/itinerary-creation';

interface PackageFilterPanelProps {
  filters: ItineraryCreationFilters;
  onFiltersChange: (filters: Partial<ItineraryCreationFilters>) => void;
  onClose: () => void;
}

export default function PackageFilterPanel({ 
  filters, 
  onFiltersChange, 
  onClose 
}: PackageFilterPanelProps) {
  
  const packageTypes = [
    { value: 'ACTIVITY', label: 'Activities', icon: PackageIcon },
    { value: 'TRANSFERS', label: 'Transfers', icon: PackageIcon },
    { value: 'LAND_PACKAGE', label: 'Land Packages', icon: PackageIcon },
    { value: 'HOTEL', label: 'Hotels', icon: PackageIcon },
    { value: 'CRUISE', label: 'Cruises', icon: PackageIcon },
    { value: 'FLIGHT', label: 'Flights', icon: PackageIcon },
    { value: 'COMBO', label: 'Combo Packages', icon: PackageIcon },
  ];

  const popularDestinations = [
    'Bali', 'Thailand', 'Japan', 'Italy', 'France', 'Spain', 'Greece',
    'Turkey', 'Morocco', 'India', 'Nepal', 'Peru', 'Brazil', 'Mexico',
    'Costa Rica', 'New Zealand', 'Australia', 'South Africa', 'Egypt',
    'Jordan', 'Dubai', 'Singapore', 'Malaysia', 'Vietnam', 'Cambodia'
  ];

  const handleTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked
      ? [...filters.packageTypes, type]
      : filters.packageTypes.filter(t => t !== type);
    
    onFiltersChange({ packageTypes: newTypes });
  };

  const handleDestinationChange = (destination: string, checked: boolean) => {
    const newDestinations = checked
      ? [...filters.destinations, destination]
      : filters.destinations.filter(d => d !== destination);
    
    onFiltersChange({ destinations: newDestinations });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      packageTypes: [],
      destinations: [],
      rating: 0,
      priceRange: { min: 0, max: 10000 },
      duration: { min: 1, max: 30 }
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.packageTypes.length > 0) count++;
    if (filters.destinations.length > 0) count++;
    if (filters.rating > 0) count++;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 10000) count++;
    if (filters.duration.min > 1 || filters.duration.max < 30) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <Filter className="w-5 h-5" />
            <span>Advanced Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {activeFilterCount} active
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Package Types */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Package Types
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {packageTypes.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type.value}`}
                  checked={filters.packageTypes.includes(type.value)}
                  onCheckedChange={(checked) => handleTypeChange(type.value, checked as boolean)}
                />
                <Label 
                  htmlFor={`type-${type.value}`}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Destinations */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Destinations
          </Label>
          <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
            {popularDestinations.map((destination) => (
              <div key={destination} className="flex items-center space-x-2">
                <Checkbox
                  id={`dest-${destination}`}
                  checked={filters.destinations.includes(destination)}
                  onCheckedChange={(checked) => handleDestinationChange(destination, checked as boolean)}
                />
                <Label 
                  htmlFor={`dest-${destination}`}
                  className="text-xs text-gray-700 cursor-pointer"
                >
                  {destination}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Price Range
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="min-price" className="text-xs text-gray-500">
                Min Price
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="min-price"
                  type="number"
                  placeholder="0"
                  value={filters.priceRange.min || ''}
                  onChange={(e) => onFiltersChange({
                    priceRange: {
                      ...filters.priceRange,
                      min: parseInt(e.target.value) || 0
                    }
                  })}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="max-price" className="text-xs text-gray-500">
                Max Price
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="max-price"
                  type="number"
                  placeholder="10000"
                  value={filters.priceRange.max || ''}
                  onChange={(e) => onFiltersChange({
                    priceRange: {
                      ...filters.priceRange,
                      max: parseInt(e.target.value) || 10000
                    }
                  })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Duration Range */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Duration
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="min-duration" className="text-xs text-gray-500">
                Min Days
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="min-duration"
                  type="number"
                  placeholder="1"
                  value={filters.duration.min || ''}
                  onChange={(e) => onFiltersChange({
                    duration: {
                      ...filters.duration,
                      min: parseInt(e.target.value) || 1
                    }
                  })}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="max-duration" className="text-xs text-gray-500">
                Max Days
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="max-duration"
                  type="number"
                  placeholder="30"
                  value={filters.duration.max || ''}
                  onChange={(e) => onFiltersChange({
                    duration: {
                      ...filters.duration,
                      max: parseInt(e.target.value) || 30
                    }
                  })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Minimum Rating
          </Label>
          <Select
            value={filters.rating.toString()}
            onValueChange={(value) => onFiltersChange({ rating: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select minimum rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any Rating</SelectItem>
              <SelectItem value="3">3+ Stars</SelectItem>
              <SelectItem value="4">4+ Stars</SelectItem>
              <SelectItem value="5">5 Stars Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-blue-200">
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="text-blue-600 border-blue-300 hover:bg-blue-100"
          >
            Clear All
          </Button>
          
          <div className="text-sm text-blue-700">
            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
