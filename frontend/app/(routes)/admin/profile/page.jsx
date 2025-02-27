'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaIdBadge } from 'react-icons/fa';

export default function AdminProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    adminId: user?.adminId || '',
    organization: user?.organization || '',
    role: user?.role || 'admin',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implement profile update logic
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="p-6 rounded-lg bg-gradient-to-r from-[#ff0080]/10 to-purple-500/10 border border-[#ff0080]/20">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center">
            <FaUser className="w-12 h-12 text-[#ff0080]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
            <p className="text-gray-400">Administrator</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="ml-auto px-4 py-2 rounded-lg bg-[#ff0080]/20 text-[#ff0080] hover:bg-[#ff0080]/30 transition-colors"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="p-6 rounded-lg bg-black/50 border border-gray-800 backdrop-blur-xl space-y-4">
            <h2 className="text-lg font-semibold text-white">Personal Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    className="block w-full pl-10 pr-3 py-2 rounded-lg bg-black/50 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff0080]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className="block w-full pl-10 pr-3 py-2 rounded-lg bg-black/50 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff0080]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="block w-full pl-10 pr-3 py-2 rounded-lg bg-black/50 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff0080]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Administrative Information */}
          <div className="p-6 rounded-lg bg-black/50 border border-gray-800 backdrop-blur-xl space-y-4">
            <h2 className="text-lg font-semibold text-white">Administrative Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Admin ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaIdBadge className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="adminId"
                    value={formData.adminId}
                    disabled
                    className="block w-full pl-10 pr-3 py-2 rounded-lg bg-black/50 border border-gray-800 text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Organization</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBuilding className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    disabled
                    className="block w-full pl-10 pr-3 py-2 rounded-lg bg-black/50 border border-gray-800 text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    disabled
                    className="block w-full pl-10 pr-3 py-2 rounded-lg bg-black/50 border border-gray-800 text-white placeholder-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-[#ff0080] text-white hover:bg-[#ff0080]/90 transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
