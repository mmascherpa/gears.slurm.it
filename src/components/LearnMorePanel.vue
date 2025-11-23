<template>
  <v-expansion-panels
    v-model="panelState"
    class="mb-4"
    variant="accordion"
  >
    <v-expansion-panel
      bg-color="info-darken-3"
      @group:selected="onPanelToggle"
    >
      <v-expansion-panel-title>
        <v-icon icon="mdi-help-circle-outline" class="mr-3" color="info"></v-icon>
        <span class="font-weight-medium">{{ title }}</span>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <div class="text-body-2">
          <slot></slot>
        </div>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  storageKey: {
    type: String,
    required: true,
    validator: (value) => value.startsWith('slurm-help-')
  }
})

const panelState = ref([])

onMounted(() => {
  // Check if user has seen this help section before
  const hasSeenHelp = localStorage.getItem(props.storageKey)

  // Auto-expand on first visit (panel index 0)
  if (!hasSeenHelp) {
    panelState.value = [0]
  }
})

function onPanelToggle(event) {
  // Mark as seen when user interacts with panel (expands or collapses)
  if (event.value !== undefined) {
    localStorage.setItem(props.storageKey, 'true')
  }
}
</script>
