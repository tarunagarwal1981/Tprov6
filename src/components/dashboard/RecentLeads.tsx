'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Star, 
  Calendar,
  Eye,
  Clock,
  ArrowRight,
  Plus,
  MessageSquare,
  Phone,
  Mail
} from 'lucide-react';
import { Lead } from '@/lib/types/agent';
import { cn } from '@/lib/utils';

interface RecentLeadsProps {
  leads: Lead[];
  viewAllLink?: string;
  className?: string;
}

export function RecentLeads({ leads, viewAllLink, className }: RecentLeadsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800';
      case 'CONTACTED': return 'bg-yellow-100 text-yellow-800';
      case 'QUOTED': return 'bg-purple-100 text-purple-800';
      case 'BOOKED': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTripTypeIcon = (tripType: string) => {
    switch (tripType) {
      case 'ADVENTURE': return '🏔️';
      case 'CULTURAL': return '🏛️';
      case 'BEACH': return '🏖️';
      case 'CITY_BREAK': return '🏙️';
      case 'LUXURY': return '💎';
      case 'BUDGET': return '💰';
      default: return '✈️';
    }
  };

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Recent Leads</CardTitle>
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
        {leads.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>No leads yet</p>
            <p className="text-sm">New leads will appear here</p>
          </div>
        ) : (
          leads.map((lead, index) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {lead.customerName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {lead.customerName}
                    </p>
                    <span className="text-lg">{getTripTypeIcon(lead.tripType)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    <span>{lead.destination}</span>
                    <span>•</span>
                    <span>{lead.travelers} travelers</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                    <DollarSign className="h-3 w-3" />
                    <span>Budget: ${lead.budget.toLocaleString()}</span>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    <span>{lead.duration} days</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                <Badge className={getStatusColor(lead.status)}>
                  {lead.status}
                </Badge>
                <div className="flex space-x-1">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
        
        {leads.length > 0 && (
          <div className="pt-4 border-t">
            <Button className="w-full" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create New Lead
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
