'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FaUser, FaPhone, FaBuilding, FaCamera } from 'react-icons/fa';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    department: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setProfile(data);
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        department: data.department || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Profile updated successfully');
        fetchProfile();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profile', file);

    try {
      const response = await fetch('/api/profile/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        toast.success('Profile picture updated');
        fetchProfile();
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
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
    <div className="space-y-6">
      <div className="cyberpunk-card-gradient p-8">
        <h1 className="text-3xl font-bold cyberpunk-text-gradient mb-2">
          Profile Settings
        </h1>
        <p className="text-gray-400">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture Section */}
        <div className="cyberpunk-card p-6 space-y-4">
          <div className="relative w-32 h-32 mx-auto">
            <img
              src={profile?.profilePicture || '/default-avatar.png'}
              alt="Profile"
              className="w-full h-full rounded-full object-cover border-2 border-[#ff0080]"
            />
            <label className="absolute bottom-0 right-0 p-2 bg-[#ff0080] rounded-full cursor-pointer hover:bg-[#ff0080]/80 transition-colors">
              <FaCamera className="w-5 h-5" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-medium text-white">{profile?.name}</h3>
            <p className="text-gray-400">{profile?.email}</p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="cyberpunk-card p-6 lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#ff0080]">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="cyberpunk-input w-full pl-10"
                  placeholder="Enter your full name"
                />
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7928ca]" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#ff0080]">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="cyberpunk-input w-full pl-10"
                  placeholder="Enter your phone number"
                />
                <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7928ca]" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#ff0080]">
                Department
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="cyberpunk-input w-full pl-10"
                  placeholder="Enter your department"
                />
                <FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7928ca]" />
              </div>
            </div>

            <button
              type="submit"
              disabled={updating}
              className="cyberpunk-button w-full flex items-center justify-center gap-2"
            >
              {updating ? (
                <>
                  <LoadingSpinner small />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
