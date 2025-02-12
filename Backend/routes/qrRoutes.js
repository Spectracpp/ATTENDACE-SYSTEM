const express = require("express");
const router = express.Router();
const QRCode = require("../models/QRCode");
const Organization = require("../models/Organization");
const Attendance = require("../models/Attendance");
const auth = require("../middleware/auth");
const { qrGenerationLimiter } = require("../middleware/rateLimiter");
const { validateQrGeneration, validateQrScan } = require("../utils/validation");
const qr = require("qrcode");

// Generate QR Code (User only)
router.post("/generate", auth, qrGenerationLimiter, async (req, res) => {
  console.log('QR Generate request received:', {
    body: req.body,
    user: req.user
  });

  try {
    const { user_id, organisation_uid } = req.body;

    if (!user_id || !organisation_uid) {
      console.log('Missing required fields:', req.body);
      return res.status(400).json({ 
        message: "Missing required fields", 
        required: ["user_id", "organisation_uid"],
        received: req.body 
      });
    }

    // Find or create organization
    let organization = await Organization.findOne({ uid: organisation_uid });
    
    if (!organization) {
      console.log('Creating default organization:', organisation_uid);
      organization = new Organization({
        uid: organisation_uid,
        name: "Default Organization",
        user_ids: [req.user._id], // Add current user
        admin_ids: [req.user._id] // Make current user an admin
      });
      await organization.save();
      console.log('Organization created:', organization);
    } else if (!organization.user_ids.includes(req.user._id)) {
      console.log('Adding user to organization:', req.user._id);
      organization.user_ids.push(req.user._id);
      await organization.save();
      console.log('User added to organization');
    }

    // Generate a unique QR code data
    const qrData = {
      user_id,
      organisation_uid,
      timestamp: new Date().toISOString(),
      nonce: Math.random().toString(36).substring(7)
    };

    // Convert QR data to string
    const qrString = JSON.stringify(qrData);
    console.log('Generated QR data:', qrString);

    // Generate QR code as base64
    const qrImage = await qr.toDataURL(qrString);
    console.log('QR image generated, length:', qrImage.length);

    // Remove the data:image/png;base64, prefix
    const base64Image = qrImage.split(',')[1];

    // Save QR code to database
    const newQRCode = new QRCode({
      user_id,
      organisation_uid,
      created_by: req.user._id,
      qr_data: qrString,
      expiry: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    });

    await newQRCode.save();
    console.log('QR code saved to database:', newQRCode._id);

    // Send response with base64 image
    res.json({
      message: "QR code generated successfully",
      qrImage: base64Image,
      expiry: newQRCode.expiry
    });

  } catch (error) {
    console.error("QR Generation error:", error);
    res.status(500).json({ message: "Error generating QR code", error: error.message });
  }
});

// Scan QR Code (Admin only)
router.post("/scan", auth, validateQrScan, async (req, res) => {
  console.log('QR Scan request received:', {
    body: req.body,
    user: req.user
  });

  try {
    if (req.userType !== "admin") {
      console.log('User is not an admin:', req.userType);
      return res.status(403).json({ message: "Only admins can scan QR codes" });
    }

    const { qrData } = req.body;

    if (!qrData) {
      console.log('Missing QR code data:', req.body);
      return res.status(400).json({ message: "QR code data is required" });
    }

    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (error) {
      console.log('Invalid QR code format:', qrData);
      return res.status(400).json({ message: "Invalid QR code format" });
    }

    const { code, user_id, organisation_uid } = parsedData;

    // Find the QR code
    const qrCode = await QRCode.findById(code);
    if (!qrCode) {
      console.log('QR code not found:', code);
      return res.status(404).json({ message: "QR code not found" });
    }

    // Verify QR code belongs to the user and organization
    if (qrCode.user_id !== user_id || qrCode.organisation_uid !== organisation_uid) {
      console.log('Invalid QR code data:', {
        qrCode: qrCode.user_id,
        user_id: user_id,
        organisation_uid: organisation_uid
      });
      return res.status(400).json({ message: "Invalid QR code data" });
    }

    // Check if QR code has expired (2 hours)
    const now = new Date();
    const qrCreationTime = new Date(qrCode.createdAt);
    if (now - qrCreationTime > 2 * 60 * 60 * 1000) {
      console.log('QR code has expired:', qrCode.createdAt);
      return res.status(400).json({ message: "QR code has expired" });
    }

    // Check if already marked present
    if (qrCode.present) {
      console.log('Attendance already marked:', qrCode.present);
      return res.status(400).json({ message: "Attendance already marked" });
    }

    // Mark attendance
    qrCode.present = true;
    qrCode.scanned_by = req.user._id;
    await qrCode.save();
    console.log('Attendance marked:', qrCode._id);

    // Create attendance record
    const attendance = new Attendance({
      user_id,
      organisation_uid,
      qr_code: qrCode._id,
      marked_by: req.user._id,
    });
    await attendance.save();
    console.log('Attendance record created:', attendance._id);

    res.json({ message: "Attendance marked successfully" });
  } catch (error) {
    console.error('QR Scan error:', error);
    res.status(500).json({ 
      message: "Error scanning QR code",
      error: error.message 
    });
  }
});

