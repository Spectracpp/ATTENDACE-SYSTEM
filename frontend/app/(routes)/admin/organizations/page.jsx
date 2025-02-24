'use client';

import { useState, useEffect } from 'react';
import { FaBuilding, FaUsers, FaQrcode, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { getOrganizations } from '@/lib/api/organization';
import toast from 'react-hot-toast';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await getOrganizations();
        if (response.success) {
          setOrganizations(response.organizations || []);
        } else {
          toast.error(response.message || 'Failed to fetch organizations');
        }
      } catch (error) {
        console.error('Error fetching organizations:', error);
        toast.error('Failed to fetch organizations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
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
          Organizations
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#ff0080] to-[#7928ca] text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <FaPlus />
          Add Organization
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org, index) => (
          <motion.div
            key={org._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-xl bg-black/40 border border-gray-800 backdrop-blur-sm hover:bg-black/60 transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white">{org.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{org.code}</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
                  <FaEdit />
                </button>
                <button className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                  <FaTrash />
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-lg bg-[#ff0080]/20">
                  <FaUsers className="w-5 h-5 text-[#ff0080]" />
                </div>
                <p className="mt-2 text-sm font-medium text-white">{org.membersCount || 0}</p>
                <p className="text-xs text-gray-400">Members</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-lg bg-[#7928ca]/20">
                  <FaQrcode className="w-5 h-5 text-[#7928ca]" />
                </div>
                <p className="mt-2 text-sm font-medium text-white">{org.qrCodesCount || 0}</p>
                <p className="text-xs text-gray-400">QR Codes</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-lg bg-emerald-500/20">
                  <FaUsers className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="mt-2 text-sm font-medium text-white">{org.attendanceCount || 0}</p>
                <p className="text-xs text-gray-400">Attendance</p>
              </div>
            </div>

            <div className="mt-6">
              <button className="w-full py-2 rounded-lg bg-gradient-to-r from-[#ff0080] to-[#7928ca] text-white font-medium hover:opacity-90 transition-opacity">
                View Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Organization Modal will be added here */}
    </div>
  );
}
