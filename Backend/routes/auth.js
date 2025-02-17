const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const { rateLimiter } = require('../middleware/rateLimiter');

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', rateLimiter, async (req, res) => {
  try {
    const { name, email, password, phone, employeeId, role, department, adminCode } = req.body;
    console.log('Registration attempt:', { email, role });

    // Validate input
    if (!name || !email || !password || !phone || !employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing'
      });
    }

    // Validate role
    if (role && !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    // Additional validation for admin registration
    if (role === 'admin') {
      if (!adminCode) {
        return res.status(400).json({
          success: false,
          message: 'Admin registration code is required'
        });
      }

      if (adminCode !== process.env.ADMIN_REGISTRATION_CODE) {
        return res.status(400).json({
          success: false,
          message: 'Invalid admin registration code'
        });
      }

      if (!department) {
        return res.status(400).json({
          success: false,
          message: 'Department is required for admin registration'
        });
      }
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { employeeId }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email.toLowerCase() ?
          'Email already registered' :
          'Employee ID already registered'
      });
    }

    // Create user
    console.log('Creating user with password:', password);
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      employeeId,
      role: role || 'user',
      department,
      isActive: true
    });

    // Save user
    await user.save();
    console.log('User saved with hashed password:', user.password);

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        phone: user.phone,
        ...(user.role === 'admin' && { department: user.department })
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', rateLimiter, async (req, res) => {
  try {
    const { email, password, role } = req.body;
    console.log('Login attempt:', { email, role });

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('User found:', user ? {
      email: user.email,
      role: user.role,
      id: user._id
    } : 'No');
    
    if (!user) {
      console.log('No user found with email:', email);
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if the user has the correct role
    if (role && user.role !== role) {
      console.log('Role mismatch. User role:', user.role, 'Requested role:', role);
      return res.status(403).json({
        success: false,
        message: `Invalid credentials for ${role} login`
      });
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('User account is inactive');
      return res.status(400).json({
        success: false,
        message: 'Account is inactive'
      });
    }
    
    // Check password
    console.log('Attempting password comparison');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch ? 'Yes' : 'No');
    console.log('Input password:', password);
    console.log('Stored hashed password:', user.password);
    
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for user:', user.email);
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        phone: user.phone,
        ...(user.role === 'admin' && { department: user.department }),
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

/**
 * @route GET /api/auth/verify
 * @desc Verify user token
 * @access Private
 */
router.get('/verify', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying token'
    });
  }
});

module.exports = router;
