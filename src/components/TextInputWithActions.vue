<template>
  <v-row no-gutters :class="rowClass">
    <v-col class="flex-grow-1">
      <v-textarea
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        :label="label"
        :placeholder="placeholder"
        :rows="rows"
        :variant="variant"
        :density="density"
        :readonly="readonly"
        :disabled="disabled"
        :class="textareaClass"
        hide-details>
      </v-textarea>
    </v-col>
    <v-col class="ml-2 button-column" :class="buttonColumnClass" cols="auto">
      <!-- Loading spinner -->
      <v-progress-circular
        v-if="isLoading"
        indeterminate
        :size="48"
        :width="6"
        color="primary">
      </v-progress-circular>

      <!-- Action buttons -->
      <template v-else>
        <!-- Paste button -->
        <v-tooltip v-if="showPaste && !modelValue" text="Paste from clipboard" location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              flat
              icon
              @click="$emit('paste')"
              aria-label="Paste from clipboard">
              <v-icon icon="mdi-content-paste"></v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <!-- Clear button -->
        <v-tooltip v-if="showClear && modelValue" text="Clear text" location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              flat
              icon
              @click="$emit('clear')"
              aria-label="Clear text">
              <v-icon icon="mdi-close-octagon-outline"></v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <!-- Copy button -->
        <v-tooltip v-if="showCopy && modelValue" text="Copy to clipboard" location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              flat
              icon
              :class="copyButtonClass"
              @click="$emit('copy')"
              aria-label="Copy to clipboard">
              <v-icon icon="mdi-content-copy"></v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <!-- Download button (optional) -->
        <v-tooltip v-if="showDownload && modelValue" text="Download as file" location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              flat
              icon
              @click="$emit('download')"
              aria-label="Download as file">
              <v-icon icon="mdi-download"></v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <!-- Custom slot for additional buttons -->
        <slot name="actions"></slot>
      </template>
    </v-col>
  </v-row>
</template>

<script>
/**
 * TextInputWithActions Component
 *
 * Reusable textarea component with consistent action buttons (paste, copy, clear, download).
 * Provides a standardized layout for text input/output across all tool components.
 *
 * Features:
 * - Clipboard integration (paste/copy)
 * - Optional download button
 * - Loading state with spinner
 * - Consistent button positioning
 * - Accessibility support (aria-labels, tooltips)
 * - Customizable via slots and props
 *
 * @component
 * @example
 * <TextInputWithActions
 *   v-model="plainText"
 *   label="Plain Text"
 *   placeholder="Enter text here..."
 *   :rows="6"
 *   :show-paste="true"
 *   :show-clear="true"
 *   @paste="handlePaste"
 *   @clear="handleClear"
 * />
 */
export default {
  name: 'TextInputWithActions',
  props: {
    /**
     * Text content (v-model)
     */
    modelValue: {
      type: String,
      default: ''
    },
    /**
     * Textarea label
     */
    label: {
      type: String,
      default: ''
    },
    /**
     * Textarea placeholder
     */
    placeholder: {
      type: String,
      default: ''
    },
    /**
     * Number of rows
     */
    rows: {
      type: Number,
      default: 4
    },
    /**
     * Vuetify variant (outlined, filled, etc.)
     */
    variant: {
      type: String,
      default: 'outlined'
    },
    /**
     * Vuetify density (comfortable, compact, default)
     */
    density: {
      type: String,
      default: 'comfortable'
    },
    /**
     * Read-only mode
     */
    readonly: {
      type: Boolean,
      default: false
    },
    /**
     * Disabled state
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * Show loading spinner
     */
    isLoading: {
      type: Boolean,
      default: false
    },
    /**
     * Show paste button (when empty)
     */
    showPaste: {
      type: Boolean,
      default: true
    },
    /**
     * Show clear button (when has content)
     */
    showClear: {
      type: Boolean,
      default: true
    },
    /**
     * Show copy button (when has content)
     */
    showCopy: {
      type: Boolean,
      default: true
    },
    /**
     * Show download button (when has content)
     */
    showDownload: {
      type: Boolean,
      default: false
    },
    /**
     * Custom class for textarea
     */
    textareaClass: {
      type: String,
      default: ''
    },
    /**
     * Custom class for row
     */
    rowClass: {
      type: String,
      default: ''
    },
    /**
     * Custom class for button column
     */
    buttonColumnClass: {
      type: String,
      default: ''
    },
    /**
     * Custom class for copy button
     */
    copyButtonClass: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'paste', 'clear', 'copy', 'download']
};
</script>

<style scoped>
.button-column {
  min-width: 48px;
}
</style>
