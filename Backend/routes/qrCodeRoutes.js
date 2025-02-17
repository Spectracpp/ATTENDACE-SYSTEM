const express = require('express');
const router = express.Router();
const QRCode = require('../models/QRCode');
const Organization = require('../models/Organization');
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
        return res.status(404).json({ message: 'Organization not found' });
      }

      // Check if user has permission
      if (!organization.hasRole(req.user._id, 'admin')) {
        return res.status(403).json({ message: 'Insufficient permissions' });
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
        location: location || undefined,
        settings: {
          ...settings,
          maxScans: settings?.maxScans || organization.settings.maxQrScans,
          allowMultipleScans: settings?.allowMultipleScans || organization.settings.allowMultipleScans,
          locationRadius: settings?.locationRadius || organization.settings.locationRadius
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
        message: 'QR code generated successfully',
        qrCode: {
          ...qrCode.toJSON(),
          qrImage
        }
      });
    } catch (error) {
      console.error('Generate QR code error:', error);
      res.status(500).json({ message: 'Error generating QR code' });
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

      // Parse QR data
      const qrInfo = JSON.parse(qrData);
      
      // Get organization
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      // Check if user has permission
      if (!organization.hasRole(req.user._id, 'member')) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      // Get QR code
      const qrCode = await QRCode.findById(qrInfo.id);
      if (!qrCode) {
        return res.status(404).json({ message: 'QR code not found' });
      }

      // Verify QR code belongs to organization
      if (qrCode.organization.toString() !== organizationId) {
        return res.status(400).json({ message: 'Invalid QR code for this organization' });
      }

      // Check if QR code is expired
      if (qrCode.isExpired()) {
        return res.status(400).json({ message: 'QR code has expired' });
      }

      // Check if user has already scanned
      if (!qrCode.settings.allowMultipleScans && qrCode.hasUserScanned(req.user._id)) {
        return res.status(400).json({ message: 'You have already scanned this QR code' });
      }

      // Check if max scans reached
      if (qrCode.hasReachedMaxScans()) {
        return res.status(400).json({ message: 'Maximum scan limit reached' });
      }

      // Verify location if required
      if (qrCode.location && location) {
        const distance = calculateDistance(
          qrCode.location.coordinates[1],
          qrCode.location.coordinates[0],
          location.coordinates[1],
          location.coordinates[0]
        );

        if (distance > qrCode.settings.locationRadius) {
          return res.status(400).json({ 
            message: 'You are too far from the QR code location',
            distance,
            maxDistance: qrCode.settings.locationRadius
          });
        }
      }

      // Add scan
      await qrCode.addScan(req.user._id, location);

      res.json({
        message: 'QR code scanned successfully',
        scan: qrCode.scans[qrCode.scans.length - 1]
      });
    } catch (error) {
      console.error('Scan QR code error:', error);
      res.status(500).json({ message: 'Error scanning QR code' });
    }
});

// Get QR codes for an organization
router.get('/organization/:organizationId',
  auth,
  async (req, res) => {
    try {
      const { organizationId } = req.params;
      const { type, status, limit = 10, page = 1 } = req.query;
      const query = {
        organization: organizationId
      };

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
