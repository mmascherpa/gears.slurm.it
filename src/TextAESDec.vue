<template>
  <div>
    <!-- Page Header -->
    <ToolPageHeader
      icon="mdi-lock-open-variant-outline"
      title="AES Text Decryption"
      description="Decrypt password-protected text"
      avatar-color="primary-darken-1"
    />

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
              prepend-inner-icon="mdi-lock-open"
              hint="Enter the password used for encryption"
              hide-details
            ></v-text-field>
            <PasswordStrengthIndicator
              :password="password"
              :show-requirements="false"
              :show-feedback="false"
            />
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
        <TextInputWithActions
          v-model="encryptedText"
          label="Paste encrypted Base64 text"
          placeholder="Paste the encrypted text here..."
          :rows="6"
          :show-paste="true"
          :show-clear="true"
          :show-copy="false"
          row-class="mb-4"
          @paste="handlePaste"
          @clear="clearEncryptedText"
          @input="handleEncryptedTextChange"
        />

        <v-divider class="my-4"></v-divider>

        <TextInputWithActions
          v-model="decryptedText"
          label="Decrypted Text"
          placeholder="Decrypted text will appear here..."
          :rows="6"
          :is-loading="isLoading"
          :readonly="true"
          :show-paste="false"
          :show-clear="false"
          :show-copy="true"
          :show-download="true"
          :show-spacers="true"
          :show-double-spacers="true"
          copy-button-class="mb-2"
          button-column-class="d-flex flex-column"
          @copy="handleCopy"
          @download="downloadDecrypted"
        />
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

    <!-- Snackbar -->
    <SharedSnackbar
      v-model="snackbar"
      :text="snackbarText"
      :color="snackbarColor"
    />
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue';
import { downloadFile } from '@/utils/fileDownload';
import { useAESWorker } from '@/composables/useAESWorker';
import { useClipboard } from '@/composables/useClipboard';
import { useDebounce } from '@/composables/useDebounce';
import { useSnackbar } from '@/composables/useSnackbar';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator.vue';
import SharedSnackbar from '@/components/SharedSnackbar.vue';
import TextInputWithActions from '@/components/TextInputWithActions.vue';
import ToolPageHeader from '@/components/ToolPageHeader.vue';

export default {
  name: 'TextAESDec',
  components: {
    PasswordStrengthIndicator,
    SharedSnackbar,
    TextInputWithActions,
    ToolPageHeader
  },
  setup() {
    // Reactive State
    const decryptedText = ref('');
    const encryptedText = ref('');
    const error = ref('');
    const password = ref('');

    // Composables
    const { snackbar, snackbarColor, snackbarText, showSnackbar } = useSnackbar();
    const { copyToClipboard, pasteFromClipboard } = useClipboard();

    // AES Worker for decryption
    const { decrypt, isLoading } = useAESWorker(
      // onSuccess callback
      (data) => {
        convertToText(data);
      },
      // onError callback
      (friendlyMessage, rawError) => {
        error.value = rawError;
        showSnackbar(friendlyMessage, 'error');
      }
    );

    // Computed Properties
    /**
     * Checks if decryption is possible with valid inputs
     */
    const canDecrypt = computed(() => {
      return password.value.trim() !== '' && encryptedText.value.trim() !== '';
    });

    /**
     * Validates if the encrypted text is valid Base64 format
     */
    const isValidBase64 = computed(() => {
      if (!encryptedText.value.trim()) return true;
      const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
      return base64Pattern.test(encryptedText.value.trim());
    });

    // Functions

    /**
     * Clears encrypted text and decrypted output.
     */
    const clearEncryptedText = () => {
      encryptedText.value = '';
      decryptedText.value = '';
      error.value = '';
      cancelDecryption();
    };

    /**
     * Converts decrypted binary data to text string.
     */
    const convertToText = (data) => {
      try {
        const blob = new Blob([data]);
        const reader = new FileReader();

        reader.onload = () => {
          decryptedText.value = reader.result;
          showSnackbar('✓ Text decrypted successfully!', 'success');
        };

        reader.onerror = () => {
          error.value = 'Failed to convert decrypted data';
          showSnackbar('❌ Decryption failed', 'error');
        };

        reader.readAsText(blob);
      } catch (err) {
        console.error('Text conversion error:', err);
        error.value = 'Failed to convert decrypted data';
        showSnackbar('❌ Decryption failed', 'error');
      }
    };

    /**
     * Decrypts the encrypted text.
     */
    const decryptText = () => {
      if (!canDecrypt.value) return;

      if (!isValidBase64.value) {
        error.value = 'Invalid Base64 format. Please check the encrypted text.';
        showSnackbar('❌ Invalid Base64 format', 'error');
        return;
      }

      error.value = '';
      decryptedText.value = '';

      try {
        const binaryString = atob(encryptedText.value.trim());
        const bytes = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const encryptedBlob = new Blob([bytes]);
        decrypt(encryptedBlob, password.value, 'encrypted.aes');
      } catch (err) {
        console.error('Decryption error:', err);

        if (err.name === 'InvalidCharacterError') {
          error.value = 'Invalid Base64 format. Please check the encrypted text.';
          showSnackbar('❌ Invalid Base64 format', 'error');
        } else {
          error.value = 'Failed to initiate decryption';
          showSnackbar('❌ Decryption failed', 'error');
        }
      }
    };

    /**
     * Downloads decrypted text as .txt file.
     */
    const downloadDecrypted = () => {
      if (!decryptedText.value) return;

      try {
        const blob = new Blob([decryptedText.value], { type: 'text/plain' });
        downloadFile(blob, 'decrypted.txt');
        showSnackbar('✓ File downloaded!', 'success');
      } catch (err) {
        console.error('Download error:', err);
        showSnackbar('❌ Failed to download file', 'error');
      }
    };

    /**
     * Copies decrypted text to clipboard.
     */
    const handleCopy = async () => {
      await copyToClipboard(
        decryptedText.value,
        (message) => showSnackbar(message, 'success'),
        (message) => showSnackbar(message, 'error')
      );
    };

    /**
     * Handles encrypted text input change.
     */
    const handleEncryptedTextChange = () => {
      decryptedText.value = '';
      error.value = '';
      debouncedDecrypt();
    };

    /**
     * Pastes text from clipboard.
     */
    const handlePaste = async () => {
      await pasteFromClipboard(
        (pastedText, message) => {
          encryptedText.value = pastedText;
          showSnackbar(message, 'success');
          debouncedDecrypt();
        },
        (message) => showSnackbar(message, 'error')
      );
    };

    // Debounced decryption (800ms for crypto operations)
    const { cancel: cancelDecryption, debounce: debouncedDecrypt } = useDebounce(() => {
      if (canDecrypt.value && isValidBase64.value) {
        decryptText();
      }
    }, 800);

    // Watchers
    watch(password, () => {
      decryptedText.value = '';
      error.value = '';
      debouncedDecrypt();
    });

    return {
      // State
      decryptedText,
      encryptedText,
      error,
      isLoading,
      password,

      // Snackbar
      snackbar,
      snackbarColor,
      snackbarText,

      // Methods
      clearEncryptedText,
      downloadDecrypted,
      handleCopy,
      handleEncryptedTextChange,
      handlePaste
    };
  }
};
</script>
