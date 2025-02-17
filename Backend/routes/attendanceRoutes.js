const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance.js");
const Organization = require("../models/Organization.js");
const User = require("../models/User.js");
const { auth, authorizeOrganization } = require("../middleware/auth");

// Get user's attendance history
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {
      user_id: req.params.userId,
    };

    // Ensure user can only access their own attendance or has organization admin rights
    if (req.user._id.toString() !== req.params.userId) {
      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const hasAccess = user.organizations.some(org => 
        req.user.hasOrganizationPermission(org.organization, 'admin')
      );

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // Add date range if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const attendance = await Attendance.find(query)
      .populate("marked_by", "name email")
      .populate({
        path: "organization",
        select: "name code type status"
      })
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching attendance history",
      error: error.message,
    });
  }
});

// Get organization's attendance for a specific date
router.get(
  "/organization/:organizationId/date/:date",
  auth,
  authorizeOrganization('member'),
  async (req, res) => {
    try {
      const date = new Date(req.params.date);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);

      const attendance = await Attendance.find({
        organization: req.params.organizationId,
        date: {
          $gte: date,
          $lt: nextDay,
        },
      })
        .populate("user", "name email employeeId")
        .populate("marked_by", "name email")
        .sort({ createdAt: 1 });

      res.json(attendance);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching attendance",
        error: error.message,
      });
    }
  }
);

// Get organization's attendance report (date range)
router.get(
  "/organization/:organizationId/report",
  auth,
  authorizeOrganization('admin'),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start and end dates are required" });
      }

      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const attendance = await Attendance.aggregate([
        {
          $match: {
            organization: mongoose.Types.ObjectId(req.params.organizationId),
            date: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: {
              user: "$user",
              date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }
            },
            checkIn: { $min: "$checkIn" },
            checkOut: { $max: "$checkOut" },
            status: { $first: "$status" }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "_id.user",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $unwind: "$user"
        },
        {
          $project: {
            date: "$_id.date",
            user: {
              _id: "$user._id",
              name: "$user.name",
              email: "$user.email",
              employeeId: "$user.employeeId"
            },
            checkIn: 1,
            checkOut: 1,
            status: 1,
            workHours: {
              $divide: [
                { $subtract: ["$checkOut", "$checkIn"] },
                3600000 // Convert milliseconds to hours
              ]
            }
          }
        },
        {
          $sort: { date: 1, "user.name": 1 }
        }
      ]);

      res.json(attendance);
    } catch (error) {
      res.status(500).json({
        message: "Error generating attendance report",
        error: error.message,
      });
    }
  }
);

// Mark attendance
router.post(
  "/mark/:organizationId",
  auth,
  authorizeOrganization('member'),
  async (req, res) => {
    try {
      const organization = await Organization.findById(req.params.organizationId);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      const now = new Date();
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const { start, end } = organization.settings.attendanceWindow;
      const [startHour, startMin] = start.split(':').map(Number);
      const [endHour, endMin] = end.split(':').map(Number);
      const startTime = startHour * 100 + startMin;
      const endTime = endHour * 100 + endMin;

      let status = 'present';
      if (currentTime > endTime) {
        status = 'late';
      }

      const attendance = new Attendance({
        user: req.user._id,
        organization: req.params.organizationId,
        date: now,
        checkIn: now,
        status,
        marked_by: req.user._id,
        location: req.body.location
      });

      await attendance.save();

      res.status(201).json({
        message: "Attendance marked successfully",
        attendance
      });
    } catch (error) {
      res.status(500).json({
        message: "Error marking attendance",
        error: error.message,
      });
    }
  }
);

module.exports = router;
