import { Suspense } from 'react';
import { ModernLoginForm } from '@/components/auth/ModernLoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <ModernLoginForm />
      </Suspense>
    </div>
  );
}
