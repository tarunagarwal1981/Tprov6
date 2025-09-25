'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, LucideIcon } from 'lucide-react';

interface ActivityItem {
  id: number;
  type: string;
  title: string;
  description: string;
  time: string;
  icon: LucideIcon;
  color: 'green' | 'blue' | 'purple' | 'gray';
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  title?: string;
  description?: string;
  viewAllLink?: string;
  viewAllText?: string;
  delay?: number;
}

export function ActivityFeed({
  activities,
  title = "Activity Feed",
  description = "Recent system activity",
  viewAllLink,
  viewAllText = "View all",
  delay = 0.6
}: ActivityFeedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="backdrop-blur-xl rounded-2xl border border-white/20"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
      }}
    >
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
          {viewAllLink && (
            <Link href={viewAllLink} className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
              {viewAllText} <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          )}
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: delay + 0.1 + index * 0.1 }}
              className="flex items-start space-x-3 p-3 backdrop-blur-sm bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-200"
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                activity.color === 'green' ? 'from-green-500 to-green-600' :
                activity.color === 'blue' ? 'from-blue-500 to-blue-600' :
                activity.color === 'purple' ? 'from-purple-500 to-purple-600' :
                'from-gray-500 to-gray-600'
              } flex items-center justify-center flex-shrink-0`}>
                <activity.icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-2">{activity.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
