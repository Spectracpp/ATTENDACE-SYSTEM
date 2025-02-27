const express = require('express');
const router = express.Router();
const QRSession = require('../models/QRSession');
const Organization = require('../models/Organization');
const Attendance = require('../models/Attendance');
const { auth, authorize, authorizeOrg } = require('../middleware/auth');
const { qrSessionValidation, attendanceValidation } = require('../middleware/validate');
const qr = require('qrcode');
const { rateLimiter } = require('../middleware/rateLimiter');

/**
 * @route POST /api/qr/generate
 * @desc Generate a new QR code session (Admin only)
 * @access Private
 */
router.post('/generate',
  auth,
  authorize('admin', 'super_admin'),
  authorizeOrg('admin'),
  qrSessionValidation.create,
  rateLimiter,
  async (req, res) => {
    try {
      const { organization: orgId, type, location, metadata, settings, allowMultipleScans } = req.body;

      // Get organization settings
      const organization = await Organization.findById(orgId);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      // Create QR session
      const qrSession = new QRSession({
        sessionId: require('crypto').randomBytes(16).toString('hex'),
        organization: orgId,
        createdBy: req.user._id,
        type: type || 'attendance',
        expiresAt: new Date(Date.now() + (organization.settings.qrCodeExpiry * 60 * 60 * 1000)), // Convert hours to milliseconds
        location,
        metadata,
        settings: {
          ...organization.settings,
          ...settings,
          allowMultipleScans: allowMultipleScans || false
        },
        status: 'active'
      });

      await qrSession.save();

      // Generate QR code
      const qrData = {
        sessionId: qrSession.sessionId,
        type: qrSession.type,
        timestamp: new Date().toISOString()
      };

      const qrImage = await qr.toDataURL(JSON.stringify(qrData));

      res.json({
        success: true,
        message: "QR session created successfully",
        qrCode: {
          id: qrSession._id,
          sessionId: qrSession.sessionId,
          imageUrl: qrImage,
          expiresAt: qrSession.expiresAt,
          status: qrSession.status,
          allowMultipleScans: qrSession.settings.allowMultipleScans,
          type: qrSession.type,
          organization: {
            id: organization._id,
            name: organization.name
          }
        }
      });

    } catch (error) {
      console.error('Error generating QR session:', error);
      res.status(500).json({ 
        success: false,
        message: "Error generating QR session" 
      });
    }
  });

/**
 * @route POST /api/qr/scan
 * @desc Scan a QR code and mark attendance
 * @access Private
 */
router.post('/scan',
  auth,
  qrSessionValidation.scan,
  rateLimiter,
  async (req, res) => {
    try {
      const { sessionId, location } = req.body;

      // Find active QR session
      const qrSession = await QRSession.findOne({ 
        sessionId,
        status: 'active'
      });

      if (!qrSession) {
        return res.status(404).json({ message: "Invalid or expired QR session" });
      }

      // Check if session is expired
      if (qrSession.isExpired()) {
        qrSession.status = 'expired';
        await qrSession.save();
        return res.status(400).json({ message: "QR session has expired" });
      }

      // Verify user belongs to organization
      const userOrg = req.user.organizations.find(
        org => org.organization.toString() === qrSession.organization.toString()
      );

      if (!userOrg) {
        return res.status(403).json({ message: "You don't belong to this organization" });
      }

      // Check location if required
      if (qrSession.settings.requireLocation) {
        if (!location?.coordinates) {
          return res.status(400).json({ message: "Location is required" });
        }

        const isLocationValid = qrSession.isLocationValid(
          location.coordinates.latitude,
          location.coordinates.longitude
        );

        if (!isLocationValid) {
          return res.status(400).json({ message: "You are not in the valid location" });
        }
      }

      // Check for existing attendance
      if (!qrSession.settings.allowMultipleScans) {
        const existingAttendance = await Attendance.findOne({
          user: req.user._id,
          qrSession: qrSession._id
        });

        if (existingAttendance) {
          return res.status(400).json({ message: "Attendance already marked" });
        }
      }

      // Mark attendance
      const attendance = new Attendance({
        user: req.user._id,
        organization: qrSession.organization,
        qrSession: qrSession._id,
        scanTime: new Date(),
        location,
        device: {
          type: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
          browser: req.headers['user-agent'],
          ip: req.ip
        }
      });

      await attendance.save();

      // Update QR session stats
      qrSession.stats.totalScans += 1;
      qrSession.stats.uniqueScans = await Attendance.countDocuments({
        qrSession: qrSession._id
      });
      qrSession.stats.lastScanAt = new Date();
      await qrSession.save();

      res.json({
        message: "Attendance marked successfully",
        attendance: {
          id: attendance._id,
          status: attendance.status,
          scanTime: attendance.scanTime
        }
      });

    } catch (error) {
      console.error('Error scanning QR code:', error);
      res.status(500).json({ message: "Error processing QR code scan" });
    }
});

/**
 * @route GET /api/qr/sessions
 * @desc Get QR sessions for an organization (Admin only)
 * @access Private
 */
router.get('/sessions',
  auth,
  authorize('admin', 'super_admin'),
  authorizeOrg('admin'),
  async (req, res) => {
    try {
      const { organization_id } = req.params;
      const { status, type, page = 1, limit = 10 } = req.query;

      const query = {
        organization: organization_id
      };

      if (status) query.status = status;
      if (type) query.type = type;

      const sessions = await QRSession.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('createdBy', 'name email')
        .lean();

      const total = await QRSession.countDocuments(query);

      res.json({
        sessions,
        pagination: {
          total,
          page: parseInt(page),
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching QR sessions:', error);
      res.status(500).json({ message: 'Error fetching QR sessions' });
    }
  }
);

/**
 * @route GET /api/qr/stats
 * @desc Get QR session statistics (Admin only)
 * @access Private
 */
router.get('/stats',
  auth,
  authorize('admin', 'super_admin'),
  authorizeOrg('admin'),
  async (req, res) => {
    try {
      const { organization_id } = req.params;
      const { startDate, endDate } = req.query;

      const stats = await Attendance.getStats(
        organization_id,
        startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate ? new Date(endDate) : new Date()
      );

      res.json({ stats });

    } catch (error) {
      console.error('Error fetching QR stats:', error);
      res.status(500).json({ message: "Error fetching QR statistics" });
    }
});

module.exports = router;
