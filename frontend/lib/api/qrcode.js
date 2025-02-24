import { API_URL } from '@/config';

export async function generateQRCode(data) {
  try {
    const response = await fetch(`${API_URL}/qr/generate/${data.organizationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        type: 'daily',
        validityHours: 24,
        ...data
      }),
      credentials: 'include',
      mode: 'cors',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error generating QR code:', error);
    return { success: false, message: 'Failed to generate QR code' };
  }
}

export async function getQRCodes() {
  try {
    const response = await fetch(`${API_URL}/qr`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    return { success: false, qrCodes: [], message: 'Failed to fetch QR codes' };
  }
}

export async function deleteQRCode(id) {
  try {
    const response = await fetch(`${API_URL}/qr/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting QR code:', error);
    return { success: false, message: 'Failed to delete QR code' };
  }
}

export async function getQRCodeHistory(id) {
  try {
    const response = await fetch(`${API_URL}/qr/${id}/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching QR code history:', error);
    return { success: false, history: [], message: 'Failed to fetch QR code history' };
  }
}
