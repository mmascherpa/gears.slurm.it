/**
 * Composable for managing snackbar notifications
 *
 * Provides reactive state and methods for displaying transient notifications
 * to the user. Used across all tool components for consistent feedback.
 *
 * @returns {Object} Snackbar state and control method
 * @returns {Ref<boolean>} snackbar - Visibility state
 * @returns {Ref<string>} snackbarText - Message to display
 * @returns {Ref<string>} snackbarColor - Color variant (success, error, warning, info)
 * @returns {Function} showSnackbar - Method to trigger snackbar with message
 *
 * @example
 * const { snackbar, snackbarText, snackbarColor, showSnackbar } = useSnackbar();
 * showSnackbar('File saved successfully!', 'success');
 */
import { ref } from 'vue';

export function useSnackbar() {
  const snackbar = ref(false);
  const snackbarText = ref('');
  const snackbarColor = ref('success');

  /**
   * Display a snackbar notification
   * @param {string} text - Message to display
   * @param {string} color - Color variant (success, error, warning, info)
   */
  const showSnackbar = (text, color = 'success') => {
    snackbarText.value = text;
    snackbarColor.value = color;
    snackbar.value = true;
  };

  return {
    snackbar,
    snackbarText,
    snackbarColor,
    showSnackbar
  };
}
