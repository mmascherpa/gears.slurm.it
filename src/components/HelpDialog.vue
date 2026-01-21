<template>
  <v-dialog
    v-model="dialog"
    max-width="600"
    scrollable
  >
    <v-card>
      <v-card-title class="bg-surface-variant d-flex align-center">
        <v-icon icon="mdi-help-circle-outline" class="mr-2"></v-icon>
        Keyboard Shortcuts & Help
        <v-spacer></v-spacer>
        <v-btn
          icon
          size="small"
          variant="text"
          @click="dialog = false"
          aria-label="Close help dialog"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-4">
        <!-- Keyboard Shortcuts -->
        <h3 class="text-h6 mb-3">Keyboard Shortcuts</h3>

        <v-list density="compact" class="mb-4">
          <v-list-item>
            <template v-slot:prepend>
              <kbd class="kbd-key mr-2">?</kbd>
            </template>
            <v-list-item-title>Open this help dialog</v-list-item-title>
          </v-list-item>

          <v-list-item>
            <template v-slot:prepend>
              <kbd class="kbd-key mr-2">Esc</kbd>
            </template>
            <v-list-item-title>Close dialogs and menus</v-list-item-title>
          </v-list-item>

          <v-list-item>
            <template v-slot:prepend>
              <span class="mr-2">
                <kbd class="kbd-key">{{ ctrlKey }}</kbd>
                <span class="text-medium-emphasis mx-1">+</span>
                <kbd class="kbd-key">V</kbd>
              </span>
            </template>
            <v-list-item-title>Paste from clipboard</v-list-item-title>
          </v-list-item>

          <v-list-item>
            <template v-slot:prepend>
              <span class="mr-2">
                <kbd class="kbd-key">{{ ctrlKey }}</kbd>
                <span class="text-medium-emphasis mx-1">+</span>
                <kbd class="kbd-key">C</kbd>
              </span>
            </template>
            <v-list-item-title>Copy selected text</v-list-item-title>
          </v-list-item>

          <v-list-item>
            <template v-slot:prepend>
              <kbd class="kbd-key mr-2">Tab</kbd>
            </template>
            <v-list-item-title>Navigate between interactive elements</v-list-item-title>
          </v-list-item>

          <v-list-item>
            <template v-slot:prepend>
              <kbd class="kbd-key mr-2">Enter</kbd>
            </template>
            <v-list-item-title>Activate buttons and links</v-list-item-title>
          </v-list-item>
        </v-list>

        <v-divider class="my-4"></v-divider>

        <!-- Navigation Tips -->
        <h3 class="text-h6 mb-3">Navigation Tips</h3>

        <v-list density="compact" class="mb-4">
          <v-list-item prepend-icon="mdi-menu">
            <v-list-item-title>Use the menu icon to access all tools</v-list-item-title>
          </v-list-item>

          <v-list-item prepend-icon="mdi-white-balance-sunny">
            <v-list-item-title>Toggle between light, dark, and Slurm themes</v-list-item-title>
          </v-list-item>

          <v-list-item prepend-icon="mdi-download">
            <v-list-item-title>Install as app: use browser's "Add to Home Screen"</v-list-item-title>
          </v-list-item>
        </v-list>

        <v-divider class="my-4"></v-divider>

        <!-- Privacy Info -->
        <h3 class="text-h6 mb-3">Privacy & Security</h3>

        <v-alert type="success" variant="tonal" density="compact" class="mb-3">
          <template v-slot:prepend>
            <v-icon icon="mdi-shield-check"></v-icon>
          </template>
          All processing happens locally in your browser. No data is ever sent to any server.
        </v-alert>

        <v-list density="compact">
          <v-list-item prepend-icon="mdi-wifi-off">
            <v-list-item-title>Works completely offline after first visit</v-list-item-title>
          </v-list-item>

          <v-list-item prepend-icon="mdi-eye-off">
            <v-list-item-title>No tracking, no analytics, no cookies</v-list-item-title>
          </v-list-item>

          <v-list-item prepend-icon="mdi-lock">
            <v-list-item-title>Passwords are never stored (unless session memory enabled)</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="elevated"
          @click="dialog = false"
        >
          Got it
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const dialog = ref(false);

// Detect if Mac for keyboard shortcut display
const isMac = computed(() => {
  return typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
});

const ctrlKey = computed(() => isMac.value ? '⌘' : 'Ctrl');

// Global keyboard listener for '?' key
const handleKeydown = (event) => {
  // Don't trigger if typing in an input/textarea
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    return;
  }

  // '?' key (shift + /)
  if (event.key === '?' || (event.shiftKey && event.key === '/')) {
    event.preventDefault();
    dialog.value = true;
  }

  // Escape to close
  if (event.key === 'Escape' && dialog.value) {
    dialog.value = false;
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

// Expose method to open dialog programmatically
defineExpose({
  open: () => { dialog.value = true; }
});
</script>

<style scoped>
.kbd-key {
  display: inline-block;
  padding: 2px 6px;
  font-family: monospace;
  font-size: 0.85em;
  color: rgb(var(--v-theme-on-surface));
  background-color: rgb(var(--v-theme-surface-variant));
  border: 1px solid rgba(var(--v-border-color), 0.3);
  border-radius: 4px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  min-width: 24px;
  text-align: center;
}
</style>
