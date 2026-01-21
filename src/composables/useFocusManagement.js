/**
 * Composable for managing focus after operations complete
 *
 * Provides utilities for returning focus to appropriate elements after
 * async operations, improving keyboard navigation and screen reader experience.
 *
 * @returns {Object} Focus management utilities
 * @returns {Function} focusElement - Focus a specific element by ref
 * @returns {Function} focusFirst - Focus first focusable element in container
 * @returns {Function} announceToScreenReader - Announce message to screen readers
 *
 * @example
 * const { focusElement, announceToScreenReader } = useFocusManagement();
 * // After operation completes:
 * focusElement(inputRef);
 * announceToScreenReader('File encrypted successfully');
 */
import { nextTick } from 'vue';

export function useFocusManagement() {
  /**
   * Focus a specific element by ref
   * @param {Ref} elementRef - Vue ref to the element
   * @param {Object} options - Focus options
   * @param {boolean} options.preventScroll - Prevent scrolling to element
   * @param {number} options.delay - Delay before focusing (ms)
   */
  const focusElement = async (elementRef, options = {}) => {
    const { preventScroll = false, delay = 0 } = options;

    await nextTick();

    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    if (elementRef?.value) {
      // Handle Vuetify components that expose focus method
      if (typeof elementRef.value.focus === 'function') {
        elementRef.value.focus({ preventScroll });
      }
      // Handle native elements
      else if (elementRef.value.$el?.focus) {
        elementRef.value.$el.focus({ preventScroll });
      }
      // Handle direct DOM elements
      else if (elementRef.value instanceof HTMLElement) {
        elementRef.value.focus({ preventScroll });
      }
    }
  };

  /**
   * Focus first focusable element within a container
   * @param {Ref} containerRef - Vue ref to the container element
   */
  const focusFirst = async (containerRef) => {
    await nextTick();

    const container = containerRef?.value?.$el || containerRef?.value;
    if (!container) return;

    const focusableSelector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    const firstFocusable = container.querySelector(focusableSelector);
    if (firstFocusable) {
      firstFocusable.focus();
    }
  };

  /**
   * Announce a message to screen readers using ARIA live region
   * @param {string} message - Message to announce
   * @param {string} priority - 'polite' or 'assertive'
   */
  const announceToScreenReader = (message, priority = 'polite') => {
    // Find or create the live region
    let liveRegion = document.getElementById('sr-announcer');

    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'sr-announcer';
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      // Visually hidden but accessible to screen readers
      liveRegion.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `;
      document.body.appendChild(liveRegion);
    }

    // Update priority if different
    liveRegion.setAttribute('aria-live', priority);

    // Clear and set message (triggers announcement)
    liveRegion.textContent = '';
    requestAnimationFrame(() => {
      liveRegion.textContent = message;
    });
  };

  return {
    focusElement,
    focusFirst,
    announceToScreenReader
  };
}
