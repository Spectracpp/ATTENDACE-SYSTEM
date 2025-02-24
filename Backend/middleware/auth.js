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
const auth = async (req, res, next) => {
  try {
    // Check if the route is public
    const isPublicRoute = publicRoutes.some(route => 
      req.path.toLowerCase().endsWith(route.toLowerCase())
    );
    
    if (isPublicRoute) {
      return next();
    }

    // Get token from different possible sources
    let token;
    
    // Check Authorization header
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Check query parameter
    if (!token && req.query.token) {
      token = req.query.token;
    }
    
    // Check cookies
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Check if no token found
    if (!token) {
      return res.status(401).json({ 
        message: 'No authentication token found. Please provide a token via Authorization header (Bearer token), query parameter (token), or cookie (token).'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.id || decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Add user to request
      req.user = user;
      req.token = token;
      
      next();
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError.message);
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired' });
      } else if (tokenError.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token format' });
      } else {
        return res.status(401).json({ message: 'Token validation failed' });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

// Role-based authorization middleware
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    next();
  };
};

module.exports = { auth, authorize };
