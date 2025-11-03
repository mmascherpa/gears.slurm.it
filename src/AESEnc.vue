<template>
  <div>
    <!-- Page Header -->
    <ToolPageHeader
      icon="mdi-lock"
      title="AES Encryption"
      description="Secure your files with password-protected AES encryption"
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
              maxlength="1024"
              placeholder="Enter encryption password"
              prepend-inner-icon="mdi-lock"
              hide-details>
            </v-text-field>
            <PasswordStrengthIndicator
              :password="password"
              :show-requirements="true"
              :show-feedback="true" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="passwordConfirm"
              label="Confirm Password"
              type="password"
              variant="outlined"
              density="comfortable"
              autocomplete="new-password"
              maxlength="1024"
              placeholder="Confirm encryption password"
              prepend-inner-icon="mdi-lock-check"
              :error="password !== '' && passwordConfirm !== '' && password !== passwordConfirm"
              :success="isPasswordConfirmed"
              hide-details>
            </v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Text Encryption Section -->
    <v-card class="mb-4" elevation="2">
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
          @paste="handlePaste"
          @clear="plainText = ''"
        />
      </v-card-text>
    </v-card>

    <!-- File Encryption Section -->
    <v-card class="mb-4" elevation="2">
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
    <v-card v-if="isOutputPopulated" variant="tonal" elevation="2">
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-table" class="mr-2"></v-icon>
        CSV Preview
        <v-spacer></v-spacer>
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
import { computed, ref } from 'vue';
import { downloadFile } from '@/utils/fileDownload';
import { parseCSV } from '@/utils/csvParser';
import { useAESWorker } from '@/composables/useAESWorker';
import { useClipboard } from '@/composables/useClipboard';
import { useSnackbar } from '@/composables/useSnackbar';
import FileUploadWithValidation from '@/components/FileUploadWithValidation.vue';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator.vue';
import SharedSnackbar from '@/components/SharedSnackbar.vue';
import TextInputWithActions from '@/components/TextInputWithActions.vue';
import ToolPageHeader from '@/components/ToolPageHeader.vue';

export default {
  name: 'AESEnc',
  components: {
    FileUploadWithValidation,
    PasswordStrengthIndicator,
    SharedSnackbar,
    TextInputWithActions,
    ToolPageHeader
  },
  setup() {
    // Reactive State
    const error = ref('');
    const password = ref('');
    const passwordConfirm = ref('');
    const plainFile = ref(null);
    const plainText = ref('');
    const search = ref('');
    const tableData = ref([]);
    const tableHeaders = ref([]);

    // Composables
    const { snackbar, snackbarColor, snackbarText, showSnackbar } = useSnackbar();
    const { pasteFromClipboard } = useClipboard();

    // AES Worker for encryption
    const { encrypt, isLoading } = useAESWorker(
      // onSuccess callback
      (data, fileName) => {
        downloadFile(data, fileName);
        showSnackbar('✓ File encrypted successfully!', 'success');
        clearInputs();
      },
      // onError callback
      (friendlyMessage, rawError) => {
        error.value = rawError;
        showSnackbar(friendlyMessage, 'error');
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
      return plainFile.value && plainFile.value.length > 0;
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
     */
    const clearInputs = () => {
      password.value = '';
      passwordConfirm.value = '';
      plainText.value = '';
      plainFile.value = null;
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
        fileData = plainFile.value[0];
        fileName = plainFile.value[0].name;
      }

      if (fileData && fileName) {
        encrypt(fileData, password.value, fileName);
      }
    };

    /**
     * Handles file validation and CSV preview.
     */
    const handleFileValidation = (result) => {
      if (plainFile.value && plainFile.value.length > 0 && result.isValid) {
        const selectedFile = plainFile.value[0];
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
     * Pastes text from clipboard.
     */
    const handlePaste = async () => {
      await pasteFromClipboard(
        (pastedText, message) => {
          plainText.value = pastedText;
          showSnackbar(message, 'success');
        },
        (message) => showSnackbar(message, 'error')
      );
    };

    return {
      // State
      error,
      isLoading,
      password,
      passwordConfirm,
      plainFile,
      plainText,
      search,
      tableData,
      tableHeaders,

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
      encryptFile,
      handleFileValidation,
      handlePaste
    };
  }
};
</script>
