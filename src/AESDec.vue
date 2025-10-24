<template>
    <div>
        <div class="d-flex align-center mb-6">
            <v-avatar color="primary-darken-1" size="48" class="mr-4">
                <v-icon icon="mdi-lock-open" size="28" color="white"></v-icon>
            </v-avatar>
            <div>
                <h1 class="text-h4 font-weight-bold">AES Decryption</h1>
                <p class="text-body-2 text-medium-emphasis mb-0">Decrypt password-protected AES encrypted files</p>
            </div>
        </div>

        <form @submit.prevent="decryptFile">
            <!-- Hidden username field for browser accessibility compliance -->
            <input type="text" name="username" autocomplete="username" style="display: none;" aria-hidden="true">

            <v-card class="mb-4" elevation="2">
                <v-card-title class="bg-surface-variant">
                    <v-icon icon="mdi-key" class="mr-2"></v-icon>
                    Enter Password
                </v-card-title>
                <v-card-text class="pa-4">
                    <v-row>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                v-model="password"
                                name="password"
                                label="Decryption Password"
                                type="password"
                                variant="outlined"
                                placeholder="Enter the password used for encryption"
                                prepend-inner-icon="mdi-lock-open"
                                autocomplete="current-password"
                                hide-details>
                            </v-text-field>
                            <PasswordStrengthIndicator
                                :password="password"
                                :show-requirements="false"
                                :show-feedback="false" />
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <v-card class="mb-4" elevation="2">
                <v-card-title class="bg-surface-variant">
                    <v-icon icon="mdi-file-lock" class="mr-2"></v-icon>
                    Encrypted File
                </v-card-title>
                <v-card-text class="pa-4">
                    <v-row align="center">
                        <v-col cols="12" sm="8">
                            <v-file-input
                                v-model="file"
                                label="Select encrypted file (.aes)"
                                variant="outlined"
                                show-size
                                prepend-icon=""
                                prepend-inner-icon="mdi-paperclip"
                                accept=".aes"
                                hide-details>
                            </v-file-input>
                        </v-col>
                        <v-col cols="12" sm="4">
                            <v-btn
                                type="submit"
                                :disabled="!isPasswordPopulated || !isFilePopulated"
                                color="primary-darken-1"
                                size="large"
                                block>
                                <v-icon start>mdi-lock-open</v-icon>
                                Decrypt
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </form>

        <!-- Error Card (inline with results) -->
        <v-card v-if="error" variant="tonal" color="error" elevation="2" class="mb-4">
            <v-card-text class="pa-4">
                <div class="d-flex align-start">
                    <v-icon icon="mdi-alert-circle" size="32" color="error" class="mr-4 mt-1"></v-icon>
                    <div class="flex-grow-1">
                        <div class="text-h6 font-weight-medium mb-2">Decryption Failed</div>
                        <div class="text-body-1">{{ error }}</div>
                    </div>
                    <v-btn icon size="small" variant="text" @click="error = ''" class="ml-2">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </div>
            </v-card-text>
        </v-card>

        <v-card v-if="plainText" variant="tonal" elevation="2" class="mb-4">
            <v-card-title class="d-flex align-center">
                <v-icon icon="mdi-text" class="mr-2"></v-icon>
                Decrypted Text
                <v-spacer></v-spacer>
                <v-btn
                    v-if="decryptedFileName"
                    variant="text"
                    color="primary"
                    @click="downloadDecryptedText"
                    class="mr-2">
                    <v-icon start>mdi-download</v-icon>
                    Download
                </v-btn>
                <v-btn icon size="small" variant="text" @click="clearOutputs">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>
            <v-card-text class="pa-4">
                <v-textarea
                    v-model="plainText"
                    variant="outlined"
                    rows="10"
                    readonly
                    bg-color="grey-lighten-4"
                    placeholder="Decrypted text"
                    hide-details>
                </v-textarea>
            </v-card-text>
        </v-card>

        <v-card v-if="tableData.length" variant="tonal" elevation="2" class="mb-4">
            <v-card-title class="d-flex align-center">
                <v-icon icon="mdi-table" class="mr-2"></v-icon>
                CSV Preview
                <v-spacer></v-spacer>
                <v-btn
                    v-if="decryptedFileName"
                    variant="text"
                    color="primary"
                    @click="downloadDecryptedText"
                    class="mr-2">
                    <v-icon start>mdi-download</v-icon>
                    Download
                </v-btn>
                <v-btn icon size="small" variant="text" @click="clearOutputs">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>
            <v-card-text class="pa-4">
                <v-row class="mb-4">
                    <v-col cols="12" md="4">
                        <v-text-field
                            v-model="search"
                            label="Search"
                            prepend-inner-icon="mdi-magnify"
                            variant="outlined"
                            hide-details
                            single-line
                            density="comfortable">
                        </v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-data-table
                            :headers="tableHeaders"
                            :items="tableData"
                            :search="search"
                            density="comfortable">
                            <template #no-data>
                                <div class="text-center pa-4">
                                    <v-icon size="48" color="grey">mdi-table-off</v-icon>
                                    <p class="text-body-2 text-medium-emphasis mt-2">No results to display</p>
                                </div>
                            </template>
                        </v-data-table>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <v-card v-if="decryptedFileName && !plainText && !tableData.length" variant="tonal" color="success" elevation="2">
            <v-card-text class="d-flex align-center pa-4">
                <v-icon icon="mdi-check-circle" size="32" class="mr-4"></v-icon>
                <div class="flex-grow-1">
                    <div class="text-subtitle-1 font-weight-medium">File Decrypted Successfully</div>
                    <div class="text-body-2">{{ decryptedFileName }}</div>
                </div>
                <v-btn
                    variant="elevated"
                    color="white"
                    @click="downloadDecryptedText"
                    class="mr-2">
                    <v-icon start>mdi-download</v-icon>
                    Download Again
                </v-btn>
                <v-btn icon size="small" variant="text" @click="clearOutputs">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-text>
        </v-card>

        <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" location="top">
            {{ snackbarText }}
        </v-snackbar>

    </div>
