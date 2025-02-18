'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import { FaQrcode, FaUsers, FaCalendarAlt, FaCog } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  console.log('AdminDashboard component rendering');
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    presentToday: 0,
    absentToday: 0
  });

  console.log('AdminDashboard state:', { user, loading, showQRGenerator, stats });

  useEffect(() => {
    console.log('AdminDashboard useEffect - auth check:', { loading, user });
    if (!loading && !user) {
      console.log('No user found, redirecting to login...');
      router.replace('/auth/admin/login');
    }
  }, [loading, user, router]);

  if (loading) {
    console.log('Showing loading spinner...');
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    console.log('No user, returning null...');
    return null;
  }

  console.log('Rendering dashboard content...');

  const generateQR = () => {
    setShowQRGenerator(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome, Admin {user?.name}!
        </h1>
        <p className="text-gray-300">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          onClick={generateQR}
          className="flex items-center justify-center gap-3 p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <FaQrcode size={24} />
          <span>Generate QR</span>
        </button>
        <button
          onClick={() => toast.success('Coming soon!')}
          className="flex items-center justify-center gap-3 p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <FaUsers size={24} />
          <span>Manage Users</span>
        </button>
        <button
          onClick={() => toast.success('Coming soon!')}
          className="flex items-center justify-center gap-3 p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          <FaCalendarAlt size={24} />
          <span>Attendance Reports</span>
        </button>
        <button
          onClick={() => toast.success('Coming soon!')}
          className="flex items-center justify-center gap-3 p-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          <FaCog size={24} />
          <span>Settings</span>
        </button>
      </div>

      {/* QR Generator */}
      {showQRGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Generate Attendance QR</h2>
              <button
                onClick={() => setShowQRGenerator(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <QRCodeGenerator
              organizationId={user?.organizationId}
            />
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Total Users</p>
              <h3 className="text-2xl font-bold text-white">{stats.totalUsers}</h3>
            </div>
            <FaUsers className="text-blue-500 text-3xl" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Present Today</p>
              <h3 className="text-2xl font-bold text-white">{stats.presentToday}</h3>
            </div>
            <div className="text-green-500 text-3xl">✓</div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Absent Today</p>
              <h3 className="text-2xl font-bold text-white">{stats.absentToday}</h3>
            </div>
            <div className="text-red-500 text-3xl">✗</div>
          </div>
        </div>
      </div>
    </div>
  );
}
