<template>
  <div>
    <div class="d-flex align-center mb-6">
      <v-avatar color="secondary-darken-1" size="48" class="mr-4">
        <v-icon icon="mdi-arrow-up-bold-box" size="28" color="white"></v-icon>
      </v-avatar>
      <div>
        <h1 class="text-h4 font-weight-bold">Base64 Decoder</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">Decode Base64 text or files back to original format</p>
      </div>
    </div>

    <v-card class="mb-4" elevation="2">
      <v-card-title class="bg-surface-variant">
        <v-icon icon="mdi-text" class="mr-2"></v-icon>
        Text Decoding
      </v-card-title>
      <v-card-text class="pa-4">
        <v-row no-gutters class="mb-4">
          <v-col class="flex-grow-1">
            <v-textarea
              label="Base64 Encoded Text"
              v-model="encodedText"
              @input="updatePlainText()"
              variant="outlined"
              rows="4"
              placeholder="Enter your Base64 encoded text here"
              class="monospace-output"
              hide-details>
            </v-textarea>
          </v-col>
          <v-col class="ml-2" cols="auto">
            <v-tooltip text="Paste from clipboard" location="top">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" flat icon @click="pasteFromClipboard" v-show="!encodedText">
                  <v-icon icon='mdi-content-paste' />
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip text="Clear text" location="top">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" flat icon @click="encodedText = ''; updatePlainText(0)" v-show="!!encodedText">
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
              v-model="plainText"
              label="Decoded Output"
              variant="outlined"
              rows="4"
              readonly
              bg-color="grey-lighten-4"
              placeholder="Decoded plain text will appear here"
              hide-details>
            </v-textarea>
          </v-col>
          <v-col class="ml-2" cols="auto">
            <v-btn v-if="!isLoading && !plainText" color="transparent" flat icon></v-btn>
            <v-progress-circular v-if="isLoading" color="primary" indeterminate :size="48" :width="6"></v-progress-circular>
            <v-tooltip text="Copy to clipboard" location="top">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" v-if="!isLoading" flat icon @click="copyToClipboard" v-show="!!plainText">
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
        File Decoding
      </v-card-title>
      <v-card-text class="pa-4">
        <v-row align="center">
          <v-col cols="12" sm="8">
            <v-file-input
              v-model="encodedFile"
              label="Select a Base64 file to decode"
              variant="outlined"
              show-size
              prepend-icon=""
              prepend-inner-icon="mdi-paperclip"
              hide-details>
            </v-file-input>
          </v-col>
          <v-col cols="12" sm="4">
            <v-btn
              :disabled="encodedFile.length == 0"
              @click="decodeFile"
              color="primary"
              size="large"
              block>
              <v-icon start>mdi-arrow-up-bold-box</v-icon>
              Decode File
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
      encodedFile: [],
      plainFile: false,
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
        .then(() => {
          this.showSnackbar('✓ Copied to clipboard!', 'success');
        })
        .catch(error => {
          console.error('Clipboard write failed:', error);
          this.showSnackbar('Failed to copy. Please try again.', 'error');
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
          this.showSnackbar('✓ Pasted from clipboard!', 'success');
        })
        .catch(error => {
          console.error('Clipboard read failed:', error);
          this.showSnackbar('Failed to paste. Please try again.', 'error');
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
