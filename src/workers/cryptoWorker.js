/**
 * Web Worker for AES, Age and OpenPGP Encryption/Decryption
 * Runs crypto operations on background thread to avoid blocking main UI
 *
 * This is an ES module version that Vite can properly bundle with all dependencies.
 *
 * Message Protocol:
 * - Incoming: [action, file, password, fileName, providerType?]
 *   - action: "ENCRYPT" | "DECRYPT" | "INIT"
 *   - file: File/Blob object
 *   - password: Encryption/decryption password
 *   - fileName: Original filename
 *   - providerType: Optional provider type (defaults to 'jsAesCrypt')
 *
 * - Outgoing: [action, result, fileName]
 *   - action: "ENCRYPT" | "DECRYPT" | "ERROR" | "INIT_SUCCESS" | "INIT_ERROR"
 *   - result: Encrypted/decrypted blob or error message
 *   - fileName: Output filename (with provider-specific extension)
 */

// Import rage-wasm as ES module (Vite will bundle this properly)
import * as rageWasm from '@kanru/rage-wasm';

// OpenPGP.js (pure JS, no WASM needed for symmetric operations)
import * as openpgp from 'openpgp';

import { WebCryptoWorkerProvider } from './providers/WebCryptoWorkerProvider.js';
import { AgeWorkerProvider } from './providers/AgeWorkerProvider.js';
import { OpenPgpWorkerProvider } from './providers/OpenPgpWorkerProvider.js';

// Provider types accepted from the main thread
// (jsAesCrypt maps to webCrypto in this ES module worker)
const SUPPORTED_PROVIDERS = ['jsAesCrypt', 'webCrypto', 'age', 'openpgp'];

// Initialize rage-wasm (should be immediate with bundled WASM)
let rageWasmReady = true; // In bundled ES modules, imports are synchronous
console.log('[Worker] rage-wasm loaded successfully (ES module)');

// Initialize providers
let provider;
let currentProviderType = 'webCrypto'; // Default to webCrypto (AES-256-GCM)

/**
 * Sets the encryption provider
 * @param {string} providerType - Provider type ('age', 'webCrypto', 'openpgp')
 * Note: jsAesCrypt is not supported in ES module worker (use webCrypto instead for AES)
 */
function setProvider(providerType) {
  if (providerType === currentProviderType) {
    return; // Already using this provider
  }

  if (providerType === 'jsAesCrypt') {
    // jsAesCrypt requires classic worker with CDN libs - not supported in ES modules
    // Automatically fallback to webCrypto which provides AES-256-GCM
    console.warn('[Worker] jsAesCrypt not available in ES module worker, using WebCrypto instead');
    provider = new WebCryptoWorkerProvider();
    currentProviderType = 'webCrypto';
  } else if (providerType === 'webCrypto') {
    provider = new WebCryptoWorkerProvider();
    currentProviderType = 'webCrypto';
  } else if (providerType === 'age') {
    if (!rageWasmReady || !rageWasm) {
      throw new Error('Age encryption library not loaded yet. Please wait a moment and try again.');
    }
    provider = new AgeWorkerProvider(rageWasm);
    currentProviderType = 'age';
  } else if (providerType === 'openpgp') {
    provider = new OpenPgpWorkerProvider(openpgp);
    currentProviderType = 'openpgp';
  } else {
    throw new Error(`Unknown provider type: ${providerType}`);
  }
}

// Initialize default provider (webCrypto - browser-native AES-256-GCM)
provider = new WebCryptoWorkerProvider();
currentProviderType = 'webCrypto';

/**
 * Builds a postMessage transfer list so large result buffers move to the
 * main thread without being copied. Only plain ArrayBuffer-backed
 * Uint8Arrays are transferable.
 * @param {*} result - Provider result
 * @returns {ArrayBuffer[]} Transfer list
 */
function transferListFor(result) {
  return result instanceof Uint8Array && result.buffer instanceof ArrayBuffer
    ? [result.buffer]
    : [];
}

/**
 * Handles incoming messages from main thread
 * @param {MessageEvent} e - Message event containing encryption/decryption request
 */
self.onmessage = function(e) {
  const data = e.data;

  // SECURITY: Validate message structure
  if (!Array.isArray(data) || data.length < 1) {
    self.postMessage(["ERROR", "Invalid message format", null]);
    return;
  }

  const action = data[0];

  // SECURITY: Validate action type
  if (typeof action !== 'string') {
    self.postMessage(["ERROR", "Invalid action type", null]);
    return;
  }

  // Handle provider initialization
  if (action === "INIT") {
    const providerType = data[1] || 'webCrypto';

    // SECURITY: Validate provider type (jsAesCrypt maps to webCrypto in ES module worker)
    if (typeof providerType !== 'string' || !SUPPORTED_PROVIDERS.includes(providerType)) {
      self.postMessage(["INIT_ERROR", "Invalid provider type"]);
      return;
    }

    try {
      setProvider(providerType);
      self.postMessage(["INIT_SUCCESS", providerType]);
    } catch (error) {
      self.postMessage(["INIT_ERROR", error.message]);
    }
    return;
  }

  // Handle encryption/decryption
  if (action === "ENCRYPT" || action === "DECRYPT") {
    const file = data[1];
    const password = data[2];
    const fileName = data[3];
    const providerType = data[4]; // Optional provider type

    // SECURITY: Validate file parameter
    if (!file || !(file instanceof Blob)) {
      self.postMessage(["ERROR", "Invalid file data", action]);
      return;
    }

    // SECURITY: Validate password
    if (typeof password !== 'string' || password.length === 0) {
      self.postMessage(["ERROR", "Invalid password", action]);
      return;
    }

    // SECURITY: Validate fileName (prevent path traversal)
    if (typeof fileName !== 'string' || fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      self.postMessage(["ERROR", "Invalid filename", action]);
      return;
    }

    // SECURITY: Validate optional provider type (jsAesCrypt maps to webCrypto in ES module worker)
    if (providerType !== undefined && (typeof providerType !== 'string' || !SUPPORTED_PROVIDERS.includes(providerType))) {
      self.postMessage(["ERROR", "Invalid provider type", action]);
      return;
    }

    // Switch provider if specified and different from current
    if (providerType && providerType !== currentProviderType) {
      try {
        setProvider(providerType);
      } catch (error) {
        self.postMessage(["ERROR", `Failed to switch provider: ${error.message}`, action]);
        return;
      }
    }

    if (action === "ENCRYPT") {
      provider.encrypt(file, password).then((result) => {
        // Get file extension from provider info
        const extension = provider.getInfo().fileExtension;
        self.postMessage(["ENCRYPT", result, fileName + extension], transferListFor(result));
      }).catch((error) => {
        // Normalize error using provider
        const normalizedError = provider.normalizeError(error);
        self.postMessage(["ERROR", normalizedError.userMessage, "ENCRYPT"]);
      });
    } else {
      provider.decrypt(file, password).then((result) => {
        // Remove file extension (last part after final dot)
        const outputFileName = fileName.split('.').slice(0, -1).join('.');
        self.postMessage(["DECRYPT", result, outputFileName], transferListFor(result));
      }).catch((error) => {
        // Normalize error using provider
        const normalizedError = provider.normalizeError(error);
        self.postMessage(["ERROR", normalizedError.userMessage, "DECRYPT"]);
      });
    }
  }
};
