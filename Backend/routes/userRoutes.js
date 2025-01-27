const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Create a new user
router.post("/create", async (req, res) => {
  try {
    const { user_id, name, organisation_uid, email, password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { user_id }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email or user_id already exists",
      });
    }

    // Create new user
    const user = new User({
      user_id,
      name,
      organisation_uid,
      email,
      password,
      tokens: 0,
      streak: 0,
    });

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "User created successfully",
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating user",
      error: error.message,
    });
  }
});

module.exports = router;
