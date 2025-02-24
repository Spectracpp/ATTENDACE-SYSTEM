'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import dynamic from 'next/dynamic';

// Dynamically import Chart.js components to avoid SSR issues
const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false });
const Bar = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { ssr: false });
const Doughnut = dynamic(() => import('react-chartjs-2').then(mod => mod.Doughnut), { ssr: false });

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, selectedDepartment]);

  const fetchAnalytics = async () => {
    try {
      const queryParams = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end,
        department: selectedDepartment
      });

      const response = await fetch(`/api/admin/analytics?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const attendanceTrendData = {
    labels: analytics?.attendanceTrend?.map(item => item.date) || [],
    datasets: [
      {
        label: 'Present',
        data: analytics?.attendanceTrend?.map(item => item.present) || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
      },
      {
        label: 'Absent',
        data: analytics?.attendanceTrend?.map(item => item.absent) || [],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
      }
    ]
  };

  const departmentStatsData = {
    labels: analytics?.departmentStats?.map(dept => dept.name) || [],
    datasets: [
      {
        data: analytics?.departmentStats?.map(dept => dept.attendanceRate) || [],
        backgroundColor: [
          'rgba(34, 197, 94, 0.5)',
          'rgba(59, 130, 246, 0.5)',
          'rgba(168, 85, 247, 0.5)',
          'rgba(249, 115, 22, 0.5)',
          'rgba(236, 72, 153, 0.5)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(168, 85, 247)',
          'rgb(249, 115, 22)',
          'rgb(236, 72, 153)'
        ],
        borderWidth: 1
      }
    ]
  };

  const timeDistributionData = {
    labels: analytics?.timeDistribution?.map(item => item.hour) || [],
    datasets: [
      {
        label: 'Check-ins',
        data: analytics?.timeDistribution?.map(item => item.count) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full border rounded-md py-2 px-3"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full border rounded-md py-2 px-3"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full border rounded-md py-2 px-3"
            >
              <option value="all">All Departments</option>
              {analytics?.departments?.map((dept, index) => (
                <option key={index} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Attendance Overview</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Average Attendance Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {analytics?.overview?.averageRate}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Check-ins</p>
              <p className="text-2xl font-bold text-blue-600">
                {analytics?.overview?.totalCheckins}
              </p>
            </div>
          </div>
          <div className="h-64">
            <Line 
              data={attendanceTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Department Statistics</h2>
          <div className="h-64">
            <Doughnut
              data={departmentStatsData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Check-in Time Distribution</h2>
          <div className="h-64">
            <Bar
              data={timeDistributionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Key Insights</h2>
          <div className="space-y-4">
            {analytics?.insights?.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`mt-1 w-2 h-2 rounded-full ${
                  insight.type === 'positive' ? 'bg-green-500' :
                  insight.type === 'negative' ? 'bg-red-500' :
                  'bg-blue-500'
                }`} />
                <p className="text-gray-700">{insight.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
