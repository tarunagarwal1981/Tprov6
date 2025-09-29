'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  UserPlus, 
  Package,
  Clock,
  ArrowRight
} from 'lucide-react';
import { dashboardService } from '@/lib/services';
import { ActivityFeedItem } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { useLoadingState } from '@/hooks';

interface RecentActivityProps {
  className?: string;
}

interface ActivityItemProps {
  activity: ActivityFeedItem;
  index: number;
}

function ActivityItem({ activity, index }: ActivityItemProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return Calendar;
      case 'payment':
        return DollarSign;
      case 'inquiry':
        return MessageSquare;
      case 'agent_joined':
        return UserPlus;
      case 'package_update':
        return Package;
      default:
        return Clock;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'booking':
        return 'text-blue-600 bg-blue-100';
      case 'payment':
        return 'text-green-600 bg-green-100';
      case 'inquiry':
        return 'text-purple-600 bg-purple-100';
      case 'agent_joined':
        return 'text-orange-600 bg-orange-100';
      case 'package_update':
        return 'text-indigo-600 bg-indigo-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const Icon = getActivityIcon(activity.type);
  const colorClass = getActivityColor(activity.type);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
    >
      {/* Icon */}
      <div className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full',
        colorClass
      )}>
        <Icon className="h-4 w-4" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {activity.title}
          </h4>
          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
            {formatTimeAgo(activity.timestamp)}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
          {activity.description}
        </p>
        {activity.userName && (
          <p className="mt-1 text-xs text-gray-500">
            by {activity.userName}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export function RecentActivity({ className }: RecentActivityProps) {
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const { isLoading: loading, error, startLoading, stopLoading, setError, clearError } = useLoadingState(8000, true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        startLoading();
        clearError();
        const response = await dashboardService.getRecentActivity(5);
        
        if (response.success) {
          setActivities(response.data);
          stopLoading();
        } else {
          setError(response.error || 'Failed to fetch recent activity');
        }
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching recent activity');
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          <p className="text-sm text-gray-600 mt-1">Latest updates and events</p>
        </div>
        
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-start space-x-4 p-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('space-y-6', className)}>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          <p className="text-sm text-gray-600 mt-1">Latest updates and events</p>
        </div>
        
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          <p className="text-sm text-gray-600 mt-1">Latest updates and events</p>
        </div>
        <motion.a
          href="/operator/activity"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
        >
          View All
          <ArrowRight className="ml-1 h-4 w-4" />
        </motion.a>
      </div>

      {/* Activity List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {activities.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">No recent activity</h3>
            <p className="mt-2 text-sm text-gray-500">
              Activity will appear here as it happens.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {activities.map((activity, index) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      {/* Activity Summary */}
      {activities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="bg-gray-50 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {activities.length} recent activities
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Stay updated with your business progress
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-600">Live</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
