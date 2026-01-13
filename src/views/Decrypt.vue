<template>
  <div>
    <!-- Page Header -->
    <ToolPageHeader
      icon="mdi-lock-open"
      title="Decryption"
      description="Decrypt password-protected encrypted files and text"
      avatar-color="primary-darken-1"
    />

    <!-- Tier 1: Educational Panel -->
    <LearnMorePanel
      :title="infoPanelTitle"
      storage-key="slurm-help-decrypt"
    >
      <!-- jsAesCrypt Content -->
      <template v-if="selectedAlgorithm === 'jsAesCrypt'">
        <p class="mb-2">
          <strong>AES decryption</strong> reverses the AES-256 encryption process, converting encrypted data back
          to its original form using the same password that was used for encryption.
        </p>
        <ul class="ml-4 mb-2">
          <li><strong>Password required</strong> - You must use the EXACT same password that was used to encrypt the data</li>
          <li><strong>Case-sensitive</strong> - "Password123" and "password123" are different passwords</li>
          <li><strong>No recovery</strong> - If you forgot the password, the data cannot be decrypted</li>
          <li><strong>Secure process</strong> - Decryption happens entirely in your browser, nothing is sent to any server</li>
        </ul>
        <EducationalAlert title="Password Must Match Exactly" type="warning" spacing="mt-3">
          The decryption password must be identical to the encryption password. Even a single character
          difference will result in failed decryption. There is no "close enough" - it must be exact.
        </EducationalAlert>
        <p class="mt-3 mb-2">
          <strong>Common use cases:</strong> Decrypting files from cloud storage, accessing encrypted backups,
          retrieving protected documents.
        </p>

        <!-- Reference Links -->
        <div class="text-caption text-medium-emphasis mt-3">
          <strong>Learn more:</strong>
          <a href="https://en.wikipedia.org/wiki/Advanced_Encryption_Standard" target="_blank" rel="noopener noreferrer" class="text-info">
            Wikipedia: AES
          </a>
          •
          <a href="https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines/archived-crypto-projects/aes-development" target="_blank" rel="noopener noreferrer" class="text-info">
            NIST: AES Standard
          </a>
          •
          <a href="https://github.com/BrightSoul/javascript-aes-file-encryption" target="_blank" rel="noopener noreferrer" class="text-info">
            jsAesCrypt
          </a>
        </div>

        <!-- Technical Details -->
        <div class="text-caption text-medium-emphasis mt-2">
          <strong>Technical:</strong> AES-256-CBC cipher mode with PBKDF2 key derivation (10,000 iterations).
          Compatible with .aes files encrypted using AES Crypt format.
        </div>
      </template>

      <!-- WebCrypto Content -->
      <template v-else-if="selectedAlgorithm === 'webCrypto'">
        <p class="mb-2">
          <strong>WebCrypto decryption</strong> uses the browser's native Web Cryptography API to decrypt AES-256-GCM
          encrypted data back to its original form using the password.
        </p>
        <ul class="ml-4 mb-2">
          <li><strong>Password required</strong> - You must use the EXACT same password that was used to encrypt the data</li>
          <li><strong>Case-sensitive</strong> - "Password123" and "password123" are different passwords</li>
          <li><strong>GCM mode</strong> - Authenticated encryption automatically verifies data integrity</li>
          <li><strong>Hardware-accelerated</strong> - Faster decryption using CPU crypto instructions</li>
        </ul>
        <EducationalAlert title="Password Must Match Exactly" type="warning" spacing="mt-3">
          The decryption password must be identical to the encryption password. Even a single character
          difference will result in failed decryption. There is no "close enough" - it must be exact.
        </EducationalAlert>
        <p class="mt-3 mb-2">
          <strong>Common use cases:</strong> Decrypting browser-encrypted files, high-performance decryption,
          accessing modern encrypted backups.
        </p>

        <!-- Reference Links -->
        <div class="text-caption text-medium-emphasis mt-3">
          <strong>Learn more:</strong>
          <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API" target="_blank" rel="noopener noreferrer" class="text-info">
            MDN: Web Crypto API
          </a>
          •
          <a href="https://www.w3.org/TR/WebCryptoAPI/" target="_blank" rel="noopener noreferrer" class="text-info">
            W3C Specification
          </a>
        </div>

        <!-- Technical Details -->
        <div class="text-caption text-medium-emphasis mt-2">
          <strong>Technical:</strong> AES-256-GCM authenticated encryption with PBKDF2 key derivation (100,000 iterations).
          Browser-native Web Crypto API. Decrypts .enc files.
        </div>
      </template>

      <!-- Age Content -->
      <template v-else-if="selectedAlgorithm === 'age'">
        <p class="mb-2">
          <strong>Age decryption</strong> reverses age encryption, converting encrypted .age files back to their
          original form using the passphrase.
        </p>
        <ul class="ml-4 mb-2">
          <li><strong>Passphrase required</strong> - You must use the EXACT same passphrase that was used to encrypt the data</li>
          <li><strong>Case-sensitive</strong> - "Passphrase123" and "passphrase123" are different passphrases</li>
          <li><strong>CLI-compatible</strong> - Works with age and rage command-line tools</li>
          <li><strong>Armor format</strong> - Supports both binary and ASCII-armored .age files</li>
        </ul>
        <EducationalAlert title="Passphrase Must Match Exactly" type="warning" spacing="mt-3">
          The decryption passphrase must be identical to the encryption passphrase. Even a single character
          difference will result in failed decryption. There is no "close enough" - it must be exact.
        </EducationalAlert>
        <p class="mt-3 mb-2">
          <strong>Common use cases:</strong> Decrypting age-encrypted backups, cross-platform file decryption,
          scripting workflows, command-line integration.
        </p>

        <!-- Reference Links -->
        <div class="text-caption text-medium-emphasis mt-3">
          <strong>Learn more:</strong>
          <a href="https://age-encryption.org" target="_blank" rel="noopener noreferrer" class="text-info">
            Age specification
          </a>
          •
          <a href="https://github.com/FiloSottile/age" target="_blank" rel="noopener noreferrer" class="text-info">
            Age on GitHub
          </a>
          •
          <a href="https://github.com/str4d/rage" target="_blank" rel="noopener noreferrer" class="text-info">
            rage (Rust)
          </a>
        </div>

        <!-- Technical Details -->
        <div class="text-caption text-medium-emphasis mt-2">
          <strong>Technical:</strong> Uses rage-wasm (Rust compiled to WebAssembly) with scrypt password derivation.
          Decrypts .age files with optional armor format.
        </div>
      </template>
    </LearnMorePanel>

    <!-- Form -->
    <form @submit.prevent="decryptFile">
      <!-- Hidden username field for browser accessibility compliance -->
      <input type="text" name="username" autocomplete="username" style="display: none;" aria-hidden="true">

      <!-- Algorithm Selection Card -->
      <v-card class="mb-4">
        <v-card-title class="bg-surface-variant">
          <v-icon icon="mdi-shield-lock" class="mr-2"></v-icon>
          Encryption Algorithm
        </v-card-title>
        <v-card-text class="pa-4">
          <v-radio-group v-model="selectedAlgorithm" inline>
            <v-radio
              value="jsAesCrypt"
            >
              <template #label>
                <div>
                  <div class="font-weight-medium">AES-256 (jsAesCrypt)</div>
                  <div class="text-caption text-medium-emphasis">Compatible with AES Crypt format (.aes files)</div>
                </div>
              </template>
            </v-radio>
            <v-radio
              value="webCrypto"
            >
              <template #label>
                <div>
                  <div class="font-weight-medium">AES-256 (WebCrypto)</div>
                  <div class="text-caption text-medium-emphasis">Browser-native encryption (.enc files)</div>
                </div>
              </template>
            </v-radio>
            <v-radio
              value="age"
            >
              <template #label>
                <div>
                  <div class="font-weight-medium">Age Encryption</div>
                  <div class="text-caption text-medium-emphasis">Modern encryption format (.age files)</div>
                </div>
              </template>
            </v-radio>
          </v-radio-group>

          <v-alert
            v-if="selectedAlgorithm === 'age'"
            type="info"
            variant="tonal"
            density="compact"
            class="mt-2"
          >
            Age encrypted files (.age) are compatible with the
            <a href="https://age-encryption.org" target="_blank" class="text-info">age CLI tool</a>
          </v-alert>
        </v-card-text>
      </v-card>

      <!-- Password Section -->
      <v-card class="mb-4">
        <v-card-title class="bg-surface-variant">
          <v-icon icon="mdi-key" class="mr-2"></v-icon>
          Enter Password
        </v-card-title>
        <v-card-text class="pa-4">
          <PasswordInput
            v-model:password="password"
            :require-confirmation="false"
            :show-strength="true"
            :show-requirements="false"
            :show-feedback="false"
            autocomplete="current-password"
            password-label="Decryption Password"
            password-placeholder="Enter the password used for encryption"
            password-icon="mdi-lock-open"
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
        </v-card-text>
      </v-card>

      <!-- Text Decryption Section -->
      <v-card class="mb-4">
        <v-card-title class="bg-surface-variant">
          <v-icon icon="mdi-lock" class="mr-2"></v-icon>
          Encrypted Text
        </v-card-title>
        <v-card-text class="pa-4">
          <TextInputWithActions
            v-model="encryptedText"
            label="Paste encrypted Base64 text"
            placeholder="Paste the encrypted text here..."
            :rows="4"
            :disabled="isFilePopulated"
            :show-paste="!isFilePopulated"
            :show-clear="true"
            :show-copy="false"
            test-id="encrypted-text-input"
            @paste="handlePaste"
            @clear="clearEncryptedText"
            @input="handleEncryptedTextChange"
          />

          <v-divider class="my-4"></v-divider>

          <TextInputWithActions
            v-model="decryptedText"
            label="Decrypted Text"
            placeholder="Decrypted output will appear here..."
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

      <!-- File Upload Section -->
      <v-card class="mb-4">
        <v-card-title class="bg-surface-variant">
          <v-icon icon="mdi-file-lock" class="mr-2"></v-icon>
          Encrypted File
        </v-card-title>
        <v-card-text class="pa-4">
          <FileUploadWithValidation
            v-model="encryptedFile"
            label="Select encrypted file (.aes or .age)"
            accept=".aes,.age"
            button-text="Decrypt"
            button-icon="mdi-lock-open"
            :disabled="isEncryptedTextPopulated"
            :can-submit="canDecrypt"
            @submit="decryptFile"
            @validation-change="handleFileValidation"
          />
        </v-card-text>
      </v-card>
    </form>

    <!-- Error Card -->
    <v-card v-if="error" variant="tonal" color="error" class="mb-4">
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
    <v-card v-if="plainText" variant="tonal" class="mb-4">
      <v-card-title class="d-flex align-center" data-testid="file-info">
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
          data-testid="file-preview"
          hide-details>
        </v-textarea>
      </v-card-text>
    </v-card>

    <!-- CSV Preview -->
    <CsvPreviewTable
      :headers="tableHeaders"
      :data="tableData"
      :show-download="!!decryptedFileName"
      card-class="mb-4"
      test-id="file-preview"
      @close="clearOutputs"
      @download="downloadDecryptedText"
    />

    <!-- Success Card (file decrypted but no preview) -->
    <v-card v-if="decryptedFileName && !plainText && !tableData.length" variant="tonal" color="success">
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
import { computed, ref, watch } from 'vue';
import { downloadFile } from '@/utils/fileDownload';
import { parseCSV } from '@/utils/csvParser';
import { useCryptoWorker } from '@/composables/useCryptoWorker';
import { useClipboard } from '@/composables/useClipboard';
import { useDebounce } from '@/composables/useDebounce';
import { usePasswordSession } from '@/composables/usePasswordSession';
import { useSnackbar } from '@/composables/useSnackbar';
import CsvPreviewTable from '@/components/CsvPreviewTable.vue';
import EducationalAlert from '@/components/EducationalAlert.vue';
import FileUploadWithValidation from '@/components/FileUploadWithValidation.vue';
import LearnMorePanel from '@/components/LearnMorePanel.vue';
import PasswordInput from '@/components/PasswordInput.vue';
import SharedSnackbar from '@/components/SharedSnackbar.vue';
import TextInputWithActions from '@/components/TextInputWithActions.vue';
import ToolPageHeader from '@/components/ToolPageHeader.vue';

