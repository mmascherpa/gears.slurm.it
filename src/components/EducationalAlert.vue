<template>
  <v-alert
    :type="type"
    :variant="variant"
    :density="density"
    :class="computedClass"
  >
    <div class="text-body-2">
      <strong v-if="title">{{ title }}:</strong> <slot></slot>
    </div>
  </v-alert>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'info'
  },
  variant: {
    type: String,
    default: 'tonal'
  },
  density: {
    type: String,
    default: 'compact'
  },
  spacing: {
    type: String,
    default: 'mt-3'
  }
})

const computedClass = computed(() => props.spacing)
</script>
