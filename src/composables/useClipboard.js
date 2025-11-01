/**
 * Composable for clipboard operations
 *
 * Provides methods for copying to and pasting from the system clipboard
 * with consistent error handling and user feedback.
 *
 * @returns {Object} Clipboard operation methods
 * @returns {Function} copyToClipboard - Copy text to clipboard
 * @returns {Function} pasteFromClipboard - Paste text from clipboard
 *
 * @example
 * const { copyToClipboard, pasteFromClipboard } = useClipboard();
 *
 * // Copy with callbacks
 * await copyToClipboard(
 *   'text to copy',
 *   (msg) => showSnackbar(msg, 'success'),
 *   (msg) => showSnackbar(msg, 'error')
 * );
 *
 * // Paste with callbacks
 * const text = await pasteFromClipboard(
 *   (text, msg) => { plainText.value = text; showSnackbar(msg, 'success'); },
 *   (msg) => showSnackbar(msg, 'error')
 * );
 */

export function useClipboard() {
  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @param {Function} onSuccess - Callback on success (receives success message)
   * @param {Function} onError - Callback on error (receives error message)
   * @returns {Promise<boolean>} - True if successful, false otherwise
   */
  const copyToClipboard = async (text, onSuccess, onError) => {
    if (!text) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      onSuccess?.('✓ Copied to clipboard!');
      return true;
    } catch (err) {
      console.error('Clipboard copy error:', err);
      onError?.('❌ Failed to copy to clipboard');
      return false;
    }
  };

  /**
   * Paste text from clipboard
   * @param {Function} onSuccess - Callback on success (receives text and success message)
   * @param {Function} onError - Callback on error (receives error message)
   * @returns {Promise<string|null>} - Pasted text or null on error
   */
  const pasteFromClipboard = async (onSuccess, onError) => {
    try {
      const text = await navigator.clipboard.readText();
      onSuccess?.(text, '✓ Pasted from clipboard');
      return text;
    } catch (err) {
      console.error('Clipboard paste error:', err);
      onError?.('❌ Failed to paste from clipboard');
      return null;
    }
  };

  return {
    copyToClipboard,
    pasteFromClipboard
  };
}
