'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { FaUser, FaCalendarCheck, FaCalendarTimes, FaPercentage, FaClipboardList, FaBuilding, FaExchangeAlt } from 'react-icons/fa';
import axios from 'axios';
import Link from 'next/link';

const StatCard = ({ icon: Icon, title, value, color }) => (
  <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg p-6">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-gray-400 font-medium mb-2">{title}</h3>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color.replace('text-', 'bg-')}/20`}>
        <Icon className={`text-xl ${color}`} />
      </div>
    </div>
  </div>
);

const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'attendance':
        return <FaCalendarCheck className="text-green-500" />;
      case 'leave':
        return <FaCalendarTimes className="text-yellow-500" />;
      default:
        return <FaClipboardList className="text-blue-500" />;
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'attendance':
        return `Marked ${activity.status} at ${activity.organization}`;
      case 'leave':
        return `Requested ${activity.type} leave (${activity.status})`;
      default:
        return 'Unknown activity';
    }
  };

  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-700 last:border-0">
      <div className="p-2 bg-gray-700 rounded-full">
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1">
        <p className="text-white">{getActivityText(activity)}</p>
        <p className="text-gray-400 text-sm">
          {new Date(activity.date).toLocaleDateString()} at {new Date(activity.date).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default function UserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todayStatus: 'absent',
    weeklyAttendance: 0,
    monthlyAttendance: 0,
    pendingLeaves: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes] = await Promise.all([
        axios.get('/api/user/stats'),
        axios.get('/api/user/activity')
      ]);
      setStats(statsRes.data);
      setRecentActivity(activityRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">
            {new Date().toLocaleDateString()}
          </p>
        </div>
        
        {user?.activeOrganization && (
          <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-lg border border-gray-800">
            <FaBuilding className="text-[#ff0080]" />
            <div>
              <p className="text-white font-medium">{user.activeOrganization.name}</p>
              <p className="text-xs text-gray-400">{user.activeOrganization.type}</p>
            </div>
            <Link 
              href="/user/organizations" 
              className="ml-2 text-[#ff0080] hover:text-[#ff0080]/80 transition-colors"
              title="Switch Organization"
            >
              <FaExchangeAlt />
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FaUser}
          title="Today's Status"
          value={stats.todayStatus === 'present' ? 'Present' : 'Absent'}
          color={stats.todayStatus === 'present' ? 'text-green-500' : 'text-red-500'}
        />
        <StatCard
          icon={FaCalendarCheck}
          title="Weekly Attendance"
          value={stats.weeklyAttendance}
          color="text-blue-500"
        />
        <StatCard
          icon={FaCalendarCheck}
          title="Monthly Attendance"
          value={stats.monthlyAttendance}
          color="text-pink-500"
        />
        <StatCard
          icon={FaClipboardList}
          title="Pending Leaves"
          value={stats.pendingLeaves}
          color="text-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
              <Link href="/user/attendance" className="text-pink-500 hover:text-pink-400 transition-colors">
                View All
              </Link>
            </div>
            <div className="space-y-2">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <ActivityItem key={index} activity={activity} />
                ))
              ) : (
                <p className="text-gray-400 py-4 text-center">No recent activity</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <Link href="/user/attendance" className="block w-full py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-center">
                Mark Attendance
              </Link>
              <Link href="/user/leaves" className="block w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center">
                Request Leave
              </Link>
              <Link href="/user/organizations" className="block w-full py-3 bg-[#ff0080] text-white rounded-lg hover:bg-[#ff0080]/90 transition-colors text-center">
                Manage Organizations
              </Link>
              <Link href="/user/profile" className="block w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center">
                Update Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
