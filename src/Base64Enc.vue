<template>
  <v-container>

    <h1 class="text-h4 mb-4">Base64 Encoder</h1>

    <v-row no-gutters>
      <v-col>
        <v-textarea label="Plain Text" v-model="plainText" @input="updateEncodedText()" variant="outlined"
          placeholder="Enter your plain text here"></v-textarea>
      </v-col>
      <v-col cols="1" align="center">
        <v-btn flat icon @click="pasteFromClipboard" v-show="!plainText">
          <v-icon icon='mdi-content-paste' />
        </v-btn>
        <v-btn flat icon @click="plainText = ''; updateEncodedText(0)" v-show="!!plainText">
          <v-icon icon='mdi-close-octagon-outline' />
        </v-btn>
      </v-col>
    </v-row>

    <v-row no-gutters>
      <v-col>
        <v-textarea v-model="encodedText" bg-color="primary" variant="outlined" readonly
          placeholder="Base64 encoded text will appear here"></v-textarea>
      </v-col>
      <v-col cols="1" align="center">
        <v-progress-circular v-if="isLoading" color="primary" indeterminate :size="50" :width="8"></v-progress-circular>
        <v-btn v-if="!isLoading" flat icon @click="copyToClipboard" v-show="!!encodedText">
          <v-icon icon='mdi-content-copy' />
        </v-btn>
      </v-col>
    </v-row>

    <v-row no-gutters>
      <v-col cols="6">
        <v-file-input v-model="plainFile" label="Encode a file" variant="outlined" show-size></v-file-input>
      </v-col>
      <v-col cols="2" class="ma-2">
        <v-btn :disabled="plainFile.length == 0" @click="encodeFile">Encode</v-btn>
      </v-col>
    </v-row>

  </v-container>
</template>

<script>
export default {
  data() {
    return {
      plainText: '',
      encodedText: '',
      isLoading: false,
      plainFile: [],
      encodedFile: false
    };
  },
  methods: {
    updateEncodedText(timeout = 350) {
      this.isLoading = true;
      clearTimeout(this.updateTimeout);
      this.updateTimeout = setTimeout(() => {
        this.encodedText = btoa(this.plainText);
        this.isLoading = false;
      }, timeout); // Debounce time (adjust as needed)
    },
    copyToClipboard() {
      navigator.clipboard.writeText(this.encodedText)
    },
    pasteFromClipboard() {
      navigator.clipboard.readText()
        .then((clipboardText) => {
          this.plainText = clipboardText;
          this.updateEncodedText();
        });
    },
    encodeFile() {
      var reader = new FileReader();

      // Use the javascript reader object to load the contents
      // of the file in the v-model prop
      reader.readAsDataURL(this.plainFile[0])
      reader.onload = () => {
        const dataUrl = reader.result;
        // Extract base64 encoded string from data URL
        const base64String = dataUrl.split(',')[1];
        const dataLink = `data:text/plain;,${base64String}`;
        const link = document.createElement('a');
        link.href = dataLink;
        link.download = `${this.plainFile[0].name}.b64.txt`;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  },
};
</script>

<style></style>
