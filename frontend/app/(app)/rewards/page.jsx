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
  const [availableRewards, setAvailableRewards] = useState([]);

  useEffect(() => {
    Promise.all([fetchRewards(), fetchAvailableRewards()])
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

  const fetchAvailableRewards = async () => {
    try {
      const response = await fetch('/api/rewards/available', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch available rewards');
      }
      const data = await response.json();
      setAvailableRewards(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching available rewards:', error);
      toast.error('Failed to load available rewards');
      setAvailableRewards([]);
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
      // Refresh both rewards and available rewards
      await Promise.all([fetchRewards(), fetchAvailableRewards()]);
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

      {/* Available Rewards */}
      <div className="cyberpunk-card p-6">
        <h2 className="text-xl font-bold cyberpunk-text-gradient mb-6">
          Available Rewards
        </h2>
        {availableRewards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableRewards.map((reward) => (
              <div key={reward.id} className="cyberpunk-card-gradient p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaGift className="text-[#ff0080] text-2xl" />
                    <div>
                      <h3 className="text-lg font-medium text-white">{reward.name}</h3>
                      <p className="text-sm text-gray-400">{reward.description}</p>
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
            ))}
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
