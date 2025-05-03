<template>
    <v-container>

        <h1 class="text-h4 mb-4">AES File Encryption</h1>

        <v-row no-gutters>
            <v-col class="mr-2">
                <v-text-field v-model="password" label="Password" type="password" variant="outlined"
                    placeholder="Enter encryption password"></v-text-field>
            </v-col>
            <v-col class="ml-2">
                <v-text-field v-model="passwordConfirm" label="Confirm password" type="password" variant="outlined"
                    placeholder="Confirm encryption password"></v-text-field>
            </v-col>
        </v-row>

        <v-row no-gutters>
            <v-col>
                <v-textarea label="Plain Text" v-model="plainText" :disabled="!isPasswordConfirmed || isFilePopulated"
                    variant="outlined" placeholder="Enter your plain text here"></v-textarea>
            </v-col>
            <v-col cols="1" align="center">
                <v-btn flat icon @click="pasteFromClipboard" :disabled="!isPasswordConfirmed" v-show="!plainText">
                    <v-icon icon='mdi-content-paste' />
                </v-btn>
                <v-btn flat icon @click="plainText = ''" v-show="!!plainText">
                    <v-icon icon='mdi-close-octagon-outline' />
                </v-btn>
            </v-col>
        </v-row>

        <v-row no-gutters>
            <v-col cols="6">
                <v-file-input v-model="file" label="Select file to encrypt" variant="outlined" show-size
                    @change="handleFileUpload" :disabled="!isPasswordConfirmed || isPlaintextPopulated"></v-file-input>
            </v-col>

            <v-col cols="2" class="ma-2">
                <v-btn :disabled="!isPasswordConfirmed || !(isFilePopulated || isPlaintextPopulated)"
                    @click="encryptFile">
                    <v-icon left>mdi-lock</v-icon>
                    Encrypt
                </v-btn>
            </v-col>
        </v-row>

        <v-row v-if="error" no-gutters>
            <v-col>
                <v-alert type="error" variant="tonal" closable @click:close="error = ''">
                    {{ error }}
                </v-alert>
            </v-col>
        </v-row>

        <v-row v-if="csvData.length" no-gutters>
            <v-col>
                <h2 class="text-h5 mb-4">CSV Preview</h2>
                <v-row no-gutters>
                    <v-col cols="4">
                        <v-text-field v-model="searchQuery" label="Search" variant="outlined"
                            prepend-inner-icon="mdi-magnify" class="mb-4" hide-details></v-text-field>
                    </v-col>
                </v-row>
                <v-table density="compact" class="csv-table">
                    <thead>
                        <tr>
                            <th v-for="(header, index) in csvHeaders" :key="index" class="text-left">{{ header }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, rowIndex) in filteredCsvData" :key="rowIndex">
                            <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
                        </tr>
                    </tbody>
                </v-table>
            </v-col>
        </v-row>
    </v-container>
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
            csvData: [],
            csvHeaders: [],
            error: '',
            searchQuery: ''
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
        filteredCsvData() {
            if (!this.searchQuery) return this.csvData;
            const query = this.searchQuery.toLowerCase();
            return this.csvData.filter(row =>
                row.some(cell => cell.toLowerCase().includes(query))
            );
        }
    },
    methods: {
        pasteFromClipboard() {
            navigator.clipboard.readText()
                .then((clipboardText) => {
                    this.plainText = clipboardText;
                });
        },
        clearAll() {
            this.password = '';
            this.passwordConfirm = '';
            this.plainText = '';
            this.file = null;
            this.csvData = [];
            this.csvHeaders = [];
            this.error = '';
        },
        handleFileUpload() {
            let files = this.file
            if (files && files.length > 0) {
                const selectedFile = files[0];
                if (selectedFile.type === "text/csv") {
                    this.decodeCSV(this.file[0]);
                }
            }
            this.error = ''; // Clear any previous errors when a new file is selected
        },
        setupWorker() {
            if (this.worker) this.worker.terminate();
            this.worker = new Worker('/worker.js');
            this.worker.onmessage = this.handleWorkerResponse;
        },
        handleWorkerResponse(event) {
            const [action, data, fileName] = event.data;

            if (action === "ERROR") {
                this.error = data;
                return;
            }

            this.downloadFile(data, fileName);
            this.clearAll();
        },
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
        decodeCSV() {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                this.parseCSV(text);
            };
            reader.readAsText(this.file[0]);
        },
        parseCSV(text) {
            const rows = text.split("\n").map(row => row.split(","));
            this.csvHeaders = rows[0] || [];
            this.csvData = rows.slice(1);
        }
    }
};
</script>

<style scoped>
.v-table {
    background-color: var(--v-surface-variant);
    border-radius: 4px;
    overflow: hidden;
}

.csv-table {
    max-height: 500px;
    overflow-y: auto;
}

.csv-table :deep(th) {
    background-color: var(--v-surface-variant);
    position: sticky;
    top: 0;
    z-index: 1;
}

.csv-table :deep(td) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
}
</style>