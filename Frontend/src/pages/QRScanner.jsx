import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  Box,
  Paper,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext.jsx';

function QRScanner() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [scanning, setScanning] = useState(true);
  const [scannedCodes, setScannedCodes] = useState([]);
  const { user } = useAuth();

  const onScanSuccess = async (decodedText) => {
    try {
      const response = await axios.post('/api/qr/scan', {
        qrData: decodedText,
        scannedBy: user._id,
        organizationId: user.organizationId,
      });
      
      setScannedCodes(prev => [{
        timestamp: new Date().toLocaleTimeString(),
        message: response.data.message,
        success: true
      }, ...prev]);
      
      setSuccess('QR code scanned successfully');
      setError('');
    } catch (error) {
      setScannedCodes(prev => [{
        timestamp: new Date().toLocaleTimeString(),
        message: error.response?.data?.message || 'Invalid QR code',
        success: false
      }, ...prev]);
      
      setError(error.response?.data?.message || 'Failed to process QR code');
      setSuccess('');
    }
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    });

    scanner.render(onScanSuccess, (error) => {
      console.error(error);
    });

    return () => {
      scanner.clear().catch(console.error);
    };
  }, []);

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          QR Scanner
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

        <Box id="reader" sx={{ width: '100%', mb: 3 }} />

        <Typography variant="h6" gutterBottom>
          Scan History
        </Typography>
        
        <List>
          {scannedCodes.map((scan, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemText
                  primary={scan.message}
                  secondary={scan.timestamp}
                  sx={{
                    color: scan.success ? 'success.main' : 'error.main',
                  }}
                />
              </ListItem>
              {index < scannedCodes.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
}

export default QRScanner;
