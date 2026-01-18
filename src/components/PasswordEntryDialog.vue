<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="550"
    persistent
  >
    <v-card>
      <v-card-title class="bg-surface-variant d-flex align-center">
        <v-icon :icon="isEditing ? 'mdi-pencil' : 'mdi-plus'" class="mr-2"></v-icon>
        {{ isEditing ? 'Edit Entry' : 'Add New Entry' }}
      </v-card-title>

      <v-card-text class="pa-4">
        <v-form ref="formRef" @submit.prevent="handleSubmit">
          <!-- Name (required) -->
          <v-text-field
            v-model="form.name"
            label="Name"
            placeholder="e.g., GitHub, Gmail, Netflix"
            :rules="[rules.required]"
            autofocus
            class="mb-2"
          ></v-text-field>

          <!-- Username -->
          <v-text-field
            v-model="form.username"
            label="Username"
            placeholder="Your login username"
            class="mb-2"
          ></v-text-field>

          <!-- Email -->
          <v-text-field
            v-model="form.email"
            label="Email"
            type="email"
            placeholder="your@email.com"
            :rules="[rules.email]"
            class="mb-2"
          ></v-text-field>

          <!-- URL -->
          <v-text-field
            v-model="form.url"
            label="Website URL"
            placeholder="https://example.com"
            class="mb-2"
          ></v-text-field>

          <!-- Password -->
          <div class="d-flex align-start gap-2 mb-2">
            <v-text-field
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              label="Password"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              class="flex-grow-1 password-field"
            ></v-text-field>

            <v-tooltip text="Generate password" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  variant="tonal"
                  color="primary"
                  @click="showGeneratorOptions = !showGeneratorOptions"
                  class="mt-1"
                >
                  <v-icon icon="mdi-refresh"></v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </div>

          <!-- Password Generator Options -->
          <v-expand-transition>
            <v-card v-if="showGeneratorOptions" variant="outlined" class="mb-3">
              <v-card-text class="pa-3">
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="text-body-2">Length: {{ generatorLength }}</span>
                  <v-slider
                    v-model="generatorLength"
                    :min="8"
                    :max="64"
                    :step="1"
                    color="primary"
                    hide-details
                    style="max-width: 200px"
                  ></v-slider>
                </div>

                <div class="d-flex flex-wrap gap-2 mb-3">
                  <v-chip
                    :color="generatorOptions.uppercase ? 'primary' : 'default'"
                    :variant="generatorOptions.uppercase ? 'flat' : 'outlined'"
                    size="small"
                    @click="generatorOptions.uppercase = !generatorOptions.uppercase"
                  >
                    A-Z
                  </v-chip>
                  <v-chip
                    :color="generatorOptions.lowercase ? 'primary' : 'default'"
                    :variant="generatorOptions.lowercase ? 'flat' : 'outlined'"
                    size="small"
                    @click="generatorOptions.lowercase = !generatorOptions.lowercase"
                  >
                    a-z
                  </v-chip>
                  <v-chip
                    :color="generatorOptions.numbers ? 'primary' : 'default'"
                    :variant="generatorOptions.numbers ? 'flat' : 'outlined'"
                    size="small"
                    @click="generatorOptions.numbers = !generatorOptions.numbers"
                  >
                    0-9
                  </v-chip>
                  <v-chip
                    :color="generatorOptions.special ? 'primary' : 'default'"
                    :variant="generatorOptions.special ? 'flat' : 'outlined'"
                    size="small"
                    @click="generatorOptions.special = !generatorOptions.special"
                  >
                    !@#$
                  </v-chip>
                </div>

                <v-btn
                  block
                  color="primary"
                  size="small"
                  @click="generatePassword"
                  :disabled="!hasGeneratorOption"
                >
                  <v-icon icon="mdi-refresh" class="mr-2"></v-icon>
                  Generate Password
                </v-btn>
              </v-card-text>
            </v-card>
          </v-expand-transition>

          <!-- Password Strength -->
          <PasswordStrengthIndicator
            v-if="form.password"
            :password="form.password"
            :show-requirements="false"
            :show-feedback="true"
            class="mb-3"
          />

          <!-- TOTP Secret -->
          <v-text-field
            v-model="form.totp"
            label="TOTP Secret (optional)"
            placeholder="2FA secret key"
            hint="Stored for reference only - no code generation"
            persistent-hint
            class="mb-2"
          ></v-text-field>

          <!-- Notes -->
          <v-textarea
            v-model="form.note"
            label="Notes (optional)"
            placeholder="Additional information..."
            rows="3"
            auto-grow
          ></v-textarea>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>

        <v-btn
          variant="text"
          @click="handleCancel"
          :disabled="isLoading"
        >
          Cancel
        </v-btn>

        <v-btn
          color="primary"
          :loading="isLoading"
          :disabled="!isFormValid"
          @click="handleSubmit"
        >
          {{ isEditing ? 'Save Changes' : 'Add Entry' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, reactive, onMounted, onBeforeUnmount } from 'vue';
import { generatePassword as generateSecurePassword } from '@/utils/passwordGenerator';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  entry: {
    type: Object,
    default: null
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'submit']);

