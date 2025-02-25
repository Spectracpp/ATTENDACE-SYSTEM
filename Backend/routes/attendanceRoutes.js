const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance.js");
const Organization = require("../models/Organization.js");
const User = require("../models/User.js");
const { auth } = require("../middleware/auth");
const { validateAttendance } = require("../middleware/validate");
const { authorize } = require("../middleware/organization");

/**
 * @route GET /api/attendance/history
 * @desc Get user's attendance history
 * @access Private
 */
router.get("/history", auth, async (req, res) => {
  try {
    const { startDate, endDate, organizationId, page = 1, limit = 10 } = req.query;
    const query = { user_id: req.user._id };

    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (organizationId) {
      query.organization_id = organizationId;
    }

    const skip = (page - 1) * limit;
    const [attendance, total] = await Promise.all([
      Attendance.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('organization_id', 'name')
        .lean(),
      Attendance.countDocuments(query)
    ]);

    res.json({
      success: true,
      attendance: attendance.map(record => ({
        _id: record._id,
        timestamp: record.timestamp,
        type: record.type,
        organization: record.organization_id ? {
          _id: record.organization_id._id,
          name: record.organization_id.name
        } : null,
        location: record.location
      })),
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance history'
    });
  }
});

/**
 * @route GET /api/attendance/organization/:organizationId
 * @desc Get attendance records for an organization (admin only)
 * @access Private (Admin)
 */
router.get("/organization/:organizationId", 
  auth,
  authorize('admin'),
  async (req, res) => {
    try {
      const { organizationId } = req.params;
      const { startDate, endDate, userId, page = 1, limit = 10 } = req.query;
      
      const query = { organization_id: organizationId };

      if (startDate && endDate) {
        query.timestamp = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      if (userId) {
        query.user_id = userId;
      }

      const skip = (page - 1) * limit;
      const [attendance, total] = await Promise.all([
        Attendance.find(query)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .populate('user_id', 'name email employeeId')
          .lean(),
        Attendance.countDocuments(query)
      ]);

      res.json({
        success: true,
        attendance,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching organization attendance:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching organization attendance'
      });
    }
});

/**
 * @route GET /api/attendance/stats/:organizationId
 * @desc Get attendance statistics for an organization
 * @access Private (Admin)
 */
router.get("/stats/:organizationId",
  auth,
  authorize('admin'),
  async (req, res) => {
    try {
      const { organizationId } = req.params;
      const { startDate, endDate } = req.query;

      const query = { organization_id: organizationId };
      if (startDate && endDate) {
        query.timestamp = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const [totalAttendance, uniqueUsers, attendanceByType] = await Promise.all([
        Attendance.countDocuments(query),
        Attendance.distinct('user_id', query).then(users => users.length),
        Attendance.aggregate([
          { $match: query },
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 }
            }
          }
        ])
      ]);

      // Get daily attendance trend
      const dailyTrend = await Attendance.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      res.json({
        success: true,
        stats: {
          totalAttendance,
          uniqueUsers,
          attendanceByType: attendanceByType.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
          }, {}),
          dailyTrend: dailyTrend.map(day => ({
            date: day._id,
            count: day.count
          }))
        }
      });
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching attendance statistics'
      });
    }
});

/**
 * @route GET /api/attendance/report/:organizationId
 * @desc Generate attendance report for an organization
 * @access Private (Admin)
 */
router.get("/report/:organizationId",
  auth,
  authorize('admin'),
  async (req, res) => {
    try {
      const { organizationId } = req.params;
      const { startDate, endDate, format = 'json' } = req.query;

      const query = { organization_id: organizationId };
      if (startDate && endDate) {
        query.timestamp = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const attendance = await Attendance.find(query)
        .sort({ timestamp: -1 })
        .populate('user_id', 'name email employeeId')
        .lean();

      if (format === 'csv') {
        const csv = attendance.map(record => ({
          Date: new Date(record.timestamp).toLocaleDateString(),
          Time: new Date(record.timestamp).toLocaleTimeString(),
          'Employee Name': record.user_id.name,
          'Employee ID': record.user_id.employeeId,
          'Email': record.user_id.email,
          'Type': record.type,
          'Location': record.location ? `${record.location.coordinates[1]}, ${record.location.coordinates[0]}` : 'N/A'
        }));

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=attendance-report-${new Date().toISOString().split('T')[0]}.csv`);
        
        // Convert to CSV string
        const csvString = [
          Object.keys(csv[0]).join(','),
          ...csv.map(row => Object.values(row).join(','))
        ].join('\n');

        return res.send(csvString);
      }

      res.json({
        success: true,
        report: attendance
      });
    } catch (error) {
      console.error('Error generating attendance report:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating attendance report'
      });
    }
});

// Mark attendance
router.post("/mark/:organizationId", auth, async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { type, location } = req.body;

    // Validate organization
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    const isMember = organization.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this organization'
      });
    }

    // Create attendance record
    const attendance = new Attendance({
      user_id: req.user._id,
      organization_id: organizationId,
      type,
      location,
      timestamp: new Date()
    });

    await attendance.save();

    res.json({
      success: true,
      message: 'Attendance marked successfully',
      attendance: {
        _id: attendance._id,
        timestamp: attendance.timestamp,
        type: attendance.type,
        location: attendance.location
      }
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking attendance'
    });
  }
});

module.exports = router;
