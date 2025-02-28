/**
 * Application-wide constants
 */

/**
 * QR code placeholder SVG used when a QR code image fails to load
 * This displays a simple black and white QR pattern to clearly indicate
 * this is a QR code placeholder
 */
export const QR_PLACEHOLDER = "data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' shape-rendering='crispEdges'%3e%3cpath fill='%23ffffff' d='M0 0h100v100H0z'/%3e%3cpath stroke='%23000000' d='M15 15h7M15 16h7M15 17h7M15 18h7M15 19h7M15 20h7M15 21h7M22 15h7M22 21h7M29 15h7M29 16h7M29 17h7M29 18h7M29 19h7M29 20h7M29 21h7M36 15h7M36 21h7M43 15h7M43 21h7M50 15h7M50 16h7M50 17h7M50 18h7M50 19h7M50 20h7M50 21h7M64 15h7M64 16h7M64 17h7M64 18h7M64 19h7M64 20h7M64 21h7M71 15h7M71 21h7M78 15h7M78 16h7M78 17h7M78 18h7M78 19h7M78 20h7M78 21h7M15 29h7M15 35h7M15 36h7M15 37h7M15 38h7M15 39h7M15 40h7M15 41h7M15 42h7M15 43h7M15 49h7M15 50h7M15 51h7M15 52h7M15 53h7M15 54h7M15 55h7M15 56h7M15 57h7M15 64h7M15 65h7M15 66h7M15 67h7M15 68h7M15 69h7M15 70h7M15 71h7M15 72h7M15 78h7M15 79h7M15 80h7M15 81h7M15 82h7M15 83h7M15 84h7M22 29h7M22 35h7M22 43h7M22 49h7M22 57h7M22 71h7M22 78h7M29 29h7M29 35h7M29 43h7M29 49h7M29 57h7M29 64h7M29 65h7M29 66h7M29 67h7M29 68h7M29 69h7M29 70h7M29 71h7M29 78h7M36 29h7M36 35h7M36 36h7M36 37h7M36 38h7M36 39h7M36 40h7M36 41h7M36 42h7M36 43h7M36 49h7M36 56h7M36 57h7M36 64h7M36 71h7M36 78h7M43 29h7M43 43h7M43 49h7M43 57h7M43 64h7M43 71h7M43 78h7M50 29h7M50 30h7M50 31h7M50 32h7M50 33h7M50 34h7M50 35h7M50 43h7M50 49h7M50 50h7M50 51h7M50 52h7M50 53h7M50 54h7M50 55h7M50 56h7M50 57h7M50 64h7M50 71h7M50 72h7M50 73h7M50 74h7M50 75h7M50 76h7M50 77h7M50 78h7M57 29h7M57 35h7M57 43h7M57 64h7M57 71h7M64 29h7M64 35h7M64 43h7M64 49h7M64 50h7M64 51h7M64 52h7M64 53h7M64 54h7M64 55h7M64 56h7M64 57h7M64 64h7M64 71h7M71 29h7M71 35h7M71 43h7M71 49h7M71 57h7M71 64h7M71 71h7M78 29h7M78 30h7M78 31h7M78 32h7M78 33h7M78 34h7M78 35h7M78 43h7M78 49h7M78 50h7M78 51h7M78 52h7M78 53h7M78 54h7M78 55h7M78 56h7M78 57h7M78 64h7M78 65h7M78 66h7M78 67h7M78 68h7M78 69h7M78 70h7M78 71h7'/%3e%3c/svg%3e";

/**
 * Scan status types with their badge colors
 */
export const SCAN_STATUS_COLORS = {
  success: 'green',
  failed: 'red',
  pending: 'yellow',
  unknown: 'gray'
};

/**
 * Device type icons mapping
 */
export const DEVICE_ICONS = {
  mobile: 'mobile-alt',
  tablet: 'tablet-alt',
  desktop: 'desktop',
  unknown: 'question-circle'
};

/**
 * Default validity options for QR codes (in hours)
 */
export const QR_VALIDITY_OPTIONS = [
  { value: 1, label: "1 hour" },
  { value: 2, label: "2 hours" },
  { value: 4, label: "4 hours" },
  { value: 8, label: "8 hours" },
  { value: 12, label: "12 hours" },
  { value: 24, label: "24 hours (1 day)" },
  { value: 48, label: "48 hours (2 days)" },
  { value: 72, label: "72 hours (3 days)" },
  { value: 168, label: "168 hours (1 week)" }
];

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  QR_GENERATE: '/qr/generate',
  QR_SCAN: '/qr/scan',
  QR_SCAN_HISTORY: '/qr/scan-history'
};
