const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/organization');
const { organizationValidation } = require('../middleware/validate');
const { rateLimiter } = require('../middleware/rateLimiter');

/**
 * @route GET /api/organizations
 * @desc Get all organizations (public)
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const organizations = await Organization
      .find({ status: 'active' })
      .select('name description type members')
      .lean();

    res.json({
      success: true,
      organizations: organizations.map(org => ({
        _id: org._id,
        name: org.name,
        description: org.description,
        type: org.type,
        memberCount: org.members?.length || 0
      }))
    });
  } catch (error) {
    console.error('List organizations error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching organizations' 
    });
  }
});

/**
 * @route GET /api/organizations/my
 * @desc Get user's organizations
 * @access Private
 */
router.get('/my', auth, async (req, res) => {
  try {
    const organizations = await Organization
      .find({ 'members.user': req.user._id })
      .select('name description type members settings')
      .lean();

    res.json({
      success: true,
      organizations: organizations.map(org => ({
        _id: org._id,
        name: org.name,
        description: org.description,
        type: org.type,
        role: org.members.find(m => m.user.toString() === req.user._id.toString())?.role,
        settings: org.settings
      }))
    });
  } catch (error) {
    console.error('Fetch user organizations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your organizations'
    });
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
      const { name, description, type, settings } = req.body;

      const organization = new Organization({
        name,
        description,
        type,
        settings: {
          maxQrScans: settings?.maxQrScans || 1,
          allowMultipleScans: settings?.allowMultipleScans || false,
          locationRadius: settings?.locationRadius || 100,
          ...settings
        },
        members: [{
          user: req.user._id,
          role: 'admin',
          joinedAt: new Date()
        }]
      });

      await organization.save();

      res.status(201).json({
        success: true,
        message: 'Organization created successfully',
        organization: {
          _id: organization._id,
          name: organization.name,
          description: organization.description,
          type: organization.type,
          settings: organization.settings,
          role: 'admin'
        }
      });
    } catch (error) {
      console.error('Create organization error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating organization'
      });
    }
});

/**
 * @route GET /api/organizations/:id
 * @desc Get organization details
 * @access Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const organization = await Organization
      .findById(req.params.id)
      .populate('members.user', 'name email')
      .lean();

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user is a member
    const member = organization.members.find(m => 
      m.user._id.toString() === req.user._id.toString()
    );

    if (!member) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      organization: {
        _id: organization._id,
        name: organization.name,
        description: organization.description,
        type: organization.type,
        settings: organization.settings,
        members: organization.members.map(m => ({
          _id: m.user._id,
          name: m.user.name,
          email: m.user.email,
          role: m.role,
          joinedAt: m.joinedAt
        })),
        role: member.role
      }
    });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching organization details'
    });
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
      const { name, description, type, settings } = req.body;
      const organization = await Organization.findById(req.params.id);

      if (!organization) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found'
        });
      }

      // Update fields
      if (name) organization.name = name;
      if (description) organization.description = description;
      if (type) organization.type = type;
      if (settings) {
        organization.settings = {
          ...organization.settings,
          ...settings
        };
      }

      await organization.save();

      res.json({
        success: true,
        message: 'Organization updated successfully',
        organization: {
          _id: organization._id,
          name: organization.name,
          description: organization.description,
          type: organization.type,
          settings: organization.settings
        }
      });
    } catch (error) {
      console.error('Update organization error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating organization'
      });
    }
});

/**
 * @route DELETE /api/organizations/:id
 * @desc Delete organization
 * @access Private (Admin)
 */
router.delete('/:id',
  auth,
  authorize('admin'),
  async (req, res) => {
    try {
      const organization = await Organization.findById(req.params.id);

      if (!organization) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found'
        });
      }

      await organization.remove();

      res.json({
        success: true,
        message: 'Organization deleted successfully'
      });
    } catch (error) {
      console.error('Delete organization error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting organization'
      });
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
        return res.status(404).json({
          success: false,
          message: 'Organization not found'
        });
      }

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if already a member
      if (organization.members.some(m => m.user.toString() === user._id.toString())) {
        return res.status(400).json({
          success: false,
          message: 'User is already a member'
        });
      }

      // Add member
      organization.members.push({
        user: user._id,
        role: role || 'member',
        joinedAt: new Date()
      });

      await organization.save();

      res.json({
        success: true,
        message: 'Member added successfully',
        member: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: role || 'member'
        }
      });
    } catch (error) {
      console.error('Add member error:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding member'
      });
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
        return res.status(404).json({
          success: false,
          message: 'Organization not found'
        });
      }

      // Remove member
      organization.members = organization.members.filter(
        m => m.user.toString() !== req.params.userId
      );

      await organization.save();

      res.json({
        success: true,
        message: 'Member removed successfully'
      });
    } catch (error) {
      console.error('Remove member error:', error);
      res.status(500).json({
        success: false,
        message: 'Error removing member'
      });
    }
});

/**
 * @route PUT /api/organizations/:id/members/:userId
 * @desc Update member role
 * @access Private (Admin)
 */
router.put('/:id/members/:userId',
  auth,
  authorize('admin'),
  organizationValidation.updateMember,
  async (req, res) => {
    try {
      const { role } = req.body;
      const organization = await Organization.findById(req.params.id);

      if (!organization) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found'
        });
      }

      // Update member role
      const member = organization.members.find(
        m => m.user.toString() === req.params.userId
      );

      if (!member) {
        return res.status(404).json({
          success: false,
          message: 'Member not found'
        });
      }

      member.role = role;
      await organization.save();

      res.json({
        success: true,
        message: 'Member role updated successfully',
        member: {
          _id: req.params.userId,
          role
        }
      });
    } catch (error) {
      console.error('Update member role error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating member role'
      });
    }
});

module.exports = router;
