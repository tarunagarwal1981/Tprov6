'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Location, LocationInputProps, LocationDisplayFormat } from '../../lib/types/location';
import { useLocationSearch, useLocationSelection } from '../../hooks/useLocation';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from './Button';
import { Loader2, MapPin, X, Search } from 'lucide-react';

interface LocationInputComponentProps extends LocationInputProps {
  onLocationSelect?: (location: Location) => void;
  onCustomInput?: (value: string) => void;
}

export const LocationInput: React.FC<LocationInputComponentProps> = ({
  value = '',
  onChange,
  placeholder = 'Search cities...',
  mode = 'both',
  displayFormat = 'name-state',
  country = 'India',
  required = false,
  disabled = false,
  className = '',
  showCoordinates = false,
  allowCustomInput = true,
  onLocationSelect,
  onCustomInput
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
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

  const {
    selectedLocation,
    inputValue,
    isValid,
    selectLocation,
    clearSelection,
    updateInput
  } = useLocationSelection(value);

  // Handle input changes
  const handleInputChange = (newValue: string) => {
    updateInput(newValue);
    
    if (mode === 'search' || mode === 'both') {
      search(newValue);
      setShowSuggestions(true);
    }
    
    // Call onChange with string value for custom input
    if (allowCustomInput && onCustomInput) {
      onCustomInput(newValue);
    }
  };

  // Handle location selection
  const handleLocationSelect = (location: Location) => {
    selectLocation(location);
    setShowSuggestions(false);
    
    // Call onChange with location object
    onChange(location);
    
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  // Handle clear
  const handleClear = () => {
    clearSelection();
    clearResults();
    setShowSuggestions(false);
    onChange('');
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
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="relative">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`pr-20 ${isValid ? 'border-green-500' : ''}`}
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
                onClick={handleClear}
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            
            <MapPin className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (locations.length > 0 || loading || error) && (
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

            {!loading && locations.length > 0 && (
              <div className="py-1">
                {locations.map((location) => (
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

            {!loading && locations.length === 0 && inputValue.length >= 2 && (
              <div className="px-4 py-3 text-center text-gray-500">
                <Search className="h-4 w-4 mx-auto mb-2" />
                <p className="text-sm">No locations found</p>
                {allowCustomInput && (
                  <p className="text-xs mt-1">You can enter a custom location</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Location Info */}
      {selectedLocation && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">
                Selected: {formatLocationDisplay(selectedLocation, displayFormat)}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Export additional components for different use cases
export const LocationSelect: React.FC<Omit<LocationInputComponentProps, 'mode'>> = (props) => (
  <LocationInput {...props} mode="select" />
);

export const LocationSearch: React.FC<Omit<LocationInputComponentProps, 'mode'>> = (props) => (
  <LocationInput {...props} mode="search" />
);
