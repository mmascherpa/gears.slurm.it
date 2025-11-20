<template>
  <div>
    <!-- Page Header -->
    <ToolPageHeader
      title="Hex Viewer"
      description="View and analyze binary files with hex dump display"
      icon="mdi-file-code"
      avatar-color="primary" />

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
          <!-- Offset Format Toggle -->
          <v-col cols="6" sm="auto">
            <v-btn-toggle v-model="offsetFormat" mandatory density="comfortable" class="w-100">
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
              :placeholder="offsetFormat === 'hex' ? 'Jump to hex offset (e.g., FF)' : 'Jump to decimal offset'"
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
                <template v-if="getRow(rowIndex)">
                  <span class="hex-offset">{{ getRow(rowIndex).offset }}</span>
                  <span class="hex-separator">│</span>
                  <span class="hex-data">{{ getRow(rowIndex).hexPart1 }}</span>
                  <span class="hex-group-separator">  </span>
                  <span class="hex-data">{{ getRow(rowIndex).hexPart2 }}</span>
                  <span class="hex-separator">│</span>
                  <span class="hex-ascii">{{ getRow(rowIndex).ascii }}</span>
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
      <v-toolbar flat color="primary">
        <v-toolbar-title>
          <v-icon start>mdi-information</v-icon>
          Data Interpretation
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

      <v-card-text>
        <v-row dense>
          <!-- Hex and Text -->
          <v-col cols="12" md="6">
            <div class="interpretation-section">
              <div class="interpretation-label">Hex String</div>
              <div class="interpretation-value monospace">{{ byteInterpretation.hexString }}</div>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="interpretation-section">
              <div class="interpretation-label">UTF-8 Text</div>
              <div class="interpretation-value monospace">{{ byteInterpretation.utf8 }}</div>
            </div>
          </v-col>

          <!-- Integers -->
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
          <v-col cols="12" md="3">
            <div class="interpretation-section">
              <div class="interpretation-label">Int16 LE</div>
              <div class="interpretation-value">{{ byteInterpretation.int16LE }}</div>
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <div class="interpretation-section">
              <div class="interpretation-label">UInt16 LE</div>
              <div class="interpretation-value">{{ byteInterpretation.uint16LE }}</div>
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <div class="interpretation-section">
              <div class="interpretation-label">Int32 LE</div>
              <div class="interpretation-value">{{ byteInterpretation.int32LE }}</div>
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <div class="interpretation-section">
              <div class="interpretation-label">UInt32 LE</div>
              <div class="interpretation-value">{{ byteInterpretation.uint32LE }}</div>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="interpretation-section">
              <div class="interpretation-label">Unix Timestamp (LE)</div>
              <div class="interpretation-value">{{ byteInterpretation.timestampLE }}</div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
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
import { useClipboard } from '@/composables/useClipboard';
import { useHexViewer } from '@/composables/useHexViewer';
import { useSnackbar } from '@/composables/useSnackbar';
import { useVirtualScroll } from '@/composables/useVirtualScroll';
import CardSectionHeader from '@/components/CardSectionHeader.vue';
import FileUpload from '@/components/FileUpload.vue';
import SharedSnackbar from '@/components/SharedSnackbar.vue';
import ToolPageHeader from '@/components/ToolPageHeader.vue';

export default {
  name: 'HexViewer',

  components: {
    CardSectionHeader,
    FileUpload,
    SharedSnackbar,
    ToolPageHeader
  },

  setup() {
    const BYTES_PER_ROW = 16;
    const ROW_HEIGHT = 24; // pixels

    // Composables
    const { snackbar, snackbarColor, snackbarText, showSnackbar } = useSnackbar();
    const { copyToClipboard } = useClipboard();

    const {
      byteInterpretation,
      clearFile,
      clearSearch,
      clearSelection,
      fileData,
      fileName,
      fileSize,
      getRow,
      hasSearchMatches,
      hasSelection,
      isLoading,
      loadFile,
      nextMatch,
      previousMatch,
      searchHexPattern,
      searchMatchInfo,
      searchText,
      selectedByteEnd,
      selectedBytes,
      selectedByteStart,
      toggleOffsetFormat,
      totalRows,
      useHexOffset,
      exportSelection
    } = useHexViewer(BYTES_PER_ROW);

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
    const offsetFormat = ref('hex');
    const jumpOffsetInput = ref('');
    const hexSearchInput = ref('');
    const textSearchInput = ref('');

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
          showSnackbar(`✅ Loaded ${fileName.value} (${formattedFileSize.value})`, 'success');
        } catch (error) {
          showSnackbar(`❌ Failed to load file: ${error.message}`, 'error');
          console.error('File load error:', error);
        }
      } else {
        // Clear all state when file is removed
        clearFile();
        jumpOffsetInput.value = '';
        hexSearchInput.value = '';
        textSearchInput.value = '';
      }
    });

    /**
     * Watch offset format toggle
     */
    watch(offsetFormat, (newFormat) => {
      if (newFormat === 'hex') {
        toggleOffsetFormat(); // Switch to hex if currently decimal
      } else {
        if (useHexOffset.value) toggleOffsetFormat(); // Switch to decimal if currently hex
      }
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
      if (offsetFormat.value === 'hex') {
        offset = parseHexOffset(jumpOffsetInput.value);
      } else {
        offset = parseDecimalOffset(jumpOffsetInput.value);
      }

      if (offset === null || offset < 0 || offset >= fileSize.value) {
        showSnackbar('❌ Invalid offset', 'error');
        return;
      }

      scrollToOffset(offset, BYTES_PER_ROW);
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
        scrollToOffset(firstMatch, BYTES_PER_ROW);
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
        scrollToOffset(firstMatch, BYTES_PER_ROW);
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
        scrollToOffset(offset, BYTES_PER_ROW);
      }
    };

    /**
     * Handles previous match navigation
     */
    const handlePreviousMatch = () => {
      const offset = previousMatch();
      if (offset !== undefined) {
        scrollToOffset(offset, BYTES_PER_ROW);
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
      // State - File
      fileData,
      fileName,
      selectedFile,

      // State - Loading
      isLoading,

      // State - Controls
      hexSearchInput,
      jumpOffsetInput,
      offsetFormat,
      textSearchInput,

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

      // Snackbar
      snackbar,
      snackbarColor,
      snackbarText,

      // Computed
      formattedFileSize,
      getScrollPercentage,
      visibleRowIndices,

      // Methods
      clearSearch,
      getRow,
      handleCopyHex,
      handleExportSelection,
      handleJumpToOffset,
      handleNextMatch,
      handlePreviousMatch,
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
  letter-spacing: 1px;
}

.hex-group-separator {
  display: inline-block;
  width: 16px;
}

.hex-ascii {
  color: #ce9178;
  margin-left: 16px;
  letter-spacing: 2px;
}

.interpretation-section {
  margin-bottom: 12px;
}

.interpretation-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 4px;
}

.interpretation-value {
  font-size: 14px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  word-break: break-all;
}

.monospace {
  font-family: 'Courier New', monospace;
}
</style>
