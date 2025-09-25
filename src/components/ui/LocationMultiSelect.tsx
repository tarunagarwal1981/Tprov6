'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Location, LocationDisplayFormat } from '../../lib/types/location';
import { useLocationSearch } from '../../hooks/useLocation';
import { Input } from './Input';
import { Button } from './Button';
import { Badge } from './Badge';
import { Loader2, MapPin, X, Plus, Search } from 'lucide-react';

interface LocationMultiSelectProps {
  selectedLocations: Location[];
  onLocationsChange: (locations: Location[]) => void;
  placeholder?: string;
  displayFormat?: LocationDisplayFormat;
  country?: string;
  maxSelections?: number;
  disabled?: boolean;
  className?: string;
  showCoordinates?: boolean;
  allowCustomInput?: boolean;
}

export const LocationMultiSelect: React.FC<LocationMultiSelectProps> = ({
  selectedLocations,
  onLocationsChange,
  placeholder = 'Search and add locations...',
  displayFormat = 'name-state',
  country = 'India',
  maxSelections,
  disabled = false,
  className = '',
  showCoordinates = false,
  allowCustomInput = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    locations,
    loading,
    error,
    search,
    clearResults
  } = useLocationSearch({
    defaultCountry: country,
    limit: 10
  });

  // Filter out already selected locations
  const availableLocations = locations.filter(
    location => !selectedLocations.some(selected => selected.id === location.id)
  );

  // Handle input changes
  const handleInputChange = (value: string) => {
    setInputValue(value);
    search(value);
    setShowSuggestions(true);
  };

  // Handle location selection
  const handleLocationSelect = (location: Location) => {
    if (maxSelections && selectedLocations.length >= maxSelections) {
      return;
    }

    const newLocations = [...selectedLocations, location];
    onLocationsChange(newLocations);
    setInputValue('');
    setShowSuggestions(false);
    clearResults();
  };

  // Handle location removal
  const handleLocationRemove = (locationId: string) => {
    const newLocations = selectedLocations.filter(location => location.id !== locationId);
    onLocationsChange(newLocations);
  };

  // Handle clear all
  const handleClearAll = () => {
    onLocationsChange([]);
    setInputValue('');
    setShowSuggestions(false);
    clearResults();
  };

  // Format location display
  const formatLocationDisplay = (location: Location, format: LocationDisplayFormat): string => {
    switch (format) {
      case 'name':
        return location.name;
      case 'name-state':
        return location.state ? `${location.name}, ${location.state}` : location.name;
      case 'name-state-country':
        return location.state 
          ? `${location.name}, ${location.state}, ${location.country}`
          : `${location.name}, ${location.country}`;
      case 'full':
        return `${location.name}${location.state ? `, ${location.state}` : ''}, ${location.country}`;
      default:
        return location.name;
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={containerRef} className={`space-y-2 ${className}`}>
      {/* Selected Locations */}
      {selectedLocations.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Selected Locations ({selectedLocations.length}{maxSelections ? `/${maxSelections}` : ''})
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-800"
            >
              Clear All
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {selectedLocations.map((location) => (
              <Badge
                key={location.id}
                variant="secondary"
                className="flex items-center space-x-1 pr-1"
              >
                <MapPin className="h-3 w-3" />
                <span className="text-xs">
                  {formatLocationDisplay(location, displayFormat)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLocationRemove(location.id)}
                  className="h-4 w-4 p-0 hover:bg-red-100"
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || (maxSelections ? selectedLocations.length >= maxSelections : false)}
            className="pr-10"
          />
          
          {/* Icons */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            )}
            
            {!loading && inputValue && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInputValue('');
                  clearResults();
                }}
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            
            <Plus className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (availableLocations.length > 0 || loading || error) && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {loading && (
              <div className="px-4 py-3 text-center text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                Searching locations...
              </div>
            )}

            {error && (
              <div className="px-4 py-3 text-center text-red-500">
                <p className="text-sm">{error}</p>
                <p className="text-xs mt-1">Showing popular cities instead</p>
              </div>
            )}

            {!loading && availableLocations.length > 0 && (
              <div className="py-1">
                {availableLocations.map((location) => (
                  <button
                    key={location.id}
                    type="button"
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                    onClick={() => handleLocationSelect(location)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatLocationDisplay(location, displayFormat)}
                        </div>
                        {showCoordinates && location.coordinates && (
                          <div className="text-xs text-gray-500 mt-1">
                            {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
                          </div>
                        )}
                      </div>
                      {location.isPopular && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!loading && availableLocations.length === 0 && inputValue.length >= 2 && (
              <div className="px-4 py-3 text-center text-gray-500">
                <Search className="h-4 w-4 mx-auto mb-2" />
                <p className="text-sm">No new locations found</p>
                {allowCustomInput && (
                  <p className="text-xs mt-1">All matching locations are already selected</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Max Selections Warning */}
      {maxSelections && selectedLocations.length >= maxSelections && (
        <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
          Maximum {maxSelections} locations selected
        </div>
      )}
    </div>
  );
};
