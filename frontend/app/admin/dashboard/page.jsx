'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaUsers, FaUserCheck, FaClock, FaMedal, FaBuilding } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { QRCodeCanvas } from 'qrcode.react';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    todayAttendance: 0,
    totalRewards: 0,
    totalOrganizations: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedOrganization, setSelectedOrganization] = useState('all');
  const [organizations, setOrganizations] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'admin') {
      router.push('/auth/admin/login');
      return;
    }

    fetchOrganizations();
    fetchDashboardData();
  }, [router, selectedDate, selectedOrganization]);

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/organizations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }

      const data = await response.json();
      setOrganizations(data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Failed to fetch organizations');
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get all users for selected organization
      const usersResponse = await fetch(
        selectedOrganization === 'all' 
          ? '/api/users'
          : `/api/users?organization=${selectedOrganization}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!usersResponse.ok) {
        throw new Error('Failed to fetch users');
      }

      const usersData = await usersResponse.json();
      
      // Get attendance for selected date and organization
      const attendanceResponse = await fetch(
        selectedOrganization === 'all'
          ? `/api/attendance/date/${selectedDate}`
          : `/api/attendance/date/${selectedDate}?organization=${selectedOrganization}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!attendanceResponse.ok) {
        throw new Error('Failed to fetch attendance');
      }

      const attendanceData = await attendanceResponse.json();

      // Calculate stats
      const activeUsers = usersData.filter(user => user.isActive).length;
      const totalRewards = usersData.reduce((sum, user) => sum + (user.rewardPoints || 0), 0);
      
      setUsers(usersData.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        organization: user.organization,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        rewardPoints: user.rewardPoints || 0
      })));

      setStats({
        totalUsers: usersData.length,
        activeUsers,
        todayAttendance: attendanceData.length,
        totalRewards,
        totalOrganizations: organizations.length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      toast.success('User deleted successfully');
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      toast.success('User status updated successfully');
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const QRCodeGenerator = ({ organization }) => {
    const [qrCode, setQrCode] = useState(null);
    const [loading, setLoading] = useState(false);
    const [validityHours, setValidityHours] = useState(24);
    const [location, setLocation] = useState(null);
    const [useLocation, setUseLocation] = useState(false);
    const [settings, setSettings] = useState({
      maxScans: -1,
      allowMultipleScans: false
    });

    const generateQRCode = async () => {
      try {
        setLoading(true);
        
        // Get current location if enabled
        let locationData;
        if (useLocation) {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          
          locationData = {
            type: 'Point',
            coordinates: [position.coords.longitude, position.coords.latitude],
            radius: 100 // 100 meters radius
          };
        }

        const response = await fetch(`/api/qrcodes/generate/${organization._id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            type: 'daily',
            validityHours,
            location: locationData,
            settings
          })
        });

        if (!response.ok) {
          throw new Error('Failed to generate QR code');
        }

        const data = await response.json();
        setQrCode(data.qrCode);
      } catch (error) {
        toast.error('Error generating QR code');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const downloadQRCode = () => {
      if (!qrCode) return;
      
      const canvas = document.getElementById('qr-code-canvas');
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `qrcode-${organization.name}-${new Date().toISOString()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    return (
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Generate QR Code</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Validity (hours)
            </label>
            <input
              type="number"
              min="1"
              max="72"
              value={validityHours}
              onChange={(e) => setValidityHours(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="useLocation"
              checked={useLocation}
              onChange={(e) => setUseLocation(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="useLocation" className="ml-2 block text-sm text-gray-700">
              Require location verification
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="allowMultipleScans"
              checked={settings.allowMultipleScans}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                allowMultipleScans: e.target.checked
              }))}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="allowMultipleScans" className="ml-2 block text-sm text-gray-700">
              Allow multiple scans per user
            </label>
          </div>

          <button
            onClick={generateQRCode}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? 'Generating...' : 'Generate QR Code'}
          </button>

          {qrCode && (
            <div className="mt-4 text-center">
              <div className="inline-block p-4 bg-white rounded-lg shadow-md">
                <QRCodeCanvas
                  id="qr-code-canvas"
                  value={qrCode.qrImage}
                  size={200}
                  level="H"
                />
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Valid until: {new Date(qrCode.validUntil).toLocaleString()}
                </p>
                <button
                  onClick={downloadQRCode}
                  className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Download QR Code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const QRCodeList = ({ organization }) => {
    const [qrCodes, setQrCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      fetchQRCodes();
    }, [organization]);

    const fetchQRCodes = async () => {
      try {
        const response = await fetch(`/api/qrcodes/organization/${organization._id}?status=active`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch QR codes');
        }

        const data = await response.json();
        setQrCodes(data.qrCodes);
      } catch (error) {
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    const handleDeactivate = async (qrCodeId) => {
      try {
        const response = await fetch(`/api/qrcodes/${qrCodeId}/deactivate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to deactivate QR code');
        }

        toast.success('QR code deactivated successfully');
        fetchQRCodes();
      } catch (error) {
        toast.error(error.message);
      }
    };

    if (loading) {
      return (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-red-600 text-center py-4">
          {error}
        </div>
      );
    }

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Active QR Codes</h3>
        <div className="space-y-4">
          {qrCodes.map((qrCode) => (
            <div
              key={qrCode._id}
              className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
            >
              <div>
                <p className="font-medium">
                  Generated by: {qrCode.generatedBy.name}
                </p>
                <p className="text-sm text-gray-500">
                  Valid until: {new Date(qrCode.validUntil).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Scans: {qrCode.scans.length}
                  {qrCode.settings.maxScans > 0 && ` / ${qrCode.settings.maxScans}`}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDeactivate(qrCode._id)}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 focus:outline-none"
                >
                  Deactivate
                </button>
              </div>
            </div>
          ))}
          {qrCodes.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              No active QR codes found
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-800 bg-black/50 text-white focus:outline-none focus:ring-2 focus:ring-[#00f2ea]"
          />
          <select
            value={selectedOrganization}
            onChange={(e) => setSelectedOrganization(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-800 bg-black/50 text-white focus:outline-none focus:ring-2 focus:ring-[#00f2ea]"
          >
            <option value="all">All Organizations</option>
            {organizations.map(org => (
              <option key={org._id} value={org._id}>
                {org.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-800 bg-black/50 text-white focus:outline-none focus:ring-2 focus:ring-[#00f2ea]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<FaUsers />}
            color="blue"
          />
          <StatsCard
            title="Active Users"
            value={stats.activeUsers}
            icon={<FaUserCheck />}
            color="green"
          />
          <StatsCard
            title="Today's Attendance"
            value={stats.todayAttendance}
            icon={<FaClock />}
            color="yellow"
          />
          <StatsCard
            title="Total Rewards"
            value={stats.totalRewards}
            icon={<FaMedal />}
            color="purple"
          />
          <StatsCard
            title="Organizations"
            value={stats.totalOrganizations}
            icon={<FaBuilding />}
            color="pink"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <QRCodeGenerator organization={selectedOrganization} />
            <QRCodeList organization={selectedOrganization} />
          </div>
          {/* Users Table */}
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Employee ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rewards</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-800">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{user.employeeId}</td>
                    <td className="px-6 py-4">{user.organization}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${user.isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      {user.rewardPoints} points
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                        className="text-sm bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-lg transition-colors"
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-900/50 text-blue-300 border-blue-700',
    green: 'bg-green-900/50 text-green-300 border-green-700',
    yellow: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
    purple: 'bg-purple-900/50 text-purple-300 border-purple-700',
    pink: 'bg-pink-900/50 text-pink-300 border-pink-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-lg border ${colorClasses[color]} flex items-center justify-between`}
    >
      <div>
        <p className="text-sm opacity-75">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className="opacity-75">{icon}</div>
    </motion.div>
  );
}
