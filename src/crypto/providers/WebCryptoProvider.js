/**
 * Web Crypto API Provider
 * Uses browser-native SubtleCrypto for AES-GCM encryption
 *
 * Features:
 * - No external dependencies
 * - Browser-native encryption (SubtleCrypto)
 * - AES-256-GCM with authentication
 * - Custom file format (NOT compatible with .aes files)
 *
 * File Format:
 * [salt(16 bytes)][iv(12 bytes)][encrypted data]
 */

import { CryptoProvider, ErrorCodes } from '../CryptoProvider.js';

export class WebCryptoProvider extends CryptoProvider {
  constructor(options = {}) {
    super();
    this.iterations = options.iterations || 100000; // PBKDF2 iterations
    this.saltLength = 16; // 128 bits
    this.ivLength = 12; // 96 bits (recommended for GCM)
  }

  /**
   * Derives encryption key from password using PBKDF2
   * @param {string} password - Password
   * @param {Uint8Array} salt - Salt for key derivation
   * @returns {Promise<CryptoKey>} Derived key
   * @private
   */
  async _deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    // Derive AES-GCM key
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypts data using Web Crypto API (AES-256-GCM)
   * @param {Uint8Array|Blob} data - Data to encrypt
   * @param {string} password - Encryption password
   * @returns {Promise<Uint8Array>} Encrypted data with salt and IV prepended
   */
  async encrypt(data, password) {
    try {
      // Validate password
      const validation = this.validatePassword(password);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Ensure data is Uint8Array
      const dataArray = await this._ensureUint8Array(data);

      // Generate random salt and IV
      const salt = crypto.getRandomValues(new Uint8Array(this.saltLength));
      const iv = crypto.getRandomValues(new Uint8Array(this.ivLength));

      // Derive key from password
      const key = await this._deriveKey(password, salt);

      // Encrypt data
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        dataArray
      );

      const encryptedArray = new Uint8Array(encryptedBuffer);

      // Combine: salt + iv + encrypted data
      const result = new Uint8Array(salt.length + iv.length + encryptedArray.length);
      result.set(salt, 0);
      result.set(iv, salt.length);
      result.set(encryptedArray, salt.length + iv.length);

      return result;
    } catch (error) {
      throw this._enhanceError(error, 'encrypt');
    }
  }

  /**
   * Decrypts data using Web Crypto API (AES-256-GCM)
   * @param {Uint8Array|Blob} data - Encrypted data with salt and IV prepended
   * @param {string} password - Decryption password
   * @returns {Promise<Uint8Array>} Decrypted data
   */
  async decrypt(data, password) {
    try {
      // Ensure data is Uint8Array
      const dataArray = await this._ensureUint8Array(data);

      // Validate minimum length (salt + iv)
      const minLength = this.saltLength + this.ivLength;
      if (dataArray.length < minLength) {
        throw new Error('Invalid file format: file too short');
      }

      // Extract salt, IV, and encrypted data
      const salt = dataArray.slice(0, this.saltLength);
      const iv = dataArray.slice(this.saltLength, this.saltLength + this.ivLength);
      const encryptedData = dataArray.slice(this.saltLength + this.ivLength);

      // Derive key from password
      const key = await this._deriveKey(password, salt);

      // Decrypt data
      try {
        const decryptedBuffer = await crypto.subtle.decrypt(
          {
            name: 'AES-GCM',
            iv: iv
          },
          key,
          encryptedData
        );

        return new Uint8Array(decryptedBuffer);
      } catch (error) {
        // GCM authentication failure typically means wrong password
        if (error.name === 'OperationError') {
          throw new Error('Wrong password or corrupted data');
        }
        throw error;
      }
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
      name: 'WebCrypto',
      version: '1.0.0',
      maxPasswordLength: 1024, // Practical limit
      fileExtension: '.enc',
      description: 'Browser-native AES-256-GCM encryption with PBKDF2 key derivation'
    };
  }

  /**
   * Normalizes Web Crypto errors to standard format
   * @param {Error|string} error - Raw error from Web Crypto API
   * @returns {NormalizedError} Normalized error object
   */
  normalizeError(error) {
    const errorMessage = typeof error === 'string' ? error : (error?.message || 'Unknown error');
    const lowerError = errorMessage.toLowerCase();

    if (lowerError.includes('wrong password') || lowerError.includes('corrupted data')) {
      return {
        code: ErrorCodes.WRONG_PASSWORD,
        message: errorMessage,
        userMessage: '❌ Incorrect password or corrupted file'
      };
    }

    if (lowerError.includes('password is required')) {
      return {
        code: ErrorCodes.PASSWORD_TOO_LONG,
        message: errorMessage,
        userMessage: '❌ Password is required'
      };
    }

    if (lowerError.includes('password too long')) {
      return {
        code: ErrorCodes.PASSWORD_TOO_LONG,
        message: errorMessage,
        userMessage: `❌ Password too long (max ${this.getInfo().maxPasswordLength} characters)`
      };
    }

    if (lowerError.includes('invalid format') || lowerError.includes('file too short')) {
      return {
        code: ErrorCodes.INVALID_FORMAT,
        message: errorMessage,
        userMessage: '❌ Invalid encrypted file format'
      };
    }

    if (lowerError.includes('encrypt failed')) {
      return {
        code: ErrorCodes.ENCRYPTION_FAILED,
        message: errorMessage,
        userMessage: '❌ Encryption failed'
      };
    }

    if (lowerError.includes('decrypt failed')) {
      return {
        code: ErrorCodes.DECRYPTION_FAILED,
        message: errorMessage,
        userMessage: '❌ Decryption failed'
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
