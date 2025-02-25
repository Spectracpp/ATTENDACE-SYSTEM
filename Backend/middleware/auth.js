const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// List of public routes that don't require authentication
const publicRoutes = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/verify-email',
  '/api/auth/request-password-reset',
  '/api/auth/reset-password',
  '/api/auth/check-token',
  '/api/health-check',
  '/health',
  // Add OPTIONS for CORS preflight
  '/api/auth/register OPTIONS',
  '/api/auth/login OPTIONS',
  '/api/auth/verify-email OPTIONS',
  '/api/auth/request-password-reset OPTIONS',
  '/api/auth/reset-password OPTIONS',
  '/api/auth/check-token OPTIONS',
  '/api/health-check OPTIONS',
  '/health OPTIONS'
];

const extractToken = (req) => {
  // First try to get token from Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  
  // Then try to get token from cookies
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  
  return null;
};

// Auth middleware
const auth = async (req, res, next) => {
  try {
    // Log request details for debugging
    console.log('Auth middleware:', {
      path: req.path,
      method: req.method,
      headers: req.headers,
      cookies: req.cookies
    });

    // Check if the route is public
    const isPublicRoute = publicRoutes.some(route => {
      const [routePath, routeMethod] = route.split(' ');
      return req.path.toLowerCase().endsWith(routePath.toLowerCase()) && 
             (!routeMethod || req.method === routeMethod);
    });
    
    if (isPublicRoute) {
      return next();
    }

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return next();
    }

    // Get token
    const token = extractToken(req);
    if (!token) {
      console.log('No token found');
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', decoded);

    if (!decoded.user || !decoded.user.id) {
      throw new Error('Invalid token format - no user ID found');
    }

    // Get user from database
    const user = await User.findById(decoded.user.id)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    // Add user info to request
    req.user = {
      ...user,
      id: user._id,
      role: decoded.user.role
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

module.exports = { auth, extractToken };
