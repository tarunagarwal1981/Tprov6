import { useState, useEffect, useCallback, useRef } from 'react';
import { Location, LocationSearchParams, LocationSearchResult } from '../lib/types/location';
import { locationService } from '../lib/services/locationService';

export interface UseLocationSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  defaultCountry?: string;
  limit?: number;
  includeCoordinates?: boolean;
}

export interface UseLocationSearchReturn {
  locations: Location[];
  loading: boolean;
  error: string | null;
  search: (query: string) => void;
  clearResults: () => void;
  hasMore: boolean;
  total: number;
}

/**
 * Hook for searching locations with debouncing and caching
 */
export function useLocationSearch(options: UseLocationSearchOptions = {}): UseLocationSearchReturn {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    defaultCountry = 'India',
    limit = 10,
    includeCoordinates = true
  } = options;

  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const debounceRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  const search = useCallback((query: string) => {
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Clear previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Reset state for new search
    setError(null);

    if (!query || query.length < minQueryLength) {
      setLocations([]);
      setHasMore(false);
      setTotal(0);
      return;
    }

    // Debounce the search
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      
      try {
        const searchParams: LocationSearchParams = {
          query: query.trim(),
          country: defaultCountry,
          limit,
          includeCoordinates
        };

        const result: LocationSearchResult = await locationService.searchLocations(searchParams);
        
        setLocations(result.locations);
        setHasMore(result.hasMore);
        setTotal(result.total);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
          console.error('Location search error:', err);
        }
      } finally {
        setLoading(false);
      }
    }, debounceMs);
  }, [debounceMs, minQueryLength, defaultCountry, limit, includeCoordinates]);

  const clearResults = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLocations([]);
    setLoading(false);
    setError(null);
    setHasMore(false);
    setTotal(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    locations,
    loading,
    error,
    search,
    clearResults,
    hasMore,
    total
  };
}

/**
 * Hook for getting popular cities
 */
export function usePopularCities(country: string = 'India') {
  const [cities, setCities] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopularCities = async () => {
      try {
        setLoading(true);
        const popularCities = await locationService.getPopularCities(country);
        setCities(popularCities);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch popular cities');
        console.error('Error fetching popular cities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularCities();
  }, [country]);

  return { cities, loading, error };
}

/**
 * Hook for getting countries list
 */
export function useCountries() {
  const [countries, setCountries] = useState<{ code: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const countriesList = await locationService.getCountries();
        setCountries(countriesList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch countries');
        console.error('Error fetching countries:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, loading, error };
}

/**
 * Hook for location selection with validation
 */
export function useLocationSelection(initialValue?: string) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [inputValue, setInputValue] = useState(initialValue || '');
  const [isValid, setIsValid] = useState(false);

  const selectLocation = useCallback((location: Location) => {
    setSelectedLocation(location);
    setInputValue(location.name);
    setIsValid(true);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedLocation(null);
    setInputValue('');
    setIsValid(false);
  }, []);

  const updateInput = useCallback((value: string) => {
    setInputValue(value);
    // Reset selection if input doesn't match selected location
    if (selectedLocation && value !== selectedLocation.name) {
      setSelectedLocation(null);
      setIsValid(false);
    }
  }, [selectedLocation]);

  return {
    selectedLocation,
    inputValue,
    isValid,
    selectLocation,
    clearSelection,
    updateInput
  };
}
