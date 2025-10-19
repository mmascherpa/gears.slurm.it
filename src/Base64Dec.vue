<template>
  <v-container>

    <h1 class="text-h4 mb-4">Base64 Decoder</h1>

    <v-row no-gutters>
      <v-col class="flex-grow-1">
        <v-textarea label="Encoded Text" v-model="encodedText" @input="updatePlainText()" variant="outlined"
          placeholder="Enter your b64-encoded text here"></v-textarea>
      </v-col>
      <v-col class="ml-2" cols="auto">
        <v-btn flat icon @click="pasteFromClipboard" v-show="!encodedText">
          <v-icon icon='mdi-content-paste' />
        </v-btn>
        <v-btn flat icon @click="encodedText = ''; updatePlainText(0)" v-show="!!encodedText">
          <v-icon icon='mdi-close-octagon-outline' />
        </v-btn>
      </v-col>
    </v-row>

    <v-row no-gutters>
      <v-col class="flex-grow-1">
        <v-textarea v-model="plainText" bg-color="primary" variant="outlined" readonly
          placeholder="Plain text will appear here"></v-textarea>
      </v-col>
      <v-col class="ml-2" cols="auto">
        <v-btn v-if="!isLoading && !plainText" color="transparent" flat icon></v-btn>
        <v-progress-circular v-if="isLoading" color="primary" indeterminate :size="48" :width="8"></v-progress-circular>
        <v-btn v-if="!isLoading" flat icon @click="copyToClipboard" v-show="!!plainText">
          <v-icon icon='mdi-content-copy' />
        </v-btn>
      </v-col>
    </v-row>

    <v-row no-gutters>
      <v-col cols="8" sm="6">
        <v-file-input v-model="encodedFile" label="Decode a file" variant="outlined" show-size></v-file-input>
      </v-col>
      <v-col cols="8" sm="4" class="ma-sm-2">
        <v-btn :disabled="encodedFile.length == 0" @click="decodeFile">Decode</v-btn>
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
      encodedFile: [],
      plainFile: false
    };
  },
  methods: {
    /**
     * Decodes Base64 text to plain text with debouncing
     * @param {number} timeout - Debounce delay in milliseconds (default: 350ms)
     */
    updatePlainText(timeout = 350) {
      this.isLoading = true;
      clearTimeout(this.updateTimeout);
      this.updateTimeout = setTimeout(() => {
        try {
          this.plainText = atob(this.encodedText);
        } catch (error) {
          console.error('Base64 decoding error:', error);
          this.plainText = 'Error: Invalid Base64 string. Please check your input.';
        } finally {
          this.isLoading = false;
        }
      }, timeout);
    },
    /**
     * Copies the decoded plain text to the system clipboard
     */
    copyToClipboard() {
      navigator.clipboard.writeText(this.plainText)
        .catch(error => {
          console.error('Clipboard write failed:', error);
          alert('Failed to copy to clipboard. Please copy manually.');
        });
    },
    /**
     * Pastes Base64 text from clipboard and triggers decoding
     */
    pasteFromClipboard() {
      navigator.clipboard.readText()
        .then((clipboardText) => {
          this.encodedText = clipboardText;
          this.updatePlainText();
        })
        .catch(error => {
          console.error('Clipboard read failed:', error);
          alert('Failed to read from clipboard. Please paste manually.');
        });
    },
    /**
     * Decodes a Base64 file and triggers download of the decoded result
     * Uses FileReader API to read file, decodes Base64 content
     */
    decodeFile() {
      if (!this.encodedFile || !this.encodedFile[0]) {
        alert('Please select a file first.');
        return;
      }

      const reader = new FileReader();

      reader.onerror = () => {
        console.error('File read error:', reader.error);
        alert('Failed to read file. Please try again.');
      };

      reader.onload = () => {
        try {
          const dataUrl = reader.result;
          const plainString = atob(dataUrl.split(',')[1]);
          const dataLink = `data:application/octet-stream;base64,${plainString}`;
          const link = document.createElement('a');
          link.href = dataLink;
          link.download = this.encodedFile[0].name.replace('.b64.txt', '');
          link.style.display = 'none';

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
          console.error('File decoding error:', error);
          alert('Failed to decode file. Please ensure it contains valid Base64 data.');
        }
      };

      reader.readAsDataURL(this.encodedFile[0]);
    }
  },
};
</script>

<style></style>
