const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Organization = require("../models/Organization");
const QRCode = require("../models/QRCode");
const Attendance = require("../models/Attendance");
const SystemLog = require("../models/SystemLog");
const AdminSettings = require("../models/AdminSettings");
const { auth } = require("../middleware/auth");
const preloadedOrganizations = require("../utils/preloadedOrgs");

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Debug route to test if admin routes are mounted
router.get("/test", (req, res) => {
  console.log("Admin routes test endpoint hit");
  res.json({
    success: true,
    message: "Admin routes are working"
  });
});

// Get organizations (with fallback to preloaded list)
router.get("/organizations", auth, async (req, res) => {
  console.log("Fetching organizations, user:", req.user);
  try {
    let organizations = await Organization.find().lean();
    console.log("Found organizations:", organizations?.length || 0);
    
    // If no organizations found in DB, use preloaded list
    if (!organizations || organizations.length === 0) {
      console.log("No organizations found, using preloaded list");
      return res.json({
        success: true,
        data: preloadedOrganizations,
        isPreloaded: true
      });
    }

    return res.json({
      success: true,
      data: organizations,
      isPreloaded: false
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching organizations"
    });
  }
});

// Create a new admin
router.post("/create", async (req, res) => {
  try {
    const { user_id, name, organisation_uid, email, password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { user_id }],
    });

    if (existingAdmin) {
      return res.status(400).json({
        message: "Admin with this email or user_id already exists",
      });
    }

    // Create new admin
    const admin = new Admin({
      user_id,
      name,
      organisation_uid,
      email,
      password,
    });

    await admin.save();

    // Generate token
    const token = jwt.sign(
      { id: admin._id, type: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    res.cookie("token", token, cookieOptions);

    // Remove password from response
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    res.status(201).json({
      message: "Admin created successfully",
      admin: adminResponse,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating admin",
      error: error.message,
    });
  }
});

// Login admin
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = jwt.sign(
      { id: admin._id, type: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    res.cookie("token", token, cookieOptions);

    // Remove password from response
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    res.json({
      message: "Login successful",
      admin: adminResponse,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error during login",
      error: error.message,
    });
  }
});

// Get dashboard statistics
router.get("/dashboard/stats", auth, async (req, res) => {
  try {
    console.log('Fetching dashboard stats for admin:', req.user._id);

    // Get counts with error handling
    const [
      totalOrganizations,
      totalUsers,
      activeQRCodes,
      totalAttendance
    ] = await Promise.all([
      Organization.countDocuments(),
      User.countDocuments(),
      QRCode.countDocuments({
        validUntil: { $gt: new Date() },
        isActive: true
      }),
      Attendance.countDocuments()
    ]);

    // Get recent system logs
    const recentLogs = await SystemLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get recent attendance
    const recentAttendance = await Attendance.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email')
      .populate('organization', 'name')
      .lean();

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalOrganizations,
        totalAttendance,
        activeQRCodes,
        recentActivity: [
          ...recentLogs.map(log => ({
            type: 'log',
            ...log
          })),
          ...recentAttendance.map(attendance => ({
            type: 'attendance',
            ...attendance
          }))
        ].sort((a, b) => b.createdAt - a.createdAt).slice(0, 10)
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
});

// Get admin profile
router.get("/profile", auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id).select("-password");
    res.json({ success: true, profile: admin });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin profile"
    });
  }
});

// Update admin profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const admin = await Admin.findById(req.user._id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    admin.name = name || admin.name;
    admin.email = email || admin.email;
    await admin.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      profile: admin
    });
  } catch (error) {
    console.error("Error updating admin profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update admin profile"
    });
  }
});

// Get system logs
router.get("/logs", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const query = type ? { type } : {};

    const logs = await SystemLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await SystemLog.countDocuments(query);

    res.json({
      success: true,
      logs,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching system logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch system logs"
    });
  }
});

// Get admin settings
router.get("/settings", auth, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne().lean();
    
    if (!settings) {
      settings = await new AdminSettings({
        maxLoginAttempts: 5,
        lockoutDuration: 15,
        passwordPolicy: {
          minLength: 8,
          requireNumbers: true,
          requireSymbols: true,
          requireUppercase: true
        },
        qrCodeSettings: {
          defaultValidityHours: 24,
          maxValidityHours: 72
        }
      }).save();
    }

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin settings'
    });
  }
});

// Update admin settings
router.put("/settings", auth, async (req, res) => {
  try {
    const updates = req.body;
    let settings = await AdminSettings.findOne();
    
    if (!settings) {
      settings = new AdminSettings();
    }

    // Update only allowed fields
    if (updates.maxLoginAttempts) settings.maxLoginAttempts = updates.maxLoginAttempts;
    if (updates.lockoutDuration) settings.lockoutDuration = updates.lockoutDuration;
    if (updates.passwordPolicy) {
      settings.passwordPolicy = {
        ...settings.passwordPolicy,
        ...updates.passwordPolicy
      };
    }
    if (updates.qrCodeSettings) {
      settings.qrCodeSettings = {
        ...settings.qrCodeSettings,
        ...updates.qrCodeSettings
      };
    }

    await settings.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating admin settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating admin settings'
    });
  }
});

// Logout admin
router.post("/logout", auth, (req, res) => {
  try {
    // Clear the cookie
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error during logout",
      error: error.message,
    });
  }
});

module.exports = router;
