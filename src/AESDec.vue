<template>
    <v-container>
        <h1 class="text-h4 mb-4">AES File Decryption</h1>

        <v-row no-gutters>
            <v-col cols="6">
                <v-text-field v-model="password" label="Password" type="password" variant="outlined"
                    placeholder="Enter encryption password"></v-text-field>
            </v-col>
        </v-row>

        <v-row no-gutters>
            <v-col cols="6">
                <v-file-input v-model="file" label="Select file to dencrypt" variant="outlined" show-size
                    :disabled="!isPasswordPopulated"></v-file-input>
            </v-col>

            <v-col cols="2" class="ma-2">
                <v-btn :disabled="!isPasswordPopulated || !isFilePopulated" @click="decryptFile">
                    <v-icon left>mdi-lock-open</v-icon>
                    Decrypt
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

        <v-card v-if="isOutputPopulated" variant="tonal">
            <v-card-title>
                <v-spacer></v-spacer>
                <v-icon @click="clearOutputs" color="primary-darken-1" style="cursor: pointer;">
                    mdi-close
                </v-icon>

            </v-card-title>

            <v-card-text>

                <v-row v-if="plainText" no-gutters>
                    <v-col>
                        <v-textarea v-model="plainText" bg-color="primary" variant="outlined" readonly
                            placeholder="Decoded text"></v-textarea>
                    </v-col>
                </v-row>

                <v-row v-if="tableData.length" no-gutters>
                    <v-col cols="4">
                        <v-text-field v-model="search" label="Search" prepend-inner-icon="mdi-magnify"
                            variant="outlined" hide-details single-line></v-text-field>
                    </v-col>
                </v-row>
                <v-row v-if="tableData.length" no-gutters>
                    <v-col>
                        <v-data-table :headers="tableHeaders" :items="tableData" :search="search" dense>
                            <template #no-data>
                                No results to display.
                            </template>
                        </v-data-table>
                    </v-col>
                </v-row>

            </v-card-text>
        </v-card>

    </v-container>
</template>

<script>

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
            search: ''
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
                this.error = data;
                return;
            }

            if (fileName.endsWith(".csv")) {
                this.parseCSV(data);
            } else if (fileName.endsWith(".txt")) {
                this.plainText = new TextDecoder().decode(data);
            }

            this.downloadFile(data, fileName);
            this.clearInputs();
        },
        decryptFile() {
            if (!this.isPasswordPopulated || !this.isFilePopulated) return alert("Invalid inputs");;
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
        parseCSV(inputData) {
            const text = new TextDecoder().decode(inputData);
            const rows = text.split("\n").map(row => row.split(","));

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
            return { headers, data};
        },

        capitalize(word) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }
    }
};
</script>

