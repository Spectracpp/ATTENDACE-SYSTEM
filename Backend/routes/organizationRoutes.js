const express = require("express");
const router = express.Router();
const Organization = require("../models/Organization");
const User = require("../models/User");
const auth = require("../middleware/auth");

// Get all organizations (Public endpoint for registration)
router.get("/list", async (req, res) => {
  try {
    const organizations = await Organization.find({}, 'name uid');
    res.json(organizations);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching organizations",
      error: error.message,
    });
  }
});

// Create organization (Admin only)
router.post("/create", auth, async (req, res) => {
  try {
    if (req.userType !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can create organizations" });
    }

    const { name, uid } = req.body;

    // Check if organization exists
    const existingOrg = await Organization.findOne({ uid });
    if (existingOrg) {
      return res
        .status(400)
        .json({ message: "Organization with this UID already exists" });
    }

    // Create organization
    const organization = new Organization({
      name,
      uid,
      admin_ids: [req.user._id],
      created_by: req.user._id,
    });

    await organization.save();

    res.status(201).json({
      message: "Organization created successfully",
      organization,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating organization",
      error: error.message,
    });
  }
});

// Add user to organization (Admin only)
router.post("/:uid/add-user", auth, async (req, res) => {
  try {
    if (req.userType !== "admin") {
      return res.status(403).json({ message: "Only admins can add users" });
    }

    const { email, username } = req.body;
    if (!email && !username) {
      return res.status(400).json({ message: "Email or username is required" });
    }

    // Find user by email or username
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else {
      user = await User.findOne({ user_id: username });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const organization = await Organization.findOne({ uid: req.params.uid });
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    if (!organization.admin_ids.includes(req.user._id)) {
      return res
        .status(403)
        .json({ message: "You are not an admin of this organization" });
    }

    // Check if user is already in organization
    if (organization.user_ids.includes(user._id)) {
      return res
        .status(400)
        .json({ message: "User already belongs to this organization" });
    }

    // Add user to organization
    organization.user_ids.push(user._id);
    await organization.save();

    // Populate user details in response
    await organization.populate([
      { path: "user_ids", select: "name email user_id -_id" },
      { path: "admin_ids", select: "name email user_id -_id" },
    ]);

    res.json({
      message: "User added successfully",
      organization,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding user",
      error: error.message,
    });
  }
});

// Add admin to organization (Admin only)
router.post("/:uid/add-admin", auth, async (req, res) => {
  try {
    if (req.userType !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can add other admins" });
    }

    const { admin_id } = req.body;
    const organization = await Organization.findOne({ uid: req.params.uid });

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    if (!organization.admin_ids.includes(req.user._id)) {
      return res
        .status(403)
        .json({ message: "You are not an admin of this organization" });
    }

    if (organization.admin_ids.includes(admin_id)) {
      return res
        .status(400)
        .json({ message: "Admin already belongs to this organization" });
    }

    organization.admin_ids.push(admin_id);
    await organization.save();

    res.json({
      message: "Admin added successfully",
      organization,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding admin",
      error: error.message,
    });
  }
});

// Get organization details
router.get("/:uid", auth, async (req, res) => {
  try {
    const organization = await Organization.findOne({ uid: req.params.uid })
      .populate("admin_ids", "name email -_id")
      .populate("user_ids", "name email -_id")
      .populate("created_by", "name email -_id");

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const isMember =
      organization.admin_ids.some((admin) => admin._id.equals(req.user._id)) ||
      organization.user_ids.some((user) => user._id.equals(req.user._id));

    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(organization);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching organization",
      error: error.message,
    });
  }
});

// Get user's organizations
router.get("/", auth, async (req, res) => {
  try {
    let organizations;
    if (req.userType === "admin") {
      // Admin can see all organizations
      organizations = await Organization.find();
    } else {
      // Regular user can only see their organizations
      organizations = await Organization.find({ user_ids: req.user._id });
    }
    res.json(organizations);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching organizations",
      error: error.message,
    });
  }
});

module.exports = router;
