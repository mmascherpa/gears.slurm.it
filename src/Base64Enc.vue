<template>
  <div>
    <div class="d-flex align-center mb-6">
      <v-avatar color="secondary" size="48" class="mr-4">
        <v-icon icon="mdi-arrow-down-bold-box" size="28" color="white"></v-icon>
      </v-avatar>
      <div>
        <h1 class="text-h4 font-weight-bold">Base64 Encoder</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">Convert text or files to Base64 format</p>
      </div>
    </div>

    <v-card class="mb-4" elevation="2">
      <v-card-title class="bg-surface-variant">
        <v-icon icon="mdi-text" class="mr-2"></v-icon>
        Text Encoding
      </v-card-title>
      <v-card-text class="pa-4">
        <v-row no-gutters class="mb-4">
          <v-col class="flex-grow-1">
            <v-textarea
              label="Plain Text"
              v-model="plainText"
              @input="updateEncodedText()"
              variant="outlined"
              rows="4"
              placeholder="Enter your plain text here"
              hide-details>
            </v-textarea>
          </v-col>
          <v-col class="ml-2" cols="auto">
            <v-tooltip text="Paste from clipboard" location="top">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" flat icon @click="pasteFromClipboard" v-show="!plainText">
                  <v-icon icon='mdi-content-paste' />
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip text="Clear text" location="top">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" flat icon @click="plainText = ''; updateEncodedText(0)" v-show="!!plainText">
                  <v-icon icon='mdi-close-octagon-outline' />
                </v-btn>
              </template>
            </v-tooltip>
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <v-row no-gutters>
          <v-col class="flex-grow-1">
            <v-textarea
              v-model="encodedText"
              label="Base64 Encoded Output"
              variant="outlined"
              rows="4"
              readonly
              bg-color="grey-lighten-4"
              placeholder="Base64 encoded text will appear here"
              class="monospace-output"
              hide-details>
            </v-textarea>
          </v-col>
          <v-col class="ml-2" cols="auto">
            <v-btn v-if="!isLoading && !plainText" color="transparent" flat icon></v-btn>
            <v-progress-circular v-if="isLoading" color="primary" indeterminate :size="48" :width="6"></v-progress-circular>
            <v-tooltip text="Copy to clipboard" location="top">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" v-if="!isLoading" flat icon @click="copyToClipboard" v-show="!!encodedText">
                  <v-icon icon='mdi-content-copy' />
                </v-btn>
              </template>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card elevation="2">
      <v-card-title class="bg-surface-variant">
        <v-icon icon="mdi-file" class="mr-2"></v-icon>
        File Encoding
      </v-card-title>
      <v-card-text class="pa-4">
        <v-row align="center">
          <v-col cols="12" sm="8">
            <v-file-input
              v-model="plainFile"
              label="Select a file to encode"
              variant="outlined"
              show-size
              prepend-icon=""
              prepend-inner-icon="mdi-paperclip"
              hide-details>
            </v-file-input>
          </v-col>
          <v-col cols="12" sm="4">
            <v-btn
              :disabled="plainFile.length == 0"
              @click="encodeFile"
              color="primary"
              size="large"
              block>
              <v-icon start>mdi-arrow-down-bold-box</v-icon>
              Encode File
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Success/Error Snackbar -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="3000"
      location="top">
      {{ snackbarText }}
    </v-snackbar>

  </div>
</template>

<script>
export default {
  data() {
    return {
      plainText: '',
      encodedText: '',
      isLoading: false,
      plainFile: [],
      encodedFile: false,
      snackbar: false,
      snackbarText: '',
      snackbarColor: 'success'
    };
  },
  methods: {
    showSnackbar(text, color = 'success') {
      this.snackbarText = text;
      this.snackbarColor = color;
      this.snackbar = true;
    },
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
        .then(() => {
          this.showSnackbar('✓ Copied to clipboard!', 'success');
        })
        .catch(error => {
          console.error('Clipboard write failed:', error);
          this.showSnackbar('Failed to copy. Please try again.', 'error');
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
          this.showSnackbar('✓ Pasted from clipboard!', 'success');
        })
        .catch(error => {
          console.error('Clipboard read failed:', error);
          this.showSnackbar('Failed to paste. Please try again.', 'error');
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

<style scoped>
/* Monospace font for encoded output for better readability */
.monospace-output :deep(textarea) {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  line-height: 1.5;
}

/* Smooth transitions for buttons */
.v-btn {
  transition: all 0.2s ease;
}

.v-btn:hover {
  transform: translateY(-1px);
}
</style>
