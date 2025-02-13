const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const QRCode = require('qrcode');
const { auth, authorize } = require('../middleware/auth');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const { sessionValidation } = require('../middleware/validate');

/**
 * @route POST /api/sessions
 * @desc Create a new attendance session
 * @access Private (Admin)
 */
router.post('/',
  auth,
  authorize('admin'),
  sessionValidation.create,
  async (req, res) => {
    try {
      const {
        name,
        type,
        location,
        startTime,
        endTime,
        settings
      } = req.body;

      // Generate QR code secret
      const secret = crypto.randomBytes(32).toString('hex');

      const session = new Session({
        organization: req.user.organization,
        createdBy: req.user._id,
        name,
        type,
        location: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude],
          radius: location.radius || 100
        },
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        settings,
        qrCode: {
          secret,
          refreshInterval: settings?.qrRefreshInterval || 30
        }
      });

      await session.save();

      // Generate initial QR code
      const qrData = session.generateQRData();
      const qrCode = await QRCode.toDataURL(qrData);

      res.status(201).json({
        message: 'Session created successfully',
        session,
        qrCode
      });
    } catch (error) {
      console.error('Create session error:', error);
      res.status(500).json({ message: 'Error creating session' });
    }
});

/**
 * @route GET /api/sessions/:id/qr
 * @desc Get current QR code for session
 * @access Private (Admin)
 */
router.get('/:id/qr',
  auth,
  authorize('admin'),
  async (req, res) => {
    try {
      const session = await Session.findOne({
        _id: req.params.id,
        organization: req.user.organization
      });

      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      if (session.status === 'ended' || session.status === 'cancelled') {
        return res.status(400).json({ message: 'Session has ended' });
      }

      const qrData = session.generateQRData();
      const qrCode = await QRCode.toDataURL(qrData);

      res.json({ qrCode });
    } catch (error) {
      console.error('Get QR code error:', error);
      res.status(500).json({ message: 'Error generating QR code' });
    }
});

/**
 * @route POST /api/sessions/:id/mark-attendance
 * @desc Mark attendance for a session
 * @access Private
 */
router.post('/:id/mark-attendance',
  auth,
  sessionValidation.markAttendance,
  async (req, res) => {
    try {
      const { location, device } = req.body;
      const session = await Session.findOne({
        _id: req.params.id,
        organization: req.user.organization
      });

      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      if (!session.isActive()) {
        return res.status(400).json({ message: 'Session is not active' });
      }

      // Validate location if required
      if (session.settings.requireLocation && location) {
        const isValidLocation = session.validateLocation(
          location.latitude,
          location.longitude
        );

        if (!isValidLocation) {
          return res.status(400).json({ message: 'Location is out of range' });
        }
      }

      // Check for existing attendance
      const existingAttendance = await Attendance.findOne({
        user: req.user._id,
        session: session._id
      });

      if (existingAttendance) {
        return res.status(400).json({ message: 'Attendance already marked' });
      }

      // Create attendance record
      const attendance = new Attendance({
        user: req.user._id,
        session: session._id,
        organization: session.organization,
        location: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude]
        },
        device: {
          type: device.type,
          userAgent: device.userAgent,
          ip: req.ip,
          deviceId: device.deviceId
        }
      });

      // Update status based on time
      attendance.updateStatus(session.startTime);
      await attendance.save();

      res.json({
        message: 'Attendance marked successfully',
        attendance
      });
    } catch (error) {
      console.error('Mark attendance error:', error);
      res.status(500).json({ message: 'Error marking attendance' });
    }
});

/**
 * @route GET /api/sessions/:id/attendance
 * @desc Get attendance records for a session
 * @access Private (Admin)
 */
router.get('/:id/attendance',
  auth,
  authorize('admin'),
  async (req, res) => {
    try {
      const session = await Session.findOne({
        _id: req.params.id,
        organization: req.user.organization
      });

      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const attendance = await Attendance
        .find({ session: session._id })
        .populate('user', 'firstName lastName email')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Attendance.countDocuments({ session: session._id });

      res.json({
        attendance,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get attendance error:', error);
      res.status(500).json({ message: 'Error fetching attendance' });
    }
});

/**
 * @route GET /api/sessions/:id/statistics
 * @desc Get attendance statistics for a session
 * @access Private (Admin)
 */
router.get('/:id/statistics',
  auth,
  authorize('admin'),
  async (req, res) => {
    try {
      const session = await Session.findOne({
        _id: req.params.id,
        organization: req.user.organization
      });

      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      const statistics = await Attendance.getStatistics(
        session.organization,
        session._id
      );

      res.json({ statistics });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({ message: 'Error fetching statistics' });
    }
});

module.exports = router;
