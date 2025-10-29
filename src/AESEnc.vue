<template>
    <div>
        <div class="d-flex align-center mb-6">
            <v-avatar color="primary" size="48" class="mr-4">
                <v-icon icon="mdi-lock" size="28" color="white"></v-icon>
            </v-avatar>
            <div>
                <h1 class="text-h4 font-weight-bold">AES Encryption</h1>
                <p class="text-body-2 text-medium-emphasis mb-0">Secure your files with password-protected AES encryption</p>
            </div>
        </div>

        <v-alert v-if="error" type="error" variant="tonal" closable @click:close="error = ''" class="mb-4">
            {{ error }}
        </v-alert>

        <v-card class="mb-4" elevation="2">
            <v-card-title class="bg-surface-variant">
                <v-icon icon="mdi-key" class="mr-2"></v-icon>
                Password Protection
            </v-card-title>
            <v-card-text class="pa-4">
                <v-row>
                    <v-col cols="12" sm="6">
                        <v-text-field
                            v-model="password"
                            label="Password"
                            type="password"
                            variant="outlined"
                            placeholder="Enter encryption password"
                            prepend-inner-icon="mdi-lock"
                            hide-details>
                        </v-text-field>
                        <PasswordStrengthIndicator
                            :password="password"
                            :show-requirements="true"
                            :show-feedback="true" />
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-text-field
                            v-model="passwordConfirm"
                            label="Confirm Password"
                            type="password"
                            variant="outlined"
                            placeholder="Confirm encryption password"
                            prepend-inner-icon="mdi-lock-check"
                            :error="password && passwordConfirm && password !== passwordConfirm"
                            :success="isPasswordConfirmed"
                            hide-details>
                        </v-text-field>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <v-card class="mb-4" elevation="2">
            <v-card-title class="bg-surface-variant">
                <v-icon icon="mdi-text" class="mr-2"></v-icon>
                Text Encryption
            </v-card-title>
            <v-card-text class="pa-4">
                <v-row no-gutters>
                    <v-col class="flex-grow-1">
                        <v-textarea
                            label="Plain Text"
                            v-model="plainText"
                            :disabled="isFilePopulated"
                            variant="outlined"
                            rows="4"
                            placeholder="Enter your plain text here"
                            hide-details>
                        </v-textarea>
                    </v-col>
                    <v-col class="ml-2" cols="auto">
                        <v-tooltip text="Paste from clipboard" location="top">
                            <template v-slot:activator="{ props }">
                                <v-btn v-bind="props" flat icon @click="pasteFromClipboard" v-show="!plainText && !isFilePopulated">
                                    <v-icon icon='mdi-content-paste' />
                                </v-btn>
                            </template>
                        </v-tooltip>
                        <v-tooltip text="Clear text" location="top">
                            <template v-slot:activator="{ props }">
                                <v-btn v-bind="props" flat icon @click="plainText = ''" v-show="!!plainText">
                                    <v-icon icon='mdi-close-octagon-outline' />
                                </v-btn>
                            </template>
                        </v-tooltip>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <v-card class="mb-4" elevation="2">
            <v-card-title class="bg-surface-variant">
                <v-icon icon="mdi-file" class="mr-2"></v-icon>
                File Encryption
            </v-card-title>
            <v-card-text class="pa-4">
                <v-row>
                    <v-col cols="12" sm="8">
                        <v-file-input
                            v-model="file"
                            label="Select file to encrypt"
                            variant="outlined"
                            @change="handleFileUpload"
                            @click:clear="clearFileValidation"
                            :disabled="isPlaintextPopulated"
                            prepend-icon=""
                            prepend-inner-icon="mdi-paperclip"
                            :hint="fileSizeHint"
                            persistent-hint>
                        </v-file-input>
                    </v-col>
                    <v-col cols="12" sm="4">
                        <v-btn
                            :disabled="!isPasswordConfirmed || !(isFilePopulated || isPlaintextPopulated) || !isFileSizeValid"
                            @click="encryptFile"
                            color="primary"
                            size="large"
                            block>
                            <v-icon start>mdi-lock</v-icon>
                            Encrypt
                        </v-btn>
                    </v-col>
                </v-row>

                <!-- File Size Error Alert -->
                <v-alert
                    v-if="fileSizeError"
                    type="error"
                    variant="tonal"
                    class="mt-4"
                    density="compact"
                    closable
                    @click:close="fileSizeError = ''">
                    {{ fileSizeError }}
                </v-alert>

                <!-- File Size Warning Alert -->
                <v-alert
                    v-if="showFileSizeWarning"
                    type="warning"
                    variant="tonal"
                    class="mt-4"
                    density="compact"
                    closable
                    @click:close="showFileSizeWarning = false">
                    {{ fileSizeWarningMessage }}
                </v-alert>
            </v-card-text>
        </v-card>

        <v-card v-if="isOutputPopulated" variant="tonal" elevation="2">
            <v-card-title class="d-flex align-center">
                <v-icon icon="mdi-table" class="mr-2"></v-icon>
                CSV Preview
                <v-spacer></v-spacer>
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

        <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" location="top">
            {{ snackbarText }}
        </v-snackbar>

    </div>
</template>

<script>
import { downloadFile } from '@/utils/fileDownload';
import { parseCSV } from '@/utils/csvParser';
import { validateFileSize } from '@/utils/fileSizeValidator';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator.vue';

