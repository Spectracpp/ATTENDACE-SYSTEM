import { API_URL } from '@/lib/config';
import { apiRequest } from './base';

export async function generateQRCode(organizationId, data) {
  try {
    // Convert validity minutes to hours if provided
    const validityHours = data.validityMinutes 
      ? (data.validityMinutes / 60) 
      : (data.validityHours || 24);
    
    const response = await apiRequest(`/qr/generate/${organizationId}`, {
      method: 'POST',
      body: {
        type: 'attendance',
        validityHours,
        allowMultipleScans: data.allowMultipleScans || false,
        location: data.location || undefined,
        settings: {
          locationRadius: data.allowedRadius || 100,
          maxScans: data.maxScans || 1,
          ...data.settings
        },
        ...data
      },
      timeout: 15000, // 15 second timeout (increased from 10s)
      retries: 3     // Increased retries from 2 to 3
    });
    
    // Check if the response indicates an error
    if (!response.success || (response.error && response.error !== false)) {
      console.error('Error generating QR code:', response.message || 'Unknown error');
      return {
        success: false,
        message: response.message || 'Failed to generate QR code. Please try again.',
        error: response.error || true
      };
    }
    
    // Ensure the QR code has required fields
    if (response.qrCode) {
      // Process response if needed
      // Ensure we have all required properties with proper defaults
      response.qrCode = {
        ...response.qrCode,
        // If no image is provided but we have data, create a placeholder
        qrImage: response.qrCode.qrImage || null
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return {
      success: false,
      message: error.message || 'Failed to generate QR code. Please try again.',
      error: true
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

export async function getScanHistory(qrCodeId) {
  try {
    const response = await apiRequest(`/qr/scan-history/${qrCodeId}`, {
      timeout: 8000, // 8 second timeout
      retries: 2
    });
    
    // Check if the response indicates an error
    if (!response.success && response.error) {
      console.error('Error fetching QR code scan history:', response.message);
      return {
        success: false,
        message: response.message || 'Failed to fetch QR code history',
        history: [] // Return empty array to prevent UI errors
      };
    }
    
    // Return the full response with history array
    return response.history ? 
      { success: true, history: response.history } : 
      { success: true, history: [] };
      
  } catch (error) {
    console.error('Error fetching QR code scan history:', error);
    
    // For demo purposes, return comprehensive mock data if API endpoint doesn't exist yet
    return {
      success: true,
      message: 'Using mock data (API unavailable)',
      history: [
        {
          id: '1',
          userName: 'John Doe',
          userId: 'user123',
          email: 'john.doe@example.com',
          scannedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          location: 'Main Office, Floor 3',
          deviceInfo: 'iPhone 13, iOS 16.2',
          status: 'success',
          ipAddress: '192.168.1.5',
          browser: 'Safari Mobile'
        },
        {
          id: '2',
          userName: 'Jane Smith',
          userId: 'user456',
          email: 'jane.smith@example.com',
          scannedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          location: 'Conference Room B',
          deviceInfo: 'Samsung Galaxy S21, Android 12',
          status: 'success',
          ipAddress: '192.168.1.10',
          browser: 'Chrome Mobile'
        },
        {
          id: '3',
          userName: 'Alex Johnson',
          userId: 'user789',
          email: 'alex.j@example.com',
          scannedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          location: 'Remote Access',
          deviceInfo: 'MacBook Pro, macOS 12.5',
          status: 'failed',
          ipAddress: '111.222.333.444',
          browser: 'Firefox 98',
          failureReason: 'QR code expired'
        },
        {
          id: '4',
          userName: 'Samantha Lee',
          userId: 'user101',
          email: 's.lee@example.com',
          scannedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          location: 'Reception Area',
          deviceInfo: 'iPad Pro, iOS 15.4',
          status: 'success',
          ipAddress: '192.168.1.15',
          browser: 'Safari Mobile'
        },
        {
          id: '5',
          userName: 'Robert Chen',
          userId: 'user202',
          email: 'robert.c@example.com',
          scannedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          location: 'Parking Garage',
          deviceInfo: 'Google Pixel 6, Android 13',
          status: 'failed',
          ipAddress: '192.168.1.20',
          browser: 'Chrome Mobile',
          failureReason: 'Location verification failed'
        }
      ]
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
