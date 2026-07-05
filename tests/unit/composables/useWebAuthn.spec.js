/**
 * Tests for useWebAuthn composable (PRF-based biometric unlock)
 *
 * Uses real WebCrypto (HKDF + AES-GCM) so register/authenticate round-trips
 * exercise the actual key derivation and wrapping, with only the WebAuthn
 * credential API mocked.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useWebAuthn } from '@/composables/useWebAuthn';

const PRF_STORAGE_KEY = 'slurm-webauthn-prf';

/**
 * Simulates an authenticator PRF: deterministic 32-byte output per salt,
 * so create/get assertions agree like a real authenticator would.
 */
async function fakePrfOutput(salt) {
  const digest = await crypto.subtle.digest('SHA-256', new Uint8Array(salt));
  return digest;
}

function mockCredential(rawId, prfResult, { enabled = true } = {}) {
  return {
    rawId,
    getClientExtensionResults: () => ({
      prf: {
        enabled,
        ...(prfResult ? { results: { first: prfResult } } : {})
      }
    })
  };
}

function mockAssertionFor(rawId) {
  return async (options) => {
    const salt = options.publicKey.extensions.prf.eval.first;
    const output = await fakePrfOutput(salt);
    return {
      rawId,
      getClientExtensionResults: () => ({
        prf: { results: { first: output } }
      })
    };
  };
}

