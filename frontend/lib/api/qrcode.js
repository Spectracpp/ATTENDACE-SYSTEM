import { API_URL } from '@/config';
import { apiRequest } from './base';

export async function generateQRCode(organizationId, data) {
  try {
    const response = await apiRequest(`/qr/generate/${organizationId}`, {
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

export async function getQRCodeHistory(organizationId, params = {}) {
  try {
    const queryParams = new URLSearchParams({
      type: params.type || '',
      status: params.status || '',
      limit: params.limit || 10,
      page: params.page || 1
    }).toString();

    const response = await apiRequest(`/qr/history/${organizationId}?${queryParams}`);
    return response;
  } catch (error) {
    console.error('Error fetching QR code history:', error);
    throw error;
  }
}

export async function deactivateQRCode(id) {
  try {
    const response = await apiRequest(`/qr/${id}/deactivate`, {
      method: 'POST'
    });
    return response;
  } catch (error) {
    console.error('Error deactivating QR code:', error);
    throw error;
  }
}

export async function scanQRCode(organizationId, data) {
  try {
    const response = await apiRequest(`/qr/scan/${organizationId}`, {
      method: 'POST',
      body: data
    });
    return response;
  } catch (error) {
    console.error('Error scanning QR code:', error);
    throw error;
  }
}
