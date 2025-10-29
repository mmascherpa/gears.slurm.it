/**
 * File Size Validator Utility
 *
 * Provides file size validation with configurable limits and user-friendly messages.
 */

// File size constants (in bytes)
export const FILE_SIZE_LIMITS = {
  WARNING_THRESHOLD: 50 * 1024 * 1024,  // 50 MB - show warning
  MAX_SIZE: 200 * 1024 * 1024,          // 200 MB - hard limit
};

/**
 * Formats bytes to human-readable file size
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted file size (e.g., "50.00 MB")
 */
export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Validates file size and returns validation result
 * @param {File} file - The file to validate
 * @returns {Object} Validation result with status, message, and file size info
 *   - {boolean} isValid - Whether file is within size limits
 *   - {boolean} hasWarning - Whether file size should show warning
 *   - {string} message - User-friendly message
 *   - {string} formattedSize - Formatted file size
 *   - {number} sizeInBytes - Original size in bytes
 */
export function validateFileSize(file) {
  if (!file) {
    return {
      isValid: false,
      hasWarning: false,
      message: 'No file selected',
      formattedSize: '0 Bytes',
      sizeInBytes: 0,
    };
  }

  const sizeInBytes = file.size;
  const formattedSize = formatFileSize(sizeInBytes);

  // Hard limit exceeded
  if (sizeInBytes > FILE_SIZE_LIMITS.MAX_SIZE) {
    return {
      isValid: false,
      hasWarning: false,
      message: `File is too large (${formattedSize}). Maximum allowed size is ${formatFileSize(FILE_SIZE_LIMITS.MAX_SIZE)}.`,
      formattedSize,
      sizeInBytes,
    };
  }

  // Warning threshold exceeded but within limits
  if (sizeInBytes > FILE_SIZE_LIMITS.WARNING_THRESHOLD) {
    return {
      isValid: true,
      hasWarning: true,
      message: `Large file detected (${formattedSize}). Processing may take longer than usual.`,
      formattedSize,
      sizeInBytes,
    };
  }

  // File size is fine
  return {
    isValid: true,
    hasWarning: false,
    message: '',
    formattedSize,
    sizeInBytes,
  };
}

/**
 * Simple check if file exceeds maximum size
 * @param {File} file - The file to check
 * @returns {boolean} True if file is within size limits
 */
export function isFileSizeValid(file) {
  return file && file.size <= FILE_SIZE_LIMITS.MAX_SIZE;
}

/**
 * Simple check if file should trigger a warning
 * @param {File} file - The file to check
 * @returns {boolean} True if file size should show warning
 */
export function shouldWarnFileSize(file) {
  return file && file.size > FILE_SIZE_LIMITS.WARNING_THRESHOLD && file.size <= FILE_SIZE_LIMITS.MAX_SIZE;
}
