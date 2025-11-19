/**
 * Byte Converter Utility
 *
 * Provides utilities for converting byte sequences to various data types
 * for the data interpretation panel in the hex viewer.
 */

/**
 * Converts bytes to signed 8-bit integer
 * @param {Uint8Array} bytes - Byte array (at least 1 byte)
 * @returns {number} Signed 8-bit integer (-128 to 127)
 */
export function bytesToInt8(bytes) {
  if (bytes.length < 1) return 0;
  const value = bytes[0];
  return value > 127 ? value - 256 : value;
}

/**
 * Converts bytes to unsigned 8-bit integer
 * @param {Uint8Array} bytes - Byte array (at least 1 byte)
 * @returns {number} Unsigned 8-bit integer (0 to 255)
 */
export function bytesToUint8(bytes) {
  return bytes.length >= 1 ? bytes[0] : 0;
}

/**
 * Converts bytes to signed 16-bit integer (little-endian)
 * @param {Uint8Array} bytes - Byte array (at least 2 bytes)
 * @returns {number} Signed 16-bit integer
 */
export function bytesToInt16LE(bytes) {
  if (bytes.length < 2) return 0;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getInt16(0, true); // true = little-endian
}

/**
 * Converts bytes to signed 16-bit integer (big-endian)
 * @param {Uint8Array} bytes - Byte array (at least 2 bytes)
 * @returns {number} Signed 16-bit integer
 */
export function bytesToInt16BE(bytes) {
  if (bytes.length < 2) return 0;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getInt16(0, false); // false = big-endian
}

/**
 * Converts bytes to unsigned 16-bit integer (little-endian)
 * @param {Uint8Array} bytes - Byte array (at least 2 bytes)
 * @returns {number} Unsigned 16-bit integer
 */
export function bytesToUint16LE(bytes) {
  if (bytes.length < 2) return 0;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getUint16(0, true);
}

/**
 * Converts bytes to unsigned 16-bit integer (big-endian)
 * @param {Uint8Array} bytes - Byte array (at least 2 bytes)
 * @returns {number} Unsigned 16-bit integer
 */
export function bytesToUint16BE(bytes) {
  if (bytes.length < 2) return 0;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getUint16(0, false);
}

/**
 * Converts bytes to signed 32-bit integer (little-endian)
 * @param {Uint8Array} bytes - Byte array (at least 4 bytes)
 * @returns {number} Signed 32-bit integer
 */
export function bytesToInt32LE(bytes) {
  if (bytes.length < 4) return 0;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getInt32(0, true);
}

/**
 * Converts bytes to signed 32-bit integer (big-endian)
 * @param {Uint8Array} bytes - Byte array (at least 4 bytes)
 * @returns {number} Signed 32-bit integer
 */
export function bytesToInt32BE(bytes) {
  if (bytes.length < 4) return 0;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getInt32(0, false);
}

/**
 * Converts bytes to unsigned 32-bit integer (little-endian)
 * @param {Uint8Array} bytes - Byte array (at least 4 bytes)
 * @returns {number} Unsigned 32-bit integer
 */
export function bytesToUint32LE(bytes) {
  if (bytes.length < 4) return 0;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getUint32(0, true);
}

/**
 * Converts bytes to unsigned 32-bit integer (big-endian)
 * @param {Uint8Array} bytes - Byte array (at least 4 bytes)
 * @returns {number} Unsigned 32-bit integer
 */
export function bytesToUint32BE(bytes) {
  if (bytes.length < 4) return 0;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getUint32(0, false);
}

/**
 * Converts bytes to UTF-8 text
 * @param {Uint8Array} bytes - Byte array
 * @returns {string} Decoded UTF-8 text
 */
export function bytesToUtf8(bytes) {
  try {
    const decoder = new TextDecoder('utf-8', { fatal: false });
    return decoder.decode(bytes);
  } catch (error) {
    return '[Invalid UTF-8]';
  }
}

/**
 * Converts bytes to ASCII text (7-bit only)
 * @param {Uint8Array} bytes - Byte array
 * @returns {string} ASCII text (non-ASCII bytes shown as �)
 */
export function bytesToAscii(bytes) {
  try {
    const decoder = new TextDecoder('ascii', { fatal: false });
    return decoder.decode(bytes);
  } catch (error) {
    return '[Invalid ASCII]';
  }
}

/**
 * Converts bytes to Unix timestamp (assumes 32-bit timestamp)
 * @param {Uint8Array} bytes - Byte array (at least 4 bytes)
 * @param {boolean} littleEndian - Use little-endian (default true)
 * @returns {string} Formatted date string or error message
 */
export function bytesToUnixTimestamp(bytes, littleEndian = true) {
  if (bytes.length < 4) return 'N/A';

  try {
    const timestamp = littleEndian ? bytesToUint32LE(bytes) : bytesToUint32BE(bytes);

    // Sanity check: Unix timestamp should be reasonable (between 1970 and 2100)
    if (timestamp < 0 || timestamp > 4102444800) {
      return 'Invalid timestamp';
    }

    const date = new Date(timestamp * 1000);
    return date.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  } catch (error) {
    return 'Invalid timestamp';
  }
}

/**
 * Converts bytes to hex string
 * @param {Uint8Array} bytes - Byte array
 * @returns {string} Hex string (e.g., "FF 00 AB")
 */
export function bytesToHexString(bytes) {
  return Array.from(bytes)
    .map(b => b.toString(16).toUpperCase().padStart(2, '0'))
    .join(' ');
}

/**
 * Interprets selected bytes in all available formats
 * @param {Uint8Array} bytes - Selected byte array
 * @returns {Object} Object with all interpretations
 */
export function interpretBytes(bytes) {
  if (!bytes || bytes.length === 0) {
    return {
      hexString: '',
      utf8: '',
      ascii: '',
      int8: 'N/A',
      uint8: 'N/A',
      int16LE: 'N/A',
      int16BE: 'N/A',
      uint16LE: 'N/A',
      uint16BE: 'N/A',
      int32LE: 'N/A',
      int32BE: 'N/A',
      uint32LE: 'N/A',
      uint32BE: 'N/A',
      timestampLE: 'N/A',
      timestampBE: 'N/A'
    };
  }

  return {
    hexString: bytesToHexString(bytes),
    utf8: bytesToUtf8(bytes),
    ascii: bytesToAscii(bytes),
    int8: bytes.length >= 1 ? bytesToInt8(bytes) : 'N/A',
    uint8: bytes.length >= 1 ? bytesToUint8(bytes) : 'N/A',
    int16LE: bytes.length >= 2 ? bytesToInt16LE(bytes) : 'N/A',
    int16BE: bytes.length >= 2 ? bytesToInt16BE(bytes) : 'N/A',
    uint16LE: bytes.length >= 2 ? bytesToUint16LE(bytes) : 'N/A',
    uint16BE: bytes.length >= 2 ? bytesToUint16BE(bytes) : 'N/A',
    int32LE: bytes.length >= 4 ? bytesToInt32LE(bytes) : 'N/A',
    int32BE: bytes.length >= 4 ? bytesToInt32BE(bytes) : 'N/A',
    uint32LE: bytes.length >= 4 ? bytesToUint32LE(bytes) : 'N/A',
    uint32BE: bytes.length >= 4 ? bytesToUint32BE(bytes) : 'N/A',
    timestampLE: bytes.length >= 4 ? bytesToUnixTimestamp(bytes, true) : 'N/A',
    timestampBE: bytes.length >= 4 ? bytesToUnixTimestamp(bytes, false) : 'N/A'
  };
}
