'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/lib/types';
import { useImprovedAuth } from '@/context/ImprovedAuthContext';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Clock,
  Star,
  Eye,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { agentService } from '@/lib/services/agentService';
import { cn } from '@/lib/utils';

// Define roles outside component to prevent re-creation on every render
const AGENT_ROLES = [UserRole.TRAVEL_AGENT];

interface MarketplaceLead {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  destination: string;
  budget: number;
  tripType: string;
  travelers: number;
  duration: number;
  preferredStartDate: Date;
  preferredEndDate: Date;
  preferences: string[];
  specialRequirements: string[];
  leadPrice: number;
  commissionRate: number;
  notes: string;
  estimatedValue: number;
  probabilityOfBooking: number;
  status: string;
  createdAt: Date;
  expiresAt: Date;
}

function LeadsMarketplacePage() {
  const { state } = useImprovedAuth();
  const [leads, setLeads] = React.useState<MarketplaceLead[]>([]);
  const [filteredLeads, setFilteredLeads] = React.useState<MarketplaceLead[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedTripType, setSelectedTripType] = React.useState<string>('all');
  const [selectedBudget, setSelectedBudget] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<string>('newest');

  React.useEffect(() => {
    loadMarketplaceLeads();
  }, []);

  React.useEffect(() => {
    filterAndSortLeads();
  }, [leads, searchTerm, selectedTripType, selectedBudget, sortBy]);

  const loadMarketplaceLeads = async () => {
    try {
      setIsLoading(true);
      
      const response = await agentService.getMarketplaceLeads({
        destination: searchTerm,
        tripType: selectedTripType !== 'all' ? selectedTripType : undefined,
        minBudget: selectedBudget === 'low' ? 0 : selectedBudget === 'medium' ? 2000 : selectedBudget === 'high' ? 5000 : undefined,
        maxBudget: selectedBudget === 'low' ? 2000 : selectedBudget === 'medium' ? 5000 : undefined
      });
      
      if (response.success) {
        const transformedLeads: MarketplaceLead[] = response.data.map(lead => ({
          id: lead.id,
          customerName: lead.customer_name,
          customerEmail: lead.customer_email,
          customerPhone: lead.customer_phone,
          destination: lead.destination,
          budget: lead.budget,
          tripType: lead.trip_type,
          travelers: lead.travelers,
          duration: lead.duration,
          preferredStartDate: new Date(lead.preferred_start_date),
          preferredEndDate: new Date(lead.preferred_end_date),
          preferences: lead.preferences || [],
          specialRequirements: lead.special_requirements || [],
          leadPrice: lead.lead_price,
          commissionRate: lead.commission_rate,
          notes: lead.notes,
          estimatedValue: lead.estimated_value,
          probabilityOfBooking: lead.probability_of_booking,
          status: lead.status,
          createdAt: new Date(lead.created_at),
          expiresAt: new Date(lead.expires_at)
        }));
        
        setLeads(transformedLeads);
      } else {
        console.error('Error loading marketplace leads:', response.error);
      }
    } catch (error) {
      console.error('Error loading marketplace leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortLeads = () => {
    let filtered = [...leads];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.notes.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Trip type filter
    if (selectedTripType !== 'all') {
      filtered = filtered.filter(lead => lead.tripType === selectedTripType);
    }

    // Budget filter
    if (selectedBudget !== 'all') {
      switch (selectedBudget) {
        case 'low':
          filtered = filtered.filter(lead => lead.budget < 2000);
          break;
        case 'medium':
          filtered = filtered.filter(lead => lead.budget >= 2000 && lead.budget < 5000);
          break;
        case 'high':
          filtered = filtered.filter(lead => lead.budget >= 5000);
          break;
      }
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => a.leadPrice - b.leadPrice);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.leadPrice - a.leadPrice);
        break;
      case 'budget-high':
        filtered.sort((a, b) => b.budget - a.budget);
        break;
      case 'probability':
        filtered.sort((a, b) => b.probabilityOfBooking - a.probabilityOfBooking);
        break;
    }

    setFilteredLeads(filtered);
  };

  const handlePurchaseLead = async (leadId: string) => {
    try {
      if (!state.user?.id) {
        alert('Please log in to purchase leads');
        return;
      }
      
      const response = await agentService.purchaseLead(leadId, state.user.id);
      
      if (response.success) {
        // Update the lead status to purchased
        setLeads(prev => prev.map(lead => 
          lead.id === leadId ? { ...lead, status: 'PURCHASED' } : lead
        ));
        alert('Lead purchased successfully! You can now view it in "My Leads".');
      } else {
        throw new Error(response.error || 'Failed to purchase lead');
      }
    } catch (error) {
      console.error('Error purchasing lead:', error);
      alert('Failed to purchase lead. Please try again.');
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

  const getTripTypeColor = (tripType: string) => {
    switch (tripType) {
      case 'ADVENTURE': return 'bg-green-100 text-green-800';
      case 'CULTURAL': return 'bg-purple-100 text-purple-800';
      case 'BEACH': return 'bg-blue-100 text-blue-800';
      case 'CITY_BREAK': return 'bg-gray-100 text-gray-800';
      case 'LUXURY': return 'bg-yellow-100 text-yellow-800';
      case 'BUDGET': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getDaysUntilExpiry = (expiresAt: Date) => {
    const now = new Date();
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center backdrop-blur-sm"
                style={{
                  boxShadow: '0 8px 25px rgba(34,197,94,0.3), inset 0 2px 4px rgba(255,255,255,0.7)'
                }}>
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Leads Marketplace</h1>
                  <p className="text-gray-600 mt-1">Browse and purchase quality leads from our marketplace</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Available Leads</p>
                  <p className="text-2xl font-bold text-green-600">{filteredLeads.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Filters and Search */}
        <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-6 mb-8"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search leads by name, destination, or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 backdrop-blur-sm border border-white/40"
                />
              </div>
            </div>
            
            <Select value={selectedTripType} onValueChange={setSelectedTripType}>
              <SelectTrigger className="backdrop-blur-sm border border-white/40">
                <SelectValue placeholder="Trip Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trip Types</SelectItem>
                <SelectItem value="ADVENTURE">Adventure</SelectItem>
                <SelectItem value="CULTURAL">Cultural</SelectItem>
                <SelectItem value="BEACH">Beach</SelectItem>
                <SelectItem value="CITY_BREAK">City Break</SelectItem>
                <SelectItem value="LUXURY">Luxury</SelectItem>
                <SelectItem value="BUDGET">Budget</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedBudget} onValueChange={setSelectedBudget}>
              <SelectTrigger className="backdrop-blur-sm border border-white/40">
                <SelectValue placeholder="Budget Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Budgets</SelectItem>
                <SelectItem value="low">Under $2,000</SelectItem>
                <SelectItem value="medium">$2,000 - $5,000</SelectItem>
                <SelectItem value="high">Over $5,000</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="backdrop-blur-sm border border-white/40">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="budget-high">Highest Budget</SelectItem>
                <SelectItem value="probability">Highest Probability</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading marketplace leads...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or check back later for new leads</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredLeads.map((lead) => (
              <div key={lead.id} className="backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:shadow-xl transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold backdrop-blur-sm">
                      {lead.customerName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{lead.customerName}</h3>
                      <p className="text-sm text-gray-500">{lead.customerEmail}</p>
                    </div>
                  </div>
                  <Badge className={getTripTypeColor(lead.tripType)}>
                    {getTripTypeIcon(lead.tripType)} {lead.tripType}
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{lead.destination}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span>${lead.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{lead.travelers} travelers</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{lead.duration} days</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <span className={cn('font-semibold', getProbabilityColor(lead.probabilityOfBooking))}>
                        {lead.probabilityOfBooking}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="backdrop-blur-sm bg-white/20 rounded-xl p-3 border border-white/30">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Lead Price:</span>
                      <span className="font-semibold text-green-600">${lead.leadPrice}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-gray-600">Commission:</span>
                      <span className="font-semibold text-blue-600">{lead.commissionRate}%</span>
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
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Expires in {getDaysUntilExpiry(lead.expiresAt)} days</span>
                    </div>
                    <span>Posted {formatDate(lead.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="backdrop-blur-sm border border-white/40"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      onClick={() => handlePurchaseLead(lead.id)}
                      disabled={lead.status === 'PURCHASED'}
                    >
                      {lead.status === 'PURCHASED' ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Purchased
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-4 w-4 mr-1" />
                          Purchase Lead
                        </>
                      )}
                    </Button>
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

export default function LeadsMarketplacePageWrapper() {
  return (
    <ProtectedRoute requiredRoles={AGENT_ROLES}>
      <LeadsMarketplacePage />
    </ProtectedRoute>
  );
}
