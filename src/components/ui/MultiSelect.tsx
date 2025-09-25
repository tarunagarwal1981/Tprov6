'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X, Search, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface MultiSelectOption {
  value: string;
  label: string;
  description?: string;
  category?: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  maxSelections?: number;
  className?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  helpText?: string;
}

const popularDestinations = [
  'Bali, Indonesia',
  'Thailand',
  'Japan',
  'Italy',
  'France',
  'Spain',
  'Greece',
  'Turkey',
  'Morocco',
  'India',
  'Nepal',
  'Peru',
  'Brazil',
  'Mexico',
  'Costa Rica',
  'New Zealand',
  'Australia',
  'South Africa',
  'Egypt',
  'Jordan',
  'Dubai, UAE',
  'Singapore',
  'Malaysia',
  'Vietnam',
  'Cambodia'
];

export default function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Select destinations...',
  searchPlaceholder = 'Search destinations...',
  maxSelections,
  className,
  disabled,
  error,
  label,
  helpText
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search query
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    option.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle option selection
  const handleSelect = (optionValue: string) => {
    if (disabled) return;
    
    const isSelected = value.includes(optionValue);
    
    if (isSelected) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      if (maxSelections && value.length >= maxSelections) {
        return;
      }
      onChange([...value, optionValue]);
    }
  };

  // Handle popular destination click
  const handlePopularClick = (destination: string) => {
    if (disabled) return;
    
    const isSelected = value.includes(destination);
    
    if (isSelected) {
      onChange(value.filter(v => v !== destination));
    } else {
      if (maxSelections && value.length >= maxSelections) {
        return;
      }
      onChange([...value, destination]);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex].value);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Reset highlighted index when search changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchQuery]);

  const selectedOptions = options.filter(option => value.includes(option.value));

  return (
    <div className={cn('relative', className)}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {maxSelections && (
            <span className="text-gray-500 ml-1">
              (max {maxSelections})
            </span>
          )}
        </label>
      )}

      {/* Selected Values Display */}
      <div
        className={cn(
          'min-h-[42px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          error && 'border-red-500 focus-within:ring-red-500',
          disabled && 'cursor-not-allowed opacity-50'
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="flex items-center space-x-1 pr-1"
                >
                  <span>{option.label}</span>
                  {!disabled && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(option.value);
                      }}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronDown className={cn(
            'h-4 w-4 text-gray-400 transition-transform',
            isOpen && 'rotate-180'
          )} />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-hidden"
        >
          {/* Search Input */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-10"
              />
            </div>
          </div>

          {/* Popular Destinations */}
          {!searchQuery && (
            <div className="p-2 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Popular Destinations
              </div>
              <div className="flex flex-wrap gap-1">
                {popularDestinations.slice(0, 8).map((destination) => (
                  <Badge
                    key={destination}
                    variant="outline"
                    className={cn(
                      'cursor-pointer hover:bg-blue-50 hover:text-blue-700 text-xs',
                      value.includes(destination) && 'bg-blue-100 text-blue-800'
                    )}
                    onClick={() => handlePopularClick(destination)}
                  >
                    {destination}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const isSelected = value.includes(option.value);
                const isHighlighted = index === highlightedIndex;
                
                return (
                  <div
                    key={option.value}
                    className={cn(
                      'px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-gray-50',
                      isHighlighted && 'bg-gray-100',
                      isSelected && 'bg-blue-50'
                    )}
                    onClick={() => handleSelect(option.value)}
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {option.label}
                        </div>
                        {option.description && (
                          <div className="text-xs text-gray-500 truncate">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-4 text-center text-sm text-gray-500">
                No destinations found
              </div>
            )}
          </div>

          {/* Max Selections Warning */}
          {maxSelections && value.length >= maxSelections && (
            <div className="px-3 py-2 bg-yellow-50 border-t border-yellow-200">
              <div className="text-xs text-yellow-800">
                Maximum {maxSelections} destinations selected
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-red-600 text-sm mt-1">{error}</p>
      )}

      {/* Help Text */}
      {helpText && (
        <p className="text-gray-500 text-sm mt-1">{helpText}</p>
      )}
    </div>
  );
}
