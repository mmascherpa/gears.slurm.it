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

        <v-alert v-if="error" type="error" variant="tonal" closable @click:close="error = ''" class="mb-4">
            {{ error }}
        </v-alert>

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
                            label="Decryption Password"
                            type="password"
                            variant="outlined"
                            placeholder="Enter the password used for encryption"
                            prepend-inner-icon="mdi-lock-open"
                            hide-details>
                        </v-text-field>
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
                            :disabled="!isPasswordPopulated || !isFilePopulated"
                            @click="decryptFile"
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

        <v-card v-if="plainText" variant="tonal" elevation="2" class="mb-4">
            <v-card-title class="d-flex align-center">
                <v-icon icon="mdi-text" class="mr-2"></v-icon>
                Decrypted Text
                <v-spacer></v-spacer>
                <v-btn icon size="small" variant="text" @click="clearOutputs">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>
            <v-card-text class="pa-4">
                <v-textarea
                    v-model="plainText"
                    variant="outlined"
                    rows="6"
                    readonly
                    bg-color="grey-lighten-4"
                    placeholder="Decrypted text"
                    hide-details>
                </v-textarea>
            </v-card-text>
        </v-card>

        <v-card v-if="tableData.length" variant="tonal" elevation="2">
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

export default {
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
            snackbarColor: 'success'
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
        handleWorkerResponse(event) {
            const [action, data, fileName] = event.data;

            if (action === "ERROR") {
                // Display the error in the alert box
                this.error = data;

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

            if (fileName.endsWith(".csv")) {
                const parsedCSV = parseCSV(data);
                this.tableHeaders = parsedCSV.headers;
                this.tableData = parsedCSV.data;
            } else if (fileName.endsWith(".txt")) {
                this.plainText = new TextDecoder().decode(data);
            }

            downloadFile(data, fileName);
            this.showSnackbar('✓ File decrypted successfully!', 'success');
            this.clearInputs();
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
