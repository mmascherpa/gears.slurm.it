<template>
  <div>
    <v-row>
      <v-col cols="12" sm="8">
        <v-file-input
          :model-value="modelValue"
          @update:model-value="handleFileChange"
          @click:clear="handleClear"
          :label="label"
          :accept="accept"
          variant="outlined"
          prepend-icon=""
          prepend-inner-icon="mdi-paperclip"
          :hint="fileSizeHint"
          :disabled="disabled"
          persistent-hint>
        </v-file-input>
      </v-col>
      <v-col cols="12" sm="4">
        <v-tooltip :text="buttonTooltip" location="top">
          <template v-slot:activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              :disabled="!canSubmit || !isFileSizeValid"
              @click="$emit('submit')"
              :color="buttonColor"
              size="large"
              block>
              <v-icon start>{{ buttonIcon }}</v-icon>
              {{ buttonText }}
            </v-btn>
          </template>
        </v-tooltip>
      </v-col>
    </v-row>

    <!-- File Size Error Alert -->
    <v-alert
      v-if="fileSizeError"
      type="error"
      variant="tonal"
      class="mt-4"
      density="compact"
      closable
      @click:close="fileSizeError = ''">
      {{ fileSizeError }}
    </v-alert>

    <!-- File Size Warning Alert -->
    <v-alert
      v-if="showFileSizeWarning"
      type="warning"
      variant="tonal"
      class="mt-4"
      density="compact"
      closable
      @click:close="showFileSizeWarning = false">
      {{ fileSizeWarningMessage }}
    </v-alert>
  </div>
</template>

<script>
/**
 * FileUploadWithValidation Component
 *
 * Reusable file upload component with built-in size validation, error/warning display,
 * and action button. Provides a standardized file upload experience across all
 * file-based tool components.
 *
 * Features:
 * - Automatic file size validation
 * - Error and warning alerts
 * - Formatted file size display
 * - Customizable action button
 * - Consistent layout (file input + button)
 * - Dynamic tooltip based on validation state
 *
 * Uses the useFileSizeValidation composable internally.
 *
 * @component
 * @example
 * <FileUploadWithValidation
 *   v-model="file"
 *   label="Select file to encrypt"
 *   accept=".txt,.pdf,.doc"
 *   button-text="Encrypt"
 *   button-icon="mdi-lock"
 *   :can-submit="isPasswordConfirmed && isFileSelected"
 *   @submit="handleEncrypt"
 *   @validation-change="handleValidation"
 * />
 */
import { computed } from 'vue';
import { useFileSizeValidation } from '@/composables/useFileSizeValidation';

export default {
  name: 'FileUploadWithValidation',
  props: {
    /**
     * Selected file(s) (v-model)
     */
    modelValue: {
      type: Array,
      default: null
    },
    /**
     * File input label
     */
    label: {
      type: String,
      required: true
    },
    /**
     * Accepted file types (e.g., '.txt,.pdf' or '.aes')
     */
    accept: {
      type: String,
      default: ''
    },
    /**
     * Disabled state
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * Action button text
     */
    buttonText: {
      type: String,
      required: true
    },
    /**
     * Action button icon (Material Design Icon name)
     */
    buttonIcon: {
      type: String,
      required: true
    },
    /**
     * Action button color
     */
    buttonColor: {
      type: String,
      default: 'primary'
    },
    /**
     * Whether the submit button should be enabled
     */
    canSubmit: {
      type: Boolean,
      required: true
    }
  },
  emits: ['update:modelValue', 'submit', 'validation-change'],
  setup(props, { emit }) {
    const {
      isFileSizeValid,
      showFileSizeWarning,
      fileSizeWarningMessage,
      fileSizeError,
      fileSizeHint,
      clearFileValidation,
      handleFileSelection
    } = useFileSizeValidation();

    /**
     * Handle file selection
     * Validates file size and emits validation result
     */
    const handleFileChange = (files) => {
      emit('update:modelValue', files);

      if (files && files.length > 0) {
        const result = handleFileSelection(files[0]);
        emit('validation-change', result);
      } else {
        clearFileValidation();
        emit('validation-change', { isValid: true });
      }
    };

    /**
     * Handle file input clear button
     * Clears validation state and emits null value
     */
    const handleClear = () => {
      clearFileValidation();
      emit('update:modelValue', null);
      emit('validation-change', { isValid: true });
    };

    /**
     * Dynamic tooltip text based on file validation state
     */
    const buttonTooltip = computed(() => {
      // No file selected
      if (!props.modelValue || props.modelValue.length === 0) {
        return 'Please select a file first';
      }

      // File too large
      if (!isFileSizeValid.value) {
        return 'File is too large to process';
      }

      // Other validation failed (e.g., password not confirmed)
      if (!props.canSubmit) {
        return 'Complete all required fields';
      }

      // Ready to submit
      return `Click to ${props.buttonText.toLowerCase()}`;
    });

    return {
      isFileSizeValid,
      showFileSizeWarning,
      fileSizeWarningMessage,
      fileSizeError,
      fileSizeHint,
      handleFileChange,
      handleClear,
      buttonTooltip
    };
  }
};
</script>
