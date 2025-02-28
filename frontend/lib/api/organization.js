import { API_URL } from '@/lib/config';
import { apiRequest } from './base';

export async function getOrganizations() {
  try {
    const response = await apiRequest('/organizations');
    return response;
  } catch (error) {
    console.error('Error fetching organizations:', error);
    throw error;
  }
}

export async function getMyOrganizations() {
  try {
    const response = await apiRequest('/organizations/my');
    return response;
  } catch (error) {
    console.error('Error fetching my organizations:', error);
    throw error;
  }
}

export async function createOrganization(data) {
  try {
    const response = await apiRequest('/organizations', {
      method: 'POST',
      body: data
    });
    return response;
  } catch (error) {
    console.error('Error creating organization:', error);
    throw error;
  }
}

export async function updateOrganization(id, data) {
  try {
    const response = await apiRequest(`/organizations/${id}`, {
      method: 'PUT',
      body: data
    });
    return response;
  } catch (error) {
    console.error('Error updating organization:', error);
    throw error;
  }
}

export async function deleteOrganization(id) {
  try {
    const response = await apiRequest(`/organizations/${id}`, {
      method: 'DELETE'
    });
    return response;
  } catch (error) {
    console.error('Error deleting organization:', error);
    throw error;
  }
}

export async function getOrganizationMembers(id) {
  try {
    const response = await apiRequest(`/organizations/${id}/members`);
    return response;
  } catch (error) {
    console.error('Error fetching organization members:', error);
    throw error;
  }
}

export async function addOrganizationMember(id, data) {
  try {
    const response = await apiRequest(`/organizations/${id}/members`, {
      method: 'POST',
      body: data
    });
    return response;
  } catch (error) {
    console.error('Error adding organization member:', error);
    throw error;
  }
}

export async function removeOrganizationMember(orgId, memberId) {
  try {
    const response = await apiRequest(`/organizations/${orgId}/members/${memberId}`, {
      method: 'DELETE'
    });
    return response;
  } catch (error) {
    console.error('Error removing organization member:', error);
    throw error;
  }
}

export async function joinOrganization(data) {
  try {
    const response = await apiRequest('/organizations/join', {
      method: 'POST',
      body: data
    });
    return response;
  } catch (error) {
    console.error('Error joining organization:', error);
    throw error;
  }
}

export async function updateOrganizationMember(orgId, memberId, data) {
  try {
    const response = await apiRequest(`/organizations/${orgId}/members/${memberId}`, {
      method: 'PUT',
      body: data
    });
    return response;
  } catch (error) {
    console.error('Error updating organization member:', error);
    throw error;
  }
}

export async function getPublicOrganizations() {
  try {
    const response = await fetch('/api/organizations/public');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching public organizations:', error);
    return {
      success: false,
      message: 'Failed to fetch organizations'
    };
  }
}