</template>

<script>
import { downloadFile } from '@/utils/fileDownload';
import { parseCSV } from '@/utils/csvParser';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator.vue';

export default {
    components: {
        PasswordStrengthIndicator
    },
    data() {
        return {
            password: '',
            plainText: '',
            file: null,
            worker: null,
            tableHeaders: [],
            tableData: [],
            error: '',
            search: '',
            snackbar: false,
            snackbarText: '',
            snackbarColor: 'success',
            decryptedData: null, // Store decrypted data for download
            decryptedFileName: '', // Store filename for download
            // Maximum file size for preview (8MB)
            maxPreviewSize: 8 * 1024 * 1024,
            // Flag to prevent watchers from clearing outputs during decryption
            isDecrypting: false
        };
    },
    computed: {
        isPasswordPopulated() {
            return this.password.trim() !== '';
        },
        isFilePopulated() {
            return !!this.file && !!this.file[0];
        },
        isOutputPopulated() {
            return !!this.plainText || !!this.tableHeaders.length > 0 || !!this.tableData.length > 0;
        }
    },
    watch: {
        // Clear outputs when user selects a new file
        file() {
            // Don't clear if we're in the middle of decrypting
            if (!this.isDecrypting && (this.isOutputPopulated || this.decryptedFileName)) {
                this.clearOutputs();
            }
        },
        // Clear outputs when user changes the password
        password() {
            // Don't clear if we're in the middle of decrypting
            if (!this.isDecrypting && (this.isOutputPopulated || this.decryptedFileName)) {
                this.clearOutputs();
            }
        }
    },
    methods: {
        /**
         * Shows a snackbar notification
         * @param {string} text - Message to display
         * @param {string} color - Snackbar color (success, error, warning, info)
         */
        showSnackbar(text, color = 'success') {
            this.snackbarText = text;
            this.snackbarColor = color;
            this.snackbar = true;
        },
        clearAll() {
            this.clearOutputs();
            this.clearInputs();
            this.clearError();
        },
        clearOutputs() {
            this.plainText = '';
            this.tableData = [];
            this.tableHeaders = [];
            this.search = '';
            this.decryptedData = null;
            this.decryptedFileName = '';
        },
        clearInputs() {
            this.password = '';
            this.file = null;
        },
        clearError() {
            this.error = '';
        },
        setupWorker() {
            if (this.worker) this.worker.terminate();
            this.worker = new Worker('/worker.js');
            this.worker.onmessage = this.handleWorkerResponse;
        },
        /**
         * Checks if a file should be previewed as text instead of auto-downloaded
         * @param {string} fileName - Name of the file
         * @param {Uint8Array} data - File data
         * @returns {boolean} - True if file should be previewed
         */
        shouldPreviewAsText(fileName, data) {
            // List of text file extensions to preview
            const textExtensions = ['.txt', '.md', '.json', '.xml', '.html', '.css', '.js', '.log', '.yaml', '.yml'];
            const hasTextExtension = textExtensions.some(ext => fileName.toLowerCase().endsWith(ext));

            // Check if file size is within preview limit
            const withinSizeLimit = data.byteLength <= this.maxPreviewSize;

            return hasTextExtension && withinSizeLimit;
        },
        /**
         * Downloads the decrypted text file
         */
        downloadDecryptedText() {
            if (this.decryptedData && this.decryptedFileName) {
                downloadFile(this.decryptedData, this.decryptedFileName);
                this.showSnackbar('✓ File downloaded successfully!', 'success');
            }
        },
        handleWorkerResponse(event) {
            const [action, data, fileName] = event.data;

            if (action === "ERROR") {
                // Display the error in the alert box
                this.error = data;
                this.isDecrypting = false;

                // Show a more concise snackbar notification
                let snackbarMsg = 'Decryption failed';
                if (data.includes("Incorrect password")) {
                    snackbarMsg = '❌ Wrong password';
                } else if (data.includes("corrupted")) {
                    snackbarMsg = '❌ File corrupted';
                } else if (data.includes("not a valid AES")) {
                    snackbarMsg = '❌ Invalid file format';
                }

                this.showSnackbar(snackbarMsg, 'error');
                return;
            }

            // Set flag to prevent watchers from clearing outputs
            this.isDecrypting = true;

            // Always store decrypted data for download button
            this.decryptedData = data;
            this.decryptedFileName = fileName;

            // Handle CSV files - preview if within size limit
            if (fileName.endsWith(".csv")) {
                const withinSizeLimit = data.byteLength <= this.maxPreviewSize;

                if (withinSizeLimit) {
                    // Show preview
                    const parsedCSV = parseCSV(data);
                    this.tableHeaders = parsedCSV.headers;
                    this.tableData = parsedCSV.data;

                    const sizeKB = (data.byteLength / 1024).toFixed(2);
                    this.showSnackbar(`✓ CSV file decrypted (${sizeKB} KB) - Preview shown`, 'success');
                } else {
                    // Too large, auto-download
                    downloadFile(data, fileName);
                    const sizeMB = (data.byteLength / (1024 * 1024)).toFixed(2);
                    this.showSnackbar(`✓ CSV file decrypted (${sizeMB} MB) - Too large to preview, downloaded`, 'info');
                }

                this.clearInputs();
                // Reset flag after Vue updates to prevent watchers from clearing outputs
                this.$nextTick(() => {
                    this.isDecrypting = false;
                });
                return;
            }

            // Handle text files - preview if within size limit
            if (this.shouldPreviewAsText(fileName, data)) {
                const decodedText = new TextDecoder().decode(data);
                this.plainText = decodedText;

                const sizeKB = (data.byteLength / 1024).toFixed(2);
                this.showSnackbar(`✓ Text file decrypted (${sizeKB} KB) - Preview shown`, 'success');
                this.clearInputs();
                // Reset flag after Vue updates to prevent watchers from clearing outputs
                this.$nextTick(() => {
                    this.isDecrypting = false;
                });
                return;
            }

            // For all other files or text files exceeding size limit, auto-download
            downloadFile(data, fileName);

            if (data.byteLength > this.maxPreviewSize) {
                const sizeMB = (data.byteLength / (1024 * 1024)).toFixed(2);
                this.showSnackbar(`✓ File decrypted (${sizeMB} MB) - Too large to preview, downloaded`, 'info');
            } else {
                this.showSnackbar('✓ File decrypted and downloaded!', 'success');
            }

            this.clearInputs();
            // Reset flag after Vue updates to prevent watchers from clearing outputs
            this.$nextTick(() => {
                this.isDecrypting = false;
            });
        },
        decryptFile() {
            if (!this.isPasswordPopulated || !this.isFilePopulated) return alert("Invalid inputs");;
            this.error = ''; // Clear any previous errors
            this.setupWorker();
            this.worker.postMessage(["DECRYPT", this.file[0], this.password, this.file[0].name]);
        }
    }
};
</script>
