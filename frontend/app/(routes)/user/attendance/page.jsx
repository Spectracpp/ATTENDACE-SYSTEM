'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { FaCalendarAlt, FaQrcode, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import toast from 'react-hot-toast';

const Calendar = ({ attendance }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentMonth, attendance]);

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of month and last day of month
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Get day of week of first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Get total days in month
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Create array for calendar days
    const days = [];
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: null, status: null });
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      
      // Find attendance record for this day
      const record = attendance.find(a => {
        const attendanceDate = new Date(a.date);
        return attendanceDate.toISOString().split('T')[0] === dateString;
      });
      
      days.push({
        day,
        date,
        status: record ? record.status : null,
        checkInTime: record ? record.checkInTime : null,
        checkOutTime: record ? record.checkOutTime : null
      });
    }
    
    setCalendarDays(days);
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-500';
      case 'absent':
        return 'bg-red-500';
      case 'late':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-700';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Attendance Calendar</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={prevMonth}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              &lt;
            </button>
            <h3 className="text-lg font-medium text-white">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={nextMonth}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              &gt;
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={index} className="text-center py-2 text-gray-400 font-medium">
              {day}
            </div>
          ))}
          
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`relative aspect-square flex flex-col items-center justify-center rounded-lg ${
                day.day ? getStatusColor(day.status) : 'bg-transparent'
              } ${day.day ? 'hover:opacity-80 cursor-pointer' : ''} transition-opacity`}
              title={day.status ? `${day.status} (Check in: ${day.checkInTime ? new Date(day.checkInTime).toLocaleTimeString() : 'N/A'})` : ''}
            >
              {day.day && (
                <>
                  <span className="text-white font-medium">{day.day}</span>
                  {day.status && (
                    <span className="text-xs text-white/80 mt-1 capitalize">{day.status}</span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const QRCodeScanner = ({ onScan }) => {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!scanning) return;

    // Initialize scanner
    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: 250,
      rememberLastUsedCamera: true,
    });

    // Start scanning
    scanner.render((decodedText) => {
      // Stop scanner and call onScan with the decoded text
      scanner.clear();
      setScanning(false);
      onScan(decodedText);
    }, (error) => {
      console.warn(error);
    });

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [scanning, onScan]);

  return (
    <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">QR Code Scanner</h2>
      
      {!scanning ? (
        <button
          onClick={() => setScanning(true)}
          className="w-full py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
        >
          <FaQrcode />
          Start Scanning
        </button>
      ) : (
        <div className="space-y-4">
          <div id="qr-reader" className="w-full"></div>
          <button
            onClick={() => {
              if (scannerRef.current) {
                scannerRef.current.clear();
              }
              setScanning(false);
            }}
            className="w-full py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

const LocationAttendance = ({ onMarkAttendance }) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLoading(false);
      },
      (error) => {
        setError(`Error getting location: ${error.message}`);
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Mark by Location</h2>
      
      {error && (
        <div className="bg-red-500/20 text-red-500 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {location ? (
        <div className="space-y-4">
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <p className="text-gray-300">
              <span className="font-medium">Latitude:</span> {location.latitude.toFixed(6)}
            </p>
            <p className="text-gray-300">
              <span className="font-medium">Longitude:</span> {location.longitude.toFixed(6)}
            </p>
          </div>
          
          <button
            onClick={() => onMarkAttendance(location)}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <FaCheckCircle />
            Mark Attendance
          </button>
          
          <button
            onClick={() => setLocation(null)}
            className="w-full py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
        </div>
      ) : (
        <button
          onClick={getLocation}
          disabled={loading}
          className="w-full py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
          ) : (
            <>
              <FaMapMarkerAlt />
              Get Current Location
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default function UserAttendance() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    attendanceRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [todayMarked, setTodayMarked] = useState(false);

  useEffect(() => {
    fetchAttendanceData();
    checkTodayAttendance();
  }, [currentMonth]);

  const fetchAttendanceData = async () => {
    try {
      const response = await axios.get('/api/user/attendance', {
        params: { 
          month: currentMonth.getMonth() + 1, 
          year: currentMonth.getFullYear() 
        }
      });
      
      // Check if response has the expected structure
      if (response.data && response.data.attendance && response.data.attendance.records) {
        setAttendance(response.data.attendance.records);
        
        // Calculate stats
        const records = response.data.attendance.records;
        const present = Array.isArray(records) ? records.filter(a => a.status === 'present').length : 0;
        const absent = Array.isArray(records) ? records.filter(a => a.status === 'absent').length : 0;
        const late = Array.isArray(records) ? records.filter(a => a.status === 'late').length : 0;
        const total = present + absent + late;
        
        setStats({
          present,
          absent,
          late,
          attendanceRate: total > 0 ? (present / total) * 100 : 0
        });
      } else {
        // Handle old response format or unexpected structure
        console.warn('Unexpected response format:', response.data);
        const data = Array.isArray(response.data) ? response.data : [];
        setAttendance(data);
        
        // Calculate stats with fallback
        const present = Array.isArray(data) ? data.filter(a => a.status === 'present').length : 0;
        const absent = Array.isArray(data) ? data.filter(a => a.status === 'absent').length : 0;
        const late = Array.isArray(data) ? data.filter(a => a.status === 'late').length : 0;
        const total = present + absent + late;
        
        setStats({
          present,
          absent,
          late,
          attendanceRate: total > 0 ? (present / total) * 100 : 0
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to fetch attendance data');
      setLoading(false);
      
      // Set empty data on error
      setAttendance([]);
      setStats({
        present: 0,
        absent: 0,
        late: 0,
        attendanceRate: 0
      });
    }
  };

  const checkTodayAttendance = async () => {
    try {
      const response = await axios.get('/api/user/attendance/today');
      setTodayMarked(response.data.marked);
    } catch (error) {
      console.error('Error checking today\'s attendance:', error);
    }
  };

  const handleQRScan = async (qrCode) => {
    try {
      // Get current location
      let location = null;
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            });
          });
          
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
        } catch (locationError) {
          console.warn('Error getting location:', locationError);
          toast.warning('Could not get your location. Attendance may not be marked correctly.');
        }
      }
      
      // Process the QR code - could be JSON or raw sessionId
      let qrCodeData = qrCode;
      try {
        // Check if it's already a JSON string
        if (typeof qrCode === 'string') {
          JSON.parse(qrCode);
        }
      } catch (e) {
        // If it's not valid JSON, wrap it as sessionId
        qrCodeData = JSON.stringify({ sessionId: qrCode });
      }
      
      await axios.post('/api/user/attendance/mark', {
        qrCode: qrCodeData,
        method: 'qr',
        location
      });
      
      toast.success('Attendance marked successfully!');
      setTodayMarked(true);
      fetchAttendanceData();
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const handleLocationAttendance = async (location) => {
    try {
      await axios.post('/api/user/attendance/mark', {
        location,
        method: 'location'
      });
      
      toast.success('Attendance marked successfully!');
      setTodayMarked(true);
      fetchAttendanceData();
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Attendance</h1>
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-pink-500" />
          <span className="text-white">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {todayMarked ? (
        <div className="bg-green-500/20 text-green-500 p-4 rounded-lg flex items-center gap-3">
          <FaCheckCircle className="text-xl" />
          <p className="font-medium">You have already marked your attendance for today!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QRCodeScanner onScan={handleQRScan} />
          <LocationAttendance onMarkAttendance={handleLocationAttendance} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Present Days</h3>
          <p className="text-3xl font-bold text-green-500">{stats.present}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Absent Days</h3>
          <p className="text-3xl font-bold text-red-500">{stats.absent}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Late Days</h3>
          <p className="text-3xl font-bold text-yellow-500">{stats.late}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Attendance Rate</h3>
          <p className="text-3xl font-bold text-pink-500">{stats.attendanceRate.toFixed(1)}%</p>
        </div>
      </div>

      <Calendar attendance={attendance} />
    </div>
  );
}
