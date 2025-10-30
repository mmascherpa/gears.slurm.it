<template>
  <div>
    <!-- Page Header -->
    <div class="d-flex align-center mb-6">
      <v-avatar color="primary-darken-1" size="48" class="mr-4">
        <v-icon icon="mdi-lock-open-variant-outline" size="28" color="white"></v-icon>
      </v-avatar>
      <div>
        <h1 class="text-h4">AES Text Decryption</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Decrypt password-protected text</p>
      </div>
    </div>

    <!-- Password Section -->
    <v-card class="mb-4" elevation="2">
      <v-card-title class="bg-surface-variant">
        <v-icon icon="mdi-key" class="mr-2"></v-icon>
        Password
      </v-card-title>
      <v-card-text class="pa-4">
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="password"
              label="Password"
              type="password"
              variant="outlined"
              density="comfortable"
              autocomplete="current-password"
              hint="Enter the password used for encryption"
              hide-details
            ></v-text-field>
            <PasswordStrengthIndicator :password="password" :show-requirements="false" :showFeedback="false" />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Text Input/Output Section -->
    <v-card class="mb-4" elevation="2">
      <v-card-title class="bg-surface-variant">
        <v-icon icon="mdi-lock" class="mr-2"></v-icon>
        Encrypted Text (Base64)
      </v-card-title>
      <v-card-text class="pa-4">
        <v-row no-gutters>
          <v-col class="flex-grow-1">
            <v-textarea
              v-model="encryptedText"
              label="Paste encrypted Base64 text"
              placeholder="Paste the encrypted text here..."
              rows="6"
              variant="outlined"
              density="comfortable"
              @input="onEncryptedTextChange"
              hide-details
            ></v-textarea>
          </v-col>
          <v-col class="ml-2" cols="auto">
            <v-tooltip text="Paste from clipboard" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  flat
                  icon
                  @click="pasteFromClipboard"
                  v-show="!encryptedText"
                >
                  <v-icon icon="mdi-content-paste"></v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip text="Clear text" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  flat
                  icon
                  @click="clearEncryptedText"
                  v-show="!!encryptedText"
                >
                  <v-icon icon="mdi-close-octagon-outline"></v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <v-row no-gutters>
          <v-col class="flex-grow-1">
            <v-textarea
              v-model="decryptedText"
              label="Decrypted Text"
              placeholder="Decrypted text will appear here..."
              rows="6"
              variant="outlined"
              readonly
              hide-details
            ></v-textarea>
          </v-col>
          <v-col class="ml-2 d-flex flex-column" cols="auto">
            <!-- Spacer button when no output (maintains layout) -->
            <v-btn v-if="!isLoading && !decryptedText" color="transparent" flat icon></v-btn>
            <v-btn v-if="!isLoading && !decryptedText" color="transparent" flat icon></v-btn>

            <!-- Loading spinner -->
            <v-progress-circular
              v-if="isLoading"
              indeterminate
              :size="48"
              :width="6"
              color="primary"
            ></v-progress-circular>

            <!-- Action buttons when output exists -->
            <v-tooltip v-if="!isLoading && decryptedText" text="Copy to clipboard" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  class="mb-2"
                  v-bind="props"
                  flat
                  icon
                  @click="copyToClipboard"
                >
                  <v-icon icon="mdi-content-copy"></v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip v-if="!isLoading && decryptedText" text="Download as file" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  flat
                  icon
                  @click="downloadDecrypted"
                >
                  <v-icon icon="mdi-download"></v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Error Alert -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      closable
      @click:close="error = ''"
      class="mb-4"
    >
      {{ error }}
    </v-alert>

    <!-- Success/Error Snackbar -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      :timeout="3000"
      location="top"
    >
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script>
import { downloadFile } from '@/utils/fileDownload';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator.vue';

