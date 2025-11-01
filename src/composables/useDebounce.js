/**
 * Composable for debouncing function calls
 *
 * Delays the execution of a function until after a specified delay has elapsed
 * since the last time it was invoked. Useful for expensive operations like
 * encoding, encryption, or API calls that shouldn't run on every keystroke.
 *
 * Automatically cleans up timer on component unmount.
 *
 * @param {Function} callback - Function to debounce
 * @param {number} delay - Delay in milliseconds (default: 350ms)
 * @returns {Object} Debounce control methods
 * @returns {Function} debounce - Debounced version of callback
 * @returns {Function} cancel - Cancel pending callback execution
 *
 * @example
 * // For text encoding (fast operations)
 * const { debounce: debouncedEncode } = useDebounce(encodeText, 350);
 * watch(plainText, () => debouncedEncode());
 *
 * @example
 * // For crypto operations (slower operations)
 * const { debounce: debouncedEncrypt, cancel } = useDebounce(encryptText, 800);
 * watch(password, () => debouncedEncrypt());
 * onBeforeUnmount(() => cancel()); // Cleanup handled automatically
 */
import { ref, onBeforeUnmount } from 'vue';

export function useDebounce(callback, delay = 350) {
  const timer = ref(null);

  /**
   * Debounced version of the callback function
   * Cancels previous invocation and schedules new one
   * @param {...any} args - Arguments to pass to callback
   */
  const debounce = (...args) => {
    if (timer.value) {
      clearTimeout(timer.value);
    }
    timer.value = setTimeout(() => {
      callback(...args);
      timer.value = null;
    }, delay);
  };

  /**
   * Cancel pending callback execution
   */
  const cancel = () => {
    if (timer.value) {
      clearTimeout(timer.value);
      timer.value = null;
    }
  };

  // Automatic cleanup on component unmount
  onBeforeUnmount(() => {
    cancel();
  });

  return {
    debounce,
    cancel
  };
}
