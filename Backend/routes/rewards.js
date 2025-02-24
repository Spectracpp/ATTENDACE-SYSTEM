const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

// Available rewards data
const AVAILABLE_REWARDS = {
  timeOff: [
    { id: 'to1', name: 'Extra Day Off', points: 1000, description: 'Get an extra day off', icon: '🌴' },
    { id: 'to2', name: 'Half Day Friday', points: 500, description: 'Leave early on a Friday', icon: '🎉' },
    { id: 'to3', name: 'Late Start Day', points: 300, description: 'Start work 2 hours later', icon: '⏰' },
    { id: 'to4', name: 'Extended Lunch Break', points: 200, description: 'Get an extra hour for lunch', icon: '🍽️' }
  ],
  workPerks: [
    { id: 'wp1', name: 'Premium Parking Spot', points: 800, description: 'Reserved parking spot for a month', icon: '🚗' },
    { id: 'wp2', name: 'Office Setup Upgrade', points: 1200, description: 'Upgrade your office equipment', icon: '💻' },
    { id: 'wp3', name: 'Work From Home Week', points: 1500, description: 'Work from home for a week', icon: '🏠' },
    { id: 'wp4', name: 'Premium Coffee Machine Access', points: 400, description: 'Access to premium coffee machine', icon: '☕' }
  ],
  wellness: [
    { id: 'w1', name: 'Gym Membership', points: 2000, description: 'One month gym membership', icon: '💪' },
    { id: 'w2', name: 'Meditation App Subscription', points: 600, description: '3-month meditation app access', icon: '🧘' },
    { id: 'w3', name: 'Wellness Workshop', points: 400, description: 'Attend a wellness workshop', icon: '🌿' },
    { id: 'w4', name: 'Healthy Lunch Package', points: 300, description: 'Healthy lunch for a week', icon: '🥗' }
  ],
  learning: [
    { id: 'l1', name: 'Online Course Access', points: 1000, description: 'Access to online learning platform', icon: '📚' },
    { id: 'l2', name: 'Professional Certification', points: 3000, description: 'Get certified in your field', icon: '🎓' },
    { id: 'l3', name: 'Conference Ticket', points: 2500, description: 'Attend a professional conference', icon: '🎫' },
    { id: 'l4', name: 'Book Allowance', points: 500, description: 'Monthly book purchase allowance', icon: '📖' }
  ],
  teamBonding: [
    { id: 'tb1', name: 'Team Lunch Host', points: 800, description: 'Host a team lunch', icon: '🍱' },
    { id: 'tb2', name: 'Activity Organizer', points: 1000, description: 'Organize team activity', icon: '🎮' },
    { id: 'tb3', name: 'Happy Hour Sponsor', points: 600, description: 'Sponsor team happy hour', icon: '🍻' }
  ],
  techGear: [
    { id: 'tg1', name: 'Premium Headphones', points: 2000, description: 'High-quality noise-canceling headphones', icon: '🎧' },
    { id: 'tg2', name: 'Wireless Mouse & Keyboard', points: 1500, description: 'Ergonomic wireless peripherals', icon: '🖱️' },
    { id: 'tg3', name: 'Power Bank', points: 500, description: 'Portable power bank', icon: '🔋' },
    { id: 'tg4', name: 'Phone Stand', points: 200, description: 'Adjustable phone/tablet stand', icon: '📱' }
  ],
  recognition: [
    { id: 'r1', name: 'Wall of Fame Feature', points: 1500, description: 'Featured on company wall of fame', icon: '🏆' },
    { id: 'r2', name: 'Newsletter Spotlight', points: 1000, description: 'Featured in company newsletter', icon: '📰' },
    { id: 'r3', name: 'LinkedIn Recommendation', points: 800, description: 'Professional recommendation', icon: '👔' }
  ]
};

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

// Get all reward categories
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = Object.keys(AVAILABLE_REWARDS).map(key => ({
      id: key,
      name: key.split(/(?=[A-Z])/).join(' '),
      count: AVAILABLE_REWARDS[key].length
    }));
    
    res.json(categories);
  } catch (error) {
    console.error('Error fetching reward categories:', error);
    res.status(500).json({ message: 'Error fetching reward categories' });
  }
});

// Get rewards by category
router.get('/category/:categoryId', auth, async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    if (!AVAILABLE_REWARDS[categoryId]) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(AVAILABLE_REWARDS[categoryId]);
  } catch (error) {
    console.error('Error fetching rewards by category:', error);
    res.status(500).json({ message: 'Error fetching rewards' });
  }
});

// Get all available rewards
router.get('/available', auth, async (req, res) => {
  try {
    const allRewards = Object.entries(AVAILABLE_REWARDS).reduce((acc, [category, rewards]) => {
      return acc.concat(rewards.map(reward => ({ ...reward, category })));
    }, []);
    
    res.json(allRewards);
  } catch (error) {
    console.error('Error fetching available rewards:', error);
    res.status(500).json({ message: 'Error fetching available rewards' });
  }
});

// Get user's claimed rewards
router.get('/claimed', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('rewards');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.rewards);
  } catch (error) {
    console.error('Error fetching claimed rewards:', error);
    res.status(500).json({ message: 'Error fetching claimed rewards' });
  }
});

// Claim a reward
router.post('/claim/:rewardId', auth, async (req, res) => {
  try {
    const { rewardId } = req.params;
    
    // Find the reward in available rewards
    let reward = null;
    let category = null;
    
    for (const [cat, rewards] of Object.entries(AVAILABLE_REWARDS)) {
      const found = rewards.find(r => r.id === rewardId);
      if (found) {
        reward = found;
        category = cat;
        break;
      }
    }

    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has enough points
    if (user.points < reward.points) {
      return res.status(400).json({ message: 'Insufficient points' });
    }

    // Add reward to user's claimed rewards
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days expiry

    user.rewards.push({
      id: reward.id,
      name: reward.name,
      claimed: new Date(),
      expiresAt: expiryDate
    });

    // Deduct points
    user.points -= reward.points;

    await user.save();

    res.json({
      message: 'Reward claimed successfully',
      reward: {
        ...reward,
        category,
        claimed: new Date(),
        expiresAt: expiryDate
      }
    });
  } catch (error) {
    console.error('Error claiming reward:', error);
    res.status(500).json({ message: 'Error claiming reward' });
  }
});

// Calculate next reward
function calculateNextReward(points) {
  const allRewards = Object.values(AVAILABLE_REWARDS).flat();
  const sortedRewards = [...allRewards].sort((a, b) => a.points - b.points);
  
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
