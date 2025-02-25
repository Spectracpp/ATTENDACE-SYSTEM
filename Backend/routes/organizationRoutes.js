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
 * @route GET /api/organizations/:id
 * @desc Get organization by ID
 * @access Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const organization = await Organization
      .findById(req.params.id)
      .populate('members.user', 'name email avatar')
      .lean();

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user is a member
    const isMember = organization.members.some(
      member => member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember && organization.type !== 'public') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      organization
    });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching organization' 
    });
  }
});

/**
 * @route POST /api/organizations
 * @desc Create a new organization
 * @access Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, type } = req.body;

    const organization = new Organization({
      name,
      description,
      type,
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      members: [{
        user: req.user._id,
        role: 'owner',
        status: 'active'
      }]
    });

    await organization.save();

    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      organization
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
 * @route PUT /api/organizations/:id
 * @desc Update organization
 * @access Private (Admin/Owner only)
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, type, settings } = req.body;
    const updates = {
      ...(name && { name }),
      ...(description && { description }),
      ...(type && { type }),
      ...(settings && { settings })
    };

    const organization = await Organization.findOneAndUpdate(
      { 
        _id: req.params.id,
        'members.user': req.user._id,
        'members.role': { $in: ['admin', 'owner'] }
      },
      { $set: updates },
      { new: true }
    );

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found or unauthorized'
      });
    }

    res.json({
      success: true,
      message: 'Organization updated successfully',
      organization
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
 * @desc Delete organization (soft delete)
 * @access Private (Owner only)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const organization = await Organization.findOneAndUpdate(
      {
        _id: req.params.id,
        'members.user': req.user._id,
        'members.role': 'owner'
      },
      { $set: { status: 'inactive' } },
      { new: true }
    );

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found or unauthorized'
      });
    }

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
 * @access Private (Admin/Owner only)
 */
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { userId, role = 'member' } = req.body;

    const organization = await Organization.findOneAndUpdate(
      {
        _id: req.params.id,
        'members.user': req.user._id,
        'members.role': { $in: ['admin', 'owner'] }
      },
      {
        $addToSet: {
          members: {
            user: userId,
            role,
            status: 'active'
          }
        }
      },
      { new: true }
    );

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found or unauthorized'
      });
    }

    res.json({
      success: true,
      message: 'Member added successfully',
      organization
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
 * @access Private (Admin/Owner only)
 */
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const organization = await Organization.findOneAndUpdate(
      {
        _id: req.params.id,
        'members.user': req.user._id,
        'members.role': { $in: ['admin', 'owner'] }
      },
      {
        $pull: {
          members: { user: req.params.userId }
        }
      },
      { new: true }
    );

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found or unauthorized'
      });
    }

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
 * @route GET /api/organizations/:id/members
 * @desc Get organization members
 * @access Private
 */
router.get('/:id/members', auth, async (req, res) => {
  try {
    const organization = await Organization
      .findById(req.params.id)
      .populate('members.user', 'name email avatar')
      .select('members')
      .lean();

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user is a member
    const isMember = organization.members.some(
      member => member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      members: organization.members
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching members' 
    });
  }
});

// Get all organizations (public endpoint for registration)
router.get('/public', async (req, res) => {
  try {
    const organizations = await Organization.find({ status: 'active' })
      .select('name code type')
      .sort('name');
    
    res.json({
      success: true,
      organizations
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organizations'
    });
  }
});

module.exports = router;
