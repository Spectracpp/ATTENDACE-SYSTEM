import { API_URL } from '@/lib/config';

export async function login(credentials) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include',
      mode: 'cors',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Store auth data in localStorage
    if (data.success && data.token) {
      localStorage.setItem('auth', JSON.stringify({
        token: data.token,
        user: data.user
      }));
    }
    
    return data;
  } catch (error) {
    console.error('Error logging in:', error);
    return { success: false, message: 'Failed to login' };
  }
}

export async function register(userData) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(userData),
      credentials: 'include',
      mode: 'cors',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Store auth data in localStorage if registration includes auto-login
    if (data.success && data.token) {
      localStorage.setItem('auth', JSON.stringify({
        token: data.token,
        user: data.user
      }));
    }
    
    return data;
  } catch (error) {
    console.error('Error registering:', error);
    return { success: false, message: 'Failed to register' };
  }
}

export async function logout() {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
    });
    
    // Clear auth data regardless of response
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error logging out:', error);
    return { success: false, message: 'Failed to logout' };
  }
}

export async function checkAuth() {
  try {
    const auth = localStorage.getItem('auth');
    if (!auth) {
      return { success: false, message: 'No auth data found' };
    }

    const { token } = JSON.parse(auth);
    
    const response = await fetch(`${API_URL}/auth/check`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
    });
    
    if (!response.ok) {
      localStorage.removeItem('auth');
      return { success: false, message: 'Invalid auth token' };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking auth:', error);
    return { success: false, message: 'Failed to check auth status' };
  }
}
