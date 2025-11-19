/**
 * useHexViewer Composable
 *
 * Manages hex viewer state, file handling, and byte operations.
 */

import { computed, onBeforeUnmount, ref } from 'vue';
import { formatHexRow } from '@/utils/hexFormatter';
import { interpretBytes } from '@/utils/byteConverter';

/**
 * Hex viewer composable
 * @param {number} bytesPerRow - Number of bytes to display per row (default 16)
 * @returns {Object} Hex viewer state and methods
 */
export function useHexViewer(bytesPerRow = 16) {
  // Reactive State
  const fileData = ref(null); // Uint8Array of file data
  const fileName = ref('');
  const fileSize = ref(0);
  const isLoading = ref(false);
  const useHexOffset = ref(true); // Toggle between hex/decimal offsets
  const selectedByteStart = ref(null); // Start of selection
  const selectedByteEnd = ref(null); // End of selection
  const searchQuery = ref('');
  const searchMatches = ref([]);
  const currentMatchIndex = ref(0);

  // Computed Properties

  /**
   * Calculates total number of rows needed to display the file
   */
  const totalRows = computed(() => {
    if (!fileData.value) return 0;
    return Math.ceil(fileData.value.length / bytesPerRow);
  });

  /**
   * Checks if any bytes are selected
   */
  const hasSelection = computed(() => {
    return selectedByteStart.value !== null && selectedByteEnd.value !== null;
  });

  /**
   * Gets the selected byte range as Uint8Array
   */
  const selectedBytes = computed(() => {
    if (!hasSelection.value || !fileData.value) return null;

    const start = Math.min(selectedByteStart.value, selectedByteEnd.value);
    const end = Math.max(selectedByteStart.value, selectedByteEnd.value);

    return fileData.value.slice(start, end + 1);
  });

  /**
   * Gets interpretation of selected bytes
   */
  const byteInterpretation = computed(() => {
    if (!selectedBytes.value) {
      return interpretBytes(null);
    }
    return interpretBytes(selectedBytes.value);
  });

  /**
   * Checks if search has matches
   */
  const hasSearchMatches = computed(() => {
    return searchMatches.value.length > 0;
  });

  /**
   * Gets current search match position info
   */
  const searchMatchInfo = computed(() => {
    if (!hasSearchMatches.value) return null;

    return {
      current: currentMatchIndex.value + 1,
      total: searchMatches.value.length,
      offset: searchMatches.value[currentMatchIndex.value]
    };
  });

  // Functions

  /**
   * Loads a file into the hex viewer
   * @param {File} file - File object to load
   * @returns {Promise<void>}
   */
  const loadFile = async (file) => {
    if (!file) return;

    isLoading.value = true;

    try {
      const arrayBuffer = await file.arrayBuffer();
      fileData.value = new Uint8Array(arrayBuffer);
      fileName.value = file.name;
      fileSize.value = file.size;

      // Reset state
      clearSelection();
      clearSearch();
    } catch (error) {
      console.error('Failed to load file:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Clears the loaded file and resets state
   */
  const clearFile = () => {
    fileData.value = null;
    fileName.value = '';
    fileSize.value = 0;
    clearSelection();
    clearSearch();
  };

  /**
   * Gets a row of formatted hex data
   * @param {number} rowIndex - Row index (0-based)
   * @returns {Object|null} Formatted row object or null
   */
  const getRow = (rowIndex) => {
    if (!fileData.value || rowIndex >= totalRows.value) return null;

    const offset = rowIndex * bytesPerRow;
    const rowBytes = fileData.value.slice(offset, offset + bytesPerRow);

    return formatHexRow(rowBytes, offset, bytesPerRow, useHexOffset.value);
  };

  /**
   * Toggles between hex and decimal offset display
   */
  const toggleOffsetFormat = () => {
    useHexOffset.value = !useHexOffset.value;
  };

  /**
   * Selects a single byte
   * @param {number} byteOffset - Byte offset in file
   */
  const selectByte = (byteOffset) => {
    if (byteOffset < 0 || byteOffset >= fileSize.value) return;

    selectedByteStart.value = byteOffset;
    selectedByteEnd.value = byteOffset;
  };

  /**
   * Selects a range of bytes
   * @param {number} startOffset - Start byte offset
   * @param {number} endOffset - End byte offset
   */
  const selectByteRange = (startOffset, endOffset) => {
    if (!fileData.value) return;

    selectedByteStart.value = Math.max(0, Math.min(startOffset, fileSize.value - 1));
    selectedByteEnd.value = Math.max(0, Math.min(endOffset, fileSize.value - 1));
  };

  /**
   * Clears byte selection
   */
  const clearSelection = () => {
    selectedByteStart.value = null;
    selectedByteEnd.value = null;
  };

  /**
   * Searches for a hex pattern in the file
   * @param {string} hexPattern - Hex pattern (e.g., "FF D8 FF")
   */
  const searchHexPattern = (hexPattern) => {
    if (!fileData.value || !hexPattern.trim()) {
      clearSearch();
      return;
    }

    searchMatches.value = [];
    currentMatchIndex.value = 0;

    // Parse hex pattern
    const cleanPattern = hexPattern.trim().replace(/\s+/g, ' ').toUpperCase();
    const hexBytes = cleanPattern.split(' ').map(h => parseInt(h, 16));

    if (hexBytes.some(b => isNaN(b))) {
      console.warn('Invalid hex pattern');
      return;
    }

    // Search for pattern
    const patternLength = hexBytes.length;
    for (let i = 0; i <= fileData.value.length - patternLength; i++) {
      let match = true;
      for (let j = 0; j < patternLength; j++) {
        if (fileData.value[i + j] !== hexBytes[j]) {
          match = false;
          break;
        }
      }
      if (match) {
        searchMatches.value.push(i);
      }
    }

    searchQuery.value = hexPattern;
  };

  /**
   * Searches for ASCII text in the file
   * @param {string} text - Text to search for
   */
  const searchText = (text) => {
    if (!fileData.value || !text.trim()) {
      clearSearch();
      return;
    }

    searchMatches.value = [];
    currentMatchIndex.value = 0;

    const searchBytes = new TextEncoder().encode(text);
    const patternLength = searchBytes.length;

    // Search for text pattern
    for (let i = 0; i <= fileData.value.length - patternLength; i++) {
      let match = true;
      for (let j = 0; j < patternLength; j++) {
        if (fileData.value[i + j] !== searchBytes[j]) {
          match = false;
          break;
        }
      }
      if (match) {
        searchMatches.value.push(i);
      }
    }

    searchQuery.value = text;
  };

  /**
   * Navigates to the next search match
   */
  const nextMatch = () => {
    if (!hasSearchMatches.value) return;

    currentMatchIndex.value = (currentMatchIndex.value + 1) % searchMatches.value.length;
    const offset = searchMatches.value[currentMatchIndex.value];
    selectByte(offset);

    return offset;
  };

  /**
   * Navigates to the previous search match
   */
  const previousMatch = () => {
    if (!hasSearchMatches.value) return;

    currentMatchIndex.value =
      (currentMatchIndex.value - 1 + searchMatches.value.length) % searchMatches.value.length;
    const offset = searchMatches.value[currentMatchIndex.value];
    selectByte(offset);

    return offset;
  };

  /**
   * Clears search results
   */
  const clearSearch = () => {
    searchQuery.value = '';
    searchMatches.value = [];
    currentMatchIndex.value = 0;
  };

  /**
   * Exports selected bytes to a new file
   * @param {string} outputFileName - Name for the exported file
   * @returns {Blob|null} Blob containing selected bytes
   */
  const exportSelection = (outputFileName) => {
    if (!selectedBytes.value) return null;

    const blob = new Blob([selectedBytes.value], { type: 'application/octet-stream' });

    // Trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = outputFileName || 'selection.bin';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return blob;
  };

  // Cleanup
  onBeforeUnmount(() => {
    clearFile();
  });

  // Return
  return {
    // State
    fileData,
    fileName,
    fileSize,
    isLoading,
    useHexOffset,
    selectedByteStart,
    selectedByteEnd,
    searchQuery,

    // Computed
    totalRows,
    hasSelection,
    selectedBytes,
    byteInterpretation,
    hasSearchMatches,
    searchMatchInfo,

    // Methods
    loadFile,
    clearFile,
    getRow,
    toggleOffsetFormat,
    selectByte,
    selectByteRange,
    clearSelection,
    searchHexPattern,
    searchText,
    nextMatch,
    previousMatch,
    clearSearch,
    exportSelection
  };
}
