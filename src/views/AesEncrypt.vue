<template>
  <div>
    <!-- Page Header -->
    <ToolPageHeader
      icon="mdi-lock"
      title="AES Encryption"
      description="Encrypt files and text with password-protected AES encryption"
      avatar-color="primary"
    />

    <!-- Error Alert -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      closable
      @click:close="error = ''"
      class="mb-4">
      {{ error }}
    </v-alert>

    <!-- Password Protection Section -->
    <v-card class="mb-4">
      <v-card-title class="bg-surface-variant">
        <v-icon icon="mdi-key" class="mr-2"></v-icon>
        Password Protection
      </v-card-title>
      <v-card-text class="pa-4">
        <form @submit.prevent>
          <!-- Hidden username field for browser accessibility compliance -->
          <input type="text" name="username" autocomplete="username" style="display: none;" aria-hidden="true">

          <PasswordInput
            v-model:password="password"
            v-model:password-confirm="passwordConfirm"
            :require-confirmation="true"
            :show-strength="true"
            :show-requirements="true"
            :show-feedback="true"
            autocomplete="new-password"
          />

          <v-checkbox
            v-model="rememberPassword"
            label="Remember password for this session"
            hint="⚠️ Only use on trusted devices. Password stored in browser memory until tab closes."
            persistent-hint
            density="comfortable"
            class="mt-2"
            color="warning"
          />

          <v-chip
            v-if="isPasswordRemembered"
            color="info"
            variant="tonal"
            size="small"
            prepend-icon="mdi-memory"
            closable
            @click:close="clearSessionPassword"
            class="mt-2"
          >
            Password remembered for session
          </v-chip>
        </form>
      </v-card-text>
    </v-card>

    <!-- Text Encryption Section -->
    <v-card class="mb-4">
      <v-card-title class="bg-surface-variant">
        <v-icon icon="mdi-text" class="mr-2"></v-icon>
        Text Encryption
      </v-card-title>
      <v-card-text class="pa-4">
        <TextInputWithActions
          v-model="plainText"
          label="Plain Text"
          placeholder="Enter your plain text here"
          :rows="4"
          :disabled="isFilePopulated"
          :show-paste="!isFilePopulated"
          :show-clear="true"
          :show-copy="false"
          test-id="plain-text-input"
          @paste="handlePaste"
          @clear="clearPlainText"
          @input="handlePlainTextChange"
        />

        <v-divider class="my-4"></v-divider>

        <TextInputWithActions
          v-model="encryptedText"
          label="Encrypted Text (Base64)"
          placeholder="Encrypted output will appear here..."
          :rows="4"
          :is-loading="isLoading"
          :readonly="true"
          :show-paste="false"
          :show-clear="false"
          :show-copy="true"
          test-id="output-text"
          @copy="handleCopy"
        />
      </v-card-text>
    </v-card>

    <!-- File Encryption Section -->
    <v-card class="mb-4">
      <v-card-title class="bg-surface-variant">
        <v-icon icon="mdi-file" class="mr-2"></v-icon>
        File Encryption
      </v-card-title>
      <v-card-text class="pa-4">
        <FileUploadWithValidation
          v-model="plainFile"
          label="Select file to encrypt"
          button-text="Encrypt"
          button-icon="mdi-lock"
          :disabled="isPlaintextPopulated"
          :can-submit="canEncrypt"
          @submit="encryptFile"
          @validation-change="handleFileValidation"
        />
      </v-card-text>
    </v-card>

    <!-- CSV Preview (if applicable) -->
    <CsvPreviewTable
      :headers="tableHeaders"
      :data="tableData"
      @close="clearOutputs"
    />

    <!-- Snackbar -->
    <SharedSnackbar
      v-model="snackbar"
      :text="snackbarText"
      :color="snackbarColor"
    />

    <!-- Loading Overlay -->
    <v-overlay :model-value="isLoading" class="align-center justify-center">
      <v-progress-circular
        indeterminate
        size="64"
        color="primary">
      </v-progress-circular>
      <p class="text-h6 mt-4">Encrypting...</p>
    </v-overlay>
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue';
import { downloadFile } from '@/utils/fileDownload';
import { parseCSV } from '@/utils/csvParser';
import { useAESWorker } from '@/composables/useAESWorker';
import { useClipboard } from '@/composables/useClipboard';
import { useDebounce } from '@/composables/useDebounce';
import { usePasswordSession } from '@/composables/usePasswordSession';
import { useSnackbar } from '@/composables/useSnackbar';
import CsvPreviewTable from '@/components/CsvPreviewTable.vue';
import FileUploadWithValidation from '@/components/FileUploadWithValidation.vue';
import PasswordInput from '@/components/PasswordInput.vue';
import SharedSnackbar from '@/components/SharedSnackbar.vue';
import TextInputWithActions from '@/components/TextInputWithActions.vue';
import ToolPageHeader from '@/components/ToolPageHeader.vue';

