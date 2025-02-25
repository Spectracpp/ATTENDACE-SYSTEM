const express = require('express');
const router = express.Router();
const QRCode = require('../models/QRCode');
const Organization = require('../models/Organization');
const Attendance = require('../models/Attendance');
const { auth } = require('../middleware/auth');
const { qrCodeValidation } = require('../middleware/validate');
const { rateLimiter } = require('../middleware/rateLimiter');
const { calculateDistance } = require('../utils/location');
const qrcode = require('qrcode');
const crypto = require('crypto');

/**
 * @route POST /api/qr/generate/:organizationId
 * @desc Generate a new QR code for an organization
 * @access Private (Organization Admin/Owner)
 */
router.post('/generate/:organizationId',
  auth,
  qrCodeValidation.generate,
  async (req, res) => {
    try {
      const { organizationId } = req.params;
      const { type = 'daily', validityHours = 24, location, settings = {} } = req.body;

      // Get organization
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found'
        });
      }

      // Check if user has permission
      if (!organization.hasRole(req.user._id, 'admin')) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      // Generate random data for QR code
      const randomData = crypto.randomBytes(32).toString('hex');

      // Calculate validity period
      const validFrom = new Date();
      const validUntil = new Date(validFrom.getTime() + validityHours * 60 * 60 * 1000);

      // Create QR code
      const qrCode = new QRCode({
        organization: organizationId,
        createdBy: req.user._id,
        data: randomData,
        type,
        validFrom,
        validUntil,
        location: location ? {
          type: 'Point',
          coordinates: [location.longitude, location.latitude]
        } : undefined,
        settings: {
          maxScans: settings.maxScans || organization.settings?.maxQrScans || 1,
          allowMultipleScans: settings.allowMultipleScans || organization.settings?.allowMultipleScans || false,
          locationRadius: settings.locationRadius || organization.settings?.locationRadius || 100
        }
      });

      await qrCode.save();

      // Generate QR code image
      const qrData = JSON.stringify({
        id: qrCode._id,
        data: randomData,
        org: organizationId
      });

      const qrImage = await qrcode.toDataURL(qrData);

      res.json({
        success: true,
        message: 'QR code generated successfully',
        qrCode: {
          ...qrCode.toJSON(),
          qrImage
        }
      });
    } catch (error) {
      console.error('Generate QR code error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating QR code'
      });
    }
});

/**
 * @route POST /api/qr/scan/:organizationId
 * @desc Scan a QR code
 * @access Private (Organization Member)
 */
router.post('/scan/:organizationId',
  auth,
  qrCodeValidation.scan,
  async (req, res) => {
    try {
      const { organizationId } = req.params;
      const { qrData, location } = req.body;

      // Find and validate QR code
      const qrCode = await QRCode.findOne({
        organization: organizationId,
        data: qrData,
        validUntil: { $gt: new Date() },
        isActive: true
      });

      if (!qrCode) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired QR code'
        });
      }

      // Check if already marked attendance
      const existingAttendance = await Attendance.findOne({
        user: req.user._id,
        qrCode: qrCode._id,
        createdAt: {
          $gte: qrCode.validFrom,
          $lte: qrCode.validUntil
        }
      });

      if (existingAttendance && !qrCode.settings.allowMultipleScans) {
        return res.status(400).json({
          success: false,
          message: 'Attendance already marked for this session'
        });
      }

      // Verify location if required
      if (qrCode.location && location) {
        const distance = calculateDistance(
          qrCode.location.coordinates[1],
          qrCode.location.coordinates[0],
          location.latitude,
          location.longitude
        );

        if (distance > qrCode.settings.locationRadius) {
          return res.status(400).json({
            success: false,
            message: 'You are too far from the attendance location'
          });
        }
      }

      // Record attendance
      const attendance = new Attendance({
        user: req.user._id,
        organization: organizationId,
        qrCode: qrCode._id,
        location: location ? {
          type: 'Point',
          coordinates: [location.longitude, location.latitude]
        } : undefined,
        type: qrCode.type
      });

      await attendance.save();

      res.json({
        success: true,
        message: 'Attendance marked successfully',
        attendance: attendance.toJSON()
      });
    } catch (error) {
      console.error('Error scanning QR code:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
});

/**
 * @route GET /api/qr/organization/:organizationId
 * @desc Get QR codes for an organization
 * @access Private (Organization Admin)
 */
router.get('/organization/:organizationId',
  auth,
  async (req, res) => {
    try {
      const { organizationId } = req.params;
      const { type, status, limit = 10, page = 1 } = req.query;

      // Validate organization access
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found'
        });
      }

      if (!organization.hasRole(req.user._id, 'admin')) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      const query = { organization: organizationId };

      if (type) query.type = type;
      if (status === 'active') {
        query.isActive = true;
        query.validUntil = { $gt: new Date() };
      }

      const qrCodes = await QRCode.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await QRCode.countDocuments(query);

      res.json({
        success: true,
        qrCodes,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('QR code fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching QR codes'
      });
    }
});

/**
 * @route POST /api/qr/:id/deactivate
 * @desc Deactivate a QR code
 * @access Private (Organization Admin)
 */
router.post('/:id/deactivate',
  auth,
  async (req, res) => {
    try {
      const qrCode = await QRCode.findById(req.params.id);
      
      if (!qrCode) {
        return res.status(404).json({
          success: false,
          message: 'QR code not found'
        });
      }

      // Get organization to check permissions
      const organization = await Organization.findById(qrCode.organization);
      if (!organization) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found'
        });
      }

      // Check if user has permission
      if (!organization.hasRole(req.user._id, 'admin')) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      qrCode.isActive = false;
      await qrCode.save();

      res.json({
        success: true,
        message: 'QR code deactivated successfully',
        qrCode: qrCode.toJSON()
      });
    } catch (error) {
      console.error('QR code deactivation error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deactivating QR code'
      });
    }
});

module.exports = router;
