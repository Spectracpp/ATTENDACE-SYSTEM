import { API_URL } from '@/config';

export async function getAttendanceRecords(organizationId, filters = {}) {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}/attendance/${organizationId}?${queryParams}`, {
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
    console.error('Error fetching attendance records:', error);
    return { success: false, records: [], message: 'Failed to fetch attendance records' };
  }
}

export async function markAttendance(qrCodeId, data) {
  try {
    const response = await fetch(`${API_URL}/attendance/mark/${qrCodeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
      mode: 'cors',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error marking attendance:', error);
    return { success: false, message: 'Failed to mark attendance' };
  }
}

export async function getAttendanceStats(organizationId, timeRange = {}) {
  try {
    const queryParams = new URLSearchParams(timeRange).toString();
    const response = await fetch(`${API_URL}/attendance/${organizationId}/stats?${queryParams}`, {
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
    console.error('Error fetching attendance stats:', error);
    return { success: false, stats: {}, message: 'Failed to fetch attendance stats' };
  }
}

export async function exportAttendance(organizationId, filters = {}) {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}/attendance/${organizationId}/export?${queryParams}`, {
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
    return await response.blob();
  } catch (error) {
    console.error('Error exporting attendance:', error);
    return { success: false, message: 'Failed to export attendance' };
  }
}