export default {
  name: 'AesEncrypt',
  components: {
    CsvPreviewTable,
    FileUploadWithValidation,
    PasswordInput,
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
    const plainFile = ref(null);
    const plainText = ref('');
    const tableData = ref([]);
    const tableHeaders = ref([]);

    // Composables
    const { snackbar, snackbarColor, snackbarText, showSnackbar } = useSnackbar();
    const { copyToClipboard, pasteFromClipboard } = useClipboard();
    const {
      rememberPassword,
      isPasswordRemembered,
      saveSessionPassword,
      clearSessionPassword,
      autoLoadPassword
    } = usePasswordSession('encrypt');

    // Auto-load saved password from session on mount
    const storedPassword = autoLoadPassword();
    if (storedPassword) {
      password.value = storedPassword;
      passwordConfirm.value = storedPassword;
    }

    // AES Worker for encryption
    const { encrypt, isLoading } = useAESWorker(
      // onSuccess callback
      (data, fileName) => {
        // Text encryption: convert to Base64 and display
        if (isPlaintextPopulated.value) {
          convertToBase64(data);
        } else {
          // File encryption: download as .aes file
          downloadFile(data, fileName);
          showSnackbar('✓ File encrypted successfully!', 'success');
          clearInputs();
        }
      },
      // onError callback
      (friendlyMessage, rawError) => {
        error.value = rawError;
        showSnackbar(friendlyMessage, 'error');
        encryptedText.value = '';
      }
    );

    // Computed Properties

    /**
     * Checks if encryption is possible with valid inputs.
     */
    const canEncrypt = computed(() => {
      return isPasswordConfirmed.value && (isFilePopulated.value || isPlaintextPopulated.value);
    });

    /**
     * Checks if a file has been uploaded.
     */
    const isFilePopulated = computed(() => {
      return !!plainFile.value;
    });

    /**
     * Checks if CSV preview output is populated.
     */
    const isOutputPopulated = computed(() => {
      return tableHeaders.value.length > 0 || tableData.value.length > 0;
    });

    /**
     * Checks if the password and confirmation match.
     */
    const isPasswordConfirmed = computed(() => {
      return password.value.trim() !== '' && password.value === passwordConfirm.value;
    });

    /**
     * Checks if plain text has been entered.
     */
    const isPlaintextPopulated = computed(() => {
      return plainText.value.trim() !== '';
    });

    // Functions

    /**
     * Clears all inputs.
     * Preserves password if session memory is enabled.
     */
    const clearInputs = () => {
      // Only clear password if not remembered for session
      if (!rememberPassword.value) {
        password.value = '';
        passwordConfirm.value = '';
      }
      plainText.value = '';
      plainFile.value = null;
      encryptedText.value = '';
      clearOutputs();
    };

    /**
     * Clears CSV preview outputs.
     */
    const clearOutputs = () => {
      tableData.value = [];
      tableHeaders.value = [];
      search.value = '';
      error.value = '';
    };

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
     * Encrypts the file or plain text.
     */
    const encryptFile = () => {
      if (!canEncrypt.value) {
        showSnackbar('Invalid inputs', 'error');
        return;
      }

      error.value = '';

      let fileData = null;
      let fileName = null;

      if (isPlaintextPopulated.value) {
        fileData = new Blob([plainText.value], { type: 'text/plain' });
        fileName = 'plaintext.txt';
      } else if (isFilePopulated.value) {
        fileData = plainFile.value;
        fileName = plainFile.value.name;
      }

      if (fileData && fileName) {
        encrypt(fileData, password.value, fileName);
      }
    };

    /**
     * Handles file validation and CSV preview.
     */
    const handleFileValidation = (result) => {
      if (plainFile.value && result.isValid) {
        const selectedFile = plainFile.value;
        if (selectedFile.type === "text/csv") {
          const reader = new FileReader();
          reader.onload = () => {
            const text = reader.result;
            handleFileUploadCSV(text);
          };
          reader.readAsText(selectedFile);
        }
      }
    };

    /**
     * Handles CSV file parsing for preview.
     */
    const handleFileUploadCSV = (text) => {
      const parsedCSV = parseCSV(text);
      tableHeaders.value = parsedCSV.headers;
      tableData.value = parsedCSV.data;
    };

    /**
     * Encrypts text (for auto-encryption).
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
      if (canEncrypt.value && isPlaintextPopulated.value) {
        encryptText();
      }
    }, 800);

    // Watchers

    // Watch checkbox state - immediately save password when checkbox is checked
    watch(rememberPassword, (shouldRemember) => {
      if (shouldRemember && isPasswordConfirmed.value) {
        saveSessionPassword(password.value);
      }
    });

    // Watch password changes - save to session if checkbox is checked
    watch([password, passwordConfirm], () => {
      // Save password to session if checkbox is checked and passwords match
      if (rememberPassword.value && isPasswordConfirmed.value) {
        saveSessionPassword(password.value);
      }

      if (isPlaintextPopulated.value) {
        encryptedText.value = '';
        error.value = '';
        debouncedEncrypt();
      }
    });

    return {
      // State
      encryptedText,
      error,
      isLoading,
      password,
      passwordConfirm,
      plainFile,
      plainText,
      tableData,
      tableHeaders,

      // Password Session
      rememberPassword,
      isPasswordRemembered,
      clearSessionPassword,

      // Snackbar
      snackbar,
      snackbarColor,
      snackbarText,

      // Computed
      canEncrypt,
      isFilePopulated,
      isOutputPopulated,
      isPasswordConfirmed,
      isPlaintextPopulated,

      // Methods
      clearOutputs,
      clearPlainText,
      encryptFile,
      handleCopy,
      handleFileValidation,
      handlePaste,
      handlePlainTextChange
    };
  }
};
</script>
