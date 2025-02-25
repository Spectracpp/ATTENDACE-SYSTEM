import { API_URL } from '@/config';
import { apiRequest } from './base';

export async function getDashboardStats() {
  try {
    console.log('Fetching dashboard stats...');
    const response = await apiRequest('/admin/dashboard/stats');
    console.log('Dashboard stats response:', response);
    return response;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error(error.message || 'Failed to fetch dashboard statistics');
  }
}

export async function getAdminProfile() {
  try {
    const response = await apiRequest('/admin/profile');
    return response;
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    throw new Error(error.message || 'Failed to fetch admin profile');
  }
}

export async function updateAdminProfile(data) {
  try {
    const response = await apiRequest('/admin/profile', {
      method: 'PUT',
      body: data
    });
    return response;
  } catch (error) {
    console.error('Error updating admin profile:', error);
    throw new Error(error.message || 'Failed to update admin profile');
  }
}

export async function getSystemLogs(filters = {}) {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiRequest(`/admin/logs?${queryParams}`);
    return response;
  } catch (error) {
    console.error('Error fetching system logs:', error);
    throw new Error(error.message || 'Failed to fetch system logs');
  }
}

export async function getAdminSettings() {
  try {
    const response = await apiRequest('/admin/settings');
    return response;
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    throw new Error(error.message || 'Failed to fetch admin settings');
  }
}

export async function updateAdminSettings(settings) {
  try {
    const response = await apiRequest('/admin/settings', {
      method: 'PUT',
      body: settings
    });
    return response;
  } catch (error) {
    console.error('Error updating admin settings:', error);
    throw new Error(error.message || 'Failed to update admin settings');
  }
}

export async function getOrganizations() {
  try {
    const response = await apiRequest('/admin/organizations');
    return response;
  } catch (error) {
    console.error('Error fetching organizations:', error);
    throw new Error(error.message || 'Failed to fetch organizations');
  }
}
