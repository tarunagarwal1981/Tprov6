'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Calendar, 
  DollarSign, 
  Users, 
  Star, 
  TrendingUp 
} from 'lucide-react';
import { StatsCard } from './StatsCard';
import { dashboardService } from '@/lib/services';
import { cn } from '@/lib/utils';
import { useLoadingState } from '@/hooks';

interface StatsGridProps {
  className?: string;
}

export function StatsGrid({ className }: StatsGridProps) {
  const [stats, setStats] = useState({
    totalPackages: 0,
    activeBookings: 0,
    monthlyRevenue: 0,
    totalAgents: 0,
    averageRating: 0,
    conversionRate: 0
  });
  const { isLoading: loading, error, startLoading, stopLoading, setError, clearError } = useLoadingState(8000, true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        startLoading();
        clearError();
        const response = await dashboardService.getDashboardStats();
        
        if (response.success) {
          setStats({
            totalPackages: response.data.totalPackages,
            activeBookings: response.data.activeBookings,
            monthlyRevenue: response.data.monthlyRevenue,
            totalAgents: response.data.totalAgents,
            averageRating: response.data.averageRating,
            conversionRate: 18.7 // Mock conversion rate
          });
          stopLoading();
        } else {
          setError(response.error || 'Failed to fetch statistics');
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching statistics');
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="rounded-xl bg-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 w-24 bg-gray-300 rounded mb-2" />
                  <div className="h-8 w-16 bg-gray-300 rounded mb-2" />
                  <div className="h-3 w-20 bg-gray-300 rounded" />
                </div>
                <div className="h-12 w-12 bg-gray-300 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('rounded-xl bg-red-50 border border-red-200 p-6', className)}>
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
    );
  }

  const statsData = [
    {
      title: 'Total Packages',
      value: stats.totalPackages,
      trend: { value: 12, isPositive: true },
      icon: Package,
      color: 'blue' as const,
      delay: 0
    },
    {
      title: 'Active Bookings',
      value: stats.activeBookings,
      trend: { value: 8, isPositive: true },
      icon: Calendar,
      color: 'green' as const,
      delay: 0.1
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      trend: { value: 15, isPositive: true },
      icon: DollarSign,
      color: 'purple' as const,
      delay: 0.2
    },
    {
      title: 'Partner Agents',
      value: stats.totalAgents,
      trend: { value: 5, isPositive: true },
      icon: Users,
      color: 'orange' as const,
      delay: 0.3
    },
    {
      title: 'Average Rating',
      value: stats.averageRating.toFixed(1),
      trend: { value: 2, isPositive: true },
      icon: Star,
      color: 'indigo' as const,
      delay: 0.4
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      trend: { value: 3, isPositive: true },
      icon: TrendingUp,
      color: 'red' as const,
      delay: 0.5
    }
  ];

  return (
    <div className={cn('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {statsData.map((stat, index) => (
        <StatsCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          trend={stat.trend}
          icon={stat.icon}
          color={stat.color}
          delay={stat.delay}
        />
      ))}
    </div>
  );
}
