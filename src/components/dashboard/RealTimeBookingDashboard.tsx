'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BookingService } from '@/lib/services/bookingService';
import { PackageService } from '@/lib/services/packageService';
import { BookingWithDetails, PackageWithDetails } from '@/lib/supabase-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Users, 
  MapPin, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLoadingState } from '@/hooks';

interface RealTimeBookingDashboardProps {
  userRole: 'ADMIN' | 'TOUR_OPERATOR' | 'TRAVEL_AGENT';
  userId: string;
  className?: string;
}

export function RealTimeBookingDashboard({ 
  userRole, 
  userId, 
  className 
}: RealTimeBookingDashboardProps) {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [packages, setPackages] = useState<PackageWithDetails[]>([]);
  const { isLoading, error, startLoading, stopLoading, setError, clearError } = useLoadingState(10000, true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Load initial data
  useEffect(() => {
    loadData();
  }, [userRole, userId]);

  // Set up real-time subscriptions
  useEffect(() => {
    const subscriptions: any[] = [];

    // Subscribe to booking changes
    const bookingSubscription = supabase
      .channel('bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          console.log('Booking change detected:', payload);
          handleBookingChange(payload);
        }
      )
      .subscribe();

    // Subscribe to package changes
    const packageSubscription = supabase
      .channel('packages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'packages'
        },
        (payload) => {
          console.log('Package change detected:', payload);
          handlePackageChange(payload);
        }
      )
      .subscribe();

    subscriptions.push(bookingSubscription, packageSubscription);

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, []);

  const loadData = async () => {
    try {
      startLoading();
      clearError();

      // Load bookings based on user role
      let bookingsResponse;
      if (userRole === 'ADMIN') {
        bookingsResponse = await BookingService.getBookings({ limit: 50 });
      } else if (userRole === 'TOUR_OPERATOR') {
        // Get packages for this tour operator first
        const packagesResponse = await PackageService.getPackages({ 
          tourOperatorId: userId,
          limit: 100 
        });
        
        if (packagesResponse.data) {
          const packageIds = packagesResponse.data.map(pkg => pkg.id);
          bookingsResponse = await BookingService.getBookings({ 
            packageId: packageIds[0], // This would need to be handled differently for multiple packages
            limit: 50 
          });
        }
      } else if (userRole === 'TRAVEL_AGENT') {
        bookingsResponse = await BookingService.getBookings({ 
          travelAgentId: userId,
          limit: 50 
        });
      }

      if (bookingsResponse?.data) {
        setBookings(bookingsResponse.data);
      }

      // Load packages if tour operator
      if (userRole === 'TOUR_OPERATOR') {
        const packagesResponse = await PackageService.getPackages({ 
          tourOperatorId: userId,
          limit: 20 
        });
        
        if (packagesResponse.data) {
          setPackages(packagesResponse.data);
        }
      }

      setLastUpdated(new Date());
      stopLoading();
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    }
  };

  const handleBookingChange = async (payload: any) => {
    console.log('Handling booking change:', payload);
    
    // Reload bookings to get updated data
    try {
      let bookingsResponse;
      if (userRole === 'ADMIN') {
        bookingsResponse = await BookingService.getBookings({ limit: 50 });
      } else if (userRole === 'TRAVEL_AGENT') {
        bookingsResponse = await BookingService.getBookings({ 
          travelAgentId: userId,
          limit: 50 
        });
      }

      if (bookingsResponse?.data) {
        setBookings(bookingsResponse.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error reloading bookings:', error);
    }
  };

  const handlePackageChange = async (payload: any) => {
    console.log('Handling package change:', payload);
    
    // Reload packages if tour operator
    if (userRole === 'TOUR_OPERATOR') {
      try {
        const packagesResponse = await PackageService.getPackages({ 
          tourOperatorId: userId,
          limit: 20 
        });
        
        if (packagesResponse.data) {
          setPackages(packagesResponse.data);
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error('Error reloading packages:', error);
      }
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { data, error } = await BookingService.updateBooking(bookingId, { status });
      
      if (error) {
        console.error('Error updating booking:', error);
      } else {
        console.log('Booking updated:', data);
        // The real-time subscription will handle updating the UI
      }
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4" />;
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'REFUNDED':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Real-time Dashboard
          </h2>
          <p className="text-gray-600">
            Live updates for bookings and packages
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.status === 'CONFIRMED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.status === 'PENDING').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${bookings.reduce((sum, b) => sum + (b.pricing as any)?.finalAmount || 0, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Recent Bookings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings.slice(0, 10).map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-gray-900">
                      {booking.package?.title || 'Package'}
                    </h3>
                    <Badge className={cn('flex items-center space-x-1', getStatusColor(booking.status))}>
                      {getStatusIcon(booking.status)}
                      <span>{booking.status}</span>
                    </Badge>
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{(booking.travelers as any)?.length || 0} travelers</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{booking.package?.destinations?.[0] || 'Destination'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>${(booking.pricing as any)?.finalAmount || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(booking.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/bookings/${booking.id}`, '_blank')}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  {booking.status === 'PENDING' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                        className="text-red-600 hover:text-red-700"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Package Performance (for Tour Operators) */}
      {userRole === 'TOUR_OPERATOR' && packages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Package Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {packages.slice(0, 5).map((pkg) => (
                <div
                  key={pkg.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{pkg.title}</h3>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>{pkg.review_count} reviews</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>${(pkg.pricing as any)?.basePrice || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{pkg.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={cn(
                      pkg.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    )}>
                      {pkg.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/operator/packages/view?id=${pkg.id}`, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
