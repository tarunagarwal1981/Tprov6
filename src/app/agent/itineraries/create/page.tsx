'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { ItineraryCreationProvider } from '@/context/ItineraryCreationContext';
import ItineraryCreationWizard from '@/components/itinerary/creation/ItineraryCreationWizard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Define roles outside component to prevent re-creation on every render
const AGENT_ROLES = [UserRole.TRAVEL_AGENT];

function CreateItineraryPage() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get('leadId');
  
  if (!leadId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Lead Selected</h3>
          <p className="text-gray-600 mb-6">Please select a lead to create an itinerary.</p>
          <Link href="/agent/leads">
            <Button>Back to Leads</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ItineraryCreationProvider leadId={leadId}>
      <ItineraryCreationWizard 
        leadId={leadId}
        onBack={() => window.history.back()}
        onComplete={(itineraryId) => {
          // Redirect to the created itinerary or back to leads
          window.location.href = '/agent/itineraries';
        }}
      />
    </ItineraryCreationProvider>
  );
}

export default function CreateItineraryPageWrapper() {
  return (
    <ProtectedRoute requiredRoles={AGENT_ROLES}>
      <CreateItineraryPage />
    </ProtectedRoute>
  );
}
