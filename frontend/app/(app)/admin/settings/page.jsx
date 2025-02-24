'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    attendanceSettings: {
      lateThreshold: 15,
      absenceThreshold: 60,
      allowLateCheckin: true,
      allowEarlyCheckout: false
    },
    qrCodeSettings: {
      validityDuration: 30,
      refreshInterval: 5,
      allowMultipleScans: false
    },
    notificationSettings: {
      enableEmailNotifications: true,
      enablePushNotifications: true,
      notifyOnLateCheckin: true,
      notifyOnAbsence: true
    },
    securitySettings: {
      requireLocationVerification: true,
      maxLoginAttempts: 5,
      sessionTimeout: 60
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setSettings(data);
      setFormData(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings updated successfully!' });
        setSettings(formData);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while updating settings' });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Settings</h1>

      {message.text && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold">Attendance Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Late Threshold (minutes)
              </label>
              <input
                type="number"
                value={formData.attendanceSettings.lateThreshold}
                onChange={(e) => handleChange('attendanceSettings', 'lateThreshold', parseInt(e.target.value))}
                className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Absence Threshold (minutes)
              </label>
              <input
                type="number"
                value={formData.attendanceSettings.absenceThreshold}
                onChange={(e) => handleChange('attendanceSettings', 'absenceThreshold', parseInt(e.target.value))}
                className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowLateCheckin"
                checked={formData.attendanceSettings.allowLateCheckin}
                onChange={(e) => handleChange('attendanceSettings', 'allowLateCheckin', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label htmlFor="allowLateCheckin" className="ml-2 text-sm text-gray-700">
                Allow Late Check-in
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowEarlyCheckout"
                checked={formData.attendanceSettings.allowEarlyCheckout}
                onChange={(e) => handleChange('attendanceSettings', 'allowEarlyCheckout', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label htmlFor="allowEarlyCheckout" className="ml-2 text-sm text-gray-700">
                Allow Early Check-out
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold">QR Code Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                QR Code Validity Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.qrCodeSettings.validityDuration}
                onChange={(e) => handleChange('qrCodeSettings', 'validityDuration', parseInt(e.target.value))}
                className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                QR Code Refresh Interval (minutes)
              </label>
              <input
                type="number"
                value={formData.qrCodeSettings.refreshInterval}
                onChange={(e) => handleChange('qrCodeSettings', 'refreshInterval', parseInt(e.target.value))}
                className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3"
                min="1"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="allowMultipleScans"
              checked={formData.qrCodeSettings.allowMultipleScans}
              onChange={(e) => handleChange('qrCodeSettings', 'allowMultipleScans', e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <label htmlFor="allowMultipleScans" className="ml-2 text-sm text-gray-700">
              Allow Multiple Scans of Same QR Code
            </label>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold">Notification Settings</h2>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableEmailNotifications"
                checked={formData.notificationSettings.enableEmailNotifications}
                onChange={(e) => handleChange('notificationSettings', 'enableEmailNotifications', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label htmlFor="enableEmailNotifications" className="ml-2 text-sm text-gray-700">
                Enable Email Notifications
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="enablePushNotifications"
                checked={formData.notificationSettings.enablePushNotifications}
                onChange={(e) => handleChange('notificationSettings', 'enablePushNotifications', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label htmlFor="enablePushNotifications" className="ml-2 text-sm text-gray-700">
                Enable Push Notifications
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyOnLateCheckin"
                checked={formData.notificationSettings.notifyOnLateCheckin}
                onChange={(e) => handleChange('notificationSettings', 'notifyOnLateCheckin', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label htmlFor="notifyOnLateCheckin" className="ml-2 text-sm text-gray-700">
                Notify on Late Check-in
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyOnAbsence"
                checked={formData.notificationSettings.notifyOnAbsence}
                onChange={(e) => handleChange('notificationSettings', 'notifyOnAbsence', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label htmlFor="notifyOnAbsence" className="ml-2 text-sm text-gray-700">
                Notify on Absence
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold">Security Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Maximum Login Attempts
              </label>
              <input
                type="number"
                value={formData.securitySettings.maxLoginAttempts}
                onChange={(e) => handleChange('securitySettings', 'maxLoginAttempts', parseInt(e.target.value))}
                className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={formData.securitySettings.sessionTimeout}
                onChange={(e) => handleChange('securitySettings', 'sessionTimeout', parseInt(e.target.value))}
                className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3"
                min="1"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="requireLocationVerification"
              checked={formData.securitySettings.requireLocationVerification}
              onChange={(e) => handleChange('securitySettings', 'requireLocationVerification', e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <label htmlFor="requireLocationVerification" className="ml-2 text-sm text-gray-700">
              Require Location Verification for Attendance
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
