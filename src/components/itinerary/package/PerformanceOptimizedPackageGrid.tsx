'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Clock, 
  DollarSign, 
  MapPin, 
  Users, 
  Plus, 
  Check,
  Package as PackageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EnhancedPackage } from '@/lib/types/itinerary-creation';

interface PerformanceOptimizedPackageGridProps {
  packages: EnhancedPackage[];
  selectedPackageIds: Set<string>;
  onPackageSelect: (pkg: EnhancedPackage) => void;
  onPackageDeselect: (packageId: string) => void;
  className?: string;
  loading?: boolean;
}

// Memoized package card component
const PackageCard = React.memo(({ 
  pkg, 
  isSelected, 
  onSelect, 
  onDeselect 
}: {
  pkg: EnhancedPackage;
  isSelected: boolean;
  onSelect: (pkg: EnhancedPackage) => void;
  onDeselect: (packageId: string) => void;
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: pkg.pricing.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDuration = (days: number, hours: number) => {
    if (days > 1) {
      return `${days} days`;
    } else if (days === 1) {
      return hours > 8 ? '1 day' : `${hours}h`;
    } else {
      return `${hours}h`;
    }
  };

  const getPackageTypeColor = (type: string) => {
    const colors = {
      'ACTIVITY': 'bg-green-100 text-green-800',
      'TRANSFERS': 'bg-blue-100 text-blue-800',
      'LAND_PACKAGE': 'bg-purple-100 text-purple-800',
      'HOTEL': 'bg-orange-100 text-orange-800',
      'CRUISE': 'bg-cyan-100 text-cyan-800',
      'FLIGHT': 'bg-indigo-100 text-indigo-800',
      'COMBO': 'bg-pink-100 text-pink-800',
      'CUSTOM': 'bg-gray-100 text-gray-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className={cn(
      "h-full transition-all duration-200 hover:shadow-lg",
      isSelected && "ring-2 ring-blue-500 bg-blue-50"
    )}>
      <CardContent className="p-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm">
              {pkg.title}
            </h3>
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {pkg.description}
            </p>
          </div>
        </div>

        {/* Package Type */}
        <div className="mb-3">
          <Badge className={getPackageTypeColor(pkg.type)}>
            {pkg.type.replace('_', ' ')}
          </Badge>
        </div>

        {/* Rating */}
        {pkg.rating > 0 && (
          <div className="flex items-center space-x-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3 h-3",
                    i < Math.floor(pkg.rating) 
                      ? "text-yellow-400 fill-current" 
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-gray-900">{pkg.rating}</span>
            <span className="text-xs text-gray-500">({pkg.reviewCount})</span>
          </div>
        )}

        {/* Key Info */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-gray-600">
              {formatDuration(pkg.duration.days, pkg.duration.hours)}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3 text-gray-400" />
            <span className="text-gray-600">
              {pkg.groupSize.min}-{pkg.groupSize.max}
            </span>
          </div>
        </div>

        {/* Destinations */}
        {pkg.destinations.length > 0 && (
          <div className="flex items-center space-x-1 mb-3">
            <MapPin className="w-3 h-3 text-gray-400" />
            <div className="flex flex-wrap gap-1">
              {pkg.destinations.slice(0, 1).map((dest, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {dest}
                </Badge>
              ))}
              {pkg.destinations.length > 1 && (
                <Badge variant="outline" className="text-xs">
                  +{pkg.destinations.length - 1}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Price and Action */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <DollarSign className="w-3 h-3 text-green-600" />
            <span className="text-sm font-bold text-gray-900">
              {formatPrice(pkg.pricing.adult)}
            </span>
          </div>

          <Button
            size="sm"
            onClick={() => isSelected ? onDeselect(pkg.id) : onSelect(pkg)}
            className={cn(
              "h-6 px-2 text-xs",
              isSelected
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            )}
          >
            {isSelected ? (
              <>
                <Check className="w-3 h-3 mr-1" />
                Added
              </>
            ) : (
              <>
                <Plus className="w-3 h-3 mr-1" />
                Add
              </>
            )}
          </Button>
        </div>

        {/* Operator Info */}
        <div className="text-xs text-gray-500 pt-1 border-t border-gray-100 mt-2">
          by {pkg.operatorName}
        </div>
      </CardContent>
    </Card>
  );
});

PackageCard.displayName = 'PackageCard';

export default function PerformanceOptimizedPackageGrid({
  packages,
  selectedPackageIds,
  onPackageSelect,
  onPackageDeselect,
  className,
  loading = false
}: PerformanceOptimizedPackageGridProps) {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 600 });
  const [isVirtualized, setIsVirtualized] = useState(false);

  // Calculate grid dimensions
  const gridConfig = useMemo(() => {
    const cardWidth = 300;
    const cardHeight = 400;
    const gap = 16;
    
    const columns = Math.floor((containerSize.width + gap) / (cardWidth + gap));
    const rows = Math.ceil(packages.length / columns);
    
    return {
      columns: Math.max(1, columns),
      rows,
      cardWidth,
      cardHeight,
      gap
    };
  }, [containerSize.width, packages.length]);

  // Determine if we should use virtualization
  useEffect(() => {
    const shouldVirtualize = packages.length > 20;
    setIsVirtualized(shouldVirtualize);
  }, [packages.length]);

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('package-grid-container');
      if (container) {
        setContainerSize({
          width: container.offsetWidth,
          height: container.offsetHeight
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Memoized package selection handlers
  const handlePackageSelect = useCallback((pkg: EnhancedPackage) => {
    onPackageSelect(pkg);
  }, [onPackageSelect]);

  const handlePackageDeselect = useCallback((packageId: string) => {
    onPackageDeselect(packageId);
  }, [onPackageDeselect]);

  // Grid cell renderer for virtualization
  const Cell = useCallback(({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * gridConfig.columns + columnIndex;
    const pkg = packages[index];
    
    if (!pkg) {
      return <div style={style} />;
    }

    return (
      <div style={{ ...style, padding: gridConfig.gap / 2 }}>
        <PackageCard
          pkg={pkg}
          isSelected={selectedPackageIds.has(pkg.id)}
          onSelect={handlePackageSelect}
          onDeselect={handlePackageDeselect}
        />
      </div>
    );
  }, [packages, selectedPackageIds, gridConfig, handlePackageSelect, handlePackageDeselect]);

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
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
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <PackageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
        <p className="text-gray-600">
          Try adjusting your search terms or filters to find more packages.
        </p>
      </div>
    );
  }

  return (
    <div 
      id="package-grid-container"
      className={cn("w-full", className)}
      style={{ height: isVirtualized ? '600px' : 'auto' }}
    >
      {isVirtualized ? (
        <Grid
          columnCount={gridConfig.columns}
          columnWidth={gridConfig.cardWidth + gridConfig.gap}
          height={containerSize.height}
          rowCount={gridConfig.rows}
          rowHeight={gridConfig.cardHeight + gridConfig.gap}
          width={containerSize.width}
        >
          {Cell}
        </Grid>
      ) : (
        <div 
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(auto-fill, minmax(${gridConfig.cardWidth}px, 1fr))`
          }}
        >
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              isSelected={selectedPackageIds.has(pkg.id)}
              onSelect={handlePackageSelect}
              onDeselect={handlePackageDeselect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
