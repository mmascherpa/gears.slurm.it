/**
 * OpenPGP Encryption Provider for Web Worker context
 * Uses OpenPGP.js (openpgp npm package, maintained by Proton) for
 * password-based symmetric encryption
 *
 * ES Module version for Vite bundling
 *
 * File Format: Standard OpenPGP message format (.gpg files),
 * v4 SKESK + SEIPDv1 (AES-256 CFB with MDC integrity protection).
 * Compatible with GnuPG: decrypt with `gpg -d file.gpg`, and reads
 * `gpg -c` output (CFB+MDC variant; GnuPG's proprietary OCB mode is
 * not part of the OpenPGP standard and cannot be read in the browser)
 */

export class OpenPgpWorkerProvider {
  constructor(openpgp) {
    this.openpgp = openpgp;
    if (this.openpgp) {
      // Pin gpg-compatible output regardless of library defaults:
      // SEIPDv1 (CFB+MDC) is readable by GnuPG 1.4/2.2/2.4+, while
      // RFC 9580 SEIPDv2/AEAD output would not be
      this.openpgp.config.aeadProtect = false;
    }
  }

  /**
   * Encrypts data using OpenPGP password-based encryption
   * @param {Uint8Array|Blob} data - Data to encrypt
   * @param {string} password - Encryption password
   * @returns {Promise<Uint8Array>} Encrypted data (binary OpenPGP message)
   */
  async encrypt(data, password) {
    if (!this.openpgp) {
      throw new Error('openpgp library not loaded');
    }

    try {
      // Validate password
      const validation = this.validatePassword(password);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Convert Blob to Uint8Array if needed
      const dataArray = await this._ensureUint8Array(data);

      // No filename/date metadata is embedded in the literal packet
      const message = await this.openpgp.createMessage({ binary: dataArray });
      const encrypted = await this.openpgp.encrypt({
        message,
        passwords: [password],
        format: 'binary'
      });

      return encrypted;
    } catch (error) {
      throw this._enhanceError(error, 'encrypt');
    }
  }

  /**
   * Decrypts an OpenPGP message using password-based decryption
   * Accepts both binary (.gpg/.pgp) and ASCII-armored (.asc) input
   * @param {Uint8Array|Blob} data - Encrypted data
   * @param {string} password - Decryption password
   * @returns {Promise<Uint8Array>} Decrypted data
   */
  async decrypt(data, password) {
    if (!this.openpgp) {
      throw new Error('openpgp library not loaded');
    }

    try {
      // Convert Blob to Uint8Array if needed
      const dataArray = await this._ensureUint8Array(data);

      // ASCII-armored messages (`gpg -ca` output) start with an armor header
      let message;
      if (this._looksArmored(dataArray)) {
        const armoredMessage = new TextDecoder().decode(dataArray);
        message = await this.openpgp.readMessage({ armoredMessage });
      } else {
        message = await this.openpgp.readMessage({ binaryMessage: dataArray });
      }

      const { data: decrypted } = await this.openpgp.decrypt({
        message,
        passwords: [password],
        format: 'binary'
      });

      return decrypted;
    } catch (error) {
      const errorMsg = typeof error === 'string' ? error : error?.message;
      console.error('[OpenPGP] Decryption failed:', errorMsg);
      throw this._enhanceError(error, 'decrypt');
    }
  }

  /**
   * Gets provider information
   * @returns {Object} Provider metadata
   */
  getInfo() {
    return {
      name: 'OpenPGP',
      version: '1.0.0',
      maxPasswordLength: null, // No password length limit
      fileExtension: '.gpg',
      description: 'OpenPGP password-based encryption compatible with GnuPG (gpg -c / gpg -d)'
    };
  }

  /**
   * Normalizes OpenPGP.js errors to standard format
   * @param {Error|string} error - Raw error from OpenPGP.js
   * @returns {Object} Normalized error object
   */
  normalizeError(error) {
    const errorMessage = typeof error === 'string' ? error : (error?.message || 'Unknown error');
    const lowerError = errorMessage.toLowerCase();

    if (lowerError.includes('session key decryption failed') ||
        lowerError.includes('wrong password') ||
        lowerError.includes('incorrect passphrase')) {
      return {
        code: 'WRONG_PASSWORD',
        message: errorMessage,
        userMessage: '❌ Incorrect password. Please check your password and try again.'
      };
    }

    // MDC failure: OpenPGP cannot distinguish a wrong password from tampering
    if (lowerError.includes('modification detected')) {
      return {
        code: 'CORRUPTED_DATA',
        message: errorMessage,
        userMessage: '❌ Decryption failed: wrong password or the file has been corrupted/tampered with.'
      };
    }

    // GnuPG 2.3+ can emit its proprietary OCB packet for `gpg -c`,
    // which the OpenPGP standard (and this app) does not support
    if (lowerError.includes('no encrypted data found') ||
        (lowerError.includes('unsupported') && lowerError.includes('packet'))) {
      return {
        code: 'UNSUPPORTED_AEAD',
        message: errorMessage,
        userMessage: '❌ This file may use GnuPG\'s OCB encryption mode, which browsers cannot read. Re-encrypt it with: gpg --rfc4880 -c yourfile'
      };
    }

    if (lowerError.includes('misformed armored text') ||
        lowerError.includes('armor integrity check')) {
      return {
        code: 'INVALID_FORMAT',
        message: errorMessage,
        userMessage: '❌ The ASCII-armored PGP message is malformed or truncated'
      };
    }

    if (lowerError.includes('does not conform to a valid openpgp format') ||
        lowerError.includes('error during parsing') ||
        lowerError.includes('packet not allowed in this context') ||
        lowerError.includes('invalid') ||
        lowerError.includes('malformed')) {
      return {
        code: 'INVALID_FORMAT',
        message: errorMessage,
        userMessage: '❌ This file is not a valid OpenPGP (.gpg) encrypted file'
      };
    }

    if (lowerError.includes('corrupted') || lowerError.includes('tampered')) {
      return {
        code: 'CORRUPTED_DATA',
        message: errorMessage,
        userMessage: '❌ File appears to be corrupted or tampered with'
      };
    }

    if (lowerError.includes('password is required') ||
        lowerError.includes('password cannot be empty')) {
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
   * Detects ASCII-armored PGP input ("-----BEGIN PGP MESSAGE-----")
   * @param {Uint8Array} dataArray - Input data
   * @returns {boolean} True if the data looks ASCII-armored
   * @private
   */
  _looksArmored(dataArray) {
    const head = new TextDecoder('utf-8', { fatal: false })
      .decode(dataArray.slice(0, 64))
      .trimStart();
    return head.startsWith('-----BEGIN PGP');
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
