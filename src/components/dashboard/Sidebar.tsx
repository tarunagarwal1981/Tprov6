'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  Calendar, 
  Users, 
  BarChart3, 
  MessageSquare, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  disabled?: boolean;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/operator/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'packages',
    label: 'Packages',
    href: '/operator/packages',
    icon: Package,
    badge: 12,
  },
  {
    id: 'bookings',
    label: 'Bookings',
    href: '/operator/bookings',
    icon: Calendar,
    badge: 8,
    disabled: true,
  },
  {
    id: 'agents',
    label: 'Travel Agents',
    href: '/operator/agents',
    icon: Users,
    badge: 24,
    disabled: true,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    href: '/operator/analytics',
    icon: BarChart3,
    disabled: true,
  },
  {
    id: 'communication',
    label: 'Communication',
    href: '/operator/communication',
    icon: MessageSquare,
    badge: 5,
    disabled: true,
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/operator/settings',
    icon: Settings,
    disabled: true,
  },
];

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <motion.aside
      className={cn(
        'backdrop-blur-xl border-r border-white/20 flex flex-col h-full transition-all duration-300 relative overflow-hidden',
        isCollapsed ? 'w-16' : 'w-64'
      )}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
      }}
      initial={false}
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-br from-indigo-400/10 to-pink-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      {/* Logo Section */}
      <div className="flex items-center justify-between p-4 border-b border-white/20 relative z-10">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center backdrop-blur-sm"
              style={{
                boxShadow: '0 4px 16px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">TravelPro</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button
          onClick={onToggle}
          className="p-2 rounded-xl backdrop-blur-sm transition-all duration-200 border border-white/20"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.1)'
          }}
          whileHover={{ 
            scale: 1.05,
            rotateY: 5,
            transition: { duration: 0.2, ease: "easeOut" }
          }}
          whileTap={{ scale: 0.95 }}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </motion.button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 relative z-10">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const isDisabled = item.disabled;
          
          const menuItemContent = (
            <motion.div
              className={cn(
                'flex items-center rounded-xl transition-all duration-200 group relative backdrop-blur-sm border',
                isCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2',
                isDisabled 
                  ? 'border-gray-200/30 text-gray-400 cursor-not-allowed opacity-60'
                  : isActive
                    ? 'border-blue-200/50 text-blue-700'
                    : 'border-white/20 text-gray-700 hover:border-white/30'
              )}
              style={{
                background: isDisabled
                  ? 'linear-gradient(135deg, rgba(156,163,175,0.1) 0%, rgba(156,163,175,0.05) 100%)'
                  : isActive 
                    ? 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(147,51,234,0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                boxShadow: isDisabled
                  ? '0 2px 8px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.05)'
                  : isActive 
                    ? '0 8px 32px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                    : '0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.1)'
              }}
              whileHover={!isDisabled ? { 
                scale: 1.03,
                y: -2,
                rotateX: 2,
                transition: { duration: 0.2, ease: "easeOut" }
              } : {}}
              whileTap={!isDisabled ? { scale: 0.98 } : {}}
            >
              <Icon className={cn(
                'transition-colors duration-200',
                isCollapsed ? 'w-6 h-6' : 'w-5 h-5',
                isDisabled 
                  ? 'text-gray-400' 
                  : isActive 
                    ? 'text-blue-600' 
                    : 'text-gray-500 group-hover:text-gray-700'
              )} />
              
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between flex-1 ml-3"
                  >
                    <span className={cn(
                      'text-sm font-medium',
                      isDisabled ? 'text-gray-400' : ''
                    )}>
                      {item.label}
                      {isDisabled && (
                        <span className="ml-2 text-xs text-gray-400">(Coming Soon)</span>
                      )}
                    </span>
                    {item.badge && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={cn(
                          'backdrop-blur-sm text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center border',
                          isDisabled 
                            ? 'border-gray-300/30 bg-gradient-to-r from-gray-400 to-gray-500'
                            : 'border-red-200/30'
                        )}
                        style={!isDisabled ? {
                          background: 'linear-gradient(135deg, rgba(239,68,68,0.8) 0%, rgba(220,38,38,0.8) 100%)',
                          boxShadow: '0 4px 16px rgba(239,68,68,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                        } : {}}
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 backdrop-blur-xl text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 border border-white/20"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}>
                  {item.label}
                  {isDisabled && ' (Coming Soon)'}
                  {item.badge && ` (${item.badge})`}
                </div>
              )}
            </motion.div>
          );

          return isDisabled ? (
            <div key={item.id} className="cursor-not-allowed">
              {menuItemContent}
            </div>
          ) : (
            <Link key={item.id} href={item.href}>
              {menuItemContent}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/20 relative z-10">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center space-x-3 p-3 rounded-xl backdrop-blur-sm border border-white/20"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.1)'
              }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center backdrop-blur-sm"
              style={{
                boxShadow: '0 4px 16px rgba(34,197,94,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
                <span className="text-white text-sm font-medium">TO</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Tour Operator</p>
                <p className="text-xs text-gray-500 truncate">Active</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {isCollapsed && (
          <div className="flex justify-center">
            <motion.div 
              className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center backdrop-blur-sm"
              style={{
                boxShadow: '0 4px 16px rgba(34,197,94,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}
              whileHover={{ 
                scale: 1.1,
                rotateY: 10,
                transition: { duration: 0.2, ease: "easeOut" }
              }}
            >
              <span className="text-white text-sm font-medium">TO</span>
            </motion.div>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
