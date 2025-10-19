<template>
  <v-container>

    <h1 class="text-h4 mb-4">Base64 Encoder</h1>

    <v-row no-gutters>
      <v-col class="flex-grow-1">
        <v-textarea label="Plain Text" v-model="plainText" @input="updateEncodedText()" variant="outlined"
          placeholder="Enter your plain text here"></v-textarea>
      </v-col>
      <v-col class="ml-2" cols="auto">
        <v-btn flat icon @click="pasteFromClipboard" v-show="!plainText">
          <v-icon icon='mdi-content-paste' />
        </v-btn>
        <v-btn flat icon @click="plainText = ''; updateEncodedText(0)" v-show="!!plainText">
          <v-icon icon='mdi-close-octagon-outline' />
        </v-btn>
      </v-col>
    </v-row>

    <v-row no-gutters>
      <v-col class="flex-grow-1">
        <v-textarea v-model="encodedText" bg-color="primary" variant="outlined" readonly
          placeholder="Base64 encoded text will appear here"></v-textarea>
      </v-col>
      <v-col class="ml-2" cols="auto">
        <v-btn v-if="!isLoading && !plainText" color="transparent" flat icon></v-btn>
        <v-progress-circular v-if="isLoading" color="primary" indeterminate :size="48" :width="8"></v-progress-circular>
        <v-btn v-if="!isLoading" flat icon @click="copyToClipboard" v-show="!!encodedText">
          <v-icon icon='mdi-content-copy' />
        </v-btn>
      </v-col>
    </v-row>

    <v-row no-gutters>
      <v-col cols="8" sm="6">
        <v-file-input v-model="plainFile" label="Encode a file" variant="outlined" show-size></v-file-input>
      </v-col>
      <v-col cols="8" sm="4" class="ma-sm-2">
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
    /**
     * Encodes plain text to Base64 with debouncing to avoid excessive processing
     * @param {number} timeout - Debounce delay in milliseconds (default: 350ms)
     */
    updateEncodedText(timeout = 350) {
      this.isLoading = true;
      clearTimeout(this.updateTimeout);
      this.updateTimeout = setTimeout(() => {
        try {
          this.encodedText = btoa(this.plainText);
        } catch (error) {
          console.error('Base64 encoding error:', error);
          this.encodedText = 'Error: Unable to encode text. Please check for invalid characters.';
        } finally {
          this.isLoading = false;
        }
      }, timeout);
    },
    /**
     * Copies the Base64 encoded text to the system clipboard
     */
    copyToClipboard() {
      navigator.clipboard.writeText(this.encodedText)
        .catch(error => {
          console.error('Clipboard write failed:', error);
          alert('Failed to copy to clipboard. Please copy manually.');
        });
    },
    /**
     * Pastes text from clipboard and triggers encoding
     */
    pasteFromClipboard() {
      navigator.clipboard.readText()
        .then((clipboardText) => {
          this.plainText = clipboardText;
          this.updateEncodedText();
        })
        .catch(error => {
          console.error('Clipboard read failed:', error);
          alert('Failed to read from clipboard. Please paste manually.');
        });
    },
    /**
     * Encodes a file to Base64 and triggers download of the encoded result
     * Uses FileReader API to read file as Data URL, extracts Base64 portion
     */
    encodeFile() {
      if (!this.plainFile || !this.plainFile[0]) {
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
          const base64String = dataUrl.split(',')[1];
          const dataLink = `data:text/plain;,${base64String}`;
          const link = document.createElement('a');
          link.href = dataLink;
          link.download = `${this.plainFile[0].name}.b64.txt`;
          link.style.display = 'none';

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
          console.error('File encoding error:', error);
          alert('Failed to encode file. Please try again.');
        }
      };

      reader.readAsDataURL(this.plainFile[0]);
    }
  },
};
</script>

<style></style>
