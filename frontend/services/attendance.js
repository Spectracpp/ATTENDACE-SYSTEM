import { api } from '../lib/api';

export const attendanceService = {
  getUserAttendance: async (organizationId) => {
    const response = await api.get(`/attendance/${organizationId}`);
    return response.data;
  },

  getAttendanceReport: async (organizationId, filters) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/attendance/${organizationId}/admin?${params}`);
    return response.data;
  },

  markAttendance: async (organizationId, data) => {
    const response = await api.post(`/attendance/${organizationId}/mark`, data);
    return response.data;
  }
};
