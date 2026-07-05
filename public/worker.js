/**
 * Web Worker for AES Crypt (jsAesCrypt) Encryption/Decryption
 * Runs crypto operations on background thread to avoid blocking main UI
 *
 * This classic worker handles only the jsAesCrypt provider (.aes files),
 * which requires importScripts() for its non-module crypto libraries.
 * WebCrypto (.enc) and Age (.age) operations are handled by the ES module
 * worker in src/workers/cryptoWorker.js.
 *
 * Message Protocol:
 * - Incoming: [action, file, password, fileName, providerType?]
 *   - action: "ENCRYPT" | "DECRYPT"
 *   - file: File/Blob object
 *   - password: Encryption/decryption password
 *   - fileName: Original filename
 *   - providerType: Optional, must be 'jsAesCrypt' if provided
 *
 * - Outgoing: [action, result, fileName]
 *   - action: "ENCRYPT" | "DECRYPT" | "ERROR"
 *   - result: Encrypted/decrypted data or error message
 *   - fileName: Output filename (with provider-specific extension)
 */

let libPath = "/libs/";

// Load required crypto libraries (all vendored locally - no CDN dependency)
self.importScripts(
	libPath + "crypto-js-core.min.js",
	libPath + "crypto-js-enc-utf16.min.js",
	libPath + "enc-uint8array.min.js",
	libPath + "aes_crypt.min.js"
);

self.importScripts("/providers/JsAesCryptWorkerProvider.js");

const provider = new JsAesCryptWorkerProvider(aesCrypt);

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

	// Handle provider initialization (kept for protocol compatibility)
	if (action === "INIT") {
		const providerType = data[1] || 'jsAesCrypt';

		if (providerType !== 'jsAesCrypt') {
			postMessage(["INIT_ERROR", "This worker only supports jsAesCrypt. Use the ES module worker for other providers."]);
			return;
		}

		postMessage(["INIT_SUCCESS", providerType]);
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

		// SECURITY: This worker only handles jsAesCrypt
		if (providerType !== undefined && providerType !== 'jsAesCrypt') {
			postMessage(["ERROR", "This worker only supports jsAesCrypt. Use the ES module worker for other providers.", action]);
			return;
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
