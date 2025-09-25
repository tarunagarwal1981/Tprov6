'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/lib/types';
import { useImprovedAuth } from '@/context/ImprovedAuthContext';
import { 
  MapPin, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  DollarSign,
  Clock,
  Eye,
  Edit,
  Send,
  CheckCircle,
  AlertCircle,
  Package,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { agentService } from '@/lib/services/agentService';
import { Itinerary } from '@/lib/types/agent';
import { cn } from '@/lib/utils';

// Define roles outside component to prevent re-creation on every render
const AGENT_ROLES = [UserRole.TRAVEL_AGENT];

function ItinerariesPage() {
  const { state } = useImprovedAuth();
  const [itineraries, setItineraries] = React.useState<Itinerary[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadItineraries();
  }, []);

  const loadItineraries = async () => {
    try {
      setIsLoading(true);
      const response = await agentService.getItineraries(state.user?.id || 'agent-001');
      if (response.success) {
        setItineraries(response.data);
      }
    } catch (error) {
      console.error('Error loading itineraries:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="min-h-screen bg-white relative overflow-hidden">
      
      {/* Enhanced Header */}
      <div className="relative z-10 backdrop-blur-xl border-b border-white/40"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 100%)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.9)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center backdrop-blur-sm"
                style={{
                  boxShadow: '0 8px 25px rgba(147,51,234,0.3), inset 0 2px 4px rgba(255,255,255,0.7)'
                }}>
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Itineraries</h1>
                  <p className="text-gray-600 mt-1">Create and manage travel itineraries for your clients</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" className="backdrop-blur-sm border border-white/40"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 100%)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.4)'
                }}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                style={{
                  boxShadow: '0 8px 32px rgba(147,51,234,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Itinerary
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading itineraries...</p>
          </div>
        ) : itineraries.length === 0 ? (
          <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
            <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No itineraries yet</h3>
            <p className="text-gray-600 mb-6">Start by creating your first travel itinerary</p>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Itinerary
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {itineraries.map((itinerary) => (
              <div key={itinerary.id} className="backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:shadow-xl transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{itinerary.title}</h3>
                  <Badge className={cn('flex items-center space-x-1', getStatusColor(itinerary.status))}>
                    {getStatusIcon(itinerary.status)}
                    <span>{itinerary.status}</span>
                  </Badge>
                </div>
                {itinerary.description && (
                  <p className="text-sm text-gray-600 mb-4">{itinerary.description}</p>
                )}
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span>${itinerary.customerPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{itinerary.days.length} days</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span>{itinerary.packages.length} packages</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{new Date(itinerary.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="backdrop-blur-sm bg-white/20 rounded-xl p-3 border border-white/30">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Commission:</span>
                      <span className="font-semibold text-green-600">${itinerary.agentCommission}</span>
                    </div>
                  </div>
                  
                  {itinerary.notes && (
                    <div className="backdrop-blur-sm bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> {itinerary.notes}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <div className="text-xs text-gray-500">
                      Created {new Date(itinerary.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="backdrop-blur-sm border border-white/40">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="backdrop-blur-sm border border-white/40">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ItinerariesPageWrapper() {
  return (
    <ProtectedRoute requiredRoles={AGENT_ROLES}>
      <ItinerariesPage />
    </ProtectedRoute>
  );
}
