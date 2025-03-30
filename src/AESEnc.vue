<template>
<v-container>
    <h1 class="text-h4 mb-4">AES File Encryption</h1>

    <v-row no-gutters>
        <v-col>
            <v-text-field
                v-model="password"
                label="Password"
                type="password"
                variant="outlined"
                placeholder="Enter encryption password"
            ></v-text-field>
        </v-col>
        <v-col cols="1" align="center">
            <v-btn
                flat
                icon 
                @click="clearAll"
                v-show="password || file"
            >
                <v-icon icon='mdi-close-octagon-outline' />
            </v-btn>
        </v-col>
    </v-row>

    <v-row no-gutters>
        <v-col cols="6">
            <v-file-input
                v-model="file"
                label="Select file to encrypt/decrypt"
                variant="outlined"
                show-size
                @change="handleFileUpload"
            ></v-file-input>
        </v-col>
        <v-col cols="2" class="ma-2">
            <v-btn
                :disabled="!isFormValid"
                @click="encryptFile"
                color="primary"
            >Encrypt</v-btn>
        </v-col>
        <v-col cols="2" class="ma-2">
            <v-btn
                :disabled="!isFormValid"
                @click="decryptFile"
                color="primary"
            >Decrypt</v-btn>
        </v-col>
    </v-row>

    <v-row v-if="error" no-gutters>
        <v-col>
            <v-alert
                type="error"
                variant="tonal"
                closable
                @click:close="error = ''"
            >
                {{ error }}
            </v-alert>
        </v-col>
    </v-row>

    <v-row v-if="csvData.length" no-gutters>
        <v-col>
            <h2 class="text-h5 mb-4">CSV Preview</h2>
            <v-row no-gutters>
                <v-col cols="4">
                    <v-text-field
                        v-model="searchQuery"
                        label="Search"
                        variant="outlined"
                        prepend-inner-icon="mdi-magnify"
                        class="mb-4"
                        hide-details
                    ></v-text-field>
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
            file: null,
            worker: null,
            csvData: [],
            csvHeaders: [],
            error: '',
            searchQuery: ''
        };
    },
    computed: {
        isFormValid() {
            return this.password.trim() !== '' && this.file && this.file.length > 0;
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
        clearAll() {
            this.password = '';
            this.file = null;
            this.csvData = [];
            this.csvHeaders = [];
            this.error = '';
        },
        handleFileUpload(files) {
            if (files && files.length > 0) {
                const selectedFile = files[0];
                if (selectedFile.type === "text/csv") {
                    this.previewCSV();
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
            if (fileName.endsWith(".csv")) {
                this.displayDecryptedCSV(data);
            }
            // Clear the form fields after successful operation
            this.password = '';
            this.file = null;
            this.error = '';
        },
        encryptFile() {
            if (!this.file || !this.password) return alert("File and password required");
            this.error = ''; // Clear any previous errors
            this.setupWorker();
            this.worker.postMessage(["ENCRYPT", this.file[0], this.password, this.file[0].name]);
        },
        decryptFile() {
            if (!this.file || !this.password) return alert("File and password required");
            this.error = ''; // Clear any previous errors
            this.setupWorker();
            this.worker.postMessage(["DECRYPT", this.file[0], this.password, this.file[0].name]);
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
        previewCSV() {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                this.parseCSV(text);
            };
            reader.readAsText(this.file[0]);
        },
        displayDecryptedCSV(data) {
            const text = new TextDecoder().decode(data);
            this.parseCSV(text);
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
  