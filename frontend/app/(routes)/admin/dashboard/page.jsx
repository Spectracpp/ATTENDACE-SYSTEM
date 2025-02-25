'use client';

import { useState, useEffect } from 'react';
import { FaUsers, FaBuilding, FaQrcode, FaChartBar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { getDashboardStats } from '@/lib/api/admin';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrganizations: 0,
    totalAttendance: 0,
    activeQRCodes: 0,
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await getDashboardStats();
        
        if (data?.success && data?.stats) {
          setStats({
            totalUsers: data.stats.totalUsers || 0,
            totalOrganizations: data.stats.totalOrganizations || 0,
            totalAttendance: data.stats.totalAttendance || 0,
            activeQRCodes: data.stats.activeQRCodes || 0,
            recentActivity: data.stats.recentActivity || []
          });
        } else {
          toast.error(data?.message || 'Failed to fetch dashboard stats');
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('An error occurred while fetching dashboard stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsCards = [
    { 
      title: 'Total Users', 
      value: stats.totalUsers || 0, 
      icon: FaUsers, 
      color: 'from-pink-500 to-rose-500' 
    },
    { 
      title: 'Organizations', 
      value: stats.totalOrganizations || 0, 
      icon: FaBuilding, 
      color: 'from-purple-500 to-indigo-500' 
    },
    { 
      title: 'Total Attendance', 
      value: stats.totalAttendance || 0, 
      icon: FaChartBar, 
      color: 'from-blue-500 to-cyan-500' 
    },
    { 
      title: 'Active QR Codes', 
      value: stats.activeQRCodes || 0, 
      icon: FaQrcode, 
      color: 'from-green-500 to-emerald-500' 
    }
  ];

  const handleQuickAction = (action) => {
    switch (action) {
      case 'qr':
        router.push('/admin/qr-codes/generate');
        break;
      case 'organization':
        router.push('/admin/organizations');
        break;
      case 'reports':
        router.push('/admin/reports');
        break;
      case 'users':
        router.push('/admin/users');
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-[#ff0080]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#ff0080] to-[#7928ca] bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-xl bg-black/40 border border-gray-800 backdrop-blur-sm hover:bg-black/60 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{card.title}</p>
                <p className={`text-3xl font-bold mt-2 bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                  {typeof card.value === 'number' ? card.value.toLocaleString() : '0'}
                </p>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-r ${card.color}`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-black/40 border border-gray-800 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Recent Activity</h2>
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <motion.div
                key={activity._id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-lg bg-black/20 hover:bg-black/30 transition-all duration-200"
              >
                <div>
                  <p className="text-gray-300">
                    {activity.type === 'attendance' 
                      ? `${activity.user?.name || 'Unknown'} marked attendance at ${activity.organization?.name || 'Unknown'}`
                      : activity.message}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-xl bg-black/40 border border-gray-800 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleQuickAction('qr')}
              className="p-4 rounded-lg bg-black/20 hover:bg-black/30 transition-all duration-200 text-left"
            >
              <FaQrcode className="w-6 h-6 mb-2 text-[#ff0080]" />
              <p className="text-gray-300">Generate QR Code</p>
            </button>
            <button
              onClick={() => handleQuickAction('organization')}
              className="p-4 rounded-lg bg-black/20 hover:bg-black/30 transition-all duration-200 text-left"
            >
              <FaBuilding className="w-6 h-6 mb-2 text-[#7928ca]" />
              <p className="text-gray-300">Manage Organizations</p>
            </button>
            <button
              onClick={() => handleQuickAction('reports')}
              className="p-4 rounded-lg bg-black/20 hover:bg-black/30 transition-all duration-200 text-left"
            >
              <FaChartBar className="w-6 h-6 mb-2 text-[#0070f3]" />
              <p className="text-gray-300">View Reports</p>
            </button>
            <button
              onClick={() => handleQuickAction('users')}
              className="p-4 rounded-lg bg-black/20 hover:bg-black/30 transition-all duration-200 text-left"
            >
              <FaUsers className="w-6 h-6 mb-2 text-[#00ff00]" />
              <p className="text-gray-300">Manage Users</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
