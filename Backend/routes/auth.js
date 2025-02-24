const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const { rateLimiter } = require('../middleware/rateLimiter');

// Password validation function
const validatePassword = (password) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(password);
};

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', rateLimiter, async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      employeeId,
      role,
      department,
      registrationCode,
      studentId,
      course,
      semester,
      organizationName
    } = req.body;

    console.log('Registration attempt:', { 
      email, 
      role,
      hasPassword: !!password
    });

    // Validate required fields
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing'
      });
    }

    // Check if user exists
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
        field: 'email'
      });
    }

    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(409).json({
        success: false,
        message: 'Phone number already registered',
        field: 'phone'
      });
    }

    // For students, check studentId uniqueness within the same organization
    if (role === 'user' && studentId) {
      const studentIdExists = await User.findOne({
        studentId,
        organizationName,
        role: 'user'
      });
      
      if (studentIdExists) {
        return res.status(409).json({
          success: false,
          message: 'Student ID already registered in this organization',
          field: 'studentId'
        });
      }
    }

    // Create user with plain password - it will be hashed by the pre-save middleware
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: password, // Don't hash here, let the pre-save middleware handle it
      phone,
      employeeId: employeeId || studentId,
      role: role || 'user',
      department,
      studentId,
      course,
      semester,
      organizationName,
      isActive: true,
      isVerified: false
    });

    // Save user - this will trigger the pre-save middleware to hash the password
    await user.save();
    console.log('User saved successfully');

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Registration successful:', { email: user.email, role: user.role });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
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
    console.log('Login - Request body:', { 
      email, 
      role,
      hasPassword: !!password,
      passwordLength: password?.length
    });

    // Validate required fields
    if (!email || !password || !role) {
      console.log('Login - Missing required fields:', { 
        email: !!email, 
        password: !!password, 
        role: !!role,
        passwordLength: password?.length 
      });
      return res.status(400).json({
        success: false,
        message: 'Email, password and role are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('Login - User found:', { 
      exists: !!user, 
      email: email.toLowerCase(),
      hasStoredPassword: !!user?.password,
      storedPasswordLength: user?.password?.length
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify role matches
    console.log('Login - Role check:', { expected: role, actual: user.role });
    if (user.role !== role) {
      console.log('Login - Role mismatch:', { expected: role, actual: user.role });
      return res.status(401).json({
        success: false,
        message: 'Invalid role for this user'
      });
    }

    // Check password
    console.log('Login - Password verification details:', {
      providedPasswordLength: password.length,
      storedHashLength: user.password.length,
      providedFirstChar: password[0],
      providedLastChar: password[password.length - 1],
      hashStart: user.password.substring(0, 10),
      hashEnd: user.password.substring(user.password.length - 10),
      containsSpecial: /[!@#$%^&*]/.test(password),
      containsNumber: /\d/.test(password),
      containsUpper: /[A-Z]/.test(password),
      containsLower: /[a-z]/.test(password)
    });

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Login - Password match result:', isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    console.log('Login successful:', { email: user.email, role: user.role });

    // Set cookies
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    });

    res.cookie('role', user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
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

// Debug route to verify stored password hash (REMOVE IN PRODUCTION)
router.post('/verify-hash', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Stored password verification:', {
      email: user.email,
      storedHashLength: user.password?.length,
      hashStart: user.password?.substring(0, 10),
      hashEnd: user.password?.substring(user.password.length - 10)
    });

    // Test password comparison
    const isMatch = await bcrypt.compare(password, user.password);
    
    return res.json({
      success: true,
      passwordMatch: isMatch,
      details: {
        providedPasswordLength: password.length,
        storedHashLength: user.password.length,
        hashStart: user.password.substring(0, 10),
        hashEnd: user.password.substring(user.password.length - 10)
      }
    });

  } catch (error) {
    console.error('Hash verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying hash'
    });
  }
});

/**
 * @route GET /api/auth/verify
 * @desc Verify user token and return user data
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
      user
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route GET /api/auth/check
 * @desc Check user authentication status
 * @access Private
 */
router.get('/check', async (req, res) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token found'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Auth check error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error during auth check'
    });
  }
});

module.exports = router;
