export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_URL}/auth/login`,
    REGISTER: `${API_URL}/auth/register`,
    VERIFY: `${API_URL}/auth/verify`,
    VERIFY_EMAIL: `${API_URL}/auth/verify-email`,
    REQUEST_PASSWORD_RESET: `${API_URL}/auth/request-password-reset`,
    RESET_PASSWORD: `${API_URL}/auth/reset-password`,
    CHANGE_PASSWORD: `${API_URL}/auth/change-password`,
    LOGOUT: `${API_URL}/auth/logout`,
  },
  USER: {
    PROFILE: `${API_URL}/users/profile`,
    UPDATE: `${API_URL}/users/update`,
    UPDATE_AVATAR: `${API_URL}/users/update-avatar`,
    CHANGE_PASSWORD: `${API_URL}/users/change-password`,
  },
  ATTENDANCE: {
    MARK: `${API_URL}/attendance/mark`,
    HISTORY: `${API_URL}/attendance/history`,
    REPORT: `${API_URL}/attendance/report`,
    VERIFY_QR: `${API_URL}/attendance/verify-qr`,
  },
  ORGANIZATION: {
    LIST: `${API_URL}/organizations`,
    CREATE: `${API_URL}/organizations`,
    DETAILS: (id) => `${API_URL}/organizations/${id}`,
    UPDATE: (id) => `${API_URL}/organizations/${id}`,
    DELETE: (id) => `${API_URL}/organizations/${id}`,
    MEMBERS: (id) => `${API_URL}/organizations/${id}/members`,
    JOIN: (id) => `${API_URL}/organizations/${id}/join`,
    LEAVE: (id) => `${API_URL}/organizations/${id}/leave`,
  },
  QR: {
    GENERATE: `${API_URL}/qr/generate`,
    VALIDATE: `${API_URL}/qr/validate`,
  },
};

export default API_URL;
