import { API_URL } from '@/lib/config';
import { apiRequest } from './base';

export async function getDashboardStats() {
  try {
    console.log('Fetching dashboard stats...');
    const response = await apiRequest('/admin/dashboard/stats', {
      timeout: 8000, // 8 second timeout
      retries: 2
    });
    console.log('Dashboard stats response:', response);
    
    // Check if the response indicates an error
    if (!response.success && response.error) {
      console.error('Error in dashboard stats response:', response.message);
      return {
        success: false,
        message: response.message || 'Failed to fetch dashboard statistics',
        stats: {
          totalUsers: 0,
          totalOrganizations: 0,
          totalAttendance: 0,
          activeQRCodes: 0,
          recentActivity: []
        }
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch dashboard statistics',
      stats: {
        totalUsers: 0,
        totalOrganizations: 0,
        totalAttendance: 0,
        activeQRCodes: 0,
        recentActivity: []
      }
    };
  }
}

export async function getAdminProfile() {
  try {
    const response = await apiRequest('/admin/profile', {
      timeout: 5000, // 5 second timeout
      retries: 1
    });
    
    // Check if the response indicates an error
    if (!response.success && response.error) {
      console.error('Error in admin profile response:', response.message);
      return {
        success: false,
        message: response.message || 'Failed to fetch admin profile'
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch admin profile'
    };
  }
}

export async function updateAdminProfile(data) {
  try {
    const response = await apiRequest('/admin/profile', {
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
        message: response.message || 'Failed to update admin profile'
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error updating admin profile:', error);
    return {
      success: false,
      message: error.message || 'Failed to update admin profile'
    };
  }
}

export async function getSystemLogs(filters = {}) {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiRequest(`/admin/logs?${queryParams}`, {
      timeout: 10000, // 10 second timeout
      retries: 1
    });
    
    // Check if the response indicates an error
    if (!response.success && response.error) {
      console.error('Error in system logs response:', response.message);
      return {
        success: false,
        message: response.message || 'Failed to fetch system logs',
        logs: [] // Return empty array to prevent UI errors
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching system logs:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch system logs',
      logs: [] // Return empty array to prevent UI errors
    };
  }
}

export async function getAdminSettings() {
  try {
    const response = await apiRequest('/admin/settings', {
      timeout: 5000, // 5 second timeout
      retries: 1
    });
    
    // Check if the response indicates an error
    if (!response.success && response.error) {
      console.error('Error in admin settings response:', response.message);
      return {
        success: false,
        message: response.message || 'Failed to fetch admin settings'
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch admin settings'
    };
  }
}

export async function updateAdminSettings(settings) {
  try {
    const response = await apiRequest('/admin/settings', {
      method: 'PUT',
      body: settings,
      timeout: 8000, // 8 second timeout
      retries: 1
    });
    
    // Check if the response indicates an error
    if (!response.success && response.error) {
      console.error('Error in update settings response:', response.message);
      return {
        success: false,
        message: response.message || 'Failed to update admin settings'
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error updating admin settings:', error);
    return {
      success: false,
      message: error.message || 'Failed to update admin settings'
    };
  }
}

export async function getOrganizations() {
  try {
    const response = await apiRequest('/admin/organizations', {
      timeout: 5000, // 5 second timeout
      retries: 2
    });
    
    // Check if the response indicates an error
    if (!response.success && response.error) {
      console.error('Error in organizations response:', response.message);
      return {
        success: false,
        message: response.message || 'Failed to fetch organizations',
        organizations: [] // Return empty array to prevent UI errors
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch organizations',
      organizations: [] // Return empty array to prevent UI errors
    };
  }
}
