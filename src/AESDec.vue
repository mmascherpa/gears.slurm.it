<template>
  <div>
    <!-- Page Header -->
    <ToolPageHeader
      icon="mdi-lock-open"
      title="AES Decryption"
      description="Decrypt password-protected AES encrypted files"
      avatar-color="primary-darken-1"
    />

    <!-- Form -->
    <form @submit.prevent="decryptFile">
      <!-- Hidden username field for browser accessibility compliance -->
      <input type="text" name="username" autocomplete="username" style="display: none;" aria-hidden="true">

      <!-- Password Section -->
      <v-card class="mb-4" elevation="2">
        <v-card-title class="bg-surface-variant">
          <v-icon icon="mdi-key" class="mr-2"></v-icon>
          Enter Password
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="password"
                name="password"
                label="Decryption Password"
                type="password"
                variant="outlined"
                density="comfortable"
                placeholder="Enter the password used for encryption"
                prepend-inner-icon="mdi-lock-open"
                autocomplete="current-password"
                hide-details>
              </v-text-field>
              <PasswordStrengthIndicator
                :password="password"
                :show-requirements="false"
                :show-feedback="false" />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- File Upload Section -->
      <v-card class="mb-4" elevation="2">
        <v-card-title class="bg-surface-variant">
          <v-icon icon="mdi-file-lock" class="mr-2"></v-icon>
          Encrypted File
        </v-card-title>
        <v-card-text class="pa-4">
          <FileUploadWithValidation
            v-model="encryptedFile"
            label="Select encrypted file (.aes)"
            accept=".aes"
            button-text="Decrypt"
            button-icon="mdi-lock-open"
            :can-submit="canDecrypt"
            @submit="decryptFile"
            @validation-change="handleFileValidation"
          />
        </v-card-text>
      </v-card>
    </form>

    <!-- Error Card -->
    <v-card v-if="error" variant="tonal" color="error" elevation="2" class="mb-4">
      <v-card-text class="pa-4">
        <div class="d-flex align-start">
          <v-icon icon="mdi-alert-circle" size="32" color="error" class="mr-4 mt-1"></v-icon>
          <div class="flex-grow-1">
            <div class="text-h6 font-weight-medium mb-2">Decryption Failed</div>
            <div class="text-body-1">{{ error }}</div>
          </div>
          <v-btn icon size="small" variant="text" @click="error = ''" class="ml-2">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Plain Text Output -->
    <v-card v-if="plainText" variant="tonal" elevation="2" class="mb-4">
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-text" class="mr-2"></v-icon>
        Decrypted Text
        <v-spacer></v-spacer>
        <v-btn
          v-if="decryptedFileName"
          variant="text"
          color="primary"
          @click="downloadDecryptedText"
          class="mr-2">
          <v-icon start>mdi-download</v-icon>
          Download
        </v-btn>
        <v-btn icon size="small" variant="text" @click="clearOutputs">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pa-4">
        <v-textarea
          v-model="plainText"
          variant="outlined"
          rows="10"
          readonly
          bg-color="grey-lighten-4"
          placeholder="Decrypted text"
          hide-details>
        </v-textarea>
      </v-card-text>
    </v-card>

    <!-- CSV Preview -->
    <v-card v-if="tableData.length" variant="tonal" elevation="2" class="mb-4">
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-table" class="mr-2"></v-icon>
        CSV Preview
        <v-spacer></v-spacer>
        <v-btn
          v-if="decryptedFileName"
          variant="text"
          color="primary"
          @click="downloadDecryptedText"
          class="mr-2">
          <v-icon start>mdi-download</v-icon>
          Download
        </v-btn>
        <v-btn icon size="small" variant="text" @click="clearOutputs">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pa-4">
        <v-row class="mb-4">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="search"
              label="Search"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              hide-details
              single-line
              density="comfortable">
            </v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-data-table
              :headers="tableHeaders"
              :items="tableData"
              :search="search"
              density="comfortable">
              <template #no-data>
                <div class="text-center pa-4">
                  <v-icon size="48" color="grey">mdi-table-off</v-icon>
                  <p class="text-body-2 text-medium-emphasis mt-2">No results to display</p>
                </div>
              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Success Card (file decrypted but no preview) -->
    <v-card v-if="decryptedFileName && !plainText && !tableData.length" variant="tonal" color="success" elevation="2">
      <v-card-text class="d-flex align-center pa-4">
        <v-icon icon="mdi-check-circle" size="32" class="mr-4"></v-icon>
        <div class="flex-grow-1">
          <div class="text-subtitle-1 font-weight-medium">File Decrypted Successfully</div>
          <div class="text-body-2">{{ decryptedFileName }}</div>
        </div>
        <v-btn
          variant="elevated"
          color="white"
          @click="downloadDecryptedText"
          class="mr-2">
          <v-icon start>mdi-download</v-icon>
          Download Again
        </v-btn>
        <v-btn icon size="small" variant="text" @click="clearOutputs">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-text>
    </v-card>

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
      <p class="text-h6 mt-4">Decrypting...</p>
    </v-overlay>
  </div>
