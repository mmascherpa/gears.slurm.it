/**
 * Age Encryption Provider for Web Worker context
 * Uses rage-wasm for age file encryption format
 *
 * ES Module version for Vite bundling
 *
 * File Format: Standard age encryption format (.age files)
 * Compatible with age CLI tools from https://age-encryption.org
 */

export class AgeWorkerProvider {
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

    let workFactor = null;

    try {
      // Convert Blob to Uint8Array if needed
      const dataArray = await this._ensureUint8Array(data);

      // Parse age file header to identify recipient type and work factor
      // Age format: "age-encryption.org/v1\n" followed by recipient stanzas
      let fullHeader = '';
      let recipientInfo = [];
      try {
        // Read until we hit the body marker (empty line followed by base64 body)
        let headerEndIndex = -1;
        for (let i = 1; i < Math.min(dataArray.length, 1000); i++) {
          // Check for \n\n (Unix) or \r\n\r\n (Windows)
          if (dataArray[i-1] === 10 && dataArray[i] === 10) {
            headerEndIndex = i;
            break;
          }
          if (i >= 3 && dataArray[i-3] === 13 && dataArray[i-2] === 10 &&
              dataArray[i-1] === 13 && dataArray[i] === 10) {
            headerEndIndex = i;
            break;
          }
        }

        if (headerEndIndex > 0) {
          fullHeader = new TextDecoder().decode(dataArray.slice(0, headerEndIndex));
          recipientInfo = fullHeader.split(/\r?\n/).filter(line => line.startsWith('->'));
        } else {
          fullHeader = new TextDecoder().decode(dataArray.slice(0, Math.min(300, dataArray.length)));
          recipientInfo = fullHeader.split(/\r?\n/).filter(line => line.startsWith('->'));
        }
      } catch (e) {
        console.warn('[Age] Could not parse file header:', e);
      }

      // Extract scrypt work factor
      const scryptLine = recipientInfo.find(line => line.includes('scrypt'));
      if (scryptLine) {
        const match = scryptLine.match(/-> scrypt\s+\S+\s+(\d+)/);
        if (match) {
          workFactor = parseInt(match[1], 10);
        }
      }

      // Log work factor for debugging
      if (workFactor !== null) {
        console.log(`[Age] File uses work factor ${workFactor} (limit: 18)`);
      }

      // Check if work factor exceeds rage-wasm's limit
      // rage-wasm uses work factor 18 for encryption (same as age CLI default)
      // Testing shows work factor 20+ causes WASM to panic with "unreachable" error
      // So the browser limit appears to be work factor 18-19
      if (workFactor !== null && workFactor > 18) {
        const memoryMultiplier = Math.pow(2, workFactor - 18);
        throw new Error(
          `This file uses scrypt work factor ${workFactor} but this app supports up to work factor 18. ` +
          `Work factor ${workFactor} would require ${memoryMultiplier}x more memory than the browser can provide. ` +
          `\n\nTo decrypt this file:\n` +
          `1. Use the age CLI: age -d file.age > output.txt\n` +
          `2. Re-encrypt with work factor ≤18 using: age -p --max-work-factor 18 -o output.age input.txt`
        );
      }

      // Call rage-wasm: decrypt_with_user_passphrase(passphrase, data)
      const decrypted = await this.rage.decrypt_with_user_passphrase(
        password,
        dataArray
      );

      return decrypted;
    } catch (error) {
      // Log decryption errors for debugging
      const errorMsg = typeof error === 'string' ? error : error?.message;
      if (workFactor !== null) {
        console.error(`[Age] Decryption failed for work factor ${workFactor}:`, errorMsg);
      } else {
        console.error('[Age] Decryption failed:', errorMsg);
      }
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

    // Check for work factor limitation (our custom error)
    if (lowerError.includes('work factor') && (lowerError.includes('exceeds') || lowerError.includes('supports up to'))) {
      // Extract work factor from error message if present
      const wfMatch = errorMessage.match(/work factor (\d+)/i);
      const workFactorInfo = wfMatch ? ` (work factor ${wfMatch[1]})` : '';
      return {
        code: 'WORK_FACTOR_TOO_HIGH',
        message: errorMessage,
        userMessage: `❌ This file${workFactorInfo} requires too much memory to decrypt in the browser. Use age CLI to decrypt, or re-encrypt with work factor ≤18.`
      };
    }

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

    // Check for WASM unreachable error (likely work factor issue)
    if (lowerError.includes('unreachable') && error?.stack?.includes('wasm')) {
      return {
        code: 'WASM_PANIC',
        message: errorMessage,
        userMessage: '❌ This file cannot be decrypted in the browser (possibly due to high encryption parameters). Please use the age CLI tool.'
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
