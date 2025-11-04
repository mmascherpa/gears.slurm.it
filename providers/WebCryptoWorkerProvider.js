/**
 * Web Crypto API Provider for Web Worker context
 * Uses browser-native SubtleCrypto for AES-GCM encryption
 *
 * This is a worker-compatible version without ES6 imports
 *
 * File Format:
 * [salt(16 bytes)][iv(12 bytes)][encrypted data]
 */

class WebCryptoWorkerProvider {
  constructor(options = {}) {
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
   * Encrypts data using Web Crypto API (AES-256-GCM)
   * @param {Uint8Array|Blob} data - Data to encrypt
   * @param {string} password - Encryption password
   * @returns {Promise<Uint8Array>} Encrypted data
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
   * @param {Uint8Array|Blob} data - Encrypted data
   * @param {string} password - Decryption password
   * @returns {Promise<Uint8Array>} Decrypted data
   */
  async decrypt(data, password) {
    try {
      // Ensure data is Uint8Array
      const dataArray = await this._ensureUint8Array(data);

      // Validate minimum length
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
   * @returns {Object} Provider metadata
   */
  getInfo() {
    return {
      name: 'WebCrypto',
      version: '1.0.0',
      maxPasswordLength: 1024,
      fileExtension: '.enc',
      description: 'Browser-native AES-256-GCM encryption with PBKDF2 key derivation'
    };
  }

  /**
   * Normalizes Web Crypto errors to standard format
   * @param {Error|string} error - Raw error
   * @returns {Object} Normalized error object
   */
  normalizeError(error) {
    const errorMessage = typeof error === 'string' ? error : (error?.message || 'Unknown error');
    const lowerError = errorMessage.toLowerCase();

    if (lowerError.includes('wrong password') || lowerError.includes('corrupted data')) {
      return {
        code: 'WRONG_PASSWORD',
        message: errorMessage,
        userMessage: '❌ Incorrect password or corrupted file'
      };
    }

    if (lowerError.includes('password is required')) {
      return {
        code: 'PASSWORD_TOO_LONG',
        message: errorMessage,
        userMessage: '❌ Password is required'
      };
    }

    if (lowerError.includes('password too long')) {
      return {
        code: 'PASSWORD_TOO_LONG',
        message: errorMessage,
        userMessage: `❌ Password too long (max ${this.getInfo().maxPasswordLength} characters)`
      };
    }

    if (lowerError.includes('invalid format') || lowerError.includes('file too short')) {
      return {
        code: 'INVALID_FORMAT',
        message: errorMessage,
        userMessage: '❌ Invalid encrypted file format'
      };
    }

    if (lowerError.includes('encrypt failed')) {
      return {
        code: 'ENCRYPTION_FAILED',
        message: errorMessage,
        userMessage: '❌ Encryption failed'
      };
    }

    if (lowerError.includes('decrypt failed')) {
      return {
        code: 'DECRYPTION_FAILED',
        message: errorMessage,
        userMessage: '❌ Decryption failed'
      };
    }

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
