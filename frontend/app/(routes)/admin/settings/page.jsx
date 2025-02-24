'use client';

import { useState } from 'react';
import { FaCog, FaBell, FaLock, FaGlobe, FaClock, FaQrcode } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function SettingsPage() {
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

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#ff0080] to-[#7928ca] bg-clip-text text-transparent">
          Settings
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-black/40 border border-gray-800"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-lg bg-[#ff0080]/20">
              <FaBell className="w-6 h-6 text-[#ff0080]" />
            </div>
            <h2 className="text-xl font-semibold text-white">Notification Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Email Notifications</p>
                <p className="text-sm text-gray-400">Receive notifications via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff0080]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Push Notifications</p>
                <p className="text-sm text-gray-400">Receive push notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.push}
                  onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff0080]"></div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-black/40 border border-gray-800"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-lg bg-[#7928ca]/20">
              <FaLock className="w-6 h-6 text-[#7928ca]" />
            </div>
            <h2 className="text-xl font-semibold text-white">Security Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Two-Factor Authentication</p>
                <p className="text-sm text-gray-400">Add an extra layer of security</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.security.twoFactor}
                  onChange={(e) => handleSettingChange('security', 'twoFactor', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7928ca]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Password Expiry (days)</p>
                <p className="text-sm text-gray-400">Force password change after specified days</p>
              </div>
              <select
                value={settings.security.passwordExpiry}
                onChange={(e) => handleSettingChange('security', 'passwordExpiry', e.target.value)}
                className="bg-black/40 border border-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#7928ca]"
              >
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="never">Never</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-black/40 border border-gray-800"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-lg bg-emerald-500/20">
              <FaGlobe className="w-6 h-6 text-emerald-500" />
            </div>
            <h2 className="text-xl font-semibold text-white">General Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white mb-2">Time Zone</label>
              <select
                value={settings.general.timezone}
                onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                className="w-full bg-black/40 border border-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
              >
                <option value="UTC+5:30">UTC+5:30 (IST)</option>
                <option value="UTC">UTC</option>
                <option value="UTC+1">UTC+1</option>
                {/* Add more timezone options */}
              </select>
            </div>

            <div>
              <label className="block text-white mb-2">Date Format</label>
              <select
                value={settings.general.dateFormat}
                onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
                className="w-full bg-black/40 border border-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Attendance Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl bg-black/40 border border-gray-800"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <FaClock className="w-6 h-6 text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold text-white">Attendance Settings</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Allow Late Check-in</p>
                <p className="text-sm text-gray-400">Allow users to check in after scheduled time</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.attendance.allowLate}
                  onChange={(e) => handleSettingChange('attendance', 'allowLate', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            <div>
              <label className="block text-white mb-2">Grace Period (minutes)</label>
              <input
                type="number"
                value={settings.attendance.graceTime}
                onChange={(e) => handleSettingChange('attendance', 'graceTime', e.target.value)}
                className="w-full bg-black/40 border border-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                min="0"
                max="60"
              />
            </div>
          </div>
        </motion.div>

        {/* QR Code Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-xl bg-black/40 border border-gray-800"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <FaQrcode className="w-6 h-6 text-purple-500" />
            </div>
            <h2 className="text-xl font-semibold text-white">QR Code Settings</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-white mb-2">QR Code Expiry (hours)</label>
              <select
                value={settings.qrCode.expiry}
                onChange={(e) => handleSettingChange('qrCode', 'expiry', e.target.value)}
                className="w-full bg-black/40 border border-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
              >
                <option value="12">12 hours</option>
                <option value="24">24 hours</option>
                <option value="48">48 hours</option>
                <option value="72">72 hours</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Allow Multiple Scans</p>
                <p className="text-sm text-gray-400">Allow the same QR code to be scanned multiple times</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.qrCode.allowMultiple}
                  onChange={(e) => handleSettingChange('qrCode', 'allowMultiple', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#ff0080] to-[#7928ca] text-white font-medium hover:opacity-90 transition-opacity">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
