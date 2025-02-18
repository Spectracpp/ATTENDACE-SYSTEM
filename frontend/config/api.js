export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_URL}/auth/login`,
    SIGNUP: `${API_URL}/auth/signup`,
    CHECK: `${API_URL}/auth/check`,
    LOGOUT: `${API_URL}/auth/logout`,
  },
  USER: {
    PROFILE: `${API_URL}/user/profile`,
    UPDATE: `${API_URL}/user/update`,
  },
  ATTENDANCE: {
    MARK: `${API_URL}/attendance/mark`,
    HISTORY: `${API_URL}/attendance/history`,
  },
  ORGANIZATION: {
    DETAILS: `${API_URL}/organization`,
    UPDATE: `${API_URL}/organization/update`,
  },
};

export default API_URL;
