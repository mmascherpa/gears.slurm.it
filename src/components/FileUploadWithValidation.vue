<template>
  <div>
    <v-row>
      <v-col cols="12" sm="8">
        <FileUpload
          :model-value="modelValue"
          @update:model-value="handleFileChange"
          @clear="handleClear"
          @validation-change="handleValidationChange"
          :label="label"
          :accept="accept"
          :disabled="disabled" />
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
  </div>
</template>

<script>
/**
 * FileUploadWithValidation Component
 *
 * Wrapper around FileUpload component that adds an action button for submit-based workflows.
 * Provides a standardized file upload + submit button experience for Base64 and AES tools.
 *
 * Features:
 * - Uses FileUpload component internally (consistent styling)
 * - Automatic file size validation (via FileUpload)
 * - Error and warning alerts (via FileUpload)
 * - Customizable action button with tooltip
 * - Two-column layout (file input + button)
 * - Dynamic tooltip based on validation and submit state
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
import { computed, ref } from 'vue';
import FileUpload from './FileUpload.vue';

export default {
  name: 'FileUploadWithValidation',
  components: {
    FileUpload
  },
  props: {
    /**
     * Selected file (v-model)
     */
    modelValue: {
      type: File,
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
    // Track validation state from FileUpload component
    const isFileSizeValid = ref(true);

    /**
     * Handle file selection - pass through to parent
     */
    const handleFileChange = (file) => {
      emit('update:modelValue', file);
    };

    /**
     * Handle validation changes from FileUpload component
     */
    const handleValidationChange = (validation) => {
      isFileSizeValid.value = validation.isValid;
      emit('validation-change', validation);
    };

    /**
     * Handle file input clear button - pass through to parent
     */
    const handleClear = () => {
      emit('update:modelValue', null);
      emit('validation-change', { isValid: true, hasError: false, hasWarning: false });
    };

    /**
     * Dynamic tooltip text based on file validation state
     */
    const buttonTooltip = computed(() => {
      // No file selected
      if (!props.modelValue) {
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
      handleFileChange,
      handleValidationChange,
      handleClear,
      buttonTooltip
    };
  }
};
</script>
