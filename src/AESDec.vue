<template>
<v-container>
<h1 class="text-h4 mb-4">AES File Decryption</h1>

<v-row no-gutters>
  <v-col cols="6">
    <v-text-field
        v-model="password"
        label="Password"
        type="password"
        variant="outlined"
        placeholder="Enter encryption password"
    ></v-text-field>
  </v-col>
</v-row>

<v-row no-gutters>
    <v-col cols="6">
      <v-file-input
            v-model="file"
            label="Select file to dencrypt"
            variant="outlined"
            show-size
            :disabled="!isPasswordPopulated"
      ></v-file-input>
    </v-col>

    <v-col cols="2" class="ma-2">
        <v-btn
            :disabled="!isPasswordPopulated || !isFilePopulated"
            @click="decryptFile"
        >
            <v-icon left>mdi-lock-open</v-icon>
            Decrypt
        </v-btn>
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

<v-card v-if="isOutputPopulated" variant="tonal">
    <v-card-title>
      <v-spacer></v-spacer>
          <v-icon
            @click="clearOutputs"
            color="primary-darken-1"
            style="cursor: pointer;"
          >
            mdi-close
          </v-icon>

    </v-card-title>

    <v-card-text>

<v-row v-if="plainText" no-gutters> 
        <v-col>
          <v-textarea
              v-model="plainText"
              bg-color="primary"
              variant="outlined"
              readonly
              placeholder="Decoded text"
          ></v-textarea>
        </v-col>
</v-row>

<v-row v-if="csvData.length" no-gutters>
    <v-col>
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
            csvData: [],
            csvHeaders: [],
            error: '',
            searchQuery: ''
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
            return !!this.plainText || !!this.csvHeaders.length>0 || !!this.csvData.length>0;
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
            this.clearOutputs();
            this.clearInputs();
            this.clearError();
        },
        clearOutputs() {
            this.plainText = '';
            this.csvData = [];
            this.csvHeaders = [];
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
        parseCSV(data) {
            const text = new TextDecoder().decode(data);
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
  