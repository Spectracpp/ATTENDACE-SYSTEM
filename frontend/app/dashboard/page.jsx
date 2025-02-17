'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserDashboard() {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    attendanceHistory: [],
    rewards: {
      totalPoints: 0,
      recentRewards: []
    }
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    if (!token || role !== 'user') {
      router.push('/auth/login/user');
      return;
    }

    const fetchUserData = async () => {
      try {
        const [userResponse, attendanceResponse] = await Promise.all([
          fetch('/users/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }),
          fetch(`/attendance/user/${userId}`, {
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
          name: userData.firstName + ' ' + userData.lastName,
          email: userData.email,
          attendanceHistory: attendanceData.map(record => ({
            id: record._id,
            date: record.date,
            checkIn: new Date(record.check_in).toLocaleTimeString(),
            checkOut: record.check_out ? new Date(record.check_out).toLocaleTimeString() : null,
            status: record.status
          })),
          rewards: {
            totalPoints: 0,
            recentRewards: []
          }
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleMarkAttendance = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/attendance/mark', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to mark attendance');
      }

      // Refresh user data
      window.location.reload();
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome, {userData.name}!</h1>
              <p className="mt-1 text-sm text-gray-500">{userData.email}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={handleMarkAttendance}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Mark Attendance
              </button>
            </div>
          </div>

          {/* Rewards Overview */}
          <div className="bg-white rounded-lg shadow mb-8 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Rewards Overview</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Points</p>
                <p className="text-2xl font-bold text-blue-600">{userData.rewards.totalPoints}</p>
              </div>
              <button
                onClick={() => router.push('/rewards')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View All Rewards
              </button>
            </div>
          </div>

          {/* Attendance History */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-xl font-semibold text-gray-900">Attendance History</h2>
            </div>
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userData.attendanceHistory.map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.checkIn}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.checkOut || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
