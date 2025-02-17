const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const API_ENDPOINTS = {
  AUTH: {
    CHECK: `${API_BASE_URL}/auth/check`,
    SIGNUP: `${API_BASE_URL}/auth/signup`,
    LOGIN: `${API_BASE_URL}/auth/login`,
  },
};

export default API_BASE_URL;
