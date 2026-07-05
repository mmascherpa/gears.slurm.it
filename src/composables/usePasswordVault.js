/**
 * Composable for managing the encrypted password vault
 *
 * Provides CRUD operations for password entries with Age encryption.
 * Vault is stored encrypted in IndexedDB (with one-time migration from
 * the legacy localStorage key) and decrypted in memory when unlocked.
 *
 * @returns {Object} Vault state and operations
 */
import { ref, computed, onBeforeUnmount } from 'vue';
import {
  loadVaultData,
  saveVaultData,
  deleteVaultData,
  vaultDataExists
} from '@/utils/vaultStorage';

// Storage keys
const ACTIVITY_STORAGE_KEY = 'slurm-vault-last-activity';
const UNLOCK_ATTEMPTS_KEY = 'slurm-vault-unlock-attempts';

// Vault version for future migrations
const VAULT_VERSION = 1;

// Rate limiting constants
const MAX_UNLOCK_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60000; // 1 minute lockout after max attempts

/**
 * Creates an empty vault structure
 * @returns {Object} Empty vault
 */
function createEmptyVault() {
  const now = new Date().toISOString();
  return {
    version: VAULT_VERSION,
    entries: [],
    settings: {
      autoLockMinutes: 5
    },
    metadata: {
      createdAt: now,
      lastModifiedAt: now
    }
  };
}

/**
 * Creates a new password entry with defaults
 * @param {Object} data - Entry data
 * @returns {Object} Complete entry with id and timestamps
 */
function createEntry(data) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: data.name || '',
    username: data.username || '',
    email: data.email || '',
    url: data.url || '',
    password: data.password || '',
    totp: data.totp || '',
    note: data.note || '',
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now
  };
}

