'use client';

import React from 'react';
import { withImprovedAuth } from '@/components/auth/ImprovedProtectedRoute';
import { AgentDashboardLayout } from '@/components/dashboard/AgentDashboardLayout';
import { UserRole } from '@/lib/types';

// Define roles outside component to prevent re-creation on every render
const AGENT_LAYOUT_ROLES = [UserRole.TRAVEL_AGENT, UserRole.ADMIN, UserRole.SUPER_ADMIN];

interface AgentLayoutProps {
  children: React.ReactNode;
}

function AgentLayoutContent({ children }: AgentLayoutProps) {
  return (
    <AgentDashboardLayout>
      {children}
    </AgentDashboardLayout>
  );
}

// Wrap with role-based protection
const AgentLayout = withImprovedAuth(AgentLayoutContent, {
  requiredRoles: AGENT_LAYOUT_ROLES
});

export default AgentLayout;
