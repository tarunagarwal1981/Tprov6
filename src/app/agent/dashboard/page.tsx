'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Users, 
  MapPin, 
  Package, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  Eye,
  Star,
  Clock,
  Plus,
  ArrowRight,
  Activity,
  BarChart3,
  MessageSquare,
  Settings,
  Bell,
  Filter,
  Search,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock3,
  Target,
  Percent,
  Sparkles,
  Zap
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/lib/types';
import { useImprovedAuth } from '@/context/ImprovedAuthContext';
import { AgentStatsGrid } from '@/components/dashboard/AgentStatsCard';
import { RecentLeads } from '@/components/dashboard/RecentLeads';
import { RecentItineraries } from '@/components/dashboard/RecentItineraries';
import { AgentQuickActions } from '@/components/dashboard/AgentQuickActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { agentService } from '@/lib/services/agentService';
import { AgentDashboardData } from '@/lib/types/agent';

// Define roles outside component to prevent re-creation on every render
const AGENT_ROLES = [UserRole.TRAVEL_AGENT];

function AgentDashboard() {
  const { state } = useImprovedAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [dashboardData, setDashboardData] = useState<AgentDashboardData | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  console.log('👤 AgentDashboard component loaded:', {
    user: state.user,
    isLoading: state.isLoading
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const loadDashboardData = async () => {
    try {
      setIsLoadingStats(true);
      const response = await agentService.getDashboardData(state.user?.id || 'agent-001');
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const quickActions = [
    {
      title: 'Create New Itinerary',
      description: 'Start building an itinerary from a lead',
      icon: MapPin,
      href: '/agent/itineraries/create',
      color: 'from-blue-500 to-purple-600',
      primary: true
    },
    {
      title: 'Browse Packages',
      description: 'Find packages from tour operators',
      icon: Package,
      href: '/agent/packages',
      color: 'from-green-500 to-emerald-600',
      primary: false
    },
    {
      title: 'Manage Leads',
      description: 'View and update your leads',
      icon: Users,
      href: '/agent/leads',
      color: 'from-orange-500 to-red-600',
      primary: false
    },
    {
      title: 'View Analytics',
      description: 'Track your performance',
      icon: BarChart3,
      href: '/agent/analytics',
      color: 'from-purple-500 to-pink-600',
      primary: false
    }
  ];

  const recentActivity = dashboardData?.recentActivity || [];
  const topPackages = dashboardData?.topPackages || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 p-6 space-y-8">
        {/* Enhanced Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="backdrop-blur-xl rounded-2xl border border-white/20 p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Welcome back, {state.user?.profile?.firstName || state.user?.name || 'Agent'}! 👋
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Here's what's happening with your travel business today</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm font-medium backdrop-blur-sm"
                style={{
                  boxShadow: '0 4px 16px rgba(34,197,94,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}>
                  {state.user?.role}
                </span>
                <motion.button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl hover:bg-white/30 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw className={`w-4 h-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats Grid */}
        {dashboardData && (
          <AgentStatsGrid 
            stats={dashboardData.stats} 
          />
        )}

        {/* Enhanced Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Leads */}
          <RecentLeads
            leads={dashboardData?.recentLeads || []}
            viewAllLink="/agent/leads"
          />

          {/* Recent Itineraries */}
          <RecentItineraries
            itineraries={dashboardData?.recentItineraries || []}
            viewAllLink="/agent/itineraries"
          />

          {/* Quick Actions */}
          <AgentQuickActions />
        </div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="backdrop-blur-xl rounded-2xl border border-white/20 p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}
        >
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 backdrop-blur-sm bg-white/20 rounded-xl border border-white/30">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Top Packages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="backdrop-blur-xl rounded-2xl border border-white/20 p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}
        >
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Package className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Popular Packages</h3>
          </div>
          {topPackages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>No packages available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topPackages.map((pkg, index) => (
                <div key={pkg.id} className="flex items-center justify-between p-3 backdrop-blur-sm bg-white/20 rounded-xl border border-white/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{pkg.name}</p>
                    <p className="text-sm text-gray-600">{pkg.destination}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-500">{pkg.rating}</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{pkg.bookings} bookings</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">${pkg.price.toLocaleString()}</p>
                    <Button size="sm" variant="outline" className="mt-1 backdrop-blur-sm border border-white/40">
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function AgentDashboardPage() {
  return (
    <ProtectedRoute requiredRoles={AGENT_ROLES}>
      <AgentDashboard />
    </ProtectedRoute>
  );
}
