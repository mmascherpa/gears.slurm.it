<template>
  <div>
    <!-- Page Header -->
    <ToolPageHeader
      icon="mdi-lock"
      title="Encryption"
      description="Encrypt files and text with password protection using military-grade encryption"
      avatar-color="primary"
    />

    <!-- Tier 1: Educational Panel -->
    <LearnMorePanel
      :title="infoPanelTitle"
      storage-key="slurm-help-encrypt"
    >
      <!-- jsAesCrypt Content -->
      <template v-if="preferences.selectedAlgorithm === 'jsAesCrypt'">
        <p class="mb-2">
          <strong>AES (Advanced Encryption Standard)</strong> is a military-grade encryption algorithm
          trusted by governments and organizations worldwide to protect sensitive data.
        </p>
        <ul class="ml-4 mb-2">
          <li><strong>AES-256</strong> - This tool uses 256-bit keys, the strongest AES variant</li>
          <li><strong>Password-based</strong> - Your password is converted into an encryption key</li>
          <li><strong>Cross-platform</strong> - Compatible with desktop AES Crypt applications</li>
          <li><strong>Unbreakable</strong> - With a strong password, AES-256 would take billions of years to crack</li>
        </ul>
        <EducationalAlert title="Important Limitation" type="warning" spacing="mt-3">
          If you forget your password, your encrypted data <strong>cannot be recovered</strong>.
          There is no "reset password" option - the password IS the key.
        </EducationalAlert>
        <p class="mt-3 mb-2">
          <strong>Common use cases:</strong> Encrypt sensitive documents before uploading to cloud storage,
          secure backups, protect confidential files on shared computers.
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
          Uses jsAesCrypt and CryptoJS libraries. Produces .aes files compatible with AES Crypt format.
        </div>
      </template>

      <!-- WebCrypto Content -->
      <template v-else-if="preferences.selectedAlgorithm === 'webCrypto'">
        <p class="mb-2">
          <strong>Web Cryptography API</strong> provides browser-native AES-256 encryption with hardware acceleration,
          offering fast, secure encryption without external libraries.
        </p>
        <ul class="ml-4 mb-2">
          <li><strong>AES-256-GCM</strong> - Modern authenticated encryption mode that prevents tampering</li>
          <li><strong>Hardware-accelerated</strong> - Uses CPU crypto instructions for optimal performance</li>
          <li><strong>Browser-native</strong> - Built into modern browsers, no external dependencies</li>
          <li><strong>High security</strong> - PBKDF2 with 100,000 iterations for strong key derivation</li>
        </ul>
        <EducationalAlert title="Important Limitation" type="warning" spacing="mt-3">
          If you forget your password, your encrypted data <strong>cannot be recovered</strong>.
          There is no "reset password" option - the password IS the key.
        </EducationalAlert>
        <p class="mt-3 mb-2">
          <strong>Common use cases:</strong> Fast encryption for modern browsers, maximum compatibility,
          browser-based secure storage, privacy-focused applications.
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
          Browser-native Web Crypto API. Produces .enc files.
        </div>
      </template>

      <!-- Age Content -->
      <template v-else-if="preferences.selectedAlgorithm === 'age'">
        <p class="mb-2">
          <strong>Age encryption</strong> is a modern, simple file encryption tool designed as a replacement for GPG.
          Created by Filippo Valsorda, it focuses on simplicity and ease of use.
        </p>
        <ul class="ml-4 mb-2">
          <li><strong>Simple format</strong> - Compact, easy-to-use encryption format</li>
          <li><strong>CLI-compatible</strong> - Works with age and rage command-line tools</li>
          <li><strong>scrypt derivation</strong> - Secure against GPU-based password cracking</li>
          <li><strong>Work factor 18</strong> - This app uses work factor 18 (same as age CLI, ~1 second, 256MB memory)</li>
          <li><strong>Meets security standards</strong> - Work factor 18 meets OWASP 2026 minimum recommendations</li>
        </ul>
        <EducationalAlert title="What is Work Factor?" type="info" spacing="mt-3">
          <strong>Work factor</strong> determines how much computational effort is required to decrypt your file.
          Higher work factors provide better protection against brute-force attacks but require more memory.
          This app uses work factor 18 (same as age CLI default), which meets current security standards.
        </EducationalAlert>
        <EducationalAlert title="Important Limitation" type="warning" spacing="mt-3">
          If you forget your password, your encrypted data <strong>cannot be recovered</strong>.
          There is no "reset password" option - the password IS the key.
        </EducationalAlert>
        <p class="mt-3 mb-2">
          <strong>Common use cases:</strong> Cross-platform encrypted backups, scripting and automation,
          developer workflows, command-line integration.
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
          <strong>Technical:</strong> Uses rage-wasm (Rust compiled to WebAssembly) with scrypt password derivation (work factor 18).
          Produces binary .age files. Fully compatible with age/rage CLI tools (both use work factor 18 default).
        </div>
      </template>

      <!-- OpenPGP Content -->
      <template v-else-if="preferences.selectedAlgorithm === 'openpgp'">
        <p class="mb-2">
          <strong>OpenPGP</strong> is the IETF-standardized encryption format (RFC 9580) used by GnuPG and PGP
          since the 1990s. This tool uses OpenPGP.js, the JavaScript implementation maintained by Proton.
        </p>
        <ul class="ml-4 mb-2">
          <li><strong>AES-256</strong> - Strong symmetric encryption with integrity protection (MDC)</li>
          <li><strong>Password-based</strong> - Your password is stretched into a key via S2K derivation</li>
          <li><strong>GnuPG-compatible</strong> - Decrypt files with <code>gpg -d</code> on Linux, macOS or Windows</li>
          <li><strong>Standardized</strong> - A widely supported format, ideal for long-term archival</li>
        </ul>
        <EducationalAlert title="Important Limitation" type="warning" spacing="mt-3">
          If you forget your password, your encrypted data <strong>cannot be recovered</strong>.
          There is no "reset password" option - the password IS the key.
        </EducationalAlert>
        <EducationalAlert title="GnuPG Interoperability" type="info" spacing="mt-3">
          Files encrypted here can be decrypted with any GnuPG 2.x using <code>gpg -d file.gpg</code>.
          Some GnuPG 2.3+ installations encrypt with GnuPG's proprietary OCB mode by default, which browsers cannot read -
          if a gpg-created file fails to decrypt here, re-encrypt it with <code>gpg --rfc4880 -c file</code>.
        </EducationalAlert>
        <p class="mt-3 mb-2">
          <strong>Common use cases:</strong> Exchanging encrypted files with gpg users, decrypting on servers
          in scripts, long-term archival in a standardized format.
        </p>

        <!-- Reference Links -->
        <div class="text-caption text-medium-emphasis mt-3">
          <strong>Learn more:</strong>
          <a href="https://datatracker.ietf.org/doc/html/rfc9580" target="_blank" rel="noopener noreferrer" class="text-info">
            RFC 9580: OpenPGP
          </a>
          •
          <a href="https://gnupg.org" target="_blank" rel="noopener noreferrer" class="text-info">
            GnuPG
          </a>
          •
          <a href="https://github.com/openpgpjs/openpgpjs" target="_blank" rel="noopener noreferrer" class="text-info">
            OpenPGP.js
          </a>
        </div>

        <!-- Technical Details -->
        <div class="text-caption text-medium-emphasis mt-2">
          <strong>Technical:</strong> Uses OpenPGP.js v6 with AES-256 in CFB mode plus MDC integrity protection (SEIPDv1)
          and iterated+salted S2K key derivation. Produces binary .gpg files compatible with gpg -c / gpg -d.
        </div>
      </template>
    </LearnMorePanel>

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

    <!-- Algorithm Selection Card -->
    <v-card class="mb-4">
      <v-card-title class="bg-surface-variant">
        <v-icon icon="mdi-shield-lock" class="mr-2"></v-icon>
        Encryption Algorithm
      </v-card-title>
      <v-card-text class="pa-4">
        <v-radio-group v-model="preferences.selectedAlgorithm" inline>
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
          <v-radio
            value="openpgp"
          >
            <template #label>
              <div>
                <div class="font-weight-medium">OpenPGP (GnuPG)</div>
                <div class="text-caption text-medium-emphasis">Compatible with gpg -c / gpg -d (.gpg files)</div>
              </div>
            </template>
          </v-radio>
        </v-radio-group>

        <v-alert
          v-if="preferences.selectedAlgorithm === 'age'"
          type="info"
          variant="tonal"
          density="compact"
          class="mt-2"
        >
          Age encrypted files (.age) are compatible with the
          <a href="https://age-encryption.org" target="_blank" class="text-info">age CLI tool</a>
        </v-alert>

        <v-alert
          v-if="preferences.selectedAlgorithm === 'openpgp'"
          type="info"
          variant="tonal"
          density="compact"
          class="mt-2"
        >
          OpenPGP encrypted files (.gpg) can be decrypted with the
          <a href="https://gnupg.org" target="_blank" class="text-info">gpg CLI tool</a>
          (gpg -d file.gpg)
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- Password Protection Section -->
    <v-card class="mb-4">
      <v-card-title class="bg-surface-variant">
        <v-icon icon="mdi-key" class="mr-2"></v-icon>
        Password Protection
        <!-- Tier 2: Contextual Tooltip -->
        <InfoTooltip
          text="Password strength directly determines your encryption security. A weak 6-character password can be cracked in minutes, while a strong 16+ character password would take centuries to brute-force."
          location="bottom"
        />
      </v-card-title>
      <v-card-text class="pa-4">
        <!-- Tier 3: Security Alert -->
        <EducationalAlert title="Password Strength Matters" type="info" spacing="mb-3">
          Use at least 12 characters with a mix of uppercase, lowercase, numbers, and symbols.
          Your password security determines how long your encrypted data stays protected.
        </EducationalAlert>

        <form @submit.prevent>
          <!-- Hidden username field for browser accessibility compliance -->
          <input type="text" name="username" autocomplete="username" style="display: none;" aria-hidden="true">

          <PasswordInput
            v-model:password="password"
            v-model:password-confirm="passwordConfirm"
            :require-confirmation="true"
            :show-strength="true"
            :show-requirements="true"
            :show-feedback="false"
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
import { useClipboard } from '@/composables/useClipboard';
import { useCryptoWorker } from '@/composables/useCryptoWorker';
import { useDebounce } from '@/composables/useDebounce';
import { useFocusManagement } from '@/composables/useFocusManagement';
import { usePasswordSession } from '@/composables/usePasswordSession';
import { usePreferences } from '@/composables/usePreferences';
import { useSnackbar } from '@/composables/useSnackbar';
import CsvPreviewTable from '@/components/CsvPreviewTable.vue';
import EducationalAlert from '@/components/EducationalAlert.vue';
import FileUploadWithValidation from '@/components/FileUploadWithValidation.vue';
import InfoTooltip from '@/components/InfoTooltip.vue';
import LearnMorePanel from '@/components/LearnMorePanel.vue';
import PasswordInput from '@/components/PasswordInput.vue';
import SharedSnackbar from '@/components/SharedSnackbar.vue';
import TextInputWithActions from '@/components/TextInputWithActions.vue';
import ToolPageHeader from '@/components/ToolPageHeader.vue';

