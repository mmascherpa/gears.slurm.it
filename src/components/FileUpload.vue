<template>
  <div>
    <v-file-input
      :model-value="fileInputValue"
      @update:model-value="handleFileChange"
      @click:clear="handleClear"
      :label="computedLabel"
      :accept="accept"
      variant="outlined"
      density="comfortable"
      prepend-icon=""
      :prepend-inner-icon="prependIcon"
      :hint="computedHint"
      :persistent-hint="persistentHint"
      :disabled="disabled"
      clearable
      :show-size="false"
      class="file-upload">
    </v-file-input>

    <!-- File Size Error Alert -->
    <v-alert
      v-if="fileSizeError"
      type="error"
      variant="tonal"
      class="mt-2"
      density="compact"
      closable
      @click:close="handleClearError">
      {{ fileSizeError }}
    </v-alert>

    <!-- File Size Warning Alert -->
    <v-alert
      v-if="showFileSizeWarning"
      type="warning"
      variant="tonal"
      class="mt-2"
      density="compact"
      closable
      @click:close="showFileSizeWarning = false">
      {{ fileSizeWarningMessage }}
    </v-alert>
  </div>
</template>

<script>
/**
 * FileUpload Component
 *
 * Flexible file upload component with built-in size validation and consistent styling.
 * Works for both auto-processing (HexViewer, MetadataEditor) and submit-based workflows
 * (Base64, AES with FileUploadWithValidation wrapper).
 *
 * Features:
 * - Automatic file size validation with configurable limits
 * - Error and warning alerts with close buttons
 * - Formatted file size display in hint
 * - Dynamic label support (can show file info in label)
 * - Consistent Material Design 2 styling
 * - comfortable density for better typography
 *
 * Uses the useFileSizeValidation composable internally.
 *
 * @component
 * @example
 * <!-- Auto-processing mode (HexViewer, MetadataEditor) -->
 * <FileUpload
 *   v-model="file"
 *   label="Select Image"
 *   accept=".jpg,.jpeg,.png"
 *   prepend-icon="mdi-camera"
 *   hint="Supported formats: JPEG, PNG"
 *   @update:model-value="loadFile"
 *   @validation-change="handleValidation"
 * />
 *
 * @example
 * <!-- Dynamic label with file info -->
 * <FileUpload
 *   v-model="file"
 *   :label="fileName ? `${fileName} • ${fileSize}` : 'Select File'"
 *   :hint="fileName ? '' : 'Any file type (up to 200 MB)'"
 *   :persistent-hint="!fileName"
 * />
 */
import { computed, ref, watch } from 'vue';
import { useFileSizeValidation } from '@/composables/useFileSizeValidation';

export default {
  name: 'FileUpload',
  props: {
    /**
     * The selected file (v-model)
     */
    modelValue: {
      type: [File, Array],
      default: null
    },
    /**
     * Label text (can be dynamic, e.g., showing file info)
     */
    label: {
      type: String,
      default: 'Select File'
    },
    /**
     * Accepted file types (e.g., ".jpg,.png" or "image/*")
     */
    accept: {
      type: String,
      default: '*/*'
    },
    /**
     * Icon to prepend inside input
     */
    prependIcon: {
      type: String,
      default: 'mdi-paperclip'
    },
    /**
     * Hint text below input (can be dynamic)
     */
    hint: {
      type: String,
      default: ''
    },
    /**
     * Whether to always show hint
     */
    persistentHint: {
      type: Boolean,
      default: true
    },
    /**
     * Whether input is disabled
     */
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'validation-change', 'clear'],
  setup(props, { emit }) {
    // File size validation composable
    const {
      fileSizeError,
      fileSizeHint,
      fileSizeWarningMessage,
      isFileSizeValid,
      showFileSizeWarning,
      handleFileSelection,
      clearFileValidation
    } = useFileSizeValidation();

    /**
     * Computed hint - uses fileSizeHint if available, otherwise custom hint
     */
    const computedHint = computed(() => {
      return fileSizeHint.value || props.hint;
    });

    /**
     * Computed label - just returns the prop (parent controls dynamic content)
     */
    const computedLabel = computed(() => props.label);

    /**
     * Convert single File object to array for v-file-input
     * v-file-input expects an array, but we emit a single File to parent
     */
    const fileInputValue = computed(() => {
      return props.modelValue ? [props.modelValue] : [];
    });

    /**
     * Handles file selection
     * v-file-input emits an array of files, we extract the first one
     */
    const handleFileChange = (files) => {
      // v-file-input returns an array, extract first file
      const file = Array.isArray(files) && files.length > 0 ? files[0] : null;

      // IMPORTANT: Emit modelValue FIRST so parent receives the file before validation event
      emit('update:modelValue', file);

      // Then validate and emit validation state
      if (file) {
        handleFileSelection(file);

        // Emit validation-change immediately (don't rely solely on watcher)
        emit('validation-change', {
          isValid: isFileSizeValid.value,
          hasError: !!fileSizeError.value,
          hasWarning: showFileSizeWarning.value
        });
      } else {
        clearFileValidation();
        // Emit validation-change for cleared state
        emit('validation-change', {
          isValid: true,
          hasError: false,
          hasWarning: false
        });
      }
    };

    /**
     * Handles clear button click
     */
    const handleClear = () => {
      clearFileValidation();
      emit('update:modelValue', null);
      emit('clear');
    };

    /**
     * Handles error alert close
     */
    const handleClearError = () => {
      clearFileValidation();
    };

    /**
     * Watch validation state and emit changes
     * Note: This watcher handles dynamic validation changes (e.g., when file size limits change)
     * Initial validation is emitted directly in handleFileChange
     */
    watch([isFileSizeValid, fileSizeError, showFileSizeWarning], () => {
      emit('validation-change', {
        isValid: isFileSizeValid.value,
        hasError: !!fileSizeError.value,
        hasWarning: showFileSizeWarning.value
      });
    });

    return {
      computedHint,
      computedLabel,
      fileInputValue,
      fileSizeError,
      fileSizeWarningMessage,
      handleClear,
      handleClearError,
      handleFileChange,
      isFileSizeValid,
      showFileSizeWarning
    };
  }
};
</script>

<style scoped>
/**
 * File name truncation with ellipsis for long filenames
 * Prevents ugly word wrapping by using text-overflow ellipsis
 */
.file-upload :deep(.v-field__input) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/**
 * Ensure the file chip (when file is selected) also truncates properly
 */
.file-upload :deep(.v-chip__content) {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
