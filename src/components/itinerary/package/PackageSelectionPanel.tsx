'use client';

import React, { useState, useEffect } from 'react';
import { useItineraryCreation } from '@/context/ItineraryCreationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  X, 
  Star, 
  Clock, 
  DollarSign, 
  MapPin,
  Users,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PackageDiscoveryCard from './PackageDiscoveryCard';
import PackageFilterPanel from './PackageFilterPanel';

interface PackageSelectionPanelProps {
  className?: string;
}

export default function PackageSelectionPanel({ className }: PackageSelectionPanelProps) {
  const { state, actions } = useItineraryCreation();
  const [showFilters, setShowFilters] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(state.packageFilters.searchTerm);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchTerm !== state.packageFilters.searchTerm) {
        actions.searchPackages(localSearchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchTerm, state.packageFilters.searchTerm, actions]);

  // Load packages on mount
  useEffect(() => {
    actions.loadAvailablePackages();
  }, [actions]);

  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
  };

  const handleFilterChange = (key: string, value: any) => {
    actions.updateFilters({ [key]: value });
  };

  const clearFilters = () => {
    actions.clearFilters();
    setLocalSearchTerm('');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (state.packageFilters.searchTerm) count++;
    if (state.packageFilters.packageTypes.length > 0) count++;
    if (state.packageFilters.destinations.length > 0) count++;
    if (state.packageFilters.rating > 0) count++;
    if (state.packageFilters.priceRange.min > 0 || state.packageFilters.priceRange.max < 10000) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Available Packages</h3>
          <p className="text-sm text-gray-600">
            {state.availablePackages.length} packages found for {state.lead.destination}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {state.packageRecommendations.length > 0 && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              <Sparkles className="w-3 h-3 mr-1" />
              {state.packageRecommendations.length} recommendations
            </Badge>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search packages by name, destination, or activity..."
                value={localSearchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Select
                  value={state.packageFilters.sortBy}
                  onValueChange={(value) => handleFilterChange('sortBy', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "relative",
                  showFilters && "bg-blue-50 border-blue-200"
                )}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>

              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <PackageFilterPanel
                filters={state.packageFilters}
                onFiltersChange={actions.updateFilters}
                onClose={() => setShowFilters(false)}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Package Grid */}
      <div className="space-y-4">
        {/* Recommendations Section */}
        {state.packageRecommendations.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h4 className="font-medium text-gray-900">Recommended for you</h4>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                Based on {state.lead.customerName}'s preferences
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.packageRecommendations.slice(0, 3).map((recommendation) => {
                const pkg = state.availablePackages.find(p => p.id === recommendation.packageId);
                if (!pkg) return null;
                
                return (
                  <PackageDiscoveryCard
                    key={`rec-${pkg.id}`}
                    pkg={pkg}
                    isRecommended={true}
                    recommendationScore={recommendation.recommendationScore}
                    recommendationReason={recommendation.reason}
                    isSelected={state.selectedPackageIds.has(pkg.id)}
                    onAdd={() => actions.addPackage(pkg)}
                    onRemove={() => actions.removePackage(`selected-${pkg.id}`)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* All Packages Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">All Packages</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{state.availablePackages.length} packages</span>
              {state.selectedPackages.length > 0 && (
                <>
                  <span>•</span>
                  <span className="text-blue-600 font-medium">
                    {state.selectedPackages.length} selected
                  </span>
                </>
              )}
            </div>
          </div>

          {state.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="flex justify-between">
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : state.availablePackages.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search terms or filters to find more packages.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.availablePackages.map((pkg) => (
                <PackageDiscoveryCard
                  key={pkg.id}
                  pkg={pkg}
                  isRecommended={pkg.isRecommended}
                  recommendationScore={pkg.recommendationScore}
                  recommendationReason={pkg.recommendationReason}
                  isSelected={state.selectedPackageIds.has(pkg.id)}
                  onAdd={() => actions.addPackage(pkg)}
                  onRemove={() => actions.removePackage(`selected-${pkg.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
