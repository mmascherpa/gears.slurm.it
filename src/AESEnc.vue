<template>
    <div class="aes-file-enc">
      <h2>AES File Encryption</h2>
      <input type="password" v-model="password" placeholder="Enter password" />
      <input type="file" @change="handleFileUpload" />
      <button @click="encryptFile">Encrypt File</button>
      <button @click="decryptFile">Decrypt File</button>
      
      <div v-if="csvData.length">
        <h3>CSV Preview</h3>
        <table border="1">
          <thead>
            <tr>
              <th v-for="(header, index) in csvHeaders" :key="index">{{ header }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in csvData" :key="rowIndex">
              <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        password: '',
        file: null,
        worker: null,
        csvData: [],
        csvHeaders: []
      };
    },
    methods: {
      handleFileUpload(event) {
        this.file = event.target.files[0];
        if (this.file && this.file.type === "text/csv") {
          this.previewCSV();
        }
      },
      setupWorker() {
        if (this.worker) this.worker.terminate();
        this.worker = new Worker("/src/worker.js");
        this.worker.onmessage = this.handleWorkerResponse;
      },
      handleWorkerResponse(event) {
        const [action, data, fileName] = event.data;
        this.downloadFile(data, fileName);
        if (fileName.endsWith(".csv")) {
          this.displayDecryptedCSV(data);
        }
      },
      encryptFile() {
        if (!this.file || !this.password) return alert("File and password required");
        this.setupWorker();
        this.worker.postMessage(["ENCRYPT", this.file, this.password, this.file.name]);
      },
      decryptFile() {
        if (!this.file || !this.password) return alert("File and password required");
        this.setupWorker();
        this.worker.postMessage(["DECRYPT", this.file, this.password, this.file.name]);
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
        reader.readAsText(this.file);
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
  
  <style>
  .aes-file-enc {
    padding: 20px;
    border: 1px solid #ccc;
    display: inline-block;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }
  th, td {
    border: 1px solid black;
    padding: 5px;
  }
  </style>
  