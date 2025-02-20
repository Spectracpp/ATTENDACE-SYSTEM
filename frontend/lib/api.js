import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // This is important for sending cookies
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // No need to manually set Authorization header as cookies will be sent automatically
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Log the error for debugging
    console.error('API Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: originalRequest?.url,
      method: originalRequest?.method
    });

    // Handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login/user';
      }
    }

    // Format error response
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    const formattedError = {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    };

    return Promise.reject(formattedError);
  }
);
