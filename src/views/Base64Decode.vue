<template>
  <div>
    <ToolPageHeader
      title="Base64 Decoder"
      description="Decode Base64 text or files back to original format"
      icon="mdi-arrow-up-bold-box"
      avatar-color="secondary-darken-1" />

    <!-- Tier 1: Educational Panel -->
    <LearnMorePanel
      title="What is Base64 Decoding?"
      storage-key="slurm-help-base64-decode"
    >
      <p class="mb-2">
        <strong>Base64 decoding</strong> reverses the encoding process, converting Base64 text back
        into its original binary format (files, images, etc.).
      </p>
      <ul class="ml-4 mb-2">
        <li><strong>No password needed</strong> - Base64 is not encryption, anyone can decode it</li>
        <li><strong>Original size restored</strong> - Decoded data returns to its original size</li>
        <li><strong>Works with any Base64</strong> - Can decode data from any source</li>
      </ul>
      <p class="mt-3 mb-2">
        <strong>Common use cases:</strong> Extracting embedded images from HTML/CSS, decoding API responses,
        recovering files from Base64-encoded email attachments.
      </p>

      <!-- Reference Links -->
      <div class="text-caption text-medium-emphasis mt-3">
        <strong>Learn more:</strong>
        <a href="https://en.wikipedia.org/wiki/Base64" target="_blank" rel="noopener noreferrer" class="text-info">
          Wikipedia: Base64
        </a>
        •
        <a href="https://developer.mozilla.org/en-US/docs/Web/API/atob" target="_blank" rel="noopener noreferrer" class="text-info">
          MDN: atob() Function
        </a>
      </div>
    </LearnMorePanel>

    <v-card class="mb-4">
      <v-card-title class="bg-surface-variant">
        <v-icon icon="mdi-text" class="mr-2"></v-icon>
        Text Decoding
      </v-card-title>
      <v-card-text class="pa-4">
        <TextInputWithActions
          v-model="encodedText"
          label="Base64 Encoded Text"
          placeholder="Enter your Base64 encoded text here"
          :rows="4"
          :is-loading="isLoading"
          :show-paste="true"
          :show-clear="true"
          :show-copy="false"
          test-id="encoded-text-input"
          @paste="handlePaste"
          @clear="handleClear"
          class="mb-4" />

        <v-divider class="my-4"></v-divider>

        <TextInputWithActions
          v-model="plainText"
          label="Decoded Output"
          placeholder="Decoded plain text will appear here"
          :rows="4"
          :is-loading="isLoading"
          :readonly="true"
          :show-paste="false"
          :show-clear="false"
          :show-copy="true"
          test-id="output-text" />
      </v-card-text>
    </v-card>

    <v-card>
      <v-card-title class="bg-surface-variant">
        <v-icon icon="mdi-file" class="mr-2"></v-icon>
        File Decoding
      </v-card-title>
      <v-card-text class="pa-4">
        <FileUploadWithValidation
          v-model="encodedFile"
          label="Select a Base64 file to decode"
          button-text="Decode File"
          button-icon="mdi-arrow-up-bold-box"
          :can-submit="canDecodeFile"
          @submit="decodeFile"
          @validation-change="handleFileValidation" />
      </v-card-text>
    </v-card>

    <!-- Decoded Text Output (for text file preview) -->
    <v-card v-if="decodedFileText" variant="tonal" class="mb-4">
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-file-document" class="mr-2"></v-icon>
        Decoded File Preview
        <v-spacer></v-spacer>
        <v-btn
          v-if="decodedFileName"
          variant="text"
          color="primary"
          @click="downloadDecodedFile"
          class="mr-2">
          <v-icon start>mdi-download</v-icon>
          Download
        </v-btn>
        <v-btn icon size="small" variant="text" @click="clearDecodedOutput">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pa-4">
        <v-textarea
          v-model="decodedFileText"
          label="Decoded Content"
          variant="outlined"
          rows="10"
          readonly
          class="monospace-output"
          data-testid="file-preview"
          hide-details>
        </v-textarea>
      </v-card-text>
    </v-card>

    <!-- CSV Preview -->
    <CsvPreviewTable
      :headers="tableHeaders"
      :data="tableData"
      :show-download="!!decodedFileName"
      card-class="mb-4"
      test-id="file-preview"
      @close="clearDecodedOutput"
      @download="downloadDecodedFile"
    />

    <!-- Success Card (file decoded but no preview) -->
    <v-card v-if="decodedFileName && !decodedFileText && !tableData.length" variant="tonal" color="success">
      <v-card-text class="d-flex align-center pa-4">
        <v-icon icon="mdi-check-circle" size="32" class="mr-4"></v-icon>
        <div class="flex-grow-1">
          <div class="text-subtitle-1 font-weight-medium">File Decoded Successfully</div>
          <div class="text-body-2">{{ decodedFileName }}</div>
        </div>
        <v-btn
          variant="elevated"
          color="white"
          @click="downloadDecodedFile"
          class="mr-2">
          <v-icon start>mdi-download</v-icon>
          Download Again
        </v-btn>
        <v-btn icon size="small" variant="text" @click="clearDecodedOutput">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-text>
    </v-card>

    <SharedSnackbar
      v-model="snackbar"
      :text="snackbarText"
      :color="snackbarColor" />

  </div>
