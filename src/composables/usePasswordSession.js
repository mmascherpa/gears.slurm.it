import { ref, watch, onBeforeUnmount } from 'vue';

/**
 * Composable for managing password session memory
 *
 * Provides session-based password memory for AES encryption/decryption
 * operations. Passwords are held in a module-level in-memory store - never
 * in sessionStorage or localStorage - so they cannot be read from browser
 * storage (by extensions, devtools, or injected script) and vanish on
 * reload or tab close. Within the SPA the store survives route navigation
 * because modules persist for the lifetime of the page.
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

// In-memory password store, shared across all component instances
const passwordStore = new Map();

/**
 * Clears every remembered password (all contexts)
 */
export function clearAllSessionPasswords() {
  passwordStore.clear();
}

export function usePasswordSession(context = 'encrypt') {
  // Reactive state
  const rememberPassword = ref(false);
  const isPasswordRemembered = ref(false);

  /**
   * Check if a password exists in the session store
   * Updates isPasswordRemembered state
   *
   * @returns {string|null} Stored password or null
   */
  const checkSessionPassword = () => {
    const stored = passwordStore.has(context) ? passwordStore.get(context) : null;
    const hasPassword = !!stored;

    isPasswordRemembered.value = hasPassword;
    rememberPassword.value = hasPassword;

    return stored;
  };

  /**
   * Save password to the session store
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

    passwordStore.set(context, password);
    isPasswordRemembered.value = true;
  };

  /**
   * Retrieve password from the session store
   *
   * @returns {string|null} Stored password or null
   */
  const getSessionPassword = () => {
    return passwordStore.has(context) ? passwordStore.get(context) : null;
  };

  /**
   * Clear password from the session store
   * Resets all related state
   */
  const clearSessionPassword = () => {
    passwordStore.delete(context);
    isPasswordRemembered.value = false;
    rememberPassword.value = false;
  };

  /**
   * Auto-load password from the session store on component mount
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
  // The in-memory store should persist across navigation within the SPA
  // Reload or tab close discards the module and the passwords with it

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
