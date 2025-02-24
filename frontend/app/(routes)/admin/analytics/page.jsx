'use client';

import { useState, useEffect } from 'react';
import { FaChartBar, FaDownload, FaCalendarAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalAttendance: 0,
    averageAttendance: 0,
    totalOrganizations: 0,
    totalUsers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // week, month, year, custom

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics');
        const data = await response.json();
        setStats(data.stats || {});
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-[#ff0080]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#ff0080] to-[#7928ca] bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <div className="flex gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 rounded-lg bg-black/40 border border-gray-800 text-white focus:outline-none focus:border-[#ff0080]"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#ff0080] to-[#7928ca] text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
            <FaDownload />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-black/40 border border-gray-800"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-[#ff0080]/20">
              <FaChartBar className="w-6 h-6 text-[#ff0080]" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Attendance</p>
              <p className="text-2xl font-bold text-white">{stats.totalAttendance}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Previous period</span>
              <span className="text-green-400">+12.5%</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-black/40 border border-gray-800"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-[#7928ca]/20">
              <FaChartBar className="w-6 h-6 text-[#7928ca]" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Average Attendance</p>
              <p className="text-2xl font-bold text-white">{stats.averageAttendance}%</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Previous period</span>
              <span className="text-green-400">+5.2%</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-black/40 border border-gray-800"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-500/20">
              <FaChartBar className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Organizations</p>
              <p className="text-2xl font-bold text-white">{stats.totalOrganizations}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Previous period</span>
              <span className="text-green-400">+2</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl bg-black/40 border border-gray-800"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <FaChartBar className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Previous period</span>
              <span className="text-green-400">+15</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trends */}
        <div className="p-6 rounded-xl bg-black/40 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">Attendance Trends</h2>
          <div className="aspect-[4/3] bg-black/40 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">Chart will be implemented here</p>
          </div>
        </div>

        {/* Organization Distribution */}
        <div className="p-6 rounded-xl bg-black/40 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">Organization Distribution</h2>
          <div className="aspect-[4/3] bg-black/40 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">Chart will be implemented here</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl bg-black/40 border border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-lg bg-black/40"
            >
              <div className="p-2 rounded-lg bg-[#ff0080]/20">
                <FaCalendarAlt className="text-[#ff0080]" />
              </div>
              <div className="flex-1">
                <p className="text-white">Organization ABC marked attendance</p>
                <p className="text-gray-400 text-sm">50 members checked in</p>
              </div>
              <p className="text-gray-400 text-sm">2 hours ago</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
