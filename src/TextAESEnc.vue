<template>
  <div>
    <!-- Page Header -->
    <div class="d-flex align-center mb-6">
      <v-avatar color="primary" size="48" class="mr-4">
        <v-icon icon="mdi-file-lock-outline" size="28" color="white"></v-icon>
      </v-avatar>
      <div>
        <h1 class="text-h4 font-weight-bold">AES Text Encryption</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">Encrypt text with password protection</p>
      </div>
    </div>

    <!-- Password Protection Section -->
    <v-card class="mb-4" elevation="2">
      <v-card-title class="bg-surface-variant">
        <v-icon icon="mdi-key" class="mr-2"></v-icon>
        Password Protection
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
              autocomplete="new-password"
              hide-details
            ></v-text-field>
            <PasswordStrengthIndicator :password="password" :show-requirements="true" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="passwordConfirm"
              label="Confirm Password"
              type="password"
              variant="outlined"
              density="comfortable"
              autocomplete="new-password"
              hide-details
              :error="password !== '' && passwordConfirm !== '' && password !== passwordConfirm"
              :error-messages="password !== '' && passwordConfirm !== '' && password !== passwordConfirm ? 'Passwords do not match' : ''"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Text Input/Output Section -->
    <v-card class="mb-4" elevation="2">
      <v-card-title class="bg-surface-variant">
        <v-icon icon="mdi-text" class="mr-2"></v-icon>
        Plain Text
      </v-card-title>
      <v-card-text class="pa-4">
        <v-row no-gutters class="mb-4">
          <v-col class="flex-grow-1">
            <v-textarea
              v-model="plainText"
              label="Enter your secret text"
              placeholder="Type or paste your text here..."
              rows="6"
              variant="outlined"
              density="comfortable"
              @input="onPlainTextChange"
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
                  v-show="!plainText"
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
                  @click="clearPlainText"
                  v-show="!!plainText"
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
              v-model="encryptedText"
              label="Encrypted Text (Base64)"
              placeholder="Encrypted output will appear here..."
              rows="6"
              variant="outlined"
              readonly
              hide-details
            ></v-textarea>
          </v-col>
          <v-col class="ml-2 d-flex flex-column" cols="auto">
            <!-- Spacer button when no output (maintains layout) -->
            <v-btn v-if="!isLoading && !encryptedText" color="transparent" flat icon></v-btn>
            <v-btn v-if="!isLoading && !encryptedText" color="transparent" flat icon></v-btn>

            <!-- Loading spinner -->
            <v-progress-circular
              v-if="isLoading"
              indeterminate
              :size="48"
              :width="6"
              color="primary"
            ></v-progress-circular>

            <!-- Action buttons when output exists -->
            <v-tooltip v-if="!isLoading && encryptedText" text="Copy to clipboard" location="top">
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
            <v-tooltip v-if="!isLoading && encryptedText" text="Download as file" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  flat
                  icon
                  @click="downloadEncrypted"
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
  name: 'TextAESEnc',
  components: {
    PasswordStrengthIndicator
  },
  data() {
    return {
      password: '',
      passwordConfirm: '',
      plainText: '',
      encryptedText: '',
      worker: null,
      isLoading: false,
      error: '',
      snackbar: false,
      snackbarText: '',
      snackbarColor: 'success',
      encryptionTimer: null
    };
  },
  watch: {
    // Auto-encrypt when password or text changes
    password() {
      this.scheduleEncryption();
    },
    passwordConfirm() {
      this.scheduleEncryption();
    }
  },
  computed: {
    /**
     * Check if encryption can proceed
     * @returns {boolean} True if password matches and text is not empty
     */
    canEncrypt() {
      return (
        this.password.trim() !== '' &&
        this.password === this.passwordConfirm &&
        this.plainText.trim() !== ''
      );
    },

    /**
     * Check if passwords match
     * @returns {boolean} True if passwords match
     */
    isPasswordConfirmed() {
      return this.password.trim() !== '' && this.password === this.passwordConfirm;
    }
  },
  methods: {
    /**
     * Setup Web Worker for encryption
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
        let snackbarMsg = 'Encryption failed';

        if (data.includes('Password is too long')) {
          snackbarMsg = '❌ Password too long (max 1024 characters)';
        } else if (data.includes('corrupted')) {
          snackbarMsg = '❌ Data corrupted during encryption';
        }

        this.showSnackbar(snackbarMsg, 'error');
        return;
      }

      // Convert encrypted Uint8Array to Base64
      this.convertToBase64(data);
    },

    /**
     * Convert binary data to Base64 string
     * @param {Uint8Array} data - Binary encrypted data
     */
    convertToBase64(data) {
      try {
        const blob = new Blob([data]);
        const reader = new FileReader();

        reader.onload = () => {
          // Extract Base64 string (remove data:... prefix)
          const base64 = reader.result.split(',')[1];
          this.encryptedText = base64;
          this.showSnackbar('✓ Text encrypted successfully!', 'success');
        };

        reader.onerror = () => {
          this.error = 'Failed to convert encrypted data';
          this.showSnackbar('❌ Encryption failed', 'error');
        };

        reader.readAsDataURL(blob);
      } catch (err) {
        console.error('Base64 conversion error:', err);
        this.error = 'Failed to convert encrypted data';
        this.showSnackbar('❌ Encryption failed', 'error');
      }
    },

    /**
     * Schedule encryption with debouncing
     * Delays encryption by 800ms to avoid encrypting on every keystroke
     */
    scheduleEncryption() {
      // Clear existing timer
      if (this.encryptionTimer) {
        clearTimeout(this.encryptionTimer);
      }

      // Clear encrypted text while typing
      this.encryptedText = '';
      this.error = '';

      // Don't schedule if can't encrypt
      if (!this.canEncrypt) {
        return;
      }

      // Schedule new encryption
      this.encryptionTimer = setTimeout(() => {
        this.encryptText();
      }, 800);
    },

    /**
     * Handle plain text input change
     * Triggers auto-encryption with debouncing
     */
    onPlainTextChange() {
      this.scheduleEncryption();
    },

    /**
     * Clear plain text and encrypted output
     */
    clearPlainText() {
      this.plainText = '';
      this.encryptedText = '';
      this.error = '';
      if (this.encryptionTimer) {
        clearTimeout(this.encryptionTimer);
      }
    },

    /**
     * Encrypt the plain text
     * Validates input and sends to Web Worker for processing
     */
    encryptText() {
      if (!this.canEncrypt) {
        return;
      }

      this.error = '';
      this.encryptedText = '';
      this.isLoading = true;
      this.setupWorker();

      try {
        // Wrap plain text in Blob for AES library
        const textBlob = new Blob([this.plainText], { type: 'text/plain' });

        // Send to worker with filename
        this.worker.postMessage(['ENCRYPT', textBlob, this.password, 'plaintext.txt']);
      } catch (err) {
        console.error('Encryption error:', err);
        this.error = 'Failed to initiate encryption';
        this.showSnackbar('❌ Encryption failed', 'error');
        this.isLoading = false;
      }
    },

    /**
     * Paste text from clipboard
     */
    async pasteFromClipboard() {
      try {
        const text = await navigator.clipboard.readText();
        this.plainText = text;
        this.showSnackbar('✓ Pasted from clipboard', 'success');
        // Trigger auto-encryption
        this.scheduleEncryption();
      } catch (err) {
        console.error('Clipboard paste error:', err);
        this.showSnackbar('❌ Failed to paste from clipboard', 'error');
      }
    },

    /**
     * Copy encrypted text to clipboard
     */
    async copyToClipboard() {
      if (!this.encryptedText) return;

      try {
        await navigator.clipboard.writeText(this.encryptedText);
        this.showSnackbar('✓ Copied to clipboard!', 'success');
      } catch (err) {
        console.error('Clipboard copy error:', err);
        this.showSnackbar('❌ Failed to copy to clipboard', 'error');
      }
    },

    /**
     * Download encrypted text as .aes file
     */
    downloadEncrypted() {
      if (!this.encryptedText) return;

      try {
        // Convert Base64 back to binary for file download
        const binaryString = atob(this.encryptedText);
        const bytes = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        downloadFile(bytes, 'encrypted.aes');
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
    // Clean up encryption timer
    if (this.encryptionTimer) {
      clearTimeout(this.encryptionTimer);
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
