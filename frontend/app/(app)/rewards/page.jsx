'use client';

import { useState, useEffect } from 'react';
import { FaStar, FaTrophy, FaGift, FaFire } from 'react-icons/fa';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function RewardsPage() {
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState({
    points: 0,
    currentStreak: 0,
    longestStreak: 0,
    rewards: []
  });
  const [categories, setCategories] = useState({});
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    Promise.all([fetchRewards(), fetchCategories()])
      .finally(() => setLoading(false));
  }, []);

  const fetchRewards = async () => {
    try {
      const response = await fetch('/api/rewards', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch rewards');
      }
      const data = await response.json();
      setRewards(data);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast.error('Failed to load rewards');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/rewards/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load reward categories');
      setCategories({});
    }
  };

  const handleClaimReward = async (rewardId) => {
    try {
      const response = await fetch('/api/rewards/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rewardId })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.msg || 'Failed to claim reward');
      }

      toast.success('Reward claimed successfully');
      await Promise.all([fetchRewards(), fetchCategories()]);
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  const categoryNames = {
    timeOff: 'Time Off',
    workPerks: 'Work Perks',
    wellness: 'Wellness',
    learning: 'Learning',
    teamBonding: 'Team Bonding',
    techGear: 'Tech Gear',
    recognition: 'Recognition'
  };

  return (
    <div className="space-y-6">
      <div className="cyberpunk-card-gradient p-8">
        <h1 className="text-3xl font-bold cyberpunk-text-gradient mb-2">
          Rewards & Achievements
        </h1>
        <p className="text-gray-400">
          Earn points and unlock amazing rewards
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="cyberpunk-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-[#ff0080]">
              <FaStar size={24} />
            </div>
            <span className="text-2xl font-bold cyberpunk-text-gradient">
              {rewards?.points || 0}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-200">Total Points</h3>
            <p className="text-gray-400 text-sm">Keep earning more!</p>
          </div>
        </div>

        <div className="cyberpunk-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-[#7928ca]">
              <FaFire size={24} />
            </div>
            <span className="text-2xl font-bold cyberpunk-text-gradient">
              {rewards?.currentStreak || 0} days
            </span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-200">Current Streak</h3>
            <p className="text-gray-400 text-sm">Don't break the chain!</p>
          </div>
        </div>

        <div className="cyberpunk-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-[#4f46e5]">
              <FaTrophy size={24} />
            </div>
            <span className="text-2xl font-bold cyberpunk-text-gradient">
              {rewards?.longestStreak || 0} days
            </span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-200">Longest Streak</h3>
            <p className="text-gray-400 text-sm">Your best record!</p>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="cyberpunk-card p-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#ff0080] scrollbar-track-black">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeCategory === 'all'
                ? 'bg-[#ff0080] text-white'
                : 'bg-black/50 text-gray-400 hover:text-white'
            }`}
          >
            All Rewards
          </button>
          {Object.keys(categories).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeCategory === category
                  ? 'bg-[#ff0080] text-white'
                  : 'bg-black/50 text-gray-400 hover:text-white'
              }`}
            >
              {categoryNames[category]}
            </button>
          ))}
        </div>
      </div>

      {/* Available Rewards */}
      <div className="cyberpunk-card p-6">
        <h2 className="text-xl font-bold cyberpunk-text-gradient mb-6">
          {activeCategory === 'all' ? 'All Rewards' : categoryNames[activeCategory]}
        </h2>
        {Object.entries(categories).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(categories)
              .filter(([category]) => activeCategory === 'all' || category === activeCategory)
              .map(([category, categoryRewards]) =>
                categoryRewards.map((reward) => (
                  <div key={reward.id} className="cyberpunk-card-gradient p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{reward.icon}</span>
                        <div>
                          <h3 className="text-lg font-medium text-white">{reward.name}</h3>
                          <p className="text-sm text-gray-400">{reward.description}</p>
                          <span className="text-xs text-[#ff0080]">{reward.category}</span>
                        </div>
                      </div>
                      <span className="text-[#7928ca] font-bold">{reward.points} pts</span>
                    </div>
                    <button
                      onClick={() => handleClaimReward(reward.id)}
                      disabled={rewards?.points < reward.points}
                      className={`w-full cyberpunk-button ${
                        rewards?.points < reward.points
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      {rewards?.points < reward.points
                        ? `Need ${reward.points - rewards.points} more points`
                        : 'Claim Reward'}
                    </button>
                  </div>
                ))
              )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <FaGift className="mx-auto text-4xl mb-4 text-[#ff0080]" />
            <p>No rewards available at the moment</p>
          </div>
        )}
      </div>

      {/* Claimed Rewards */}
      {rewards?.rewards?.length > 0 && (
        <div className="cyberpunk-card p-6">
          <h2 className="text-xl font-bold cyberpunk-text-gradient mb-6">
            Claimed Rewards
          </h2>
          <div className="space-y-4">
            {rewards.rewards.map((reward, index) => (
              <div key={index} className="flex items-center justify-between p-4 cyberpunk-card-gradient">
                <div className="flex items-center gap-3">
                  <FaGift className="text-[#ff0080] text-xl" />
                  <div>
                    <h3 className="font-medium text-white">{reward.name}</h3>
                    <p className="text-sm text-gray-400">
                      Claimed on {new Date(reward.claimed).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">
                  Expires {new Date(reward.expiresAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
