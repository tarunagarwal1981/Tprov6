'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  DollarSign, 
  Calendar,
  Eye,
  Clock,
  ArrowRight,
  Plus,
  Edit,
  Send,
  CheckCircle,
  AlertCircle,
  Users,
  Package
} from 'lucide-react';
import { Itinerary } from '@/lib/types/agent';
import { cn } from '@/lib/utils';

interface RecentItinerariesProps {
  itineraries: Itinerary[];
  viewAllLink?: string;
  className?: string;
}

export function RecentItineraries({ itineraries, viewAllLink, className }: RecentItinerariesProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'SENT': return 'bg-blue-100 text-blue-800';
      case 'REVISED': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'BOOKED': return 'bg-emerald-100 text-emerald-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Edit className="h-4 w-4" />;
      case 'SENT': return <Send className="h-4 w-4" />;
      case 'REVISED': return <AlertCircle className="h-4 w-4" />;
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />;
      case 'BOOKED': return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED': return <AlertCircle className="h-4 w-4" />;
      default: return <Edit className="h-4 w-4" />;
    }
  };

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Recent Itineraries</CardTitle>
        {viewAllLink && (
          <Button variant="ghost" size="sm" asChild>
            <a href={viewAllLink} className="text-blue-600 hover:text-blue-800">
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {itineraries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>No itineraries yet</p>
            <p className="text-sm">Create your first itinerary from a lead</p>
          </div>
        ) : (
          itineraries.map((itinerary, index) => (
            <motion.div
              key={itinerary.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {itinerary.title}
                  </h4>
                  {itinerary.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {itinerary.description}
                    </p>
                  )}
                </div>
                <Badge className={cn('flex items-center space-x-1', getStatusColor(itinerary.status))}>
                  {getStatusIcon(itinerary.status)}
                  <span>{itinerary.status}</span>
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-3 w-3" />
                  <span>${itinerary.customerPrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{itinerary.days.length} days</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Package className="h-3 w-3" />
                  <span>{itinerary.packages.length} packages</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(itinerary.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Users className="h-3 w-3" />
                  <span>Commission: ${itinerary.agentCommission}</span>
                </div>
                <div className="flex space-x-1">
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
        
        {itineraries.length > 0 && (
          <div className="pt-4 border-t">
            <Button className="w-full" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create New Itinerary
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
