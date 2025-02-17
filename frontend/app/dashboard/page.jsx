'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { XMarkIcon } from '@heroicons/react/24/solid';

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
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const router = useRouter();

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
    } finally {
      setLoading(false);
    }
  };

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

  const QRScanner = ({ organization, onScanSuccess }) => {
    const [scanning, setScanning] = useState(false);
    const [scanError, setScanError] = useState(null);
    const scannerRef = useRef(null);

    useEffect(() => {
      let scanner = null;

      if (scanning) {
        scanner = new Html5QrcodeScanner('qr-reader', {
          qrbox: {
            width: 250,
            height: 250,
          },
          fps: 10,
        });

        scanner.render(async (decodedText) => {
          try {
            // Get current location
            const position = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };

            // Send scan data to server
            const response = await fetch(`/api/qrcodes/scan/${organization.id}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                qrData: decodedText,
                location
              })
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.message);
            }

            const result = await response.json();
            scanner.clear();
            setScanning(false);
            onScanSuccess(result.attendance);
          } catch (error) {
            setScanError(error.message);
          }
        }, (error) => {
          console.error(error);
          setScanError('Error accessing camera');
        });

        scannerRef.current = scanner;
      }

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
      };
    }, [scanning, organization]);

    if (!scanning) {
      return (
        <button
          onClick={() => setScanning(true)}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Scan QR Code
        </button>
      );
    }

    return (
      <div className="relative">
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={() => {
              if (scannerRef.current) {
                scannerRef.current.clear();
              }
              setScanning(false);
            }}
            className="p-2 bg-white rounded-full shadow-md"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div id="qr-reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-lg" />

        {scanError && (
          <div className="mt-2 text-center text-red-600 text-sm">
            {scanError}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00f2ea]"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-black/50 overflow-hidden shadow rounded-lg divide-y divide-gray-800">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-white">User Profile</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-400">Personal details and attendance information.</p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-400">Name</dt>
                    <dd className="mt-1 text-sm text-white">{userData.name}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-400">Email</dt>
                    <dd className="mt-1 text-sm text-white">{userData.email}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-400">Organization</dt>
                    <dd className="mt-1 text-sm text-white">{userData.organization.name}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-400">Reward Points</dt>
                    <dd className="mt-1 text-sm text-white">{userData.rewards.totalPoints}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Date Range Selector */}
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-400">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 bg-black/50 border border-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-[#00f2ea] focus:border-[#00f2ea] sm:text-sm text-white"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-400">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 bg-black/50 border border-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-[#00f2ea] focus:border-[#00f2ea] sm:text-sm text-white"
                />
              </div>
            </div>

            {/* Attendance History */}
            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border border-gray-800 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-800">
                      <thead className="bg-black/50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Check In
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Check Out
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Work Hours
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-black/30 divide-y divide-gray-800">
                        {userData.attendanceHistory.map((record) => (
                          <tr key={record.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {record.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {record.checkIn || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {record.checkOut || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {record.workHours.toFixed(2)} hrs
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                record.status === 'present' ? 'bg-green-900 text-green-300' :
                                record.status === 'late' ? 'bg-yellow-900 text-yellow-300' :
                                'bg-red-900 text-red-300'
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Mark Attendance</h3>
                <QRScanner 
                  organization={userData.organization}
                  onScanSuccess={(attendance) => {
                    // Refresh attendance data
                    fetchUserData();
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
