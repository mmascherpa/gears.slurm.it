/**
 * Age Encryption Provider for Web Worker context
 * Uses rage-wasm for age file encryption format
 *
 * This is a worker-compatible version without ES6 imports
 *
 * File Format: Standard age encryption format (.age files)
 * Compatible with age CLI tools from https://age-encryption.org
 */

class AgeWorkerProvider {
  constructor(rageWasm) {
    this.rage = rageWasm;
  }

  /**
   * Encrypts data using age encryption with passphrase
   * @param {Uint8Array|Blob} data - Data to encrypt
   * @param {string} password - Encryption password
   * @returns {Promise<Uint8Array>} Encrypted data
   */
  async encrypt(data, password) {
    if (!this.rage) {
      throw new Error('rage-wasm library not loaded');
    }

    try {
      // Validate password
      const validation = this.validatePassword(password);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Convert Blob to Uint8Array if needed
      const dataArray = await this._ensureUint8Array(data);

      // Call rage-wasm: encrypt_with_user_passphrase(passphrase, data, armor)
      // armor=false for binary format (true would create ASCII-armored .age file)
      const encrypted = await this.rage.encrypt_with_user_passphrase(
        password,
        dataArray,
        false
      );

      return encrypted;
    } catch (error) {
      throw this._enhanceError(error, 'encrypt');
    }
  }

  /**
   * Decrypts data using age encryption with passphrase
   * @param {Uint8Array|Blob} data - Encrypted data
   * @param {string} password - Decryption password
   * @returns {Promise<Uint8Array>} Decrypted data
   */
  async decrypt(data, password) {
    if (!this.rage) {
      throw new Error('rage-wasm library not loaded');
    }

    try {
      // Convert Blob to Uint8Array if needed
      const dataArray = await this._ensureUint8Array(data);

      // Call rage-wasm: decrypt_with_user_passphrase(passphrase, data)
      const decrypted = await this.rage.decrypt_with_user_passphrase(
        password,
        dataArray
      );

      return decrypted;
    } catch (error) {
      throw this._enhanceError(error, 'decrypt');
    }
  }

  /**
   * Gets provider information
   * @returns {Object} Provider metadata
   */
  getInfo() {
    return {
      name: 'Age',
      version: '1.0.0',
      maxPasswordLength: null, // No password length limit
      fileExtension: '.age',
      description: 'Modern age encryption format compatible with age CLI tools'
    };
  }

  /**
   * Normalizes age encryption errors to standard format
   * @param {Error|string} error - Raw error from rage-wasm
   * @returns {Object} Normalized error object
   */
  normalizeError(error) {
    const errorMessage = typeof error === 'string' ? error : (error?.message || 'Unknown error');
    const lowerError = errorMessage.toLowerCase();

    // Map rage-specific errors to standard codes
    if (lowerError.includes('wrong password') ||
        lowerError.includes('incorrect passphrase') ||
        lowerError.includes('decryption failed') ||
        lowerError.includes('failed to decrypt')) {
      return {
        code: 'WRONG_PASSWORD',
        message: errorMessage,
        userMessage: '❌ Incorrect password. Please check your password and try again.'
      };
    }

    if (lowerError.includes('invalid') ||
        lowerError.includes('format') ||
        lowerError.includes('not an age encrypted file') ||
        lowerError.includes('malformed')) {
      return {
        code: 'INVALID_FORMAT',
        message: errorMessage,
        userMessage: '❌ This file is not a valid age encrypted file'
      };
    }

    if (lowerError.includes('corrupted') || lowerError.includes('tampered')) {
      return {
        code: 'CORRUPTED_DATA',
        message: errorMessage,
        userMessage: '❌ File appears to be corrupted or tampered with'
      };
    }

    if (lowerError.includes('password is required')) {
      return {
        code: 'PASSWORD_REQUIRED',
        message: errorMessage,
        userMessage: '❌ Password is required'
      };
    }

    // Default unknown error
    return {
      code: 'UNKNOWN_ERROR',
      message: errorMessage,
      userMessage: '❌ An unexpected error occurred'
    };
  }

  /**
   * Validates password against provider requirements
   * @param {string} password - Password to validate
   * @returns {Object} Validation result
   */
  validatePassword(password) {
    if (!password || typeof password !== 'string') {
      return { valid: false, error: 'Password is required' };
    }

    if (password.length === 0) {
      return { valid: false, error: 'Password cannot be empty' };
    }

    return { valid: true };
  }

  /**
   * Converts Blob to Uint8Array if needed
   * @param {Uint8Array|Blob} data - Input data
   * @returns {Promise<Uint8Array>} Data as Uint8Array
   * @private
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
