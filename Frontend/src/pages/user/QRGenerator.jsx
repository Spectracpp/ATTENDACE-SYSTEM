import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';

function QRGenerator() {
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { user } = useAuth();

  // Cooldown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const generateQR = async () => {
    if (!user?.user_id || !user?.organisation_uid) {
      console.error('Missing user data:', user);
      setError('User information is missing. Please log in again.');
      return;
    }

    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before generating another QR code.`);
      return;
    }
    
    setLoading(true);
    setError('');
    
    const requestData = {
      user_id: user.user_id,
      organisation_uid: user.organisation_uid,
    };

    console.log('Generating QR code with data:', requestData);
    console.log('Using API URL:', import.meta.env.VITE_API_URL);
    
    try {
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/qr/generate`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('QR Generation response:', response.data);

      if (response.data && response.data.qrImage) {
        setQrCode(`data:image/png;base64,${response.data.qrImage}`);
        setCooldown(60); // 1 minute cooldown
      } else {
        console.error('Invalid response format:', response.data);
        throw new Error('No QR code image received from server');
      }
    } catch (error) {
      console.error('QR Generation error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });

      if (error.response?.status === 429) {
        // Rate limit exceeded
        const retryAfter = error.response.headers['retry-after'] || 60;
        setCooldown(parseInt(retryAfter, 10));
        setError(`Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`);
      } else if (error.response) {
        // Server responded with an error
        setError(error.response.data?.message || 'Failed to generate QR code');
      } else if (error.request) {
        // No response received
        setError('No response from server. Please check your connection.');
      } else {
        // Other errors
        setError('Failed to generate QR code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography>Please log in to generate QR codes.</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, textAlign: 'center', maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        QR Code Generator
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ my: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : qrCode ? (
          <Box sx={{ textAlign: 'center' }}>
            <img
              src={qrCode}
              alt="QR Code"
              style={{
                maxWidth: '100%',
                height: 'auto',
                maxHeight: '300px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '8px',
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              This QR code will expire in 2 hours
            </Typography>
          </Box>
        ) : (
          <Typography color="text.secondary" sx={{ my: 4 }}>
            Click the button below to generate a new QR code
          </Typography>
        )}
      </Box>

      <Button
        variant="contained"
        onClick={generateQR}
        disabled={loading || cooldown > 0}
        sx={{ mt: 2 }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} color="inherit" />
            <span>Generating...</span>
          </Box>
        ) : cooldown > 0 ? (
          `Wait ${cooldown}s`
        ) : (
          'Generate QR Code'
        )}
      </Button>

      {cooldown > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Next QR code available in: {cooldown} seconds
        </Typography>
      )}

      {/* Debug info */}
      <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
          Debug Info:
          {JSON.stringify({
            user_id: user?.user_id,
            organisation_uid: user?.organisation_uid,
            api_url: import.meta.env.VITE_API_URL,
            has_token: !!localStorage.getItem('token')
          }, null, 2)}
        </Typography>
      </Box>
    </Paper>
  );
}

export default QRGenerator;