/**
 * Handle ESC key to close dialog
 */
function handleKeydown(event) {
  if (event.key === 'Escape' && props.modelValue && !props.isLoading) {
    handleCancel();
  }
}

// Add/remove keyboard listener based on dialog state
onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
});

// Form state
const formRef = ref(null);
const showPassword = ref(false);
const showGeneratorOptions = ref(false);

const form = reactive({
  name: '',
  username: '',
  email: '',
  url: '',
  password: '',
  totp: '',
  note: ''
});

// Password generator options
const generatorLength = ref(20);
const generatorOptions = reactive({
  uppercase: true,
  lowercase: true,
  numbers: true,
  special: true
});

// Validation rules
const rules = {
  required: (v) => !!v || 'This field is required',
  email: (v) => !v || /.+@.+\..+/.test(v) || 'Invalid email format'
};

// Computed
const isEditing = computed(() => !!props.entry);

const isFormValid = computed(() => {
  return form.name.trim().length > 0;
});

const hasGeneratorOption = computed(() => {
  return generatorOptions.uppercase ||
    generatorOptions.lowercase ||
    generatorOptions.numbers ||
    generatorOptions.special;
});

// Reset form when dialog opens/entry changes
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    if (props.entry) {
      // Edit mode - populate form
      form.name = props.entry.name || '';
      form.username = props.entry.username || '';
      form.email = props.entry.email || '';
      form.url = props.entry.url || '';
      form.password = props.entry.password || '';
      form.totp = props.entry.totp || '';
      form.note = props.entry.note || '';
    } else {
      // Add mode - reset form and generate password
      resetForm();
      generatePassword();
    }
    showPassword.value = false;
    showGeneratorOptions.value = false;
  }
});

/**
 * Reset form to defaults
 */
function resetForm() {
  form.name = '';
  form.username = '';
  form.email = '';
  form.url = '';
  form.password = '';
  form.totp = '';
  form.note = '';
}

/**
 * Generate a secure password
 */
function generatePassword() {
  if (!hasGeneratorOption.value) return;

  form.password = generateSecurePassword({
    length: generatorLength.value,
    includeUppercase: generatorOptions.uppercase,
    includeLowercase: generatorOptions.lowercase,
    includeNumbers: generatorOptions.numbers,
    includeSpecial: generatorOptions.special
  });

  showPassword.value = true;
}

/**
 * Handle form submission
 */
function handleSubmit() {
  if (!isFormValid.value) return;

  emit('submit', {
    name: form.name.trim(),
    username: form.username.trim(),
    email: form.email.trim(),
    url: form.url.trim(),
    password: form.password,
    totp: form.totp.trim(),
    note: form.note.trim()
  });
}

/**
 * Handle cancel
 */
function handleCancel() {
  emit('update:modelValue', false);
}
</script>

<style scoped>
.password-field :deep(input) {
  font-family: 'Courier New', Courier, monospace;
}

.gap-2 {
  gap: 8px;
}
</style>
