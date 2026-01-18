<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="450"
    persistent
    :scrim="true"
  >
    <v-card>
      <v-card-title class="bg-surface-variant d-flex align-center">
        <v-icon :icon="isNewVault ? 'mdi-shield-key' : 'mdi-lock'" class="mr-2"></v-icon>
        {{ isNewVault ? 'Create Password Vault' : 'Unlock Vault' }}
      </v-card-title>

      <v-card-text class="pa-4">
        <!-- New Vault Setup -->
        <template v-if="isNewVault">
          <v-alert type="info" variant="tonal" density="compact" class="mb-4">
            Create a master password to protect your vault. This password will encrypt all your stored passwords.
          </v-alert>

          <v-text-field
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="Master Password"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
            @keyup.enter="confirmPassword && handleSubmit()"
            autocomplete="new-password"
            autofocus
            class="mb-2"
          ></v-text-field>

          <v-text-field
            v-model="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            label="Confirm Password"
            :error-messages="passwordMismatch ? 'Passwords do not match' : ''"
            @keyup.enter="handleSubmit"
            autocomplete="new-password"
            class="mb-2"
          ></v-text-field>

          <PasswordStrengthIndicator
            v-if="password"
            :password="password"
            :show-requirements="true"
            :show-feedback="true"
            class="mb-3"
          />

          <v-alert
            v-if="isWeakPassword && password"
            type="warning"
            variant="tonal"
            density="compact"
            class="mb-3"
          >
            This password is weak. A strong master password is recommended to protect your vault.
          </v-alert>
        </template>

        <!-- Existing Vault Unlock -->
        <template v-else>
          <!-- WebAuthn Button -->
          <v-btn
            v-if="hasWebAuthn && webAuthnSupported"
            block
            color="primary"
            size="large"
            :loading="isWebAuthnLoading"
            @click="handleWebAuthn"
            class="mb-4"
          >
            <v-icon icon="mdi-fingerprint" class="mr-2"></v-icon>
            Unlock with Biometrics
          </v-btn>

          <v-divider v-if="hasWebAuthn && webAuthnSupported" class="mb-4">
            <span class="text-caption text-medium-emphasis px-2">or enter password</span>
          </v-divider>

          <v-text-field
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="Master Password"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
            @keyup.enter="handleSubmit"
            :error-messages="errorMessage"
            autocomplete="current-password"
            autofocus
          ></v-text-field>
        </template>

        <!-- Error Display -->
        <v-alert
          v-if="error && !isNewVault"
          type="error"
          variant="tonal"
          density="compact"
          class="mt-3"
        >
          {{ error }}
        </v-alert>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>

        <v-btn
          v-if="!isNewVault"
          variant="text"
          @click="handleCancel"
          :disabled="isLoading"
        >
          Cancel
        </v-btn>

        <v-btn
          color="primary"
          :loading="isLoading"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          {{ isNewVault ? 'Create Vault' : 'Unlock' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { calculatePasswordStrength } from '@/utils/passwordStrength';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  isNewVault: {
    type: Boolean,
    default: false
  },
  hasWebAuthn: {
    type: Boolean,
    default: false
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'submit', 'webauthn', 'cancel']);

// Local state
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const isWebAuthnLoading = ref(false);
const errorMessage = ref('');

// Check WebAuthn support
const webAuthnSupported = computed(() => {
  return typeof window !== 'undefined' &&
    window.PublicKeyCredential !== undefined;
});

// Password validation
const passwordMismatch = computed(() => {
  return props.isNewVault &&
    confirmPassword.value &&
    password.value !== confirmPassword.value;
});

const isWeakPassword = computed(() => {
  if (!password.value) return false;
  const strength = calculatePasswordStrength(password.value);
  return strength.score < 2; // 0-4 scale, < 2 is weak
});

const canSubmit = computed(() => {
  if (!password.value) return false;

  if (props.isNewVault) {
    if (!confirmPassword.value) return false;
    if (passwordMismatch.value) return false;
  }

  return true;
});

// Reset state when dialog opens
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    password.value = '';
    confirmPassword.value = '';
    showPassword.value = false;
    errorMessage.value = '';
  }
});

// Update error message from prop
watch(() => props.error, (newError) => {
  errorMessage.value = newError;
});

/**
 * Handle form submission
 */
function handleSubmit() {
  if (!canSubmit.value) return;

  errorMessage.value = '';
  emit('submit', password.value);
}

/**
 * Handle WebAuthn authentication
 */
async function handleWebAuthn() {
  isWebAuthnLoading.value = true;
  try {
    emit('webauthn');
  } finally {
    isWebAuthnLoading.value = false;
  }
}

/**
 * Handle cancel
 */
function handleCancel() {
  emit('cancel');
  emit('update:modelValue', false);
}
</script>
