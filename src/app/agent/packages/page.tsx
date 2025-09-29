'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/lib/types';
import { useImprovedAuth } from '@/context/ImprovedAuthContext';
import { 
  Package, 
  Search, 
  Filter, 
  Star,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Eye,
  Plus,
  Heart,
  Share2,
  TrendingUp,
  Car,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { agentService } from '@/lib/services/agentService';
import { PackageWithStats } from '@/lib/types/agent';
import { VehicleConfig } from '@/lib/types';

// Define roles outside component to prevent re-creation on every render
const AGENT_ROLES = [UserRole.TRAVEL_AGENT];

function PackagesPage() {
  const { state } = useImprovedAuth();
  const [packages, setPackages] = React.useState<PackageWithStats[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [expandedPackages, setExpandedPackages] = React.useState<Set<string>>(new Set());
  const [selectedVehicles, setSelectedVehicles] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setIsLoading(true);
      const response = await agentService.searchPackages({});
      if (response.success) {
        setPackages(response.data);
      }
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPackages = packages.filter(pkg => 
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.operatorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePackageExpansion = (packageId: string) => {
    const newExpanded = new Set(expandedPackages);
    if (newExpanded.has(packageId)) {
      newExpanded.delete(packageId);
    } else {
      newExpanded.add(packageId);
    }
    setExpandedPackages(newExpanded);
  };

  const handleVehicleSelection = (packageId: string, vehicleId: string) => {
    setSelectedVehicles(prev => ({
      ...prev,
      [packageId]: vehicleId
    }));
  };

  const getSelectedVehicle = (packageId: string, vehicleConfigs: VehicleConfig[]) => {
    const selectedId = selectedVehicles[packageId];
    return vehicleConfigs.find(v => v.id === selectedId) || vehicleConfigs[0];
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
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center backdrop-blur-sm"
                style={{
                  boxShadow: '0 8px 25px rgba(34,197,94,0.3), inset 0 2px 4px rgba(255,255,255,0.7)'
                }}>
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Browse Packages</h1>
                  <p className="text-gray-600 mt-1">Discover packages from tour operators worldwide</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" className="backdrop-blur-sm border border-white/40"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 100%)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.4)'
                }}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="relative z-10 backdrop-blur-xl border-b border-white/40"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 100%)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search packages, destinations, or operators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 backdrop-blur-sm border border-white/40 rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 100%)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.4)'
                  }}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="px-3 py-1 backdrop-blur-sm border border-white/40"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 100%)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.4)'
              }}>
                {filteredPackages.length} packages found
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading packages...</p>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'No packages available at the moment'}
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm('')} className="backdrop-blur-sm border border-white/40">
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => (
              <div key={pkg.id} className="backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:shadow-xl transition-all duration-300 group"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{pkg.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{pkg.destination}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                      <Users className="h-4 w-4" />
                      <span>{pkg.operatorName}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{pkg.rating}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-900">
                      ${pkg.price.toLocaleString()}
                    </div>
                    <Badge variant={pkg.availability ? "default" : "secondary"} className="backdrop-blur-sm">
                      {pkg.availability ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{pkg.bookings} bookings</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>{pkg.views} views</span>
                    </div>
                  </div>
                  
                  {/* Vehicle Options for Transfer Packages */}
                  {pkg.type === 'TRANSFERS' && (pkg as any).vehicleConfigs && (pkg as any).vehicleConfigs.length > 0 && (
                    <div className="pt-4 border-t border-white/20">
                      <button
                        onClick={() => togglePackageExpansion(pkg.id)}
                        className="flex items-center justify-between w-full p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <Car className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">
                            Vehicle Options ({(pkg as any).vehicleConfigs.length})
                          </span>
                        </div>
                        {expandedPackages.has(pkg.id) ? (
                          <ChevronUp className="h-4 w-4 text-gray-600" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-600" />
                        )}
                      </button>
                      
                      {expandedPackages.has(pkg.id) && (
                        <div className="mt-3 space-y-2">
                          {(pkg as any).vehicleConfigs.map((vehicle: VehicleConfig) => {
                            const isSelected = selectedVehicles[pkg.id] === vehicle.id;
                            return (
                              <label
                                key={vehicle.id}
                                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                  isSelected 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`vehicle-${pkg.id}`}
                                  value={vehicle.id}
                                  checked={isSelected}
                                  onChange={() => handleVehicleSelection(pkg.id, vehicle.id || '')}
                                  className="text-blue-600"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-medium text-gray-900">{vehicle.name}</h4>
                                      <p className="text-sm text-gray-600">
                                        {vehicle.vehicleType} • {vehicle.minPassengers}-{vehicle.maxPassengers} passengers
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-semibold text-gray-900">₹{vehicle.basePrice}</div>
                                      {vehicle.perKmRate && (
                                        <div className="text-xs text-gray-500">+ ₹{vehicle.perKmRate}/km</div>
                                      )}
                                    </div>
                                  </div>
                                  {vehicle.features.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {vehicle.features.slice(0, 3).map((feature) => (
                                        <Badge key={feature} variant="secondary" className="text-xs">
                                          {feature}
                                        </Badge>
                                      ))}
                                      {vehicle.features.length > 3 && (
                                        <Badge variant="secondary" className="text-xs">
                                          +{vehicle.features.length - 3} more
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" className="backdrop-blur-sm hover:bg-white/20">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="backdrop-blur-sm hover:bg-white/20">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="backdrop-blur-sm border border-white/40">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        disabled={!pkg.availability} 
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {pkg.type === 'TRANSFERS' && (pkg as any).vehicleConfigs?.length > 0 
                          ? `Add (₹${getSelectedVehicle(pkg.id, (pkg as any).vehicleConfigs).basePrice})`
                          : 'Add to Itinerary'
                        }
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Enhanced Load More */}
        {filteredPackages.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" className="backdrop-blur-sm border border-white/40"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 100%)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.4)'
            }}>
              Load More Packages
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PackagesPageWrapper() {
  return (
    <ProtectedRoute requiredRoles={AGENT_ROLES}>
      <PackagesPage />
    </ProtectedRoute>
  );
}
