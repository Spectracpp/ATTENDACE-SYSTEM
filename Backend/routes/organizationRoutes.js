const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { auth, authorize, authorizeOrganization } = require('../middleware/auth');
const { organizationValidation } = require('../middleware/validate');
const { rateLimiter } = require('../middleware/rateLimiter');

/**
 * @route GET /api/organizations
 * @desc Get all organizations (paginated)
 * @access Private
 */
router.get('/',
  auth,
  rateLimiter,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';

      const query = search 
        ? { name: { $regex: search, $options: 'i' } }
        : {};

      const organizations = await Organization
        .find(query, 'name code type status')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Organization.countDocuments(query);

      res.json({
        organizations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('List organizations error:', error);
      res.status(500).json({ message: 'Error fetching organizations' });
    }
});

/**
 * @route POST /api/organizations
 * @desc Create a new organization
 * @access Private
 */
router.post('/',
  auth,
  organizationValidation.create,
  async (req, res) => {
    try {
      const { name, code, type, settings } = req.body;

      // Check if organization exists
      const existingOrg = await Organization.findOne({ 
        $or: [{ code }, { name }]
      });
      
      if (existingOrg) {
        return res.status(400).json({ 
          message: 'Organization with this name or code already exists' 
        });
      }

      // Create organization
      const organization = new Organization({
        name,
        code,
        type,
        settings,
        createdBy: req.user._id
      });

      // Add creator as owner
      organization.members.push({
        user: req.user._id,
        role: 'owner'
      });

      await organization.save();

      // Add organization to user's organizations with owner role
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          organizations: {
            organization: organization._id,
            role: 'owner'
          }
        }
      });

      // Get updated user data
      const updatedUser = await User.findById(req.user._id)
        .populate('organizations.organization', 'name code type status');

      // Generate new token with updated permissions
      const token = jwt.sign(
        { userId: updatedUser._id, role: updatedUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'Organization created successfully',
        organization,
        token
      });
    } catch (error) {
      console.error('Create organization error:', error);
      res.status(500).json({ message: 'Error creating organization' });
    }
});

/**
 * @route GET /api/organizations/:id
 * @desc Get organization by ID
 * @access Private
 */
router.get('/:id',
  auth,
  async (req, res) => {
    try {
      const organization = await Organization
        .findById(req.params.id)
        .populate('members.user', 'firstName lastName email');

      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      // Check if user has access
      if (!organization.hasRole(req.user._id)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json({ organization });
    } catch (error) {
      console.error('Get organization error:', error);
      res.status(500).json({ message: 'Error fetching organization' });
    }
});

/**
 * @route PUT /api/organizations/:id
 * @desc Update organization
 * @access Private (Admin)
 */
router.put('/:id',
  auth,
  authorize('admin'),
  organizationValidation.update,
  async (req, res) => {
    try {
      const { name, settings } = req.body;
      const organization = await Organization.findById(req.params.id);

      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      // Update fields
      if (name) organization.name = name;
      if (settings) organization.settings = { ...organization.settings, ...settings };

      await organization.save();

      res.json({
        message: 'Organization updated successfully',
        organization
      });
    } catch (error) {
      console.error('Update organization error:', error);
      res.status(500).json({ message: 'Error updating organization' });
    }
});

/**
 * @route POST /api/organizations/:id/members
 * @desc Add a member to an organization
 * @access Private (Organization Owner)
 */
router.post('/:id/members',
  auth,
  organizationValidation.addMember,
  async (req, res) => {
    try {
      const { email, role } = req.body;
      const organizationId = req.params.id;

      // Get organization
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      // Check if user has permission
      if (!organization.hasRole(req.user._id, 'owner')) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Add member to organization
      await organization.addMember(user._id, role || 'member');

      // Add organization to user's organizations
      await User.findByIdAndUpdate(user._id, {
        $push: {
          organizations: {
            organization: organizationId,
            role: role || 'member'
          }
        }
      });

      // Get updated user data
      const updatedUser = await User.findById(user._id)
        .populate('organizations.organization', 'name code type status');

      // Generate new token for the added user
      const token = jwt.sign(
        { userId: updatedUser._id, role: updatedUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ 
        message: 'Member added successfully',
        token
      });
    } catch (error) {
      console.error('Add member error:', error);
      res.status(500).json({ message: 'Error adding member' });
    }
});

/**
 * @route DELETE /api/organizations/:id/members/:userId
 * @desc Remove member from organization
 * @access Private (Organization Owner)
 */
router.delete('/:id/members/:userId',
  auth,
  async (req, res) => {
    try {
      const organizationId = req.params.id;
      const userId = req.params.userId;

      // Get organization
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      // Check if user has permission
      if (!organization.hasRole(req.user._id, 'owner')) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      // Remove member from organization
      await organization.removeMember(userId);

      // Remove organization from user's organizations
      await User.findByIdAndUpdate(userId, {
        $pull: {
          organizations: {
            organization: organizationId
          }
        }
      });

      // Get updated user data
      const updatedUser = await User.findById(userId)
        .populate('organizations.organization', 'name code type status');

      // Generate new token for the removed user
      const token = jwt.sign(
        { userId: updatedUser._id, role: updatedUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ 
        message: 'Member removed successfully',
        token
      });
    } catch (error) {
      console.error('Remove member error:', error);
      res.status(500).json({ message: 'Error removing member' });
    }
});

/**
 * @route GET /api/organizations/:id/statistics
 * @desc Get organization statistics
 * @access Private (Admin)
 */
router.get('/:id/statistics',
  auth,
  authorize('admin'),
  async (req, res) => {
    try {
      const organization = await Organization.findById(req.params.id);

      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      // Get statistics
      const statistics = await organization.getStatistics();

      res.json({ statistics });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({ message: 'Error fetching statistics' });
    }
});

module.exports = router;
