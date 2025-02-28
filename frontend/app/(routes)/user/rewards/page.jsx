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
  const [claiming, setClaiming] = useState(null);
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
          setUserPoints(pointsResponse.points || 0);
        } else {
          toast.error('Failed to fetch points');
        }

        // Fetch available rewards
        const rewardsResponse = await getAllRewards();
        if (rewardsResponse.success) {
          setAvailableRewards(rewardsResponse.rewards || []);
        } else {
          toast.error('Failed to fetch rewards');
          setAvailableRewards([]);
        }

        // Fetch claimed rewards
        const claimedResponse = await getClaimedRewards();
        if (claimedResponse.success) {
          setClaimedRewards(claimedResponse.rewards || []);
        } else {
          toast.error('Failed to fetch claimed rewards');
          setClaimedRewards([]);
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

  // Handle claiming a reward
  const handleClaimReward = async (rewardId) => {
    setClaiming(rewardId);

    try {
      const reward = availableRewards.find(r => r.id === rewardId);
      if (!reward) {
        toast.error('Reward not found');
        setClaiming(null);
        return;
      }

      if (userPoints < reward.points) {
        toast.error('Not enough points to claim this reward');
        setClaiming(null);
        return;
      }

      const response = await claimReward(rewardId);

      if (response.success) {
        // Deduct points and add to claimed rewards
        setUserPoints(prev => prev - reward.points);
        setClaimedRewards(prev => [...prev, response.reward]);
        
        // Remove from available (optional - depends on how backend is set up)
        // If the reward can be claimed multiple times, don't remove it
        // setAvailableRewards(prev => prev.filter(r => r.id !== rewardId));
        
        toast.success(response.message || 'Reward claimed successfully!');
        
        // Switch to claimed tab
        setActiveTab('claimed');
      } else {
        toast.error(response.message || 'Failed to claim reward');
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast.error('An error occurred while claiming the reward');
    } finally {
      setClaiming(null);
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header with points display */}
      <motion.div 
        className="mb-10 p-8 rounded-2xl bg-gradient-to-br from-[#121218] to-[#1a1a24] border border-gray-800 shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Your Rewards</h1>
            <p className="text-gray-400">Earn points by being present and claim exciting rewards!</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-[2px] rounded-2xl">
              <div className="bg-gray-900 rounded-2xl p-4 flex items-center gap-4 w-full">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-3">
                  <FaCoins className="text-xl text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Your Balance</p>
                  <div className="flex items-center">
                    <h2 className="text-2xl font-bold text-white">
                      {loading ? (
                        <span className="inline-block w-16 h-7 bg-gray-700 animate-pulse rounded"></span>
                      ) : (
                        <motion.span
                          key={userPoints}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {userPoints}
                        </motion.span>
                      )}
                    </h2>
                    <span className="ml-2 text-purple-400 font-medium">points</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Category tabs */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Browse Categories</h2>
        <div className="flex overflow-x-auto pb-2 space-x-2 no-scrollbar">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FaLayerGroup />
            All Rewards
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory('timeOff')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
              selectedCategory === 'timeOff'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FaCalendarAlt />
            Time Off
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory('workPerks')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
              selectedCategory === 'workPerks'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FaBriefcase />
            Work Perks
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory('wellness')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
              selectedCategory === 'wellness'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FaHeartbeat />
            Wellness
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory('learning')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
              selectedCategory === 'learning'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FaBook />
            Learning
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory('teamBonding')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
              selectedCategory === 'teamBonding'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FaUsers />
            Team Bonding
          </motion.button>
        </div>
      </div>

      {/* Available / Claimed toggle */}
      <div className="flex border border-gray-800 rounded-lg p-1 mb-8 max-w-md">
        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
            activeTab === 'available'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Available Rewards
        </button>
        <button
          onClick={() => setActiveTab('claimed')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
            activeTab === 'claimed'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Claimed Rewards
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 bg-gray-800 rounded-md animate-pulse"></div>
                <div className="w-16 h-6 bg-gray-800 rounded-full animate-pulse"></div>
              </div>
              <div className="w-3/4 h-6 bg-gray-800 rounded animate-pulse mb-2"></div>
              <div className="w-full h-4 bg-gray-800 rounded animate-pulse mb-4"></div>
              <div className="w-full h-4 bg-gray-800 rounded animate-pulse mb-2"></div>
              <div className="mt-auto w-full h-10 bg-gray-800 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>
      )}

      {/* Rewards grid */}
      {!loading && activeTab === 'available' ? (
        filteredRewards.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredRewards.map((reward, index) => (
              <motion.div
                key={reward.id} 
                variants={itemVariants}
                custom={index}
                className="bg-gradient-to-br from-[#1f1f2b] to-[#121218] border border-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-purple-900/10 hover:border-purple-500/30 transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-4xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-3 rounded-xl">
                      {reward.icon || '🎁'}
                    </div>
                    <div className="flex items-center px-3 py-1.5 rounded-full bg-black/30 border border-gray-800">
                      <FaCoins className="text-yellow-400 mr-1.5 text-xs" />
                      <span className="text-yellow-400 font-semibold">{reward.points}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-white">{reward.name}</h3>
                  <p className="text-gray-400 text-sm mb-6 line-clamp-2">{reward.description}</p>
                  
                  <button
                    onClick={() => handleClaimReward(reward.id)}
                    disabled={userPoints < reward.points || claiming === reward.id}
                    className={`w-full px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                      userPoints >= reward.points 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-purple-600/30'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {claiming === reward.id ? (
                      <div className="flex items-center justify-center">
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        <span>Processing...</span>
                      </div>
                    ) : userPoints < reward.points ? (
                      `Need ${reward.points - userPoints} more points`
                    ) : (
                      'Claim Reward'
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center p-12 rounded-xl bg-gradient-to-br from-[#1f1f2b] to-[#121218] border border-gray-800"
          >
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-white mb-2">No rewards available</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              There are currently no rewards available in this category. Please check back later or try another category.
            </p>
          </motion.div>
        )
      ) : !loading && (
        claimedRewards.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {claimedRewards.map((reward, index) => (
              <motion.div
                key={reward.id}
                variants={itemVariants}
                custom={index}
                className="bg-gradient-to-br from-[#1f1f2b] to-[#121218] border border-gray-800 rounded-xl overflow-hidden shadow-lg"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-4xl bg-gradient-to-br from-green-500/20 to-teal-500/20 p-3 rounded-xl">
                      {reward.icon || '🎁'}
                    </div>
                    <div className="bg-green-900/30 text-green-500 px-3 py-1.5 rounded-full text-xs font-medium border border-green-800/30">
                      {reward.status || 'Claimed'}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-white">{reward.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{reward.description || 'No description available'}</p>
                  
                  <div className="flex items-center text-xs text-gray-500 mt-auto pt-3 border-t border-gray-800">
                    <FaCalendarAlt className="mr-1.5" />
                    Claimed on {new Date(reward.claimedAt).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center p-12 rounded-xl bg-gradient-to-br from-[#1f1f2b] to-[#121218] border border-gray-800"
          >
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-2xl font-bold text-white mb-2">No claimed rewards yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              You haven't claimed any rewards yet. Browse the available rewards and use your points to claim something special!
            </p>
          </motion.div>
        )
      )}

      {/* How to earn more points */}
      <div className="mt-16">
        <h2 className="text-xl font-semibold text-white mb-6">How to Earn More Points</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            className="p-6 rounded-xl bg-gradient-to-br from-[#1f1f2b] to-[#121218] border border-gray-800 shadow-lg"
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="bg-blue-500/20 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
              <FaCalendarCheck className="text-xl text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Daily Check-in</h3>
            <p className="text-gray-400 text-sm">
              Earn 10 points every day you check in. Build a streak for bonus points!
            </p>
          </motion.div>
          
          <motion.div 
            className="p-6 rounded-xl bg-gradient-to-br from-[#1f1f2b] to-[#121218] border border-gray-800 shadow-lg"
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="bg-purple-500/20 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
              <FaClipboardCheck className="text-xl text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Complete Tasks</h3>
            <p className="text-gray-400 text-sm">
              Finish assigned tasks on time to earn between 20-50 points per task.
            </p>
          </motion.div>
          
          <motion.div 
            className="p-6 rounded-xl bg-gradient-to-br from-[#1f1f2b] to-[#121218] border border-gray-800 shadow-lg"
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="bg-pink-500/20 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
              <FaAward className="text-xl text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Special Achievements</h3>
            <p className="text-gray-400 text-sm">
              Get recognized for outstanding work and receive bonus points from admins.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
