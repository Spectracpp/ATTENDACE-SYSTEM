'use client';

import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from '@react-qr-reader/html5-qrcode';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  QrCodeIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

export default function QRScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [location, setLocation] = useState(null);
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            coordinates: [position.coords.longitude, position.coords.latitude]
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Please enable location services to mark attendance');
        }
      );
    }

    // Initialize QR scanner
    const qrScanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    });

    setScanner(qrScanner);

    return () => {
      if (qrScanner) {
        qrScanner.clear();
      }
    };
  }, []);

  const handleScanSuccess = async (decodedText) => {
    if (!location) {
      toast.error('Please enable location services to mark attendance');
      return;
    }

    setScanning(true);
    try {
      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrData: decodedText,
          location: location,
          device: {
            type: 'mobile',
            userAgent: navigator.userAgent,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setScanResult({
          success: true,
          message: 'Attendance marked successfully',
          session: data.session
        });
        toast.success('Attendance marked successfully');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      setScanResult({
        success: false,
        message: error.message || 'Failed to mark attendance'
      });
      toast.error(error.message || 'Failed to mark attendance');
    } finally {
      setScanning(false);
      if (scanner) {
        scanner.clear();
      }
    }
  };

  const handleScanFailure = (error) => {
    console.warn('QR scan error:', error);
  };

  const resetScanner = () => {
    setScanResult(null);
    if (scanner) {
      scanner.render(handleScanSuccess, handleScanFailure);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="bg-gray-900 rounded-xl p-6 shadow-lg"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Scan Attendance QR Code</h1>
          <p className="text-gray-400">
            Point your camera at the QR code to mark your attendance
          </p>
        </div>

        {!scanResult ? (
          <div className="space-y-6">
            {location ? (
              <div className="flex items-center justify-center text-green-500 mb-4">
                <MapPinIcon className="h-5 w-5 mr-2" />
                <span className="text-sm">Location services enabled</span>
              </div>
            ) : (
              <div className="flex items-center justify-center text-red-500 mb-4">
                <MapPinIcon className="h-5 w-5 mr-2" />
                <span className="text-sm">Please enable location services</span>
              </div>
            )}

            <div
              id="qr-reader"
              className="mx-auto max-w-sm overflow-hidden rounded-lg"
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            {scanResult.success ? (
              <>
                <div className="flex justify-center">
                  <CheckCircleIcon className="h-20 w-20 text-green-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Attendance Marked!
                  </h2>
                  <p className="text-gray-400">
                    Your attendance has been recorded successfully
                  </p>
                </div>
                {scanResult.session && (
                  <div className="bg-gray-800 p-4 rounded-lg max-w-sm mx-auto">
                    <h3 className="font-medium text-white mb-2">
                      Session Details
                    </h3>
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>Name: {scanResult.session.name}</p>
                      <p>Type: {scanResult.session.type}</p>
                      <p>
                        Time: {new Date(scanResult.session.date).toLocaleDateString()}
                        {' '}
                        {scanResult.session.startTime} - {scanResult.session.endTime}
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex justify-center">
                  <XCircleIcon className="h-20 w-20 text-red-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Scanning Failed
                  </h2>
                  <p className="text-gray-400">{scanResult.message}</p>
                </div>
              </>
            )}

            <button
              onClick={resetScanner}
              className="px-6 py-2 bg-[#00f2ea] text-black rounded-lg hover:bg-[#00d8d2] transition-colors"
            >
              Scan Again
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
