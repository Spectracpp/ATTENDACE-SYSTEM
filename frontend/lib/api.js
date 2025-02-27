import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', {
      message: error.message,
      config: error.config
    });
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success === false) {
      return Promise.reject({
        response: {
          status: response.status,
          data: response.data
        }
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error('API Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: originalRequest?.url,
      method: originalRequest?.method
    });

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      localStorage.removeItem('token');
      window.location.href = '/auth/login';
      
      return Promise.reject({
        response: {
          status: 401,
          data: {
            success: false,
            message: 'Session expired. Please login again.'
          }
        }
      });
    }

    if (error.response?.status === 403) {
      return Promise.reject({
        response: {
          status: 403,
          data: {
            success: false,
            message: 'You do not have permission to perform this action.'
          }
        }
      });
    }

    if (!error.response) {
      return Promise.reject({
        response: {
          status: 0,
          data: {
            success: false,
            message: 'Network error. Please check your internet connection.'
          }
        }
      });
    }

    return Promise.reject(error);
  }
);
