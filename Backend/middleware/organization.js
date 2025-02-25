const Organization = require('../models/Organization');

/**
 * Middleware to authorize based on user role
 * @param {string} requiredRole - Required role to access the route
 */
const authorize = (requiredRole) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (requiredRole && req.user.role !== requiredRole) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during authorization'
      });
    }
  };
};

/**
 * Middleware to authorize based on organization membership and role
 * @param {string} requiredRole - Required role in the organization
 */
const authorizeOrganization = (requiredRole) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const organizationId = req.params.organizationId || req.params.id;
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found'
        });
      }

      const member = organization.members.find(m => 
        m.user.toString() === req.user._id.toString()
      );

      if (!member) {
        return res.status(403).json({
          success: false,
          message: 'You are not a member of this organization'
        });
      }

      if (requiredRole && member.role !== requiredRole) {
        return res.status(403).json({
          success: false,
          message: `You need ${requiredRole} role to perform this action`
        });
      }

      // Add organization and member role to request
      req.organization = organization;
      req.memberRole = member.role;

      next();
    } catch (error) {
      console.error('Organization authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during organization authorization'
      });
    }
  };
};

module.exports = {
  authorize,
  authorizeOrganization
};
