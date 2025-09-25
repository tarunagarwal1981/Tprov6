'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, LucideIcon } from 'lucide-react';

interface BookingItem {
  id: string;
  customer: string;
  package: string;
  date: string;
  amount: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  avatar: string;
  priority: 'high' | 'medium' | 'low';
}

interface RecentBookingsProps {
  bookings: BookingItem[];
  title?: string;
  description?: string;
  viewAllLink?: string;
  viewAllText?: string;
  delay?: number;
}

export function RecentBookings({
  bookings,
  title = "Recent Bookings",
  description = "Latest customer bookings and payments",
  viewAllLink,
  viewAllText = "View all",
  delay = 0.4
}: RecentBookingsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="lg:col-span-2 backdrop-blur-xl rounded-2xl border border-white/20"
      style={{
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
          {bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: delay + 0.1 + index * 0.1 }}
              className="flex items-center justify-between p-4 backdrop-blur-sm bg-white/20 rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-sm ${
                  booking.priority === 'high' ? 'bg-red-600' :
                  booking.priority === 'medium' ? 'bg-yellow-600' :
                  'bg-gray-600'
                }`}>
                  {booking.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{booking.customer}</p>
                  <p className="text-sm text-gray-600">{booking.package}</p>
                  <p className="text-xs text-gray-500">{booking.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{booking.amount}</p>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    booking.status === 'confirmed' ? 'bg-green-500' : 
                    booking.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className={`text-sm font-medium ${
                    booking.status === 'confirmed' ? 'text-green-600' : 
                    booking.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
