import { API_URL } from '@/lib/config';
import { apiRequest } from './base';

export async function generateQRCode(organizationId, data) {
  try {
    const response = await apiRequest(`/qr/generate/${organizationId}`, {
      method: 'POST',
      body: {
        type: 'attendance',
        validityHours: 24,
        allowMultipleScans: data.allowMultipleScans || false,
        ...data
      },
      timeout: 10000, // 10 second timeout
      retries: 2
    });
    
    // Check if the response indicates an error
    if (!response.success && response.error) {
      console.error('Error generating QR code:', response.message);
      return {
        success: false,
        message: response.message || 'Failed to generate QR code. Please try again.'
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return {
      success: false,
      message: error.message || 'Failed to generate QR code. Please try again.'
    };
  }
}

export async function getQRCodes() {
  try {
    const response = await apiRequest('/qr', {
      timeout: 8000, // 8 second timeout
      retries: 2
    });
    
    // Check if the response indicates an error
    if (!response.success && response.error) {
      console.error('Error fetching QR codes:', response.message);
      return {
        success: false,
        message: response.message || 'Failed to fetch QR codes. Please try again.',
        qrCodes: [] // Return empty array to prevent UI errors
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch QR codes. Please try again.',
      qrCodes: [] // Return empty array to prevent UI errors
    };
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

    const response = await apiRequest(`/qr/history/${organizationId}?${queryParams}`, {
      timeout: 8000, // 8 second timeout
      retries: 1
    });
    
    // Check if the response indicates an error
    if (!response.success && response.error) {
      console.error('Error fetching QR code history:', response.message);
      return {
        success: false,
        message: response.message || 'Failed to fetch QR code history. Please try again.',
        history: [] // Return empty array to prevent UI errors
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching QR code history:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch QR code history. Please try again.',
      history: [] // Return empty array to prevent UI errors
    };
  }
}

export async function deactivateQRCode(id) {
  try {
    const response = await apiRequest(`/qr/${id}/deactivate`, {
      method: 'PUT',
      timeout: 5000, // 5 second timeout
      retries: 1
    });
    
    // Check if the response indicates an error
    if (!response.success && response.error) {
      console.error('Error deactivating QR code:', response.message);
      return {
        success: false,
        message: response.message || 'Failed to deactivate QR code. Please try again.'
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error deactivating QR code:', error);
    return {
      success: false,
      message: error.message || 'Failed to deactivate QR code. Please try again.'
    };
  }
}

export async function scanQRCode(organizationId, data) {
  try {
    const response = await apiRequest(`/qr/scan/${organizationId}`, {
      method: 'POST',
      body: data,
      timeout: 10000, // 10 second timeout
      retries: 2
    });
    
    // Check if the response indicates an error
    if (!response.success && response.error) {
      console.error('Error scanning QR code:', response.message);
      return {
        success: false,
        message: response.message || 'Failed to scan QR code. Please try again.'
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error scanning QR code:', error);
    return {
      success: false,
      message: error.message || 'Failed to scan QR code. Please try again.'
    };
  }
}
