/**
 * Tests for useWebAuthn composable
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useWebAuthn } from '@/composables/useWebAuthn';

describe('useWebAuthn', () => {
  let mockCredentialsCreate;
  let mockCredentialsGet;
  let mockIsUserVerifyingPlatformAuthenticatorAvailable;

  beforeEach(() => {
    // Clear storage
    localStorage.clear();
    sessionStorage.clear();

    // Mock WebAuthn API
    mockCredentialsCreate = vi.fn();
    mockCredentialsGet = vi.fn();
    mockIsUserVerifyingPlatformAuthenticatorAvailable = vi.fn().mockResolvedValue(true);

    // Setup global mocks using defineProperty for read-only properties
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

    // Mock crypto.getRandomValues
    vi.spyOn(crypto, 'getRandomValues').mockImplementation((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    });

    // Mock crypto.subtle for encryption
    vi.spyOn(crypto.subtle, 'importKey').mockResolvedValue({ type: 'mock-key' });
    vi.spyOn(crypto.subtle, 'deriveKey').mockResolvedValue({ type: 'mock-derived-key' });
    vi.spyOn(crypto.subtle, 'encrypt').mockResolvedValue(new ArrayBuffer(32));
    vi.spyOn(crypto.subtle, 'decrypt').mockImplementation(async () => {
      const encoder = new TextEncoder();
      return encoder.encode('decrypted-password').buffer;
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

      const result = await isPlatformAuthenticatorAvailable();

      expect(result).toBe(true);
      expect(mockIsUserVerifyingPlatformAuthenticatorAvailable).toHaveBeenCalled();
    });

    it('returns false when check throws error', async () => {
      mockIsUserVerifyingPlatformAuthenticatorAvailable.mockRejectedValue(new Error('Not supported'));

      const { isPlatformAuthenticatorAvailable } = useWebAuthn();

      const result = await isPlatformAuthenticatorAvailable();

      expect(result).toBe(false);
    });

    it('returns false when WebAuthn is not supported', async () => {
      delete global.window.PublicKeyCredential;

      const { isPlatformAuthenticatorAvailable } = useWebAuthn();

      const result = await isPlatformAuthenticatorAvailable();

      expect(result).toBe(false);
    });
  });

  describe('hasCredential', () => {
    it('returns false when no credential stored', () => {
      const { hasCredential } = useWebAuthn();
      expect(hasCredential.value).toBe(false);
    });

    it('returns true when credential exists in localStorage', () => {
      localStorage.setItem('slurm-webauthn-credential', 'some-credential-id');

      const { hasCredential } = useWebAuthn();
      expect(hasCredential.value).toBe(true);
    });
  });

  describe('register', () => {
    it('returns false when WebAuthn is not supported', async () => {
      delete global.window.PublicKeyCredential;

      const { register, error } = useWebAuthn();

      const result = await register('masterpassword');

      expect(result).toBe(false);
      expect(error.value).toBe('WebAuthn is not supported in this browser');
    });

    it('returns false when no platform authenticator available', async () => {
      mockIsUserVerifyingPlatformAuthenticatorAvailable.mockResolvedValue(false);

      const { register, error } = useWebAuthn();

      const result = await register('masterpassword');

      expect(result).toBe(false);
      expect(error.value).toBe('No biometric authenticator available');
    });

    it('stores credential and encrypted session key on success', async () => {
      const mockCredential = {
        rawId: new Uint8Array([1, 2, 3, 4]).buffer,
        response: {
          clientDataJSON: new ArrayBuffer(10),
          attestationObject: new ArrayBuffer(10)
        }
      };
      mockCredentialsCreate.mockResolvedValue(mockCredential);

      const { register, hasCredential } = useWebAuthn();

      const result = await register('masterpassword');

      expect(result).toBe(true);
      expect(localStorage.getItem('slurm-webauthn-credential')).not.toBeNull();
      expect(sessionStorage.getItem('slurm-webauthn-session-key')).not.toBeNull();
      expect(sessionStorage.getItem('slurm-webauthn-session-salt')).not.toBeNull();
      expect(sessionStorage.getItem('slurm-webauthn-session-iv')).not.toBeNull();
    });

    it('returns false when credential creation fails', async () => {
      mockCredentialsCreate.mockResolvedValue(null);

      const { register, error } = useWebAuthn();

      const result = await register('masterpassword');

      expect(result).toBe(false);
      expect(error.value).toBe('Failed to create credential');
    });

    it('handles NotAllowedError', async () => {
      const err = new Error('Not allowed');
      err.name = 'NotAllowedError';
      mockCredentialsCreate.mockRejectedValue(err);

      const { register, error } = useWebAuthn();

      const result = await register('masterpassword');

      expect(result).toBe(false);
      expect(error.value).toBe('Registration was cancelled or denied');
    });

    it('handles SecurityError', async () => {
      const err = new Error('Security');
      err.name = 'SecurityError';
      mockCredentialsCreate.mockRejectedValue(err);

      const { register, error } = useWebAuthn();

      const result = await register('masterpassword');

      expect(result).toBe(false);
      expect(error.value).toBe('Security error - HTTPS required');
    });

    it('exposes isLoading ref for UI state', () => {
      const { isLoading } = useWebAuthn();

      // isLoading is a ref that UI can use to show loading state
      expect(isLoading).toBeDefined();
      expect(isLoading.value).toBe(false);
    });
  });

  describe('authenticate', () => {
    it('returns null when no credential stored', async () => {
      const { authenticate, error } = useWebAuthn();

      const result = await authenticate();

      expect(result).toBeNull();
      expect(error.value).toBe('WebAuthn not available or no credential stored');
    });

    it('returns null when no session key stored', async () => {
      // Credential must be base64 encoded
      localStorage.setItem('slurm-webauthn-credential', btoa('credential-id'));

      const mockAssertion = {
        rawId: new Uint8Array([1, 2, 3, 4]).buffer,
        response: {
          authenticatorData: new ArrayBuffer(10),
          signature: new ArrayBuffer(10)
        }
      };
      mockCredentialsGet.mockResolvedValue(mockAssertion);

      const { authenticate, error } = useWebAuthn();

      const result = await authenticate();

      expect(result).toBeNull();
      expect(error.value).toBe('Session expired - please enter password');
    });

    it('returns decrypted password on successful authentication', async () => {
      // Set up stored credential and session with proper base64 encoding
      localStorage.setItem('slurm-webauthn-credential', btoa('credential-id'));
      // The session key needs to be valid base64 that can be decoded
      sessionStorage.setItem('slurm-webauthn-session-key', btoa('encrypted-session-key'));
      sessionStorage.setItem('slurm-webauthn-session-salt', btoa(String.fromCharCode(...new Uint8Array(16))));
      sessionStorage.setItem('slurm-webauthn-session-iv', btoa(String.fromCharCode(...new Uint8Array(12))));

      const mockAssertion = {
        rawId: new Uint8Array([1, 2, 3, 4]).buffer,
        response: {
          authenticatorData: new ArrayBuffer(10),
          signature: new ArrayBuffer(10)
        }
      };
      mockCredentialsGet.mockResolvedValue(mockAssertion);

      const { authenticate } = useWebAuthn();

      const result = await authenticate();

      // With mocked crypto.subtle.decrypt returning 'decrypted-password'
      expect(result).toBe('decrypted-password');
    });

    it('handles NotAllowedError during authentication', async () => {
      localStorage.setItem('slurm-webauthn-credential', btoa('credential-id'));

      const err = new Error('Not allowed');
      err.name = 'NotAllowedError';
      mockCredentialsGet.mockRejectedValue(err);

      const { authenticate, error } = useWebAuthn();

      const result = await authenticate();

      expect(result).toBeNull();
      expect(error.value).toBe('Authentication was cancelled or denied');
    });

    it('returns null when assertion is null', async () => {
      localStorage.setItem('slurm-webauthn-credential', btoa('credential-id'));
      mockCredentialsGet.mockResolvedValue(null);

      const { authenticate, error } = useWebAuthn();

      const result = await authenticate();

      expect(result).toBeNull();
      expect(error.value).toBe('Authentication failed');
    });
  });

  describe('removeCredential', () => {
    it('removes credential from localStorage', () => {
      localStorage.setItem('slurm-webauthn-credential', 'credential');

      const { removeCredential, hasCredential } = useWebAuthn();

      expect(hasCredential.value).toBe(true);

      removeCredential();

      expect(localStorage.getItem('slurm-webauthn-credential')).toBeNull();
    });

    it('removes session keys from sessionStorage', () => {
      sessionStorage.setItem('slurm-webauthn-session-key', 'key');
      sessionStorage.setItem('slurm-webauthn-session-salt', 'salt');
      sessionStorage.setItem('slurm-webauthn-session-iv', 'iv');

      const { removeCredential } = useWebAuthn();

      removeCredential();

      expect(sessionStorage.getItem('slurm-webauthn-session-key')).toBeNull();
      expect(sessionStorage.getItem('slurm-webauthn-session-salt')).toBeNull();
      expect(sessionStorage.getItem('slurm-webauthn-session-iv')).toBeNull();
    });
  });

  describe('storeSessionKey', () => {
    it('stores encrypted session key in sessionStorage', async () => {
      const { storeSessionKey } = useWebAuthn();

      await storeSessionKey('masterpassword');

      expect(sessionStorage.getItem('slurm-webauthn-session-key')).not.toBeNull();
      expect(sessionStorage.getItem('slurm-webauthn-session-salt')).not.toBeNull();
      expect(sessionStorage.getItem('slurm-webauthn-session-iv')).not.toBeNull();
    });
  });

  describe('clearSessionKey', () => {
    it('removes session keys from sessionStorage', () => {
      sessionStorage.setItem('slurm-webauthn-session-key', 'key');
      sessionStorage.setItem('slurm-webauthn-session-salt', 'salt');
      sessionStorage.setItem('slurm-webauthn-session-iv', 'iv');

      const { clearSessionKey } = useWebAuthn();

      clearSessionKey();

      expect(sessionStorage.getItem('slurm-webauthn-session-key')).toBeNull();
      expect(sessionStorage.getItem('slurm-webauthn-session-salt')).toBeNull();
      expect(sessionStorage.getItem('slurm-webauthn-session-iv')).toBeNull();
    });
  });
});
