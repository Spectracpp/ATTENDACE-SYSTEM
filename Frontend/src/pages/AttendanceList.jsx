import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import axios from 'axios';

function AttendanceList() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [organization, setOrganization] = useState('');
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    // Fetch organizations
    const fetchOrganizations = async () => {
      try {
        const response = await axios.get('/api/organizations');
        setOrganizations(response.data);
        if (response.data.length > 0) {
          setOrganization(response.data[0].uid);
        }
      } catch (error) {
        console.error('Error fetching organizations:', error);
      }
    };

    fetchOrganizations();
  }, []);

  useEffect(() => {
    // Fetch attendance data when organization or date changes
    const fetchAttendance = async () => {
      if (!organization) return;

      try {
        const response = await axios.get(`/api/qr/stats/${organization}`, {
          params: {
            startDate: selectedDate,
            endDate: selectedDate,
          },
        });
        setAttendanceData(response.data);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      }
    };

    fetchAttendance();
  }, [organization, selectedDate]);

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Attendance List
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Organization</InputLabel>
            <Select
              value={organization}
              label="Organization"
              onChange={(e) => setOrganization(e.target.value)}
            >
              {organizations.map((org) => (
                <MenuItem key={org.uid} value={org.uid}>
                  {org.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Roll Number</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceData.map((row) => (
                <TableRow key={row._id}>
                  <TableCell>{row.rollNo}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    {row.status === 'present' ? 'Present' : 'Absent'}
                  </TableCell>
                  <TableCell>
                    {row.timestamp ? new Date(row.timestamp).toLocaleTimeString() : '-'}
                  </TableCell>
                </TableRow>
              ))}
              {attendanceData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No attendance records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default AttendanceList;
