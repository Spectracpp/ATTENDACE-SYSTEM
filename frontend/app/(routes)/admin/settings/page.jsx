'use client';

import { useState, useEffect } from 'react';
import { FaCog, FaBell, FaLock, FaGlobe, FaClock, FaQrcode, FaUser, FaBuilding } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { getCurrentUser, updateProfile } from '@/lib/api/userAlias';
import OrganizationSettings from '@/components/Settings/OrganizationSettings';
import OrganizationSelector from '@/components/Settings/OrganizationSelector';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    avatar: null
  });

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      attendance: true,
      reports: true
    },
    security: {
      twoFactor: false,
      passwordExpiry: '90',
      sessionTimeout: '30'
    },
    general: {
      timezone: 'UTC+5:30',
      dateFormat: 'DD/MM/YYYY',
      language: 'en'
    },
    attendance: {
      allowLate: true,
      graceTime: '15',
      autoCheckout: true
    },
    qrCode: {
      expiry: '24',
      allowMultiple: false,
      regenerateDaily: true
    }
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await getCurrentUser();
      if (response.success) {
        setProfileData(prev => ({
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

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleProfileChange = (e) => {
    const { name, value, type, files } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (profileData.newPassword || profileData.currentPassword) {
        if (!profileData.currentPassword) {
          toast.error('Current password is required to change password');
          return;
        }
        if (profileData.newPassword !== profileData.confirmPassword) {
          toast.error('New passwords do not match');
          return;
        }
        if (profileData.newPassword.length < 6) {
          toast.error('New password must be at least 6 characters long');
          return;
        }
      }

      const data = new FormData();
      Object.keys(profileData).forEach(key => {
        if (key !== 'confirmPassword' && profileData[key] !== null && profileData[key] !== '') {
          data.append(key, profileData[key]);
        }
      });

      const response = await updateProfile(data);
      if (response.success) {
        toast.success('Profile updated successfully');
        setProfileData(prev => ({
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
      <div className="min-h-screen bg-black/95 flex items-center justify-center">
        <div className="animate-pulse text-[#ff0080]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#ff0080] to-[#7928ca] bg-clip-text text-transparent">
          Settings
        </h1>
      </div>

      {/* Organization Selector */}
      <section className="bg-black/50 rounded-xl p-6 backdrop-blur-sm border border-gray-800">
        <div className="flex items-center gap-2 mb-6">
          <FaBuilding className="text-[#ff0080] text-xl" />
          <h2 className="text-xl font-semibold text-white">Active Organization</h2>
        </div>
        <OrganizationSelector />
      </section>

      {/* Profile Section */}
      <section className="bg-black/50 rounded-xl p-6 backdrop-blur-sm border border-gray-800">
        <div className="flex items-center gap-2 mb-6">
          <FaUser className="text-[#ff0080] text-xl" />
          <h2 className="text-xl font-semibold text-white">Profile Settings</h2>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                className="w-full bg-black/50 border border-gray-800 rounded-lg px-4 py-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={profileData.email}
                className="w-full bg-black/50 border border-gray-800 rounded-lg px-4 py-2 text-white"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                className="w-full bg-black/50 border border-gray-800 rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Avatar</label>
              <input
                type="file"
                name="avatar"
                onChange={handleProfileChange}
                accept="image/*"
                className="w-full bg-black/50 border border-gray-800 rounded-lg px-4 py-2 text-white"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={profileData.currentPassword}
                onChange={handleProfileChange}
                className="w-full bg-black/50 border border-gray-800 rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={profileData.newPassword}
                onChange={handleProfileChange}
                className="w-full bg-black/50 border border-gray-800 rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={profileData.confirmPassword}
                onChange={handleProfileChange}
                className="w-full bg-black/50 border border-gray-800 rounded-lg px-4 py-2 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#ff0080] hover:bg-[#ff0080]/90 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </section>

      {/* Notifications Section */}
      <section className="bg-black/50 rounded-xl p-6 backdrop-blur-sm border border-gray-800">
        <div className="flex items-center gap-2 mb-6">
          <FaBell className="text-[#ff0080] text-xl" />
          <h2 className="text-xl font-semibold text-white">Notifications</h2>
        </div>

        <div className="space-y-4">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff0080]"></div>
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-black/50 rounded-xl p-6 backdrop-blur-sm border border-gray-800">
        <div className="flex items-center gap-2 mb-6">
          <FaLock className="text-[#ff0080] text-xl" />
          <h2 className="text-xl font-semibold text-white">Security</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Two-Factor Authentication</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.twoFactor}
                onChange={(e) => handleSettingChange('security', 'twoFactor', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff0080]"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password Expiry (days)</label>
            <input
              type="number"
              value={settings.security.passwordExpiry}
              onChange={(e) => handleSettingChange('security', 'passwordExpiry', e.target.value)}
              className="w-full bg-black/50 border border-gray-800 rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              value={settings.security.sessionTimeout}
              onChange={(e) => handleSettingChange('security', 'sessionTimeout', e.target.value)}
              className="w-full bg-black/50 border border-gray-800 rounded-lg px-4 py-2 text-white"
            />
          </div>
        </div>
      </section>

      {/* General Settings */}
      <section className="bg-black/50 rounded-xl p-6 backdrop-blur-sm border border-gray-800">
        <div className="flex items-center gap-2 mb-6">
          <FaGlobe className="text-[#ff0080] text-xl" />
          <h2 className="text-xl font-semibold text-white">General</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
            <select
              value={settings.general.timezone}
              onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
              className="w-full bg-black/50 border border-gray-800 rounded-lg px-4 py-2 text-white"
            >
              <option value="UTC+5:30">IST (UTC+5:30)</option>
              <option value="UTC">UTC</option>
              <option value="UTC+1">UTC+1</option>
              <option value="UTC+2">UTC+2</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Date Format</label>
            <select
              value={settings.general.dateFormat}
              onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
              className="w-full bg-black/50 border border-gray-800 rounded-lg px-4 py-2 text-white"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
            <select
              value={settings.general.language}
              onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
              className="w-full bg-black/50 border border-gray-800 rounded-lg px-4 py-2 text-white"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
        </div>
      </section>

      {/* Attendance Settings */}
      <section className="bg-black/50 rounded-xl p-6 backdrop-blur-sm border border-gray-800">
        <div className="flex items-center gap-2 mb-6">
          <FaClock className="text-[#ff0080] text-xl" />
          <h2 className="text-xl font-semibold text-white">Attendance</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Allow Late Check-in</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.attendance.allowLate}
                onChange={(e) => handleSettingChange('attendance', 'allowLate', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff0080]"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Grace Period (minutes)</label>
            <input
              type="number"
              value={settings.attendance.graceTime}
              onChange={(e) => handleSettingChange('attendance', 'graceTime', e.target.value)}
              className="w-full bg-black/50 border border-gray-800 rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-300">Auto Check-out</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.attendance.autoCheckout}
                onChange={(e) => handleSettingChange('attendance', 'autoCheckout', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff0080]"></div>
            </label>
          </div>
        </div>
      </section>

      {/* QR Code Settings */}
      <section className="bg-black/50 rounded-xl p-6 backdrop-blur-sm border border-gray-800">
        <div className="flex items-center gap-2 mb-6">
          <FaQrcode className="text-[#ff0080] text-xl" />
          <h2 className="text-xl font-semibold text-white">QR Code</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">QR Code Expiry (hours)</label>
            <input
              type="number"
              value={settings.qrCode.expiry}
              onChange={(e) => handleSettingChange('qrCode', 'expiry', e.target.value)}
              className="w-full bg-black/50 border border-gray-800 rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-300">Allow Multiple Scans</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.qrCode.allowMultiple}
                onChange={(e) => handleSettingChange('qrCode', 'allowMultiple', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff0080]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-300">Regenerate Daily</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.qrCode.regenerateDaily}
                onChange={(e) => handleSettingChange('qrCode', 'regenerateDaily', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff0080]"></div>
            </label>
          </div>
        </div>
      </section>

      {/* Organization Management Section */}
      <div className="mt-8">
        <OrganizationSettings isAdmin={true} profileData={profileData} />
      </div>
    </div>
  );
}