export function usePasswordVault() {
  // Reactive state
  const vault = ref(null);
  const isLocked = ref(true);
  const isLoading = ref(false);
  const error = ref(null);
  const masterPassword = ref(null);
  const isLockedOut = ref(false);
  const lockoutRemainingSeconds = ref(0);

  // Worker for Age encryption
  let worker = null;
  let pendingOperation = null;
  let operationQueue = Promise.resolve();
  let lockoutTimer = null;

  // Track vault existence reactively (storage check is async)
  const vaultExists = ref(false);

  // Resolves once the initial existence check completes; views can await
  // this before deciding whether to auto-open the unlock dialog
  const ready = vaultDataExists()
    .then(exists => {
      vaultExists.value = exists;
    })
    .catch(() => {
      vaultExists.value = false;
    });

  /**
   * Check if a vault exists in storage
   * @returns {boolean}
   */
  const hasVault = computed(() => {
    // Use reactive ref that gets updated when vault is created/deleted
    return vaultExists.value;
  });

  /**
   * Get entry count (when unlocked)
   * @returns {number}
   */
  const entryCount = computed(() => {
    return vault.value?.entries?.length || 0;
  });

  /**
   * Setup the encryption worker
   */
  function setupWorker() {
    if (worker) return;

    worker = new Worker(
      new URL('../workers/cryptoWorker.js', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = handleWorkerMessage;
    worker.onerror = (e) => {
      console.error('Vault worker error:', e);
      isLoading.value = false;
      error.value = 'Encryption worker error';
      if (pendingOperation?.reject) {
        pendingOperation.reject(new Error('Worker error'));
        pendingOperation = null;
      }
    };
  }

  /**
   * Handle messages from the encryption worker
   */
  function handleWorkerMessage(event) {
    const [action, data, extra] = event.data;
    isLoading.value = false;

    if (action === 'ERROR') {
      error.value = data;
      if (pendingOperation?.reject) {
        pendingOperation.reject(new Error(data));
        pendingOperation = null;
      }
      return;
    }

    if (pendingOperation?.resolve) {
      pendingOperation.resolve({ action, data, extra });
      pendingOperation = null;
    }
  }

  /**
   * Serializes worker operations. The worker protocol has no request ids
   * and pendingOperation is a single slot, so only one encrypt/decrypt may
   * be in flight at a time; overlapping calls would clobber each other's
   * resolve/reject handlers.
   * @param {Function} startOperation - Function starting the operation
   * @returns {Promise<*>} The operation's result
   */
  function enqueueOperation(startOperation) {
    const run = operationQueue.then(startOperation, startOperation);
    operationQueue = run.then(() => {}, () => {});
    return run;
  }

  /**
   * Encrypt data using Age encryption
   * @param {string} plaintext - Data to encrypt
   * @param {string} password - Encryption password
   * @returns {Promise<Uint8Array>} Encrypted data
   */
  function encryptData(plaintext, password) {
    return enqueueOperation(() => {
      setupWorker();

      return new Promise((resolve, reject) => {
        pendingOperation = { resolve, reject };

        // Convert string to Uint8Array
        const encoder = new TextEncoder();
        const data = encoder.encode(plaintext);

        // Create a Blob for the worker
        const blob = new Blob([data]);

        worker.postMessage(['ENCRYPT', blob, password, 'vault.json', 'age']);
      }).then(result => {
        if (result.action === 'ENCRYPT') {
          return result.data;
        }
        throw new Error('Unexpected response');
      });
    });
  }

  /**
   * Decrypt data using Age encryption
   * @param {Uint8Array} encrypted - Encrypted data
   * @param {string} password - Decryption password
   * @returns {Promise<string>} Decrypted plaintext
   */
  function decryptData(encrypted, password) {
    return enqueueOperation(() => {
      setupWorker();

      return new Promise((resolve, reject) => {
        pendingOperation = { resolve, reject };

        // Create a Blob for the worker
        const blob = new Blob([encrypted]);

        worker.postMessage(['DECRYPT', blob, password, 'vault.age', 'age']);
      }).then(result => {
        if (result.action === 'DECRYPT') {
          // Convert Uint8Array to string
          const decoder = new TextDecoder();
          return decoder.decode(result.data);
        }
        throw new Error('Unexpected response');
      });
    });
  }

  /**
   * Create a new vault with the given master password
   * @param {string} password - Master password
   * @returns {Promise<boolean>} Success
   */
  async function createVault(password) {
    if (!password) {
      error.value = 'Password is required';
      return false;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const newVault = createEmptyVault();
      const plaintext = JSON.stringify(newVault);
      const encrypted = await encryptData(plaintext, password);

      await saveVaultData(encrypted);

      // Set state
      vault.value = newVault;
      masterPassword.value = password;
      isLocked.value = false;
      vaultExists.value = true; // Update reactive tracker
      updateActivity();

      return true;
    } catch (err) {
      console.error('Failed to create vault:', err);
      error.value = typeof err === 'string' ? err : (err.message || 'Failed to create vault');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Gets the current unlock attempt state from sessionStorage
   * @returns {Object} { attempts, lockoutUntil }
   */
  function getUnlockAttemptState() {
    try {
      const stored = sessionStorage.getItem(UNLOCK_ATTEMPTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore parse errors
    }
    return { attempts: 0, lockoutUntil: null };
  }

  /**
   * Records a failed unlock attempt and updates lockout state
   */
  function recordFailedAttempt() {
    const state = getUnlockAttemptState();
    state.attempts++;

    if (state.attempts >= MAX_UNLOCK_ATTEMPTS) {
      state.lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
      startLockoutCountdown(state.lockoutUntil);
    }

    try {
      sessionStorage.setItem(UNLOCK_ATTEMPTS_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Clears the unlock attempt counter after successful unlock
   */
  function clearUnlockAttempts() {
    try {
      sessionStorage.removeItem(UNLOCK_ATTEMPTS_KEY);
      isLockedOut.value = false;
      lockoutRemainingSeconds.value = 0;
      if (lockoutTimer) {
        clearInterval(lockoutTimer);
        lockoutTimer = null;
      }
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Starts the lockout countdown timer
   * @param {number} lockoutUntil - Timestamp when lockout expires
   */
  function startLockoutCountdown(lockoutUntil) {
    isLockedOut.value = true;

    const updateRemaining = () => {
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      lockoutRemainingSeconds.value = remaining;

      if (remaining <= 0) {
        isLockedOut.value = false;
        if (lockoutTimer) {
          clearInterval(lockoutTimer);
          lockoutTimer = null;
        }
        // Reset attempts after lockout expires
        try {
          sessionStorage.removeItem(UNLOCK_ATTEMPTS_KEY);
        } catch {
          // Ignore
        }
      }
    };

    updateRemaining();
    if (lockoutTimer) {
      clearInterval(lockoutTimer);
    }
    lockoutTimer = setInterval(updateRemaining, 1000);
  }

  /**
   * Checks if currently locked out and starts countdown if needed
   * @returns {boolean} Whether currently locked out
   */
  function checkLockoutState() {
    const state = getUnlockAttemptState();
    if (state.lockoutUntil && state.lockoutUntil > Date.now()) {
      startLockoutCountdown(state.lockoutUntil);
      return true;
    }
    return false;
  }

  /**
   * Gets the number of remaining unlock attempts
   * @returns {number}
   */
  function getRemainingAttempts() {
    const state = getUnlockAttemptState();
    return Math.max(0, MAX_UNLOCK_ATTEMPTS - state.attempts);
  }

  /**
   * Unlock an existing vault with the master password
   * @param {string} password - Master password
   * @returns {Promise<boolean>} Success
   */
  async function unlockVault(password) {
    if (!password) {
      error.value = 'Password is required';
      return false;
    }

    // Check if locked out
    if (checkLockoutState()) {
      error.value = `Too many failed attempts. Try again in ${lockoutRemainingSeconds.value} seconds.`;
      return false;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const encrypted = await loadVaultData();
      if (!encrypted) {
        error.value = 'No vault found';
        return false;
      }

      const plaintext = await decryptData(encrypted, password);
      const decrypted = JSON.parse(plaintext);

      // Validate vault structure
      if (!decrypted.version || !Array.isArray(decrypted.entries)) {
        error.value = 'Invalid vault format';
        return false;
      }

      vault.value = decrypted;
      masterPassword.value = password;
      isLocked.value = false;
      updateActivity();

      // Clear failed attempts on successful unlock
      clearUnlockAttempts();

      return true;
    } catch (err) {
      console.error('Failed to unlock vault:', err);
      const errMsg = typeof err === 'string' ? err : (err.message || 'Failed to unlock vault');

      // Record failed attempt for rate limiting
      recordFailedAttempt();
      const remaining = getRemainingAttempts();

      // Provide user-friendly error messages
      if (errMsg.toLowerCase().includes('decrypt') || errMsg.toLowerCase().includes('password')) {
        if (remaining > 0) {
          error.value = `Incorrect password. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`;
        } else {
          error.value = `Incorrect password. Too many failed attempts. Try again in ${Math.ceil(LOCKOUT_DURATION_MS / 1000)} seconds.`;
        }
      } else {
        error.value = errMsg;
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Lock the vault (clear decrypted data from memory)
   */
  function lockVault() {
    vault.value = null;
    masterPassword.value = null;
    isLocked.value = true;
    error.value = null;

    // Clear activity timestamp
    try {
      sessionStorage.removeItem(ACTIVITY_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Save the current vault state (encrypt and persist)
   * @returns {Promise<boolean>} Success
   */
  async function saveVault() {
    if (!vault.value || !masterPassword.value) {
      error.value = 'Vault not unlocked';
      return false;
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Update modification timestamp
      vault.value.metadata.lastModifiedAt = new Date().toISOString();

      const plaintext = JSON.stringify(vault.value);
      const encrypted = await encryptData(plaintext, masterPassword.value);

      // Handle storage quota exceeded
      try {
        await saveVaultData(encrypted);
      } catch (storageErr) {
        if (storageErr?.name === 'QuotaExceededError') {
          error.value = 'Storage quota exceeded. Please export your vault and clear browser data, or remove some entries.';
          return false;
        }
        throw storageErr;
      }

      updateActivity();
      return true;
    } catch (err) {
      console.error('Failed to save vault:', err);
      error.value = typeof err === 'string' ? err : (err.message || 'Failed to save vault');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Add a new entry to the vault
   * @param {Object} entryData - Entry data
   * @returns {Promise<Object|null>} Created entry or null on failure
   */
  async function addEntry(entryData) {
    if (!vault.value) {
      error.value = 'Vault not unlocked';
      return null;
    }

    const entry = createEntry(entryData);
    vault.value.entries.push(entry);

    const saved = await saveVault();
    if (!saved) {
      // Rollback
      vault.value.entries.pop();
      return null;
    }

    return entry;
  }

  /**
   * Update an existing entry
   * @param {string} id - Entry ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated entry or null on failure
   */
  async function updateEntry(id, updates) {
    if (!vault.value) {
      error.value = 'Vault not unlocked';
      return null;
    }

    const index = vault.value.entries.findIndex(e => e.id === id);
    if (index === -1) {
      error.value = 'Entry not found';
      return null;
    }

    const oldEntry = { ...vault.value.entries[index] };
    const updatedEntry = {
      ...oldEntry,
      ...updates,
      id: oldEntry.id, // Preserve ID
      createdAt: oldEntry.createdAt, // Preserve creation time
      updatedAt: new Date().toISOString()
    };

    vault.value.entries[index] = updatedEntry;

    const saved = await saveVault();
    if (!saved) {
      // Rollback
      vault.value.entries[index] = oldEntry;
      return null;
    }

    return updatedEntry;
  }

  /**
   * Delete an entry
   * @param {string} id - Entry ID
   * @returns {Promise<boolean>} Success
   */
  async function deleteEntry(id) {
    if (!vault.value) {
      error.value = 'Vault not unlocked';
      return false;
    }

    const index = vault.value.entries.findIndex(e => e.id === id);
    if (index === -1) {
      error.value = 'Entry not found';
      return false;
    }

    const removed = vault.value.entries.splice(index, 1)[0];

    const saved = await saveVault();
    if (!saved) {
      // Rollback
      vault.value.entries.splice(index, 0, removed);
      return false;
    }

    return true;
  }

  /**
   * Import entries into the vault
   * @param {Array} entries - Array of entry data
   * @param {string} mode - 'skip' | 'overwrite' | 'keepBoth'
   * @returns {Promise<Object>} Import result { added, updated, skipped }
   */
  async function importEntries(entries, mode = 'skip') {
    if (!vault.value) {
      error.value = 'Vault not unlocked';
      return { added: 0, updated: 0, skipped: 0 };
    }

    const result = { added: 0, updated: 0, skipped: 0 };
    const existingByKey = new Map();

    // Build lookup by name+username
    vault.value.entries.forEach(e => {
      const key = `${e.name.toLowerCase()}|${e.username.toLowerCase()}`;
      existingByKey.set(key, e);
    });

    for (const entryData of entries) {
      const key = `${(entryData.name || '').toLowerCase()}|${(entryData.username || '').toLowerCase()}`;
      const existing = existingByKey.get(key);

      if (existing) {
        if (mode === 'skip') {
          result.skipped++;
        } else if (mode === 'overwrite') {
          // Update existing entry
          Object.assign(existing, {
            ...entryData,
            id: existing.id,
            createdAt: existing.createdAt,
            updatedAt: new Date().toISOString()
          });
          result.updated++;
        } else if (mode === 'keepBoth') {
          // Add as new entry
          const newEntry = createEntry(entryData);
          vault.value.entries.push(newEntry);
          result.added++;
        }
      } else {
        // Add new entry
        const newEntry = createEntry(entryData);
        vault.value.entries.push(newEntry);
        existingByKey.set(key, newEntry);
        result.added++;
      }
    }

    if (result.added > 0 || result.updated > 0) {
      await saveVault();
    }

    return result;
  }

  /**
   * Search entries by query
   * @param {string} query - Search query
   * @returns {Array} Matching entries
   */
  function searchEntries(query) {
    if (!vault.value || !query) {
      return vault.value?.entries || [];
    }

    const lowerQuery = query.toLowerCase();
    return vault.value.entries.filter(entry =>
      entry.name.toLowerCase().includes(lowerQuery) ||
      entry.username.toLowerCase().includes(lowerQuery) ||
      entry.email.toLowerCase().includes(lowerQuery) ||
      entry.url.toLowerCase().includes(lowerQuery) ||
      entry.note.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get all entries (sorted by name)
   * @returns {Array}
   */
  function getEntries() {
    if (!vault.value) return [];
    return [...vault.value.entries].sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
  }

  /**
   * Change the master password
   * @param {string} currentPassword - Current password (for verification)
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} Success
   */
  async function changeMasterPassword(currentPassword, newPassword) {
    if (!vault.value) {
      error.value = 'Vault not unlocked';
      return false;
    }

    if (currentPassword !== masterPassword.value) {
      error.value = 'Current password is incorrect';
      return false;
    }

    if (!newPassword) {
      error.value = 'New password is required';
      return false;
    }

    const oldPassword = masterPassword.value;
    masterPassword.value = newPassword;

    const saved = await saveVault();
    if (!saved) {
      masterPassword.value = oldPassword;
      return false;
    }

    return true;
  }

  /**
   * Delete the vault entirely
   * @returns {Promise<boolean>} Success
   */
  async function deleteVault() {
    try {
      await deleteVaultData();
      sessionStorage.removeItem(ACTIVITY_STORAGE_KEY);
      vault.value = null;
      masterPassword.value = null;
      isLocked.value = true;
      vaultExists.value = false; // Update reactive tracker
      error.value = null;
      return true;
    } catch (err) {
      console.error('Failed to delete vault:', err);
      error.value = 'Failed to delete vault';
      return false;
    }
  }

  /**
   * Get the master password of the currently unlocked vault.
   * Only used to wrap the password for biometric (WebAuthn PRF) unlock;
   * returns null while the vault is locked.
   * @returns {string|null}
   */
  function getMasterPassword() {
    return masterPassword.value;
  }

  /**
   * Update activity timestamp
   */
  function updateActivity() {
    try {
      sessionStorage.setItem(ACTIVITY_STORAGE_KEY, Date.now().toString());
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Get last activity timestamp
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
   * Get auto-lock timeout in minutes
   * @returns {number}
   */
  function getAutoLockMinutes() {
    return vault.value?.settings?.autoLockMinutes || 5;
  }

  // Cleanup worker and timers on unmount
  onBeforeUnmount(() => {
    if (worker) {
      worker.terminate();
      worker = null;
    }
    if (lockoutTimer) {
      clearInterval(lockoutTimer);
      lockoutTimer = null;
    }
  });

  return {
    // State
    vault,
    isLocked,
    isLoading,
    error,
    hasVault,
    entryCount,
    isLockedOut,
    lockoutRemainingSeconds,
    ready,

    // Vault operations
    createVault,
    unlockVault,
    lockVault,
    saveVault,
    deleteVault,
    changeMasterPassword,

    // Entry operations
    addEntry,
    updateEntry,
    deleteEntry,
    importEntries,
    searchEntries,
    getEntries,

    // Activity tracking
    updateActivity,
    getLastActivity,
    getAutoLockMinutes,
    getMasterPassword,

    // Rate limiting
    getRemainingAttempts,
    checkLockoutState
  };
}
