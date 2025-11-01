<template>
  <div>
    <ToolPageHeader
      title="Password Generator"
      description="Generate strong random passwords with customizable options"
      icon="mdi-form-textbox-password"
      avatar-color="primary" />

    <v-card class="mb-4" elevation="2">
      <v-card-title class="bg-surface-variant">
        <v-icon icon="mdi-cog" class="mr-2"></v-icon>
        Password Options
      </v-card-title>
      <v-card-text class="pa-3">
        <v-row dense>
          <v-col cols="12" md="6">
            <div class="mb-3">
              <div class="d-flex justify-space-between align-center mb-1">
                <label class="text-body-2 font-weight-medium">Password Length</label>
                <v-chip color="primary" size="x-small">{{ length }} chars</v-chip>
              </div>
              <v-slider
                v-model="length"
                :min="8"
                :max="64"
                :step="1"
                color="primary"
                track-color="grey-lighten-2"
                thumb-label
                hide-details></v-slider>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <label class="text-body-2 font-weight-medium d-block mb-1">Character Types</label>
            <v-row dense>
              <v-col cols="6">
                <v-checkbox
                  v-model="includeUppercase"
                  label="Uppercase (A-Z)"
                  color="primary"
                  hide-details
                  density="compact"></v-checkbox>
              </v-col>
              <v-col cols="6">
                <v-checkbox
                  v-model="includeLowercase"
                  label="Lowercase (a-z)"
                  color="primary"
                  hide-details
                  density="compact"></v-checkbox>
              </v-col>
              <v-col cols="6">
                <v-checkbox
                  v-model="includeNumbers"
                  label="Numbers (0-9)"
                  color="primary"
                  hide-details
                  density="compact"></v-checkbox>
              </v-col>
              <v-col cols="6">
                <v-checkbox
                  v-model="includeSpecial"
                  label="Special (!@#$%)"
                  color="primary"
                  hide-details
                  density="compact"></v-checkbox>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <v-alert
          v-if="!hasCharacterTypeSelected"
          type="warning"
          variant="tonal"
          density="compact"
          class="mt-3">
          Please select at least one character type
        </v-alert>
      </v-card-text>
    </v-card>

    <v-card class="mb-4" elevation="2">
      <v-card-title class="bg-surface-variant">
        <v-icon icon="mdi-form-textbox-password" class="mr-2"></v-icon>
        Generated Password
      </v-card-title>
      <v-card-text class="pa-4">
        <v-row no-gutters>
          <v-col cols="auto" class="mr-2">
            <v-tooltip text="Regenerate password" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  flat
                  icon
                  @click="generateNewPassword"
                  v-show="!!generatedPassword">
                  <v-icon icon="mdi-refresh"></v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </v-col>
          <v-col class="flex-grow-1">
            <v-text-field
              v-model="generatedPassword"
              label="Password"
              variant="outlined"
              readonly
              placeholder="Password will appear here"
              class="monospace-output"
              hide-details></v-text-field>
          </v-col>
          <v-col class="ml-2" cols="auto">
            <v-tooltip text="Copy to clipboard" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  flat
                  icon
                  @click="handleCopy"
                  v-show="!!generatedPassword">
                  <v-icon icon="mdi-content-copy"></v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card v-if="generatedPassword" elevation="2">
      <v-card-title class="bg-surface-variant">
        <v-icon icon="mdi-shield-check" class="mr-2"></v-icon>
        Password Strength
      </v-card-title>
      <v-card-text class="pa-4">
        <PasswordStrengthIndicator
          :password="generatedPassword"
          :show-requirements="true"
          :show-feedback="false"
          :show-score="true" />
      </v-card-text>
    </v-card>

    <SharedSnackbar
      v-model="snackbar"
      :text="snackbarText"
      :color="snackbarColor" />

  </div>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue';
import { generatePassword } from '@/utils/passwordGenerator';
import { useClipboard } from '@/composables/useClipboard';
import { useSnackbar } from '@/composables/useSnackbar';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator.vue';
import SharedSnackbar from '@/components/SharedSnackbar.vue';
import ToolPageHeader from '@/components/ToolPageHeader.vue';

export default {
  name: 'PasswordGenerator',
  components: {
    PasswordStrengthIndicator,
    SharedSnackbar,
    ToolPageHeader
  },
  setup() {
    // Reactive State
    const generatedPassword = ref('');
    const includeLowercase = ref(true);
    const includeNumbers = ref(true);
    const includeSpecial = ref(true);
    const includeUppercase = ref(true);
    const length = ref(16);

    // Composables
    const { snackbar, snackbarText, snackbarColor, showSnackbar } = useSnackbar();
    const { copyToClipboard } = useClipboard();

    // Computed Properties
    /**
     * Checks if at least one character type is selected
     */
    const hasCharacterTypeSelected = computed(() => {
      return includeUppercase.value ||
             includeLowercase.value ||
             includeNumbers.value ||
             includeSpecial.value;
    });

    // Functions
    /**
     * Generates a new password based on current options
     */
    const generateNewPassword = () => {
      if (!hasCharacterTypeSelected.value) {
        generatedPassword.value = '';
        return;
      }

      try {
        const options = {
          length: length.value,
          includeUppercase: includeUppercase.value,
          includeLowercase: includeLowercase.value,
          includeNumbers: includeNumbers.value,
          includeSpecial: includeSpecial.value
        };

        generatedPassword.value = generatePassword(options);
      } catch (error) {
        const errorMessage = typeof error === 'string' ? error : (error.message || 'Unknown error');
        generatedPassword.value = '';
        console.error('Password generation error:', error);
        showSnackbar(`❌ ${errorMessage}`, 'error');
      }
    };

    /**
     * Handles copying password to clipboard
     */
    const handleCopy = async () => {
      await copyToClipboard(
        generatedPassword.value,
        (message) => showSnackbar(message, 'success'),
        (message) => showSnackbar(message, 'error')
      );
    };

    // Watchers
    watch(includeLowercase, generateNewPassword);
    watch(includeNumbers, generateNewPassword);
    watch(includeSpecial, generateNewPassword);
    watch(includeUppercase, generateNewPassword);
    watch(length, generateNewPassword);

    // Lifecycle Hooks
    onMounted(() => {
      generateNewPassword();
    });

    return {
      // State
      generatedPassword,
      includeLowercase,
      includeNumbers,
      includeSpecial,
      includeUppercase,
      length,

      // Snackbar
      snackbar,
      snackbarColor,
      snackbarText,

      // Computed
      hasCharacterTypeSelected,

      // Methods
      generateNewPassword,
      handleCopy
    };
  }
};
</script>

<style scoped>
.monospace-output :deep(input) {
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 0.5px;
}
</style>
