import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import useGeolocation from '../../hooks/useGeolocation';

const QRCodeGenerator = ({ organizationId, token }) => {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const { location } = useGeolocation();
  
  const generateQRCode = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `/api/qr/generate/${organizationId}`,
        {
          type: 'daily',
          validityHours: 24,
          location: location ? {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          } : undefined,
          settings: {
            maxScans: 100,
            allowMultipleScans: true,
            locationRadius: 100
          }
        },
        {
          headers: { Authorization: token }
        }
      );
      
      setQrCode(response.data.qrCode);
      toast.success('QR Code generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="qr-generator-container"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={generateQRCode}
        disabled={loading}
        className="generate-button"
      >
        {loading ? 'Generating...' : 'Generate QR Code'}
      </motion.button>

      {qrCode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="qr-display"
        >
          <img
            src={qrCode.qrImage}
            alt="QR Code"
            className="qr-image"
          />
          <div className="qr-info">
            <p>Valid until: {new Date(qrCode.validUntil).toLocaleString()}</p>
            <p>Type: {qrCode.type}</p>
            <p>Max Scans: {qrCode.settings.maxScans}</p>
            <p>Current Scans: {qrCode.scans.length}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default QRCodeGenerator;
