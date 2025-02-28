import { apiRequest } from './base';

/**
 * Fetch all organizations accessible to the current user
 * @returns {Promise<Object>} Object containing organizations data or error information
 */
export async function getOrganizations() {
  try {
    const response = await apiRequest('/organizations', {
      timeout: 8000, // 8 second timeout
      retries: 2
    });
    
    // Check if the response indicates an error
    if (!response.success && response.error) {
      console.error('Error fetching organizations:', response.message);
      return {
        success: false,
        message: response.message || 'Failed to fetch organizations. Please try again.',
        organizations: [] // Return empty array to prevent UI errors
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch organizations. Please try again.',
      organizations: [] // Return empty array to prevent UI errors
    };
  }
}

/**
 * Fetch a specific organization by ID
 * @param {string} organizationId The ID of the organization to fetch
 * @returns {Promise<Object>} Object containing organization data or error information
 */
export async function getOrganizationById(organizationId) {
  try {
    const response = await apiRequest(`/organizations/${organizationId}`, {
      timeout: 8000,
      retries: 1
    });
    
    if (!response.success && response.error) {
      console.error('Error fetching organization:', response.message);
      return {
        success: false,
        message: response.message || 'Failed to fetch organization. Please try again.',
        organization: null
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching organization:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch organization. Please try again.',
      organization: null
    };
  }
}

/**
 * Join an organization using an invite code
 * @param {string} inviteCode The invitation code for the organization
 * @param {string} role Optional role to join as (e.g. 'admin', 'member')
 * @returns {Promise<Object>} Object containing join result or error information
 */
export async function joinOrganization(inviteCode, role = '') {
  try {
    const requestBody = { inviteCode };
    
    // Add role to request body if provided
    if (role) {
      requestBody.role = role;
    }
    
    const response = await apiRequest('/organizations/join', {
      method: 'POST',
      body: requestBody,
      timeout: 10000,
      retries: 1
    });
    
    if (!response.success && response.error) {
      console.error('Error joining organization:', response.message);
      return {
        success: false,
        message: response.message || 'Failed to join organization. Please try again.'
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error joining organization:', error);
    return {
      success: false,
      message: error.message || 'Failed to join organization. Please try again.'
    };
  }
}
