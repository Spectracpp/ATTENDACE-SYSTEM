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
  try {
    const isFormData = options.isFormData || false;
    const auth = getStoredAuth();
    const token = auth?.token;

    const headers = {
      'Accept': 'application/json',
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers
    };

    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method: options.method || 'GET',
      headers,
      credentials: 'include',
      mode: 'cors',
      ...options
    };

    // Handle request body
    if (options.body) {
      config.body = isFormData ? options.body : JSON.stringify(options.body);
    }

    // Remove custom options
    delete config.isFormData;

    console.log(`Making ${config.method} request to ${endpoint}`, {
      headers: config.headers,
      body: options.body
    });

    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Request Error (${endpoint}):`, error);
    throw error;
  }
}
