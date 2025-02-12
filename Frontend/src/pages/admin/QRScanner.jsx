import React, { useState } from 'react';
import { Box, Paper, Typography, Alert } from '@mui/material';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';
import axios from 'axios';

function QRScanner() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    });

    scanner.render(onScanSuccess, onScanError);

    function onScanSuccess(qrCodeMessage) {
      handleQRCode(qrCodeMessage);
    }

    function onScanError(error) {
      console.warn(error);
    }

    return () => {
      scanner.clear().catch(console.error);
    };
  }, []);

  const handleQRCode = async (qrData) => {
    try {
      setError('');
      setSuccess('');
      
      const response = await axios.post('/api/qr/scan', { qrData });
      setSuccess(response.data.message);
    } catch (error) {
      console.error('QR Scan error:', error);
      setError(error.response?.data?.message || 'Failed to process QR code');
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        QR Code Scanner
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box id="reader" sx={{ width: '100%', maxWidth: '600px', mx: 'auto' }} />
    </Paper>
  );
}

export default QRScanner;
