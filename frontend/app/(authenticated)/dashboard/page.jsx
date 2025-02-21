'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import QRScanner from '@/components/QRScanner';
import { FaQrcode, FaHistory, FaClock } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function UserDashboard() {
  const { user } = useAuth();
  const [showScanner, setShowScanner] = useState(false);
  const [lastAttendance, setLastAttendance] = useState(null);

  const handleScan = async (qrData) => {
    try {
      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrData }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Attendance marked successfully!');
        setLastAttendance(data.attendance);
        setShowScanner(false);
      } else {
        throw new Error(data.message || 'Failed to mark attendance');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome back, {user?.name}!
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setShowScanner(true)}
          className="flex items-center justify-center gap-3 p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <FaQrcode size={24} />
          <span>Scan Attendance QR</span>
        </button>
        <button
          onClick={() => toast.success('Coming soon!')}
          className="flex items-center justify-center gap-3 p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <FaHistory size={24} />
          <span>View History</span>
        </button>
      </div>

      {/* QR Scanner */}
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Scan QR Code</h2>
              <button
                onClick={() => setShowScanner(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <QRScanner onScan={handleScan} />
          </div>
        </div>
      )}

      {/* Last Attendance */}
      {lastAttendance && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaClock />
            Last Attendance
          </h2>
          <div className="text-gray-300">
            <p>Date: {new Date(lastAttendance.timestamp).toLocaleDateString()}</p>
            <p>
              Time: {new Date(lastAttendance.timestamp).toLocaleTimeString()}
            </p>
            <p>Status: {lastAttendance.status}</p>
          </div>
        </div>
      )}
    </div>
  );
}
