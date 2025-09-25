'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useImprovedAuth } from '@/context/ImprovedAuthContext';

export default function OperatorPage() {
  const { state } = useImprovedAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('🏢 Operator page - Auth state:', { 
      user: state.user,
      isLoading: state.isLoading
    });
    
    // Redirect to dashboard if user is authenticated
    if (state.user && !state.isLoading) {
      console.log('🔄 Redirecting to operator dashboard');
      router.push('/operator/dashboard');
    } else if (!state.isLoading) {
      // Redirect to login if not authenticated
      console.log('🔄 Redirecting to login');
      router.push('/auth/login');
    }
  }, [state.user, state.isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
    </div>
  );
}
