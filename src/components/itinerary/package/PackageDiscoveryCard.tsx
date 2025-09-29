'use client';

import React from 'react';
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
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EnhancedPackage } from '@/lib/types/itinerary-creation';

interface PackageDiscoveryCardProps {
  pkg: EnhancedPackage;
  isRecommended?: boolean;
  recommendationScore?: number;
  recommendationReason?: string;
  isSelected: boolean;
  onAdd: () => void;
  onRemove: () => void;
  className?: string;
}

export default function PackageDiscoveryCard({
  pkg,
  isRecommended = false,
  recommendationScore,
  recommendationReason,
  isSelected,
  onAdd,
  onRemove,
  className
}: PackageDiscoveryCardProps) {
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

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      'EASY': 'bg-green-100 text-green-800',
      'MODERATE': 'bg-yellow-100 text-yellow-800',
      'CHALLENGING': 'bg-orange-100 text-orange-800',
      'EXPERT': 'bg-red-100 text-red-800',
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className={cn(
      "group relative transition-all duration-200 hover:shadow-lg",
      isSelected && "ring-2 ring-blue-500 bg-blue-50",
      isRecommended && "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50",
      className
    )}>
      {/* Recommendation Badge */}
      {isRecommended && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
            <Sparkles className="w-3 h-3 mr-1" />
            Recommended
          </Badge>
        </div>
      )}

      {/* Recommendation Score */}
      {recommendationScore && (
        <div className="absolute top-2 left-2 z-10">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
            <TrendingUp className="w-3 h-3 mr-1" />
            {Math.round(recommendationScore * 100)}% match
          </Badge>
        </div>
      )}

      <CardContent className="p-4">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                {pkg.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {pkg.description}
              </p>
            </div>
          </div>

          {/* Package Type and Difficulty */}
          <div className="flex items-center space-x-2">
            <Badge className={getPackageTypeColor(pkg.type)}>
              {pkg.type.replace('_', ' ')}
            </Badge>
            <Badge variant="outline" className={getDifficultyColor(pkg.difficulty)}>
              {pkg.difficulty}
            </Badge>
          </div>

          {/* Rating and Reviews */}
          {pkg.rating > 0 && (
            <div className="flex items-center space-x-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-4 h-4",
                      i < Math.floor(pkg.rating) 
                        ? "text-yellow-400 fill-current" 
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-900">{pkg.rating}</span>
              <span className="text-sm text-gray-500">({pkg.reviewCount} reviews)</span>
            </div>
          )}

          {/* Key Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                {formatDuration(pkg.duration.days, pkg.duration.hours)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                {pkg.groupSize.min}-{pkg.groupSize.max} people
              </span>
            </div>
          </div>

          {/* Destinations */}
          {pkg.destinations.length > 0 && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <div className="flex flex-wrap gap-1">
                {pkg.destinations.slice(0, 2).map((dest, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {dest}
                  </Badge>
                ))}
                {pkg.destinations.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{pkg.destinations.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Recommendation Reason */}
          {isRecommended && recommendationReason && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
              <p className="text-xs text-blue-700">
                <strong>Why recommended:</strong> {recommendationReason}
              </p>
            </div>
          )}

          {/* Price and Action */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(pkg.pricing.adult)}
              </span>
              {pkg.pricing.child && pkg.pricing.child !== pkg.pricing.adult && (
                <span className="text-sm text-gray-500">
                  / {formatPrice(pkg.pricing.child)} child
                </span>
              )}
            </div>

            <Button
              size="sm"
              onClick={isSelected ? onRemove : onAdd}
              className={cn(
                "transition-all duration-200",
                isSelected
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              )}
            >
              {isSelected ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Added
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </>
              )}
            </Button>
          </div>

          {/* Operator Info */}
          <div className="text-xs text-gray-500 pt-1 border-t border-gray-100">
            by {pkg.operatorName}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