export default {
  name: 'Encrypt',
  components: {
    CsvPreviewTable,
    EducationalAlert,
    FileUploadWithValidation,
    InfoTooltip,
    LearnMorePanel,
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
    const { announceToScreenReader } = useFocusManagement();
    const { preferences } = usePreferences('encrypt', {
      selectedAlgorithm: 'jsAesCrypt'
    });
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

    // Crypto Worker for encryption
    const { encrypt, isLoading } = useCryptoWorker(
      // onSuccess callback
      (data, fileName) => {
        // Text encryption: convert to Base64 and display
        if (isPlaintextPopulated.value) {
          convertToBase64(data);
          announceToScreenReader('Text encrypted successfully');
        } else {
          // File encryption: download as .aes file
          downloadFile(data, fileName);
          showSnackbar('✓ File encrypted successfully!', 'success');
          announceToScreenReader('File encrypted and download started');
          clearInputs();
        }
      },
      // onError callback
      (friendlyMessage, rawError) => {
        error.value = rawError;
        showSnackbar(friendlyMessage, 'error');
        announceToScreenReader('Encryption failed: ' + friendlyMessage, 'assertive');
        encryptedText.value = '';
      }
    );

    // Computed Properties

    /**
     * Dynamic info panel title based on selected algorithm.
     */
    const infoPanelTitle = computed(() => {
      const titles = {
        jsAesCrypt: 'What is AES Encryption?',
        webCrypto: 'What is WebCrypto AES Encryption?',
        age: 'What is Age Encryption?',
        openpgp: 'What is OpenPGP Encryption?'
      };
      return titles[preferences.selectedAlgorithm] || 'What is Encryption?';
    });

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
        encrypt(fileData, password.value, fileName, preferences.selectedAlgorithm);
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
        encrypt(textBlob, password.value, 'plaintext.txt', preferences.selectedAlgorithm);
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

      // Preferences (persistent)
      preferences,

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
      infoPanelTitle,
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
