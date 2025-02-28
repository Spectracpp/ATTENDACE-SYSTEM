const express = require("express");
const router = express.Router();
const QRCode = require("../models/QRCode");
const Organization = require("../models/Organization");
const Attendance = require("../models/Attendance");
const { auth } = require("../middleware/auth");
const { qrCodeValidation } = require("../middleware/validate");
const { rateLimiter } = require("../middleware/rateLimiter");
const { getDistanceBetweenCoordinates } = require("../utils/location");
const qrcode = require("qrcode");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { createCanvas } = require("canvas");

// Get all QR codes for user's organizations
router.get("/", auth, async (req, res) => {
  try {
    // Get organizations where user is a member
    const organizations = await Organization.find({ 
      'members.user': req.user._id 
    }).select('_id');

    const qrCodes = await QRCode.find({
      organization: { $in: organizations.map(org => org._id) }
    })
    .populate('organization', 'name')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .lean();

    res.json({
      success: true,
      qrCodes: qrCodes.map(qr => ({
        ...qr,
        organization: qr.organization?.name || 'Unknown',
        createdBy: qr.createdBy?.name || 'Unknown'
      }))
    });
  } catch (error) {
    console.error('List QR codes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching QR codes'
    });
  }
});

// Generate QR code
router.post("/generate/:organizationId", auth, async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { 
      validityHours = 24, 
      type = 'attendance',
      allowMultipleScans = false,
      location,
      settings = {}
    } = req.body;

    // Validate organization ID
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid organization ID',
        error: true
      });
    }

    // Check if organization exists and user has access
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ 
        success: false, 
        message: 'Organization not found',
        error: true 
      });
    }

    // Verify user's permission to generate QR code for this organization
    const isMember = organization.members.some(member => 
      member.user.equals(req.user._id) && 
      ['admin', 'owner'].includes(member.role)
    );

    if (!isMember && !req.user.roles.includes('admin')) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to generate QR codes for this organization',
        error: true
      });
    }

    // Generate random data for the QR code
    const randomData = crypto.randomBytes(16).toString('hex');
    
    // Calculate validity period
    const validFrom = new Date();
    const validUntil = new Date();
    validUntil.setHours(validUntil.getHours() + validityHours);

    // Create a new QR code record
    const qrCode = new QRCode({
      organization: organizationId,
      createdBy: req.user._id,
      data: randomData,
      type,
      validFrom,
      validUntil,
      allowMultipleScans,
      location,
      settings: {
        locationRadius: settings.locationRadius || 100,
        maxScans: settings.maxScans || (allowMultipleScans ? 0 : 1),
        ...settings
      }
    });

    // Generate QR code image
    try {
      // Create a canvas for the QR code
      const canvas = createCanvas(256, 256);
      
      // Generate QR code data
      const qrData = JSON.stringify({
        id: qrCode._id,
        data: randomData,
        org: organizationId
      });
      
      // Draw QR code on canvas
      await qrcode.toCanvas(canvas, qrData, {
        errorCorrectionLevel: 'H',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      // Convert canvas to data URL
      const qrImage = canvas.toDataURL('image/png');
      qrCode.qrImage = qrImage;
      
    } catch (qrError) {
      console.error('Error generating QR code image:', qrError);
      // Continue without the image, the frontend will handle it
    }

    // Save the QR code record
    await qrCode.save();

    // Populate creator's name for the response
    await qrCode.populate('createdBy', 'name email');
    
    // Return success response
    return res.status(201).json({
      success: true,
      message: 'QR code generated successfully',
      qrCode
    });

  } catch (error) {
    console.error('Error generating QR code:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while generating the QR code',
      error: true
    });
  }
});

/**
 * Scan a QR code
 */
