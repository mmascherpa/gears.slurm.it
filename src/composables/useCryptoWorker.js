/**
 * Composable for file encryption/decryption using Web Workers
 *
 * Manages Web Worker lifecycle, handles multi-algorithm encryption/decryption operations,
 * and provides consistent error handling across all encryption components.
 *
 * Supports four encryption algorithms:
 * - jsAesCrypt: AES-256-CBC compatible with AES Crypt format (.aes files)
 * - webCrypto: Browser-native AES-256-GCM (.enc files)
 * - age: Modern age encryption format (.age files)
 * - openpgp: OpenPGP password-based encryption compatible with GnuPG (.gpg files)
 *
 * Automatically terminates worker on component unmount to prevent memory leaks.
 *
 * @param {Function} onSuccess - Callback when operation succeeds (data, fileName)
 * @param {Function} onError - Callback when operation fails (friendlyMessage, rawError)
 * @param {Object} options - Configuration options
 * @param {string} options.providerType - Encryption provider type (default: 'jsAesCrypt')
 * @returns {Object} Worker state and operation methods
 * @returns {Ref<Worker|null>} worker - Web Worker instance
 * @returns {Ref<boolean>} isLoading - Whether an operation is in progress
 * @returns {Function} encrypt - Encrypt data
 * @returns {Function} decrypt - Decrypt data
 *
 * @example
 * // Use default provider (jsAesCrypt)
 * const { isLoading, encrypt, decrypt } = useCryptoWorker(
 *   (data, fileName) => {
 *     downloadFile(data, fileName);
 *     showSnackbar('✓ File encrypted!', 'success');
 *   },
 *   (friendlyMsg, rawError) => {
 *     error.value = rawError;
 *     showSnackbar(friendlyMsg, 'error');
 *   }
 * );
 *
 * // Use specific provider
 * const { isLoading, encrypt, decrypt } = useCryptoWorker(
 *   onSuccess,
 *   onError,
 *   { providerType: 'webCrypto' }
 * );
 *
 * // Encrypt a file with default provider
 * encrypt(fileBlob, password, 'document.txt');
 *
 * // Encrypt a file with specific algorithm
 * encrypt(fileBlob, password, 'document.txt', 'age');
 *
 * // Decrypt a file with default provider
 * decrypt(encryptedBlob, password, 'encrypted.aes');
 *
 * // Decrypt a file with specific algorithm
 * decrypt(encryptedBlob, password, 'encrypted.age', 'age');
 */
import { ref, onBeforeUnmount } from 'vue';

export function useCryptoWorker(onSuccess, onError, options = {}) {
  const worker = ref(null);
  const isLoading = ref(false);
  const providerType = options.providerType || 'jsAesCrypt';

  // Track which worker type is currently loaded
  let currentWorkerType = null;

  /**
   * Setup Web Worker instance
   * Creates a new worker if none exists, or if algorithm requires different worker type
   *
   * @param {string} algorithm - Algorithm to determine which worker to use
   */
  const setupWorker = (algorithm) => {
    const needsClassicWorker = algorithm === 'jsAesCrypt';
    const needsModernWorker = algorithm === 'webCrypto' || algorithm === 'age' || algorithm === 'openpgp';

    // Determine if we need to switch worker types
    const shouldSwitchWorker = worker.value && (
      (needsClassicWorker && currentWorkerType !== 'classic') ||
      (needsModernWorker && currentWorkerType !== 'modern')
    );

    // Terminate existing worker if switching types
    if (shouldSwitchWorker) {
      worker.value.terminate();
      worker.value = null;
      currentWorkerType = null;
    }

    // Create new worker if needed
    if (!worker.value) {
      if (needsClassicWorker) {
        // Use classic worker for jsAesCrypt (supports .aes files)
        worker.value = new Worker('/worker.js');
        currentWorkerType = 'classic';
      } else {
        // Use ES module worker for webCrypto, age and openpgp (supports rage-wasm)
        worker.value = new Worker(
          new URL('../workers/cryptoWorker.js', import.meta.url),
          { type: 'module' }
        );
        currentWorkerType = 'modern';
      }
      worker.value.onmessage = handleWorkerResponse;
    }
  };

  /**
   * Handle response from Web Worker
   * @param {MessageEvent} event - Worker message event
   */
  const handleWorkerResponse = (event) => {
    const [action, data, fileName] = event.data;
    isLoading.value = false;

    if (action === 'ERROR') {
      // Error messages are already normalized by the provider in the worker
      onError?.(data, data);
      return;
    }

    onSuccess?.(data, fileName);
  };

  /**
   * Encrypt data using Web Worker
   * @param {Blob|File} fileData - Data to encrypt
   * @param {string} password - Encryption password
   * @param {string} fileName - Original file name
   * @param {string} algorithm - Algorithm to use ('jsAesCrypt', 'webCrypto', 'age', or 'openpgp')
   */
  const encrypt = (fileData, password, fileName, algorithm = providerType) => {
    if (!fileData || !password) {
      console.error('useAESWorker: Missing fileData or password');
      return;
    }

    isLoading.value = true;
    setupWorker(algorithm);
    worker.value.postMessage(['ENCRYPT', fileData, password, fileName, algorithm]);
  };

  /**
   * Decrypt data using Web Worker
   * @param {Blob|File} fileData - Data to decrypt
   * @param {string} password - Decryption password
   * @param {string} fileName - Encrypted file name
   * @param {string} algorithm - Algorithm to use ('jsAesCrypt', 'webCrypto', 'age', or 'openpgp')
   */
  const decrypt = (fileData, password, fileName, algorithm = providerType) => {
    if (!fileData || !password) {
      console.error('useAESWorker: Missing fileData or password');
      return;
    }

    isLoading.value = true;
    setupWorker(algorithm);
    worker.value.postMessage(['DECRYPT', fileData, password, fileName, algorithm]);
  };

  /**
   * Terminate worker (called automatically on unmount)
   */
  const terminateWorker = () => {
    if (worker.value) {
      worker.value.terminate();
      worker.value = null;
    }
  };

  // Automatic cleanup on component unmount
  onBeforeUnmount(() => {
    terminateWorker();
  });

  return {
    worker,
    isLoading,
    encrypt,
    decrypt,
    terminateWorker
  };
}
