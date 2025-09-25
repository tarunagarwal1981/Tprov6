'use client';

import { useState, useEffect, useCallback } from 'react';
import { Package, PackageType, PackageStatus, DifficultyLevel } from '@/lib/types';
import { PackageService, PackageSearchParams, PackageFilters as PackageFiltersType } from '@/lib/services/packageService';
import PackageGrid from '@/components/packages/PackageGrid';
import PackageFilters from '@/components/packages/PackageFilters';
import PackageSearch from '@/components/packages/PackageSearch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Grid3X3, 
  List, 
  Plus, 
  Filter, 
  SortAsc, 
  SortDesc,
  Package as PackageIcon,
  TrendingUp,
  DollarSign,
  Calendar
} from 'lucide-react';
import { useDebounce, useLoadingState } from '@/hooks';

const packageService = new PackageService();

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'title' | 'price' | 'rating' | 'popular';

const sortOptions = [
  { value: 'newest', label: 'Newest First', icon: SortDesc },
  { value: 'oldest', label: 'Oldest First', icon: SortAsc },
  { value: 'title', label: 'Alphabetical', icon: PackageIcon },
  { value: 'price', label: 'Price (Low to High)', icon: DollarSign },
  { value: 'rating', label: 'Highest Rated', icon: TrendingUp },
  { value: 'popular', label: 'Most Popular', icon: TrendingUp },
];

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const { isLoading: loading, error, startLoading, stopLoading, setError, clearError } = useLoadingState(30000, true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filters, setFilters] = useState<PackageFiltersType>({
    status: PackageStatus.ACTIVE // Default to showing active packages
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState({
    totalPackages: 0,
    activePackages: 0,
    totalRevenue: 0,
    averageRating: 0,
  });

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Load packages
  const loadPackages = useCallback(async () => {
    try {
      startLoading();
      clearError();

      const searchParams: PackageSearchParams = {
        query: debouncedSearchQuery || undefined,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        sortBy: getSortField(sortBy),
        sortOrder: getSortOrder(sortBy),
        page: pagination.page,
        limit: pagination.limit,
      };

      const response = await packageService.getPackages(searchParams);
      
      if (response.success) {
        setPackages(response.data.data);
        setPagination({
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          totalPages: response.data.totalPages,
        });
        stopLoading(); // Explicitly stop loading on success
      } else {
        setError(response.error || 'Failed to load packages');
      }
    } catch (err) {
      console.error('Error loading packages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load packages');
    }
  }, [debouncedSearchQuery, filters, sortBy, pagination.page, pagination.limit, startLoading, stopLoading, setError, clearError]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      console.log('🔄 Loading package stats...');
      const response = await packageService.getPackageStats();
      console.log('📊 Package stats response:', response);
      
      if (response.success) {
        console.log('✅ Package stats loaded successfully:', response.data);
        setStats(response.data);
      } else {
        console.error('❌ Failed to load package stats:', response.error);
        // Set fallback values
        setStats({
          totalPackages: 0,
          activePackages: 0,
          totalRevenue: 0,
          averageRating: 0,
        });
      }
    } catch (err) {
      console.error('❌ Error loading package stats:', err);
      // Set fallback values
      setStats({
        totalPackages: 0,
        activePackages: 0,
        totalRevenue: 0,
        averageRating: 0,
      });
    }
  }, []);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Helper functions
  const getSortField = (sort: SortOption): 'title' | 'price' | 'createdAt' | 'rating' => {
    switch (sort) {
      case 'title': return 'title';
      case 'price': return 'price';
      case 'rating': return 'rating';
      default: return 'createdAt';
    }
  };

  const getSortOrder = (sort: SortOption): 'asc' | 'desc' => {
    switch (sort) {
      case 'oldest':
      case 'title':
      case 'price': return 'asc';
      default: return 'desc';
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFiltersChange = (newFilters: PackageFiltersType) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleCreatePackage = () => {
    // Navigate to create package page
    window.location.href = '/operator/packages/create';
  };

  const getFilterCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== null && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-100 relative overflow-hidden">
      {/* Bright animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/40 to-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-br from-indigo-500/30 to-pink-500/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-emerald-400/25 to-cyan-500/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-yellow-300/20 to-orange-400/25 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-gradient-to-br from-violet-400/15 to-fuchsia-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>
      
      {/* Header */}
      <div className="relative z-10 backdrop-blur-xl border-b border-white/40"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 100%)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.9)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Package Management</h1>
                <p className="mt-1 text-gray-600 text-sm">
                  Manage your travel packages, view analytics, and track performance
                </p>
              </div>
              <Button 
                onClick={handleCreatePackage}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white backdrop-blur-sm"
                size="lg"
                style={{
                  boxShadow: '0 8px 32px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Package
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="backdrop-blur-xl rounded-2xl border border-white/40 p-5"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 100%)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.9)'
              }}>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-gradient-to-br from-blue-600/30 to-indigo-600/30 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                    style={{
                      boxShadow: '0 8px 25px rgba(59,130,246,0.3), inset 0 2px 4px rgba(255,255,255,0.7)'
                    }}>
                      <PackageIcon className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-500">Total Packages</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {stats.totalPackages > 0 ? stats.totalPackages : '0'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-xl rounded-2xl border border-white/40 p-5"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 100%)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.9)'
              }}>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-gradient-to-br from-green-600/30 to-emerald-600/30 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                    style={{
                      boxShadow: '0 8px 25px rgba(34,197,94,0.3), inset 0 2px 4px rgba(255,255,255,0.7)'
                    }}>
                      <div className="h-4 w-4 bg-green-600 rounded-full"></div>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-500">Active Packages</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {stats.activePackages > 0 ? stats.activePackages : '0'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-xl rounded-2xl border border-white/40 p-5"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 100%)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.9)'
              }}>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-gradient-to-br from-green-600/30 to-emerald-600/30 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                    style={{
                      boxShadow: '0 8px 25px rgba(34,197,94,0.3), inset 0 2px 4px rgba(255,255,255,0.7)'
                    }}>
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-500">Total Revenue</p>
                    <p className="text-xl font-semibold text-gray-900">
                      ${stats.totalRevenue > 0 ? stats.totalRevenue.toLocaleString() : '0'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-xl rounded-2xl border border-white/40 p-5"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 100%)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.9)'
              }}>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-gradient-to-br from-yellow-600/30 to-amber-600/30 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                    style={{
                      boxShadow: '0 8px 25px rgba(245,158,11,0.3), inset 0 2px 4px rgba(255,255,255,0.7)'
                    }}>
                      <TrendingUp className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-500">Avg Rating</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {/* Search and Controls */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <PackageSearch 
                onSearch={handleSearch}
                placeholder="Search packages..."
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <select
                  value={filters.status || 'ALL'}
                  onChange={(e) => {
                    const newFilters = { ...filters };
                    if (e.target.value === 'ALL') {
                      delete newFilters.status;
                    } else {
                      newFilters.status = e.target.value as PackageStatus;
                    }
                    handleFiltersChange(newFilters);
                  }}
                  className="border border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/70 backdrop-blur-md bg-white/30 hover:bg-white/50 focus:bg-white/60"
                  style={{
                    boxShadow: '0 8px 25px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.4)'
                  }}
                >
                  <option value="ALL">All Packages</option>
                  <option value={PackageStatus.DRAFT}>Draft</option>
                  <option value={PackageStatus.ACTIVE}>Active</option>
                  <option value={PackageStatus.INACTIVE}>Inactive</option>
                  <option value={PackageStatus.SUSPENDED}>Suspended</option>
                  <option value={PackageStatus.ARCHIVED}>Archived</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                  className="border border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/70 backdrop-blur-md bg-white/30 hover:bg-white/50 focus:bg-white/60"
                  style={{
                    boxShadow: '0 8px 25px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.4)'
                  }}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center border border-white/40 rounded-2xl backdrop-blur-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 100%)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.4)'
              }}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-2xl transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
                      : 'text-gray-600 hover:bg-white/20'
                  }`}
                  style={viewMode === 'grid' ? {
                    boxShadow: '0 8px 32px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                  } : {}}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-2xl transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
                      : 'text-gray-600 hover:bg-white/20'
                  }`}
                  style={viewMode === 'list' ? {
                    boxShadow: '0 8px 32px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                  } : {}}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Filters Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="relative backdrop-blur-sm border border-white/40 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 100%)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.4)'
                }}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {getFilterCount() > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs backdrop-blur-sm"
                  style={{
                    background: 'linear-gradient(135deg, rgba(239,68,68,0.8) 0%, rgba(220,38,38,0.8) 100%)',
                    boxShadow: '0 2px 8px rgba(239,68,68,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                  }}>
                    {getFilterCount()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 flex-shrink-0">
              <PackageFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClose={() => setShowFilters(false)}
              />
            </div>
          )}

          {/* Packages Grid */}
          <div className="flex-1">
            <PackageGrid
              packages={packages}
              loading={loading}
              error={error}
              viewMode={viewMode}
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
