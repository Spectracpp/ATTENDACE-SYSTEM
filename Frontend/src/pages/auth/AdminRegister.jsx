import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';

function AdminRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organizationId: '',
    adminCode: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admins/register', formData);
      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Admin Registration
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            name="name"
            label="Name"
            fullWidth
            margin="normal"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <TextField
            name="email"
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextField
            name="password"
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <TextField
            name="organizationId"
            label="Organization ID"
            fullWidth
            margin="normal"
            value={formData.organizationId}
            onChange={handleChange}
            required
          />
          <TextField
            name="adminCode"
            label="Admin Registration Code"
            type="password"
            fullWidth
            margin="normal"
            value={formData.adminCode}
            onChange={handleChange}
            required
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 2 }}
          >
            Register as Admin
          </Button>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link href="/login" variant="body2">
              Already have an account? Login
            </Link>
            <br />
            <Link href="/register" variant="body2">
              Register as User
            </Link>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

export default AdminRegister;
