/**
 * Web Worker for AES Encryption/Decryption
 * Runs crypto operations on background thread to avoid blocking main UI
 *
 * Message Protocol:
 * - Incoming: [action, file, password, fileName, providerType?]
 *   - action: "ENCRYPT" | "DECRYPT"
 *   - file: File/Blob object
 *   - password: Encryption/decryption password
 *   - fileName: Original filename
 *   - providerType: Optional provider type (defaults to 'jsAesCrypt')
 *
 * - Outgoing: [action, result, fileName]
 *   - action: "ENCRYPT" | "DECRYPT" | "ERROR"
 *   - result: Encrypted/decrypted blob or error message
 *   - fileName: Output filename (with provider-specific extension)
 */

let cdnPath = "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/";
let libPath = "/libs/";

// Load required crypto libraries (for jsAesCrypt provider)
self.importScripts(
	cdnPath + "core.min.js",
	cdnPath + "enc-utf16.min.js",
	libPath + "enc-uint8array.min.js",
	libPath + "aes_crypt.min.js"
);

// Load provider abstractions
self.importScripts("/providers/JsAesCryptWorkerProvider.js");
self.importScripts("/providers/WebCryptoWorkerProvider.js");
self.importScripts("/providers/AgeWorkerProvider.js");

// Initialize rage-wasm (async loading)
let rageWasm = null;
let rageWasmReady = false;

// Load rage-wasm dynamically
(async () => {
  try {
    const startTime = performance.now();
    console.log('[Worker] Starting to load rage-wasm...');

    // Import the module (this works in module-type workers in modern browsers)
    const module = await import('@kanru/rage-wasm');
    rageWasm = module;
    rageWasmReady = true;

    const loadTime = performance.now() - startTime;
    console.log(`[Worker] rage-wasm loaded successfully in ${loadTime.toFixed(2)}ms`);
  } catch (err) {
    console.error('[Worker] Failed to load rage-wasm:', err);
    // Age encryption will not be available, but AES encryption still works
  }
})();

// Initialize default provider (jsAesCrypt)
let provider = new JsAesCryptWorkerProvider(aesCrypt);
let currentProviderType = 'jsAesCrypt';

/**
 * Sets the encryption provider
 * @param {string} providerType - Provider type ('jsAesCrypt', 'webCrypto', or 'age')
 */
function setProvider(providerType) {
  if (providerType === currentProviderType) {
    return; // Already using this provider
  }

  if (providerType === 'jsAesCrypt') {
    provider = new JsAesCryptWorkerProvider(aesCrypt);
    currentProviderType = 'jsAesCrypt';
  } else if (providerType === 'webCrypto') {
    provider = new WebCryptoWorkerProvider();
    currentProviderType = 'webCrypto';
  } else if (providerType === 'age') {
    if (!rageWasmReady || !rageWasm) {
      throw new Error('Age encryption library not loaded yet. Please wait a moment and try again.');
    }
    provider = new AgeWorkerProvider(rageWasm);
    currentProviderType = 'age';
  } else {
    throw new Error(`Unknown provider type: ${providerType}`);
  }
}

/**
 * Handles incoming messages from main thread
 * @param {MessageEvent} e - Message event containing encryption/decryption request
 */
onmessage = function(e) {
	const data = e.data;

	// SECURITY: Validate message structure
	if (!Array.isArray(data) || data.length < 1) {
		postMessage(["ERROR", "Invalid message format", null]);
		return;
	}

	const action = data[0];

	// SECURITY: Validate action type
	if (typeof action !== 'string') {
		postMessage(["ERROR", "Invalid action type", null]);
		return;
	}

	// Handle provider initialization
	if (action === "INIT") {
		const providerType = data[1] || 'jsAesCrypt';

		// SECURITY: Validate provider type
		if (typeof providerType !== 'string' || !['jsAesCrypt', 'webCrypto', 'age'].includes(providerType)) {
			postMessage(["INIT_ERROR", "Invalid provider type"]);
			return;
		}

		try {
			setProvider(providerType);
			postMessage(["INIT_SUCCESS", providerType]);
		} catch (error) {
			postMessage(["INIT_ERROR", error.message]);
		}
		return;
	}

	// Handle encryption/decryption
	if( action === "ENCRYPT" || action === "DECRYPT" ) {
		const file = data[1];
		const password = data[2];
		const fileName = data[3];
		const providerType = data[4]; // Optional provider type

		// SECURITY: Validate file parameter
		if (!file || !(file instanceof Blob)) {
			postMessage(["ERROR", "Invalid file data", action]);
			return;
		}

		// SECURITY: Validate password
		if (typeof password !== 'string' || password.length === 0) {
			postMessage(["ERROR", "Invalid password", action]);
			return;
		}

		// SECURITY: Validate fileName (prevent path traversal)
		if (typeof fileName !== 'string' || fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
			postMessage(["ERROR", "Invalid filename", action]);
			return;
		}

		// SECURITY: Validate optional provider type
		if (providerType !== undefined && (typeof providerType !== 'string' || !['jsAesCrypt', 'webCrypto', 'age'].includes(providerType))) {
			postMessage(["ERROR", "Invalid provider type", action]);
			return;
		}

		// Switch provider if specified and different from current
		if (providerType && providerType !== currentProviderType) {
			try {
				setProvider(providerType);
			} catch (error) {
				postMessage(["ERROR", `Failed to switch provider: ${error.message}`, action]);
				return;
			}
		}

		if( action === "ENCRYPT" ) {
			provider.encrypt(file, password).then((result) => {
				// Get file extension from provider info
				const extension = provider.getInfo().fileExtension;
				postMessage(["ENCRYPT", result, fileName + extension]);
			}).catch((error) => {
				// Normalize error using provider
				const normalizedError = provider.normalizeError(error);
				postMessage(["ERROR", normalizedError.userMessage, "ENCRYPT"]);
			});
		} else {
			provider.decrypt(file, password).then((result) => {
				// Remove file extension (last part after final dot)
				const outputFileName = fileName.split('.').slice(0, -1).join('.');
				postMessage(["DECRYPT", result, outputFileName]);
			}).catch((error) => {
				// Normalize error using provider
				const normalizedError = provider.normalizeError(error);
				postMessage(["ERROR", normalizedError.userMessage, "DECRYPT"]);
			});
		}
	}
}