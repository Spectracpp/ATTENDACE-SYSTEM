import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

function UserDashboard() {
  const { user } = useAuth();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Organization: {user?.organisation_uid}
        </Typography>
      </Paper>
      
      <Box sx={{ mt: 3 }}>
        <Outlet />
      </Box>
    </Container>
  );
}

export default UserDashboard;
