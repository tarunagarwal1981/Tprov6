'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign,
  Plus,
  Package,
  Car,
  Utensils,
  Bed,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ItineraryDay, ItineraryDayActivity, ActivityType, SelectedPackage } from '@/lib/types/itinerary-creation';

interface ActivityTimelineProps {
  days: ItineraryDay[];
  selectedPackages: SelectedPackage[];
  onPackageAssign: (packageId: string, dayId: string) => void;
  onActivityMove: (activityId: string, fromDayId: string, toDayId: string) => void;
  className?: string;
}

export default function ActivityTimeline({
  days,
  selectedPackages,
  onPackageAssign,
  onActivityMove,
  className
}: ActivityTimelineProps) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

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
        return 'bg-blue-500';
      case 'TRANSFER':
        return 'bg-green-500';
      case 'MEAL':
        return 'bg-orange-500';
      case 'ACCOMMODATION':
        return 'bg-purple-500';
      case 'CUSTOM':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTime = (timeSlot: string) => {
    // Assuming timeSlot is in format "09:00 - 17:00"
    return timeSlot;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getTimePosition = (timeSlot: string) => {
    // Extract start time and convert to percentage of day
    const startTime = timeSlot.split(' - ')[0];
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const dayMinutes = 24 * 60;
    return (totalMinutes / dayMinutes) * 100;
  };

  const getActivityDuration = (timeSlot: string) => {
    const [start, end] = timeSlot.split(' - ');
    const [startHours, startMinutes] = start.split(':').map(Number);
    const [endHours, endMinutes] = end.split(':').map(Number);
    const startTotal = startHours * 60 + startMinutes;
    const endTotal = endHours * 60 + endMinutes;
    const duration = endTotal - startTotal;
    return (duration / (24 * 60)) * 100; // Convert to percentage of day
  };

  const currentDay = days[currentDayIndex];
  const hasPrevious = currentDayIndex > 0;
  const hasNext = currentDayIndex < days.length - 1;

  if (days.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No days to display
          </h3>
          <p className="text-gray-600">
            Create days first to see the timeline view.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Timeline Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Timeline View</span>
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDayIndex(Math.max(0, currentDayIndex - 1))}
                disabled={!hasPrevious}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <span className="text-sm font-medium text-gray-700">
                Day {currentDayIndex + 1} of {days.length}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDayIndex(Math.min(days.length - 1, currentDayIndex + 1))}
                disabled={!hasNext}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Day Navigation */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {days.map((day, index) => (
          <Button
            key={day.id}
            variant={index === currentDayIndex ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentDayIndex(index)}
            className="flex-shrink-0"
          >
            Day {day.dayNumber}
          </Button>
        ))}
      </div>

      {/* Timeline Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Visualization */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  Day {currentDay.dayNumber} - {formatDate(currentDay.date)}
                </span>
                <Badge variant="secondary">
                  {currentDay.activities.length} activities
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Timeline */}
              <div className="relative">
                {/* Time markers */}
                <div className="absolute inset-0 flex justify-between text-xs text-gray-500">
                  <span>12:00 AM</span>
                  <span>6:00 AM</span>
                  <span>12:00 PM</span>
                  <span>6:00 PM</span>
                  <span>12:00 AM</span>
                </div>

                {/* Timeline line */}
                <div className="absolute left-0 right-0 top-8 h-0.5 bg-gray-300"></div>

                {/* Activities */}
                <div className="relative mt-12 space-y-2">
                  {currentDay.activities
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((activity) => {
                      const IconComponent = getActivityIcon(activity.activityType);
                      const position = getTimePosition(activity.timeSlot);
                      const duration = getActivityDuration(activity.timeSlot);

                      return (
                        <div
                          key={activity.id}
                          className="absolute flex items-center space-x-2"
                          style={{
                            left: `${position}%`,
                            width: `${Math.max(duration, 5)}%`
                          }}
                        >
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            getActivityColor(activity.activityType)
                          )} />
                          <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm min-w-0">
                            <div className="flex items-center space-x-2">
                              <IconComponent className="w-4 h-4 text-gray-600" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {activity.activityName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatTime(activity.timeSlot)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Empty state */}
                {currentDay.activities.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No activities planned
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Add packages or custom activities to see them on the timeline.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // TODO: Add custom activity
                        console.log('Add custom activity to day', currentDay.id);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Activity
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Available Packages */}
        <div className="space-y-4">
          {/* Day Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Day Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Location</span>
                <span className="text-sm font-medium text-gray-900">
                  {currentDay.location}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Activities</span>
                <span className="text-sm font-medium text-gray-900">
                  {currentDay.activities.length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Cost</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatPrice(
                    currentDay.activities.reduce((total, activity) => total + activity.cost, 0)
                  )}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Duration</span>
                <span className="text-sm font-medium text-gray-900">
                  {currentDay.activities.reduce((total, activity) => total + activity.durationHours, 0).toFixed(1)}h
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Available Packages */}
          {selectedPackages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available Packages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {pkg.packageName}
                      </p>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                        <span>{pkg.duration.days} days</span>
                        <span>•</span>
                        <span>{formatPrice(pkg.totalPrice)}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPackageAssign(pkg.id, currentDay.id)}
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // TODO: Add custom activity
                  console.log('Add custom activity to day', currentDay.id);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Activity
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // TODO: Add accommodation
                  console.log('Add accommodation to day', currentDay.id);
                }}
              >
                <Bed className="w-4 h-4 mr-2" />
                Add Accommodation
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // TODO: Add transfer
                  console.log('Add transfer to day', currentDay.id);
                }}
              >
                <Car className="w-4 h-4 mr-2" />
                Add Transfer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
