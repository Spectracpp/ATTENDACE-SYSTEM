'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FaGift, FaCoins, FaTrophy, FaHistory, FaExchangeAlt } from 'react-icons/fa';
import { getUserPoints, getAllRewards, getClaimedRewards, claimReward } from '@/lib/api/rewards';
import { useAuth } from '@/app/context/AuthContext';

export default function UserRewards() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [claiming, setClaimingId] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [availableRewards, setAvailableRewards] = useState([]);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [activeTab, setActiveTab] = useState('available');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Rewards', icon: <FaGift /> },
    { id: 'timeOff', name: 'Time Off', icon: <FaHistory /> },
    { id: 'workPerks', name: 'Work Perks', icon: <FaExchangeAlt /> },
    { id: 'wellness', name: 'Wellness', icon: <FaTrophy /> },
    { id: 'learning', name: 'Learning', icon: <FaGift /> },
    { id: 'teamBonding', name: 'Team Bonding', icon: <FaGift /> }
  ];

  // Fetch user points and rewards data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch user points
        const pointsResponse = await getUserPoints();
        if (pointsResponse.success) {
          setUserPoints(pointsResponse.points);
        } else {
          toast.error('Failed to fetch points');
        }

        // Fetch available rewards
        const rewardsResponse = await getAllRewards();
        if (rewardsResponse.success) {
          setAvailableRewards(rewardsResponse.rewards || []);
        } else {
          toast.error('Failed to fetch rewards');
        }

        // Fetch claimed rewards
        const claimedResponse = await getClaimedRewards();
        if (claimedResponse.success) {
          setClaimedRewards(claimedResponse.rewards || []);
        } else {
          toast.error('Failed to fetch claimed rewards');
        }
      } catch (error) {
        console.error('Error fetching rewards data:', error);
        toast.error('Error loading rewards data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle reward claim
  const handleClaimReward = async (rewardId) => {
    setClaimingId(rewardId);
    try {
      const response = await claimReward(rewardId);
      if (response.success) {
        toast.success('Reward claimed successfully!');
        
        // Update user points
        setUserPoints(prev => prev - response.reward.points);
        
        // Update claimed rewards list
        setClaimedRewards(prev => [...prev, response.reward]);
        
        // Remove or mark as claimed in available rewards
        setAvailableRewards(prev => 
          prev.map(reward => 
            reward.id === rewardId 
              ? { ...reward, claimed: true } 
              : reward
          )
        );
      } else {
        toast.error(response.message || 'Failed to claim reward');
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast.error('Error claiming reward');
    } finally {
      setClaimingId(null);
    }
  };

  // Filter rewards by category
  const filteredRewards = selectedCategory === 'all' 
    ? availableRewards 
    : availableRewards.filter(reward => reward.category === selectedCategory);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black/95 flex items-center justify-center">
        <div className="animate-pulse text-[#ff0080]">Loading rewards...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/95 text-white p-6">
      {/* Header with points */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#ff0080] to-[#7928ca]">
          Rewards Center
        </h1>
        <div className="flex items-center mt-4 md:mt-0 bg-black/50 p-3 rounded-lg border border-gray-800">
          <FaCoins className="text-yellow-400 mr-2 text-xl" />
          <span className="text-2xl font-bold text-yellow-400">{userPoints}</span>
          <span className="ml-2 text-gray-400">points available</span>
        </div>
      </div>

      {/* Category filters */}
      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex space-x-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center px-4 py-2 rounded-full whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-[#ff0080] to-[#7928ca] text-white'
                  : 'bg-black/50 border border-gray-800 text-gray-300 hover:bg-black/70'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mb-6 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('available')}
          className={`pb-2 px-4 font-medium ${
            activeTab === 'available'
              ? 'text-[#ff0080] border-b-2 border-[#ff0080]'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Available Rewards
        </button>
        <button
          onClick={() => setActiveTab('claimed')}
          className={`pb-2 px-4 font-medium ${
            activeTab === 'claimed'
              ? 'text-[#ff0080] border-b-2 border-[#ff0080]'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          My Rewards
        </button>
      </div>

      {/* Rewards grid */}
      {activeTab === 'available' ? (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredRewards.length > 0 ? (
            filteredRewards.map((reward) => (
              <motion.div
                key={reward.id}
                variants={itemVariants}
                className="bg-black/50 border border-gray-800 rounded-xl overflow-hidden hover:border-[#ff0080] transition-all"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-4xl">{reward.icon}</div>
                    <div className="flex items-center bg-black/50 px-3 py-1 rounded-full">
                      <FaCoins className="text-yellow-400 mr-1" />
                      <span className="font-bold text-yellow-400">{reward.points}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{reward.name}</h3>
                  <p className="text-gray-400 mb-4 text-sm">{reward.description}</p>
                  <div className="mt-auto">
                    <button
                      onClick={() => handleClaimReward(reward.id)}
                      disabled={userPoints < reward.points || claiming === reward.id}
                      className={`w-full py-2 px-4 rounded-lg font-medium ${
                        userPoints >= reward.points
                          ? 'bg-gradient-to-r from-[#ff0080] to-[#7928ca] hover:opacity-90 text-white'
                          : 'bg-gray-800 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {claiming === reward.id ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Claiming...
                        </span>
                      ) : userPoints >= reward.points ? (
                        'Claim Reward'
                      ) : (
                        `Need ${reward.points - userPoints} more points`
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-gray-400">
              No rewards found in this category.
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {claimedRewards.length > 0 ? (
            claimedRewards.map((reward) => (
              <motion.div
                key={reward.id}
                variants={itemVariants}
                className="bg-black/50 border border-gray-800 rounded-xl overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-4xl">{reward.icon || '🎁'}</div>
                    <div className="bg-green-900/50 text-green-400 px-3 py-1 rounded-full text-xs font-medium">
                      Claimed
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{reward.name}</h3>
                  <p className="text-gray-400 mb-2 text-sm">{reward.description || 'Reward claimed'}</p>
                  <div className="text-xs text-gray-500">
                    <p>Claimed: {new Date(reward.claimed).toLocaleDateString()}</p>
                    <p>Expires: {new Date(reward.expiresAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-gray-400">
              You haven't claimed any rewards yet.
            </div>
          )}
        </motion.div>
      )}

      {/* How to earn more points */}
      <div className="mt-12 bg-black/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">How to Earn More Points</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start p-3 bg-black/30 rounded-lg">
            <div className="bg-[#ff0080]/20 p-2 rounded-lg mr-3">
              <FaGift className="text-[#ff0080]" />
            </div>
            <div>
              <h3 className="font-medium">Mark Attendance</h3>
              <p className="text-sm text-gray-400">Earn 10 points each time you mark attendance</p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-black/30 rounded-lg">
            <div className="bg-[#7928ca]/20 p-2 rounded-lg mr-3">
              <FaGift className="text-[#7928ca]" />
            </div>
            <div>
              <h3 className="font-medium">Attendance Streak</h3>
              <p className="text-sm text-gray-400">Earn bonus points for consistent attendance</p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-black/30 rounded-lg">
            <div className="bg-[#ff0080]/20 p-2 rounded-lg mr-3">
              <FaGift className="text-[#ff0080]" />
            </div>
            <div>
              <h3 className="font-medium">Early Check-in</h3>
              <p className="text-sm text-gray-400">Earn extra points for early check-ins</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