</template>

<script>
import { computed, ref, watch } from 'vue';
import { downloadFile } from '@/utils/fileDownload';
import { parseCSV } from '@/utils/csvParser';
import { validateFileSize } from '@/utils/fileSizeValidator';
import { useClipboard } from '@/composables/useClipboard';
import { useDebounce } from '@/composables/useDebounce';
import { useSnackbar } from '@/composables/useSnackbar';
import CsvPreviewTable from '@/components/CsvPreviewTable.vue';
import FileUploadWithValidation from '@/components/FileUploadWithValidation.vue';
import LearnMorePanel from '@/components/LearnMorePanel.vue';
import SharedSnackbar from '@/components/SharedSnackbar.vue';
import TextInputWithActions from '@/components/TextInputWithActions.vue';
import ToolPageHeader from '@/components/ToolPageHeader.vue';

export default {
  name: 'Base64Decode',
  components: {
    CsvPreviewTable,
    FileUploadWithValidation,
    LearnMorePanel,
    SharedSnackbar,
    TextInputWithActions,
    ToolPageHeader
  },
  setup() {
    // Constants
    const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB limit for Base64 decoding (larger than encode due to expansion)
    const MAX_PREVIEW_SIZE = 8 * 1024 * 1024; // 8MB max for preview

    // Reactive State
    const encodedFile = ref(null);
    const encodedText = ref('');
    const isLoading = ref(false);
    const plainText = ref('');

    // File decoding state
    const decodedData = ref(null);
    const decodedFileName = ref('');
    const decodedFileText = ref('');
    const tableData = ref([]);
    const tableHeaders = ref([]);

    // Composables
    const { snackbar, snackbarText, snackbarColor, showSnackbar } = useSnackbar();
    const { pasteFromClipboard } = useClipboard();

    // Computed Properties
    const canDecodeFile = computed(() => {
      return !!encodedFile.value;
    });

    // Functions
    /**
     * Decodes Base64 text to plain text
     */
    const decodeText = () => {
      isLoading.value = true;
      try {
        plainText.value = atob(encodedText.value);
      } catch (error) {
        console.error('Base64 decoding error:', error);
        plainText.value = 'Error: Invalid Base64 string. Please check your input.';
      } finally {
        isLoading.value = false;
      }
    };

    /**
     * Handles paste from clipboard
     */
    const handlePaste = async () => {
      await pasteFromClipboard(
        (text, message) => {
          encodedText.value = text;
          showSnackbar(message, 'success');
          debouncedDecode();
        },
        (message) => showSnackbar(message, 'error')
      );
    };

    /**
     * Handles clearing input and output text
     */
    const handleClear = () => {
      encodedText.value = '';
      plainText.value = '';
    };

    /**
     * Handles file validation updates from FileUploadWithValidation component
     *
     * NOTE: This handler intentionally does nothing. File validation state is fully
     * managed by FileUploadWithValidation component and useFileSizeValidation composable.
     * The handler exists to fulfill the component's @validation-change event contract
     * and may be used in the future if additional validation logic is needed.
     *
     * @param {Object} validation - Validation result from FileUploadWithValidation
     */
    const handleFileValidation = (validation) => {
      // Intentionally empty - validation handled by component and composable
    };

    /**
     * Determines if a file should be previewed as text based on extension and size
     */
    const shouldPreviewAsText = (fileName, data) => {
      const textExtensions = ['.txt', '.md', '.json', '.xml', '.html', '.css', '.js', '.log', '.yaml', '.yml'];
      const hasTextExtension = textExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
      const withinSizeLimit = data.byteLength <= MAX_PREVIEW_SIZE;
      return hasTextExtension && withinSizeLimit;
    };

    /**
     * Decodes a Base64 file with preview support
     */
    const decodeFile = () => {
      if (!encodedFile.value) {
        showSnackbar('❌ Please select a file first', 'error');
        return;
      }

      // Validate file size before processing
      const validation = validateFileSize(encodedFile.value);
      if (!validation.isValid) {
        showSnackbar(validation.message, 'error');
        return;
      }

      // Check file size limit for Base64 decoding
      if (encodedFile.value.size > MAX_FILE_SIZE) {
        showSnackbar(`❌ File too large for Base64 decoding. Maximum size is 15 MB.`, 'error');
        return;
      }

      const reader = new FileReader();

      reader.onerror = () => {
        console.error('File read error:', reader.error);
        showSnackbar('❌ Failed to read file. Please try again.', 'error');
      };

      reader.onload = () => {
        try {
          // Read as text since Base64 files are plain text
          const base64String = reader.result.trim();
          const binaryString = atob(base64String);

          // Convert binary string to Uint8Array
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          // Create blob
          const blob = new Blob([bytes], { type: 'application/octet-stream' });
          const fileName = encodedFile.value.name.replace(/\.base64$|\.b64\.txt$/, '');

          // Store decoded data
          decodedData.value = blob;
          decodedFileName.value = fileName;

          // Handle CSV files
          if (fileName.endsWith('.csv')) {
            const withinSizeLimit = blob.size <= MAX_PREVIEW_SIZE;

            if (withinSizeLimit) {
              const parsedCSV = parseCSV(blob);
              tableHeaders.value = parsedCSV.headers;
              tableData.value = parsedCSV.data;

              const sizeKB = (blob.size / 1024).toFixed(2);
              showSnackbar(`✓ CSV file decoded (${sizeKB} KB) - Preview shown`, 'success');
            } else {
              downloadFile(blob, fileName);
              const sizeMB = (blob.size / (1024 * 1024)).toFixed(2);
              showSnackbar(`✓ CSV file decoded (${sizeMB} MB) - Too large to preview, downloaded`, 'info');
            }

            encodedFile.value = null;
            return;
          }

          // Handle text files
          if (shouldPreviewAsText(fileName, blob)) {
            const textDecoder = new TextDecoder();
            decodedFileText.value = textDecoder.decode(bytes);

            const sizeKB = (blob.size / 1024).toFixed(2);
            showSnackbar(`✓ Text file decoded (${sizeKB} KB) - Preview shown`, 'success');
            encodedFile.value = null;
            return;
          }

          // For all other files, auto-download
          downloadFile(blob, fileName);

          if (blob.size > MAX_PREVIEW_SIZE) {
            const sizeMB = (blob.size / (1024 * 1024)).toFixed(2);
            showSnackbar(`✓ File decoded (${sizeMB} MB) - Too large to preview, downloaded`, 'info');
          } else {
            showSnackbar('✓ File decoded and downloaded!', 'success');
          }

          encodedFile.value = null;
        } catch (error) {
          console.error('File decoding error:', error);
          showSnackbar('❌ Failed to decode file. Please ensure it contains valid Base64 data.', 'error');
        }
      };

      reader.readAsText(encodedFile.value);
    };

    /**
     * Downloads the decoded file
     */
    const downloadDecodedFile = () => {
      if (decodedData.value && decodedFileName.value) {
        downloadFile(decodedData.value, decodedFileName.value);
        showSnackbar('✓ File downloaded successfully!', 'success');
      }
    };

    /**
     * Clears decoded output
     */
    const clearDecodedOutput = () => {
      decodedFileText.value = '';
      tableData.value = [];
      tableHeaders.value = [];
      decodedData.value = null;
      decodedFileName.value = '';
    };

    // Debounced decoding (350ms for non-crypto operation)
    const { debounce: debouncedDecode } = useDebounce(decodeText, 350);

    // Watchers
    watch(encodedText, () => {
      if (encodedText.value) {
        debouncedDecode();
      } else {
        plainText.value = '';
      }
    });

    return {
      // State
      encodedFile,
      encodedText,
      isLoading,
      plainText,
      decodedFileName,
      decodedFileText,
      tableData,
      tableHeaders,

      // Snackbar
      snackbar,
      snackbarColor,
      snackbarText,

      // Computed
      canDecodeFile,

      // Methods
      decodeFile,
      downloadDecodedFile,
      clearDecodedOutput,
      handleClear,
      handleFileValidation,
      handlePaste
    };
  }
};
</script>

<style scoped>
.monospace-output {
  font-family: 'Courier New', monospace;
}
</style>
