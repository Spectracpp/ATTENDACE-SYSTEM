'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaGraduationCap, FaBook } from 'react-icons/fa';
import { updateProfile, getCurrentUser } from '@/lib/api/user';
import OrganizationSection from '@/components/Profile/OrganizationSection';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    course: '',
    semester: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    avatar: null
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await getCurrentUser();
      if (response.success) {
        setFormData(prev => ({
          ...prev,
          ...response.user,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        toast.error(response.message || 'Failed to fetch user data');
      }
    } catch (error) {
      toast.error('Error fetching user data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate passwords if changing
      if (formData.newPassword || formData.currentPassword) {
        if (!formData.currentPassword) {
          toast.error('Current password is required to change password');
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error('New passwords do not match');
          return;
        }
        if (formData.newPassword.length < 6) {
          toast.error('New password must be at least 6 characters long');
          return;
        }
      }

      // Create FormData for file upload
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'confirmPassword' && formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });

      const response = await updateProfile(data);
      if (response.success) {
        toast.success('Profile updated successfully');
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Error updating profile');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white pt-24 px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-24 px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Profile Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-6 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Information */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title flex items-center gap-2">
                  <FaUser className="text-primary" />
                  Profile Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <FaUser className="inline mr-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <FaEnvelope className="inline mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <FaPhone className="inline mr-2" />
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <FaBuilding className="inline mr-2" />
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <FaGraduationCap className="inline mr-2" />
                      Course
                    </label>
                    <input
                      type="text"
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <FaBook className="inline mr-2" />
                      Semester
                    </label>
                    <input
                      type="text"
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Password Change */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Change Password</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Picture */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
            <div>
              <label className="block text-sm font-medium mb-2">Avatar</label>
              <input
                type="file"
                name="avatar"
                onChange={handleChange}
                accept="image/*"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
              />
            </div>
          </div>

          {/* Organizations Section */}
          <div className="mt-8">
            <OrganizationSection />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
