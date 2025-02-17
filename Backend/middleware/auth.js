const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId)
      .populate('organizations.organization', 'name code type status')
      .populate('primaryOrganization', 'name code type status');

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: error.message || 'Authentication failed' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

const authorizeOrganization = (requiredRole = 'member') => {
  return async (req, res, next) => {
    try {
      const organizationId = req.params.id || req.params.organizationId;
      
      if (!organizationId) {
        return res.status(400).json({ message: 'Organization ID is required' });
      }

      if (!req.user.hasOrganizationPermission(organizationId, requiredRole)) {
        return res.status(403).json({ message: 'Insufficient organization permissions' });
      }

      next();
    } catch (error) {
      console.error('Organization authorization error:', error);
      res.status(500).json({ message: 'Error checking organization permissions' });
    }
  };
};

module.exports = {
  auth,
  authorize,
  authorizeOrganization
};
