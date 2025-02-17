const express = require('express');
const router = express.Router();
const QRCode = require('../models/QRCode');
const { auth, authorizeOrganization } = require('../middleware/auth');
const qrcode = require('qrcode');
const crypto = require('crypto');

// Generate a new QR code for an organization
router.post('/generate/:organizationId', 
  auth, 
  authorizeOrganization('admin'),
  async (req, res) => {
    try {
      const {
        type = 'daily',
        validityHours = 24,
        location,
        settings = {}
      } = req.body;

      // Generate random data for QR code
      const randomData = crypto.randomBytes(32).toString('hex');
      const validFrom = new Date();
      const validUntil = new Date(validFrom.getTime() + validityHours * 60 * 60 * 1000);

      // Create QR code record
      const qrCode = new QRCode({
        organization: req.params.organizationId,
        generatedBy: req.user._id,
        data: randomData,
        type,
        validFrom,
        validUntil,
        location: location || undefined,
        settings
      });

      await qrCode.save();

      // Generate QR code image
      const qrImage = await qrcode.toDataURL(JSON.stringify({
        id: qrCode._id,
        data: randomData,
        org: req.params.organizationId
      }));

      res.json({
        message: 'QR code generated successfully',
        qrCode: {
          ...qrCode.toJSON(),
          qrImage
        }
      });
    } catch (error) {
      console.error('QR code generation error:', error);
      res.status(500).json({ message: 'Error generating QR code' });
    }
});

// Get QR codes for an organization
router.get('/organization/:organizationId',
  auth,
  authorizeOrganization('admin'),
  async (req, res) => {
    try {
      const { type, status, limit = 10, page = 1 } = req.query;
      const query = {
        organization: req.params.organizationId
      };

      if (type) query.type = type;
      if (status === 'active') {
        query.isActive = true;
        query.validUntil = { $gt: new Date() };
      }

      const qrCodes = await QRCode.find(query)
        .populate('generatedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await QRCode.countDocuments(query);

      res.json({
        qrCodes,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('QR code fetch error:', error);
      res.status(500).json({ message: 'Error fetching QR codes' });
    }
});

// Scan a QR code
router.post('/scan/:organizationId',
  auth,
  authorizeOrganization('member'),
  async (req, res) => {
    try {
      const { qrData, location } = req.body;
      
      if (!qrData) {
        return res.status(400).json({ message: 'QR code data is required' });
      }

      // Parse QR data
      const { id, data } = JSON.parse(qrData);

      // Find and validate QR code
      const qrCode = await QRCode.findOne({
        _id: id,
        data,
        organization: req.params.organizationId
      });

      if (!qrCode) {
        return res.status(404).json({ message: 'Invalid QR code' });
      }

      if (!qrCode.isValid()) {
        return res.status(400).json({ message: 'QR code has expired or reached maximum scans' });
      }

      // Check if user has already scanned (if multiple scans not allowed)
      if (!qrCode.settings.allowMultipleScans) {
        const existingScan = qrCode.scans.find(
          scan => scan.user.toString() === req.user._id.toString()
        );
        if (existingScan) {
          return res.status(400).json({ message: 'You have already scanned this QR code' });
        }
      }

      // Validate location if required
      let status = 'success';
      if (location && qrCode.location.coordinates[0] && qrCode.location.coordinates[1]) {
        const isWithinRadius = qrCode.isWithinRadius(location.latitude, location.longitude);
        if (!isWithinRadius) {
          status = 'outside_radius';
          return res.status(400).json({ message: 'You are not within the valid location radius' });
        }
      }

      // Record the scan
      qrCode.scans.push({
        user: req.user._id,
        location: location ? {
          type: 'Point',
          coordinates: [location.longitude, location.latitude]
        } : undefined,
        status
      });

      await qrCode.save();

      // Create attendance record
      const attendance = new Attendance({
        user: req.user._id,
        organization: req.params.organizationId,
        date: new Date(),
        checkIn: new Date(),
        status: 'present',
        marked_by: qrCode.generatedBy,
        qrCode: qrCode._id,
        location: location
      });

      await attendance.save();

      res.json({
        message: 'Attendance marked successfully',
        attendance
      });
    } catch (error) {
      console.error('QR code scan error:', error);
      res.status(500).json({ message: 'Error scanning QR code' });
    }
});

// Deactivate a QR code
router.post('/:id/deactivate',
  auth,
  async (req, res) => {
    try {
      const qrCode = await QRCode.findById(req.params.id);
      
      if (!qrCode) {
        return res.status(404).json({ message: 'QR code not found' });
      }

      // Check if user has permission
      if (!req.user.hasOrganizationPermission(qrCode.organization, 'admin')) {
        return res.status(403).json({ message: 'Access denied' });
      }

      qrCode.isActive = false;
      await qrCode.save();

      res.json({
        message: 'QR code deactivated successfully'
      });
    } catch (error) {
      console.error('QR code deactivation error:', error);
      res.status(500).json({ message: 'Error deactivating QR code' });
    }
});

module.exports = router;