export default {
  name: 'Decrypt',
  components: {
    CsvPreviewTable,
    EducationalAlert,
    FileUploadWithValidation,
    LearnMorePanel,
    PasswordInput,
    SharedSnackbar,
    TextInputWithActions,
    ToolPageHeader
  },
  setup() {
    // Constants
    const MAX_PREVIEW_SIZE = 8 * 1024 * 1024; // 8MB

    // Reactive State
    const decryptedData = ref(null);
    const decryptedFileName = ref('');
    const decryptedText = ref('');
    const encryptedFile = ref(null);
    const encryptedText = ref('');
    const error = ref('');
    const password = ref('');
    const plainText = ref('');
    const selectedAlgorithm = ref('jsAesCrypt'); // Default to jsAesCrypt for backwards compatibility
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
    } = usePasswordSession('decrypt');

    // Auto-load saved password from session on mount
    const storedPassword = autoLoadPassword();
    if (storedPassword) {
      password.value = storedPassword;
    }

    // Crypto Worker for decryption
    const { decrypt, isLoading } = useCryptoWorker(
      // onSuccess callback
      (data, fileName) => {
        // Text decryption: display inline
        if (isEncryptedTextPopulated.value) {
          handleTextDecryptionSuccess(data);
        } else {
          // File decryption: handle preview/download
          handleDecryptionSuccess(data, fileName);
        }
      },
      // onError callback
      (friendlyMessage, rawError) => {
        error.value = rawError;
        showSnackbar(friendlyMessage, 'error');
        decryptedText.value = '';
      }
    );

    // Computed Properties

    /**
     * Dynamic info panel title based on selected algorithm.
     */
    const infoPanelTitle = computed(() => {
      const titles = {
        jsAesCrypt: 'How Does AES Decryption Work?',
        webCrypto: 'How Does WebCrypto Decryption Work?',
        age: 'How Does Age Decryption Work?'
      };
      return titles[selectedAlgorithm.value] || 'How Does Decryption Work?';
    });

    /**
     * Checks if decryption is possible with valid inputs.
     */
    const canDecrypt = computed(() => {
      return isPasswordPopulated.value && (isFilePopulated.value || isEncryptedTextPopulated.value);
    });

    /**
     * Checks if encrypted text has been entered.
     */
    const isEncryptedTextPopulated = computed(() => {
      return encryptedText.value.trim() !== '';
    });

    /**
     * Checks if a file has been uploaded.
     */
    const isFilePopulated = computed(() => {
      return !!encryptedFile.value;
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
     * Preserves password if session memory is enabled.
     */
    const clearInputs = () => {
      // Only clear password if not remembered for session
      if (!rememberPassword.value) {
        password.value = '';
      }
      encryptedFile.value = null;
      encryptedText.value = '';
    };

    /**
     * Clears all output fields.
     */
    const clearOutputs = () => {
      plainText.value = '';
      decryptedText.value = '';
      tableData.value = [];
      tableHeaders.value = [];
      decryptedData.value = null;
      decryptedFileName.value = '';
    };

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
     * Converts Base64 encrypted text to binary for decryption.
     */
    const convertFromBase64 = () => {
      try {
        const binaryString = atob(encryptedText.value);
        const bytes = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes]);
        return blob;
      } catch (err) {
        console.error('Base64 decode error:', err);
        error.value = 'Invalid Base64 format';
        showSnackbar('❌ Invalid encrypted text format', 'error');
        return null;
      }
    };

    /**
     * Decrypts text (for auto-decryption).
     */
    const decryptText = () => {
      if (!canDecrypt.value) return;

      error.value = '';
      decryptedText.value = '';

      const encryptedBlob = convertFromBase64();
      if (!encryptedBlob) return;

      decrypt(encryptedBlob, password.value, 'encrypted.aes', selectedAlgorithm.value);
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
      decrypt(encryptedFile.value, password.value, encryptedFile.value.name, selectedAlgorithm.value);
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
     * Handles successful text decryption.
     */
    const handleTextDecryptionSuccess = (data) => {
      try {
        const decodedText = new TextDecoder().decode(data);
        decryptedText.value = decodedText;
        showSnackbar('✓ Text decrypted successfully!', 'success');
      } catch (err) {
        console.error('Text decode error:', err);
        error.value = 'Failed to decode decrypted data';
        showSnackbar('❌ Decryption failed', 'error');
      }
    };

    /**
     * Handles file validation updates from FileUploadWithValidation component
     *
     * NOTE: This handler intentionally does nothing. File validation state is fully
     * managed by FileUploadWithValidation component. The handler exists to fulfill
     * the component's @validation-change event contract and may be used in the
     * future if additional validation logic is needed.
     *
     * @param {Object} validation - Validation result from FileUploadWithValidation
     */
    const handleFileValidation = () => {
      // Intentionally empty - validation handled by component
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
     * Pastes encrypted text from clipboard.
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

    /**
     * Handles encrypted text input change.
     */
    const handleEncryptedTextChange = () => {
      decryptedText.value = '';
      error.value = '';
      debouncedDecrypt();
    };

    // Debounced decryption (800ms for crypto operations)
    const { cancel: cancelDecryption, debounce: debouncedDecrypt } = useDebounce(() => {
      if (canDecrypt.value && isEncryptedTextPopulated.value) {
        decryptText();
      }
    }, 800);

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

    watch(encryptedFile, (newVal) => {
      // Auto-detect algorithm from file extension
      if (newVal) {
        if (newVal.name.endsWith('.age')) {
          selectedAlgorithm.value = 'age';
        } else if (newVal.name.endsWith('.aes')) {
          selectedAlgorithm.value = 'jsAesCrypt';
        } else if (newVal.name.endsWith('.enc')) {
          selectedAlgorithm.value = 'webCrypto';
        }
      }

      // Only clear outputs if user is changing to a different file
      // Don't clear if encryptedFile is being set to null (clearing inputs after successful decryption)
      if (newVal && (isOutputPopulated.value || decryptedFileName.value)) {
        clearOutputs();
      }
    });

    // Watch checkbox state - immediately save password when checkbox is checked
    watch(rememberPassword, (shouldRemember) => {
      if (shouldRemember && password.value) {
        saveSessionPassword(password.value);
      }
    });

    // Watch password changes - save to session if checkbox is checked
    watch(password, (newVal, oldVal) => {
      // Save password to session if checkbox is checked and password exists
      if (rememberPassword.value && newVal) {
        saveSessionPassword(newVal);
      }

      // Only clear outputs if user is actively changing the password (not just clearing it)
      if (newVal && newVal !== oldVal && (isOutputPopulated.value || decryptedFileName.value)) {
        clearOutputs();
      }
      // Trigger text decryption if encrypted text exists
      if (isEncryptedTextPopulated.value) {
        decryptedText.value = '';
        error.value = '';
        debouncedDecrypt();
      }
    });

    return {
      // State
      decryptedFileName,
      decryptedText,
      encryptedFile,
      encryptedText,
      error,
      isLoading,
      password,
      plainText,
      selectedAlgorithm,
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
      canDecrypt,
      infoPanelTitle,
      isEncryptedTextPopulated,
      isFilePopulated,
      isPasswordPopulated,

      // Methods
      clearEncryptedText,
      clearOutputs,
      decryptFile,
      downloadDecryptedText,
      handleCopy,
      handleEncryptedTextChange,
      handleFileValidation,
      handlePaste
    };
  }
};
</script>
