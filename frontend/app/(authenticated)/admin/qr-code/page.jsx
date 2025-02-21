'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ClockIcon,
  QrCodeIcon,
  UserGroupIcon,
  MapPinIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function QRCodeGeneratorPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [sessionData, setSessionData] = useState({
    name: '',
    type: 'regular',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    location: { coordinates: [0, 0] },
    settings: {
      allowLateMarking: false,
      qrRefreshInterval: 30,
      locationRadius: 100
    }
  });

  const [attendees, setAttendees] = useState([]);
  const [refreshTimer, setRefreshTimer] = useState(30);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setSessionData(prev => ({
          ...prev,
          location: {
            coordinates: [position.coords.longitude, position.coords.latitude]
          }
        }));
      });
    }
  }, []);

  useEffect(() => {
    let timer;
    if (qrData && sessionData.settings.qrRefreshInterval > 0) {
      timer = setInterval(() => {
        setRefreshTimer(prev => {
          if (prev <= 1) {
            generateQRCode();
            return sessionData.settings.qrRefreshInterval;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [qrData, sessionData.settings.qrRefreshInterval]);

  const generateQRCode = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/qr-code/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      const data = await response.json();
      if (data.success) {
        setQrData(data.qrCode);
        toast.success('QR Code generated successfully');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error(error.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateQRCode();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('settings.')) {
      const settingName = name.split('.')[1];
      setSessionData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingName]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setSessionData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Form Section */}
        <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <QrCodeIcon className="h-8 w-8 text-[#00f2ea] mr-2" />
            Generate QR Code
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Session Name */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Session Name
              </label>
              <input
                type="text"
                name="name"
                value={sessionData.name}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00f2ea] focus:border-transparent"
                required
              />
            </div>

            {/* Session Type */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Session Type
              </label>
              <select
                name="type"
                value={sessionData.type}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-[#00f2ea] focus:border-transparent"
              >
                <option value="regular">Regular</option>
                <option value="event">Event</option>
                <option value="meeting">Meeting</option>
              </select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={sessionData.date}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-[#00f2ea] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={sessionData.startTime}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-[#00f2ea] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={sessionData.endTime}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-[#00f2ea] focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Settings</h3>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="settings.allowLateMarking"
                  checked={sessionData.settings.allowLateMarking}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#00f2ea] focus:ring-[#00f2ea] border-gray-700 rounded bg-gray-800"
                />
                <label className="ml-2 text-sm text-gray-400">
                  Allow Late Marking
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  QR Refresh Interval (seconds)
                </label>
                <input
                  type="number"
                  name="settings.qrRefreshInterval"
                  value={sessionData.settings.qrRefreshInterval}
                  onChange={handleChange}
                  min="0"
                  className="block w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-[#00f2ea] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Location Radius (meters)
                </label>
                <input
                  type="number"
                  name="settings.locationRadius"
                  value={sessionData.settings.locationRadius}
                  onChange={handleChange}
                  min="0"
                  className="block w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-[#00f2ea] focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-[#00f2ea] text-black rounded-lg hover:bg-[#00d8d2] transition-colors disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate QR Code'}
            </button>
          </form>
        </div>

        {/* QR Code Display Section */}
        <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-6">Active Session</h2>

          {qrData ? (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg">
                  <QRCodeSVG
                    value={qrData.data}
                    size={256}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center text-gray-400 mb-2">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    Refresh in
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {refreshTimer}s
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center text-gray-400 mb-2">
                    <UserGroupIcon className="h-5 w-5 mr-2" />
                    Attendees
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {attendees.length}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Recent Scans</h3>
                <div className="space-y-2">
                  {attendees.slice(0, 5).map((attendee, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center bg-gray-800 p-3 rounded-lg"
                    >
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-white">
                          {attendee.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(attendee.scannedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <QrCodeIcon className="h-16 w-16 mb-4" />
              <p>No active QR code</p>
              <p className="text-sm">Generate a QR code to start the session</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
