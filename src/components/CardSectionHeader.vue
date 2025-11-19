<template>
  <v-card-title :class="cardTitleClass">
    <v-icon v-if="icon" :icon="icon" :size="iconSize" class="mr-2"></v-icon>
    <span :class="textClass">{{ title }}</span>
    <slot name="actions"></slot>
  </v-card-title>
</template>

<script>
/**
 * CardSectionHeader Component
 *
 * Reusable card section header component with consistent styling across all tool components.
 * Provides a standardized header with optional icon and customizable appearance.
 *
 * Features:
 * - Consistent styling with bg-surface-variant background
 * - Optional icon support
 * - Customizable padding and text size
 * - Slot for additional actions (buttons, etc.)
 * - Follows Material Design patterns
 *
 * @component
 * @example
 * <CardSectionHeader
 *   title="Upload File"
 *   icon="mdi-upload"
 *   icon-size="small"
 * />
 *
 * @example
 * <!-- With action buttons -->
 * <CardSectionHeader title="Controls">
 *   <template #actions>
 *     <v-btn size="small">Action</v-btn>
 *   </template>
 * </CardSectionHeader>
 */
export default {
  name: 'CardSectionHeader',
  props: {
    /**
     * Header title text
     */
    title: {
      type: String,
      required: true
    },
    /**
     * Material Design Icon name (optional)
     */
    icon: {
      type: String,
      default: null
    },
    /**
     * Icon size (small, default, large, x-small)
     */
    iconSize: {
      type: String,
      default: 'small'
    },
    /**
     * Custom class for card title container
     */
    cardTitleClass: {
      type: String,
      default: 'bg-surface-variant pa-2'
    },
    /**
     * Custom class for title text
     */
    textClass: {
      type: String,
      default: 'text-body-1'
    }
  }
};
</script>
