const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

// Record attendance
router.post('/record', auth, async (req, res) => {
  try {
    const { type } = req.body; // 'in' or 'out'
    
    if (!type || (type !== 'in' && type !== 'out')) {
      return res.status(400).json({ message: 'Invalid attendance type' });
    }

    const attendance = new Attendance({
      user: req.user.id,
      type,
      date: new Date()
    });

    await attendance.save();

    // Add points for checking in
    if (type === 'in') {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      user.points += 10; // 10 points for each check-in
      await user.save();
    }

    res.json({ message: 'Attendance recorded successfully', attendance });
  } catch (error) {
    console.error('Error recording attendance:', error);
    res.status(500).json({ message: 'Error recording attendance' });
  }
});

// Get user's attendance history
router.get('/history', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (startDate && !endDate) {
      return res.status(400).json({ message: 'End date is required when start date is provided' });
    }

    if (endDate && !startDate) {
      return res.status(400).json({ message: 'Start date is required when end date is provided' });
    }

    let query = { user: req.user.id };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(100);

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    res.status(500).json({ message: 'Error fetching attendance history' });
  }
});

// Get today's attendance
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.find({
      user: req.user.id,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    }).sort({ date: 1 });

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching today\'s attendance:', error);
    res.status(500).json({ message: 'Error fetching today\'s attendance' });
  }
});

// Get attendance stats
router.get('/stats', auth, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await Attendance.aggregate([
      {
        $match: {
          user: req.user.id,
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          checkIn: {
            $min: {
              $cond: [{ $eq: ["$type", "in"] }, "$date", null]
            }
          },
          checkOut: {
            $max: {
              $cond: [{ $eq: ["$type", "out"] }, "$date", null]
            }
          }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);

    res.json(stats);
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    res.status(500).json({ message: 'Error fetching attendance stats' });
  }
});

module.exports = router;