</template>

<script>
import { computed, nextTick, ref, watch } from 'vue';
import { downloadFile } from '@/utils/fileDownload';
import { parseCSV } from '@/utils/csvParser';
import { useAESWorker } from '@/composables/useAESWorker';
import { useSnackbar } from '@/composables/useSnackbar';
import FileUploadWithValidation from '@/components/FileUploadWithValidation.vue';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator.vue';
import SharedSnackbar from '@/components/SharedSnackbar.vue';
import ToolPageHeader from '@/components/ToolPageHeader.vue';

export default {
  name: 'AESDec',
  components: {
    FileUploadWithValidation,
    PasswordStrengthIndicator,
    SharedSnackbar,
    ToolPageHeader
  },
  setup() {
    // Constants
    const MAX_PREVIEW_SIZE = 8 * 1024 * 1024; // 8MB

    // Reactive State
    const decryptedData = ref(null);
    const decryptedFileName = ref('');
    const encryptedFile = ref(null);
    const error = ref('');
    const password = ref('');
    const plainText = ref('');
    const search = ref('');
    const tableData = ref([]);
    const tableHeaders = ref([]);

    // Composables
    const { snackbar, snackbarColor, snackbarText, showSnackbar } = useSnackbar();

    // AES Worker for decryption
    const { decrypt, isLoading } = useAESWorker(
      // onSuccess callback
      (data, fileName) => {
        handleDecryptionSuccess(data, fileName);
      },
      // onError callback
      (friendlyMessage, rawError) => {
        error.value = rawError;
        showSnackbar(friendlyMessage, 'error');
      }
    );

    // Computed Properties

    /**
     * Checks if decryption is possible with valid inputs.
     */
    const canDecrypt = computed(() => {
      return isPasswordPopulated.value && isFilePopulated.value;
    });

    /**
     * Checks if a file has been uploaded.
     */
    const isFilePopulated = computed(() => {
      return encryptedFile.value && encryptedFile.value.length > 0;
    });

    /**
     * Checks if any output is populated.
     */
    const isOutputPopulated = computed(() => {
      return !!plainText.value || tableHeaders.value.length > 0 || tableData.value.length > 0;
    });

    /**
     * Checks if a password has been entered.
     */
    const isPasswordPopulated = computed(() => {
      return password.value.trim() !== '';
    });

    // Functions

    /**
     * Clears all input fields.
     */
    const clearInputs = () => {
      password.value = '';
      encryptedFile.value = null;
    };

    /**
     * Clears all output fields.
     */
    const clearOutputs = () => {
      plainText.value = '';
      tableData.value = [];
      tableHeaders.value = [];
      search.value = '';
      decryptedData.value = null;
      decryptedFileName.value = '';
    };

    /**
     * Initiates file decryption.
     */
    const decryptFile = () => {
      if (!canDecrypt.value) {
        showSnackbar('Invalid inputs', 'error');
        return;
      }

      error.value = '';
      decrypt(encryptedFile.value[0], password.value, encryptedFile.value[0].name);
    };

    /**
     * Downloads the decrypted file.
     */
    const downloadDecryptedText = () => {
      if (decryptedData.value && decryptedFileName.value) {
        downloadFile(decryptedData.value, decryptedFileName.value);
        showSnackbar('✓ File downloaded successfully!', 'success');
      }
    };

    /**
     * Handles successful decryption and determines preview/download strategy.
     */
    const handleDecryptionSuccess = (data, fileName) => {
      decryptedData.value = data;
      decryptedFileName.value = fileName;

      // Handle CSV files
      if (fileName.endsWith(".csv")) {
        const withinSizeLimit = data.byteLength <= MAX_PREVIEW_SIZE;

        if (withinSizeLimit) {
          const parsedCSV = parseCSV(data);
          tableHeaders.value = parsedCSV.headers;
          tableData.value = parsedCSV.data;

          const sizeKB = (data.byteLength / 1024).toFixed(2);
          showSnackbar(`✓ CSV file decrypted (${sizeKB} KB) - Preview shown`, 'success');
        } else {
          downloadFile(data, fileName);
          const sizeMB = (data.byteLength / (1024 * 1024)).toFixed(2);
          showSnackbar(`✓ CSV file decrypted (${sizeMB} MB) - Too large to preview, downloaded`, 'info');
        }

        clearInputs();
        return;
      }

      // Handle text files
      if (shouldPreviewAsText(fileName, data)) {
        const decodedText = new TextDecoder().decode(data);
        plainText.value = decodedText;

        const sizeKB = (data.byteLength / 1024).toFixed(2);
        showSnackbar(`✓ Text file decrypted (${sizeKB} KB) - Preview shown`, 'success');
        clearInputs();
        return;
      }

      // For all other files, auto-download
      downloadFile(data, fileName);

      if (data.byteLength > MAX_PREVIEW_SIZE) {
        const sizeMB = (data.byteLength / (1024 * 1024)).toFixed(2);
        showSnackbar(`✓ File decrypted (${sizeMB} MB) - Too large to preview, downloaded`, 'info');
      } else {
        showSnackbar('✓ File decrypted and downloaded!', 'success');
      }

      clearInputs();
    };

    /**
     * Handles file validation (validation handled by FileUploadWithValidation component).
     */
    const handleFileValidation = () => {
      // Validation handled by FileUploadWithValidation component
    };

    /**
     * Determines if a file should be previewed as text based on extension and size.
     */
    const shouldPreviewAsText = (fileName, data) => {
      const textExtensions = ['.txt', '.md', '.json', '.xml', '.html', '.css', '.js', '.log', '.yaml', '.yml'];
      const hasTextExtension = textExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
      const withinSizeLimit = data.byteLength <= MAX_PREVIEW_SIZE;
      return hasTextExtension && withinSizeLimit;
    };

    // Watchers

    watch(encryptedFile, () => {
      if (isOutputPopulated.value || decryptedFileName.value) {
        clearOutputs();
      }
    });

    watch(password, () => {
      if (isOutputPopulated.value || decryptedFileName.value) {
        clearOutputs();
      }
    });

    return {
      // State
      decryptedFileName,
      encryptedFile,
      error,
      isLoading,
      password,
      plainText,
      search,
      tableData,
      tableHeaders,

      // Snackbar
      snackbar,
      snackbarColor,
      snackbarText,

      // Computed
      canDecrypt,
      isFilePopulated,
      isPasswordPopulated,

      // Methods
      clearOutputs,
      decryptFile,
      downloadDecryptedText,
      handleFileValidation
    };
  }
};
</script>
