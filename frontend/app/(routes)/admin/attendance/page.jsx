'use client';

import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaSearch, FaFilter, FaDownload, FaEye } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function AttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('today'); // today, week, month, custom

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch('/api/attendance');
        const data = await response.json();
        setAttendance(data.attendance || []);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
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
          Attendance Management
        </h1>
        <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#ff0080] to-[#7928ca] text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
          <FaDownload />
          Export Report
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or organization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-black/40 border border-gray-800 text-white focus:outline-none focus:border-[#ff0080]"
          />
        </div>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 rounded-lg bg-black/40 border border-gray-800 text-white focus:outline-none focus:border-[#ff0080]"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      {/* Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-black/40 border border-gray-800">
          <h3 className="text-lg font-semibold text-white">Today's Attendance</h3>
          <p className="text-3xl font-bold text-[#ff0080] mt-2">85%</p>
          <p className="text-gray-400 text-sm">234 out of 275 members</p>
        </div>
        <div className="p-6 rounded-xl bg-black/40 border border-gray-800">
          <h3 className="text-lg font-semibold text-white">Average Time In</h3>
          <p className="text-3xl font-bold text-[#7928ca] mt-2">9:15 AM</p>
          <p className="text-gray-400 text-sm">Based on today's records</p>
        </div>
        <div className="p-6 rounded-xl bg-black/40 border border-gray-800">
          <h3 className="text-lg font-semibold text-white">Late Arrivals</h3>
          <p className="text-3xl font-bold text-red-500 mt-2">12</p>
          <p className="text-gray-400 text-sm">Members arrived late today</p>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="rounded-xl bg-black/40 border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-black/60">
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Organization</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Time In</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Time Out</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {attendance.map((record) => (
                <tr key={record.id} className="hover:bg-black/60 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#ff0080] to-[#7928ca] flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {record.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-white">{record.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {record.organization}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {record.timeIn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {record.timeOut || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.status === 'present' ? 'bg-green-500/20 text-green-400' :
                      record.status === 'late' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="p-2 rounded-lg bg-[#ff0080]/20 text-[#ff0080] hover:bg-[#ff0080]/30 transition-colors">
                      <FaEye />
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
