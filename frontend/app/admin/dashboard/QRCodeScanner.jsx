import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import useGeolocation from '../../hooks/useGeolocation';

const QR_READER_ID = 'qr-reader-element';

const QRCodeScanner = ({ organizationId, token }) => {
  const [scanning, setScanning] = useState(false);
  const { location } = useGeolocation();
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    // Create scanner instance
    const newScanner = new Html5QrcodeScanner(
      QR_READER_ID,
      {
        fps: 10,
        qrbox: 250,
        aspectRatio: 1,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 2
      },
      false
    );

    // Start scanner
    newScanner.render(handleScan, handleError);
    setScanner(newScanner);

    // Cleanup
    return () => {
      if (newScanner) {
        newScanner.clear();
      }
    };
  }, []);

  const handleScan = async (decodedText) => {
    if (decodedText && location && !scanning) {
      try {
        setScanning(true);
        const response = await axios.post(
          `/api/qr/scan/${organizationId}`,
          {
            qrData: decodedText,
            location: {
              type: 'Point',
              coordinates: [location.longitude, location.latitude]
            }
          },
          {
            headers: { Authorization: token }
          }
        );
        
        toast.success('Attendance marked successfully!');
        
        // Pause scanning for a moment
        setTimeout(() => {
          setScanning(false);
        }, 2000);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to scan QR code');
        setScanning(false);
      }
    }
  };

  const handleError = (error) => {
    toast.error('Error accessing camera: ' + error.message);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="qr-scanner-container"
    >
      <motion.div
        className="scanner-overlay"
        animate={{
          boxShadow: scanning 
            ? '0 0 0 0 rgba(0, 255, 0, 0.7)' 
            : '0 0 0 20px rgba(0, 255, 0, 0)'
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5
        }}
      >
        <div 
          id={QR_READER_ID}
          style={{ width: '100%', height: '100%' }}
        />
      </motion.div>
      <motion.p
        animate={{ opacity: scanning ? 1 : 0.7 }}
        className="scanner-status"
      >
        {scanning ? 'Scanning...' : 'Ready to scan'}
      </motion.p>
    </motion.div>
  );
};

export default QRCodeScanner;
