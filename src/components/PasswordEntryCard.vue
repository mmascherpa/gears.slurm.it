<template>
  <v-card class="password-entry-card" :elevation="isHovered ? 4 : 2">
    <v-card-text class="pa-3">
      <div class="d-flex align-start">
        <!-- Letter avatar (no remote favicon fetch - entry URLs stay private) -->
        <v-avatar
          :color="avatarColor"
          size="40"
          class="mr-3 flex-shrink-0"
        >
          <span class="text-h6 font-weight-bold text-white">
            {{ initial }}
          </span>
        </v-avatar>

        <!-- Entry Details -->
        <div class="flex-grow-1 overflow-hidden">
          <div class="d-flex align-center mb-1">
            <span class="text-subtitle-1 font-weight-medium text-truncate">
              {{ entry.name }}
            </span>
          </div>

          <div class="text-body-2 text-medium-emphasis text-truncate mb-1">
            {{ entry.username || entry.email || 'No username' }}
          </div>

          <!-- Password Field -->
          <div class="d-flex align-center">
            <span class="password-display text-body-2 font-weight-medium mr-2">
              {{ showPassword ? entry.password : maskedPassword }}
            </span>
          </div>

          <!-- URL (if present) -->
          <div v-if="entry.url" class="text-caption text-medium-emphasis text-truncate mt-1">
            {{ displayUrl }}
          </div>

          <!-- TOTP Display (if present) -->
          <div v-if="entry.totp" class="mt-2">
            <div class="d-flex align-center mb-1">
              <v-icon icon="mdi-two-factor-authentication" size="14" class="mr-1 text-medium-emphasis"></v-icon>
              <span class="text-caption text-medium-emphasis">2FA Code</span>
            </div>
            <TotpDisplay
              :secret="entry.totp"
              @copy-success="(msg) => $emit('copy-success', msg)"
              @copy-error="(msg) => $emit('copy-error', msg)"
            />
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="d-flex justify-end mt-2 action-buttons">
        <v-tooltip text="Show/hide password" location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              size="small"
              variant="text"
              @click="togglePassword"
            >
              <v-icon :icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'" size="18"></v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <v-tooltip text="Copy password" location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              size="small"
              variant="text"
              @click="copyPassword"
            >
              <v-icon icon="mdi-content-copy" size="18"></v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <v-tooltip v-if="entry.username" text="Copy username" location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              size="small"
              variant="text"
              @click="copyUsername"
            >
              <v-icon icon="mdi-account" size="18"></v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <v-tooltip v-if="entry.url" text="Open URL" location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              size="small"
              variant="text"
              :href="normalizedUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              <v-icon icon="mdi-arrow-right-circle" size="18"></v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <v-divider vertical class="mx-1"></v-divider>

        <v-tooltip text="Edit entry" location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              size="small"
              variant="text"
              @click="$emit('edit', entry)"
            >
              <v-icon icon="mdi-pencil" size="18"></v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <v-tooltip text="Delete entry" location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              size="small"
              variant="text"
              color="error"
              @click="confirmDelete"
            >
              <v-icon icon="mdi-delete" size="18"></v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </div>
    </v-card-text>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="bg-surface-variant">
          <v-icon icon="mdi-alert" color="warning" class="mr-2"></v-icon>
          Delete Entry
        </v-card-title>
        <v-card-text class="pa-4">
          Are you sure you want to delete <strong>{{ entry.name }}</strong>?
          This action cannot be undone.
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="handleDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue';
import { useClipboard } from '@/composables/useClipboard';
import TotpDisplay from '@/components/TotpDisplay.vue';

const props = defineProps({
  entry: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['edit', 'delete', 'copy-success', 'copy-error']);

const { copyToClipboard } = useClipboard();

// Local state
const showPassword = ref(false);
const showDeleteDialog = ref(false);
const isHovered = ref(false);
let visibilityTimeout = null;

// Cleanup timeout on unmount
onBeforeUnmount(() => {
  if (visibilityTimeout) {
    clearTimeout(visibilityTimeout);
    visibilityTimeout = null;
  }
});

// Computed properties
const initial = computed(() => {
  return (props.entry.name || '?').charAt(0).toUpperCase();
});

const avatarColor = computed(() => {
  // Generate consistent color based on entry name
  const colors = ['primary', 'secondary', 'success', 'info', 'warning'];
  const hash = props.entry.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
});

const maskedPassword = computed(() => {
  return '•'.repeat(Math.min(props.entry.password?.length || 8, 16));
});

const displayUrl = computed(() => {
  if (!props.entry.url) return '';
  try {
    const url = new URL(normalizedUrl.value);
    return url.hostname;
  } catch {
    return props.entry.url;
  }
});

const normalizedUrl = computed(() => {
  if (!props.entry.url) return '';
  const url = props.entry.url.trim();
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
});

// Methods
function togglePassword() {
  showPassword.value = !showPassword.value;

  // Clear any existing timeout
  if (visibilityTimeout) {
    clearTimeout(visibilityTimeout);
    visibilityTimeout = null;
  }

  // Auto-hide after 10 seconds
  if (showPassword.value) {
    visibilityTimeout = setTimeout(() => {
      showPassword.value = false;
      visibilityTimeout = null;
    }, 10000);
  }
}

async function copyPassword() {
  await copyToClipboard(
    props.entry.password,
    () => emit('copy-success', 'Password copied'),
    (msg) => emit('copy-error', msg)
  );
}

async function copyUsername() {
  await copyToClipboard(
    props.entry.username,
    () => emit('copy-success', 'Username copied'),
    (msg) => emit('copy-error', msg)
  );
}

function confirmDelete() {
  showDeleteDialog.value = true;
}

function handleDelete() {
  showDeleteDialog.value = false;
  emit('delete', props.entry);
}
</script>

<style scoped>
.password-entry-card {
  transition: all 0.2s ease;
}

.password-entry-card:hover {
  transform: translateY(-2px);
}

.password-display {
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 1px;
}

.action-buttons {
  margin-top: 8px;
  gap: 2px;
}

.overflow-hidden {
  overflow: hidden;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
