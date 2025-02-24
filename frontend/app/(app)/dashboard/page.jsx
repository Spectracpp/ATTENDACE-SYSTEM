'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, Typography, Box } from '@mui/material';
import { FaClock, FaCalendarAlt, FaChartLine, FaCheckCircle } from 'react-icons/fa';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todayStatus: 'Not Checked In',
    monthlyAttendance: '0%',
    totalDays: 0,
    streak: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="cyberpunk-card-gradient p-8">
        <h1 className="text-4xl font-bold cyberpunk-text-gradient mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-400">
          Track your attendance and stay productive
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Status */}
        <div className="cyberpunk-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-[#ff0080]">
              <FaClock size={24} />
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${
              stats.todayStatus === 'Checked In' 
                ? 'bg-[#4f46e5]/20 text-[#4f46e5]' 
                : 'bg-[#ff0080]/20 text-[#ff0080]'
            }`}>
              {stats.todayStatus}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-200">Today's Status</h3>
            <p className="text-gray-400 text-sm">Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Monthly Attendance */}
        <div className="cyberpunk-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-[#7928ca]">
              <FaCalendarAlt size={24} />
            </div>
            <span className="text-2xl font-bold cyberpunk-text-gradient">
              {stats.monthlyAttendance}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-200">Monthly Attendance</h3>
            <p className="text-gray-400 text-sm">This month's attendance rate</p>
          </div>
        </div>

        {/* Total Days */}
        <div className="cyberpunk-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-[#4f46e5]">
              <FaChartLine size={24} />
            </div>
            <span className="text-2xl font-bold cyberpunk-text-gradient">
              {stats.totalDays}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-200">Total Days</h3>
            <p className="text-gray-400 text-sm">Days attended this year</p>
          </div>
        </div>

        {/* Streak */}
        <div className="cyberpunk-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-[#ff0080]">
              <FaCheckCircle size={24} />
            </div>
            <span className="text-2xl font-bold cyberpunk-text-gradient">
              {stats.streak} days
            </span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-200">Current Streak</h3>
            <p className="text-gray-400 text-sm">Keep it going!</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="cyberpunk-card p-6">
        <h2 className="text-xl font-bold mb-4 cyberpunk-text-gradient">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="cyberpunk-button w-full">
            Mark Attendance
          </button>
          <button className="cyberpunk-button w-full">
            View History
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="cyberpunk-card p-6">
        <h2 className="text-xl font-bold mb-4 cyberpunk-text-gradient">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="flex items-center gap-4 p-4 cyberpunk-card-gradient">
              <div className="w-2 h-2 rounded-full bg-[#ff0080]" />
              <div>
                <p className="text-gray-200">Checked in at 9:00 AM</p>
                <p className="text-sm text-gray-400">Today</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
