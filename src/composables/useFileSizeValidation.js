/**
 * Composable for file size validation
 *
 * Provides reactive state and methods for validating file sizes before upload
 * or processing. Prevents browser crashes from oversized files and provides
 * user-friendly warnings for large files.
 *
 * Uses the fileSizeValidator utility for actual validation logic.
 *
 * @returns {Object} File size validation state and methods
 * @returns {Ref<boolean>} isFileSizeValid - Whether file size is within limits
 * @returns {Ref<boolean>} showFileSizeWarning - Whether to show warning alert
 * @returns {Ref<string>} fileSizeWarningMessage - Warning message text
 * @returns {Ref<string>} fileSizeError - Error message text
 * @returns {Ref<string>} fileSizeHint - Hint text showing formatted file size
 * @returns {Function} clearFileValidation - Reset all validation state
 * @returns {Function} handleFileSelection - Validate a file and update state
 *
 * @example
 * const {
 *   isFileSizeValid,
 *   fileSizeError,
 *   handleFileSelection
 * } = useFileSizeValidation();
 *
 * const onFileChange = (files) => {
 *   if (files && files.length > 0) {
 *     const result = handleFileSelection(files[0]);
 *     if (!result.isValid) {
 *       console.log('File too large');
 *     }
 *   }
 * };
 */
import { ref } from 'vue';
import { validateFileSize } from '@/utils/fileSizeValidator';

export function useFileSizeValidation() {
  const isFileSizeValid = ref(true);
  const showFileSizeWarning = ref(false);
  const fileSizeWarningMessage = ref('');
  const fileSizeError = ref('');
  const fileSizeHint = ref('');

  /**
   * Clear all validation state
   * Resets all refs to their default values
   */
  const clearFileValidation = () => {
    isFileSizeValid.value = true;
    showFileSizeWarning.value = false;
    fileSizeWarningMessage.value = '';
    fileSizeError.value = '';
    fileSizeHint.value = '';
  };

  /**
   * Validate a file and update reactive state
   * @param {File} file - File to validate
   * @returns {Object} Validation result
   * @returns {boolean} isValid - Whether file is within size limits
   * @returns {boolean} hasWarning - Whether file size warrants a warning
   */
  const handleFileSelection = (file) => {
    clearFileValidation();

    if (!file) {
      return { isValid: true };
    }

    const validation = validateFileSize(file);
    fileSizeHint.value = `File size: ${validation.formattedSize}`;

    if (!validation.isValid) {
      // File exceeds maximum size
      isFileSizeValid.value = false;
      fileSizeError.value = validation.message;
      return { isValid: false };
    } else if (validation.hasWarning) {
      // File is large but within limits
      isFileSizeValid.value = true;
      showFileSizeWarning.value = true;
      fileSizeWarningMessage.value = validation.message;
      return { isValid: true, hasWarning: true };
    }

    return { isValid: true };
  };

  return {
    isFileSizeValid,
    showFileSizeWarning,
    fileSizeWarningMessage,
    fileSizeError,
    fileSizeHint,
    clearFileValidation,
    handleFileSelection
  };
}
