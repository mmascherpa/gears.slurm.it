/**
 * Composable for AES encryption/decryption using Web Worker
 *
 * Manages Web Worker lifecycle, handles encryption/decryption operations,
 * and provides consistent error handling across all AES components.
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
 * const { isLoading, encrypt, decrypt } = useAESWorker(
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
 * const { isLoading, encrypt, decrypt } = useAESWorker(
 *   onSuccess,
 *   onError,
 *   { providerType: 'webCrypto' }
 * );
 *
 * // Encrypt a file
 * encrypt(fileBlob, password, 'document.txt');
 *
 * // Decrypt a file
 * decrypt(encryptedBlob, password, 'encrypted.aes');
 */
import { ref, onBeforeUnmount } from 'vue';

export function useAESWorker(onSuccess, onError, options = {}) {
  const worker = ref(null);
  const isLoading = ref(false);
  const providerType = options.providerType || 'jsAesCrypt';

  /**
   * Setup Web Worker instance (initialize once and reuse)
   * Only creates worker if it doesn't already exist
   */
  const setupWorker = () => {
    if (!worker.value) {
      worker.value = new Worker('/worker.js');
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
   */
  const encrypt = (fileData, password, fileName) => {
    if (!fileData || !password) {
      console.error('useAESWorker: Missing fileData or password');
      return;
    }

    isLoading.value = true;
    setupWorker();
    worker.value.postMessage(['ENCRYPT', fileData, password, fileName]);
  };

  /**
   * Decrypt data using Web Worker
   * @param {Blob|File} fileData - Data to decrypt
   * @param {string} password - Decryption password
   * @param {string} fileName - Encrypted file name
   */
  const decrypt = (fileData, password, fileName) => {
    if (!fileData || !password) {
      console.error('useAESWorker: Missing fileData or password');
      return;
    }

    isLoading.value = true;
    setupWorker();
    worker.value.postMessage(['DECRYPT', fileData, password, fileName]);
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
