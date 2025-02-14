const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Organization = require('../models/Organization');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { rateLimiter } = require('../middleware/rateLimiter');
const sendEmail = require('../utils/email');

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

/**
 * @route POST /api/users/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', 
  validate.userValidation.create,
  async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Create user
      const user = new User({
        email: email.toLowerCase(),
        password,
        firstName,
        lastName,
        role: 'user'
      });

      // Generate token
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1d'
      });

      // Add token to user
      user.tokens = [{ token }];
      await user.save();

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
      user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      await user.save();

      // Send verification email
      const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
      await sendEmail({
        email: user.email,
        subject: 'Please verify your email',
        template: 'emailVerification',
        data: {
          name: user.firstName,
          url: verificationURL
        }
      });

      res.status(201).json({
        message: 'Registration successful. Please check your email to verify your account.',
        user,
        token
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
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email: email.toLowerCase() })
        .select('+password +failedLoginAttempts +lockUntil')
        .populate('organizations.organization', 'name code type status');

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if account is locked
      if (user.isLocked()) {
        return res.status(403).json({
          message: 'Account is temporarily locked. Please try again later.'
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        // Increment failed login attempts
        user.failedLoginAttempts += 1;

        // Lock account if too many failed attempts
        if (user.failedLoginAttempts >= 5) {
          user.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
        }

        await user.save();
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Reset failed login attempts on successful login
      user.failedLoginAttempts = 0;
      user.lockUntil = undefined;
      user.lastLogin = Date.now();

      // Generate token
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1d'
      });

      // Add token to user
      user.tokens = user.tokens.concat({ token });
      await user.save();

      res.json({
        message: 'Login successful',
        user,
        token
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
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('organizations.organization', 'name code type status');
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Error getting profile' });
  }
});

/**
 * @route PUT /api/users/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile',
  auth,
  validate.userValidation.update,
  async (req, res) => {
    try {
      const updates = req.body;
      const allowedUpdates = ['firstName', 'lastName'];
      const isValidOperation = Object.keys(updates).every(update => 
        allowedUpdates.includes(update)
      );

      if (!isValidOperation) {
        return res.status(400).json({ message: 'Invalid updates' });
      }

      Object.assign(req.user, updates);
      await req.user.save();

      res.json(req.user);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Error updating profile' });
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
          name: user.firstName,
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

      const { email, password, firstName, lastName } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Create admin user
      const user = new User({
        email: email.toLowerCase(),
        password,
        firstName,
        lastName,
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
