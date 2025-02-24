'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import { FaCalendar, FaFilter, FaFileDownload } from 'react-icons/fa';

export default function AttendanceHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, present, absent
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAttendanceHistory();
  }, [filter, dateRange]);

  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        filter,
        startDate: dateRange.start,
        endDate: dateRange.end
      });

      const response = await fetch(`/api/attendance/history?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch attendance history');
      }

      const data = await response.json();
      const attendanceData = Array.isArray(data) ? data : data.history || [];
      setHistory(attendanceData);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      toast.error('Failed to load attendance history');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Implement CSV export functionality
    toast.success('Exporting attendance data...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold cyberpunk-text-gradient">
          Attendance History
        </h1>
        <button
          onClick={handleExport}
          className="cyberpunk-button flex items-center gap-2"
        >
          <FaFileDownload />
          Export Data
        </button>
      </div>

      <div className="cyberpunk-card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#ff0080]">
              Filter Status
            </label>
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="cyberpunk-input w-full pl-10"
              >
                <option value="all">All Records</option>
                <option value="present">Present Only</option>
                <option value="absent">Absent Only</option>
              </select>
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7928ca]" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#ff0080]">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="cyberpunk-input w-full pl-10"
              />
              <FaCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7928ca]" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#ff0080]">
              End Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="cyberpunk-input w-full pl-10"
              />
              <FaCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7928ca]" />
            </div>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full cyberpunk-gradient flex items-center justify-center">
              <FaCalendar size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-medium text-gray-200 mb-2">
              No Records Found
            </h3>
            <p className="text-gray-400">
              Try adjusting your filters or date range
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="cyberpunk-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, index) => (
                  <tr key={index} className="hover:bg-black/50 transition-colors">
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>{record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}</td>
                    <td>{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}</td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === 'present' 
                          ? 'bg-[#4f46e5]/20 text-[#4f46e5]' 
                          : 'bg-[#ff0080]/20 text-[#ff0080]'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td>
                      {record.checkIn && record.checkOut ? (
                        <span className="text-[#7928ca]">
                          {Math.round((new Date(record.checkOut) - new Date(record.checkIn)) / (1000 * 60 * 60))}h
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
