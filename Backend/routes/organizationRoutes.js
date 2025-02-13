const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const { organizationValidation } = require('../middleware/validate');
const { rateLimiter } = require('../middleware/rateLimiter');

/**
 * @route GET /api/organizations
 * @desc Get all organizations (paginated)
 * @access Public
 */
router.get('/',
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
 * @access Private (Admin)
 */
router.post('/',
  auth,
  authorize('admin'),
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
        createdBy: req.user._id,
        admins: [{ user: req.user._id, role: 'owner' }]
      });

      await organization.save();

      // Add organization to user's organizations
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          organizations: {
            organization: organization._id,
            role: 'owner'
          }
        }
      });

      res.status(201).json({
        message: 'Organization created successfully',
        organization
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
        .populate('admins.user', 'firstName lastName email')
        .populate('members.user', 'firstName lastName email');

      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      // Check if user has access
      const member = [...organization.admins, ...organization.members]
        .find(m => m.user._id.toString() === req.user._id.toString());

      if (!member) {
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

      // Check if user is admin
      const admin = organization.admins
        .find(a => a.user.toString() === req.user._id.toString());

      if (!admin) {
        return res.status(403).json({ message: 'Access denied' });
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
 * @desc Add member to organization
 * @access Private (Admin)
 */
router.post('/:id/members',
  auth,
  authorize('admin'),
  organizationValidation.addMember,
  async (req, res) => {
    try {
      const { email, role } = req.body;
      const organization = await Organization.findById(req.params.id);

      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      // Check if user is admin
      const admin = organization.admins
        .find(a => a.user.toString() === req.user._id.toString());

      if (!admin) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user is already a member
      const existingMember = [...organization.admins, ...organization.members]
        .find(m => m.user.toString() === user._id.toString());

      if (existingMember) {
        return res.status(400).json({ message: 'User is already a member' });
      }

      // Add member
      organization.members.push({
        user: user._id,
        role
      });

      await organization.save();

      // Add organization to user's organizations
      await User.findByIdAndUpdate(user._id, {
        $push: {
          organizations: {
            organization: organization._id,
            role
          }
        }
      });

      res.json({
        message: 'Member added successfully',
        organization
      });
    } catch (error) {
      console.error('Add member error:', error);
      res.status(500).json({ message: 'Error adding member' });
    }
});

/**
 * @route DELETE /api/organizations/:id/members/:userId
 * @desc Remove member from organization
 * @access Private (Admin)
 */
router.delete('/:id/members/:userId',
  auth,
  authorize('admin'),
  async (req, res) => {
    try {
      const organization = await Organization.findById(req.params.id);

      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      // Check if user is admin
      const admin = organization.admins
        .find(a => a.user.toString() === req.user._id.toString());

      if (!admin) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Remove member
      organization.members = organization.members
        .filter(m => m.user.toString() !== req.params.userId);

      await organization.save();

      // Remove organization from user's organizations
      await User.findByIdAndUpdate(req.params.userId, {
        $pull: {
          organizations: {
            organization: organization._id
          }
        }
      });

      res.json({
        message: 'Member removed successfully',
        organization
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

      // Check if user is admin
      const admin = organization.admins
        .find(a => a.user.toString() === req.user._id.toString());

      if (!admin) {
        return res.status(403).json({ message: 'Access denied' });
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
