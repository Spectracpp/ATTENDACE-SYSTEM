'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login/user');
    } else if (user.role !== 'user') {
      router.push('/dashboard/admin');
    }
  }, [user, router]);

  if (!user || user.role !== 'user') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">User Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Your Information</h2>
            <div className="space-y-3">
              <p><span className="text-gray-400">Name:</span> {user.name}</p>
              <p><span className="text-gray-400">Email:</span> {user.email}</p>
              <p><span className="text-gray-400">Organization:</span> {user.organizationName}</p>
              <p><span className="text-gray-400">Department:</span> {user.department}</p>
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Attendance Summary</h2>
            <div className="space-y-3">
              <p><span className="text-gray-400">Total Classes:</span> 0</p>
              <p><span className="text-gray-400">Present:</span> 0</p>
              <p><span className="text-gray-400">Absent:</span> 0</p>
              <p><span className="text-gray-400">Attendance Rate:</span> 0%</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="text-gray-400">
              No recent activity
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
