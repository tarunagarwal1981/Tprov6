'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  Package, 
  Calendar, 
  BarChart3, 
  MessageSquare, 
  Settings,
  ShoppingCart,
  FileText,
  TrendingUp,
  Bell,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut
} from 'lucide-react';
import { useImprovedAuth } from '@/context/ImprovedAuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/agent/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'leads-marketplace',
    label: 'Leads Marketplace',
    href: '/agent/leads-marketplace',
    icon: ShoppingCart,
    badge: 15,
  },
  {
    id: 'leads',
    label: 'My Leads',
    href: '/agent/leads',
    icon: Users,
    badge: 8,
  },
  {
    id: 'itineraries',
    label: 'Itineraries',
    href: '/agent/itineraries',
    icon: MapPin,
    badge: 12,
  },
  {
    id: 'packages',
    label: 'Browse Packages',
    href: '/agent/packages',
    icon: Package,
  },
  {
    id: 'bookings',
    label: 'Bookings',
    href: '/agent/bookings',
    icon: Calendar,
    badge: 5,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    href: '/agent/analytics',
    icon: BarChart3,
  },
  {
    id: 'communication',
    label: 'Communication',
    href: '/agent/communication',
    icon: MessageSquare,
    badge: 3,
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/agent/settings',
    icon: Settings,
  },
];

export function AgentSidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { state, logout } = useImprovedAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-white border-r border-gray-200 flex flex-col h-full shadow-lg"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Agent Portal</h2>
                <p className="text-xs text-gray-500">Travel Agent Dashboard</p>
              </div>
            </motion.div>
          )}
          
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link key={item.id} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className={cn(
                  'w-5 h-5 flex-shrink-0',
                  isActive ? 'text-white' : 'text-gray-500'
                )} />
                
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex-1 flex items-center justify-between"
                  >
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-blue-100 text-blue-800'
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </motion.div>
                )}
                
                {isCollapsed && item.badge && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                    {item.badge}
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            {/* User Info */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {state.user?.profile?.firstName || state.user?.name || 'Agent'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {state.user?.role || 'Travel Agent'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
