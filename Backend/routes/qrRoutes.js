const express = require("express");
const router = express.Router();
const QRCode = require("../models/QRCode");
const Organization = require("../models/Organization");
const Attendance = require("../models/Attendance");
const auth = require("../middleware/auth");
const qr = require("qrcode");

// Generate QR Code (User only)
router.post("/generate", auth, async (req, res) => {
  try {
    if (req.userType !== "user") {
      return res
        .status(403)
        .json({ message: "Only users can generate QR codes" });
    }

    const { organisation_uid, roll_no } = req.body;

    // Validate organization and user membership
    const organization = await Organization.findOne({ uid: organisation_uid });
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    if (!organization.user_ids.includes(req.user._id)) {
      return res
        .status(403)
        .json({ message: "User does not belong to this organization" });
    }

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if QR code already exists for today
    let qrCode = await QRCode.findOne({
      organisation_uid,
      roll_no,
      created_by: req.user._id,
      attendance_date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (qrCode) {
      // Return existing QR code
      const qrData = {
        id: qrCode._id,
        organisation_uid,
        roll_no,
        attendance_date: qrCode.attendance_date,
        present: qrCode.present,
      };

      const qrImage = await qr.toDataURL(JSON.stringify(qrData));

      return res.json({
        message: "Retrieved existing QR code for today",
        qrCode: qrCode,
        qrImage: qrImage,
        qrData: JSON.stringify(qrData),
      });
    }

    // Create new QR code entry
    qrCode = new QRCode({
      organisation_uid,
      roll_no,
      attendance_date: today,
      created_by: req.user._id,
    });

    await qrCode.save();

    // Generate QR code data
    const qrData = {
      id: qrCode._id,
      organisation_uid,
      roll_no,
      attendance_date: qrCode.attendance_date,
      present: qrCode.present,
    };

    // Generate QR code image
    const qrImage = await qr.toDataURL(JSON.stringify(qrData));

    res.json({
      message: "QR code generated successfully",
      qrCode: qrCode,
      qrImage: qrImage,
      qrData: JSON.stringify(qrData),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error generating QR code",
      error: error.message,
    });
  }
});

// Scan QR Code (Admin only)
router.post("/scan", auth, async (req, res) => {
  try {
    if (req.userType !== "admin") {
      return res.status(403).json({ message: "Only admins can scan QR codes" });
    }

    let data;
    try {
      const { qrData } = req.body;
      // Always expect qrData to be a string that needs parsing
      data = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({
        message: "Invalid QR data format",
        error: "QR data must be a valid JSON string",
      });
    }

    // Validate QR code
    const qrCode = await QRCode.findById(data.id);
    if (!qrCode) {
      return res.status(404).json({ message: "QR code not found" });
    }

    // Validate organization and admin membership
    const organization = await Organization.findOne({
      uid: qrCode.organisation_uid,
    });
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    if (!organization.admin_ids.includes(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Admin does not belong to this organization" });
    }

    // Check if QR code is for today
    const qrDate = new Date(qrCode.attendance_date).setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);

    if (qrDate !== today) {
      return res
        .status(400)
        .json({ message: "QR code is not valid for today" });
    }

    // Update QR code status
    qrCode.present = true;
    qrCode.scanned_by = req.user._id;
    qrCode.scanned_at = new Date();

    await qrCode.save();

    // Create or update attendance record
    const attendance = await Attendance.findOneAndUpdate(
      {
        organisation_uid: qrCode.organisation_uid,
        user_id: qrCode.created_by,
        date: new Date(qrCode.attendance_date),
      },
      {
        $set: {
          status: "present",
          qr_code: qrCode._id,
          marked_by: req.user._id,
          marked_at: new Date(),
          roll_no: qrCode.roll_no,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.json({
      message: "Attendance marked successfully",
      qrCode,
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error scanning QR code",
      error: error.message,
    });
  }
});

// Get QR Code details
router.get("/:id", auth, async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id)
      .populate("scanned_by", "name email -_id")
      .populate("created_by", "name email -_id");

    if (!qrCode) {
      return res.status(404).json({ message: "QR code not found" });
    }

    // Validate organization membership
    const organization = await Organization.findOne({
      uid: qrCode.organisation_uid,
    });
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const isMember =
      organization.admin_ids.includes(req.user._id) ||
      organization.user_ids.includes(req.user._id);

    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(qrCode);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching QR code",
      error: error.message,
    });
  }
});

// Get all QR codes for an organisation
router.get("/organisation/:uid", auth, async (req, res) => {
  try {
    const organization = await Organization.findOne({ uid: req.params.uid });
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const isMember =
      organization.admin_ids.includes(req.user._id) ||
      organization.user_ids.includes(req.user._id);

    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    const qrCodes = await QRCode.find({ organisation_uid: req.params.uid })
      .populate("scanned_by", "name email -_id")
      .populate("created_by", "name email -_id")
      .sort({ attendance_date: -1, createdAt: -1 });

    res.json(qrCodes);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching QR codes",
      error: error.message,
    });
  }
});

module.exports = router;
