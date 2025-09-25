'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/lib/types';

// Define roles outside component to prevent re-creation on every render
const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN];
import { useImprovedAuth } from '@/context/ImprovedAuthContext';

function AdminDashboard() {
  const { state } = useImprovedAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {state.user?.profile?.firstName || state.user?.name || 'User'}!</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                {state.user?.role}
              </span>
              <button className="btn btn-secondary">Settings</button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="card-body text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">1,234</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">567</div>
              <div className="text-sm text-gray-600">Active Packages</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">890</div>
              <div className="text-sm text-gray-600">Total Bookings</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">$45,678</div>
              <div className="text-sm text-gray-600">Revenue</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Recent Users</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-gray-600">Travel Agent</p>
                  </div>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Jane Smith</p>
                    <p className="text-sm text-gray-600">Tour Operator</p>
                  </div>
                  <span className="text-sm text-gray-500">4 hours ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Mike Johnson</p>
                    <p className="text-sm text-gray-600">Travel Agent</p>
                  </div>
                  <span className="text-sm text-gray-500">6 hours ago</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">System Status</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>API Status</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Database</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Healthy</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Email Service</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Payment Gateway</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">Maintenance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requiredRoles={ADMIN_ROLES}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
