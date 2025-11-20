<template>
  <v-card v-if="isVisible" variant="tonal" :class="cardClass" :data-testid="testId">
    <v-card-title class="d-flex align-center">
      <v-icon icon="mdi-table" class="mr-2"></v-icon>
      CSV Preview
      <v-spacer></v-spacer>
      <v-btn
        v-if="showDownload"
        variant="text"
        color="primary"
        @click="handleDownload"
        class="mr-2">
        <v-icon start>mdi-download</v-icon>
        Download
      </v-btn>
      <v-btn icon size="small" variant="text" @click="handleClose">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text class="pa-4">
      <v-row class="mb-4">
        <v-col cols="12" md="4">
          <v-text-field
            v-model="searchQuery"
            label="Search"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            hide-details
            single-line
            density="comfortable">
          </v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-data-table
            :headers="headers"
            :items="data"
            :search="searchQuery"
            density="comfortable">
            <template #no-data>
              <div class="text-center pa-4">
                <v-icon size="48" color="grey">mdi-table-off</v-icon>
                <p class="text-body-2 text-medium-emphasis mt-2">No results to display</p>
              </div>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { ref, computed } from 'vue';

/**
 * CsvPreviewTable Component
 *
 * Reusable component for displaying CSV data in a searchable data table.
 * Used by AES encryption/decryption tools to preview CSV file contents.
 *
 * @component
 * @example
 * <CsvPreviewTable
 *   :headers="csvHeaders"
 *   :data="csvData"
 *   @close="clearOutputs"
 * />
 */
export default {
  name: 'CsvPreviewTable',
  props: {
    /**
     * Table headers array for v-data-table
     * @type {Array<{title: string, value: string}>}
     */
    headers: {
      type: Array,
      required: true,
      default: () => []
    },
    /**
     * Table data array (rows)
     * @type {Array<Object>}
     */
    data: {
      type: Array,
      required: true,
      default: () => []
    },
    /**
     * Show download button in header
     */
    showDownload: {
      type: Boolean,
      default: false
    },
    /**
     * CSS class for the card
     */
    cardClass: {
      type: String,
      default: ''
    },
    /**
     * Test ID for the card
     */
    testId: {
      type: String,
      default: ''
    }
  },
  emits: ['close', 'download'],
  setup(props, { emit }) {
    // Local state for search
    const searchQuery = ref('');

    /**
     * Computed property to determine if table should be visible
     * Shows table if there are headers or data rows
     */
    const isVisible = computed(() => {
      return props.headers.length > 0 || props.data.length > 0;
    });

    /**
     * Handle close button click
     * Emits 'close' event to parent component
     */
    const handleClose = () => {
      emit('close');
    };

    /**
     * Handle download button click
     * Emits 'download' event to parent component
     */
    const handleDownload = () => {
      emit('download');
    };

    return {
      searchQuery,
      isVisible,
      handleClose,
      handleDownload
    };
  }
};
</script>
