const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { auth } = require('../middleware/auth');

// We need to create a Leave model, let's first check if it exists
let Leave;
try {
  Leave = mongoose.model('Leave');
} catch (e) {
  // Create Leave model if it doesn't exist
  const leaveSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      enum: ['sick', 'casual', 'emergency'],
      default: 'sick'
    },
    reason: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectionReason: String
  }, {
    timestamps: true
  });

  Leave = mongoose.model('Leave', leaveSchema);
}

/**
 * @route GET /api/user/leaves
 * @desc Get user's leave requests
 * @access Private
 */
router.get('/leaves', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const leaves = await Leave.find({
      user: userId
    })
    .sort({ createdAt: -1 })
    .populate('organization', 'name')
    .lean();

    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leave requests'
    });
  }
});

/**
 * @route POST /api/user/leaves
 * @desc Submit a leave request
 * @access Private
 */
router.post('/leaves', auth, async (req, res) => {
  try {
    const { startDate, endDate, type, reason } = req.body;
    const userId = req.user._id;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be after end date'
      });
    }

    if (start < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot request leave for past dates'
      });
    }

    // Get user's organization
    const Organization = mongoose.model('Organization');
    const userOrg = await Organization.findOne({
      'members.user': userId
    });

    if (!userOrg) {
      return res.status(404).json({
        success: false,
        message: 'You are not associated with any organization'
      });
    }

    // Create leave request
    const leave = new Leave({
      user: userId,
      organization: userOrg._id,
      startDate: start,
      endDate: end,
      type,
      reason,
      status: 'pending'
    });

    await leave.save();

    res.json({
      success: true,
      message: 'Leave request submitted successfully',
      leave: {
        _id: leave._id,
        startDate: leave.startDate,
        endDate: leave.endDate,
        type: leave.type,
        reason: leave.reason,
        status: leave.status
      }
    });
  } catch (error) {
    console.error('Error submitting leave request:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting leave request'
    });
  }
});

/**
 * @route GET /api/user/leaves/pending
 * @desc Get count of pending leave requests
 * @access Private
 */
router.get('/leaves/pending', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const count = await Leave.countDocuments({
      user: userId,
      status: 'pending'
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error fetching pending leaves count:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending leaves count'
    });
  }
});

/**
 * @route DELETE /api/user/leaves/:id
 * @desc Cancel a pending leave request
 * @access Private
 */
router.delete('/leaves/:id', auth, async (req, res) => {
  try {
    const leaveId = req.params.id;
    const userId = req.user._id;
    
    const leave = await Leave.findOne({
      _id: leaveId,
      user: userId,
      status: 'pending'
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found or cannot be cancelled'
      });
    }

    await Leave.deleteOne({ _id: leaveId });

    res.json({
      success: true,
      message: 'Leave request cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling leave request:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling leave request'
    });
  }
});

module.exports = router;
