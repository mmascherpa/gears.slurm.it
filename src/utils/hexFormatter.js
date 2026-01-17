/**
 * Hex Formatter Utility
 *
 * Provides utilities for formatting binary data as hexadecimal output
 * with offset, hex, and ASCII columns.
 */

/**
 * Converts a byte value to a two-character hex string
 * @param {number} byte - Byte value (0-255)
 * @returns {string} Two-character hex string (e.g., "FF")
 */
export function byteToHex(byte) {
  return byte.toString(16).toUpperCase().padStart(2, '0');
}

/**
 * Converts an offset to a formatted hex string with padding
 * @param {number} offset - Byte offset in file
 * @param {number} padding - Number of hex digits (default 8 for 4GB files)
 * @returns {string} Formatted hex offset (e.g., "00000000")
 */
export function offsetToHex(offset, padding = 8) {
  return offset.toString(16).toUpperCase().padStart(padding, '0');
}

/**
 * Converts an offset to a formatted decimal string with padding
 * @param {number} offset - Byte offset in file
 * @param {number} padding - Number of digits (default 10)
 * @returns {string} Formatted decimal offset
 */
export function offsetToDecimal(offset, padding = 10) {
  return offset.toString().padStart(padding, '0');
}

/**
 * Determines if a byte value is printable ASCII
 * @param {number} byte - Byte value (0-255)
 * @returns {boolean} True if printable (32-126)
 */
export function isPrintableAscii(byte) {
  return byte >= 32 && byte <= 126;
}

/**
 * Converts a byte to its ASCII character representation
 * @param {number} byte - Byte value (0-255)
 * @param {string} placeholder - Character to use for non-printable bytes
 * @returns {string} ASCII character or placeholder
 */
export function byteToAscii(byte, placeholder = '.') {
  return isPrintableAscii(byte) ? String.fromCharCode(byte) : placeholder;
}

/**
 * Categorizes a byte for color coding
 * @param {number} byte - Byte value (0-255)
 * @returns {string} Category: 'printable', 'null', 'non-printable'
 */
export function categorizeByteType(byte) {
  if (byte === 0) return 'null';
  if (isPrintableAscii(byte)) return 'printable';
  return 'non-printable';
}

/**
 * Formats a row of bytes for hex viewer display
 * @param {Uint8Array} bytes - Array of bytes to format (typically 16 bytes)
 * @param {number} offset - Starting offset of this row
 * @param {number} bytesPerRow - Number of bytes per row (default 16)
 * @param {boolean} useHexOffset - Use hex offset (true) or decimal (false)
 * @returns {Object} Formatted row object
 */
export function formatHexRow(bytes, offset, bytesPerRow = 16, useHexOffset = true) {
  const hexBytes = [];
  const asciiChars = [];
  const byteCategories = [];

  // Process each byte in the row
  for (let i = 0; i < bytesPerRow; i++) {
    if (i < bytes.length) {
      const byte = bytes[i];
      hexBytes.push(byteToHex(byte));
      asciiChars.push(byteToAscii(byte));
      byteCategories.push(categorizeByteType(byte));
    } else {
      // Padding for incomplete rows
      hexBytes.push('  ');
      asciiChars.push(' ');
      byteCategories.push('empty');
    }
  }

  // Group hex bytes by 8 for readability (legacy format)
  const hexPart1 = hexBytes.slice(0, 8).join(' ');
  const hexPart2 = hexBytes.slice(8, 16).join(' ');

  return {
    offset: useHexOffset ? offsetToHex(offset) : offsetToDecimal(offset),
    hexPart1,
    hexPart2,
    hexBytes,        // Individual hex strings for clickable rendering
    asciiChars,      // Individual ASCII chars for clickable rendering
    ascii: asciiChars.join(''),
    bytes: bytes,
    categories: byteCategories,
    byteOffset: offset
  };
}

/**
 * Parses hex string input to byte offset
 * @param {string} input - Hex string (e.g., "FF" or "0xFF")
 * @returns {number|null} Parsed offset or null if invalid
 */
export function parseHexOffset(input) {
  const cleaned = input.trim().replace(/^0x/i, '');
  const parsed = parseInt(cleaned, 16);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Parses decimal string input to byte offset
 * @param {string} input - Decimal string
 * @returns {number|null} Parsed offset or null if invalid
 */
export function parseDecimalOffset(input) {
  const parsed = parseInt(input, 10);
  return isNaN(parsed) ? null : parsed;
}
