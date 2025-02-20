const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/auth/check
// @desc    Check if user is authenticated and return user data
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    console.log('Auth check request received');

    // Get user data from database (excluding password)
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      console.log('User not found:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Auth check successful:', {
      id: user.id,
      email: user.email,
      role: user.role
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
    console.error('Auth check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during auth check'
    });
  }
});

module.exports = router;
