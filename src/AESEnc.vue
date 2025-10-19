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
                <v-row align="center">
                    <v-col cols="12" sm="8">
                        <v-file-input
                            v-model="file"
                            label="Select file to encrypt"
                            variant="outlined"
                            show-size
                            @change="handleFileUpload"
                            :disabled="isPlaintextPopulated"
                            prepend-icon=""
                            prepend-inner-icon="mdi-paperclip"
                            hide-details>
                        </v-file-input>
                    </v-col>
                    <v-col cols="12" sm="4">
                        <v-btn
                            :disabled="!isPasswordConfirmed || !(isFilePopulated || isPlaintextPopulated)"
                            @click="encryptFile"
                            color="primary"
                            size="large"
                            block>
                            <v-icon start>mdi-lock</v-icon>
                            Encrypt
                        </v-btn>
                    </v-col>
                </v-row>
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

export default {
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
            snackbarColor: 'success'
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
         * Handles file upload and CSV preview
         * If the uploaded file is CSV, parses and displays it in the data table
         */
        handleFileUpload() {
            let files = this.file
            if (files && files.length > 0) {
                const selectedFile = files[0];
                if (selectedFile.type === "text/csv") {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                        const text = reader.result;
                        this.parseCSV(text)
                    };
                    reader.readAsText(selectedFile);
                }
            }
            this.error = '';
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
                this.error = data;
                this.showSnackbar('Encryption failed. ' + data, 'error');
                return;
            }

            this.downloadFile(data, fileName);
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
        downloadFile(data, name) {
            let blob = new Blob([data], { type: "application/octet-stream" });
            let a = document.createElement("a");
            document.body.appendChild(a);
            a.style.display = "none";
            let url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = name;
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        },
        parseCSV(text) {
            const rows = text.split("\n").map(row => row.split(","));
            this.csvHeaders = rows[0] || [];
            this.csvData = rows.slice(1);

            const {headers, data} = this.convertToTableData(rows[0] || [], rows.slice(1));
            this.tableHeaders = headers;
            this.tableData = data;
        },
        convertToTableData(headersArray, rowsArray) {
            // Create Vuetify-style headers
            const headers = headersArray.map(header => ({
                title: this.capitalize(header),
                key: header,
            }));

            // Map each row to an object using headersArray as keys
            const data = rowsArray.map(row => {
                const obj = {};
                headersArray.forEach((key, i) => {
                    obj[key] = row[i];
                });
                return obj;
            });
            return { headers, data };
        },

        capitalize(word) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }
    }
};
</script>
