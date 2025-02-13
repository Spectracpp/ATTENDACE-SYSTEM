import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// Auth Pages
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';

// User Pages
import QRGenerator from './pages/user/QRGenerator.jsx';
import Dashboard from './pages/user/Dashboard.jsx';

// Admin Pages
import QRScanner from './pages/admin/QRScanner.jsx';

// Create theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </Box>
    );
  }

  // If not logged in, only allow access to login and register
  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Box>
      </ThemeProvider>
    );
  }

  // If logged in as admin, only show admin routes
  if (user.role === 'admin') {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/admin" element={<QRScanner />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </Box>
      </ThemeProvider>
    );
  }

  // If logged in as user, only show user routes
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/user/dashboard" element={<Dashboard />} />
          <Route path="/user" element={<QRGenerator />} />
          <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
        </Routes>
      </Box>
    </ThemeProvider>
  );
}

export default App;
