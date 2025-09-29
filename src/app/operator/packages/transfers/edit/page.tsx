'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TransfersPackageForm, TransfersFormData } from '@/components/packages/transfers/TransfersPackageForm';
import { supabase } from '@/lib/supabase';
import { PackageType } from '@/lib/types';

export default function TransfersEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [packageData, setPackageData] = useState<TransfersFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const packageId = searchParams.get('id');

  useEffect(() => {
    const fetchPackage = async () => {
      if (!packageId) {
        setError('No package ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 Fetching transfers package:', packageId);

        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user?.id) {
          throw new Error('Not authenticated');
        }

        const { data: packageRow, error: fetchError } = await supabase
          .from('packages')
          .select('*')
          .eq('id', packageId)
          .eq('type', PackageType.TRANSFERS)
          .maybeSingle();

        if (fetchError) {
          console.error('❌ Database error:', fetchError);
          throw fetchError;
        }

        if (!packageRow) {
          throw new Error('Transfers package not found');
        }

        console.log('📦 Package data loaded:', packageRow);

        // Convert database row to form data
        const formData: TransfersFormData = {
          name: packageRow.title || '',
          title: packageRow.title || '',
          place: packageRow.place || '',
          description: packageRow.description || '',
          from: packageRow.from_location || '',
          to: packageRow.to_location || '',
          transferType: packageRow.transfer_type || 'ONEWAY',
          transferServiceType: packageRow.transfer_service_type || '',
          distanceKm: packageRow.distance_km || 0,
          estimatedDuration: packageRow.estimated_duration || '',
          advanceBookingHours: packageRow.advance_booking_hours || 24,
          vehicleConfigs: packageRow.vehicle_configs || [],
          additionalServices: packageRow.additional_services || [],
          cancellationPolicyText: packageRow.cancellation_policy_text || '',
          termsAndConditions: packageRow.terms_and_conditions || [],
          inclusions: packageRow.inclusions || [],
          exclusions: packageRow.exclusions || [],
        };

        setPackageData(formData);
        console.log('✅ Form data prepared:', formData);
      } catch (err: any) {
        console.error('💥 Error fetching package:', err);
        setError(err?.message || 'Failed to load package');
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [packageId]);

  const handleSave = async () => {
    if (!packageData || !packageId) return;

    try {
      setSaving(true);
      console.log('💾 Saving transfers package updates:', packageData);
      console.log('🔍 Package type:', PackageType.TRANSFERS);
      console.log('🔍 Package data keys:', Object.keys(packageData));

      const updateData = {
        title: packageData.title || packageData.name || '',
        description: packageData.description || '',
        place: packageData.place || null,
        from_location: packageData.from || null,
        to_location: packageData.to || null,
        transfer_service_type: packageData.transferServiceType || null,
        distance_km: packageData.distanceKm || null,
        estimated_duration: packageData.estimatedDuration || null,
        advance_booking_hours: packageData.advanceBookingHours || null,
        vehicle_configs: packageData.vehicleConfigs && packageData.vehicleConfigs.length > 0 ?
          JSON.stringify(packageData.vehicleConfigs) : null,
        additional_services: packageData.additionalServices && packageData.additionalServices.length > 0 ?
          JSON.stringify(packageData.additionalServices) : null,
        cancellation_policy_text: packageData.cancellationPolicyText || null,
        terms_and_conditions: packageData.termsAndConditions && packageData.termsAndConditions.length > 0 ?
          JSON.stringify(packageData.termsAndConditions) : null,
        inclusions: packageData.inclusions && packageData.inclusions.length > 0 ?
          JSON.stringify(packageData.inclusions) : null,
        exclusions: packageData.exclusions && packageData.exclusions.length > 0 ?
          JSON.stringify(packageData.exclusions) : null,
        updated_at: new Date().toISOString()
      };

      console.log('🔄 Update payload:', updateData);

      const { error: updateError } = await supabase
        .from('packages')
        .update(updateData)
        .eq('id', packageId);

      if (updateError) {
        console.error('❌ Update error:', updateError);
        console.error('❌ Update error details:', JSON.stringify(updateError, null, 2));
        throw updateError;
      }

      // Upload and save image if provided
      if (packageData.image && packageData.image instanceof File) {
        console.log('📸 Uploading updated package image...');
        const { ImageService } = await import('@/lib/services/imageService');
        const imageResult = await ImageService.uploadAndSavePackageImage(
          packageData.image, 
          packageId, 
          true, // isPrimary
          0 // order
        );
        
        if (!imageResult.success) {
          console.warn('⚠️ Image upload failed, but package was updated:', imageResult.error);
        } else {
          console.log('✅ Package image updated successfully:', imageResult.url);
        }
      }

      console.log('✅ Transfers package updated successfully');
      alert('Transfers package updated successfully!');

      setTimeout(() => {
        router.push(`/operator/packages/view?id=${packageId}`);
      }, 1500);

    } catch (err: any) {
      console.error('💥 Error saving transfers package:', err);
      console.error('💥 Error stack:', err?.stack);
      console.error('💥 Error details:', JSON.stringify(err, null, 2));
      alert(err?.message || 'Failed to save transfers package');
      setError(err?.message || 'Failed to save transfers package');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push(`/operator/packages/view?id=${packageId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transfers package...</p>
        </div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Package Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The transfers package you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push('/operator/packages')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Packages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Transfers Package</h1>
                <p className="text-gray-600">{packageData.title || packageData.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TransfersPackageForm
          data={packageData}
          onChange={(updates) => {
            console.log('🔄 Form data updated:', updates);
            setPackageData(prev => prev ? { ...prev, ...updates } : null);
          }}
          mode="edit"
        />
      </div>
    </div>
  );
}
