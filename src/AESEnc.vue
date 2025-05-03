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
                <v-textarea label="Plain Text" v-model="plainText" :disabled="isFilePopulated"
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
                    @change="handleFileUpload" :disabled="isPlaintextPopulated"></v-file-input>
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

        <v-card v-if="isOutputPopulated" variant="tonal">
            <v-card-title>
                <v-spacer></v-spacer>
                <v-icon @click="clearOutputs" color="primary-darken-1" style="cursor: pointer;">
                    mdi-close
                </v-icon>

            </v-card-title>

            <v-card-text>

                <v-row v-if="isOutputPopulated" no-gutters>
                    <v-col cols="4">
                        <v-text-field v-model="search" label="Search" prepend-inner-icon="mdi-magnify"
                            variant="outlined" hide-details single-line></v-text-field>
                    </v-col>
                </v-row>
                <v-row v-if="isOutputPopulated" no-gutters>
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
            passwordConfirm: '',
            plainText: '',
            file: null,
            worker: null,
            tableHeaders: [],
            tableData: [],
            search: '',
            error: '',
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
        pasteFromClipboard() {
            navigator.clipboard.readText()
                .then((clipboardText) => {
                    this.plainText = clipboardText;
                });
        },
        clearInputs() {
            this.password = '';
            this.passwordConfirm = '';
            this.plainText = '';
            this.file = null;
        },
        clearOutputs() {
            this.tableData = [];
            this.tableHeaders = [];
            this.search = '';
            this.error = '';
        },
        clearAll() {
            this.clearInputs();
            this.clearOutputs();
        },
        handleFileUpload() {
            let files = this.file
            if (files && files.length > 0) {
                const selectedFile = files[0];
                if (selectedFile.type === "text/csv") {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                        const text = reader.result; // file content as string
                        this.parseCSV(text)
                    };
                    reader.readAsText(selectedFile);
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
