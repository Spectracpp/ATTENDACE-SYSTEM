const Organization = require('../models/Organization');

const authorize = (requiredRole) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (requiredRole && req.user.role !== requiredRole) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
};

const authorizeOrganization = (requiredRole) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const organizationId = req.params.id;
      const organization = await Organization.findById(organizationId);

      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      const member = organization.members.find(
        m => m.user.toString() === req.user._id.toString()
      );

      if (!member) {
        return res.status(403).json({ message: 'Not a member of this organization' });
      }

      if (requiredRole && member.role !== requiredRole) {
        return res.status(403).json({ message: 'Insufficient permissions in this organization' });
      }

      req.organization = organization;
      req.organizationRole = member.role;
      next();
    } catch (error) {
      console.error('Organization authorization error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
};

module.exports = {
  authorize,
  authorizeOrganization
};
