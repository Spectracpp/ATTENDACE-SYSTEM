'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import QRCodeScanner from '../../components/QRCodeScanner';
import useGeolocation from '../hooks/useGeolocation';

export default function UserDashboard() {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    organization: {
      name: '',
      id: ''
    },
    attendanceHistory: [],
    rewards: {
      totalPoints: 0,
      recentRewards: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const router = useRouter();
  const { location, error: locationError } = useGeolocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    if (!token || role !== 'user') {
      router.push('/auth/login');
      return;
    }

    fetchUserData();
  }, [router, dateRange]);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    try {
      const [userResponse, attendanceResponse] = await Promise.all([
        fetch('/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch(`/api/attendance/user/${userId}?start=${dateRange.start}&end=${dateRange.end}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      ]);

      if (!userResponse.ok || !attendanceResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const [userData, attendanceData] = await Promise.all([
        userResponse.json(),
        attendanceResponse.json()
      ]);

      setUserData({
        name: userData.name,
        email: userData.email,
        organization: {
          name: userData.organization?.name || 'Not Assigned',
          id: userData.organization?._id
        },
        attendanceHistory: attendanceData.map(record => ({
          id: record._id,
          date: new Date(record.date).toLocaleDateString(),
          checkIn: record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : null,
          checkOut: record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : null,
          status: record.status,
          workHours: record.workHours || 0
        })),
        rewards: {
          totalPoints: userData.rewardPoints || 0,
          recentRewards: userData.recentRewards || []
        }
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = async (qrData) => {
    if (!location) {
      toast.error('Please enable location services to mark attendance');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          qrData,
          location: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to mark attendance');
      }

      const result = await response.json();
      toast.success(result.message || 'Attendance marked successfully');
      setShowScanner(false);
      fetchUserData();
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error(error.message || 'Failed to mark attendance');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{userData.name}'s Dashboard</h1>
          <p className="text-gray-500">{userData.organization.name}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowScanner(!showScanner)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2"
        >
          {showScanner ? 'Close Scanner' : 'Scan QR Code'}
        </motion.button>
      </div>

      {/* QR Scanner */}
      {showScanner && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 p-4 bg-white rounded-lg shadow-md"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Scan Attendance QR Code</h2>
            <button
              onClick={() => setShowScanner(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <QRCodeScanner onScan={handleScanSuccess} />
        </motion.div>
      )}

      {/* Attendance History */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Attendance History</h2>
          <div className="mt-2 flex gap-4">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Work Hours</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userData.attendanceHistory.map(record => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.checkIn || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.checkOut || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      record.status === 'present' ? 'bg-green-100 text-green-800' :
                      record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.workHours.toFixed(2)} hrs
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