export default {
  name: 'TextAESDec',
  components: {
    PasswordStrengthIndicator
  },
  data() {
    return {
      password: '',
      encryptedText: '',
      decryptedText: '',
      worker: null,
      isLoading: false,
      error: '',
      snackbar: false,
      snackbarText: '',
      snackbarColor: 'success',
      decryptionTimer: null
    };
  },
  watch: {
    // Auto-decrypt when password or encrypted text changes
    password() {
      this.scheduleDecryption();
    }
  },
  computed: {
    /**
     * Check if decryption can proceed
     * @returns {boolean} True if password and encrypted text are not empty
     */
    canDecrypt() {
      return this.password.trim() !== '' && this.encryptedText.trim() !== '';
    }
  },
  methods: {
    /**
     * Setup Web Worker for decryption
     * Terminates existing worker if present and creates new one
     */
    setupWorker() {
      if (this.worker) {
        this.worker.terminate();
      }
      this.worker = new Worker('/worker.js');
      this.worker.onmessage = this.handleWorkerResponse;
    },

    /**
     * Handle response from Web Worker
     * @param {MessageEvent} event - Worker message event
     */
    handleWorkerResponse(event) {
      const [action, data, fileName] = event.data;
      this.isLoading = false;

      if (action === 'ERROR') {
        this.error = data;
        let snackbarMsg = '❌ Decryption failed';

        if (data.includes('Wrong password') || data.includes('Bad HMAC')) {
          snackbarMsg = '❌ Wrong password';
          this.error = 'Incorrect password. Please check your password and try again.';
        } else if (data.includes('corrupted') || data.includes('not an AES Crypt')) {
          snackbarMsg = '❌ Invalid or corrupted data';
          this.error = 'The encrypted text is corrupted or not valid AES encrypted data.';
        }

        this.showSnackbar(snackbarMsg, 'error');
        return;
      }

      // Convert decrypted Uint8Array to text
      this.convertToText(data);
    },

    /**
     * Convert binary data to text string
     * @param {Uint8Array} data - Binary decrypted data
     */
    convertToText(data) {
      try {
        const blob = new Blob([data]);
        const reader = new FileReader();

        reader.onload = () => {
          this.decryptedText = reader.result;
          this.showSnackbar('✓ Text decrypted successfully!', 'success');
        };

        reader.onerror = () => {
          this.error = 'Failed to convert decrypted data';
          this.showSnackbar('❌ Decryption failed', 'error');
        };

        reader.readAsText(blob);
      } catch (err) {
        console.error('Text conversion error:', err);
        this.error = 'Failed to convert decrypted data';
        this.showSnackbar('❌ Decryption failed', 'error');
      }
    },

    /**
     * Schedule decryption with debouncing
     * Delays decryption by 800ms to avoid decrypting on every keystroke
     */
    scheduleDecryption() {
      // Clear existing timer
      if (this.decryptionTimer) {
        clearTimeout(this.decryptionTimer);
      }

      // Clear decrypted text while typing
      this.decryptedText = '';
      this.error = '';

      // Don't schedule if can't decrypt
      if (!this.canDecrypt) {
        return;
      }

      // Schedule new decryption
      this.decryptionTimer = setTimeout(() => {
        this.decryptText();
      }, 800);
    },

    /**
     * Handle encrypted text input change
     * Triggers auto-decryption with debouncing
     */
    onEncryptedTextChange() {
      this.scheduleDecryption();
    },

    /**
     * Clear encrypted text and decrypted output
     */
    clearEncryptedText() {
      this.encryptedText = '';
      this.decryptedText = '';
      this.error = '';
      if (this.decryptionTimer) {
        clearTimeout(this.decryptionTimer);
      }
    },

    /**
     * Decrypt the encrypted text
     * Validates input and sends to Web Worker for processing
     */
    decryptText() {
      if (!this.canDecrypt) {
        return;
      }

      this.error = '';
      this.decryptedText = '';
      this.isLoading = true;
      this.setupWorker();

      try {
        // Convert Base64 to binary Blob for AES library
        const binaryString = atob(this.encryptedText.trim());
        const bytes = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const encryptedBlob = new Blob([bytes]);

        // Send to worker
        this.worker.postMessage(['DECRYPT', encryptedBlob, this.password, 'encrypted.aes']);
      } catch (err) {
        console.error('Decryption error:', err);

        if (err.name === 'InvalidCharacterError') {
          this.error = 'Invalid Base64 format. Please check the encrypted text.';
          this.showSnackbar('❌ Invalid Base64 format', 'error');
        } else {
          this.error = 'Failed to initiate decryption';
          this.showSnackbar('❌ Decryption failed', 'error');
        }

        this.isLoading = false;
      }
    },

    /**
     * Paste text from clipboard
     */
    async pasteFromClipboard() {
      try {
        const text = await navigator.clipboard.readText();
        this.encryptedText = text;
        this.showSnackbar('✓ Pasted from clipboard', 'success');
        // Trigger auto-decryption
        this.scheduleDecryption();
      } catch (err) {
        console.error('Clipboard paste error:', err);
        this.showSnackbar('❌ Failed to paste from clipboard', 'error');
      }
    },

    /**
     * Copy decrypted text to clipboard
     */
    async copyToClipboard() {
      if (!this.decryptedText) return;

      try {
        await navigator.clipboard.writeText(this.decryptedText);
        this.showSnackbar('✓ Copied to clipboard!', 'success');
      } catch (err) {
        console.error('Clipboard copy error:', err);
        this.showSnackbar('❌ Failed to copy to clipboard', 'error');
      }
    },

    /**
     * Download decrypted text as .txt file
     */
    downloadDecrypted() {
      if (!this.decryptedText) return;

      try {
        const blob = new Blob([this.decryptedText], { type: 'text/plain' });
        downloadFile(blob, 'decrypted.txt');
        this.showSnackbar('✓ File downloaded!', 'success');
      } catch (err) {
        console.error('Download error:', err);
        this.showSnackbar('❌ Failed to download file', 'error');
      }
    },

    /**
     * Show snackbar notification
     * @param {string} text - Message to display
     * @param {string} color - Color of snackbar ('success' or 'error')
     */
    showSnackbar(text, color = 'success') {
      this.snackbarText = text;
      this.snackbarColor = color;
      this.snackbar = true;
    }
  },
  beforeUnmount() {
    // Clean up worker when component is destroyed
    if (this.worker) {
      this.worker.terminate();
    }
    // Clean up decryption timer
    if (this.decryptionTimer) {
      clearTimeout(this.decryptionTimer);
    }
  }
};
</script>

<style scoped>
.monospace-output {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9em;
  letter-spacing: 0.05em;
}
</style>
