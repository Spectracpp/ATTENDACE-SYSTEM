const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance.js");
const Organization = require("../models/Organization.js");
const User = require("../models/User.js");
const auth = require("../middleware/auth");

// Get user's attendance history
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {
      user_id: req.params.userId,
    };

    // Add date range if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const attendance = await Attendance.find(query)
      .populate("marked_by", "name email -_id")
      .populate("qr_code")
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
router.get("/organization/:uid/date/:date", auth, async (req, res) => {
  try {
    // Validate organization membership
    const organization = await Organization.findOne({ uid: req.params.uid });
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const isMember =
      organization.admin_ids.includes(req.user._id) ||
      organization.user_ids.includes(req.user._id);

    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    const date = new Date(req.params.date);
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    const attendance = await Attendance.find({
      organisation_uid: req.params.uid,
      date: {
        $gte: date,
        $lt: nextDay,
      },
    })
      .populate("user_id", "name email user_id")
      .populate("marked_by", "name email")
      .sort({ roll_no: 1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching attendance",
      error: error.message,
    });
  }
});

// Get organization's attendance report (date range)
router.get("/organization/:uid/report", auth, async (req, res) => {
  try {
    // Validate organization membership
    const organization = await Organization.findOne({ uid: req.params.uid });
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    if (!organization.admin_ids.includes(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Only admins can access reports" });
    }

    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Start and end dates are required" });
    }

    const report = await Attendance.aggregate([
      {
        $match: {
          organisation_uid: req.params.uid,
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: "$user_id",
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: {
              $cond: [{ $eq: ["$status", "present"] }, 1, 0],
            },
          },
          roll_no: { $first: "$roll_no" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          roll_no: 1,
          name: "$user.name",
          email: "$user.email",
          totalDays: 1,
          presentDays: 1,
          attendancePercentage: {
            $multiply: [{ $divide: ["$presentDays", "$totalDays"] }, 100],
          },
        },
      },
      {
        $sort: { roll_no: 1 },
      },
    ]);

    res.json(report);
  } catch (error) {
    res.status(500).json({
      message: "Error generating attendance report",
      error: error.message,
    });
  }
});

// Mark attendance when QR code is scanned
router.post("/mark", auth, async (req, res) => {
  try {
    if (req.userType !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can mark attendance" });
    }

    const { qr_code_id, user_id, organisation_uid, roll_no } = req.body;

    // Create or update attendance record
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOneAndUpdate(
      {
        organisation_uid,
        user_id,
        date,
      },
      {
        $set: {
          status: "present",
          qr_code: qr_code_id,
          marked_by: req.user._id,
          marked_at: new Date(),
          roll_no,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.json({
      message: "Attendance marked successfully",
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error marking attendance",
      error: error.message,
    });
  }
});

module.exports = router;
