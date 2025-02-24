const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

// Get user rewards
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('points rewards');
    const attendance = await Attendance.find({ user: req.user.id });

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let lastDate = null;

    attendance.sort((a, b) => new Date(b.date) - new Date(a.date));

    for (let record of attendance) {
      const recordDate = new Date(record.date);
      
      if (!lastDate) {
        currentStreak = 1;
      } else {
        const dayDiff = Math.floor((lastDate - recordDate) / (1000 * 60 * 60 * 24));
        if (dayDiff === 1) {
          currentStreak++;
        } else {
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
          }
          currentStreak = 1;
        }
      }
      lastDate = recordDate;
    }

    // Update longest streak if current streak is longer
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    const rewards = {
      points: user.points || 0,
      currentStreak,
      longestStreak,
      rewards: user.rewards || [],
      nextReward: calculateNextReward(user.points || 0)
    };

    res.json(rewards);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Claim reward
router.post('/claim', auth, async (req, res) => {
  try {
    const { rewardId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const reward = AVAILABLE_REWARDS.find(r => r.id === rewardId);
    if (!reward) {
      return res.status(404).json({ msg: 'Reward not found' });
    }

    if (user.points < reward.points) {
      return res.status(400).json({ msg: 'Insufficient points' });
    }

    // Deduct points and add reward
    user.points -= reward.points;
    user.rewards.push({
      id: rewardId,
      name: reward.name,
      claimed: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days expiry
    });

    await user.save();
    res.json({ msg: 'Reward claimed successfully', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Available rewards
const AVAILABLE_REWARDS = [
  { id: 1, name: 'Extra Day Off', points: 1000, description: 'Get an extra day off' },
  { id: 2, name: 'Flexible Hours', points: 500, description: 'Flexible working hours for a week' },
  { id: 3, name: 'Lunch Voucher', points: 200, description: 'Free lunch voucher' },
  { id: 4, name: 'Early Leave', points: 100, description: 'Leave 2 hours early' }
];

// Get available rewards
router.get('/available', auth, async (req, res) => {
  try {
    res.json(AVAILABLE_REWARDS);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Calculate next reward
function calculateNextReward(points) {
  const sortedRewards = [...AVAILABLE_REWARDS].sort((a, b) => a.points - b.points);
  for (let reward of sortedRewards) {
    if (reward.points > points) {
      return {
        reward,
        pointsNeeded: reward.points - points
      };
    }
  }
  return null;
}

module.exports = router;
