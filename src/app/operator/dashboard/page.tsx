'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Package, 
  Calendar, 
  Users, 
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
  MapPin,
  Plane,
  Car,
  Building,
  Bed,
  Utensils,
  Camera,
  Mountain,
  Waves,
  Zap
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/lib/types';
import { useImprovedAuth } from '@/context/ImprovedAuthContext';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentBookings } from '@/components/dashboard/RecentBookings';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { TopPackages } from '@/components/dashboard/TopPackages';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { dashboardService } from '@/lib/services/dashboardService';
import { DashboardStats } from '@/lib/mockData';

// Define roles outside component to prevent re-creation on every render
const OPERATOR_ROLES = [UserRole.TOUR_OPERATOR];

function OperatorDashboard() {
  const { state } = useImprovedAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalPackages: 0,
    activeBookings: 0,
    totalAgents: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    monthlyGrowth: 0,
    averageRating: 0,
    totalCustomers: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  console.log('🏢 OperatorDashboard component loaded:', {
    user: state.user,
    isLoading: state.isLoading
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardStats();
    setIsRefreshing(false);
  };

  const loadDashboardStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await dashboardService.getRealDashboardStats();
      if (response.success) {
        setDashboardStats(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Load stats on component mount
  useEffect(() => {
    loadDashboardStats();
  }, []);

  const stats = [
    {
      title: 'Total Packages',
      value: isLoadingStats ? '-' : dashboardStats.totalPackages.toString(),
      change: isLoadingStats ? '-' : `+${dashboardStats.monthlyGrowth.toFixed(1)}%`,
      changeType: 'positive' as const,
      icon: Package,
      color: 'blue' as const,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
    },
    {
      title: 'Active Bookings',
      value: isLoadingStats ? '-' : dashboardStats.activeBookings.toString(),
      change: isLoadingStats ? '-' : `+${dashboardStats.monthlyGrowth.toFixed(1)}%`,
      changeType: 'positive' as const,
      icon: Calendar,
      color: 'green' as const,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
    },
    {
      title: 'Travel Agents',
      value: isLoadingStats ? '-' : dashboardStats.totalAgents.toString(),
      change: isLoadingStats ? '-' : `+${dashboardStats.monthlyGrowth.toFixed(1)}%`,
      changeType: 'positive' as const,
      icon: Users,
      color: 'purple' as const,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
    },
    {
      title: 'Revenue',
      value: isLoadingStats ? '-' : `$${dashboardStats.totalRevenue.toLocaleString()}`,
      change: isLoadingStats ? '-' : `+${dashboardStats.monthlyGrowth.toFixed(1)}%`,
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'orange' as const,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
    },
  ];

  const recentBookings = [
    {
      id: 'BK001',
      customer: 'John Doe',
      package: 'Bali Adventure Package',
      date: '2024-01-15',
      amount: '$1,299',
      status: 'confirmed' as const,
      avatar: 'JD',
      priority: 'high' as const,
    },
    {
      id: 'BK002',
      customer: 'Sarah Wilson',
      package: 'Mountain Trek Experience',
      date: '2024-01-14',
      amount: '$899',
      status: 'pending' as const,
      avatar: 'SW',
      priority: 'medium' as const,
    },
    {
      id: 'BK003',
      customer: 'Mike Johnson',
      package: 'Cultural Heritage Tour',
      date: '2024-01-13',
      amount: '$1,599',
      status: 'confirmed' as const,
      avatar: 'MJ',
      priority: 'low' as const,
    },
    {
      id: 'BK004',
      customer: 'Emma Davis',
      package: 'Beach Paradise Retreat',
      date: '2024-01-12',
      amount: '$2,199',
      status: 'confirmed' as const,
      avatar: 'ED',
      priority: 'high' as const,
    },
  ];

  const topPackages = [
    {
      name: 'Bali Adventure Package',
      bookings: 45,
      revenue: '$58,455',
      rating: 4.8,
      views: 234,
      category: 'Adventure',
      icon: Mountain,
      color: 'blue' as const,
    },
    {
      name: 'Mountain Trek Experience',
      bookings: 32,
      revenue: '$28,768',
      rating: 4.6,
      views: 189,
      category: 'Nature',
      icon: Mountain,
      color: 'green' as const,
    },
    {
      name: 'Cultural Heritage Tour',
      bookings: 28,
      revenue: '$44,772',
      rating: 4.9,
      views: 156,
      category: 'Culture',
      icon: Building,
      color: 'purple' as const,
    },
    {
      name: 'Beach Paradise Retreat',
      bookings: 22,
      revenue: '$35,420',
      rating: 4.7,
      views: 198,
      category: 'Relaxation',
      icon: Waves,
      color: 'cyan' as const,
    },
  ];

  const quickActions = [
    {
      title: 'Create Package',
      description: 'Add a new travel package',
      icon: Plus,
      href: '/operator/packages/create',
      color: 'blue' as const,
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Manage Agents',
      description: 'Add or manage travel agents',
      icon: Users,
      href: '/operator/agents',
      color: 'green' as const,
      gradient: 'from-green-500 to-green-600',
    },
    {
      title: 'View Analytics',
      description: 'Check performance metrics',
      icon: BarChart3,
      href: '/operator/analytics',
      color: 'purple' as const,
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Schedule Tour',
      description: 'Plan upcoming tours',
      icon: Calendar,
      href: '/operator/schedule',
      color: 'orange' as const,
      gradient: 'from-orange-500 to-orange-600',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'booking',
      title: 'New booking received',
      description: 'John Doe booked Bali Adventure Package',
      time: '2 minutes ago',
      icon: Calendar,
      color: 'green' as const,
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment confirmed',
      description: '$2,499 received for Mountain Trek Package',
      time: '1 hour ago',
      icon: CheckCircle,
      color: 'blue' as const,
    },
    {
      id: 3,
      type: 'inquiry',
      title: 'Agent inquiry',
      description: 'Sarah Wilson requested Europe Tour info',
      time: '3 hours ago',
      icon: MessageSquare,
      color: 'purple' as const,
    },
    {
      id: 4,
      type: 'update',
      title: 'Package approved',
      description: 'Summer Beach Package has been approved',
      time: '1 day ago',
      icon: CheckCircle,
      color: 'green' as const,
    },
  ];

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
                Welcome back, {state.user?.profile?.firstName || state.user?.name || 'User'}!
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Here's what's happening with your business today</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              icon={stat.icon}
              color={stat.color}
              gradient={stat.gradient}
              bgGradient={stat.bgGradient}
              index={index}
            />
          ))}
        </div>

        {/* Enhanced Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <RecentBookings
            bookings={recentBookings}
            viewAllLink="/operator/bookings"
          />

          {/* Activity Feed */}
          <ActivityFeed
            activities={recentActivity}
          />
        </div>

        {/* Top Packages */}
        <TopPackages
          packages={topPackages}
          viewAllLink="/operator/packages"
        />

        {/* Enhanced Quick Actions */}
        <QuickActions
          actions={quickActions}
        />
      </div>
    </div>
  );
}

export default function OperatorDashboardPage() {
  console.log('📄 OperatorDashboardPage wrapper loaded');
  
  return (
    <ProtectedRoute requiredRoles={OPERATOR_ROLES}>
      <OperatorDashboard />
    </ProtectedRoute>
  );
}