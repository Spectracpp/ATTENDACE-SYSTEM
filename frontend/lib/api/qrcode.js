import { API_URL } from '@/config';
import { apiRequest } from './base';

export async function generateQRCode(data) {
  try {
    const response = await apiRequest(`/qr/generate/${data.organizationId}`, {
      method: 'POST',
      body: {
        type: 'daily',
        validityHours: 24,
        ...data
      }
    });
    return response;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

export async function getQRCodes() {
  try {
    const response = await apiRequest('/qr');
    return response;
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    throw error;
  }
}

export async function deleteQRCode(id) {
  try {
    const response = await apiRequest(`/qr/${id}`, {
      method: 'DELETE'
    });
    return response;
  } catch (error) {
    console.error('Error deleting QR code:', error);
    throw error;
  }
}

export async function getQRCodeHistory(id) {
  try {
    const response = await apiRequest(`/qr/${id}/history`);
    return response;
  } catch (error) {
    console.error('Error fetching QR code history:', error);
    throw error;
  }
}
