'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GripVertical, 
  Clock, 
  DollarSign, 
  MapPin, 
  Edit3, 
  Trash2,
  Plus,
  Package,
  Car,
  Utensils,
  Bed,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ItineraryDayActivity, ActivityType } from '@/lib/types/itinerary-creation';

interface DragDropActivityListProps {
  dayId: string;
  activities: ItineraryDayActivity[];
  onActivityUpdate: (activityId: string, updates: Partial<ItineraryDayActivity>) => void;
  onActivityRemove: (activityId: string) => void;
  onActivityReorder: (activityIds: string[]) => void;
  className?: string;
}

export default function DragDropActivityList({
  dayId,
  activities,
  onActivityUpdate,
  onActivityRemove,
  onActivityReorder,
  className
}: DragDropActivityListProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

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

  const formatTime = (timeSlot: string) => {
    // Assuming timeSlot is in format "09:00 - 17:00"
    return timeSlot;
  };

  const formatDuration = (hours: number) => {
    const totalHours = Math.floor(hours);
    const minutes = Math.round((hours - totalHours) * 60);
    if (totalHours === 0) return `${minutes}m`;
    if (minutes === 0) return `${totalHours}h`;
    return `${totalHours}h ${minutes}m`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleDragStart = (e: React.DragEvent, activityId: string) => {
    setDraggedItem(activityId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, activityId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(activityId);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent, targetActivityId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetActivityId) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const draggedIndex = activities.findIndex(a => a.id === draggedItem);
    const targetIndex = activities.findIndex(a => a.id === targetActivityId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    // Create new order
    const newActivities = [...activities];
    const [draggedActivity] = newActivities.splice(draggedIndex, 1);
    newActivities.splice(targetIndex, 0, draggedActivity);
    
    // Update order indices
    const reorderedActivities = newActivities.map((activity, index) => ({
      ...activity,
      orderIndex: index
    }));

    onActivityReorder(reorderedActivities.map(a => a.id));
    
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No activities yet
        </h3>
        <p className="text-gray-600 mb-4">
          Drag and drop activities here or add new ones.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            // TODO: Add new activity
            console.log('Add new activity to day', dayId);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Activity
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {activities
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((activity, index) => {
          const IconComponent = getActivityIcon(activity.activityType);
          const isDragging = draggedItem === activity.id;
          const isDragOver = dragOverItem === activity.id;

          return (
            <Card
              key={activity.id}
              className={cn(
                "transition-all duration-200 cursor-move",
                isDragging && "opacity-50 scale-95",
                isDragOver && "ring-2 ring-blue-500 bg-blue-50",
                "hover:shadow-md"
              )}
              draggable
              onDragStart={(e) => handleDragStart(e, activity.id)}
              onDragOver={(e) => handleDragOver(e, activity.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, activity.id)}
              onDragEnd={handleDragEnd}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {/* Drag Handle */}
                  <div className="flex-shrink-0">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-grab active:cursor-grabbing" />
                  </div>

                  {/* Activity Icon */}
                  <div className="flex-shrink-0">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      getActivityColor(activity.activityType)
                    )}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Activity Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {activity.activityName}
                        </h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(activity.timeSlot)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDuration(activity.durationHours)}</span>
                          </div>
                          {activity.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span className="truncate">{activity.location}</span>
                            </div>
                          )}
                        </div>
                        {activity.notes && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {activity.notes}
                          </p>
                        )}
                      </div>

                      {/* Price and Actions */}
                      <div className="flex items-center space-x-3 ml-4">
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {formatPrice(activity.cost)}
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs", getActivityColor(activity.activityType))}
                          >
                            {activity.activityType}
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              // TODO: Edit activity
                              console.log('Edit activity', activity.id);
                            }}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onActivityRemove(activity.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

      {/* Add Activity Button */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="p-4">
          <Button
            variant="ghost"
            className="w-full h-auto p-4 text-gray-600 hover:text-gray-900"
            onClick={() => {
              // TODO: Add new activity
              console.log('Add new activity to day', dayId);
            }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Custom Activity
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
