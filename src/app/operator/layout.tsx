'use client';

import React from 'react';
import { withImprovedAuth } from '@/components/auth/ImprovedProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { UserRole } from '@/lib/types';

// Define roles outside component to prevent re-creation on every render
const OPERATOR_LAYOUT_ROLES = [UserRole.TOUR_OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN];

interface OperatorLayoutProps {
  children: React.ReactNode;
}

function OperatorLayoutContent({ children }: OperatorLayoutProps) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}

// Wrap with role-based protection
const OperatorLayout = withImprovedAuth(OperatorLayoutContent, {
  requiredRoles: OPERATOR_LAYOUT_ROLES
});

export default OperatorLayout;
