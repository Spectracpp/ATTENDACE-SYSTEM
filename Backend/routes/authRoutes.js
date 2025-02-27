const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { auth } = require('../middleware/auth');

// Validation helpers
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePassword = (password) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);
};

const validatePhone = (phone) => {
  return /^\d{10}$/.test(phone.replace(/\D/g, ''));
};

// Register User/Admin
router.post('/register', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      organizationName,
      department,
      studentId,
      course,
      semester,
      role = 'user'
    } = req.body;

    console.log('\n=== Registration Debug Info ===');
    console.log('1. Received registration request for:', { email, phone, studentId, role });

    // Basic validation
    if (!name || !email || !password || !phone || !organizationName || !department) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields: ['name', 'email', 'password', 'phone', 'organizationName', 'department'].filter(field => !req.body[field])
      });
    }

    // Additional validation for students
    if (role === 'user' && (!studentId || !course || !semester)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required student fields',
        missingFields: ['studentId', 'course', 'semester'].filter(field => !req.body[field])
      });
    }

    // Check for existing email
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    console.log('2. Email check result:', emailExists ? 'Found' : 'Not found');

    // Check for existing phone
    const phoneExists = await User.findOne({ phone });
    console.log('3. Phone check result:', phoneExists ? 'Found' : 'Not found');

    // Check for existing student ID
    let studentIdExists = null;
    if (role === 'user' && studentId) {
      studentIdExists = await User.findOne({
        studentId,
        organizationName,
        role: 'user'
      });
      console.log('4. StudentId check result:', studentIdExists ? 'Found' : 'Not found');
    }

    // Log current database state
    console.log('5. Current users in database:');
    const allUsers = await User.find({}, { email: 1, phone: 1, studentId: 1, organizationName: 1, role: 1 });
    console.log(JSON.stringify(allUsers, null, 2));

    if (emailExists) {
      console.log('Duplicate check failed - Email exists:', email);
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
        field: 'email',
        details: 'This email address is already associated with an account'
      });
    }

    if (phoneExists) {
      console.log('Duplicate check failed - Phone exists:', phone);
      return res.status(409).json({
        success: false,
        message: 'Phone number already registered',
        field: 'phone',
        details: 'This phone number is already associated with an account'
      });
    }

    if (studentIdExists) {
      console.log('Duplicate check failed - Student ID exists:', { studentId, organizationName });
      return res.status(409).json({
        success: false,
        message: 'Student ID already registered for this organization',
        field: 'studentId',
        details: 'This Student ID is already registered for this organization'
      });
    }

    // If we get here, no duplicates were found
    console.log('6. No duplicates found, proceeding with registration');

    // Create user object
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      organizationName,
      department,
      role,
      ...(role === 'user' && {
        studentId,
        course,
        semester: parseInt(semester, 10)
      })
    });

    // Save user
    await user.save();
    console.log('User saved successfully:', {
      id: user._id,
      email: user.email,
      role: user.role,
      organization: user.organizationName
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    try {
      await user.save();
      console.log('Password saved successfully:', user._id);
    } catch (saveError) {
      console.error('Error saving password:', saveError);
      throw saveError;
    }

    // Generate verification token
    const verificationToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      userId: user._id
    });

  } catch (error) {
    console.error('Registration error:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      for (let field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let message = 'This field is already registered';

      if (field === 'email') {
        message = 'Email already registered';
      } else if (field === 'phone') {
        message = 'Phone number already registered';
      } else if (field === 'studentId') {
        message = 'Student ID already registered in this organization';
      }

      return res.status(409).json({
        success: false,
        message,
        field
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
});

// Login User/Admin
router.post('/login', async (req, res) => {
  try {
    const { email, password, role = 'user' } = req.body;

    console.log('Login attempt:', { email, role });

    // Validate role
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid role specified' 
      });
    }

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    // Find user without role filter first to provide better error messages
    const userExists = await User.findOne({ email: email.toLowerCase() });
    
    if (!userExists) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }
    
    // If user exists but with different role
    if (userExists && userExists.role !== role) {
      return res.status(401).json({ 
        success: false,
        message: `This account is registered as a ${userExists.role}, not as a ${role}. Please use the correct login page.` 
      });
    }

    // Find user with role filter
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      role 
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const waitMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(401).json({
        success: false,
        message: `Account is locked. Please try again in ${waitMinutes} minutes`
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please verify your email or contact support.'
      });
    }

    // Check if email is verified (if required)
    if (user.emailVerificationRequired && !user.emailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment failed login attempts
      await user.handleFailedLogin();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Set JWT as HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    // Return user data (excluding sensitive info)
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,
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

// Support legacy role-specific login
router.post('/login/:role', async (req, res) => {
  req.body.role = req.params.role;
  return router.handle(req, res);
});

// Check Auth Status
router.get('/check', auth, async (req, res) => {
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
    console.error('Auth check error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during auth check' 
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token'); // Use consistent cookie name
  res.json({ 
    success: true,
    message: 'Logged out successfully' 
  });
});

// Verify Email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        success: false,
        message: 'Verification token is required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already verified' 
      });
    }

    user.isEmailVerified = true;
    await user.save();

    res.json({ 
      success: true,
      message: 'Email verified successfully' 
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Verification link has expired' 
      });
    }
    console.error('Email verification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during email verification' 
    });
  }
});

/**
 * @route POST /api/auth/check-email
 * @desc Check if email is available
 * @access Public
 */
router.post('/check-email', async (req, res) => {
  try {
    const { email, organizationName } = req.body;
    
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      organizationName 
    });
    
    if (user) {
      return res.status(409).json({ 
        message: 'Email already exists in this organization',
        field: 'email'
      });
    }
    
    res.status(200).json({ message: 'Email is available' });
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({ message: 'Error checking email availability' });
  }
});

// Temporary debug route - Remove in production
router.get('/debug/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json({
      count: users.length,
      users: users.map(u => ({
        email: u.email,
        phone: u.phone,
        studentId: u.studentId,
        organizationName: u.organizationName,
        role: u.role
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/debug/clear-users', async (req, res) => {
  try {
    await User.deleteMany({});
    res.json({ message: 'All users deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
