import { api } from '../lib/api';

export const qrCodeService = {
  generateQRCode: async (organizationId, settings) => {
    const response = await api.post(`/qr/generate/${organizationId}`, settings);
    return response.data;
  }
};
