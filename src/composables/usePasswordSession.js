import { ref, watch, onBeforeUnmount } from 'vue';

/**
 * Composable for managing password session storage
 *
 * Provides session-based password memory for AES encryption/decryption operations.
 * Passwords are stored in sessionStorage (memory-only, auto-clears on tab close).
 *
 * @param {string} context - Context for storage key ('encrypt' or 'decrypt')
 * @returns {Object} Password session management functions and state
 *
 * @example
 * const {
 *   rememberPassword,
 *   isPasswordRemembered,
 *   saveSessionPassword,
 *   clearSessionPassword,
 *   autoLoadPassword
 * } = usePasswordSession('encrypt');
 */
export function usePasswordSession(context = 'encrypt') {
  // Storage key for this context (encrypt or decrypt)
  const STORAGE_KEY = `slurm_aes_${context}_session_password`;

  // Reactive state
  const rememberPassword = ref(false);
  const isPasswordRemembered = ref(false);

  /**
   * Check if a password exists in sessionStorage
   * Updates isPasswordRemembered state
   *
   * @returns {string|null} Stored password or null
   */
  const checkSessionPassword = () => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      const hasPassword = !!stored;

      isPasswordRemembered.value = hasPassword;
      rememberPassword.value = hasPassword;

      return stored;
    } catch (error) {
      console.error('Failed to check session password:', error);
      isPasswordRemembered.value = false;
      return null;
    }
  };

  /**
   * Save password to sessionStorage
   * Only saves if rememberPassword is true and password is provided
   *
   * @param {string} password - Password to save
   */
  const saveSessionPassword = (password) => {
    // Don't save if checkbox is unchecked or password is empty
    if (!rememberPassword.value || !password) {
      clearSessionPassword();
      return;
    }

    try {
      sessionStorage.setItem(STORAGE_KEY, password);
      isPasswordRemembered.value = true;
    } catch (error) {
      console.error('Failed to save session password:', error);
      // QuotaExceededError or other storage errors
      isPasswordRemembered.value = false;
    }
  };

  /**
   * Retrieve password from sessionStorage
   *
   * @returns {string|null} Stored password or null
   */
  const getSessionPassword = () => {
    try {
      return sessionStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to get session password:', error);
      return null;
    }
  };

  /**
   * Clear password from sessionStorage
   * Resets all related state
   */
  const clearSessionPassword = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear session password:', error);
    } finally {
      // Always reset state, even if storage operation fails
      isPasswordRemembered.value = false;
      rememberPassword.value = false;
    }
  };

  /**
   * Auto-load password from sessionStorage on component mount
   *
   * @returns {string} Stored password or empty string
   */
  const autoLoadPassword = () => {
    const stored = checkSessionPassword();
    return stored || '';
  };

  // Watch rememberPassword checkbox changes
  // This watcher is intentionally simple - it only clears when unchecked
  // The actual saving happens in the component via saveSessionPassword()
  // when the user checks the box with an existing password
  watch(rememberPassword, (shouldRemember) => {
    if (!shouldRemember) {
      clearSessionPassword();
    }
  });

  // Security: Auto-clear password when window loses focus or becomes hidden
  // This prevents password exposure if user walks away from unlocked device
  const handleVisibilityChange = () => {
    if (document.hidden) {
      clearSessionPassword();
    }
  };

  const handleWindowBlur = () => {
    clearSessionPassword();
  };

  // Setup security listeners on component mount
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
  }

  // Cleanup: Remove listeners on component unmount
  onBeforeUnmount(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    }
  });

  // Note: We intentionally DON'T clear on component unmount
  // sessionStorage should persist across navigation within the same tab
  // Browser automatically clears sessionStorage when tab closes

  return {
    // State
    rememberPassword,
    isPasswordRemembered,

    // Methods
    saveSessionPassword,
    getSessionPassword,
    clearSessionPassword,
    autoLoadPassword
  };
}
