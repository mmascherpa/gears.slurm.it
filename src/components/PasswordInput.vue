<template>
  <v-row>
    <v-col cols="12" :sm="requireConfirmation ? 6 : 12">
      <v-text-field
        :model-value="password"
        :label="passwordLabel"
        :type="showPassword ? 'text' : 'password'"
        variant="outlined"
        density="comfortable"
        :autocomplete="autocomplete"
        maxlength="1024"
        :placeholder="passwordPlaceholder"
        :prepend-inner-icon="passwordIcon"
        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
        hide-details
        @update:model-value="handlePasswordInput"
        @click:append-inner="showPassword = !showPassword"
      ></v-text-field>
      <div v-if="showStrength" tabindex="-1">
        <PasswordStrengthIndicator
          :password="password"
          :show-requirements="showRequirements"
          :show-feedback="showFeedback"
        />
      </div>
    </v-col>
    <v-col v-if="requireConfirmation" cols="12" sm="6">
      <v-text-field
        :model-value="passwordConfirm"
        label="Confirm Password"
        :type="showPasswordConfirm ? 'text' : 'password'"
        variant="outlined"
        density="comfortable"
        :autocomplete="autocomplete"
        maxlength="1024"
        placeholder="Confirm encryption password"
        prepend-inner-icon="mdi-lock-check"
        :append-inner-icon="showPasswordConfirm ? 'mdi-eye-off' : 'mdi-eye'"
        :error="showConfirmError"
        :success="isPasswordConfirmed"
        hide-details
        @update:model-value="handlePasswordConfirmInput"
        @click:append-inner="showPasswordConfirm = !showPasswordConfirm"
      ></v-text-field>
    </v-col>
  </v-row>
</template>

<script>
import { computed, ref } from 'vue';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator.vue';

export default {
  name: 'PasswordInput',
  components: {
    PasswordStrengthIndicator
  },
  props: {
    /**
     * Password value (v-model:password)
     */
    password: {
      type: String,
      required: true,
      default: ''
    },
    /**
     * Password confirmation value (v-model:password-confirm)
     */
    passwordConfirm: {
      type: String,
      default: ''
    },
    /**
     * Whether to show confirmation field (for encryption)
     */
    requireConfirmation: {
      type: Boolean,
      default: false
    },
    /**
     * Whether to show password strength indicator
     */
    showStrength: {
      type: Boolean,
      default: true
    },
    /**
     * Whether to show password requirements checklist
     */
    showRequirements: {
      type: Boolean,
      default: true
    },
    /**
     * Whether to show password strength feedback
     */
    showFeedback: {
      type: Boolean,
      default: false
    },
    /**
     * Autocomplete attribute value
     * 'new-password' for encryption, 'current-password' for decryption
     */
    autocomplete: {
      type: String,
      default: 'new-password',
      validator: (value) => ['new-password', 'current-password'].includes(value)
    },
    /**
     * Custom password field label
     */
    passwordLabel: {
      type: String,
      default: 'Password'
    },
    /**
     * Custom password field placeholder
     */
    passwordPlaceholder: {
      type: String,
      default: 'Enter encryption password'
    },
    /**
     * Custom password field icon
     */
    passwordIcon: {
      type: String,
      default: 'mdi-lock'
    }
  },
  emits: ['update:password', 'update:password-confirm', 'is-valid'],
  setup(props, { emit }) {
    // Reactive State
    const showPassword = ref(false);
    const showPasswordConfirm = ref(false);

    // Computed Properties

    /**
     * Checks if password and confirmation match
     */
    const isPasswordConfirmed = computed(() => {
      if (!props.requireConfirmation) return true;
      return props.password.trim() !== '' && props.password === props.passwordConfirm;
    });

    /**
     * Shows confirmation field error state
     */
    const showConfirmError = computed(() => {
      if (!props.requireConfirmation) return false;
      return props.password !== '' && props.passwordConfirm !== '' && props.password !== props.passwordConfirm;
    });

    // Functions

    /**
     * Handles password input changes
     */
    const handlePasswordInput = (value) => {
      emit('update:password', value);
      emitValidationState(value, props.passwordConfirm);
    };

    /**
     * Handles password confirmation input changes
     */
    const handlePasswordConfirmInput = (value) => {
      emit('update:password-confirm', value);
      emitValidationState(props.password, value);
    };

    /**
     * Emits validation state to parent
     */
    const emitValidationState = (password, passwordConfirm) => {
      if (!props.requireConfirmation) {
        emit('is-valid', password.trim() !== '');
      } else {
        const isValid = password.trim() !== '' && password === passwordConfirm;
        emit('is-valid', isValid);
      }
    };

    return {
      // State
      showPassword,
      showPasswordConfirm,

      // Computed
      isPasswordConfirmed,
      showConfirmError,

      // Methods
      handlePasswordInput,
      handlePasswordConfirmInput
    };
  }
};
</script>
