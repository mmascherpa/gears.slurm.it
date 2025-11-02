<template>
  <div>
    <!-- Page Header -->
    <ToolPageHeader
      icon="mdi-file-lock-outline"
      title="AES Text Encryption"
      description="Encrypt text with password protection"
      avatar-color="primary"
    />

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
              prepend-inner-icon="mdi-lock"
              hide-details
            ></v-text-field>
            <PasswordStrengthIndicator
              :password="password"
              :show-requirements="true"
              :show-feedback="true"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="passwordConfirm"
              label="Confirm Password"
              type="password"
              variant="outlined"
              density="comfortable"
              autocomplete="new-password"
              prepend-inner-icon="mdi-lock-check"
              :error="password !== '' && passwordConfirm !== '' && password !== passwordConfirm"
              :success="isPasswordConfirmed"
              hide-details
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
        <TextInputWithActions
          v-model="plainText"
          label="Enter your secret text"
          placeholder="Type or paste your text here..."
          :rows="6"
          :show-paste="true"
          :show-clear="true"
          :show-copy="false"
          row-class="mb-4"
          @paste="handlePaste"
          @clear="clearPlainText"
          @input="handlePlainTextChange"
        />

        <v-divider class="my-4"></v-divider>

        <TextInputWithActions
          v-model="encryptedText"
          label="Encrypted Text (Base64)"
          placeholder="Encrypted output will appear here..."
          :rows="6"
          :is-loading="isLoading"
          :readonly="true"
          :show-paste="false"
          :show-clear="false"
          :show-copy="true"
          :show-download="true"
          copy-button-class="mb-2"
          button-column-class="d-flex flex-column"
          @copy="handleCopy"
          @download="downloadEncrypted"
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
  name: 'TextAESEnc',
  components: {
    PasswordStrengthIndicator,
    SharedSnackbar,
    TextInputWithActions,
    ToolPageHeader
  },
  setup() {
    // Reactive State
    const encryptedText = ref('');
    const error = ref('');
    const password = ref('');
    const passwordConfirm = ref('');
    const plainText = ref('');

    // Composables
    const { snackbar, snackbarColor, snackbarText, showSnackbar } = useSnackbar();
    const { copyToClipboard, pasteFromClipboard } = useClipboard();

    // AES Worker for encryption
    const { encrypt, isLoading } = useAESWorker(
      // onSuccess callback
      (data) => {
        convertToBase64(data);
      },
      // onError callback
      (friendlyMessage, rawError) => {
        error.value = rawError;
        showSnackbar(friendlyMessage, 'error');
      }
    );

    // Computed Properties
    /**
     * Checks if encryption is possible with valid inputs
     */
    const canEncrypt = computed(() => {
      return isPasswordConfirmed.value && plainText.value.trim() !== '';
    });

    /**
     * Checks if the password and confirmation match
     */
    const isPasswordConfirmed = computed(() => {
      return password.value.trim() !== '' && password.value === passwordConfirm.value;
    });

    // Functions

    /**
     * Clears plain text and encrypted output.
     */
    const clearPlainText = () => {
      plainText.value = '';
      encryptedText.value = '';
      error.value = '';
      cancelEncryption();
    };

    /**
     * Converts encrypted binary data to Base64 string.
     */
    const convertToBase64 = (data) => {
      try {
        const blob = new Blob([data]);
        const reader = new FileReader();

        reader.onload = () => {
          const base64 = reader.result.split(',')[1];
          encryptedText.value = base64;
          showSnackbar('✓ Text encrypted successfully!', 'success');
        };

        reader.onerror = () => {
          error.value = 'Failed to convert encrypted data';
          showSnackbar('❌ Encryption failed', 'error');
        };

        reader.readAsDataURL(blob);
      } catch (err) {
        console.error('Base64 conversion error:', err);
        error.value = 'Failed to convert encrypted data';
        showSnackbar('❌ Encryption failed', 'error');
      }
    };

    /**
     * Downloads encrypted text as .aes file.
     */
    const downloadEncrypted = () => {
      if (!encryptedText.value) return;

      try {
        const binaryString = atob(encryptedText.value);
        const bytes = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        downloadFile(bytes, 'encrypted.aes');
        showSnackbar('✓ File downloaded!', 'success');
      } catch (err) {
        console.error('Download error:', err);
        showSnackbar('❌ Failed to download file', 'error');
      }
    };

    /**
     * Encrypts the plain text.
     */
    const encryptText = () => {
      if (!canEncrypt.value) return;

      error.value = '';
      encryptedText.value = '';

      try {
        const textBlob = new Blob([plainText.value], { type: 'text/plain' });
        encrypt(textBlob, password.value, 'plaintext.txt');
      } catch (err) {
        console.error('Encryption error:', err);
        error.value = 'Failed to initiate encryption';
        showSnackbar('❌ Encryption failed', 'error');
      }
    };

    /**
     * Copies encrypted text to clipboard.
     */
    const handleCopy = async () => {
      await copyToClipboard(
        encryptedText.value,
        (message) => showSnackbar(message, 'success'),
        (message) => showSnackbar(message, 'error')
      );
    };

    /**
     * Pastes text from clipboard.
     */
    const handlePaste = async () => {
      await pasteFromClipboard(
        (pastedText, message) => {
          plainText.value = pastedText;
          showSnackbar(message, 'success');
          debouncedEncrypt();
        },
        (message) => showSnackbar(message, 'error')
      );
    };

    /**
     * Handles plain text input change.
     */
    const handlePlainTextChange = () => {
      encryptedText.value = '';
      error.value = '';
      debouncedEncrypt();
    };

    // Debounced encryption (800ms for crypto operations)
    const { cancel: cancelEncryption, debounce: debouncedEncrypt } = useDebounce(() => {
      if (canEncrypt.value) {
        encryptText();
      }
    }, 800);

    // Watchers
    watch([password, passwordConfirm], () => {
      encryptedText.value = '';
      error.value = '';
      debouncedEncrypt();
    });

    return {
      // State
      encryptedText,
      error,
      isLoading,
      password,
      passwordConfirm,
      plainText,

      // Snackbar
      snackbar,
      snackbarColor,
      snackbarText,

      // Computed
      isPasswordConfirmed,

      // Methods
      clearPlainText,
      downloadEncrypted,
      handleCopy,
      handlePaste,
      handlePlainTextChange
    };
  }
};
</script>
