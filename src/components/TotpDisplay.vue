<template>
  <div class="totp-display" v-if="secret">
    <div class="d-flex align-center">
      <!-- TOTP Code Display -->
      <span
        class="totp-code text-h6 font-weight-bold mr-2"
        :class="{ 'text-error': timeRemaining <= 5 }"
      >
        {{ formattedCode }}
      </span>

      <!-- Countdown Progress Circle -->
      <v-progress-circular
        :model-value="(timeRemaining / 30) * 100"
        :size="28"
        :width="3"
        :color="timeRemaining <= 5 ? 'error' : 'primary'"
        class="mr-2"
      >
        <span class="text-caption">{{ timeRemaining }}</span>
      </v-progress-circular>

      <!-- Copy Button -->
      <v-tooltip text="Copy 2FA code" location="top">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            size="small"
            variant="text"
            @click="copyCode"
            :disabled="!isValid || isGenerating"
          >
            <v-icon icon="mdi-content-copy" size="18"></v-icon>
          </v-btn>
        </template>
      </v-tooltip>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="text-caption text-error mt-1">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, toRef } from 'vue';
import { useTotp } from '@/composables/useTotp';
import { useClipboard } from '@/composables/useClipboard';

const props = defineProps({
  secret: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['copy-success', 'copy-error']);

const { copyToClipboard } = useClipboard();

// Create a reactive ref from the prop for useTotp
const secretRef = toRef(props, 'secret');

// Use the TOTP composable
const {
  code,
  timeRemaining,
  isGenerating,
  isValid,
  error,
  start,
  stop
} = useTotp(secretRef);

// Format code with space in middle for readability (123 456)
const formattedCode = computed(() => {
  if (code.value.length === 6) {
    return `${code.value.slice(0, 3)} ${code.value.slice(3)}`;
  }
  return code.value;
});

// Copy TOTP code to clipboard
async function copyCode() {
  if (!isValid.value || code.value === '------') {
    return;
  }

  await copyToClipboard(
    code.value,
    (msg) => emit('copy-success', '2FA code copied'),
    (msg) => emit('copy-error', msg)
  );
}

// Watch for secret changes to start/stop timer
watch(
  () => props.secret,
  (newSecret) => {
    if (newSecret) {
      start();
    } else {
      stop();
    }
  },
  { immediate: false }
);

// Start timer on mount if secret is provided
onMounted(() => {
  if (props.secret) {
    start();
  }
});

// Stop timer on unmount
onBeforeUnmount(() => {
  stop();
});
</script>

<style scoped>
.totp-display {
  min-height: 36px;
}

.totp-code {
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 2px;
  transition: color 0.3s ease;
}
</style>