export default {
    components: {
        PasswordStrengthIndicator
    },
    data() {
        return {
            password: '',
            passwordConfirm: '',
            plainText: '',
            file: null,
            worker: null,
            tableHeaders: [],
            tableData: [],
            search: '',
            error: '',
            snackbar: false,
            snackbarText: '',
            snackbarColor: 'success',
            // File size validation
            isFileSizeValid: true,
            showFileSizeWarning: false,
            fileSizeWarningMessage: '',
            fileSizeError: '',
            fileSizeHint: ''
        };
    },
    computed: {
        isPasswordConfirmed() {
            return this.password.trim() !== '' && this.password == this.passwordConfirm;
        },
        isFilePopulated() {
            return !!this.file && !!this.file[0];
        },
        isPlaintextPopulated() {
            return this.plainText.trim() != '';
        },
        isOutputPopulated(){
            return !!this.tableHeaders.length > 0 || !!this.tableData.length > 0;
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
        /**
         * Pastes text from clipboard into the plainText field
         */
        pasteFromClipboard() {
            navigator.clipboard.readText()
                .then((clipboardText) => {
                    this.plainText = clipboardText;
                    this.showSnackbar('✓ Pasted from clipboard!', 'success');
                })
                .catch(() => {
                    this.showSnackbar('Failed to paste. Please try again.', 'error');
                });
        },
        /**
         * Clears all input fields (password, text, file)
         */
        clearInputs() {
            this.password = '';
            this.passwordConfirm = '';
            this.plainText = '';
            this.file = null;
        },
        /**
         * Clears all output data (table, search, errors)
         */
        clearOutputs() {
            this.tableData = [];
            this.tableHeaders = [];
            this.search = '';
            this.error = '';
        },
        /**
         * Clears both inputs and outputs
         */
        clearAll() {
            this.clearInputs();
            this.clearOutputs();
        },
        /**
         * Clears all file validation state
         */
        clearFileValidation() {
            this.isFileSizeValid = true;
            this.showFileSizeWarning = false;
            this.fileSizeWarningMessage = '';
            this.fileSizeError = '';
            this.fileSizeHint = '';
        },
        /**
         * Handles file upload and CSV preview
         * If the uploaded file is CSV, parses and displays it in the data table
         * Also validates file size
         */
        handleFileUpload() {
            // Reset validation state
            this.clearFileValidation();
            this.error = '';

            let files = this.file
            if (files && files.length > 0) {
                const selectedFile = files[0];

                // Validate file size
                const validation = validateFileSize(selectedFile);

                // Display file size
                this.fileSizeHint = `File size: ${validation.formattedSize}`;

                if (!validation.isValid) {
                    // File exceeds maximum size
                    this.isFileSizeValid = false;
                    this.fileSizeError = validation.message;
                    return;
                } else if (validation.hasWarning) {
                    // File is large but within limits
                    this.isFileSizeValid = true;
                    this.showFileSizeWarning = true;
                    this.fileSizeWarningMessage = validation.message;
                }

                // Handle CSV preview
                if (selectedFile.type === "text/csv") {
                    const reader = new FileReader()
                    reader.onload = () => {
                        const text = reader.result;
                        this.handleFileUploadCSV(text)
                    };
                    reader.readAsText(selectedFile);
                }
            }
        },
        /**
         * Initializes Web Worker for background AES encryption
         * Terminates existing worker if present to prevent memory leaks
         */
        setupWorker() {
            if (this.worker) this.worker.terminate();
            this.worker = new Worker('/worker.js');
            this.worker.onmessage = this.handleWorkerResponse;
        },
        /**
         * Handles response from Web Worker after encryption
         * @param {MessageEvent} event - Worker message containing action, data, and filename
         */
        handleWorkerResponse(event) {
            const [action, data, fileName] = event.data;

            if (action === "ERROR") {
                // Display the error in the alert box
                this.error = data;

                // Show a concise snackbar notification
                let snackbarMsg = 'Encryption failed';
                if (data.includes("Password is too long")) {
                    snackbarMsg = '❌ Password too long';
                } else if (data.includes("corrupted")) {
                    snackbarMsg = '❌ File corrupted';
                }

                this.showSnackbar(snackbarMsg, 'error');
                return;
            }

            downloadFile(data, fileName);
            this.showSnackbar('✓ File encrypted successfully!', 'success');
            this.clearAll();
        },
        /**
         * Initiates AES file encryption using Web Worker
         * Validates password confirmation and input (file or text) before proceeding
         * Sends encryption task to worker thread to avoid blocking UI
         */
        encryptFile() {
            if (!this.isPasswordConfirmed || !this.isFilePopulated && !this.isPlaintextPopulated) return alert("Invalid inputs");;
            this.error = ''; // Clear any previous errors
            this.setupWorker();
            let fileData = null
            let fileName = null
            if (this.isPlaintextPopulated) {
                fileData = new Blob([this.plainText], { type: 'text/txt' });
                fileName = 'plaintext.txt'
            } else if (this.isFilePopulated) {
                fileData = this.file[0]
                fileName = this.file[0].name
            }
            this.worker.postMessage(["ENCRYPT", fileData, this.password, fileName]);
        },
        handleFileUploadCSV(text) {
            const parsedCSV = parseCSV(text);
            this.csvHeaders = parsedCSV.headers.map(h => h.key);
            this.csvData = parsedCSV.data;
            this.tableHeaders = parsedCSV.headers;
            this.tableData = parsedCSV.data;
        }
    }
};
</script>
