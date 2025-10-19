/**
 * Web Worker for AES Encryption/Decryption
 * Runs crypto operations on background thread to avoid blocking main UI
 *
 * Message Protocol:
 * - Incoming: [action, file, password, fileName]
 *   - action: "ENCRYPT" | "DECRYPT"
 *   - file: File/Blob object
 *   - password: Encryption/decryption password
 *   - fileName: Original filename
 *
 * - Outgoing: [action, result, fileName]
 *   - action: "ENCRYPT" | "DECRYPT" | "ERROR"
 *   - result: Encrypted/decrypted blob or error message
 *   - fileName: Output filename (with .aes extension for encryption)
 */

let cdnPath = "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/";
let libPath = "/libs/";

// Load required crypto libraries
self.importScripts(
	cdnPath + "core.min.js",
	cdnPath + "enc-utf16.min.js",
	libPath + "enc-uint8array.min.js",
	libPath + "aes_crypt.min.js"
);

/**
 * Handles incoming messages from main thread
 * @param {MessageEvent} e - Message event containing encryption/decryption request
 */
onmessage = function(e) {
	let data = e.data;
	let action = data[0];

	if( action === "ENCRYPT" || action === "DECRYPT" ) {
		let aes = aesCrypt;

		let file = data[1];
		let fileName = data[3];
		let passw = data[2];

		if( action === "ENCRYPT" ) {
				aes.encrypt(file, passw).then((r) => {
					postMessage(["ENCRYPT", r, fileName + ".aes"]);
				}).catch((error) => {
					postMessage(["ERROR", "Encryption failed: " + error.message]);
				});
		} else {
			aes.decrypt(file, passw).then((r) => {
				postMessage(["DECRYPT", r, fileName.split('.').slice(0, -1).join('.')]);
			}).catch((error) => {
				postMessage(["ERROR", "Decryption failed: " + error.message]);
			});
		}
	}
}