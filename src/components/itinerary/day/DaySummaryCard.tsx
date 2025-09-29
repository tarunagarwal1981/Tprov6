'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  DollarSign, 
  MapPin, 
  Users,
  Package,
  Car,
  Utensils,
  Bed,
  Activity,
  Calendar,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ItineraryDay, ItineraryDayActivity, ActivityType } from '@/lib/types/itinerary-creation';

interface DaySummaryCardProps {
  day: ItineraryDay;
  className?: string;
}

export default function DaySummaryCard({ day, className }: DaySummaryCardProps) {
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'PACKAGE':
        return Package;
      case 'TRANSFER':
        return Car;
      case 'MEAL':
        return Utensils;
      case 'ACCOMMODATION':
        return Bed;
      case 'CUSTOM':
        return Activity;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'PACKAGE':
        return 'bg-blue-100 text-blue-800';
      case 'TRANSFER':
        return 'bg-green-100 text-green-800';
      case 'MEAL':
        return 'bg-orange-100 text-orange-800';
      case 'ACCOMMODATION':
        return 'bg-purple-100 text-purple-800';
      case 'CUSTOM':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeSlot: string) => {
    // Assuming timeSlot is in format "09:00 - 17:00"
    return timeSlot;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDuration = (hours: number) => {
    const totalHours = Math.floor(hours);
    const minutes = Math.round((hours - totalHours) * 60);
    if (totalHours === 0) return `${minutes}m`;
    if (minutes === 0) return `${totalHours}h`;
    return `${totalHours}h ${minutes}m`;
  };

  const getTotalCost = () => {
    return day.activities.reduce((total, activity) => total + activity.cost, 0);
  };

  const getTotalDuration = () => {
    return day.activities.reduce((total, activity) => total + activity.durationHours, 0);
  };

  const getActivityTypeCounts = () => {
    const counts: Record<ActivityType, number> = {
      'PACKAGE': 0,
      'TRANSFER': 0,
      'MEAL': 0,
      'ACCOMMODATION': 0,
      'CUSTOM': 0
    };

    day.activities.forEach(activity => {
      counts[activity.activityType]++;
    });

    return counts;
  };

  const getEarliestActivity = () => {
    if (day.activities.length === 0) return null;
    
    return day.activities.reduce((earliest, current) => {
      const earliestTime = earliest.timeSlot.split(' - ')[0];
      const currentTime = current.timeSlot.split(' - ')[0];
      return currentTime < earliestTime ? current : earliest;
    });
  };

  const getLatestActivity = () => {
    if (day.activities.length === 0) return null;
    
    return day.activities.reduce((latest, current) => {
      const latestTime = latest.timeSlot.split(' - ')[1];
      const currentTime = current.timeSlot.split(' - ')[1];
      return currentTime > latestTime ? current : latest;
    });
  };

  const activityTypeCounts = getActivityTypeCounts();
  const earliestActivity = getEarliestActivity();
  const latestActivity = getLatestActivity();

  return (
    <Card className={cn("border-l-4 border-l-blue-500", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Day {day.dayNumber} Summary</span>
          </div>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
            {day.activities.length} activities
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Date and Location */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(day.date)}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{day.location}</span>
          </div>
        </div>

        {/* Time Range */}
        {earliestActivity && latestActivity && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Day Schedule</span>
              </div>
              <div className="font-medium text-gray-900">
                {formatTime(earliestActivity.timeSlot.split(' - ')[0])} - {formatTime(latestActivity.timeSlot.split(' - ')[1])}
              </div>
            </div>
          </div>
        )}

        {/* Activity Type Breakdown */}
        {day.activities.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Activity Types</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(activityTypeCounts).map(([type, count]) => {
                if (count === 0) return null;
                const IconComponent = getActivityIcon(type as ActivityType);
                
                return (
                  <Badge
                    key={type}
                    variant="secondary"
                    className={cn("flex items-center space-x-1", getActivityColor(type as ActivityType))}
                  >
                    <IconComponent className="w-3 h-3" />
                    <span>{type}</span>
                    <span className="ml-1">({count})</span>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Cost and Duration Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-green-700">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-medium">Total Cost</span>
            </div>
            <div className="text-lg font-bold text-green-900 mt-1">
              {formatPrice(getTotalCost())}
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-blue-700">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Total Duration</span>
            </div>
            <div className="text-lg font-bold text-blue-900 mt-1">
              {formatDuration(getTotalDuration())}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-lg font-semibold text-gray-900">
              {day.activities.length}
            </div>
            <div className="text-xs text-gray-600">Activities</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-lg font-semibold text-gray-900">
              {day.meals.length}
            </div>
            <div className="text-xs text-gray-600">Meals</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-lg font-semibold text-gray-900">
              {day.accommodation ? '1' : '0'}
            </div>
            <div className="text-xs text-gray-600">Hotels</div>
          </div>
        </div>

        {/* Notes */}
        {day.notes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-yellow-800 mb-1">Notes</h4>
            <p className="text-sm text-yellow-700">{day.notes}</p>
          </div>
        )}

        {/* Empty State */}
        {day.activities.length === 0 && (
          <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
            <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No activities planned for this day</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
