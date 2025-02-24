'use client';

import { useState, useEffect } from 'react';
import { FaUsers, FaBuilding, FaQrcode, FaChartBar } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrganizations: 0,
    totalAttendance: 0,
    activeQRCodes: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // TODO: Implement API calls to fetch statistics
        // For now using mock data
        setStats({
          totalUsers: 150,
          totalOrganizations: 5,
          totalAttendance: 1250,
          activeQRCodes: 10
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statsCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: FaUsers, color: 'from-pink-500 to-rose-500' },
    { title: 'Organizations', value: stats.totalOrganizations, icon: FaBuilding, color: 'from-purple-500 to-indigo-500' },
    { title: 'Total Attendance', value: stats.totalAttendance, icon: FaChartBar, color: 'from-blue-500 to-cyan-500' },
    { title: 'Active QR Codes', value: stats.activeQRCodes, icon: FaQrcode, color: 'from-green-500 to-emerald-500' }
  ];

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
                  {card.value.toLocaleString()}
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
        {/* Recent Activity */}
        <div className="p-6 rounded-xl bg-black/40 border border-gray-800 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {/* TODO: Add recent activity items */}
            <p className="text-gray-400">No recent activity</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 rounded-xl bg-black/40 border border-gray-800 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 rounded-lg bg-gradient-to-r from-[#ff0080] to-[#7928ca] text-white font-medium hover:opacity-90 transition-opacity">
              Generate QR Code
            </button>
            <button className="p-4 rounded-lg bg-gradient-to-r from-[#7928ca] to-[#ff0080] text-white font-medium hover:opacity-90 transition-opacity">
              Add Organization
            </button>
            <button className="p-4 rounded-lg bg-gradient-to-r from-[#ff0080] to-[#7928ca] text-white font-medium hover:opacity-90 transition-opacity">
              View Reports
            </button>
            <button className="p-4 rounded-lg bg-gradient-to-r from-[#7928ca] to-[#ff0080] text-white font-medium hover:opacity-90 transition-opacity">
              Manage Users
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
