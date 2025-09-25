'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Users, 
  MapPin, 
  Package, 
  BarChart3, 
  MessageSquare,
  FileText,
  ShoppingCart,
  Calendar,
  TrendingUp,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentQuickActionsProps {
  className?: string;
}

export function AgentQuickActions({ className }: AgentQuickActionsProps) {
  const primaryActions = [
    {
      title: 'Create New Itinerary',
      description: 'Start building an itinerary from a lead',
      icon: MapPin,
      href: '/agent/itineraries/create',
      color: 'bg-gradient-to-r from-blue-500 to-purple-600',
      textColor: 'text-white'
    }
  ];

  const secondaryActions = [
    {
      title: 'Browse Packages',
      description: 'Find packages from tour operators',
      icon: Package,
      href: '/agent/packages',
      color: 'bg-green-50 hover:bg-green-100',
      textColor: 'text-green-700'
    },
    {
      title: 'View Analytics',
      description: 'Track your performance',
      icon: BarChart3,
      href: '/agent/analytics',
      color: 'bg-purple-50 hover:bg-purple-100',
      textColor: 'text-purple-700'
    },
    {
      title: 'Manage Leads',
      description: 'View and update your leads',
      icon: Users,
      href: '/agent/leads',
      color: 'bg-orange-50 hover:bg-orange-100',
      textColor: 'text-orange-700'
    }
  ];

  const additionalActions = [
    {
      title: 'Create Lead',
      description: 'Add a new customer lead',
      icon: Plus,
      href: '/agent/leads/create',
      color: 'bg-gray-50 hover:bg-gray-100',
      textColor: 'text-gray-700'
    },
    {
      title: 'View Bookings',
      description: 'Track confirmed bookings',
      icon: Calendar,
      href: '/agent/bookings',
      color: 'bg-gray-50 hover:bg-gray-100',
      textColor: 'text-gray-700'
    },
    {
      title: 'Messages',
      description: 'Communicate with clients',
      icon: MessageSquare,
      href: '/agent/communication',
      color: 'bg-gray-50 hover:bg-gray-100',
      textColor: 'text-gray-700'
    }
  ];

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Action */}
        {primaryActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              asChild
              className={cn(
                'w-full h-16 text-left justify-start p-4',
                action.color,
                action.textColor,
                'hover:scale-105 transition-all duration-200'
              )}
            >
              <a href={action.href}>
                <div className="flex items-center space-x-3">
                  <action.icon className="h-6 w-6" />
                  <div className="flex-1">
                    <div className="font-semibold">{action.title}</div>
                    <div className="text-sm opacity-90">{action.description}</div>
                  </div>
                  <ArrowRight className="h-5 w-5" />
                </div>
              </a>
            </Button>
          </motion.div>
        ))}

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {secondaryActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index + 1) * 0.1 }}
            >
              <Button
                asChild
                variant="ghost"
                className={cn(
                  'w-full h-12 text-left justify-start p-3',
                  action.color,
                  action.textColor
                )}
              >
                <a href={action.href}>
                  <div className="flex items-center space-x-2">
                    <action.icon className="h-5 w-5" />
                    <div>
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs opacity-75">{action.description}</div>
                    </div>
                  </div>
                </a>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Additional Actions */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-1 gap-2">
            {additionalActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index + 4) * 0.1 }}
              >
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'w-full justify-start',
                    action.color,
                    action.textColor
                  )}
                >
                  <a href={action.href}>
                    <action.icon className="h-4 w-4 mr-2" />
                    {action.title}
                  </a>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="pt-4 border-t bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">Performance Summary</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-gray-500">This Month</div>
              <div className="font-semibold text-green-600">+18.2% Revenue</div>
            </div>
            <div>
              <div className="text-gray-500">Conversion</div>
              <div className="font-semibold text-blue-600">64.3%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
