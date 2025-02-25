// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Auth Configuration
export const AUTH_COOKIE_NAME = 'auth_token';
export const AUTH_COOKIE_OPTIONS = {
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// App Configuration
export const APP_NAME = 'Attendance System';
export const APP_DESCRIPTION = 'Modern QR-based attendance tracking system';

// Feature Flags
export const FEATURES = {
  LOCATION_TRACKING: true,
  MULTIPLE_ORGANIZATIONS: true,
  QR_CODE_EXPIRY: true
};
