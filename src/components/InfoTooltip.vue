<template>
  <v-tooltip :location="location" max-width="300">
    <template v-slot:activator="{ props: tooltipProps }">
      <v-icon
        v-bind="tooltipProps"
        :icon="icon"
        :size="size"
        :color="color"
        class="ml-2"
        style="cursor: help;"
      ></v-icon>
    </template>
    <span class="text-body-2">{{ text }}</span>
  </v-tooltip>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'mdi-information-outline'
  },
  size: {
    type: String,
    default: 'small'
  },
  color: {
    type: String,
    default: 'info'
  },
  location: {
    type: String,
    default: 'top'
  }
})
</script>
