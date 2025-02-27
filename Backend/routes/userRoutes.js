const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Organization = require('../models/Organization');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { rateLimiter } = require('../middleware/rateLimiter');
const sendEmail = require('../utils/email');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

/**
 * @route POST /api/users/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', 
  validate.userValidation.create,
  rateLimiter,
  async (req, res) => {
    try {
      const { email, password, name, phone, employeeId } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = new User({
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        phone,
        employeeId,
        role: 'user'
      });

      await user.save();

      // Generate token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Error registering user' });
    }
});

/**
 * @route POST /api/users/login
 * @desc Login user
 * @access Public
 */
router.post('/login', 
  validate.userValidation.login,
  rateLimiter,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error logging in' });
    }
});

/**
 * @route GET /api/users/profile
 * @desc Get user profile
 * @access Private
 */

/**
 * @route GET /api/users/me
 * @desc Get current user
 * @access Private
 */
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
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
    console.error('Error fetching current user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching current user'
    });
  }
});




router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
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
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});




/**
 * @route PUT /api/users/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile', 
  auth,
  upload.single('avatar'),
  async (req, res) => {
    try {
      const updates = {};
      const allowedUpdates = ['name', 'phone', 'course', 'semester', 'department'];
      
      // Handle basic field updates
      Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key) && req.body[key]) {
          updates[key] = req.body[key];
        }
      });

      // Handle password change
      if (req.body.currentPassword && req.body.newPassword) {
        const isMatch = await bcrypt.compare(req.body.currentPassword, req.user.password);
        if (!isMatch) {
          return res.status(400).json({
            success: false,
            message: 'Current password is incorrect'
          });
        }

        // Validate new password
        if (req.body.newPassword.length < 6) {
          return res.status(400).json({
            success: false,
            message: 'New password must be at least 6 characters long'
          });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        updates.password = await bcrypt.hash(req.body.newPassword, salt);
      }

      // Handle avatar upload
      if (req.file) {
        updates.avatar = `/uploads/avatars/${req.file.filename}`;
      }

      // Update user
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error updating profile'
      });
    }
});

/**
 * @route PUT /api/users/active-organization
 * @desc Set user's active organization
 * @access Private
 */
router.put('/active-organization', auth, async (req, res) => {
  try {
    const { organizationId } = req.body;
    
    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID is required'
      });
    }

    // Verify the organization exists and user is a member
    const organization = await Organization.findOne({
      _id: organizationId,
      'members.user': req.user._id,
      'members.status': 'active'
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found or you are not an active member'
      });
    }

    // Update the user's active organization
    req.user.activeOrganization = organizationId;
    await req.user.save();

    // Return the updated user
    const updatedUser = await User.findById(req.user._id)
      .select('-password')
      .populate('activeOrganization');

    res.json({
      success: true,
      message: 'Active organization updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Set active organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting active organization'
    });
  }
});

/**
 * @route POST /api/users/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', auth, async (req, res) => {
  try {
    // Remove current token
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
    await req.user.save();
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Error logging out' });
  }
});

/**
 * @route POST /api/users/logout-all
 * @desc Logout from all devices
 * @access Private
 */
router.post('/logout-all', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.json({ message: 'Logged out from all devices' });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({ message: 'Error logging out from all devices' });
  }
});

/**
 * @route POST /api/users/verify-email/:token
 * @desc Verify email address
 * @access Public
 */
router.get('/verify-email/:token', async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Error verifying email' });
  }
});

/**
 * @route POST /api/users/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post('/forgot-password',
  validate.userValidation.forgotPassword,
  async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email.toLowerCase() });
      if (!user) {
        return res.status(404).json({ message: 'No user with that email' });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
      await user.save();

      // Send reset email
      const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        template: 'passwordReset',
        data: {
          name: user.name,
          url: resetURL
        }
      });

      res.json({ message: 'Password reset email sent' });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Error sending reset email' });
    }
});

/**
 * @route POST /api/users/reset-password/:token
 * @desc Reset password
 * @access Public
 */
router.post('/reset-password/:token',
  validate.userValidation.resetPassword,
  async (req, res) => {
    try {
      const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }

      user.password = req.body.password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Error resetting password' });
    }
});

/**
 * @route POST /api/users/register-admin
 * @desc Register a new admin user (requires ADMIN_REGISTRATION_CODE)
 * @access Private
 */
router.post('/register-admin', 
  validate.userValidation.create,
  async (req, res) => {
    try {
      const adminCode = req.headers['admin-code'];
      
      // Verify admin registration code
      if (!adminCode || adminCode !== process.env.ADMIN_REGISTRATION_CODE) {
        return res.status(401).json({ message: 'Invalid admin registration code' });
      }

      const { email, password, name, phone, employeeId } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create admin user
      const user = new User({
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        phone,
        employeeId,
        role: 'admin',
        isEmailVerified: true // Admin users are pre-verified
      });

      // Generate token with your specified expiry
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
      });

      // Generate refresh token
      const refreshToken = jwt.sign({ _id: user._id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
      });

      // Add tokens to user
      user.tokens = [{ token }];
      await user.save();

      // Set refresh token in cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({
        message: 'Admin registration successful',
        user,
        token
      });
    } catch (error) {
      console.error('Admin registration error:', error);
      res.status(500).json({ message: 'Error registering admin user' });
    }
});

module.exports = router;
