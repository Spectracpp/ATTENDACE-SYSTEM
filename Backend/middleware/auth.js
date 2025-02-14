const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Main authentication middleware
  /**
   * Main authentication middleware
   * 
   * Verifies the token in the Authorization header,
   * finds the corresponding user, checks their status,
   * and checks if the account is locked.
   * 
   * If the user is active and not locked, the user
   * object is attached to the request and the next
   * middleware is called.
   * 
   * If the token is invalid or expired, or the user
   * is not active or locked, a 401 or 403 response
   * is sent accordingly.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware function
   */
const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded._id) {
      throw new Error('Invalid token');
    }

    // Find user and check status
    const user = await User.findById(decoded._id)
      .select('+failedLoginAttempts +lockUntil')
      .populate({
        path: 'organizations.organization',
        select: 'name code type status'
      });
    
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({ 
        message: `Account is ${user.status}. Please contact support.` 
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(403).json({ 
        message: "Account is temporarily locked. Please try again later." 
      });
    }

    // Reset failed attempts on successful auth
    if (user.failedLoginAttempts > 0) {
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      await user.save();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(401).json({ message: "Authentication failed" });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "You don't have permission to perform this action" 
      });
    }
    next();
  };
};

// Organization-based authorization middleware
const authorizeOrg = (roleInOrg) => {
  return async (req, res, next) => {
    const { organizationId } = req.params;
    
    // Find user's role in the organization
    const orgMembership = req.user.organizations.find(
      org => org.organization._id.toString() === organizationId
    );

    if (!orgMembership || !roleInOrg.includes(orgMembership.role)) {
      return res.status(403).json({
        message: "You don't have the required role in this organization"
      });
    }

    req.organization = orgMembership.organization;
    next();
  };
};

// Rate limiting helper
const incrementFailedAttempts = async (userId) => {
  const user = await User.findById(userId)
    .select('+failedLoginAttempts +lockUntil');
  
  if (!user) return;

  user.failedLoginAttempts += 1;
  if (user.failedLoginAttempts >= 5) {
    user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  }
  
  await user.save();
};

module.exports = {
  auth,
  authorize,
  authorizeOrg,
  incrementFailedAttempts
};
