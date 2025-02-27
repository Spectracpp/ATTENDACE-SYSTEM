'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaUserTie, FaQrcode } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import QRCode from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import OrganizationSelector from '@/components/Settings/OrganizationSelector';

const ProfileField = ({ icon: Icon, label, value, isEditing, onChange, name, type = 'text', disabled = false }) => (
  <div className="space-y-2">
    <label className="text-gray-400 flex items-center gap-2">
      <Icon className="text-gray-500" />
      {label}
    </label>
    {isEditing ? (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        disabled={disabled}
        className={`w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500 ${
          disabled ? 'cursor-not-allowed opacity-60' : ''
        }`}
      />
    ) : (
      <p className="text-white px-4 py-2 bg-gray-700/50 rounded-lg">{value}</p>
    )}
  </div>
);

export default function UserProfile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    department: '',
    role: ''
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showQRModal, setShowQRModal] = useState(false);
  const [scanningQR, setScanningQR] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const scannerRef = useRef(null);
  const qrCodeRef = useRef(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    if (!scanningQR || scannedData) return;
    
    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: 250,
      rememberLastUsedCamera: true,
    });

    scanner.render(async (decodedText) => {
      try {
        console.log('Scanned QR code:', decodedText);
        
        // Try to parse as JSON first
        let qrData;
        try {
          qrData = JSON.parse(decodedText);
          setScannedData(qrData);
          
          // Mark attendance with the sessionId from the QR code
          if (qrData.sessionId) {
            await markAttendanceWithQR(decodedText); // Send the full JSON string
          }
        } catch (jsonError) {
          // If not JSON, treat as raw sessionId
          setScannedData({ sessionId: decodedText });
          await markAttendanceWithQR(decodedText);
        }
        
        scanner.clear();
      } catch (error) {
        toast.error('Invalid QR code format');
        console.error('QR code parsing error:', error);
      }
    }, (error) => {
      console.warn(error);
    });

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [scanningQR, scannedData]);

  const markAttendanceWithQR = async (qrCode) => {
    try {
      const response = await axios.post('/api/user/attendance/mark', {
        qrCode,
        method: 'qr',
        location: await getCurrentLocation()
      });
      
      toast.success('Attendance marked successfully!');
      setScanningQR(false);
      setShowQRModal(false);
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  };

  const downloadQRCode = () => {
    if (!qrCodeRef.current) return;
    
    // Get the QR code canvas
    const canvas = qrCodeRef.current.querySelector('canvas');
    if (!canvas) return;
    
    // Convert canvas to data URL
    const dataURL = canvas.toDataURL('image/png');
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `${profileData.name.replace(/\s+/g, '_')}_profile_qr.png`;
    
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('QR Code downloaded successfully!');
  };

  const fetchProfileData = async () => {
    try {
      const response = await axios.get('/api/user/profile');
      setProfileData(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.put('/api/user/profile', profileData);
      await updateUser(response.data);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      await axios.put('/api/user/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      toast.success('Password changed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        {isEditing ? (
          <div className="flex gap-4">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Edit Profile
            </button>
            <button
              onClick={() => setShowQRModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <FaQrcode />
              Scan QR Code
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold text-white mb-4">Personal Information</h2>
          <ProfileField
            icon={FaUser}
            label="Full Name"
            value={profileData.name}
            isEditing={isEditing}
            onChange={handleInputChange}
            name="name"
          />
          <ProfileField
            icon={FaEnvelope}
            label="Email"
            value={profileData.email}
            isEditing={isEditing}
            onChange={handleInputChange}
            name="email"
            type="email"
            disabled={true}
          />
          <ProfileField
            icon={FaPhone}
            label="Phone"
            value={profileData.phone}
            isEditing={isEditing}
            onChange={handleInputChange}
            name="phone"
          />
        </div>

        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold text-white mb-4">Organization Details</h2>
          <OrganizationSelector />
          <ProfileField
            icon={FaUserTie}
            label="Department"
            value={profileData.department}
            isEditing={false}
            onChange={handleInputChange}
            name="department"
            disabled={true}
          />
          <ProfileField
            icon={FaUserTie}
            label="Role"
            value={profileData.role}
            isEditing={false}
            onChange={handleInputChange}
            name="role"
            disabled={true}
          />
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Security</h2>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Change Password
        </button>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Scanner Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Attendance QR Scanner</h2>
            
            {!scanningQR ? (
              <div className="space-y-6">
                <p className="text-gray-300 text-center">
                  Scan the QR code provided by your administrator to mark your attendance.
                </p>
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => {
                      setScannedData(null);
                      setScanningQR(true);
                    }}
                    className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaQrcode />
                    Start Scanning
                  </button>
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="w-full py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : scannedData ? (
              <div className="space-y-6">
                <div className="bg-green-500/20 text-green-500 p-4 rounded-lg flex items-center gap-3">
                  <p className="font-medium">QR code scanned successfully!</p>
                </div>
                <div className="text-gray-300 p-4 bg-gray-700/50 rounded-lg">
                  <p>Your attendance has been marked for today.</p>
                  <p className="text-xs mt-2 text-gray-400">Time: {new Date().toLocaleTimeString()}</p>
                </div>
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => {
                      setScannedData(null);
                      setScanningQR(false);
                    }}
                    className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Scan Another Code
                  </button>
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="w-full py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div id="qr-reader" className="w-full"></div>
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => {
                      setScanningQR(false);
                    }}
                    className="w-full py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel Scanning
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
