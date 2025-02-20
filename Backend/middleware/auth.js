const jwt = require('jsonwebtoken');
const User = require('../models/User');

// List of public routes that don't require authentication
const publicRoutes = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/verify-email',
  '/api/auth/request-password-reset',
  '/api/auth/reset-password',
  '/api/auth/check-token',
  '/health'
];

// Auth middleware
const auth = (req, res, next) => {
  try {
    // Check if the route is public
    const isPublicRoute = publicRoutes.some(route => 
      req.path.toLowerCase().endsWith(route.toLowerCase())
    );
    
    if (isPublicRoute) {
      return next();
    }

    // Get token from cookie
    const token = req.cookies.token;

    // Check if no token
    if (!token) {
      console.log('No token found in cookies');
      return res.status(401).json({ 
        success: false,
        message: 'No token, authorization denied' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified:', { userId: decoded.user.id, role: decoded.user.role });

    // Add user from payload to request
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ 
      success: false,
      message: 'Token is not valid' 
    });
  }
};

// Role-based authorization middleware
const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get role from cookie as backup
    const cookieRole = req.cookies.role;
    const userRole = req.user.role || cookieRole;

    if (roles.length && !roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'User not authorized'
      });
    }

    next();
  };
};

// Organization authorization middleware
const authorizeOrganization = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.organizationId) {
      return res.status(403).json({
        success: false,
        message: 'User not associated with any organization'
      });
    }

    req.organizationId = user.organizationId;
    next();
  } catch (error) {
    console.error('Organization authorization error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authorization'
    });
  }
};

module.exports = {
  auth,
  authorize,
  authorizeOrganization
};
