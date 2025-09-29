'use client';

import React, { useState, useEffect } from 'react';
import { useItineraryCreation } from '@/context/ItineraryCreationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Plus, 
  Clock, 
  MapPin, 
  DollarSign,
  Users,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Trash2,
  Edit3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DaySummaryCard from './DaySummaryCard';
import DragDropActivityList from './DragDropActivityList';
import ActivityTimeline from './ActivityTimeline';

interface DayPlanningInterfaceProps {
  className?: string;
}

export default function DayPlanningInterface({ className }: DayPlanningInterfaceProps) {
  const { state, actions } = useItineraryCreation();
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');

  // Initialize days based on lead duration
  useEffect(() => {
    if (state.lead.duration > 0 && state.itineraryDays.length === 0) {
      const initialDays = Array.from({ length: state.lead.duration }, (_, index) => ({
        id: `day-${index + 1}`,
        dayNumber: index + 1,
        date: new Date(Date.now() + index * 24 * 60 * 60 * 1000),
        location: state.lead.destination,
        activities: [],
        accommodation: undefined,
        meals: [],
        transportation: undefined,
        notes: ''
      }));
      
      // This would be handled by the context in a real implementation
      console.log('Initializing days:', initialDays);
    }
  }, [state.lead.duration, state.itineraryDays.length, state.lead.destination]);

  const toggleDayExpansion = (dayId: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayId)) {
      newExpanded.delete(dayId);
    } else {
      newExpanded.add(dayId);
    }
    setExpandedDays(newExpanded);
  };

  const expandAllDays = () => {
    setExpandedDays(new Set(state.itineraryDays.map(day => day.id)));
  };

  const collapseAllDays = () => {
    setExpandedDays(new Set());
  };

  const getTotalCost = () => {
    return state.itineraryDays.reduce((total, day) => {
      return total + day.activities.reduce((dayTotal, activity) => dayTotal + activity.cost, 0);
    }, 0);
  };

  const getTotalDuration = () => {
    return state.itineraryDays.reduce((total, day) => {
      return total + day.activities.reduce((dayTotal, activity) => dayTotal + activity.duration, 0);
    }, 0);
  };

  const getDaysWithActivities = () => {
    return state.itineraryDays.filter(day => day.activities.length > 0);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (hours: number) => {
    const totalHours = Math.floor(hours);
    const minutes = Math.round((hours - totalHours) * 60);
    if (totalHours === 0) return `${minutes}m`;
    if (minutes === 0) return `${totalHours}h`;
    return `${totalHours}h ${minutes}m`;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Day-by-Day Planning</h3>
          <p className="text-sm text-gray-600">
            Arrange your selected packages across {state.lead.duration} days
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('timeline')}
            >
              Timeline
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>

          {/* Expand/Collapse Controls */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={expandAllDays}>
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAllDays}>
              Collapse All
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Days</p>
                <p className="text-lg font-semibold text-gray-900">{state.lead.duration}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Duration</p>
                <p className="text-lg font-semibold text-gray-900">{formatTime(getTotalDuration())}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${getTotalCost().toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Active Days</p>
                <p className="text-lg font-semibold text-gray-900">
                  {getDaysWithActivities().length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <ActivityTimeline 
          days={state.itineraryDays}
          selectedPackages={state.selectedPackages}
          onPackageAssign={(packageId, dayId) => {
            // TODO: Implement package assignment
            console.log('Assign package', packageId, 'to day', dayId);
          }}
          onActivityMove={(activityId, fromDayId, toDayId) => {
            // TODO: Implement activity movement
            console.log('Move activity', activityId, 'from', fromDayId, 'to', toDayId);
          }}
        />
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {state.itineraryDays.map((day, index) => (
            <Card key={day.id} className="overflow-hidden">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleDayExpansion(day.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {expandedDays.has(day.id) ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">
                          {day.dayNumber}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <CardTitle className="text-lg">
                        Day {day.dayNumber} - {formatDate(day.date)}
                      </CardTitle>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{day.location}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>
                            {day.activities.reduce((total, activity) => total + activity.duration, 0)}h
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            ${day.activities.reduce((total, activity) => total + activity.cost, 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {day.activities.length} activities
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Add custom activity
                        console.log('Add custom activity to day', day.id);
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedDays.has(day.id) && (
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Available Packages for this day */}
                    {state.selectedPackages.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Available Packages
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {state.selectedPackages.map((pkg) => (
                            <div
                              key={pkg.id}
                              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {pkg.packageName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {pkg.duration.days} days • ${pkg.totalPrice}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  // TODO: Assign package to day
                                  console.log('Assign package', pkg.id, 'to day', day.id);
                                }}
                              >
                                Add
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Activities for this day */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Day Activities
                      </h4>
                      {day.activities.length > 0 ? (
                        <DragDropActivityList
                          dayId={day.id}
                          activities={day.activities}
                          onActivityUpdate={(activityId, updates) => {
                            // TODO: Update activity
                            console.log('Update activity', activityId, updates);
                          }}
                          onActivityRemove={(activityId) => {
                            // TODO: Remove activity
                            console.log('Remove activity', activityId);
                          }}
                          onActivityReorder={(activityIds) => {
                            // TODO: Reorder activities
                            console.log('Reorder activities', activityIds);
                          }}
                        />
                      ) : (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No activities planned
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Add packages or custom activities to plan this day.
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => {
                              // TODO: Add custom activity
                              console.log('Add custom activity to day', day.id);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Activity
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Day Summary */}
                    <DaySummaryCard day={day} />
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {state.itineraryDays.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No days to plan
            </h3>
            <p className="text-gray-600 mb-4">
              Select packages first, then arrange them by day.
            </p>
            <Button
              variant="outline"
              onClick={() => actions.goToStep('PACKAGE_SELECTION')}
            >
              Select Packages
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
