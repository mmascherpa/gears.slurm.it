/**
 * Composable for WebAuthn (biometric) vault unlock
 *
 * Uses the WebAuthn PRF extension: the authenticator derives a secret from
 * a stored random salt, and that secret (available only after successful
 * user verification) wraps the vault master password via HKDF + AES-GCM.
 *
 * Security model: the wrapped master password, credential id, PRF salt, and
 * IV are stored in localStorage, but none of them are sufficient to recover
 * the password. Decryption requires the PRF output, which the authenticator
 * only releases after biometric/PIN verification for the registered
 * credential. Devices whose authenticators do not support the PRF extension
 * cannot use biometric unlock - there is no fallback, because any fallback
 * that stores a recoverable key alongside the ciphertext would be
 * obfuscation rather than encryption.
 *
 * @returns {Object} WebAuthn state and operations
 */
import { ref, computed } from 'vue';

const PRF_STORAGE_KEY = 'slurm-webauthn-prf';

// Legacy keys from the pre-PRF implementation - cleared on removeCredential
const LEGACY_STORAGE_KEYS = {
  local: ['slurm-webauthn-credential'],
  session: [
    'slurm-webauthn-session-key',
    'slurm-webauthn-session-salt',
    'slurm-webauthn-session-iv'
  ]
};

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
   * Whether a PRF credential is registered (reactive)
   */
  const hasCredential = ref(loadRecord() !== null);

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
   * Register a new WebAuthn credential and wrap the master password with a
   * key derived from the authenticator's PRF output.
   *
   * Call this after the user has unlocked the vault with their password.
   *
   * @param {string} masterPassword - The master password to protect
   * @returns {Promise<boolean>} Success
   */
  async function register(masterPassword) {
    if (!masterPassword) {
      error.value = 'Master password is required';
      return false;
    }

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
      const userId = crypto.getRandomValues(new Uint8Array(16));
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const prfSalt = crypto.getRandomValues(new Uint8Array(32));

      const credential = await navigator.credentials.create({
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
          attestation: 'none',
          extensions: {
            prf: { eval: { first: prfSalt } }
          }
        }
      });

      if (!credential) {
        error.value = 'Failed to create credential';
        return false;
      }

      const extensionResults = credential.getClientExtensionResults?.() || {};
      if (!extensionResults.prf?.enabled) {
        error.value = 'Biometric unlock is not supported on this device (authenticator lacks the PRF extension)';
        return false;
      }

      // Some platforms return the PRF output at creation; others require a
      // follow-up assertion (which triggers a second verification prompt)
      let prfOutput = extensionResults.prf.results?.first;
      if (!prfOutput) {
        prfOutput = await evaluatePrf(credential.rawId, prfSalt);
      }
      if (!prfOutput) {
        error.value = 'Could not obtain PRF output from authenticator';
        return false;
      }

      const key = await deriveWrappingKey(prfOutput);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        new TextEncoder().encode(masterPassword)
      );

      saveRecord({
        credentialId: arrayBufferToBase64(credential.rawId),
        prfSalt: arrayBufferToBase64(prfSalt),
        iv: arrayBufferToBase64(iv),
        ciphertext: arrayBufferToBase64(ciphertext)
      });
      hasCredential.value = true;

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
   * Authenticate with WebAuthn and unwrap the master password
   *
   * @returns {Promise<string|null>} The master password if successful, null otherwise
   */
  async function authenticate() {
    const record = loadRecord();

    if (!isSupported.value || !record) {
      error.value = 'WebAuthn not available or no credential stored';
      return null;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const prfSalt = new Uint8Array(base64ToArrayBuffer(record.prfSalt));
      const prfOutput = await evaluatePrf(base64ToArrayBuffer(record.credentialId), prfSalt);

      if (!prfOutput) {
        error.value = 'Authenticator did not return a PRF result';
        return null;
      }

      const key = await deriveWrappingKey(prfOutput);
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(base64ToArrayBuffer(record.iv)) },
        key,
        base64ToArrayBuffer(record.ciphertext)
      );

      return new TextDecoder().decode(decrypted);
    } catch (err) {
      console.error('WebAuthn authentication error:', err);
      if (err.name === 'NotAllowedError') {
        error.value = 'Authentication was cancelled or denied';
      } else if (err.name === 'SecurityError') {
        error.value = 'Security error - HTTPS required';
      } else if (err.name === 'OperationError') {
        error.value = 'Failed to unwrap master password - re-enable biometric unlock';
      } else {
        error.value = err.message || 'Authentication failed';
      }
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Remove the stored credential record (and legacy pre-PRF keys)
   */
  function removeCredential() {
    try {
      localStorage.removeItem(PRF_STORAGE_KEY);
      LEGACY_STORAGE_KEYS.local.forEach(key => localStorage.removeItem(key));
      LEGACY_STORAGE_KEYS.session.forEach(key => sessionStorage.removeItem(key));
    } catch {
      // Ignore
    }
    hasCredential.value = false;
  }

  /**
   * Run a WebAuthn assertion that evaluates the PRF for the given credential
   * @param {ArrayBuffer} credentialId - Raw credential id
   * @param {Uint8Array} prfSalt - PRF evaluation input
   * @returns {Promise<ArrayBuffer|null>} PRF output or null
   */
  async function evaluatePrf(credentialId, prfSalt) {
    const challenge = crypto.getRandomValues(new Uint8Array(32));

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: RP_ID,
        allowCredentials: [{
          type: 'public-key',
          id: credentialId
        }],
        userVerification: 'required',
        timeout: 60000,
        extensions: {
          prf: { eval: { first: prfSalt } }
        }
      }
    });

    if (!assertion) {
      throw new Error('Authentication failed');
    }

    const extensionResults = assertion.getClientExtensionResults?.() || {};
    return extensionResults.prf?.results?.first || null;
  }

  return {
    isSupported,
    hasCredential,
    isLoading,
    error,
    isPlatformAuthenticatorAvailable,
    register,
    authenticate,
    removeCredential
  };
}

// Storage helpers

function loadRecord() {
  try {
    const stored = localStorage.getItem(PRF_STORAGE_KEY);
    if (!stored) return null;

    const record = JSON.parse(stored);
    if (!record.credentialId || !record.prfSalt || !record.iv || !record.ciphertext) {
      return null;
    }
    return record;
  } catch {
    return null;
  }
}

function saveRecord(record) {
  localStorage.setItem(PRF_STORAGE_KEY, JSON.stringify(record));
}

// Crypto helpers

/**
 * Derives the AES-GCM wrapping key from the authenticator's PRF output
 * @param {ArrayBuffer|Uint8Array} prfOutput - 32-byte PRF result
 * @returns {Promise<CryptoKey>}
 */
async function deriveWrappingKey(prfOutput) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    prfOutput,
    'HKDF',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(32),
      info: new TextEncoder().encode('slurm-vault-master-password-wrap')
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function arrayBufferToBase64(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
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
