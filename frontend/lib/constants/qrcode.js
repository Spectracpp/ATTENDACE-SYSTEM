/**
 * QR Code related constants used throughout the application
 */

// Default SVG placeholder for QR codes when image loading fails
export const QR_PLACEHOLDER = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="180" height="180" fill="#f0f0f0" stroke="#aaa" stroke-width="2" />
  <text x="100" y="100" font-family="sans-serif" font-size="14" text-anchor="middle">QR Code</text>
  <rect x="50" y="50" width="100" height="100" fill="none" stroke="#333" stroke-width="2" stroke-dasharray="5,5" />
  <path d="M60,60 h20 v20 h-20 z M70,70 h20 v20 h-20 z M120,60 h20 v20 h-20 z M60,120 h20 v20 h-20 z M110,110 h30 v30 h-30 z" fill="#555" />
</svg>`;

// Status color mapping for scan results
export const SCAN_STATUS_COLORS = {
  success: 'green',
  failed: 'red',
  pending: 'yellow',
  expired: 'gray',
  unknown: 'gray'
};

// Device icon mapping for scan history
export const DEVICE_ICONS = {
  mobile: 'phone',
  tablet: 'tablet',
  desktop: 'desktop',
  unknown: 'question'
};

// Default QR code settings
export const DEFAULT_QR_CODE_SETTINGS = {
  validityMinutes: 15,
  allowedRadius: 100, // 100 meters radius
  allowMultipleScans: false,
  qrSize: 250, // size in pixels
  errorCorrectionLevel: 'M',
  includeMargin: true,
  fgColor: '#000000',
  bgColor: '#ffffff'
};

// Error messages
export const QR_ERROR_MESSAGES = {
  EXPIRED: 'This QR code has expired.',
  INVALID_LOCATION: 'Location verification failed. Please ensure you are in the designated area.',
  ALREADY_SCANNED: 'This QR code has already been used.',
  INVALID_QR: 'Invalid QR code format. Please try a different code.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  PERMISSION_DENIED: 'Camera permission denied. Please allow camera access to scan QR codes.',
  LOADING_ERROR: 'Error loading QR code. Please try again.'
};

// Scan animation settings
export const SCAN_ANIMATION_CONFIG = {
  duration: 0.5,
  delay: 0.1,
  ease: [0.42, 0, 0.58, 1] // Ease in-out function
};

// Export constants as a group
export default {
  QR_PLACEHOLDER,
  SCAN_STATUS_COLORS,
  DEVICE_ICONS,
  DEFAULT_QR_CODE_SETTINGS,
  QR_ERROR_MESSAGES,
  SCAN_ANIMATION_CONFIG
};