// Get attendance statistics (Admin only)
router.get("/stats/:organisation_uid", auth, async (req, res) => {
  console.log('Get attendance statistics request received:', {
    params: req.params,
    user: req.user
  });

  try {
    if (req.userType !== "admin") {
      console.log('User is not an admin:', req.userType);
      return res.status(403).json({ message: "Only admins can view statistics" });
    }

    const { organisation_uid } = req.params;
    const { startDate, endDate } = req.query;

    const query = {
      organisation_uid,
      attendance_date: {}
    };

    if (startDate) {
      query.attendance_date.$gte = new Date(startDate);
    }
    if (endDate) {
      query.attendance_date.$lte = new Date(endDate);
    }

    const stats = await QRCode.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$user_id",
          totalDays: { $count: {} },
          presentDays: {
            $sum: { $cond: ["$present", 1, 0] }
          },
          fullDays: {
            $sum: { $cond: [{ $eq: ["$attendance_type", "full"] }, 1, 0] }
          },
          halfDays: {
            $sum: { $cond: [{ $eq: ["$attendance_type", "half"] }, 1, 0] }
          }
        }
      }
    ]);

    console.log('Attendance statistics:', stats);
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching statistics" });
  }
});

// Get QR Code details
router.get("/:id", auth, async (req, res) => {
  console.log('Get QR Code details request received:', {
    params: req.params,
    user: req.user
  });

  try {
    const qrCode = await QRCode.findById(req.params.id)
      .populate("scanned_by", "name email -_id")
      .populate("created_by", "name email -_id");

    if (!qrCode) {
      console.log('QR code not found:', req.params.id);
      return res.status(404).json({ message: "QR code not found" });
    }

    // Validate organization membership
    const organization = await Organization.findOne({
      uid: qrCode.organisation_uid,
    });
    if (!organization) {
      console.log('Organization not found:', qrCode.organisation_uid);
      return res.status(404).json({ message: "Organization not found" });
    }

    const isMember =
      organization.admin_ids.includes(req.user._id) ||
      organization.user_ids.includes(req.user._id);

    if (!isMember) {
      console.log('User is not a member of the organization:', req.user._id);
      return res.status(403).json({ message: "Access denied" });
    }

    console.log('QR code details:', qrCode);
    res.json(qrCode);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching QR code",
      error: error.message,
    });
  }
});

// Get all QR codes for an organisation
router.get("/organisation/:uid", auth, async (req, res) => {
  console.log('Get all QR codes for an organisation request received:', {
    params: req.params,
    user: req.user
  });

  try {
    const organization = await Organization.findOne({ uid: req.params.uid });
    if (!organization) {
      console.log('Organization not found:', req.params.uid);
      return res.status(404).json({ message: "Organization not found" });
    }

    const isMember =
      organization.admin_ids.includes(req.user._id) ||
      organization.user_ids.includes(req.user._id);

    if (!isMember) {
      console.log('User is not a member of the organization:', req.user._id);
      return res.status(403).json({ message: "Access denied" });
    }

    const qrCodes = await QRCode.find({ organisation_uid: req.params.uid })
      .populate("scanned_by", "name email -_id")
      .populate("created_by", "name email -_id")
      .sort({ attendance_date: -1, createdAt: -1 });

    console.log('QR codes for organisation:', qrCodes);
    res.json(qrCodes);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching QR codes",
      error: error.message,
    });
  }
});

module.exports = router;
