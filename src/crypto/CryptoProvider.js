/**
 * Base interface for encryption providers.
 * All encryption providers must implement this contract to ensure compatibility
 * with the application's encryption workflow.
 *
 * @interface CryptoProvider
 */

/**
 * Standard error codes for encryption operations
 */
export const ErrorCodes = {
  WRONG_PASSWORD: 'WRONG_PASSWORD',
  PASSWORD_TOO_LONG: 'PASSWORD_TOO_LONG',
  CORRUPTED_DATA: 'CORRUPTED_DATA',
  INVALID_FORMAT: 'INVALID_FORMAT',
  ENCRYPTION_FAILED: 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED: 'DECRYPTION_FAILED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

/**
 * Standard error structure
 * @typedef {Object} NormalizedError
 * @property {string} code - Error code from ErrorCodes
 * @property {string} message - Technical error message
 * @property {string} userMessage - User-friendly error message
 */

/**
 * Provider information
 * @typedef {Object} ProviderInfo
 * @property {string} name - Provider name (e.g., 'jsAesCrypt')
 * @property {string} version - Provider version
 * @property {number} maxPasswordLength - Maximum password length supported
 * @property {string} fileExtension - Default file extension (e.g., '.aes')
 * @property {string} [description] - Optional provider description
 */

/**
 * Base class for encryption providers.
 * Extend this class to create a new encryption provider.
 */
export class CryptoProvider {
  /**
   * Encrypts data with a password
   * @param {Uint8Array|Blob} data - Data to encrypt
   * @param {string} password - Encryption password
   * @returns {Promise<Uint8Array>} Encrypted data
   * @throws {Error} If encryption fails
   */
  async encrypt(data, password) {
    throw new Error('encrypt() must be implemented by provider');
  }

  /**
   * Decrypts data with a password
   * @param {Uint8Array|Blob} data - Data to decrypt
   * @param {string} password - Decryption password
   * @returns {Promise<Uint8Array>} Decrypted data
   * @throws {Error} If decryption fails
   */
  async decrypt(data, password) {
    throw new Error('decrypt() must be implemented by provider');
  }

  /**
   * Gets provider information
   * @returns {ProviderInfo} Provider metadata
   */
  getInfo() {
    throw new Error('getInfo() must be implemented by provider');
  }

  /**
   * Normalizes provider-specific errors to standard format
   * @param {Error|string} error - Raw error from encryption/decryption
   * @returns {NormalizedError} Normalized error object
   */
  normalizeError(error) {
    const errorMessage = typeof error === 'string' ? error : (error?.message || 'Unknown error');

    return {
      code: ErrorCodes.UNKNOWN_ERROR,
      message: errorMessage,
      userMessage: '❌ An unexpected error occurred'
    };
  }

  /**
   * Validates that a password meets provider requirements
   * @param {string} password - Password to validate
   * @returns {{valid: boolean, error?: string}} Validation result
   */
  validatePassword(password) {
    if (!password || typeof password !== 'string') {
      return { valid: false, error: 'Password is required' };
    }

    const info = this.getInfo();
    if (password.length > info.maxPasswordLength) {
      return {
        valid: false,
        error: `Password too long (max ${info.maxPasswordLength} characters)`
      };
    }

    return { valid: true };
  }

  /**
   * Converts Blob to Uint8Array if needed
   * @param {Uint8Array|Blob} data - Input data
   * @returns {Promise<Uint8Array>} Data as Uint8Array
   * @protected
   */
  async _ensureUint8Array(data) {
    if (data instanceof Uint8Array) {
      return data;
    }

    if (data instanceof Blob) {
      const arrayBuffer = await data.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    }

    throw new Error('Data must be Uint8Array or Blob');
  }
}

/**
 * Factory for creating crypto providers
 */
export class CryptoProviderFactory {
  static providers = new Map();

  /**
   * Registers a provider
   * @param {string} name - Provider name
   * @param {Function} providerClass - Provider class constructor
   */
  static register(name, providerClass) {
    this.providers.set(name, providerClass);
  }

  /**
   * Creates a provider instance
   * @param {string} name - Provider name
   * @param {Object} [options] - Provider-specific options
   * @returns {CryptoProvider} Provider instance
   */
  static create(name, options = {}) {
    const ProviderClass = this.providers.get(name);
    if (!ProviderClass) {
      throw new Error(`Unknown provider: ${name}`);
    }
    return new ProviderClass(options);
  }

  /**
   * Gets list of registered provider names
   * @returns {string[]} Provider names
   */
  static getAvailableProviders() {
    return Array.from(this.providers.keys());
  }
}
