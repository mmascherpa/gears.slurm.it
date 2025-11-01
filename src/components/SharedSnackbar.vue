<template>
  <v-snackbar
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :color="color"
    :timeout="timeout"
    :location="location">
    {{ text }}
  </v-snackbar>
</template>

<script>
/**
 * SharedSnackbar Component
 *
 * Reusable snackbar component with consistent styling and behavior
 * across the entire application. Provides transient notifications
 * for user feedback (success, error, warning, info).
 *
 * Typically used in conjunction with the useSnackbar composable.
 *
 * @component
 * @example
 * // In your component:
 * import { useSnackbar } from '@/composables/useSnackbar';
 * const { snackbar, snackbarText, snackbarColor, showSnackbar } = useSnackbar();
 *
 * // In template:
 * // <SharedSnackbar v-model="snackbar" :text="snackbarText" :color="snackbarColor" />
 */
export default {
  name: 'SharedSnackbar',
  props: {
    /**
     * Snackbar visibility (v-model)
     */
    modelValue: {
      type: Boolean,
      required: true
    },
    /**
     * Message text to display
     */
    text: {
      type: String,
      required: true
    },
    /**
     * Snackbar color variant
     * @values success, error, warning, info
     */
    color: {
      type: String,
      default: 'success',
      validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
    },
    /**
     * Auto-hide timeout in milliseconds
     */
    timeout: {
      type: Number,
      default: 3000
    },
    /**
     * Snackbar location on screen
     * @values top, bottom, left, right, center
     */
    location: {
      type: String,
      default: 'top',
      validator: (value) => ['top', 'bottom', 'left', 'right', 'center'].includes(value)
    }
  },
  emits: ['update:modelValue']
};
</script>
