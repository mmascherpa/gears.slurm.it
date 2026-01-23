<template>
  <div>
    <!-- Page Header -->
    <ToolPageHeader
      title="Hex Viewer"
      description="View and analyze binary files with hex dump display"
      icon="mdi-file-code"
      avatar-color="primary" />

    <!-- Tier 1: Educational Panel -->
    <LearnMorePanel
      title="What is a Hex Viewer?"
      storage-key="slurm-help-hex-viewer"
    >
      <p class="mb-2">
        <strong>Hexadecimal (hex) viewing</strong> displays the raw binary content of any file in hexadecimal
        format, allowing you to see the actual bytes that make up the file.
      </p>
      <ul class="ml-4 mb-2">
        <li><strong>Binary inspection</strong> - View file contents at the byte level</li>
        <li><strong>File analysis</strong> - Identify file types by magic numbers/signatures</li>
        <li><strong>Data recovery</strong> - Find hidden or corrupted data within files</li>
        <li><strong>Forensics</strong> - Examine files for debugging or security analysis</li>
      </ul>
      <p class="mt-3 mb-2">
        <strong>Common use cases:</strong> Analyzing file headers, verifying file integrity, debugging
        binary formats, reverse engineering, detecting file corruption.
      </p>

      <!-- Reference Links -->
      <div class="text-caption text-medium-emphasis mt-3">
        <strong>Learn more:</strong>
        <a href="https://en.wikipedia.org/wiki/Hex_dump" target="_blank" rel="noopener noreferrer" class="text-info">
          Wikipedia: Hex Dump
        </a>
        •
        <a href="https://en.wikipedia.org/wiki/Hexadecimal" target="_blank" rel="noopener noreferrer" class="text-info">
          Hexadecimal System
        </a>
      </div>

      <!-- Technical Details -->
      <div class="text-caption text-medium-emphasis mt-2">
        <strong>Technical:</strong> Displays files in traditional hex dump format (offset, hex bytes, ASCII). Supports files up to 200 MB.
      </div>
    </LearnMorePanel>

    <!-- File Upload Section -->
    <v-row>
      <v-col cols="12" lg="4" md="5">
        <v-card class="mb-3">
          <v-card-title class="bg-surface-variant">
            <v-icon icon="mdi-file-code" class="mr-2"></v-icon>
            View Hex File
          </v-card-title>
          <v-card-text class="pa-3">
            <FileUpload
              v-model="selectedFile"
              label="Select File"
              accept="*/*"
              prepend-icon="mdi-paperclip"
              hint="Any file type supported (up to 200 MB)"
              :disabled="isLoading" />

            <!-- Detected File Type Display -->
            <v-alert
              v-if="detectedFileType"
              type="info"
              variant="tonal"
              class="mt-3">
              <template #default>
                <div><strong>{{ detectedFileType.description }}</strong></div>
                <div class="text-medium-emphasis text-caption">({{ detectedSignatureHex }})</div>
              </template>
              <template #append>
                <v-btn
                  size="small"
                  variant="text"
                  @click="handleJumpToSignature">
                  <v-icon start>mdi-target</v-icon>
                  Jump to Signature
                </v-btn>
              </template>
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Hex Viewer Controls -->
    <v-card v-if="fileData" class="mb-4">
        <v-card-title class="bg-surface-variant">
          <v-icon icon="mdi-cog-outline" class="mr-2"></v-icon>
          Controls
        </v-card-title>
      <v-card-text class="pa-4">
        <v-row class="mb-2">
          <!-- Bytes Per Row Selector -->
          <v-col cols="6" sm="auto">
            <v-btn-toggle v-model="bytesPerRow" mandatory density="comfortable">
              <v-btn
                v-for="opt in BYTES_PER_ROW_OPTIONS"
                :key="opt"
                :value="opt">
                {{ opt }}
              </v-btn>
            </v-btn-toggle>
            <div class="text-caption text-medium-emphasis mt-1">Bytes/row</div>
          </v-col>

          <!-- Offset Format Toggle -->
          <v-col cols="6" sm="auto">
            <v-btn-toggle v-model="preferences.offsetFormat" mandatory density="comfortable" class="w-100">
              <v-btn value="hex">
                <v-icon start>mdi-hexadecimal</v-icon>
                Hex
              </v-btn>
              <v-btn value="decimal">
                <v-icon start>mdi-numeric</v-icon>
                Dec
              </v-btn>
            </v-btn-toggle>
          </v-col>

          <!-- Jump to Offset -->
          <v-col>
            <v-text-field
              v-model="jumpOffsetInput"
              density="comfortable"
              variant="outlined"
              :placeholder="preferences.offsetFormat === 'hex' ? 'Jump to hex offset (e.g., FF)' : 'Jump to decimal offset'"
              hide-details
              @keyup.enter="handleJumpToOffset">
              <template #append-inner>
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  :disabled="!jumpOffsetInput"
                  @click="handleJumpToOffset">
                  <v-icon>mdi-arrow-right-circle</v-icon>
                </v-btn>
              </template>
            </v-text-field>
          </v-col>

          <v-col>
            <v-text-field
              v-model="hexSearchInput"
              placeholder="Search hex (e.g., FF D8)"
              variant="outlined"
              density="comfortable"
              hide-details
              @keyup.enter="handleSearchHex">
              <template #prepend-inner>
                <v-icon>mdi-hexadecimal</v-icon>
              </template>
              <template #append-inner>
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  :disabled="!hexSearchInput"
                  @click="handleSearchHex">
                  <v-icon>mdi-magnify</v-icon>
                </v-btn>
              </template>
            </v-text-field>
          </v-col>

          <v-col>
            <v-text-field
              v-model="textSearchInput"
              placeholder="Search ASCII text"
              variant="outlined"
              density="comfortable"
              hide-details
              @keyup.enter="handleSearchText">
              <template #prepend-inner>
                <v-icon>mdi-text</v-icon>
              </template>
              <template #append-inner>
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  :disabled="!textSearchInput"
                  @click="handleSearchText">
                  <v-icon>mdi-magnify</v-icon>
                </v-btn>
              </template>
            </v-text-field>
          </v-col>
        </v-row>

        <!-- Search Navigation (appears when matches found) -->
        <v-row v-if="hasSearchMatches" class="mt-3" align="center">
          <v-col cols="auto">
            <v-chip color="success">
              {{ searchMatchInfo.current }} of {{ searchMatchInfo.total }} matches
            </v-chip>
          </v-col>
          <v-col cols="auto">
            <v-btn variant="outlined" @click="handlePreviousMatch">
              <v-icon start>mdi-chevron-left</v-icon>
              Previous
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn variant="outlined" @click="handleNextMatch">
              <v-icon start>mdi-chevron-right</v-icon>
              Next
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn color="error" variant="text" @click="clearSearch">
              <v-icon start>mdi-close</v-icon>
              Clear
            </v-btn>
          </v-col>
        </v-row>

        <!-- Bookmarks Section -->
        <v-row class="mt-4" align="center">
          <v-col cols="auto">
            <v-btn
              color="primary"
              variant="tonal"
              size="small"
              :disabled="!hasSelection"
              @click="handleAddBookmark">
              <v-icon start>mdi-bookmark-plus</v-icon>
              Add Bookmark
            </v-btn>
          </v-col>
          <v-col v-if="sortedBookmarks.length > 0" cols="auto">
            <span class="text-caption text-medium-emphasis">
              {{ sortedBookmarks.length }} bookmark{{ sortedBookmarks.length > 1 ? 's' : '' }}
            </span>
          </v-col>
        </v-row>

        <!-- Bookmarks List -->
        <v-row v-if="sortedBookmarks.length > 0" class="mt-2">
          <v-col cols="12">
            <div class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="bookmark in sortedBookmarks"
                :key="bookmark.id"
                :color="bookmark.color"
                closable
                size="small"
                @click="handleJumpToBookmark(bookmark)"
                @click:close="handleRemoveBookmark(bookmark)">
                <v-icon start size="small">mdi-bookmark</v-icon>
                0x{{ bookmark.offset.toString(16).toUpperCase() }}
              </v-chip>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Hex Display Area -->
    <v-card v-if="fileData" class="hex-display-card">
      <v-card-text class="pa-0">
        <div
          ref="scrollContainerRef"
          class="hex-scroll-container"
          @scroll="handleScroll">
          <!-- Spacer for total height -->
          <div :style="{ height: totalHeight + 'px', position: 'relative' }">
            <!-- Visible rows container -->
            <div
              class="hex-rows-container"
              :style="{ transform: `translateY(${offsetY}px)` }">
              <!-- Render visible rows -->
              <div
                v-for="rowIndex in visibleRowIndices"
                :key="rowIndex"
                class="hex-row">
                <template v-if="getRowData(rowIndex)">
                  <span class="hex-offset">{{ getRowData(rowIndex).offset }}</span>
                  <span class="hex-separator">│</span>
                  <!-- First half hex bytes - clickable -->
                  <span class="hex-data">
                    <span
                      v-for="(byte, i) in getRowData(rowIndex).hexBytes.slice(0, bytesPerRow / 2)"
                      :key="'h1-' + i"
                      class="hex-byte"
                      :class="getByteClasses(getRowData(rowIndex).byteOffset + i)"
                      @click="handleByteClick(getRowData(rowIndex).byteOffset + i, $event)"
                      @mousedown="handleByteMouseDown(getRowData(rowIndex).byteOffset + i, $event)"
                      @mouseenter="handleByteMouseEnter(getRowData(rowIndex).byteOffset + i, $event)">{{ byte }}</span>
                  </span>
                  <span class="hex-group-separator">  </span>
                  <!-- Second half hex bytes - clickable -->
                  <span class="hex-data">
                    <span
                      v-for="(byte, i) in getRowData(rowIndex).hexBytes.slice(bytesPerRow / 2, bytesPerRow)"
                      :key="'h2-' + i"
                      class="hex-byte"
                      :class="getByteClasses(getRowData(rowIndex).byteOffset + bytesPerRow / 2 + i)"
                      @click="handleByteClick(getRowData(rowIndex).byteOffset + bytesPerRow / 2 + i, $event)"
                      @mousedown="handleByteMouseDown(getRowData(rowIndex).byteOffset + bytesPerRow / 2 + i, $event)"
                      @mouseenter="handleByteMouseEnter(getRowData(rowIndex).byteOffset + bytesPerRow / 2 + i, $event)">{{ byte }}</span>
                  </span>
                  <span class="hex-separator">│</span>
                  <!-- ASCII characters - clickable -->
                  <span class="hex-ascii">
                    <span
                      v-for="(char, i) in getRowData(rowIndex).asciiChars"
                      :key="'a-' + i"
                      class="ascii-char"
                      :class="getByteClasses(getRowData(rowIndex).byteOffset + i)"
                      @click="handleByteClick(getRowData(rowIndex).byteOffset + i, $event)"
                      @mousedown="handleByteMouseDown(getRowData(rowIndex).byteOffset + i, $event)"
                      @mouseenter="handleByteMouseEnter(getRowData(rowIndex).byteOffset + i, $event)">{{ char }}</span>
                  </span>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Scroll Info -->
        <v-toolbar density="compact" color="surface-variant">
          <v-toolbar-title class="text-caption">
            <v-icon size="small" start>mdi-file-eye</v-icon>
            Viewing {{ visibleRowCount }} of {{ totalRows }} rows ({{ getScrollPercentage }}%)
          </v-toolbar-title>
          <v-spacer />
          <span v-if="hasSelection" class="text-caption">
            <v-icon size="small" start>mdi-selection</v-icon>
            Selected: {{ selectedBytes?.length || 0 }} bytes (0x{{ selectedByteStart?.toString(16).toUpperCase() }} - 0x{{ selectedByteEnd?.toString(16).toUpperCase() }})
          </span>
        </v-toolbar>
      </v-card-text>
    </v-card>

    <!-- Data Interpretation Panel -->
    <v-card v-if="hasSelection" class="mt-4">
      <v-toolbar flat color="primary" density="compact">
        <v-btn
          icon
          variant="text"
          size="small"
          @click="interpretationExpanded = !interpretationExpanded">
          <v-icon>{{ interpretationExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </v-btn>
        <v-toolbar-title class="text-body-1">
          <v-icon start size="small">mdi-information</v-icon>
          Data Interpretation
          <span class="text-caption text-medium-emphasis ml-2">
            ({{ selectedBytes?.length || 0 }} byte{{ (selectedBytes?.length || 0) === 1 ? '' : 's' }})
          </span>
        </v-toolbar-title>
        <v-spacer />
        <v-btn icon size="small" @click="handleCopyHex">
          <v-icon>mdi-content-copy</v-icon>
          <v-tooltip activator="parent" location="top">Copy as Hex</v-tooltip>
        </v-btn>
        <v-btn icon size="small" @click="handleExportSelection">
          <v-icon>mdi-download</v-icon>
          <v-tooltip activator="parent" location="top">Export Selection</v-tooltip>
        </v-btn>
      </v-toolbar>

      <v-expand-transition>
        <v-card-text v-show="interpretationExpanded">
          <v-row dense>
            <!-- Hex and Text -->
            <v-col cols="12" md="6">
              <div class="interpretation-section">
                <div class="interpretation-label">Hex String</div>
                <div class="interpretation-value monospace">{{ byteInterpretation.hexString || '—' }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="interpretation-section">
                <div class="interpretation-label">UTF-8 Text</div>
                <div class="interpretation-value monospace">{{ byteInterpretation.utf8 || '—' }}</div>
              </div>
            </v-col>

            <!-- Integers - only show if relevant -->
            <v-col cols="12" md="3">
              <div class="interpretation-section">
                <div class="interpretation-label">Int8</div>
                <div class="interpretation-value">{{ byteInterpretation.int8 }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="3">
              <div class="interpretation-section">
                <div class="interpretation-label">UInt8</div>
                <div class="interpretation-value">{{ byteInterpretation.uint8 }}</div>
              </div>
            </v-col>
            <v-col v-if="selectedBytes?.length >= 2" cols="12" md="3">
              <div class="interpretation-section">
                <div class="interpretation-label">Int16 LE</div>
                <div class="interpretation-value">{{ byteInterpretation.int16LE }}</div>
              </div>
            </v-col>
            <v-col v-if="selectedBytes?.length >= 2" cols="12" md="3">
              <div class="interpretation-section">
                <div class="interpretation-label">UInt16 LE</div>
                <div class="interpretation-value">{{ byteInterpretation.uint16LE }}</div>
              </div>
            </v-col>

            <v-col v-if="selectedBytes?.length >= 4" cols="12" md="3">
              <div class="interpretation-section">
                <div class="interpretation-label">Int32 LE</div>
                <div class="interpretation-value">{{ byteInterpretation.int32LE }}</div>
              </div>
            </v-col>
            <v-col v-if="selectedBytes?.length >= 4" cols="12" md="3">
              <div class="interpretation-section">
                <div class="interpretation-label">UInt32 LE</div>
                <div class="interpretation-value">{{ byteInterpretation.uint32LE }}</div>
              </div>
            </v-col>
            <v-col v-if="selectedBytes?.length >= 4" cols="12" md="6">
              <div class="interpretation-section">
                <div class="interpretation-label">Unix Timestamp (LE)</div>
                <div class="interpretation-value">{{ byteInterpretation.timestampLE }}</div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-expand-transition>
    </v-card>

    <!-- Snackbar -->
    <SharedSnackbar
      v-model="snackbar"
      :text="snackbarText"
      :color="snackbarColor" />
  </div>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue';
import { parseDecimalOffset, parseHexOffset } from '@/utils/hexFormatter';
import { formatFileSize } from '@/utils/fileSizeValidator';
import { detectFileType, signatureToHex } from '@/utils/fileSignatures';
import { useClipboard } from '@/composables/useClipboard';
import { useHexViewer } from '@/composables/useHexViewer';
import { usePreferences } from '@/composables/usePreferences';
import { useSnackbar } from '@/composables/useSnackbar';
import { useVirtualScroll } from '@/composables/useVirtualScroll';
import CardSectionHeader from '@/components/CardSectionHeader.vue';
import FileUpload from '@/components/FileUpload.vue';
import LearnMorePanel from '@/components/LearnMorePanel.vue';
import SharedSnackbar from '@/components/SharedSnackbar.vue';
import ToolPageHeader from '@/components/ToolPageHeader.vue';

export default {
  name: 'HexViewer',

  components: {
    CardSectionHeader,
    FileUpload,
    LearnMorePanel,
    SharedSnackbar,
    ToolPageHeader
  },

  setup() {
    const ROW_HEIGHT = 24; // pixels
    const BYTES_PER_ROW_OPTIONS = [8, 16, 32];

    // Composables
    const { snackbar, snackbarColor, snackbarText, showSnackbar } = useSnackbar();
    const { copyToClipboard } = useClipboard();
    const { preferences } = usePreferences('hex-viewer', {
      bytesPerRow: 16,
      offsetFormat: 'hex'
    });

    // Initialize hex viewer - pass saved bytesPerRow preference
    const {
      addBookmark,
      BOOKMARK_COLORS,
      bookmarks,
      bytesPerRow,
      byteInterpretation,
      clearBookmarks,
      clearFile,
      clearSearch,
      clearSelection,
      fileData,
      fileName,
      fileSize,
      getBookmarkAt,
      getRow,
      hasBookmarkAt,
      hasSearchMatches,
      hasSelection,
      isByteInCurrentMatch,
      isByteInSearchMatch,
      isByteSelected,
      isLoading,
      loadFile,
      nextMatch,
      previousMatch,
      removeBookmark,
      searchHexPattern,
      searchMatchInfo,
      searchText,
      selectByte,
      selectByteRange,
      selectedByteEnd,
      selectedBytes,
      selectedByteStart,
      sortedBookmarks,
      toggleOffsetFormat,
      totalRows,
      useHexOffset,
      exportSelection
    } = useHexViewer(preferences.bytesPerRow);

    const {
      endIndex,
      getScrollPercentage,
      handleScroll,
      offsetY,
      scrollContainerRef,
      scrollToOffset,
      startIndex,
      totalHeight,
      updateTotalRows,
      updateViewportHeight,
      visibleRowCount
    } = useVirtualScroll({ rowHeight: ROW_HEIGHT, overscanCount: 5 });

    // Reactive State
    const selectedFile = ref(null);
    const jumpOffsetInput = ref('');
    const hexSearchInput = ref('');
    const textSearchInput = ref('');
    const detectedFileType = ref(null);
    const interpretationExpanded = ref(true); // Data interpretation panel expanded state

    // Computed Properties

    /**
     * Gets formatted file size string
     */
    const formattedFileSize = computed(() => {
      return formatFileSize(fileSize.value);
    });

    /**
     * Generates array of visible row indices using Array.from for better performance
     */
    const visibleRowIndices = computed(() => {
      const count = endIndex.value - startIndex.value;
      return Array.from({ length: count }, (_, i) => startIndex.value + i);
    });

    // Watchers

    /**
     * Watch file selection and auto-load file
     * Similar pattern to MetadataEditor for consistency
     */
    watch(selectedFile, async (newFile) => {
      if (newFile) {
        try {
          await loadFile(newFile);
          updateTotalRows(totalRows.value);

          // Detect file type from magic numbers
          detectedFileType.value = detectFileType(fileData.value);

          const typeInfo = detectedFileType.value
            ? ` - Detected: ${detectedFileType.value.description}`
            : '';
          showSnackbar(`Loaded ${fileName.value} (${formattedFileSize.value})${typeInfo}`, 'success');
        } catch (error) {
          showSnackbar(`Failed to load file: ${error.message}`, 'error');
          console.error('File load error:', error);
        }
      } else {
        // Clear all state when file is removed
        clearFile();
        detectedFileType.value = null;
        jumpOffsetInput.value = '';
        hexSearchInput.value = '';
        textSearchInput.value = '';
      }
    });

    /**
     * Watch offset format toggle and sync with composable
     */
    watch(() => preferences.offsetFormat, (newFormat) => {
      if (newFormat === 'hex') {
        toggleOffsetFormat(); // Switch to hex if currently decimal
      } else {
        if (useHexOffset.value) toggleOffsetFormat(); // Switch to decimal if currently hex
      }
    });

    /**
     * Watch bytesPerRow changes and sync with preferences
     */
    watch(bytesPerRow, (newVal) => {
      preferences.bytesPerRow = newVal;
    });

    /**
     * Sync total rows with virtual scroller
     */
    watch(totalRows, (newTotal) => {
      updateTotalRows(newTotal);
    });

    // Functions

    /**
     * Handles jump to offset action
     */
    const handleJumpToOffset = () => {
      if (!jumpOffsetInput.value.trim()) return;

      let offset;
      if (preferences.offsetFormat === 'hex') {
        offset = parseHexOffset(jumpOffsetInput.value);
      } else {
        offset = parseDecimalOffset(jumpOffsetInput.value);
      }

      if (offset === null || offset < 0 || offset >= fileSize.value) {
        showSnackbar('❌ Invalid offset', 'error');
        return;
      }

      scrollToOffset(offset, bytesPerRow.value);
      showSnackbar(`✅ Jumped to offset 0x${offset.toString(16).toUpperCase()}`, 'success');
      jumpOffsetInput.value = '';
    };

    /**
     * Handles hex pattern search
     */
    const handleSearchHex = () => {
      if (!hexSearchInput.value.trim()) return;

      searchHexPattern(hexSearchInput.value);

      if (hasSearchMatches.value) {
        const firstMatch = searchMatchInfo.value.offset;
        scrollToOffset(firstMatch, bytesPerRow.value);
        showSnackbar(`✅ Found ${searchMatchInfo.value.total} matches`, 'success');
      } else {
        showSnackbar('❌ No matches found', 'warning');
      }
    };

    /**
     * Handles text search
     */
    const handleSearchText = () => {
      if (!textSearchInput.value.trim()) return;

      searchText(textSearchInput.value);

      if (hasSearchMatches.value) {
        const firstMatch = searchMatchInfo.value.offset;
        scrollToOffset(firstMatch, bytesPerRow.value);
        showSnackbar(`✅ Found ${searchMatchInfo.value.total} matches`, 'success');
      } else {
        showSnackbar('❌ No matches found', 'warning');
      }
    };

    /**
     * Handles next match navigation
     */
    const handleNextMatch = () => {
      const offset = nextMatch();
      if (offset !== undefined) {
        scrollToOffset(offset, bytesPerRow.value);
      }
    };

    /**
     * Handles previous match navigation
     */
    const handlePreviousMatch = () => {
      const offset = previousMatch();
      if (offset !== undefined) {
        scrollToOffset(offset, bytesPerRow.value);
      }
    };

    /**
     * Handles copy selection as hex
     */
    const handleCopyHex = async () => {
      if (!byteInterpretation.value.hexString) return;

      const success = await copyToClipboard(byteInterpretation.value.hexString);
      if (success) {
        showSnackbar('✅ Hex data copied to clipboard', 'success');
      } else {
        showSnackbar('❌ Failed to copy', 'error');
      }
    };

    /**
     * Handles export selection to file
     */
    const handleExportSelection = () => {
      if (!hasSelection.value) return;

      const filename = `selection_0x${selectedByteStart.value.toString(16)}.bin`;
      exportSelection(filename);
      showSnackbar(`✅ Exported ${selectedBytes.value.length} bytes`, 'success');
    };

    // Selection state for shift-click and drag range selection
    const selectionAnchor = ref(null);
    const isDragging = ref(false);

    /**
     * Gets row data with memoization to avoid recalculation
     * @param {number} rowIndex - Row index
     * @returns {Object|null} Row data object
     */
    const getRowData = (rowIndex) => {
      return getRow(rowIndex);
    };

    /**
     * Handles byte click for selection
     * @param {number} byteOffset - Byte offset clicked
     * @param {Event} event - Click event
     */
    const handleByteClick = (byteOffset, event) => {
      if (byteOffset >= fileSize.value) return;

      // If we just finished dragging, don't process click
      if (isDragging.value) {
        isDragging.value = false;
        return;
      }

      if (event.shiftKey && selectionAnchor.value !== null) {
        // Shift-click: select range from anchor to current
        selectByteRange(selectionAnchor.value, byteOffset);
      } else {
        // Normal click: select single byte and set as anchor
        selectByte(byteOffset);
        selectionAnchor.value = byteOffset;
      }
    };

    /**
     * Handles byte mousedown for drag selection start
     * @param {number} byteOffset - Byte offset
     * @param {Event} event - Mouse event
     */
    const handleByteMouseDown = (byteOffset, event) => {
      if (event.shiftKey) return; // Let click handler deal with shift-click
      if (event.button !== 0) return; // Only left mouse button

      // Set anchor for potential drag selection
      selectionAnchor.value = byteOffset;
      selectByte(byteOffset);

      // Start listening for mouse movement
      const handleMouseMove = (moveEvent) => {
        // Find the byte under the cursor
        const target = moveEvent.target;
        if (target.classList.contains('hex-byte') || target.classList.contains('ascii-char')) {
          // Get byte offset from the parent row context
          // This is a simplified approach - we mark dragging as active
          isDragging.value = true;
        }
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        // isDragging will be reset in handleByteClick
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    /**
     * Handles byte mouse enter for drag selection extension
     * @param {number} byteOffset - Byte offset
     * @param {Event} event - Mouse event
     */
    const handleByteMouseEnter = (byteOffset, event) => {
      // Only extend selection if left mouse button is pressed (dragging)
      if (event.buttons !== 1) return;
      if (selectionAnchor.value === null) return;
      if (byteOffset >= fileSize.value) return;

      isDragging.value = true;
      selectByteRange(selectionAnchor.value, byteOffset);
    };

    /**
     * Gets CSS classes for a byte based on selection and search state
     * @param {number} byteOffset - Byte offset
     * @returns {Object} CSS class object
     */
    const getByteClasses = (byteOffset) => {
      if (byteOffset >= fileSize.value) {
        return { 'byte-empty': true };
      }

      return {
        'byte-selected': isByteSelected(byteOffset),
        'byte-current-match': isByteInCurrentMatch(byteOffset),
        'byte-search-match': isByteInSearchMatch(byteOffset) && !isByteInCurrentMatch(byteOffset)
      };
    };

    /**
     * Jumps to and selects the file signature bytes
     */
    const handleJumpToSignature = () => {
      if (!detectedFileType.value) return;

      const { signatureOffset, signatureLength } = detectedFileType.value;
      const endOffset = signatureOffset + signatureLength - 1;

      scrollToOffset(signatureOffset, bytesPerRow.value);
      selectByteRange(signatureOffset, endOffset);
      showSnackbar(`Jumped to signature at offset 0x${signatureOffset.toString(16).toUpperCase()}`, 'info');
    };

    /**
     * Adds a bookmark at the current selection or specified offset
     */
    const handleAddBookmark = () => {
      const offset = selectedByteStart.value;
      if (offset === null) {
        showSnackbar('Select a byte first to bookmark', 'warning');
        return;
      }

      if (hasBookmarkAt(offset)) {
        showSnackbar('Bookmark already exists at this offset', 'info');
        return;
      }

      addBookmark(offset);
      showSnackbar(`Bookmark added at 0x${offset.toString(16).toUpperCase()}`, 'success');
    };

    /**
     * Jumps to a specific bookmark
     * @param {Object} bookmark - Bookmark to jump to
     */
    const handleJumpToBookmark = (bookmark) => {
      scrollToOffset(bookmark.offset, bytesPerRow.value);
      selectByte(bookmark.offset);
      showSnackbar(`Jumped to ${bookmark.label}`, 'info');
    };

    /**
     * Removes a specific bookmark
     * @param {Object} bookmark - Bookmark to remove
     */
    const handleRemoveBookmark = (bookmark) => {
      removeBookmark(bookmark.id);
      showSnackbar('Bookmark removed', 'info');
    };

    /**
     * Gets hex representation of the detected signature
     */
    const detectedSignatureHex = computed(() => {
      if (!detectedFileType.value) return '';
      return signatureToHex(detectedFileType.value.signatureBytes);
    });

    // Lifecycle Hooks

    /**
     * Initialize viewport height on mount
     */
    onMounted(() => {
      if (scrollContainerRef.value) {
        updateViewportHeight(scrollContainerRef.value.clientHeight);
      }
    });

    // Return
    return {
      // Constants
      BYTES_PER_ROW_OPTIONS,

      // State - File
      bytesPerRow,
      detectedFileType,
      fileData,
      fileName,
      fileSize,
      selectedFile,

      // State - Loading
      isLoading,

      // State - Controls
      hexSearchInput,
      interpretationExpanded,
      jumpOffsetInput,
      textSearchInput,

      // Preferences (persistent)
      preferences,

      // State - Virtual Scroll
      offsetY,
      scrollContainerRef,
      totalHeight,
      totalRows,
      visibleRowCount,

      // State - Selection
      byteInterpretation,
      hasSelection,
      selectedByteEnd,
      selectedBytes,
      selectedByteStart,

      // State - Search
      hasSearchMatches,
      searchMatchInfo,

      // State - Bookmarks
      bookmarks,
      sortedBookmarks,

      // Snackbar
      snackbar,
      snackbarColor,
      snackbarText,

      // Computed
      detectedSignatureHex,
      formattedFileSize,
      getScrollPercentage,
      visibleRowIndices,

      // Methods
      clearSearch,
      getByteClasses,
      getRowData,
      handleAddBookmark,
      handleByteClick,
      handleByteMouseDown,
      handleByteMouseEnter,
      handleCopyHex,
      handleExportSelection,
      handleJumpToBookmark,
      handleJumpToOffset,
      handleJumpToSignature,
      handleNextMatch,
      handlePreviousMatch,
      handleRemoveBookmark,
      handleScroll,
      handleSearchHex,
      handleSearchText
    };
  }
};
</script>

<style scoped>
.hex-viewer-container {
  max-width: 1400px;
}

.hex-display-card {
  background: #1e1e1e;
}

.hex-scroll-container {
  height: 600px;
  overflow-y: auto;
  overflow-x: auto;
  background: #1e1e1e;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 24px;
  padding: 8px;
}

@media (max-width: 599px) {
  .hex-scroll-container {
    height: 400px;
    font-size: 11px;
    line-height: 20px;
    padding: 4px;
  }

  .hex-offset {
    min-width: 60px;
  }
}

.hex-rows-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.hex-row {
  display: flex;
  white-space: pre;
  height: 24px;
  color: #d4d4d4;
  user-select: none;
}

.hex-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.hex-offset {
  color: #858585;
  margin-right: 12px;
  min-width: 80px;
  text-align: right;
}

.hex-separator {
  color: #6a9fb5;
  margin: 0 8px;
}

.hex-data {
  color: #4ec9b0;
}

.hex-byte {
  cursor: pointer;
  padding: 0 2px;
  border-radius: 2px;
  transition: background-color 0.1s;
}

.hex-byte:hover {
  background: rgba(255, 255, 255, 0.15);
}

.hex-group-separator {
  display: inline-block;
  width: 16px;
}

.hex-ascii {
  color: #ce9178;
  margin-left: 16px;
}

.ascii-char {
  cursor: pointer;
  padding: 0 1px;
  border-radius: 2px;
  transition: background-color 0.1s;
}

.ascii-char:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* Selection highlighting */
.byte-selected {
  background: rgba(33, 150, 243, 0.4) !important;
  color: #fff;
}

/* Search match highlighting */
.byte-search-match {
  background: rgba(255, 193, 7, 0.3) !important;
}

/* Current (active) search match highlighting */
.byte-current-match {
  background: rgba(255, 152, 0, 0.6) !important;
  color: #fff;
}

/* Empty bytes (padding) */
.byte-empty {
  cursor: default;
  opacity: 0.3;
}

.interpretation-section {
  margin-bottom: 12px;
}

.interpretation-label {
  font-size: 12px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.7;
  margin-bottom: 4px;
}

.interpretation-value {
  font-size: 14px;
  padding: 8px;
  background: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface-variant));
  border-radius: 4px;
  word-break: break-all;
}

.monospace {
  font-family: 'Courier New', monospace;
}
</style>
