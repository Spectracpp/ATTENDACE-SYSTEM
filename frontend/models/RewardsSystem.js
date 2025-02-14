// Rewards System Configuration

export const REWARDS_CONFIG = {
  // Daily Attendance Rewards
  dailyRewards: {
    baseTokens: 10, // Base tokens for attendance
    onTimeBonus: 5, // Additional tokens for being on time
    streakMultipliers: {
      3: 1.2, // 3 day streak = 20% bonus
      5: 1.5, // 5 day streak = 50% bonus
      10: 2.0, // 10 day streak = 100% bonus
      20: 2.5, // 20 day streak = 150% bonus
      30: 3.0, // 30 day streak = 200% bonus
    },
  },

  // Weekly Rewards
  weeklyRewards: {
    perfectAttendance: 50, // Bonus for 5/5 days
    fourDayBonus: 20, // Bonus for 4/5 days
  },

  // Monthly Rewards
  monthlyRewards: {
    perfectAttendance: 200, // Bonus for perfect monthly attendance
    highAttendance: 100, // Bonus for >90% attendance
    consistencyBonus: 50, // Bonus for no breaks in streak
  },

  // Level System
  levelSystem: {
    experiencePerToken: 10,
    levels: {
      1: { required: 0, title: 'Newcomer' },
      2: { required: 1000, title: 'Regular' },
      3: { required: 2500, title: 'Bronze' },
      4: { required: 5000, title: 'Silver' },
      5: { required: 10000, title: 'Gold' },
      6: { required: 20000, title: 'Platinum' },
      7: { required: 35000, title: 'Diamond' },
    },
  },

  // Special Achievements
  achievements: {
    firstDay: {
      id: 'FIRST_DAY',
      title: 'First Day!',
      description: 'Attend your first day',
      reward: 20,
    },
    weekStreak: {
      id: 'WEEK_STREAK',
      title: 'Week Warrior',
      description: 'Complete a full week streak',
      reward: 50,
    },
    monthStreak: {
      id: 'MONTH_STREAK',
      title: 'Monthly Master',
      description: 'Complete a full month streak',
      reward: 200,
    },
    perfectQuarter: {
      id: 'PERFECT_QUARTER',
      title: 'Quarterly Quest',
      description: 'Achieve 90% attendance in a quarter',
      reward: 500,
    },
    yearlyDedication: {
      id: 'YEARLY_DEDICATION',
      title: 'Yearly Excellence',
      description: 'Maintain 85% attendance for a year',
      reward: 2000,
    },
  },

  // Redemption Options
  redemptionRates: {
    crypto: {
      eth: {
        tokenCost: 500,
        amount: 0.001,
      },
      matic: {
        tokenCost: 100,
        amount: 1,
      },
    },
    vouchers: {
      amazon: {
        tokenCost: 300,
        amount: 10, // USD
      },
      starbucks: {
        tokenCost: 100,
        discount: 15, // Percentage
      },
    },
  },
};

// Utility functions for the reward system
export const calculateDailyReward = (onTime, currentStreak) => {
  let reward = REWARDS_CONFIG.dailyRewards.baseTokens;
  
  // Add on-time bonus
  if (onTime) {
    reward += REWARDS_CONFIG.dailyRewards.onTimeBonus;
  }
  
  // Apply streak multiplier
  const streakLevels = Object.keys(REWARDS_CONFIG.dailyRewards.streakMultipliers)
    .map(Number)
    .sort((a, b) => b - a);
  
  for (const level of streakLevels) {
    if (currentStreak >= level) {
      reward *= REWARDS_CONFIG.dailyRewards.streakMultipliers[level];
      break;
    }
  }
  
  return Math.floor(reward);
};

export const calculateLevel = (experience) => {
  const levels = Object.entries(REWARDS_CONFIG.levelSystem.levels)
    .map(([level, data]) => ({ level: Number(level), ...data }))
    .sort((a, b) => b.required - a.required);

  for (const { level, required, title } of levels) {
    if (experience >= required) {
      return { level, title };
    }
  }

  return { level: 1, title: 'Newcomer' };
};

export const checkAchievements = (userStats) => {
  const unlockedAchievements = [];
  const achievements = REWARDS_CONFIG.achievements;

  // Check each achievement condition
  if (userStats.totalDays === 1) {
    unlockedAchievements.push(achievements.firstDay);
  }
  if (userStats.currentStreak >= 7) {
    unlockedAchievements.push(achievements.weekStreak);
  }
  if (userStats.currentStreak >= 30) {
    unlockedAchievements.push(achievements.monthStreak);
  }
  // Add more achievement checks as needed

  return unlockedAchievements;
};
