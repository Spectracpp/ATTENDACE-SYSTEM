import { api } from '../lib/api';

export const organizationService = {
  // Get organizations for current user
  getUserOrganizations: async () => {
    try {
      const response = await api.get('/organizations/my');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching organizations');
    }
  },

  // Get single organization details
  getOrganizationDetails: async (id) => {
    try {
      const response = await api.get(`/organizations/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching organization details');
    }
  },

  // Get organization statistics
  getOrganizationStats: async (id, filters = {}) => {
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate || '',
        endDate: filters.endDate || '',
        type: filters.type || ''
      }).toString();

      const response = await api.get(`/organizations/${id}/stats?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching organization statistics');
    }
  },

  // Switch active organization
  switchOrganization: async (organizationId) => {
    try {
      const response = await api.post('/organizations/switch', { organizationId });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error switching organization');
    }
  },

  // Create new organization
  createOrganization: async (data) => {
    try {
      const response = await api.post('/organizations', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error creating organization');
    }
  },

  // Update organization
  updateOrganization: async (id, data) => {
    try {
      const response = await api.put(`/organizations/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error updating organization');
    }
  },

  // Delete organization
  deleteOrganization: async (id) => {
    try {
      const response = await api.delete(`/organizations/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error deleting organization');
    }
  },

  // Get organization members
  getMembers: async (organizationId, filters = {}) => {
    try {
      const params = new URLSearchParams({
        role: filters.role || '',
        search: filters.search || '',
        page: filters.page || 1,
        limit: filters.limit || 10
      }).toString();

      const response = await api.get(`/organizations/${organizationId}/members?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching members');
    }
  },

  // Add member to organization
  addMember: async (organizationId, data) => {
    try {
      const response = await api.post(`/organizations/${organizationId}/members`, data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error adding member');
    }
  },

  // Remove member from organization
  removeMember: async (organizationId, userId) => {
    try {
      const response = await api.delete(`/organizations/${organizationId}/members/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error removing member');
    }
  },

  // Update member role
  updateMemberRole: async (organizationId, userId, role) => {
    try {
      const response = await api.put(`/organizations/${organizationId}/members/${userId}`, { role });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error updating member role');
    }
  },

  // Get organization settings
  getSettings: async (organizationId) => {
    try {
      const response = await api.get(`/organizations/${organizationId}/settings`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching organization settings');
    }
  },

  // Update organization settings
  updateSettings: async (organizationId, settings) => {
    try {
      const response = await api.put(`/organizations/${organizationId}/settings`, settings);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error updating organization settings');
    }
  }
};
