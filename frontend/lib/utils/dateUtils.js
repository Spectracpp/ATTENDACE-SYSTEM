/**
 * Date utility functions for formatting and manipulating dates in the application
 */

/**
 * Format a date object into a readable date string
 * @param {Date} date - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  try {
    const defaultOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      ...options
    };
    
    return date.toLocaleDateString(undefined, defaultOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    // Fallback format
    return date.toLocaleDateString();
  }
}

/**
 * Format a date object into a readable time string
 * @param {Date} date - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted time string
 */
export function formatTime(date, options = {}) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid time';
  }
  
  try {
    const defaultOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true,
      ...options
    };
    
    return date.toLocaleTimeString(undefined, defaultOptions);
  } catch (error) {
    console.error('Error formatting time:', error);
    // Fallback format
    return date.toLocaleTimeString();
  }
}

/**
 * Format a date into a relative time string (e.g., "2 hours ago")
 * @param {Date} date - The date to format
 * @returns {string} Human-readable relative time
 */
export function getTimeAgo(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }
  
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffMonth / 12);
  
  if (diffSec < 60) {
    return diffSec <= 1 ? 'just now' : `${diffSec} seconds ago`;
  } else if (diffMin < 60) {
    return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
  } else if (diffHour < 24) {
    return diffHour === 1 ? '1 hour ago' : `${diffHour} hours ago`;
  } else if (diffDay < 30) {
    return diffDay === 1 ? 'yesterday' : `${diffDay} days ago`;
  } else if (diffMonth < 12) {
    return diffMonth === 1 ? '1 month ago' : `${diffMonth} months ago`;
  } else {
    return diffYear === 1 ? '1 year ago' : `${diffYear} years ago`;
  }
}

/**
 * Calculate the time remaining until a future date
 * @param {Date} futureDate - The future date
 * @returns {Object} Object containing days, hours, minutes, seconds remaining
 */
export function getTimeRemaining(futureDate) {
  if (!futureDate || !(futureDate instanceof Date) || isNaN(futureDate.getTime())) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }
  
  const now = new Date();
  const difference = futureDate - now;
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }
  
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / 1000 / 60) % 60);
  const seconds = Math.floor((difference / 1000) % 60);
  
  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false
  };
}

/**
 * Check if a QR code is still valid based on its validUntil property
 * @param {Date|string} validUntil - The expiration date of the QR code
 * @returns {boolean} True if QR code is still valid, false otherwise
 */
export function isQRCodeValid(validUntil) {
  if (!validUntil) return false;
  
  // Convert string to Date if necessary
  const expiryDate = validUntil instanceof Date 
    ? validUntil 
    : new Date(validUntil);
  
  if (isNaN(expiryDate.getTime())) return false;
  
  const now = new Date();
  return expiryDate > now;
}
