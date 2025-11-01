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
 * @returns {Object} Worker state and operation methods
 * @returns {Ref<Worker|null>} worker - Web Worker instance
 * @returns {Ref<boolean>} isLoading - Whether an operation is in progress
 * @returns {Function} encrypt - Encrypt data
 * @returns {Function} decrypt - Decrypt data
 *
 * @example
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
 * // Encrypt a file
 * encrypt(fileBlob, password, 'document.txt');
 *
 * // Decrypt a file
 * decrypt(encryptedBlob, password, 'encrypted.aes');
 */
import { ref, onBeforeUnmount } from 'vue';

export function useAESWorker(onSuccess, onError) {
  const worker = ref(null);
  const isLoading = ref(false);

  /**
   * Map raw error messages to user-friendly messages
   * @param {string} errorData - Raw error message from worker
   * @param {string} operationType - 'ENCRYPT' or 'DECRYPT'
   * @returns {string} User-friendly error message
   */
  const getFriendlyErrorMessage = (errorData, operationType = '') => {
    const errorMap = {
      'Password is too long': '❌ Password too long (max 1024 characters)',
      'Wrong password': '❌ Wrong password',
      'Bad HMAC': '❌ Wrong password',
      'corrupted': '❌ File corrupted or tampered with',
      'not an AES Crypt': '❌ Invalid AES file format',
      'not a valid AES': '❌ Invalid AES file format'
    };

    for (const [pattern, message] of Object.entries(errorMap)) {
      if (errorData.includes(pattern)) {
        return message;
      }
    }

    // Default error messages based on operation type
    if (operationType === 'DECRYPT') {
      return '❌ Decryption failed';
    } else if (operationType === 'ENCRYPT') {
      return '❌ Encryption failed';
    }

    return '❌ Operation failed';
  };

  /**
   * Setup Web Worker instance
   * Terminates existing worker if present
   */
  const setupWorker = () => {
    if (worker.value) {
      worker.value.terminate();
    }
    worker.value = new Worker('/worker.js');
    worker.value.onmessage = handleWorkerResponse;
  };

  /**
   * Handle response from Web Worker
   * @param {MessageEvent} event - Worker message event
   */
  const handleWorkerResponse = (event) => {
    const [action, data, fileName] = event.data;
    isLoading.value = false;

    if (action === 'ERROR') {
      const friendlyMessage = getFriendlyErrorMessage(data, currentOperation.value);
      onError?.(friendlyMessage, data);
      return;
    }

    onSuccess?.(data, fileName);
  };

  // Track current operation type for better error messages
  const currentOperation = ref('');

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

    currentOperation.value = 'ENCRYPT';
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

    currentOperation.value = 'DECRYPT';
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
