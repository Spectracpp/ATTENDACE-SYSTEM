const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

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

    // Generate token
    const token = jwt.sign(
      { id: user._id, type: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    res.cookie("token", token, cookieOptions);

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

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, type: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    res.cookie("token", token, cookieOptions);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: "Login successful",
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error during login",
      error: error.message,
    });
  }
});

// Get user profile (protected route)
router.get("/profile", auth, async (req, res) => {
  try {
    if (req.userType !== "user") {
      return res.status(403).json({ message: "Access denied" });
    }

    const userResponse = req.user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching profile",
      error: error.message,
    });
  }
});

// Logout user
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
