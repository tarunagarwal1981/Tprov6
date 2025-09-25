'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/lib/types';
import { useImprovedAuth } from '@/context/ImprovedAuthContext';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Phone,
  Mail,
  MessageSquare,
  Eye,
  Edit,
  ShoppingCart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { agentService } from '@/lib/services/agentService';
import { Lead } from '@/lib/types/agent';
import Link from 'next/link';

// Define roles outside component to prevent re-creation on every render
const AGENT_ROLES = [UserRole.TRAVEL_AGENT];

function LeadsPage() {
  const { state } = useImprovedAuth();
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setIsLoading(true);
      
      const response = await agentService.getPurchasedLeads(state.user?.id || 'agent-001');
      
      if (response.success) {
        const transformedLeads: Lead[] = response.data.map(purchasedLead => {
          const leadData = purchasedLead.lead;
          return {
            id: purchasedLead.id,
            customerName: leadData.customer_name,
            email: leadData.customer_email,
            phone: leadData.customer_phone,
            destination: leadData.destination,
            budget: leadData.budget,
            tripType: leadData.trip_type,
            travelers: leadData.travelers,
            duration: leadData.duration,
            preferredDates: {
              start: new Date(leadData.preferred_start_date),
              end: new Date(leadData.preferred_end_date)
            },
            preferences: leadData.preferences || [],
            status: purchasedLead.status,
            source: 'MARKETPLACE',
            createdAt: new Date(purchasedLead.purchase_date),
            updatedAt: new Date(purchasedLead.updated_at),
            agentId: purchasedLead.agent_id,
            notes: leadData.notes,
            communicationLog: []
          };
        });
        
        setLeads(transformedLeads);
      } else {
        console.error('Error loading purchased leads:', response.error);
      }
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-100 relative overflow-hidden">
      {/* Bright animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/40 to-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-br from-indigo-500/30 to-pink-500/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-emerald-400/25 to-cyan-500/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-yellow-300/20 to-orange-400/25 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-gradient-to-br from-violet-400/15 to-fuchsia-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>
      
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
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center backdrop-blur-sm"
                style={{
                  boxShadow: '0 8px 25px rgba(59,130,246,0.3), inset 0 2px 4px rgba(255,255,255,0.7)'
                }}>
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Leads</h1>
                  <p className="text-gray-600 mt-1">Manage your purchased leads and create itineraries</p>
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
                <Link href="/agent/leads-marketplace">
                  <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  style={{
                    boxShadow: '0 8px 32px rgba(34,197,94,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                  }}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Browse Marketplace
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
            <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No purchased leads yet</h3>
            <p className="text-gray-600 mb-6">Start by browsing the leads marketplace to find quality leads</p>
            <Link href="/agent/leads-marketplace">
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Browse Leads Marketplace
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {leads.map((lead) => (
              <div key={lead.id} className="backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:shadow-xl transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold backdrop-blur-sm">
                      {lead.customerName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{lead.customerName}</h3>
                      <p className="text-sm text-gray-500">{lead.email}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(lead.status)}>
                    {lead.status}
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getTripTypeIcon(lead.tripType)}</span>
                    <div>
                      <p className="font-medium text-gray-900">{lead.destination}</p>
                      <p className="text-sm text-gray-500">{lead.tripType} • {lead.travelers} travelers</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span>${lead.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{lead.duration} days</span>
                    </div>
                  </div>
                  
                  {lead.preferences.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Preferences:</p>
                      <div className="flex flex-wrap gap-1">
                        {lead.preferences.slice(0, 3).map((pref, index) => (
                          <Badge key={index} variant="secondary" className="text-xs backdrop-blur-sm">
                            {pref}
                          </Badge>
                        ))}
                        {lead.preferences.length > 3 && (
                          <Badge variant="secondary" className="text-xs backdrop-blur-sm">
                            +{lead.preferences.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" className="backdrop-blur-sm hover:bg-white/20">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="backdrop-blur-sm hover:bg-white/20">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="backdrop-blur-sm hover:bg-white/20">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="backdrop-blur-sm border border-white/40">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Link href={`/agent/itineraries/create?leadId=${lead.id}`}>
                        <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                          <MapPin className="h-4 w-4 mr-1" />
                          Create Itinerary
                        </Button>
                      </Link>
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

export default function LeadsPageWrapper() {
  return (
    <ProtectedRoute requiredRoles={AGENT_ROLES}>
      <LeadsPage />
    </ProtectedRoute>
  );
}
