/**
 * useVirtualScroll Composable
 *
 * Provides virtual scrolling functionality for large datasets.
 * Only renders visible rows to maintain performance with large files.
 */

import { computed, onBeforeUnmount, ref } from 'vue';

/**
 * Virtual scrolling composable for hex viewer
 * @param {Object} options - Configuration options
 * @param {number} options.rowHeight - Height of each row in pixels
 * @param {number} options.overscanCount - Number of extra rows to render above/below viewport
 * @returns {Object} Virtual scrolling state and methods
 */
export function useVirtualScroll({ rowHeight = 24, overscanCount = 5 } = {}) {
  // Reactive State
  const scrollTop = ref(0);
  const viewportHeight = ref(600); // Default height, updated by component
  const totalRows = ref(0);
  const scrollContainerRef = ref(null);

  // Computed Properties

  /**
   * Calculates the total height of the scrollable content
   */
  const totalHeight = computed(() => {
    return totalRows.value * rowHeight;
  });

  /**
   * Calculates the index of the first visible row
   */
  const startIndex = computed(() => {
    const index = Math.floor(scrollTop.value / rowHeight);
    return Math.max(0, index - overscanCount);
  });

  /**
   * Calculates the index of the last visible row
   */
  const endIndex = computed(() => {
    const visibleRowCount = Math.ceil(viewportHeight.value / rowHeight);
    const index = startIndex.value + visibleRowCount + overscanCount;
    return Math.min(totalRows.value, index + overscanCount);
  });

  /**
   * Calculates the number of visible rows
   */
  const visibleRowCount = computed(() => {
    return endIndex.value - startIndex.value;
  });

  /**
   * Calculates the offset for the visible content container
   */
  const offsetY = computed(() => {
    return startIndex.value * rowHeight;
  });

  // Functions

  /**
   * Handles scroll events from the container
   */
  const handleScroll = (event) => {
    scrollTop.value = event.target.scrollTop;
  };

  /**
   * Updates the viewport height (called on mount and resize)
   * @param {number} height - New viewport height in pixels
   */
  const updateViewportHeight = (height) => {
    viewportHeight.value = height;
  };

  /**
   * Updates the total number of rows
   * @param {number} count - Total row count
   */
  const updateTotalRows = (count) => {
    totalRows.value = count;
  };

  /**
   * Scrolls to a specific row index
   * @param {number} rowIndex - Target row index
   * @param {string} behavior - Scroll behavior ('auto', 'smooth')
   */
  const scrollToRow = (rowIndex, behavior = 'smooth') => {
    if (!scrollContainerRef.value) return;

    const targetScrollTop = rowIndex * rowHeight;
    scrollContainerRef.value.scrollTo({
      top: targetScrollTop,
      behavior
    });
  };

  /**
   * Scrolls to a specific byte offset in the file
   * @param {number} byteOffset - Byte offset in file
   * @param {number} bytesPerRow - Bytes displayed per row
   * @param {string} behavior - Scroll behavior
   */
  const scrollToOffset = (byteOffset, bytesPerRow = 16, behavior = 'smooth') => {
    const rowIndex = Math.floor(byteOffset / bytesPerRow);
    scrollToRow(rowIndex, behavior);
  };

  /**
   * Resets scroll position to top
   */
  const resetScroll = () => {
    if (scrollContainerRef.value) {
      scrollContainerRef.value.scrollTop = 0;
    }
    scrollTop.value = 0;
  };

  /**
   * Gets current scroll percentage (0-100)
   */
  const getScrollPercentage = computed(() => {
    if (totalHeight.value === 0) return 0;
    const maxScroll = totalHeight.value - viewportHeight.value;
    if (maxScroll <= 0) return 0;
    return Math.round((scrollTop.value / maxScroll) * 100);
  });

  // Cleanup
  onBeforeUnmount(() => {
    scrollContainerRef.value = null;
  });

  // Return
  return {
    // Refs
    scrollContainerRef,
    scrollTop,
    viewportHeight,
    totalRows,

    // Computed
    totalHeight,
    startIndex,
    endIndex,
    visibleRowCount,
    offsetY,
    getScrollPercentage,

    // Methods
    handleScroll,
    updateViewportHeight,
    updateTotalRows,
    scrollToRow,
    scrollToOffset,
    resetScroll
  };
}