describe('useWebAuthn', () => {
  let mockCredentialsCreate;
  let mockCredentialsGet;
  let mockIsUserVerifyingPlatformAuthenticatorAvailable;
  const rawId = new Uint8Array([1, 2, 3, 4]).buffer;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();

    mockCredentialsCreate = vi.fn();
    mockCredentialsGet = vi.fn();
    mockIsUserVerifyingPlatformAuthenticatorAvailable = vi.fn().mockResolvedValue(true);

    Object.defineProperty(navigator, 'credentials', {
      value: {
        create: mockCredentialsCreate,
        get: mockCredentialsGet
      },
      writable: true,
      configurable: true
    });

    Object.defineProperty(window, 'PublicKeyCredential', {
      value: {
        isUserVerifyingPlatformAuthenticatorAvailable: mockIsUserVerifyingPlatformAuthenticatorAvailable
      },
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('isSupported', () => {
    it('returns true when WebAuthn is available', () => {
      const { isSupported } = useWebAuthn();
      expect(isSupported.value).toBe(true);
    });

    it('returns false when PublicKeyCredential is undefined', () => {
      delete global.window.PublicKeyCredential;

      const { isSupported } = useWebAuthn();
      expect(isSupported.value).toBe(false);
    });
  });

  describe('isPlatformAuthenticatorAvailable', () => {
    it('returns true when platform authenticator is available', async () => {
      const { isPlatformAuthenticatorAvailable } = useWebAuthn();

      expect(await isPlatformAuthenticatorAvailable()).toBe(true);
      expect(mockIsUserVerifyingPlatformAuthenticatorAvailable).toHaveBeenCalled();
    });

    it('returns false when check throws error', async () => {
      mockIsUserVerifyingPlatformAuthenticatorAvailable.mockRejectedValue(new Error('Not supported'));

      const { isPlatformAuthenticatorAvailable } = useWebAuthn();

      expect(await isPlatformAuthenticatorAvailable()).toBe(false);
    });

    it('returns false when WebAuthn is not supported', async () => {
      delete global.window.PublicKeyCredential;

      const { isPlatformAuthenticatorAvailable } = useWebAuthn();

      expect(await isPlatformAuthenticatorAvailable()).toBe(false);
    });
  });

  describe('hasCredential', () => {
    it('is false when no credential stored', () => {
      const { hasCredential } = useWebAuthn();
      expect(hasCredential.value).toBe(false);
    });

    it('is true when a complete PRF record exists', () => {
      localStorage.setItem(PRF_STORAGE_KEY, JSON.stringify({
        credentialId: 'aWQ=', prfSalt: 'c2FsdA==', iv: 'aXY=', ciphertext: 'Y3Q='
      }));

      const { hasCredential } = useWebAuthn();
      expect(hasCredential.value).toBe(true);
    });

    it('is false when the stored record is incomplete', () => {
      localStorage.setItem(PRF_STORAGE_KEY, JSON.stringify({ credentialId: 'aWQ=' }));

      const { hasCredential } = useWebAuthn();
      expect(hasCredential.value).toBe(false);
    });
  });

  describe('register', () => {
    it('returns false when WebAuthn is not supported', async () => {
      delete global.window.PublicKeyCredential;

      const { register, error } = useWebAuthn();

      expect(await register('masterpassword')).toBe(false);
      expect(error.value).toBe('WebAuthn is not supported in this browser');
    });

    it('returns false when no platform authenticator available', async () => {
      mockIsUserVerifyingPlatformAuthenticatorAvailable.mockResolvedValue(false);

      const { register, error } = useWebAuthn();

      expect(await register('masterpassword')).toBe(false);
      expect(error.value).toBe('No biometric authenticator available');
    });

    it('returns false without a master password', async () => {
      const { register, error } = useWebAuthn();

      expect(await register('')).toBe(false);
      expect(error.value).toBe('Master password is required');
    });

    it('requests the PRF extension during credential creation', async () => {
      mockCredentialsCreate.mockImplementation(async (options) => {
        const salt = options.publicKey.extensions.prf.eval.first;
        return mockCredential(rawId, await fakePrfOutput(salt));
      });

      const { register } = useWebAuthn();
      await register('masterpassword');

      const createOptions = mockCredentialsCreate.mock.calls[0][0];
      expect(createOptions.publicKey.extensions.prf.eval.first).toBeInstanceOf(Uint8Array);
    });

    it('stores a wrapped record when PRF output is returned at creation', async () => {
      mockCredentialsCreate.mockImplementation(async (options) => {
        const salt = options.publicKey.extensions.prf.eval.first;
        return mockCredential(rawId, await fakePrfOutput(salt));
      });

      const { register, hasCredential } = useWebAuthn();

      expect(await register('masterpassword')).toBe(true);
      expect(hasCredential.value).toBe(true);

      const record = JSON.parse(localStorage.getItem(PRF_STORAGE_KEY));
      expect(record.credentialId).toBeTruthy();
      expect(record.prfSalt).toBeTruthy();
      expect(record.iv).toBeTruthy();
      expect(record.ciphertext).toBeTruthy();
      // The record must not contain the master password in any recoverable form
      expect(JSON.stringify(record)).not.toContain('masterpassword');
    });

    it('falls back to an assertion when creation returns no PRF output', async () => {
      mockCredentialsCreate.mockResolvedValue(mockCredential(rawId, null));
      mockCredentialsGet.mockImplementation(mockAssertionFor(rawId));

      const { register } = useWebAuthn();

      expect(await register('masterpassword')).toBe(true);
      expect(mockCredentialsGet).toHaveBeenCalled();
    });

    it('refuses to register when the authenticator lacks PRF support', async () => {
      mockCredentialsCreate.mockResolvedValue(mockCredential(rawId, null, { enabled: false }));

      const { register, error, hasCredential } = useWebAuthn();

      expect(await register('masterpassword')).toBe(false);
      expect(error.value).toContain('PRF');
      expect(hasCredential.value).toBe(false);
      expect(localStorage.getItem(PRF_STORAGE_KEY)).toBeNull();
    });

    it('returns false when credential creation fails', async () => {
      mockCredentialsCreate.mockResolvedValue(null);

      const { register, error } = useWebAuthn();

      expect(await register('masterpassword')).toBe(false);
      expect(error.value).toBe('Failed to create credential');
    });

    it('handles NotAllowedError', async () => {
      const err = new Error('Not allowed');
      err.name = 'NotAllowedError';
      mockCredentialsCreate.mockRejectedValue(err);

      const { register, error } = useWebAuthn();

      expect(await register('masterpassword')).toBe(false);
      expect(error.value).toBe('Registration was cancelled or denied');
    });

    it('handles SecurityError', async () => {
      const err = new Error('Security');
      err.name = 'SecurityError';
      mockCredentialsCreate.mockRejectedValue(err);

      const { register, error } = useWebAuthn();

      expect(await register('masterpassword')).toBe(false);
      expect(error.value).toBe('Security error - HTTPS required');
    });
  });

  describe('authenticate', () => {
    it('returns null when no credential stored', async () => {
      const { authenticate, error } = useWebAuthn();

      expect(await authenticate()).toBeNull();
      expect(error.value).toBe('WebAuthn not available or no credential stored');
    });

    it('round-trips the master password through register and authenticate', async () => {
      mockCredentialsCreate.mockImplementation(async (options) => {
        const salt = options.publicKey.extensions.prf.eval.first;
        return mockCredential(rawId, await fakePrfOutput(salt));
      });
      mockCredentialsGet.mockImplementation(mockAssertionFor(rawId));

      const { register, authenticate } = useWebAuthn();

      expect(await register('correct horse battery staple')).toBe(true);
      expect(await authenticate()).toBe('correct horse battery staple');
    });

    it('returns null when the assertion has no PRF result', async () => {
      mockCredentialsCreate.mockImplementation(async (options) => {
        const salt = options.publicKey.extensions.prf.eval.first;
        return mockCredential(rawId, await fakePrfOutput(salt));
      });
      mockCredentialsGet.mockResolvedValue({
        rawId,
        getClientExtensionResults: () => ({})
      });

      const { register, authenticate, error } = useWebAuthn();
      await register('masterpassword');

      expect(await authenticate()).toBeNull();
      expect(error.value).toBe('Authenticator did not return a PRF result');
    });

    it('returns null when the PRF output does not unwrap the password', async () => {
      mockCredentialsCreate.mockImplementation(async (options) => {
        const salt = options.publicKey.extensions.prf.eval.first;
        return mockCredential(rawId, await fakePrfOutput(salt));
      });
      // A different authenticator producing a different PRF output
      mockCredentialsGet.mockResolvedValue({
        rawId,
        getClientExtensionResults: () => ({
          prf: { results: { first: crypto.getRandomValues(new Uint8Array(32)).buffer } }
        })
      });

      const { register, authenticate, error } = useWebAuthn();
      await register('masterpassword');

      expect(await authenticate()).toBeNull();
      expect(error.value).toContain('re-enable biometric unlock');
    });

    it('handles NotAllowedError during authentication', async () => {
      localStorage.setItem(PRF_STORAGE_KEY, JSON.stringify({
        credentialId: 'aWQ=', prfSalt: 'c2FsdA==', iv: 'aXY=', ciphertext: 'Y3Q='
      }));

      const err = new Error('Not allowed');
      err.name = 'NotAllowedError';
      mockCredentialsGet.mockRejectedValue(err);

      const { authenticate, error } = useWebAuthn();

      expect(await authenticate()).toBeNull();
      expect(error.value).toBe('Authentication was cancelled or denied');
    });

    it('returns null when assertion is null', async () => {
      localStorage.setItem(PRF_STORAGE_KEY, JSON.stringify({
        credentialId: 'aWQ=', prfSalt: 'c2FsdA==', iv: 'aXY=', ciphertext: 'Y3Q='
      }));
      mockCredentialsGet.mockResolvedValue(null);

      const { authenticate, error } = useWebAuthn();

      expect(await authenticate()).toBeNull();
      expect(error.value).toBe('Authentication failed');
    });
  });

  describe('removeCredential', () => {
    it('removes the PRF record and updates hasCredential', () => {
      localStorage.setItem(PRF_STORAGE_KEY, JSON.stringify({
        credentialId: 'aWQ=', prfSalt: 'c2FsdA==', iv: 'aXY=', ciphertext: 'Y3Q='
      }));

      const { removeCredential, hasCredential } = useWebAuthn();
      expect(hasCredential.value).toBe(true);

      removeCredential();

      expect(hasCredential.value).toBe(false);
      expect(localStorage.getItem(PRF_STORAGE_KEY)).toBeNull();
    });

    it('clears legacy pre-PRF storage keys', () => {
      localStorage.setItem('slurm-webauthn-credential', 'credential');
      sessionStorage.setItem('slurm-webauthn-session-key', 'key');
      sessionStorage.setItem('slurm-webauthn-session-salt', 'salt');
      sessionStorage.setItem('slurm-webauthn-session-iv', 'iv');

      const { removeCredential } = useWebAuthn();
      removeCredential();

      expect(localStorage.getItem('slurm-webauthn-credential')).toBeNull();
      expect(sessionStorage.getItem('slurm-webauthn-session-key')).toBeNull();
      expect(sessionStorage.getItem('slurm-webauthn-session-salt')).toBeNull();
      expect(sessionStorage.getItem('slurm-webauthn-session-iv')).toBeNull();
    });
  });
});
