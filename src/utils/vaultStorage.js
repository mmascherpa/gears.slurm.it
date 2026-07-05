/**
 * Vault Storage - IndexedDB persistence for the encrypted password vault
 *
 * Stores the encrypted vault as binary (Uint8Array) in IndexedDB instead of
 * base64 in localStorage: no 33% base64 overhead, no ~5MB localStorage
 * quota, and no synchronous main-thread writes for large vaults.
 *
 * A one-time migration moves any vault found under the legacy localStorage
 * key into IndexedDB on first access.
 */

const DB_NAME = 'slurm-vault';
const DB_VERSION = 1;
const STORE_NAME = 'vault';
const VAULT_KEY = 'vault-data';

const LEGACY_LOCALSTORAGE_KEY = 'slurm-password-vault';

/**
 * Opens (and creates if needed) the vault database
 * @returns {Promise<IDBDatabase>}
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open vault database'));
  });
}

/**
 * Runs a single-store transaction and resolves with the request result
 * @param {IDBTransactionMode} mode - 'readonly' or 'readwrite'
 * @param {Function} operation - Receives the object store, returns an IDBRequest
 * @returns {Promise<*>}
 */
async function withStore(mode, operation) {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, mode);
      const request = operation(transaction.objectStore(STORE_NAME));

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Vault storage operation failed'));
      transaction.onabort = () => reject(transaction.error || new Error('Vault storage transaction aborted'));
    });
  } finally {
    db.close();
  }
}

/**
 * Migrates a legacy base64 localStorage vault into IndexedDB, if present.
 * Removes the localStorage copy only after the IndexedDB write succeeds.
 * @returns {Promise<Uint8Array|null>} Migrated vault bytes or null
 */
async function migrateLegacyVault() {
  let base64;
  try {
    base64 = localStorage.getItem(LEGACY_LOCALSTORAGE_KEY);
  } catch {
    return null;
  }
  if (!base64) return null;

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  await withStore('readwrite', store => store.put(bytes, VAULT_KEY));
  try {
    localStorage.removeItem(LEGACY_LOCALSTORAGE_KEY);
  } catch {
    // Migration succeeded; a lingering localStorage copy is only cosmetic
  }

  return bytes;
}

/**
 * Loads the encrypted vault, migrating from localStorage if necessary
 * @returns {Promise<Uint8Array|null>} Encrypted vault bytes or null
 */
export async function loadVaultData() {
  const stored = await withStore('readonly', store => store.get(VAULT_KEY));
  if (stored) {
    return stored instanceof Uint8Array ? stored : new Uint8Array(stored);
  }

  return migrateLegacyVault();
}

/**
 * Persists the encrypted vault
 * @param {Uint8Array} bytes - Encrypted vault contents
 * @returns {Promise<void>}
 */
export async function saveVaultData(bytes) {
  await withStore('readwrite', store => store.put(bytes, VAULT_KEY));
}

/**
 * Deletes the vault from IndexedDB and any legacy localStorage copy
 * @returns {Promise<void>}
 */
export async function deleteVaultData() {
  await withStore('readwrite', store => store.delete(VAULT_KEY));
  try {
    localStorage.removeItem(LEGACY_LOCALSTORAGE_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Checks whether a vault exists (in IndexedDB or awaiting migration)
 * @returns {Promise<boolean>}
 */
export async function vaultDataExists() {
  const count = await withStore('readonly', store => store.count(VAULT_KEY));
  if (count > 0) return true;

  try {
    return localStorage.getItem(LEGACY_LOCALSTORAGE_KEY) !== null;
  } catch {
    return false;
  }
}
