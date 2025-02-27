import { API_URL } from '@/lib/config';
import { apiRequest } from './base';

export async function getUserProfile() {
  try {
    const response = await apiRequest('/users/me', {
      timeout: 5000, // 5 second timeout
      retries: 1
    });
    
    // Check if the response indicates an error
    if (!response.success && response.error) {
      console.error('Error in user profile response:', response.message);
      return {
        success: false,
        message: response.message || 'Failed to fetch user profile'
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch user profile'
    };
  }
}

export async function updateUserProfile(data) {
  try {
    const response = await apiRequest('/users/profile', {
      method: 'PUT',
      body: data,
      timeout: 8000, // 8 second timeout
      retries: 1
    });
    
    // Check if the response indicates an error
    if (!response.success && response.error) {
      console.error('Error in update profile response:', response.message);
      return {
        success: false,
        message: response.message || 'Failed to update user profile'
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return {
      success: false,
      message: error.message || 'Failed to update user profile'
    };
  }
}

export async function getUserAttendance(params = {}) {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await apiRequest(`/attendance/user?${queryParams}`, {
      timeout: 8000, // 8 second timeout
      retries: 1
    });
    
    // Check if the response indicates an error
    if (!response.success && response.error) {
      console.error('Error in user attendance response:', response.message);
      return {
        success: false,
        message: response.message || 'Failed to fetch attendance records',
        attendance: {
          records: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 10,
            pages: 0
          }
        }
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching user attendance:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch attendance records',
      attendance: {
        records: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          pages: 0
        }
      }
    };
  }
}

export async function getUserOrganizations() {
  try {
    const response = await apiRequest('/organizations/my', {
      timeout: 8000, // 8 second timeout
      retries: 2
    });
    
    // Check if the response indicates an error
    if (!response.success) {
      console.error('Error in user organizations response:', response.message);
      
      // Return a standardized response with fallback data for development
      return {
        success: false,
        message: response.message || 'Failed to fetch user organizations',
        error: response.error || 'Unknown error',
        organizations: [
          {
            _id: 'fallback1',
            name: 'Fallback Organization 1',
            type: 'Educational',
            members: [{ user: { _id: 'user1', name: 'Current User' }, role: 'Member' }],
            joinedAt: new Date().toISOString()
          },
          {
            _id: 'fallback2',
            name: 'Fallback Organization 2',
            type: 'Business',
            members: [{ user: { _id: 'user1', name: 'Current User' }, role: 'Member' }],
            joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching user organizations:', error);
    
    // Return fallback data for development
    return {
      success: false,
      message: error.message || 'Failed to fetch user organizations',
      error: error.toString(),
      organizations: [
        {
          _id: 'fallback1',
          name: 'Fallback Organization 1',
          type: 'Educational',
          members: [{ user: { _id: 'user1', name: 'Current User' }, role: 'Member' }],
          joinedAt: new Date().toISOString()
        },
        {
          _id: 'fallback2',
          name: 'Fallback Organization 2',
          type: 'Business',
          members: [{ user: { _id: 'user1', name: 'Current User' }, role: 'Member' }],
          joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    };
  }
}

export async function joinOrganization(code) {
  try {
    const response = await apiRequest('/organizations/join', {
      method: 'POST',
      body: { code },
      timeout: 8000, // 8 second timeout
      retries: 1
    });
    
    // Check if the response indicates an error
    if (!response.success && response.error) {
      console.error('Error joining organization:', response.message);
      return {
        success: false,
        message: response.message || 'Failed to join organization'
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error joining organization:', error);
    return {
      success: false,
      message: error.message || 'Failed to join organization'
    };
  }
}

export async function setActiveOrganization(organizationId) {
  try {
    const response = await apiRequest('/users/active-organization', {
      method: 'PUT',
      body: { organizationId },
      timeout: 5000, // 5 second timeout
      retries: 2
    });
    
    // Check if the response indicates an error
    if (!response.success && response.error) {
      console.error('Error setting active organization:', response.message);
      return {
        success: false,
        message: response.message || 'Failed to set active organization'
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error setting active organization:', error);
    return {
      success: false,
      message: error.message || 'Failed to set active organization'
    };
  }
}

// Add the missing functions needed by admin settings page
export async function getCurrentUser() {
  // This is an alias for getUserProfile for backward compatibility
  return getUserProfile();
}

export async function updateProfile(data) {
  // This is an alias for updateUserProfile for backward compatibility
  return updateUserProfile(data);
}
