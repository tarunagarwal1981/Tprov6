'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, LucideIcon } from 'lucide-react';

interface PackageItem {
  name: string;
  bookings: number;
  revenue: string;
  rating: number;
  views: number;
  category: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'cyan' | 'orange' | 'red';
}

interface TopPackagesProps {
  packages: PackageItem[];
  title?: string;
  description?: string;
  viewAllLink?: string;
  viewAllText?: string;
  delay?: number;
}

export function TopPackages({
  packages,
  title = "Top Performing Packages",
  description = "Your best performing travel packages",
  viewAllLink,
  viewAllText = "View all",
  delay = 0.6
}: TopPackagesProps) {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packages.map((pkg, index) => {
            const Icon = pkg.icon;
            return (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: delay + 0.1 + index * 0.1 }}
                className="flex items-center justify-between p-4 backdrop-blur-sm bg-white/20 rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                    pkg.color === 'blue' ? 'from-blue-500 to-blue-600' :
                    pkg.color === 'green' ? 'from-green-500 to-green-600' :
                    pkg.color === 'purple' ? 'from-purple-500 to-purple-600' :
                    pkg.color === 'cyan' ? 'from-cyan-500 to-cyan-600' :
                    pkg.color === 'orange' ? 'from-orange-500 to-orange-600' :
                    'from-red-500 to-red-600'
                  } flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{pkg.name}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {pkg.bookings}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {pkg.views}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {pkg.rating}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{pkg.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{pkg.revenue}</p>
                  <p className="text-sm text-gray-600">revenue</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
