import { api } from '../lib/api';

export const qrCodeService = {
  // Generate a new QR code
  generateQRCode: async (organizationId, settings) => {
    try {
      const response = await api.post(`/qr/generate/${organizationId}`, settings);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error generating QR code');
    }
  },

  // Scan a QR code
  scanQRCode: async (organizationId, qrData, location) => {
    try {
      const response = await api.post(`/qr/scan/${organizationId}`, { qrData, location });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error scanning QR code');
    }
  },

  // Get QR codes for an organization
  getOrganizationQRCodes: async (organizationId, params = {}) => {
    try {
      const queryString = new URLSearchParams({
        type: params.type || '',
        status: params.status || '',
        page: params.page || 1,
        limit: params.limit || 10
      }).toString();

      const response = await api.get(`/qr/organization/${organizationId}?${queryString}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching QR codes');
    }
  },

  // Deactivate a QR code
  deactivateQRCode: async (qrCodeId) => {
    try {
      const response = await api.post(`/qr/${qrCodeId}/deactivate`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error deactivating QR code');
    }
  }
};
