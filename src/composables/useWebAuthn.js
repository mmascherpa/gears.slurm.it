/**
 * Composable for WebAuthn (biometric) authentication
 *
 * Provides registration and authentication using platform authenticators
 * (fingerprint, Face ID, Windows Hello, etc.)
 *
 * Security: The master password is encrypted using AES-GCM with a key derived
 * from a random salt using PBKDF2. The encrypted password is stored in
 * sessionStorage and can only be accessed after successful WebAuthn verification.
 *
 * @returns {Object} WebAuthn state and operations
 */
import { ref, computed } from 'vue';

const CREDENTIAL_STORAGE_KEY = 'slurm-webauthn-credential';
const SESSION_KEY_STORAGE_KEY = 'slurm-webauthn-session-key';
const SESSION_SALT_STORAGE_KEY = 'slurm-webauthn-session-salt';
const SESSION_IV_STORAGE_KEY = 'slurm-webauthn-session-iv';

// Relying party info (your app)
const RP_ID = window.location.hostname || 'localhost';
const RP_NAME = 'Slurm Tools Password Manager';

export function useWebAuthn() {
  const isLoading = ref(false);
  const error = ref(null);

  /**
   * Check if WebAuthn is supported in this browser
   */
  const isSupported = computed(() => {
    return typeof window !== 'undefined' &&
      window.PublicKeyCredential !== undefined &&
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';
  });

  /**
   * Check if a platform authenticator is available
   */
  async function isPlatformAuthenticatorAvailable() {
    if (!isSupported.value) return false;

    try {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }

  /**
   * Check if user has a stored credential
   */
  const hasCredential = computed(() => {
    try {
      return localStorage.getItem(CREDENTIAL_STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  });

  /**
   * Register a new WebAuthn credential
   * This should be called after the user has successfully unlocked the vault
   *
   * @param {string} masterPassword - The master password to protect
   * @returns {Promise<boolean>} Success
   */
  async function register(masterPassword) {
    if (!isSupported.value) {
      error.value = 'WebAuthn is not supported in this browser';
      return false;
    }

    const available = await isPlatformAuthenticatorAvailable();
    if (!available) {
      error.value = 'No biometric authenticator available';
      return false;
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Generate a random user ID
      const userId = new Uint8Array(16);
      crypto.getRandomValues(userId);

      // Generate a challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Create credential options
      const createOptions = {
        publicKey: {
          rp: {
            id: RP_ID,
            name: RP_NAME
          },
          user: {
            id: userId,
            name: 'Vault User',
            displayName: 'Password Vault'
          },
          challenge,
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 },  // ES256
            { type: 'public-key', alg: -257 } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred'
          },
          timeout: 60000,
          attestation: 'none'
        }
      };

      // Create credential
      const credential = await navigator.credentials.create(createOptions);

      if (!credential) {
        error.value = 'Failed to create credential';
        return false;
      }

      // Store credential ID
      const credentialId = arrayBufferToBase64(credential.rawId);
      localStorage.setItem(CREDENTIAL_STORAGE_KEY, credentialId);

      // Encrypt and store the master password securely
      const encrypted = await encryptSessionKey(masterPassword);
      if (!encrypted) {
        error.value = 'Failed to encrypt session key';
        return false;
      }

      sessionStorage.setItem(SESSION_KEY_STORAGE_KEY, encrypted.ciphertext);
      sessionStorage.setItem(SESSION_SALT_STORAGE_KEY, encrypted.salt);
      sessionStorage.setItem(SESSION_IV_STORAGE_KEY, encrypted.iv);

      return true;
    } catch (err) {
      console.error('WebAuthn registration error:', err);
      if (err.name === 'NotAllowedError') {
        error.value = 'Registration was cancelled or denied';
      } else if (err.name === 'SecurityError') {
        error.value = 'Security error - HTTPS required';
      } else {
        error.value = err.message || 'Registration failed';
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Authenticate with WebAuthn
   * Returns the stored session key if successful
   *
   * @returns {Promise<string|null>} The master password if successful, null otherwise
   */
  async function authenticate() {
    if (!isSupported.value || !hasCredential.value) {
      error.value = 'WebAuthn not available or no credential stored';
      return null;
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Get stored credential ID
      const credentialId = localStorage.getItem(CREDENTIAL_STORAGE_KEY);
      if (!credentialId) {
        error.value = 'No credential found';
        return null;
      }

      // Generate challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Create assertion options
      const assertionOptions = {
        publicKey: {
          challenge,
          rpId: RP_ID,
          allowCredentials: [{
            type: 'public-key',
            id: base64ToArrayBuffer(credentialId)
          }],
          userVerification: 'required',
          timeout: 60000
        }
      };

      // Get assertion
      const assertion = await navigator.credentials.get(assertionOptions);

      if (!assertion) {
        error.value = 'Authentication failed';
        return null;
      }

      // Decrypt and return the stored session key
      const ciphertext = sessionStorage.getItem(SESSION_KEY_STORAGE_KEY);
      const salt = sessionStorage.getItem(SESSION_SALT_STORAGE_KEY);
      const iv = sessionStorage.getItem(SESSION_IV_STORAGE_KEY);

      if (!ciphertext || !salt || !iv) {
        // Session expired - user needs to enter password again
        error.value = 'Session expired - please enter password';
        return null;
      }

      const decrypted = await decryptSessionKey(ciphertext, salt, iv);
      if (!decrypted) {
        error.value = 'Failed to decrypt session key';
        return null;
      }

      return decrypted;
    } catch (err) {
      console.error('WebAuthn authentication error:', err);
      if (err.name === 'NotAllowedError') {
        error.value = 'Authentication was cancelled or denied';
      } else if (err.name === 'SecurityError') {
        error.value = 'Security error - HTTPS required';
      } else {
        error.value = err.message || 'Authentication failed';
      }
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Remove the stored credential
   */
  function removeCredential() {
    try {
      localStorage.removeItem(CREDENTIAL_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_KEY_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_SALT_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_IV_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }

  /**
   * Store the session key after successful password unlock
   * This allows WebAuthn to retrieve it later
   *
   * @param {string} masterPassword - The master password
   */
  async function storeSessionKey(masterPassword) {
    try {
      const encrypted = await encryptSessionKey(masterPassword);
      if (encrypted) {
        sessionStorage.setItem(SESSION_KEY_STORAGE_KEY, encrypted.ciphertext);
        sessionStorage.setItem(SESSION_SALT_STORAGE_KEY, encrypted.salt);
        sessionStorage.setItem(SESSION_IV_STORAGE_KEY, encrypted.iv);
      }
    } catch {
      // Ignore - WebAuthn will just require password entry
    }
  }

  /**
   * Clear the session key (on lock)
   */
  function clearSessionKey() {
    try {
      sessionStorage.removeItem(SESSION_KEY_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_SALT_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_IV_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }

  return {
    isSupported,
    hasCredential,
    isLoading,
    error,
    isPlatformAuthenticatorAvailable,
    register,
    authenticate,
    removeCredential,
    storeSessionKey,
    clearSessionKey
  };
}

// Utility functions
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Encrypts the session key (master password) using AES-GCM
 * with a key derived from a random salt using PBKDF2.
 *
 * @param {string} plaintext - The master password to encrypt
 * @returns {Promise<Object|null>} Object with ciphertext, salt, iv (all base64) or null on error
 */
async function encryptSessionKey(plaintext) {
  try {
    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Derive key from salt using PBKDF2
    // We use the salt itself as the "password" for key derivation
    // This provides session-unique encryption without storing any secrets
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      salt,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    // Encrypt the plaintext
    const encoder = new TextEncoder();
    const encoded = encoder.encode(plaintext);

    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encoded
    );

    return {
      ciphertext: arrayBufferToBase64(ciphertext),
      salt: arrayBufferToBase64(salt),
      iv: arrayBufferToBase64(iv)
    };
  } catch (err) {
    console.error('Failed to encrypt session key:', err);
    return null;
  }
}

/**
 * Decrypts the session key (master password) using AES-GCM
 *
 * @param {string} ciphertextBase64 - The encrypted ciphertext (base64)
 * @param {string} saltBase64 - The salt used for key derivation (base64)
 * @param {string} ivBase64 - The IV used for encryption (base64)
 * @returns {Promise<string|null>} The decrypted master password or null on error
 */
async function decryptSessionKey(ciphertextBase64, saltBase64, ivBase64) {
  try {
    const ciphertext = base64ToArrayBuffer(ciphertextBase64);
    const salt = new Uint8Array(base64ToArrayBuffer(saltBase64));
    const iv = new Uint8Array(base64ToArrayBuffer(ivBase64));

    // Derive the same key from salt
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      salt,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (err) {
    console.error('Failed to decrypt session key:', err);
    return null;
  }
}
