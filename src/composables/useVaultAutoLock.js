/**
 * Composable for auto-locking the password vault after inactivity
 *
 * Tracks user activity and automatically locks the vault
 * after a configurable timeout period.
 *
 * @param {Object} options - Configuration options
 * @param {Function} options.onLock - Callback when vault should be locked
 * @param {Function} options.getTimeout - Function returning timeout in minutes
 * @param {Function} options.isLocked - Function returning current lock state
 * @returns {Object} Auto-lock controls
 */
import { ref, onMounted, onBeforeUnmount } from 'vue';

const ACTIVITY_STORAGE_KEY = 'slurm-vault-last-activity';

export function useVaultAutoLock(options = {}) {
  const {
    onLock = () => {},
    getTimeout = () => 5,
    isLocked = () => true
  } = options;

  const isActive = ref(true);
  let checkInterval = null;

  /**
   * Update the last activity timestamp
   */
  function updateActivity() {
    if (isLocked()) return;

    try {
      sessionStorage.setItem(ACTIVITY_STORAGE_KEY, Date.now().toString());
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Get the last activity timestamp
   * @returns {number|null}
   */
  function getLastActivity() {
    try {
      const timestamp = sessionStorage.getItem(ACTIVITY_STORAGE_KEY);
      return timestamp ? parseInt(timestamp, 10) : null;
    } catch {
      return null;
    }
  }

  /**
   * Check if the vault should be auto-locked
   * @returns {boolean} Whether the vault was locked
   */
  function checkAutoLock() {
    if (isLocked() || !isActive.value) return false;

    const lastActivity = getLastActivity();
    if (!lastActivity) return false;

    const now = Date.now();
    const timeoutMs = getTimeout() * 60 * 1000;

    if (now - lastActivity > timeoutMs) {
      onLock();
      return true;
    }

    return false;
  }

  /**
   * Handle user activity events
   */
  function handleActivity() {
    updateActivity();
  }

  /**
   * Handle visibility change (tab switch)
   */
  function handleVisibilityChange() {
    if (document.hidden) {
      // Tab became hidden - nothing special
    } else {
      // Tab became visible - check if we should lock
      checkAutoLock();
    }
  }

  /**
   * Start the auto-lock monitoring
   */
  function start() {
    isActive.value = true;
    updateActivity();

    // Set up periodic check
    if (checkInterval) {
      clearInterval(checkInterval);
    }
    checkInterval = setInterval(checkAutoLock, 30000); // Check every 30 seconds

    // Listen for user activity
    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('scroll', handleActivity);

    // Listen for tab visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  /**
   * Stop the auto-lock monitoring
   */
  function stop() {
    isActive.value = false;

    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }

    window.removeEventListener('click', handleActivity);
    window.removeEventListener('keydown', handleActivity);
    window.removeEventListener('mousemove', handleActivity);
    window.removeEventListener('scroll', handleActivity);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  }

  /**
   * Reset the activity timer
   */
  function reset() {
    updateActivity();
  }

  /**
   * Clear the activity timestamp
   */
  function clear() {
    try {
      sessionStorage.removeItem(ACTIVITY_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }

  /**
   * Get time remaining before auto-lock (in seconds)
   * @returns {number|null}
   */
  function getTimeRemaining() {
    if (isLocked()) return null;

    const lastActivity = getLastActivity();
    if (!lastActivity) return null;

    const now = Date.now();
    const timeoutMs = getTimeout() * 60 * 1000;
    const remaining = timeoutMs - (now - lastActivity);

    return Math.max(0, Math.floor(remaining / 1000));
  }

  // Lifecycle
  onMounted(() => {
    // Don't auto-start - let the consumer decide when to start
  });

  onBeforeUnmount(() => {
    stop();
  });

  return {
    isActive,
    start,
    stop,
    reset,
    clear,
    updateActivity,
    checkAutoLock,
    getTimeRemaining,
    getLastActivity
  };
}
