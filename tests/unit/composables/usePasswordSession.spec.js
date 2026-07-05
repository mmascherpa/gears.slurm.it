import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { usePasswordSession, clearAllSessionPasswords } from '@/composables/usePasswordSession';

describe('usePasswordSession', () => {
  beforeEach(() => {
    clearAllSessionPasswords();
    sessionStorage.clear();
  });

  afterEach(() => {
    clearAllSessionPasswords();
    sessionStorage.clear();
  });

  describe('initialization', () => {
    it('initializes with default context (encrypt)', () => {
      const { rememberPassword, isPasswordRemembered } = usePasswordSession();

      expect(rememberPassword.value).toBe(false);
      expect(isPasswordRemembered.value).toBe(false);
    });

    it('accepts custom context parameter', () => {
      const { saveSessionPassword, getSessionPassword, rememberPassword } = usePasswordSession('decrypt');

      rememberPassword.value = true; // Must set this to true for password to be saved
      saveSessionPassword('test-password');
      expect(getSessionPassword()).toBe('test-password');
    });
  });

  describe('security: no browser storage', () => {
    it('never writes the password to sessionStorage or localStorage', () => {
      const { saveSessionPassword, rememberPassword } = usePasswordSession();

      rememberPassword.value = true;
      saveSessionPassword('super-secret-password');

      const storageDump = [
        ...Object.keys(sessionStorage).map(k => `${k}=${sessionStorage.getItem(k)}`),
        ...Object.keys(localStorage).map(k => `${k}=${localStorage.getItem(k)}`)
      ].join('|');

      expect(storageDump).not.toContain('super-secret-password');
    });
  });

  describe('saveSessionPassword', () => {
    it('saves password when rememberPassword is true', () => {
      const { saveSessionPassword, getSessionPassword, rememberPassword, isPasswordRemembered } = usePasswordSession();

      rememberPassword.value = true;
      saveSessionPassword('my-password');

      expect(getSessionPassword()).toBe('my-password');
      expect(isPasswordRemembered.value).toBe(true);
    });

    it('does not save password when rememberPassword is false', () => {
      const { saveSessionPassword, getSessionPassword, rememberPassword } = usePasswordSession();

      rememberPassword.value = false;
      saveSessionPassword('my-password');

      expect(getSessionPassword()).toBeNull();
    });

    it('clears password when rememberPassword is false', () => {
      const { saveSessionPassword, getSessionPassword, rememberPassword } = usePasswordSession();

      // First save a password
      rememberPassword.value = true;
      saveSessionPassword('my-password');
      expect(getSessionPassword()).toBe('my-password');

      // Then uncheck remember and try to save
      rememberPassword.value = false;
      saveSessionPassword('different-password');
      expect(getSessionPassword()).toBeNull();
    });

    it('does not save empty password', () => {
      const { saveSessionPassword, getSessionPassword, rememberPassword } = usePasswordSession();

      rememberPassword.value = true;
      saveSessionPassword('');

      expect(getSessionPassword()).toBeNull();
    });
  });

  describe('getSessionPassword', () => {
    it('retrieves saved password', () => {
      const { saveSessionPassword, getSessionPassword, rememberPassword } = usePasswordSession();

      rememberPassword.value = true;
      saveSessionPassword('test-password');

      expect(getSessionPassword()).toBe('test-password');
    });

    it('returns null when no password is saved', () => {
      const { getSessionPassword } = usePasswordSession();

      expect(getSessionPassword()).toBeNull();
    });
  });

  describe('clearSessionPassword', () => {
    it('removes the stored password', () => {
      const { saveSessionPassword, getSessionPassword, clearSessionPassword, rememberPassword } = usePasswordSession();

      rememberPassword.value = true;
      saveSessionPassword('my-password');
      expect(getSessionPassword()).toBe('my-password');

      clearSessionPassword();
      expect(getSessionPassword()).toBeNull();
    });

    it('resets isPasswordRemembered state', () => {
      const { saveSessionPassword, clearSessionPassword, rememberPassword, isPasswordRemembered } = usePasswordSession();

      rememberPassword.value = true;
      saveSessionPassword('my-password');
      expect(isPasswordRemembered.value).toBe(true);

      clearSessionPassword();
      expect(isPasswordRemembered.value).toBe(false);
    });

    it('resets rememberPassword state', () => {
      const { saveSessionPassword, clearSessionPassword, rememberPassword } = usePasswordSession();

      rememberPassword.value = true;
      saveSessionPassword('my-password');
      expect(rememberPassword.value).toBe(true);

      clearSessionPassword();
      expect(rememberPassword.value).toBe(false);
    });
  });

  describe('autoLoadPassword', () => {
    it('loads an existing password saved by another instance', () => {
      const first = usePasswordSession();
      first.rememberPassword.value = true;
      first.saveSessionPassword('stored-password');

      const second = usePasswordSession();
      const loaded = second.autoLoadPassword();

      expect(loaded).toBe('stored-password');
      expect(second.rememberPassword.value).toBe(true);
    });

    it('returns empty string when no password exists', () => {
      const { autoLoadPassword } = usePasswordSession();

      expect(autoLoadPassword()).toBe('');
    });

    it('updates isPasswordRemembered state', () => {
      const first = usePasswordSession();
      first.rememberPassword.value = true;
      first.saveSessionPassword('stored-password');

      const second = usePasswordSession();
      second.autoLoadPassword();

      expect(second.isPasswordRemembered.value).toBe(true);
    });
  });

  describe('rememberPassword watcher', () => {
    // Note: Vue watchers created in composables outside of component context
    // don't trigger reliably in vitest. The watcher behavior is tested implicitly
    // through clearSessionPassword tests and verified in actual component usage.

    it('does not save password automatically when checked (requires explicit save)', async () => {
      const { rememberPassword, getSessionPassword } = usePasswordSession();

      rememberPassword.value = true;

      await new Promise(resolve => setTimeout(resolve, 0));

      // Password should not be saved just by checking the box
      expect(getSessionPassword()).toBeNull();
    });
  });

  describe('context isolation', () => {
    it('encrypt and decrypt contexts store passwords independently', () => {
      const encryptSession = usePasswordSession('encrypt');
      const decryptSession = usePasswordSession('decrypt');

      encryptSession.rememberPassword.value = true;
      decryptSession.rememberPassword.value = true;

      encryptSession.saveSessionPassword('encrypt-pass');
      decryptSession.saveSessionPassword('decrypt-pass');

      expect(encryptSession.getSessionPassword()).toBe('encrypt-pass');
      expect(decryptSession.getSessionPassword()).toBe('decrypt-pass');
    });

    it('clearing one context does not affect the other', () => {
      const encryptSession = usePasswordSession('encrypt');
      const decryptSession = usePasswordSession('decrypt');

      encryptSession.rememberPassword.value = true;
      decryptSession.rememberPassword.value = true;

      encryptSession.saveSessionPassword('encrypt-pass');
      decryptSession.saveSessionPassword('decrypt-pass');

      encryptSession.clearSessionPassword();

      expect(encryptSession.getSessionPassword()).toBeNull();
      expect(decryptSession.getSessionPassword()).toBe('decrypt-pass');
    });
  });

  describe('clearAllSessionPasswords', () => {
    it('clears every context at once', () => {
      const encryptSession = usePasswordSession('encrypt');
      const decryptSession = usePasswordSession('decrypt');

      encryptSession.rememberPassword.value = true;
      decryptSession.rememberPassword.value = true;
      encryptSession.saveSessionPassword('encrypt-pass');
      decryptSession.saveSessionPassword('decrypt-pass');

      clearAllSessionPasswords();

      expect(encryptSession.getSessionPassword()).toBeNull();
      expect(decryptSession.getSessionPassword()).toBeNull();
    });
  });
});
