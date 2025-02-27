'use client';

import { useState, useEffect } from 'react';
import { FaCog, FaBell, FaLock, FaGlobe, FaClock, FaQrcode, FaUser } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { getCurrentUser, updateProfile } from '@/lib/api/userAlias';
import OrganizationSettings from '@/components/Settings/OrganizationSettings';

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
      attendance: true
    },
    security: {
      twoFactor: false,
      sessionTimeout: '30'
    },
    general: {
      timezone: 'UTC+5:30',
      dateFormat: 'DD/MM/YYYY',
      language: 'en'
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await updateProfile({
        ...profileData,
        settings
      });

      if (response.success) {
        toast.success('Settings updated successfully');
      } else {
        toast.error(response.message || 'Failed to update settings');
      }
    } catch (error) {
      toast.error('Error updating settings');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <form onSubmit={handleSubmit}>
        {/* Profile Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <FaUser />
            Profile Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="label">Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="input input-bordered"
              />
            </div>
            <div className="form-control">
              <label className="label">Email</label>
              <input
                type="email"
                value={profileData.email}
                disabled
                className="input input-bordered"
              />
            </div>
            <div className="form-control">
              <label className="label">Phone</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="input input-bordered"
              />
            </div>
          </div>
        </section>

        {/* Settings Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-base-100 shadow-xl"
          >
            <div className="card-body">
              <h3 className="card-title flex items-center gap-2">
                <FaBell className="text-primary" />
                Notifications
              </h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <span>Email Notifications</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          email: e.target.checked
                        }
                      })
                    }
                    className="toggle toggle-primary"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span>Push Notifications</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.push}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          push: e.target.checked
                        }
                      })
                    }
                    className="toggle toggle-primary"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span>Attendance Updates</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.attendance}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          attendance: e.target.checked
                        }
                      })
                    }
                    className="toggle toggle-primary"
                  />
                </label>
              </div>
            </div>
          </motion.div>

          {/* Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card bg-base-100 shadow-xl"
          >
            <div className="card-body">
              <h3 className="card-title flex items-center gap-2">
                <FaLock className="text-primary" />
                Security
              </h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <span>Two-Factor Auth</span>
                  <input
                    type="checkbox"
                    checked={settings.security.twoFactor}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          twoFactor: e.target.checked
                        }
                      })
                    }
                    className="toggle toggle-primary"
                  />
                </label>
                <div className="form-control">
                  <label className="label">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          sessionTimeout: e.target.value
                        }
                      })
                    }
                    className="input input-bordered"
                    min="1"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* General */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card bg-base-100 shadow-xl"
          >
            <div className="card-body">
              <h3 className="card-title flex items-center gap-2">
                <FaGlobe className="text-primary" />
                General
              </h3>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">Timezone</label>
                  <select
                    value={settings.general.timezone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: {
                          ...settings.general,
                          timezone: e.target.value
                        }
                      })
                    }
                    className="select select-bordered"
                  >
                    <option value="UTC+5:30">India (UTC+5:30)</option>
                    <option value="UTC">UTC</option>
                    <option value="UTC+1">UTC+1</option>
                    <option value="UTC-5">Eastern Time (UTC-5)</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">Date Format</label>
                  <select
                    value={settings.general.dateFormat}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: {
                          ...settings.general,
                          dateFormat: e.target.value
                        }
                      })
                    }
                    className="select select-bordered"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">Language</label>
                  <select
                    value={settings.general.language}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: {
                          ...settings.general,
                          language: e.target.value
                        }
                      })
                    }
                    className="select select-bordered"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Organization Section */}
      <div className="mt-12">
        <OrganizationSettings isAdmin={false} profileData={profileData} />
      </div>
    </div>
  );
}
