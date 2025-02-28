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
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!scanning) return;

    // Initialize scanner with improved configuration
    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
      aspectRatio: 1.0,
      showTorchButtonIfSupported: true,
      showZoomSliderIfSupported: true,
      defaultZoomValueIfSupported: 2,
    });

    // Start scanning
    scanner.render((decodedText) => {
      // Stop scanner
      scanner.clear();
      setScanning(false);
      setScanResult(decodedText);
      setProcessing(true);
      
      // Process the scan result
      try {
        // Log the QR code data for debugging
        console.log('QR Code scanned:', decodedText);
        
        // Try to parse the QR code data if it's JSON
        let parsedData;
        try {
          parsedData = JSON.parse(decodedText);
          console.log('Parsed QR data:', parsedData);
        } catch (parseError) {
          console.log('QR data is not JSON, using as raw string');
        }
        
        onScan(decodedText);
      } catch (error) {
        setScanError('Failed to process QR code. Please try again.');
        console.error('Error processing QR code:', error);
      } finally {
        setProcessing(false);
      }
    }, (error) => {
      console.warn('QR Scanner error:', error);
      // Only show user-friendly error messages
      if (typeof error === 'string') {
        setScanError(error);
      } else {
        setScanError('Scanner encountered an error. Please try again.');
      }
    });

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [scanning, onScan]);

  const resetScanner = () => {
    setScanResult(null);
    setScanError(null);
    setProcessing(false);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <FaQrcode className="text-[#ff0080]" />
        QR Code Scanner
      </h2>
      
      {scanResult && !processing ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-green-400 font-medium flex items-center gap-2">
              <FaCheckCircle />
              QR Code scanned successfully!
            </p>
          </div>
          <button
            onClick={() => {
              resetScanner();
              setScanning(true);
            }}
            className="w-full py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
          >
            <FaQrcode />
            Scan Another Code
          </button>
        </div>
      ) : scanError ? (
        <div className="space-y-4">
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400">Error: {scanError}</p>
          </div>
          <button
            onClick={() => {
              resetScanner();
              setScanning(true);
            }}
            className="w-full py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
          >
            <FaQrcode />
            Try Again
          </button>
        </div>
      ) : processing ? (
        <div className="space-y-4">
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
          <p className="text-center text-white">Processing QR code...</p>
        </div>
      ) : !scanning ? (
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
          <p className="text-sm text-gray-400 text-center">Position the QR code within the scanner frame</p>
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
      
      // Process the QR code data
      let qrCodeData;
      try {
        // First, check if it's already a valid JSON string
        if (typeof qrCode === 'string') {
          try {
            qrCodeData = JSON.parse(qrCode);
            console.log('QR code is valid JSON:', qrCodeData);
          } catch (e) {
            // If it's not valid JSON, try to extract data from it
            console.log('QR code is not valid JSON, treating as raw data');
            
            // Check if it might be a URL with parameters
            if (qrCode.includes('?') && qrCode.includes('=')) {
              try {
                const url = new URL(qrCode);
                const params = Object.fromEntries(url.searchParams);
                qrCodeData = params;
                console.log('Extracted parameters from URL:', qrCodeData);
              } catch (urlError) {
                // Not a valid URL, use as raw data
                qrCodeData = { data: qrCode };
              }
            } else {
              // Use as raw data
              qrCodeData = { data: qrCode };
            }
          }
        } else if (typeof qrCode === 'object') {
          // Already an object
          qrCodeData = qrCode;
        } else {
          // Fallback for any other type
          qrCodeData = { data: String(qrCode) };
        }
      } catch (parseError) {
        console.error('Error parsing QR code data:', parseError);
        qrCodeData = { data: String(qrCode) };
      }
      
      // Ensure qrCodeData is sent as a string to the API
      const payload = {
        qrCode: typeof qrCodeData === 'string' ? qrCodeData : JSON.stringify(qrCodeData),
        method: 'qr',
        location
      };
      
      console.log('Sending attendance payload:', payload);
      
      const response = await axios.post('/api/user/attendance/mark', payload);
      
      console.log('Attendance response:', response.data);
      
      toast.success('Attendance marked successfully!');
      setTodayMarked(true);
      fetchAttendanceData();
    } catch (error) {
      console.error('Error marking attendance:', error);
      const errorMessage = error.response?.data?.message || 'Failed to mark attendance';
      toast.error(errorMessage);
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
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-white mb-8">Attendance</h1>
      
      {todayMarked && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-green-400 font-medium flex items-center gap-2">
            <FaCheckCircle />
            Your attendance has already been marked for today!
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* QR Code Scanner - Placed first for emphasis */}
        <div className="md:col-span-3 mb-6">
          <div className="bg-gradient-to-r from-[#7928ca]/20 to-[#ff0080]/20 p-1 rounded-lg">
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <FaQrcode className="text-[#ff0080]" />
                Mark Attendance
              </h2>
              <p className="text-gray-400 mb-6">
                Scan the QR code provided by your organization to mark your attendance quickly and easily.
                {todayMarked && (
                  <span className="block mt-2 text-green-400">
                    Note: You have already marked your attendance for today, but you can still scan again if needed.
                  </span>
                )}
              </p>
              <QRCodeScanner onScan={handleQRScan} />
            </div>
          </div>
        </div>
        <LocationAttendance onMarkAttendance={handleLocationAttendance} />
        
        {/* Attendance Stats */}
        <div className="col-span-1 md:col-span-3">
          <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Attendance Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Present</p>
                <p className="text-white text-2xl font-bold">{stats.present}</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Absent</p>
                <p className="text-white text-2xl font-bold">{stats.absent}</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Late</p>
                <p className="text-white text-2xl font-bold">{stats.late}</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Attendance Rate</p>
                <p className="text-white text-2xl font-bold">{stats.attendanceRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Calendar */}
        <div className="col-span-1 md:col-span-3">
          <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Attendance Calendar</h2>
            <Calendar attendance={attendance} />
          </div>
        </div>
      </div>
    </div>
  );
}