router.post("/scan", auth, async (req, res) => {
  try {
    const { qrData, location, deviceInfo } = req.body;
    
    // Parse QR data
    let parsedData;
    try {
      parsedData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code format',
        error: true
      });
    }
    
    if (!parsedData || !parsedData.id || !parsedData.data) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code data',
        error: true
      });
    }
    
    // Find the QR code
    const qrCode = await QRCode.findById(parsedData.id);
    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found',
        error: true
      });
    }
    
    // Verify QR code data
    if (qrCode.data !== parsedData.data) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code data',
        error: true
      });
    }
    
    // Check if QR code is still valid
    const now = new Date();
    if (now > new Date(qrCode.validUntil)) {
      return res.status(400).json({
        success: false,
        message: 'QR code has expired',
        error: 'expired'
      });
    }
    
    // Check if QR code has already been scanned and doesn't allow multiple scans
    if (!qrCode.allowMultipleScans) {
      const existingAttendance = await Attendance.findOne({
        qrCode: qrCode._id,
        user: req.user._id
      });
      
      if (existingAttendance) {
        return res.status(400).json({
          success: false,
          message: 'This QR code has already been scanned',
          error: 'already_scanned'
        });
      }
    }
    
    // Check location if QR code has location restrictions
    if (qrCode.location && qrCode.location.coordinates && location && location.coordinates) {
      const qrLat = qrCode.location.coordinates[1];
      const qrLng = qrCode.location.coordinates[0];
      const scanLat = location.coordinates[1];
      const scanLng = location.coordinates[0];
      
      const distance = getDistanceBetweenCoordinates(qrLat, qrLng, scanLat, scanLng);
      
      if (distance > qrCode.settings.locationRadius) {
        // Record the scan attempt with failure status
        const attendance = new Attendance({
          user: req.user._id,
          qrCode: qrCode._id,
          organization: qrCode.organization,
          date: new Date(),
          status: 'failed',
          failureReason: 'location_mismatch',
          location: location,
          deviceInfo: deviceInfo || 'Unknown device',
          metadata: {
            distance: Math.round(distance),
            allowedRadius: qrCode.settings.locationRadius
          }
        });
        
        await attendance.save();
        
        return res.status(400).json({
          success: false,
          message: `Location verification failed. You are ${Math.round(distance)}m away from the required location (max allowed: ${qrCode.settings.locationRadius}m).`,
          error: 'location_mismatch',
          distance: Math.round(distance),
          allowedRadius: qrCode.settings.locationRadius
        });
      }
    }
    
    // Record attendance
    const attendance = new Attendance({
      user: req.user._id,
      qrCode: qrCode._id,
      organization: qrCode.organization,
      date: new Date(),
      status: 'success',
      location: location,
      deviceInfo: deviceInfo || 'Unknown device'
    });
    
    await attendance.save();
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'QR code scanned successfully',
      attendance: {
        _id: attendance._id,
        date: attendance.date,
        status: attendance.status
      }
    });
    
  } catch (error) {
    console.error('Error scanning QR code:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while scanning the QR code',
      error: true
    });
  }
});

/**
 * Get scan history for a QR code
 */
router.get("/scan-history/:qrCodeId", auth, async (req, res) => {
  try {
    const { qrCodeId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(qrCodeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code ID',
        error: true
      });
    }
    
    // Find the QR code
    const qrCode = await QRCode.findById(qrCodeId).populate('organization');
    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found',
        error: true
      });
    }
    
    // Check if user has access to this QR code's organization
    const isMember = qrCode.organization.members.some(member => 
      member.user.equals(req.user._id)
    );
    
    if (!isMember && !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this QR code',
        error: true
      });
    }
    
    // Get scan history
    const scanHistory = await Attendance.find({ qrCode: qrCodeId })
      .populate('user', 'name email profilePicture')
      .sort({ date: -1 })
      .lean();
    
    // Format and return scan history
    return res.status(200).json({
      success: true,
      scanHistory: scanHistory.map(scan => ({
        ...scan,
        user: {
          name: scan.user?.name || 'Unknown user',
          email: scan.user?.email || '',
          profilePicture: scan.user?.profilePicture || ''
        },
        browser: extractBrowser(scan.deviceInfo),
        device: scan.deviceInfo ? (
          scan.deviceInfo.includes('Mobile') ? 'mobile' :
          scan.deviceInfo.includes('Tablet') ? 'tablet' : 'desktop'
        ) : 'unknown'
      }))
    });
    
  } catch (error) {
    console.error('Error getting scan history:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while getting the scan history',
      error: true
    });
  }
});

/**
 * Extract browser information from device info string
 */
function extractBrowser(deviceInfo) {
  if (!deviceInfo) return 'Unknown';
  
  // Extract browser name and version
  const browserRegex = /(Chrome|Firefox|Safari|Edge|Opera|MSIE|Trident)\/?\s*(\d+(\.\d+)*)/i;
  const match = deviceInfo.match(browserRegex);
  
  if (match) {
    const browser = match[1];
    const version = match[2];
    
    // Handle special case for IE
    if (browser === 'Trident' || browser === 'MSIE') {
      return `Internet Explorer ${version}`;
    }
    
    return `${browser} ${version}`;
  }
  
  return 'Unknown browser';
}

module.exports = router;
