const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Organization = require('../models/Organization');
const QRSession = require('../models/QRSession');
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');

/**
 * @route GET /api/user/attendance
 * @desc Get user's attendance for a specific month
 * @access Private
 */
router.get('/attendance', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = req.user._id;

    // Create date range for the specified month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const attendanceRecords = await Attendance.find({
      user: userId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 }).populate('organization', 'name');

    res.json(attendanceRecords);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance data'
    });
  }
});

/**
 * @route GET /api/user/attendance/today
 * @desc Check if user has marked attendance today
 * @access Private
 */
router.get('/attendance/today', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const marked = await Attendance.hasMarkedToday(userId);

    res.json({
      success: true,
      marked
    });
  } catch (error) {
    console.error('Error checking today\'s attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking attendance status'
    });
  }
});

/**
 * @route POST /api/user/attendance/mark
 * @desc Mark attendance via QR code
 * @access Private
 */
router.post('/mark', auth, async (req, res) => {
  try {
    const { qrCode, method, location } = req.body;
    const userId = req.user._id;

    // Parse QR code data
    let sessionId;
    try {
      // Try to parse as JSON first
      const parsedQR = typeof qrCode === 'string' ? JSON.parse(qrCode) : qrCode;
      sessionId = parsedQR.sessionId;
    } catch (error) {
      // If not JSON, use the raw string as sessionId
      sessionId = qrCode;
    }

    if (!sessionId) {
      return res.status(400).json({ message: 'Invalid QR code format' });
    }

    // Find the QR session
    const qrSession = await QRSession.findOne({ sessionId }).populate('organization');
    
    if (!qrSession) {
      return res.status(404).json({ message: 'QR session not found' });
    }

    // Check if session is active
    if (qrSession.status !== 'active' || qrSession.isExpired()) {
      return res.status(400).json({ message: 'QR code has expired' });
    }

    // Check if user is a member of the organization
    const isMember = await OrganizationMember.findOne({
      organization: qrSession.organization._id,
      user: userId,
      status: 'active'
    });

    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this organization' });
    }

    // Check if user has already marked attendance for this session
    const existingAttendance = await Attendance.findOne({
      user: userId,
      qrSession: qrSession._id,
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    // If multiple scans are not allowed and user has already marked attendance
    if (existingAttendance && !qrSession.settings.allowMultipleScans) {
      return res.status(400).json({ message: 'You have already marked attendance for today' });
    }

    // Validate location if required
    if (qrSession.settings.requireLocation && location) {
      const isLocationValid = qrSession.isLocationValid(
        location.latitude,
        location.longitude
      );

      if (!isLocationValid) {
        return res.status(400).json({ message: 'You are not in the required location' });
      }
    }

    // Create new attendance record
    const attendance = new Attendance({
      user: userId,
      organization: qrSession.organization._id,
      qrSession: qrSession._id,
      method,
      location: location ? {
        coordinates: {
          latitude: location.latitude,
          longitude: location.longitude
        }
      } : undefined,
      date: new Date()
    });

    await attendance.save();

    // Update QR session stats
    qrSession.stats.totalScans = (qrSession.stats.totalScans || 0) + 1;
    if (!existingAttendance) {
      qrSession.stats.uniqueScans = (qrSession.stats.uniqueScans || 0) + 1;
    }
    qrSession.stats.lastScanAt = new Date();
    await qrSession.save();

    res.json({
      success: true,
      message: 'Attendance marked successfully',
      attendance: {
        id: attendance._id,
        date: attendance.date,
        organization: {
          id: qrSession.organization._id,
          name: qrSession.organization.name
        }
      }
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error marking attendance' 
    });
  }
});

/**
 * @route GET /api/user/stats
 * @desc Get user's attendance statistics
 * @access Private
 */
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get start of week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    // Get end of week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Get start of month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Get end of month
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Check if user has marked attendance today
    const todayAttendance = await Attendance.findOne({
      user: userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    // Get weekly attendance count
    const weeklyAttendance = await Attendance.countDocuments({
      user: userId,
      date: {
        $gte: startOfWeek,
        $lte: endOfWeek
      },
      status: 'present'
    });

    // Get monthly attendance count
    const monthlyAttendance = await Attendance.countDocuments({
      user: userId,
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth
      },
      status: 'present'
    });

    // Get pending leaves count
    const pendingLeaves = 0; // This will be implemented in the leaves route

    res.json({
      success: true,
      todayStatus: todayAttendance ? todayAttendance.status : 'absent',
      weeklyAttendance,
      monthlyAttendance,
      pendingLeaves
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics'
    });
  }
});

/**
 * @route GET /api/user/activity
 * @desc Get user's recent activity
 * @access Private
 */
router.get('/activity', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get recent attendance records
    const recentAttendance = await Attendance.find({
      user: userId
    })
    .sort({ date: -1 })
    .limit(10)
    .populate('organization', 'name')
    .lean();

    const activity = recentAttendance.map(record => ({
      _id: record._id,
      type: 'attendance',
      date: record.date,
      organization: record.organization ? record.organization.name : 'Unknown',
      status: record.status,
      checkInTime: record.checkInTime,
      checkOutTime: record.checkOutTime
    }));

    res.json(activity);
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user activity'
    });
  }
});

module.exports = router;
