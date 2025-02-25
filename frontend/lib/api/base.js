import { API_URL } from '@/lib/config';

const getStoredAuth = () => {
  if (typeof window === 'undefined') return null;
  try {
    const auth = localStorage.getItem('auth');
    return auth ? JSON.parse(auth) : null;
  } catch (error) {
    console.error('Error parsing auth from localStorage:', error);
    return null;
  }
};

export async function apiRequest(endpoint, options = {}) {
  const TIMEOUT_MS = 15000;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    // Get auth token
    const auth = getStoredAuth();
    const token = auth?.token;

    // Prepare headers
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Prepare request options
    const requestOptions = {
      method: options.method || 'GET',
      headers,
      credentials: 'include',
      signal: controller.signal,
      ...options
    };

    // Add body for non-GET requests
    if (requestOptions.method !== 'GET' && options.body) {
      requestOptions.body = JSON.stringify(options.body);
    }

    console.log(`Making ${requestOptions.method} request to ${endpoint}`, {
      headers: requestOptions.headers,
      body: options.body
    });

    const response = await fetch(`${API_URL}${endpoint}`, requestOptions);
    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}
