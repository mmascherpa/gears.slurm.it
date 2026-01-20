/**
 * TOTP (Time-based One-Time Password) Utility Functions
 * RFC 6238 compliant implementation using native Web Crypto API
 *
 * No external dependencies - uses browser-native crypto
 */

// Base32 alphabet (RFC 4648)
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Decode a Base32 string to Uint8Array
 * @param {string} base32 - Base32 encoded string (case-insensitive, spaces/dashes ignored)
 * @returns {Uint8Array} Decoded bytes
 * @throws {Error} If string contains invalid Base32 characters
 */
export function decodeBase32(base32) {
  // Normalize: uppercase, remove spaces, dashes, and padding
  const normalized = base32.toUpperCase().replace(/[\s=-]/g, '');

  if (normalized.length === 0) {
    return new Uint8Array(0);
  }

  // Validate characters
  for (const char of normalized) {
    if (!BASE32_ALPHABET.includes(char)) {
      throw new Error(`Invalid Base32 character: ${char}`);
    }
  }

  // Decode Base32 to bytes
  // Each Base32 char represents 5 bits, 8 chars = 40 bits = 5 bytes
  const outputLength = Math.floor((normalized.length * 5) / 8);
  const output = new Uint8Array(outputLength);

  let bits = 0;
  let value = 0;
  let outputIndex = 0;

  for (const char of normalized) {
    value = (value << 5) | BASE32_ALPHABET.indexOf(char);
    bits += 5;

    if (bits >= 8) {
      bits -= 8;
      output[outputIndex++] = (value >> bits) & 0xff;
    }
  }

  return output;
}

/**
 * Validate a TOTP secret (Base32 format)
 * @param {string} secret - The secret to validate
 * @returns {Object} { isValid: boolean, error: string|null, normalized: string }
 */
export function validateTotpSecret(secret) {
  if (!secret || typeof secret !== 'string') {
    return { isValid: false, error: 'Secret is required', normalized: '' };
  }

  // Normalize: uppercase, remove spaces, dashes, and padding
  const normalized = secret.toUpperCase().replace(/[\s=-]/g, '');

  if (normalized.length === 0) {
    return { isValid: false, error: 'Secret is empty after normalization', normalized: '' };
  }

  // Minimum length check (most secrets are 16+ chars, but allow shorter for flexibility)
  if (normalized.length < 8) {
    return { isValid: false, error: 'Secret is too short (minimum 8 characters)', normalized };
  }

  // Validate characters
  for (const char of normalized) {
    if (!BASE32_ALPHABET.includes(char)) {
      return { isValid: false, error: `Invalid character: ${char}`, normalized };
    }
  }

  return { isValid: true, error: null, normalized };
}

/**
 * Generate a TOTP code using Web Crypto API
 * Implements RFC 6238 (TOTP) and RFC 4226 (HOTP)
 *
 * @param {string} secret - Base32 encoded secret
 * @param {Object} options - Configuration options
 * @param {number} options.period - Time step in seconds (default: 30)
 * @param {number} options.digits - Number of digits (default: 6)
 * @param {string} options.algorithm - Hash algorithm: 'SHA-1', 'SHA-256', 'SHA-512' (default: 'SHA-1')
 * @param {number} options.timestamp - Custom timestamp in ms (default: Date.now())
 * @returns {Promise<string>} The TOTP code (zero-padded to digits length)
 * @throws {Error} If secret is invalid or crypto operation fails
 */
export async function generateTotp(secret, options = {}) {
  const {
    period = 30,
    digits = 6,
    algorithm = 'SHA-1',
    timestamp = Date.now()
  } = options;

  // Decode secret
  const secretBytes = decodeBase32(secret);

  if (secretBytes.length === 0) {
    throw new Error('Invalid secret: decoded to empty bytes');
  }

  // Calculate counter (time steps since Unix epoch)
  const counter = Math.floor(timestamp / 1000 / period);

  // Convert counter to 8-byte big-endian buffer
  const counterBuffer = new ArrayBuffer(8);
  const counterView = new DataView(counterBuffer);
  // JavaScript bitwise ops work on 32-bit, so we handle high and low parts separately
  counterView.setUint32(0, Math.floor(counter / 0x100000000), false); // High 32 bits
  counterView.setUint32(4, counter >>> 0, false); // Low 32 bits

  // Import secret as HMAC key
  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign']
  );

  // Calculate HMAC
  const hmacResult = await crypto.subtle.sign('HMAC', key, counterBuffer);
  const hmacBytes = new Uint8Array(hmacResult);

  // Dynamic truncation (RFC 4226 section 5.4)
  const offset = hmacBytes[hmacBytes.length - 1] & 0x0f;
  const binary =
    ((hmacBytes[offset] & 0x7f) << 24) |
    ((hmacBytes[offset + 1] & 0xff) << 16) |
    ((hmacBytes[offset + 2] & 0xff) << 8) |
    (hmacBytes[offset + 3] & 0xff);

  // Generate OTP
  const otp = binary % Math.pow(10, digits);

  // Zero-pad to required digits
  return otp.toString().padStart(digits, '0');
}

/**
 * Get the time remaining until the current TOTP code expires
 * @param {number} period - Time step in seconds (default: 30)
 * @returns {number} Seconds remaining (1 to period)
 */
export function getTotpTimeRemaining(period = 30) {
  const now = Math.floor(Date.now() / 1000);
  const remaining = period - (now % period);
  return remaining;
}

/**
 * Build a TOTP URI for QR code generation (otpauth:// format)
 * Compatible with Google Authenticator, Authy, etc.
 *
 * @param {Object} params
 * @param {string} params.secret - Base32 secret (will be normalized)
 * @param {string} params.issuer - Service/app name (e.g., "GitHub")
 * @param {string} params.accountName - User identifier (e.g., "user@example.com")
 * @param {number} params.period - Time step in seconds (default: 30)
 * @param {number} params.digits - Number of digits (default: 6)
 * @param {string} params.algorithm - Hash algorithm (default: 'SHA1')
 * @returns {string} otpauth:// URI
 */
export function buildTotpUri(params) {
  const {
    secret,
    issuer = '',
    accountName = '',
    period = 30,
    digits = 6,
    algorithm = 'SHA1'
  } = params;

  // Normalize secret
  const normalizedSecret = secret.toUpperCase().replace(/[\s=-]/g, '');

  // Build label (issuer:accountName or just accountName)
  const label = issuer
    ? `${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}`
    : encodeURIComponent(accountName);

  // Build query parameters
  const queryParams = new URLSearchParams();
  queryParams.set('secret', normalizedSecret);

  if (issuer) {
    queryParams.set('issuer', issuer);
  }

  // Only add non-default values
  if (algorithm !== 'SHA1') {
    queryParams.set('algorithm', algorithm);
  }
  if (digits !== 6) {
    queryParams.set('digits', digits.toString());
  }
  if (period !== 30) {
    queryParams.set('period', period.toString());
  }

  return `otpauth://totp/${label}?${queryParams.toString()}`;
}
