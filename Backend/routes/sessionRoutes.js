const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const QRCode = require('qrcode');
const { auth, authorize } = require('../middleware/auth');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const { body } = require('express-validator');

// Session validation middleware
const sessionValidation = {
  create: [
    body('name').notEmpty().trim(),
    body('type').notEmpty().trim(),
    body('description').optional().trim(),
    body('organization').notEmpty(),
    body('date').isDate(),
    body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('location.latitude').isFloat({ min: -90, max: 90 }),
    body('location.longitude').isFloat({ min: -180, max: 180 })
  ]
};

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
        description,
        date,
        startTime,
        endTime,
        organization,
        location
      } = req.body;

      // Generate QR code secret
      const secret = crypto.randomBytes(32).toString('hex');

      const session = new Session({
        organization,
        createdBy: req.user._id,
        name,
        type,
        description,
        date,
        startTime,
        endTime,
        location: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude],
          radius: location.radius || 100
        },
        qrCode: {
          secret,
          refreshInterval: 30
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
 * @route POST /api/sessions/:id/mark-attendance
 * @desc Mark attendance using QR code or location
 * @access Private
 */
router.post('/:id/mark-attendance',
  auth,
  async (req, res) => {
    try {
      const session = await Session.findById(req.params.id);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      // Check if attendance already marked
      const existingAttendance = await Attendance.findOne({
        user: req.user._id,
        session: session._id,
        markedAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      });

      if (existingAttendance) {
        return res.status(400).json({ message: 'Attendance already marked for today' });
      }

      let verificationMethod = 'manual';
      let isValid = false;

      // Handle QR code verification
      if (req.body.qrData) {
        verificationMethod = 'qr';
        const { sessionId, sessionCode, timestamp, signature } = JSON.parse(req.body.qrData);
        
        // Verify signature
        const expectedSignature = crypto
          .createHmac('sha256', process.env.JWT_SECRET)
          .update(JSON.stringify({ sessionId, sessionCode, timestamp }))
          .digest('hex');

        if (signature !== expectedSignature) {
          return res.status(400).json({ message: 'Invalid QR code' });
        }

        // Check if QR code is expired
        if (Date.now() - timestamp > (parseInt(process.env.QR_CODE_REFRESH_INTERVAL) || 30) * 1000) {
          return res.status(400).json({ message: 'QR code has expired' });
        }

        if (sessionId !== session.id || sessionCode !== session.sessionCode) {
          return res.status(400).json({ message: 'Invalid session code' });
        }

        isValid = true;
      }
      // Handle location-based verification
      else if (req.body.location) {
        verificationMethod = 'geo';
        const { latitude, longitude } = req.body.location;
        isValid = session.validateLocation(latitude, longitude);
        
        if (!isValid) {
          return res.status(400).json({ 
            message: 'Location is outside the allowed radius',
            allowedRadius: session.settings.locationRadius || 100
          });
        }
      } else {
        return res.status(400).json({ message: 'No verification method provided' });
      }

      if (!isValid) {
        return res.status(400).json({ message: 'Attendance verification failed' });
      }

      // Get user's device info
      const device = {
        type: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
        userAgent: req.headers['user-agent'],
        ip: req.ip
      };

      // Create attendance record
      const attendance = new Attendance({
        user: req.user._id,
        session: session._id,
        organization: session.organization,
        status: 'present',
        location: req.body.location ? {
          type: 'Point',
          coordinates: [req.body.location.longitude, req.body.location.latitude]
        } : undefined,
        device,
        verificationMethod,
        markedAt: new Date(),
        verifiedBy: req.user._id
      });

      // Update status based on session time
      const [hours, minutes] = session.startTime.split(':');
      const sessionStartTime = new Date();
      sessionStartTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      attendance.updateStatus(sessionStartTime);

      await attendance.save();

      // Return attendance details
      res.json({
        message: 'Attendance marked successfully',
        attendance: {
          id: attendance._id,
          status: attendance.status,
          markedAt: attendance.markedAt,
          verificationMethod: attendance.verificationMethod
        }
      });
    } catch (error) {
      console.error('Attendance marking error:', error);
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
      const { date } = req.query;
      const session = await Session.findById(req.params.id);
      
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      // Build query
      const query = {
        session: session._id
      };

      // Add date filter if provided
      if (date) {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        
        query.markedAt = {
          $gte: startDate,
          $lt: endDate
        };
      }

      // Get attendance records with user details
      const attendanceRecords = await Attendance
        .find(query)
        .populate('user', 'firstName lastName email')
        .sort({ markedAt: -1 });

      // Get statistics
      const stats = await Attendance.getStatistics(session.organization, session._id);

      res.json({
        attendance: attendanceRecords,
        statistics: stats
      });
    } catch (error) {
      console.error('Get attendance error:', error);
      res.status(500).json({ message: 'Error getting attendance records' });
    }
});

/**
 * @route GET /api/sessions/:id/statistics
 * @desc Get session statistics
 * @access Private (Admin)
 */
router.get('/:id/statistics',
  auth,
  authorize('admin'),
  async (req, res) => {
    try {
      const session = await Session.findById(req.params.id);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      const statistics = await Attendance.aggregate([
        {
          $match: {
            session: session._id
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const formattedStats = {
        present: 0,
        late: 0,
        absent: 0
      };

      statistics.forEach(stat => {
        formattedStats[stat._id] = stat.count;
      });

      res.json({ statistics: formattedStats });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({ message: 'Error getting statistics' });
    }
});

/**
 * @route GET /api/sessions/:id/qr
 * @desc Get QR code for a session
 * @access Private
 */
router.get('/:id/qr',
  auth,
  async (req, res) => {
    try {
      const session = await Session.findById(req.params.id);
      
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      // Check if user has access to this session
      if (session.organization) {
        const userOrg = req.user.organizations.find(
          org => org.organization.toString() === session.organization.toString()
        );
        
        if (!userOrg) {
          return res.status(403).json({ message: 'Access denied' });
        }
      }

      // Generate fresh QR code data
      const qrData = {
        sessionId: session._id,
        sessionCode: session.sessionCode,
        timestamp: Date.now(),
        expiresIn: parseInt(process.env.QR_CODE_REFRESH_INTERVAL) || 30, // seconds
        location: session.location,
        radius: parseInt(process.env.DEFAULT_LOCATION_RADIUS) || 100 // meters
      };

      // Sign the QR data
      const signature = crypto
        .createHmac('sha256', process.env.JWT_SECRET)
        .update(JSON.stringify(qrData))
        .digest('hex');

      qrData.signature = signature;

      // Generate QR code
      const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData), {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 400
      });

      res.json({
        sessionCode: session.sessionCode,
        qrCode: qrCodeImage,
        expiresIn: qrData.expiresIn,
        refreshInterval: parseInt(process.env.QR_CODE_REFRESH_INTERVAL) || 30
      });
    } catch (error) {
      console.error('QR code generation error:', error);
      res.status(500).json({ message: 'Error generating QR code' });
    }
});

module.exports = router;
