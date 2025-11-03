/**
 * jsAesCrypt Provider - Wraps the jsAesCrypt library
 * https://github.com/KubaO/aes_crypt
 *
 * Uses AES-256 CBC encryption with HMAC-SHA256 authentication
 * Compatible with AES Crypt file format version 2
 */

import { CryptoProvider, ErrorCodes } from '../CryptoProvider.js';

export class JsAesCryptProvider extends CryptoProvider {
  constructor(options = {}) {
    super();
    this.aesCrypt = options.aesCrypt || null; // Will be set in worker context
  }

  /**
   * Sets the jsAesCrypt library instance
   * @param {Object} aesCrypt - Global aesCrypt object from library
   */
  setLibrary(aesCrypt) {
    this.aesCrypt = aesCrypt;
  }

  /**
   * Encrypts data using jsAesCrypt
   * @param {Uint8Array|Blob} data - Data to encrypt
   * @param {string} password - Encryption password
   * @returns {Promise<Uint8Array>} Encrypted data in .aes format
   */
  async encrypt(data, password) {
    if (!this.aesCrypt) {
      throw new Error('jsAesCrypt library not loaded');
    }

    // Validate password
    const validation = this.validatePassword(password);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    try {
      // jsAesCrypt accepts Blob or Uint8Array
      const result = await this.aesCrypt.encrypt(data, password);
      return result;
    } catch (error) {
      throw this._enhanceError(error, 'encrypt');
    }
  }

  /**
   * Decrypts data using jsAesCrypt
   * @param {Uint8Array|Blob} data - Encrypted data in .aes format
   * @param {string} password - Decryption password
   * @returns {Promise<Uint8Array>} Decrypted data
   */
  async decrypt(data, password) {
    if (!this.aesCrypt) {
      throw new Error('jsAesCrypt library not loaded');
    }

    try {
      const result = await this.aesCrypt.decrypt(data, password);
      return result;
    } catch (error) {
      throw this._enhanceError(error, 'decrypt');
    }
  }

  /**
   * Gets provider information
   * @returns {ProviderInfo} Provider metadata
   */
  getInfo() {
    return {
      name: 'jsAesCrypt',
      version: this.aesCrypt?.info?.version || '0.15',
      maxPasswordLength: this.aesCrypt?.info?.maxPassLen || 1024,
      fileExtension: '.aes',
      description: 'AES-256 CBC encryption compatible with AES Crypt format v2'
    };
  }

  /**
   * Normalizes jsAesCrypt errors to standard format
   * @param {Error|string} error - Raw error from jsAesCrypt
   * @returns {NormalizedError} Normalized error object
   */
  normalizeError(error) {
    const errorMessage = typeof error === 'string' ? error : (error?.message || 'Unknown error');
    const lowerError = errorMessage.toLowerCase();

    // Map jsAesCrypt-specific errors to standard codes
    if (lowerError.includes('wrong password') || lowerError.includes('bad hmac')) {
      return {
        code: ErrorCodes.WRONG_PASSWORD,
        message: errorMessage,
        userMessage: '❌ Incorrect password. Please check your password and try again.'
      };
    }

    if (lowerError.includes('password is too long')) {
      return {
        code: ErrorCodes.PASSWORD_TOO_LONG,
        message: errorMessage,
        userMessage: `❌ Password too long (max ${this.getInfo().maxPasswordLength} characters)`
      };
    }

    if (lowerError.includes('corrupted') || lowerError.includes('tampered')) {
      return {
        code: ErrorCodes.CORRUPTED_DATA,
        message: errorMessage,
        userMessage: '❌ File appears to be corrupted or tampered with'
      };
    }

    if (lowerError.includes('not an aes crypt') || lowerError.includes('invalid format')) {
      return {
        code: ErrorCodes.INVALID_FORMAT,
        message: errorMessage,
        userMessage: '❌ This file is not a valid AES encrypted file'
      };
    }

    // Default unknown error
    return {
      code: ErrorCodes.UNKNOWN_ERROR,
      message: errorMessage,
      userMessage: '❌ An unexpected error occurred'
    };
  }

  /**
   * Enhances error with context
   * @param {Error|string} error - Original error
   * @param {string} operation - 'encrypt' or 'decrypt'
   * @returns {Error} Enhanced error
   * @private
   */
  _enhanceError(error, operation) {
    const errorMessage = typeof error === 'string' ? error : (error?.message || 'Unknown error');
    const enhancedError = new Error(`${operation} failed: ${errorMessage}`);
    enhancedError.originalError = error;
    enhancedError.operation = operation;
    return enhancedError;
  }
}
