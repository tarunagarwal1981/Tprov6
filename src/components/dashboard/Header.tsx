'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Menu,
  Home,
  Building2
} from 'lucide-react';
import { useImprovedAuth } from '@/context/ImprovedAuthContext';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuToggle: () => void;
  breadcrumbs?: { label: string; href?: string }[];
}

export function Header({ onMenuToggle, breadcrumbs = [] }: HeaderProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { state, signOut } = useImprovedAuth();
  const router = useRouter();

  const handleLogout = () => {
    signOut();
    router.push('/');
  };

  const mockNotifications = [
    {
      id: 1,
      title: 'New Booking Received',
      message: 'John Doe booked your Bali Adventure Package',
      time: '2 minutes ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Payment Confirmed',
      message: 'Payment of $2,499 received for Mountain Trek Package',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Agent Inquiry',
      message: 'Sarah Wilson requested information about your Europe Tour',
      time: '3 hours ago',
      unread: false,
    },
    {
      id: 4,
      title: 'Package Update',
      message: 'Your Summer Beach Package has been approved',
      time: '1 day ago',
      unread: false,
    },
  ];

  const unreadCount = mockNotifications.filter(n => n.unread).length;

  return (
    <header className="backdrop-blur-xl bg-white/90 border-b border-white/40 px-4 py-1 flex items-center justify-between h-12 relative z-50"
    style={{
      boxShadow: '0 15px 40px rgba(0,0,0,0.12), inset 0 2px 4px rgba(255,255,255,0.8)'
    }}>
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 rounded-xl backdrop-blur-sm transition-all duration-200 border border-white/20"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}
          aria-label="Toggle mobile menu"
        >
          <Menu className="w-4 h-4 text-gray-600" />
        </button>

        {/* Breadcrumbs */}
        <nav className="hidden sm:flex items-center space-x-2 text-sm">
          <Link href="/operator/dashboard" className="text-gray-500 hover:text-gray-700">
            <Home className="w-4 h-4" />
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <span className="text-gray-400">/</span>
              {crumb.href ? (
                <Link href={crumb.href} className="text-gray-500 hover:text-gray-700">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search packages, bookings, agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1 border border-white/40 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/70 backdrop-blur-md bg-white/30 hover:bg-white/50 focus:bg-white/60 text-sm"
            style={{
              boxShadow: '0 8px 25px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.4)'
            }}
            aria-label="Search packages, bookings, and agents"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative p-1.5 rounded-xl backdrop-blur-sm transition-all duration-200 border border-white/20 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}
            aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
          >
            <Bell className="w-4 h-4 text-gray-600" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
              >
                {unreadCount}
              </motion.span>
            )}
          </button>

          <AnimatePresence>
            {isNotificationOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-80 backdrop-blur-xl rounded-2xl border border-white/20 z-[70]"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 100%)',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.8)',
                  zIndex: 70
                }}
              >
                <div className="p-4 border-b border-white/20">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-500">{unreadCount} unread notifications</p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {mockNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        'p-4 border-b border-white/10 hover:bg-white/20 transition-colors duration-200',
                        notification.unread && 'bg-blue-50/30'
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={cn(
                          'w-2 h-2 rounded-full mt-2',
                          notification.unread ? 'bg-blue-500' : 'bg-gray-300'
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="p-4 border-t border-white/20">
                  <Link
                    href="/operator/notifications"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View all notifications
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 p-1.5 rounded-xl backdrop-blur-sm transition-all duration-200 border border-white/20 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}
            aria-label="User profile menu"
          >
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center backdrop-blur-sm"
            style={{
              boxShadow: '0 4px 16px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900">
                {state.user?.profile?.firstName} {state.user?.profile?.lastName}
              </p>
              <p className="text-xs text-gray-500">Tour Operator</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-56 backdrop-blur-xl rounded-2xl border border-white/20 z-[70]"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 100%)',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.8)',
                  zIndex: 70
                }}
              >
                <div className="p-4 border-b border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center backdrop-blur-sm"
                    style={{
                      boxShadow: '0 4px 16px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                    }}>
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {state.user?.profile?.firstName} {state.user?.profile?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{state.user?.email}</p>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <Link
                    href="/operator/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-white/20 transition-colors duration-200 rounded-xl"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Profile
                  </Link>
                  <Link
                    href="/operator/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-white/20 transition-colors duration-200 rounded-xl"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50/30 transition-colors duration-200 rounded-xl"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
