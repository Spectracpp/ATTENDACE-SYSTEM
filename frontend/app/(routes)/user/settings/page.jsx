'use client';

import { useState } from 'react';
import { FaBell, FaLock, FaPalette, FaGlobe, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import OrganizationSelector from '@/components/Settings/OrganizationSelector';
import { toast } from 'react-hot-toast';

export default function UserSettings() {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      attendance: true,
      classUpdates: true,
    },
    appearance: {
      theme: 'dark',
      fontSize: 'medium',
      animations: true,
    },
    privacy: {
      showProfile: true,
      showAttendance: false,
      showActivity: true,
    },
    language: 'en',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (category, setting) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting],
      },
    }));
  };

  const handleLanguageChange = (lang) => {
    setSettings(prev => ({
      ...prev,
      language: lang,
    }));
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      toast.success('Settings saved successfully');
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Settings Header */}
      <div className="p-6 rounded-lg bg-gradient-to-r from-[#ff0080]/10 to-purple-500/10 border border-[#ff0080]/20">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Customize your experience</p>
      </div>

      {/* Organization Selector */}
      <OrganizationSelector />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <div className="p-6 rounded-lg bg-black/50 border border-gray-800 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <FaBell className="w-5 h-5 text-[#ff0080]" />
            <h2 className="text-lg font-semibold text-white">Notifications</h2>
          </div>

          <div className="space-y-4">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-gray-300 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <button
                  onClick={() => handleToggle('notifications', key)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    value ? 'bg-[#ff0080]' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform transform ${
                      value ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="p-6 rounded-lg bg-black/50 border border-gray-800 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <FaPalette className="w-5 h-5 text-[#ff0080]" />
            <h2 className="text-lg font-semibold text-white">Appearance</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Theme</label>
              <select
                value={settings.appearance.theme}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    appearance: { ...prev.appearance, theme: e.target.value },
                  }))
                }
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-gray-800 text-white focus:outline-none focus:border-[#ff0080]"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Font Size</label>
              <select
                value={settings.appearance.fontSize}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    appearance: { ...prev.appearance, fontSize: e.target.value },
                  }))
                }
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-gray-800 text-white focus:outline-none focus:border-[#ff0080]"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-300">Animations</span>
              <button
                onClick={() => handleToggle('appearance', 'animations')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.appearance.animations ? 'bg-[#ff0080]' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform transform ${
                    settings.appearance.animations ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="p-6 rounded-lg bg-black/50 border border-gray-800 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <FaLock className="w-5 h-5 text-[#ff0080]" />
            <h2 className="text-lg font-semibold text-white">Privacy</h2>
          </div>

          <div className="space-y-4">
            {Object.entries(settings.privacy).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-gray-300 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <button
                  onClick={() => handleToggle('privacy', key)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    value ? 'bg-[#ff0080]' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform transform ${
                      value ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Language Settings */}
        <div className="p-6 rounded-lg bg-black/50 border border-gray-800 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <FaGlobe className="w-5 h-5 text-[#ff0080]" />
            <h2 className="text-lg font-semibold text-white">Language</h2>
          </div>

          <div>
            <select
              value={settings.language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-black/50 border border-gray-800 text-white focus:outline-none focus:border-[#ff0080]"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="px-6 py-2 rounded-lg bg-[#ff0080] text-white hover:bg-[#ff0080]/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
