'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaUsers, FaUserCheck, FaClock, FaMedal } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    todayAttendance: 0,
    totalRewards: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'admin') {
      router.push('/auth/admin/login');
      return;
    }

    fetchDashboardData();
  }, [router, selectedDate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get all users
      const usersResponse = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!usersResponse.ok) {
        throw new Error('Failed to fetch users');
      }

      const usersData = await usersResponse.json();
      
      // Get attendance for selected date
      const attendanceResponse = await fetch(`/api/attendance/date/${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

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
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        rewardPoints: user.rewardPoints || 0
      })));

      setStats({
        totalUsers: usersData.length,
        activeUsers,
        todayAttendance: attendanceData.length,
        totalRewards
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

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<FaUsers className="w-6 h-6" />}
            color="cyan"
          />
          <StatsCard
            title="Active Users"
            value={stats.activeUsers}
            icon={<FaUserCheck className="w-6 h-6" />}
            color="green"
          />
          <StatsCard
            title="Today's Attendance"
            value={stats.todayAttendance}
            icon={<FaClock className="w-6 h-6" />}
            color="yellow"
          />
          <StatsCard
            title="Total Reward Points"
            value={stats.totalRewards}
            icon={<FaMedal className="w-6 h-6" />}
            color="purple"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00f2ea]"
          />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00f2ea]"
          />
        </div>

        {/* Users Table */}
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Employee ID</th>
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
  );
}

function StatsCard({ title, value, icon, color }) {
  const colorClasses = {
    cyan: 'bg-cyan-900/50 text-cyan-300 border-cyan-700',
    green: 'bg-green-900/50 text-green-300 border-green-700',
    yellow: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
    purple: 'bg-purple-900/50 text-purple-300 border-purple-700',
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
