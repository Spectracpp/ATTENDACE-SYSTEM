import { api } from '../lib/api';

export const organizationService = {
  getUserOrganizations: async () => {
    try {
      const response = await api.get('/api/organizations/user/list');
      return response.data;
    } catch (error) {
      console.error('Error fetching user organizations:', {
        message: error.message,
        status: error.status,
        data: error.data
      });
      throw error;
    }
  },

  switchOrganization: async (organizationId) => {
    try {
      const response = await api.post('/api/organizations/switch', { organizationId });
      return response.data;
    } catch (error) {
      console.error('Error switching organization:', {
        organizationId,
        message: error.message,
        status: error.status
      });
      throw error;
    }
  },

  createOrganization: async (data) => {
    try {
      const response = await api.post('/api/organizations', data);
      return response.data;
    } catch (error) {
      console.error('Error creating organization:', {
        data,
        message: error.message,
        status: error.status
      });
      throw error;
    }
  },

  updateOrganization: async (id, data) => {
    try {
      const response = await api.put(`/api/organizations/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating organization:', {
        id,
        data,
        message: error.message,
        status: error.status
      });
      throw error;
    }
  },

  deleteOrganization: async (id) => {
    try {
      const response = await api.delete(`/api/organizations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting organization:', {
        id,
        message: error.message,
        status: error.status
      });
      throw error;
    }
  },

  addMember: async (organizationId, data) => {
    try {
      const response = await api.post(`/api/organizations/${organizationId}/members`, data);
      return response.data;
    } catch (error) {
      console.error('Error adding member to organization:', {
        organizationId,
        data,
        message: error.message,
        status: error.status
      });
      throw error;
    }
  },

  removeMember: async (organizationId, userId) => {
    try {
      const response = await api.delete(`/api/organizations/${organizationId}/members/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing member from organization:', {
        organizationId,
        userId,
        message: error.message,
        status: error.status
      });
      throw error;
    }
  },

  updateMemberRole: async (organizationId, userId, role) => {
    try {
      const response = await api.put(`/api/organizations/${organizationId}/members/${userId}`, { role });
      return response.data;
    } catch (error) {
      console.error('Error updating member role:', {
        organizationId,
        userId,
        role,
        message: error.message,
        status: error.status
      });
      throw error;
    }
  }
};
