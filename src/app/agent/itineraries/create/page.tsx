'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/lib/types';
import { useImprovedAuth } from '@/context/ImprovedAuthContext';
import { useSearchParams } from 'next/navigation';
import { 
  MapPin, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  DollarSign,
  Clock,
  Users,
  Package,
  Star,
  Eye,
  Trash2,
  Save,
  Send,
  Mail,
  MessageSquare,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { agentService } from '@/lib/services/agentService';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Define roles outside component to prevent re-creation on every render
const AGENT_ROLES = [UserRole.TRAVEL_AGENT];

interface Package {
  id: string;
  title: string;
  description: string;
  type: string;
  pricing: any;
  destinations: string[];
  duration: any;
  operatorName: string;
  operatorId: string;
  rating: number;
  reviewCount: number;
  images: string[];
  inclusions: string[];
  exclusions: string[];
  status: string;
}

interface ItineraryDay {
  id: string;
  dayNumber: number;
  date: Date;
  location: string;
  activities: ItineraryActivity[];
  accommodation?: string;
  meals: string[];
  transportation?: string;
  notes?: string;
}

interface ItineraryActivity {
  id: string;
  name: string;
  description: string;
  duration: number;
  cost: number;
  type: 'PACKAGE' | 'CUSTOM';
  packageId?: string;
  timeSlot: string;
  location: string;
}

function CreateItineraryPage() {
  const { state } = useImprovedAuth();
  const searchParams = useSearchParams();
  const leadId = searchParams.get('leadId');
  
  const [lead, setLead] = React.useState<any>(null);
  const [packages, setPackages] = React.useState<Package[]>([]);
  const [filteredPackages, setFilteredPackages] = React.useState<Package[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  
  // Itinerary state
  const [itineraryTitle, setItineraryTitle] = React.useState('');
  const [itineraryDescription, setItineraryDescription] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [days, setDays] = React.useState<ItineraryDay[]>([]);
  const [selectedPackages, setSelectedPackages] = React.useState<Package[]>([]);
  
  // Search and filters
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedType, setSelectedType] = React.useState<string>('all');
  const [selectedDestination, setSelectedDestination] = React.useState<string>('all');

  React.useEffect(() => {
    if (leadId) {
      loadLeadAndPackages();
    }
  }, [leadId]);

  React.useEffect(() => {
    filterPackages();
  }, [packages, searchTerm, selectedType, selectedDestination]);

  const loadLeadAndPackages = async () => {
    try {
      setIsLoading(true);
      
      // Get purchased lead data
      const purchasedLeadsResponse = await agentService.getPurchasedLeads(state.user?.id || 'agent-001');
      if (purchasedLeadsResponse.success && purchasedLeadsResponse.data.length > 0) {
        const purchasedLead = purchasedLeadsResponse.data.find(pl => pl.lead.id === leadId);
        if (purchasedLead) {
          const leadData = purchasedLead.lead;
          setLead({
            id: leadData.id,
            customerName: leadData.customer_name,
            email: leadData.customer_email,
            destination: leadData.destination,
            budget: leadData.budget,
            tripType: leadData.trip_type,
            travelers: leadData.travelers,
            duration: leadData.duration,
            preferences: leadData.preferences || [],
            specialRequirements: leadData.special_requirements || []
          });
          
          // Initialize itinerary with lead data
          setItineraryTitle(`${leadData.customer_name} - ${leadData.destination} Itinerary`);
          setItineraryDescription(`Custom itinerary for ${leadData.customer_name}'s ${leadData.trip_type.toLowerCase()} trip to ${leadData.destination}`);
          
          // Create initial days based on duration
          const initialDays: ItineraryDay[] = [];
          for (let i = 1; i <= leadData.duration; i++) {
            initialDays.push({
              id: `day-${i}`,
              dayNumber: i,
              date: new Date(),
              location: leadData.destination,
              activities: [],
              meals: [],
              notes: ''
            });
          }
          setDays(initialDays);
        }
      }
      
      // Get packages for the destination
      const packagesResponse = await agentService.getPackagesForItinerary({
        destination: lead?.destination || 'Bali'
      });
      
      if (packagesResponse.success) {
        const transformedPackages: Package[] = packagesResponse.data.map(pkg => ({
          id: pkg.id,
          title: pkg.title,
          description: pkg.description,
          type: pkg.type,
          pricing: pkg.pricing,
          destinations: pkg.destinations,
          duration: pkg.duration,
          operatorName: pkg.operatorName,
          operatorId: pkg.operatorId,
          rating: pkg.rating,
          reviewCount: pkg.reviewCount,
          images: pkg.images,
          inclusions: pkg.inclusions,
          exclusions: pkg.exclusions,
          status: pkg.status
        }));
        setPackages(transformedPackages);
      }
      
    } catch (error) {
      console.error('Error loading lead and packages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPackages = () => {
    let filtered = [...packages];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(pkg =>
        pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.destinations.some(dest => dest.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(pkg => pkg.type === selectedType);
    }

    // Destination filter
    if (selectedDestination !== 'all') {
      filtered = filtered.filter(pkg => 
        pkg.destinations.some(dest => dest.toLowerCase().includes(selectedDestination.toLowerCase()))
      );
    }

    setFilteredPackages(filtered);
  };

  const addPackageToItinerary = (pkg: Package) => {
    if (!selectedPackages.find(sp => sp.id === pkg.id)) {
      setSelectedPackages([...selectedPackages, pkg]);
    }
  };

  const removePackageFromItinerary = (packageId: string) => {
    setSelectedPackages(selectedPackages.filter(pkg => pkg.id !== packageId));
  };

  const addActivityToDay = (dayId: string, packageId: string) => {
    const pkg = selectedPackages.find(p => p.id === packageId);
    if (!pkg) return;

    const newActivity: ItineraryActivity = {
      id: `activity-${Date.now()}`,
      name: pkg.title,
      description: pkg.description,
      duration: pkg.duration.days * 8, // Assume 8 hours per day
      cost: pkg.pricing.adult,
      type: 'PACKAGE',
      packageId: pkg.id,
      timeSlot: '09:00 - 17:00',
      location: pkg.destinations[0]
    };

    setDays(days.map(day => 
      day.id === dayId 
        ? { ...day, activities: [...day.activities, newActivity] }
        : day
    ));
  };

  const removeActivityFromDay = (dayId: string, activityId: string) => {
    setDays(days.map(day => 
      day.id === dayId 
        ? { ...day, activities: day.activities.filter(activity => activity.id !== activityId) }
        : day
    ));
  };

  const calculateTotalCost = () => {
    let total = 0;
    days.forEach(day => {
      day.activities.forEach(activity => {
        total += activity.cost;
      });
    });
    return total;
  };

  const calculateCommission = () => {
    const totalCost = calculateTotalCost();
    return totalCost * 0.1; // 10% commission
  };

  const handleSaveItinerary = async () => {
    try {
      setIsSaving(true);
      
      if (!leadId || !state.user?.id) {
        throw new Error('Missing lead ID or user ID');
      }
      
      const itineraryData = {
        leadId: leadId,
        agentId: state.user.id,
        title: itineraryTitle,
        description: itineraryDescription,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days: days,
        selectedPackages: selectedPackages,
        totalCost: calculateTotalCost(),
        agentCommission: calculateCommission(),
        customerPrice: calculateTotalCost() + calculateCommission()
      };
      
      const response = await agentService.createItinerary(itineraryData);
      
      if (response.success) {
        // Redirect to itineraries page
        window.location.href = '/agent/itineraries';
      } else {
        throw new Error(response.error || 'Failed to save itinerary');
      }
      
    } catch (error) {
      console.error('Error saving itinerary:', error);
      alert('Failed to save itinerary. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendItinerary = async (method: 'email' | 'whatsapp') => {
    try {
      // First save the itinerary if it hasn't been saved yet
      if (!itineraryTitle || !startDate || !endDate) {
        alert('Please complete the itinerary details before sending.');
        return;
      }
      
      // Save the itinerary first
      await handleSaveItinerary();
      
      // Then send it
      const response = await agentService.sendItinerary('temp-id', method);
      
      if (response.success) {
        alert(`Itinerary sent via ${method} successfully!`);
      } else {
        throw new Error(response.error || `Failed to send itinerary via ${method}`);
      }
      
    } catch (error) {
      console.error(`Error sending itinerary via ${method}:`, error);
      alert(`Failed to send itinerary via ${method}. Please try again.`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lead and packages...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Lead not found</h3>
          <p className="text-gray-600 mb-6">The lead you're looking for doesn't exist or has been removed.</p>
          <Link href="/agent/leads">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Leads
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
                <Link href="/agent/leads">
                  <Button variant="outline" size="sm" className="backdrop-blur-sm border border-white/40">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Leads
                  </Button>
                </Link>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center backdrop-blur-sm"
                style={{
                  boxShadow: '0 8px 25px rgba(147,51,234,0.3), inset 0 2px 4px rgba(255,255,255,0.7)'
                }}>
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Create Itinerary</h1>
                  <p className="text-gray-600 mt-1">Build a custom itinerary for {lead.customerName}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="backdrop-blur-sm border border-white/40"
                  onClick={() => handleSendItinerary('email')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="backdrop-blur-sm border border-white/40"
                  onClick={() => handleSendItinerary('whatsapp')}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send WhatsApp
                </Button>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={handleSaveItinerary}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Itinerary
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Itinerary Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Itinerary Information */}
            <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Itinerary Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <Input
                    value={itineraryTitle}
                    onChange={(e) => setItineraryTitle(e.target.value)}
                    className="backdrop-blur-sm border border-white/40"
                    placeholder="Enter itinerary title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <Textarea
                    value={itineraryDescription}
                    onChange={(e) => setItineraryDescription(e.target.value)}
                    className="backdrop-blur-sm border border-white/40"
                    placeholder="Enter itinerary description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="backdrop-blur-sm border border-white/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="backdrop-blur-sm border border-white/40"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Itinerary Days */}
            <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Itinerary Days</h3>
              <div className="space-y-4">
                {days.map((day) => (
                  <div key={day.id} className="backdrop-blur-sm bg-white/20 rounded-xl p-4 border border-white/30">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Day {day.dayNumber}</h4>
                      <Badge variant="secondary" className="backdrop-blur-sm">
                        {day.location}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {day.activities.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-3 bg-white/30 rounded-lg border border-white/40">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{activity.name}</h5>
                            <p className="text-sm text-gray-600">{activity.timeSlot} • {activity.location}</p>
                            <p className="text-sm text-gray-500">${activity.cost}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeActivityFromDay(day.id, activity.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      
                      {day.activities.length === 0 && (
                        <p className="text-sm text-gray-500 italic">No activities added yet</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Package Selection */}
          <div className="space-y-6">
            {/* Lead Information */}
            <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Customer</p>
                  <p className="text-gray-900">{lead.customerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Destination</p>
                  <p className="text-gray-900">{lead.destination}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Budget</p>
                  <p className="text-gray-900">${lead.budget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Travelers</p>
                  <p className="text-gray-900">{lead.travelers} people</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Duration</p>
                  <p className="text-gray-900">{lead.duration} days</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Preferences</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {lead.preferences.map((pref, index) => (
                      <Badge key={index} variant="secondary" className="text-xs backdrop-blur-sm">
                        {pref}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Package Search */}
            <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Packages</h3>
              
              {/* Search and Filters */}
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search packages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 backdrop-blur-sm border border-white/40"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="backdrop-blur-sm border border-white/40">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="LAND_PACKAGE">Land Package</SelectItem>
                      <SelectItem value="ACTIVITY">Activity</SelectItem>
                      <SelectItem value="HOTEL">Hotel</SelectItem>
                      <SelectItem value="TRANSFERS">Transfers</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedDestination} onValueChange={setSelectedDestination}>
                    <SelectTrigger className="backdrop-blur-sm border border-white/40">
                      <SelectValue placeholder="Destination" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Destinations</SelectItem>
                      <SelectItem value="bali">Bali</SelectItem>
                      <SelectItem value="indonesia">Indonesia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Package List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredPackages.map((pkg) => (
                  <div key={pkg.id} className="backdrop-blur-sm bg-white/20 rounded-xl p-4 border border-white/30">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{pkg.title}</h4>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600">{pkg.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{pkg.duration.days} days</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">${pkg.pricing.adult}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs backdrop-blur-sm">
                        {pkg.type}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => addPackageToItinerary(pkg)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Packages */}
            {selectedPackages.length > 0 && (
              <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Packages</h3>
                <div className="space-y-3">
                  {selectedPackages.map((pkg) => (
                    <div key={pkg.id} className="flex items-center justify-between p-3 bg-white/30 rounded-lg border border-white/40">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{pkg.title}</h4>
                        <p className="text-sm text-gray-600">${pkg.pricing.adult}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removePackageFromItinerary(pkg.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cost Summary */}
            <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Package Cost</span>
                  <span className="font-semibold text-gray-900">${calculateTotalCost().toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Agent Commission (10%)</span>
                  <span className="font-semibold text-green-600">${calculateCommission().toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/20">
                  <span className="font-medium text-gray-900">Customer Price</span>
                  <span className="font-bold text-lg text-gray-900">${(calculateTotalCost() + calculateCommission()).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateItineraryPageWrapper() {
  return (
    <ProtectedRoute requiredRoles={AGENT_ROLES}>
      <CreateItineraryPage />
    </ProtectedRoute>
  );
}
