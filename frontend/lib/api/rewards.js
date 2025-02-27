import { API_URL } from '@/lib/config';
import { apiRequest } from './base';

/**
 * Get user's current points
 * @returns {Promise<Object>} Response with user points
 */
export async function getUserPoints() {
  try {
    const response = await apiRequest('/user/profile', {
      method: 'GET',
      timeout: 5000,
      retries: 1
    });
    
    if (!response.success && response.error) {
      console.error('Error fetching user points:', response.message);
      return {
        success: false,
        message: response.message || 'Failed to fetch user points'
      };
    }
    
    return {
      success: true,
      points: response.user?.points || 0
    };
  } catch (error) {
    console.error('Error fetching user points:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch user points',
      points: 0
    };
  }
}

/**
 * Get all reward categories
 * @returns {Promise<Object>} Response with reward categories
 */
export async function getRewardCategories() {
  try {
    const response = await apiRequest('/rewards/categories', {
      method: 'GET',
      timeout: 5000,
      retries: 1
    });
    
    if (!response.success && response.error) {
      console.error('Error fetching reward categories:', response.message);
      return {
        success: false,
        message: response.message || 'Failed to fetch reward categories'
      };
    }
    
    return {
      success: true,
      categories: response
    };
  } catch (error) {
    console.error('Error fetching reward categories:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch reward categories',
      categories: []
    };
  }
}

/**
 * Get rewards by category
 * @param {string} categoryId - Category ID
 * @returns {Promise<Object>} Response with rewards for the category
 */
export async function getRewardsByCategory(categoryId) {
  try {
    const response = await apiRequest(`/rewards/category/${categoryId}`, {
      method: 'GET',
      timeout: 5000,
      retries: 1
    });
    
    if (!response.success && response.error) {
      console.error('Error fetching rewards by category:', response.message);
      return {
        success: false,
        message: response.message || 'Failed to fetch rewards'
      };
    }
    
    return {
      success: true,
      rewards: response
    };
  } catch (error) {
    console.error('Error fetching rewards by category:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch rewards',
      rewards: []
    };
  }
}

/**
 * Get all available rewards
 * @returns {Promise<Object>} Response with all available rewards
 */
export async function getAllRewards() {
  try {
    const response = await apiRequest('/rewards/available', {
      method: 'GET',
      timeout: 5000,
      retries: 1
    });
    
    if (!response.success && response.error) {
      console.error('Error fetching all rewards:', response.message);
      return {
        success: false,
        message: response.message || 'Failed to fetch rewards'
      };
    }
    
    return {
      success: true,
      rewards: response
    };
  } catch (error) {
    console.error('Error fetching all rewards:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch rewards',
      rewards: []
    };
  }
}

/**
 * Get user's claimed rewards
 * @returns {Promise<Object>} Response with user's claimed rewards
 */
export async function getClaimedRewards() {
  try {
    const response = await apiRequest('/rewards/claimed', {
      method: 'GET',
      timeout: 5000,
      retries: 1
    });
    
    if (!response.success && response.error) {
      console.error('Error fetching claimed rewards:', response.message);
      return {
        success: false,
        message: response.message || 'Failed to fetch claimed rewards'
      };
    }
    
    return {
      success: true,
      rewards: response
    };
  } catch (error) {
    console.error('Error fetching claimed rewards:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch claimed rewards',
      rewards: []
    };
  }
}

/**
 * Claim a reward
 * @param {string} rewardId - Reward ID to claim
 * @returns {Promise<Object>} Response with claim result
 */
export async function claimReward(rewardId) {
  try {
    const response = await apiRequest(`/rewards/claim/${rewardId}`, {
      method: 'POST',
      timeout: 5000,
      retries: 1
    });
    
    if (!response.success && response.error) {
      console.error('Error claiming reward:', response.message);
      return {
        success: false,
        message: response.message || 'Failed to claim reward'
      };
    }
    
    return {
      success: true,
      message: 'Reward claimed successfully',
      reward: response.reward
    };
  } catch (error) {
    console.error('Error claiming reward:', error);
    return {
      success: false,
      message: error.message || 'Failed to claim reward'
    };
  }
}
