const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");

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

module.exports = router;
