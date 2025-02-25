import { api } from '../lib/api';

export const attendanceService = {
  // Get user's attendance history
  getUserAttendance: async (organizationId, filters = {}) => {
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate || '',
        endDate: filters.endDate || '',
        page: filters.page || 1,
        limit: filters.limit || 10
      }).toString();

      const response = await api.get(`/qr/attendance/${organizationId}?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching attendance history');
    }
  },

  // Get attendance statistics for admin
  getAdminAttendance: async (organizationId, filters = {}) => {
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate || '',
        endDate: filters.endDate || '',
        userId: filters.userId || '',
        page: filters.page || 1,
        limit: filters.limit || 10
      }).toString();

      const response = await api.get(`/qr/attendance/${organizationId}/admin?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching attendance records');
    }
  },

  // Get attendance statistics
  getAttendanceStats: async (organizationId, filters = {}) => {
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate || '',
        endDate: filters.endDate || '',
        type: filters.type || ''
      }).toString();

      const response = await api.get(`/qr/stats/${organizationId}?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching attendance statistics');
    }
  },

  // Get attendance report
  getAttendanceReport: async (organizationId, filters = {}, format = 'json') => {
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate || '',
        endDate: filters.endDate || '',
        userId: filters.userId || '',
        format: format
      }).toString();

      const response = await api.get(`/qr/report/${organizationId}?${params}`, {
        responseType: format === 'csv' ? 'blob' : 'json'
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error generating attendance report');
    }
  },

  // Get real-time attendance dashboard data
  getDashboardData: async (organizationId) => {
    try {
      const response = await api.get(`/qr/dashboard/${organizationId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching dashboard data');
    }
  }
};
