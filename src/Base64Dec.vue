<template>
  <div>
    <ToolPageHeader
      title="Base64 Decoder"
      description="Decode Base64 text or files back to original format"
      icon="mdi-arrow-up-bold-box"
      avatar-color="secondary-darken-1" />

    <v-card class="mb-4" elevation="2">
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
          :show-spacers="false"
          @paste="handlePaste"
          @clear="handleClearInput"
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
          :show-spacers="true"
          :show-copy="true" />
      </v-card-text>
    </v-card>

    <v-card elevation="2">
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

    <SharedSnackbar
      v-model="snackbar"
      :text="snackbarText"
      :color="snackbarColor" />

  </div>
</template>

<script>
import { computed, ref, watch } from 'vue';
import { useClipboard } from '@/composables/useClipboard';
import { useDebounce } from '@/composables/useDebounce';
import { useSnackbar } from '@/composables/useSnackbar';
import FileUploadWithValidation from '@/components/FileUploadWithValidation.vue';
import SharedSnackbar from '@/components/SharedSnackbar.vue';
import TextInputWithActions from '@/components/TextInputWithActions.vue';
import ToolPageHeader from '@/components/ToolPageHeader.vue';

export default {
  name: 'Base64Dec',
  components: {
    FileUploadWithValidation,
    SharedSnackbar,
    TextInputWithActions,
    ToolPageHeader
  },
  setup() {
    // Reactive State
    const encodedFile = ref(null);
    const encodedText = ref('');
    const isLoading = ref(false);
    const plainText = ref('');

    // Composables
    const { snackbar, snackbarText, snackbarColor, showSnackbar } = useSnackbar();
    const { pasteFromClipboard } = useClipboard();

    // Computed Properties
    const canDecodeFile = computed(() => {
      return encodedFile.value && encodedFile.value.length > 0;
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
        (text) => {
          encodedText.value = text;
          debouncedDecode();
        },
        (message) => showSnackbar(message, 'success'),
        (message) => showSnackbar(message, 'error')
      );
    };

    /**
     * Handles clearing the input text
     */
    const handleClearInput = () => {
      encodedText.value = '';
      plainText.value = '';
    };

    /**
     * Handles file validation updates from FileUploadWithValidation
     */
    const handleFileValidation = (validation) => {
      // Validation state is managed by FileUploadWithValidation component
      // This handler is kept for potential future use
    };

    /**
     * Decodes a Base64 file and triggers download of the decoded result
     */
    const decodeFile = () => {
      if (!encodedFile.value || !encodedFile.value[0]) {
        showSnackbar('❌ Please select a file first', 'error');
        return;
      }

      const reader = new FileReader();

      reader.onerror = () => {
        console.error('File read error:', reader.error);
        showSnackbar('❌ Failed to read file. Please try again.', 'error');
      };

      reader.onload = () => {
        try {
          const dataUrl = reader.result;
          const plainString = atob(dataUrl.split(',')[1]);
          const dataLink = `data:application/octet-stream;base64,${plainString}`;
          const link = document.createElement('a');
          link.href = dataLink;
          link.download = encodedFile.value[0].name.replace('.b64.txt', '');
          link.style.display = 'none';

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          showSnackbar('✓ File decoded successfully!', 'success');
        } catch (error) {
          console.error('File decoding error:', error);
          showSnackbar('❌ Failed to decode file. Please ensure it contains valid Base64 data.', 'error');
        }
      };

      reader.readAsDataURL(encodedFile.value[0]);
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

      // Snackbar
      snackbar,
      snackbarColor,
      snackbarText,

      // Computed
      canDecodeFile,

      // Methods
      decodeFile,
      handleClearInput,
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
