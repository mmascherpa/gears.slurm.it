<template>
  <div>
    <ToolPageHeader
      title="Base64 Encoder"
      description="Convert text or files to Base64 format"
      icon="mdi-arrow-down-bold-box"
      avatar-color="secondary" />

    <v-card class="mb-4" elevation="2">
      <v-card-title class="bg-surface-variant">
        <v-icon icon="mdi-text" class="mr-2"></v-icon>
        Text Encoding
      </v-card-title>
      <v-card-text class="pa-4">
        <TextInputWithActions
          v-model="plainText"
          label="Plain Text"
          placeholder="Enter your plain text here"
          :rows="4"
          :show-paste="true"
          :show-clear="true"
          :show-copy="false"
          row-class="mb-4"
          @paste="handlePaste"
          @clear="handleClear"
          @input="scheduleEncode" />

        <v-divider class="my-4"></v-divider>

        <TextInputWithActions
          v-model="encodedText"
          label="Base64 Encoded Output"
          placeholder="Base64 encoded text will appear here"
          :rows="4"
          :is-loading="isLoading"
          :readonly="true"
          :show-paste="false"
          :show-clear="false"
          :show-copy="true"
          textarea-class="monospace-output"
          @copy="handleCopy" />
      </v-card-text>
    </v-card>

    <v-card elevation="2">
      <v-card-title class="bg-surface-variant">
        <v-icon icon="mdi-file" class="mr-2"></v-icon>
        File Encoding
      </v-card-title>
      <v-card-text class="pa-4">
        <FileUploadWithValidation
          v-model="plainFile"
          label="Select a file to encode"
          button-text="Encode File"
          button-icon="mdi-arrow-down-bold-box"
          :can-submit="canEncodeFile"
          @submit="encodeFile"
          @validation-change="handleFileValidation" />
      </v-card-text>
    </v-card>

    <SharedSnackbar
      v-model="snackbar"
      :text="snackbarText"
      :color="snackbarColor" />

  </div>
</template>

<script>
import { computed, ref } from 'vue';
import { downloadFile } from '@/utils/fileDownload';
import { useClipboard } from '@/composables/useClipboard';
import { useDebounce } from '@/composables/useDebounce';
import { useSnackbar } from '@/composables/useSnackbar';
import FileUploadWithValidation from '@/components/FileUploadWithValidation.vue';
import SharedSnackbar from '@/components/SharedSnackbar.vue';
import TextInputWithActions from '@/components/TextInputWithActions.vue';
import ToolPageHeader from '@/components/ToolPageHeader.vue';

export default {
  name: 'Base64Encode',
  components: {
    FileUploadWithValidation,
    SharedSnackbar,
    TextInputWithActions,
    ToolPageHeader
  },
  setup() {
    // Reactive State
    const encodedText = ref('');
    const isLoading = ref(false);
    const plainFile = ref(null);
    const plainText = ref('');

    // Composables
    const { snackbar, snackbarText, snackbarColor, showSnackbar } = useSnackbar();
    const { copyToClipboard, pasteFromClipboard } = useClipboard();

    // Computed Properties
    const canEncodeFile = computed(() => {
      return !!plainFile.value && plainFile.value.length > 0;
    });

    // Functions
    /**
     * Encodes plain text to Base64
     */
    const encodeText = () => {
      if (!plainText.value) {
        encodedText.value = '';
        return;
      }

      isLoading.value = true;

      try {
        encodedText.value = btoa(plainText.value);
        isLoading.value = false;
      } catch (error) {
        console.error('Encoding error:', error);
        showSnackbar('❌ Failed to encode text', 'error');
        isLoading.value = false;
      }
    };

    /**
     * Schedules encoding with debounce
     */
    const scheduleEncode = () => {
      encodedText.value = '';
      debouncedEncode();
    };

    /**
     * Handles clearing input and output text
     */
    const handleClear = () => {
      plainText.value = '';
      encodedText.value = '';
      isLoading.value = false;
    };

    /**
     * Handles paste from clipboard
     */
    const handlePaste = async () => {
      await pasteFromClipboard(
        (pastedText, message) => {
          plainText.value = pastedText;
          showSnackbar(message, 'success');
          scheduleEncode();
        },
        (message) => showSnackbar(message, 'error')
      );
    };

    /**
     * Handles copying encoded text to clipboard
     */
    const handleCopy = async () => {
      await copyToClipboard(
        encodedText.value,
        (message) => showSnackbar(message, 'success'),
        (message) => showSnackbar(message, 'error')
      );
    };

    /**
     * Handles file validation updates from FileUploadWithValidation
     */
    const handleFileValidation = () => {
      // Validation state is managed by FileUploadWithValidation component
      // This handler is kept for potential future use
    };

    /**
     * Encodes file to Base64 and triggers download
     */
    const encodeFile = () => {
      if (!plainFile.value || plainFile.value.length === 0) {
        showSnackbar('❌ Please select a file', 'error');
        return;
      }

      const file = plainFile.value[0];
      const reader = new FileReader();

      reader.onload = () => {
        try {
          const base64String = reader.result.split(',')[1];
          const blob = new Blob([base64String], { type: 'text/plain' });
          const fileName = file.name + '.base64';

          downloadFile(blob, fileName);
          showSnackbar('✓ File encoded and downloaded!', 'success');

          // Clear file input
          plainFile.value = null;
        } catch (error) {
          console.error('File encoding error:', error);
          showSnackbar('❌ Failed to encode file', 'error');
        }
      };

      reader.onerror = () => {
        console.error('File reading error');
        showSnackbar('❌ Failed to read file', 'error');
      };

      reader.readAsDataURL(file);
    };

    // Debounced encoding (350ms for non-crypto operations)
    const { debounce: debouncedEncode } = useDebounce(encodeText, 350);

    return {
      // State
      encodedText,
      isLoading,
      plainFile,
      plainText,

      // Snackbar
      snackbar,
      snackbarColor,
      snackbarText,

      // Computed
      canEncodeFile,

      // Methods
      encodeFile,
      handleClear,
      handleCopy,
      handleFileValidation,
      handlePaste,
      scheduleEncode
    };
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
