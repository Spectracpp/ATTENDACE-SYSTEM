import { API_URL } from '@/config';
import { apiRequest } from './base';

export async function getCurrentUser() {
  try {
    const response = await apiRequest('/users/me');
    return response;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
}

export async function updateProfile(data) {
  try {
    const response = await apiRequest('/users/profile', {
      method: 'PUT',
      body: data,
      isFormData: true
    });
    return response;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

export async function getUsers() {
  try {
    const response = await apiRequest('/users');
    return response;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function getUser(id) {
  try {
    const response = await apiRequest(`/users/${id}`);
    return response;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

export async function updateUser(id, userData) {
  try {
    const response = await apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: userData
    });
    return response;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function deleteUser(id) {
  try {
    const response = await apiRequest(`/users/${id}`, {
      method: 'DELETE'
    });
    return response;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}
