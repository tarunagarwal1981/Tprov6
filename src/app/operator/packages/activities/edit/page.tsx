'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ActivityPackageForm, ActivityFormData } from '@/components/packages/activities/ActivityPackageForm';
import { supabase } from '@/lib/supabase';
import { PackageType } from '@/lib/types';

export default function ActivityEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [packageData, setPackageData] = useState<ActivityFormData | null>(null);
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
        console.log('🔍 Fetching activity package:', packageId);

        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user?.id) {
          throw new Error('Not authenticated');
        }

        const { data: packageRow, error: fetchError } = await supabase
          .from('packages')
          .select('*')
          .eq('id', packageId)
          .eq('type', PackageType.ACTIVITY)
          .maybeSingle();

        if (fetchError) {
          console.error('❌ Database error:', fetchError);
          throw fetchError;
        }

        if (!packageRow) {
          throw new Error('Activity package not found');
        }

        console.log('📦 Package data loaded:', packageRow);

        // Convert database row to form data
        const formData: ActivityFormData = {
          name: packageRow.title || '',
          title: packageRow.title || '',
          place: packageRow.place || '',
          description: packageRow.description || '',
          activityCategory: packageRow.activity_category || '',
          timing: packageRow.timing || '',
          durationHours: packageRow.duration_hours || 0,
          availableDays: packageRow.available_days || [],
          operationalHours: packageRow.operational_hours || { start: '', end: '' },
          meetingPoint: packageRow.meeting_point || '',
          emergencyContact: packageRow.emergency_contact || { name: '', phone: '', email: '' },
          transferOptions: packageRow.transfer_options || [],
          maxCapacity: packageRow.max_capacity || 0,
          languagesSupported: packageRow.languages_supported || [],
          accessibilityInfo: packageRow.accessibility_info || [],
          ageRestrictionsDetailed: packageRow.age_restrictions || {},
          importantInfo: packageRow.important_info || '',
          faq: packageRow.faq || [],
          variants: packageRow.variants || [],
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
      console.log('💾 Saving activity package updates:', packageData);
      console.log('🔍 Package type:', PackageType.ACTIVITY);
      console.log('🔍 Package data keys:', Object.keys(packageData));

      const updateData = {
        title: packageData.title || packageData.name || '',
        description: packageData.description || '',
        place: packageData.place || null,
        activity_category: packageData.activityCategory || null,
        timing: packageData.timing || null,
        duration_hours: packageData.durationHours || null,
        available_days: packageData.availableDays && packageData.availableDays.length > 0 ?
          JSON.stringify(packageData.availableDays) : null,
        operational_hours: packageData.operationalHours ? JSON.stringify(packageData.operationalHours) : null,
        meeting_point: packageData.meetingPoint || null,
        emergency_contact: packageData.emergencyContact ? JSON.stringify(packageData.emergencyContact) : null,
        transfer_options: packageData.transferOptions && packageData.transferOptions.length > 0 ?
          JSON.stringify(packageData.transferOptions) : null,
        max_capacity: packageData.maxCapacity || null,
        languages_supported: packageData.languagesSupported && packageData.languagesSupported.length > 0 ?
          JSON.stringify(packageData.languagesSupported) : null,
        accessibility_info: packageData.accessibilityInfo && packageData.accessibilityInfo.length > 0 ?
          JSON.stringify(packageData.accessibilityInfo) : null,
        age_restrictions: packageData.ageRestrictionsDetailed ? JSON.stringify(packageData.ageRestrictionsDetailed) : null,
        important_info: packageData.importantInfo || null,
        faq: packageData.faq && packageData.faq.length > 0 ? JSON.stringify(packageData.faq) : null,
        variants: packageData.variants && packageData.variants.length > 0 ?
          JSON.stringify(packageData.variants) : null,
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
        console.log('📸 Uploading updated activity package image...');
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
          console.log('✅ Activity package image updated successfully:', imageResult.url);
        }
      }

      console.log('✅ Activity package updated successfully');
      alert('Activity package updated successfully!');

      setTimeout(() => {
        router.push(`/operator/packages/view?id=${packageId}`);
      }, 1500);

    } catch (err: any) {
      console.error('💥 Error saving activity package:', err);
      console.error('💥 Error stack:', err?.stack);
      console.error('💥 Error details:', JSON.stringify(err, null, 2));
      alert(err?.message || 'Failed to save activity package');
      setError(err?.message || 'Failed to save activity package');
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading activity package...</p>
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
          <p className="text-gray-600 mb-4">{error || 'The activity package you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push('/operator/packages')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto"
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
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
                <h1 className="text-2xl font-bold text-gray-900">Edit Activity Package</h1>
                <p className="text-gray-600">{packageData.title || packageData.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
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
        <ActivityPackageForm
          data={packageData}
          onChange={(updates) => {
            console.log('🔄 Activity form data updated:', updates);
            setPackageData(prev => prev ? { ...prev, ...updates } : null);
          }}
          mode="edit"
        />
      </div>
    </div>
  );
}
