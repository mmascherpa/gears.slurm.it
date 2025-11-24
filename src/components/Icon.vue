<template>
  <v-icon :icon="resolvedIcon" v-bind="$attrs" />
</template>

<script setup>
import { computed } from 'vue'
import { ICONS } from '@/constants/icons'

/**
 * Icon Wrapper Component
 *
 * Provides an abstraction layer over the icon library implementation.
 * This allows changing icon libraries in the future by updating only this component.
 *
 * Usage:
 * <Icon name="LOCK" />
 * <Icon name="DOWNLOAD" size="small" color="primary" />
 *
 * Benefits:
 * - Complete abstraction from icon library (Lucide, Material, etc.)
 * - Semantic naming via ICONS constants
 * - Easy to add fallback logic
 * - Centralized icon missing warnings
 * - Future-proof for icon library changes
 */

const props = defineProps({
  /**
   * Semantic icon name from ICONS constants (e.g., 'LOCK', 'DOWNLOAD')
   * Also supports direct Lucide icon names (e.g., 'Lock', 'Download')
   * Also supports legacy MDI names (e.g., 'mdi-lock') for backward compatibility
   */
  name: {
    type: String,
    required: true
  }
})

// Resolve the icon name to the actual icon component name
const resolvedIcon = computed(() => {
  const iconName = props.name

  // Option 1: Name is a semantic constant (e.g., 'LOCK', 'DOWNLOAD')
  if (ICONS[iconName]) {
    return ICONS[iconName]
  }

  // Option 2: Name is already a Lucide icon name (e.g., 'Lock', 'Download')
  // or an MDI name (e.g., 'mdi-lock') - pass through to Vuetify
  return iconName
})
</script>

<style scoped>
/* No custom styles - icons inherit from v-icon */
</style>
