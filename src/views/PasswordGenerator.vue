<template>
  <div>
    <ToolPageHeader
      title="Password Generator"
      description="Generate strong random passwords with customizable options"
      icon="mdi-form-textbox-password"
      avatar-color="primary" />

    <!-- Tier 1: Educational Panel -->
    <LearnMorePanel
      title="Password Security Best Practices"
      storage-key="slurm-help-password-generator"
    >
      <p class="mb-2">
        <strong>Strong passwords</strong> are your first line of defense against unauthorized access.
        The strength of a password determines how long it would take an attacker to guess it through brute-force.
      </p>
      <ul class="ml-4 mb-2">
        <li><strong>Length matters most</strong> - A 16-character password is exponentially stronger than an 8-character one</li>
        <li><strong>Mix character types</strong> - Combine uppercase, lowercase, numbers, and symbols</li>
        <li><strong>Avoid patterns</strong> - Don't use dictionary words, names, or predictable sequences</li>
        <li><strong>Unique per account</strong> - Never reuse passwords across different services</li>
      </ul>
      <EducationalAlert title="Time to Crack" type="info" spacing="mt-3">
        An 8-character password with mixed types: ~8 hours to crack.
        A 16-character password with mixed types: billions of years to crack.
      </EducationalAlert>
      <p class="mt-3 mb-2">
        <strong>Best practice:</strong> Use a password manager to generate and store unique passwords
        for each account. This tool generates cryptographically random passwords using your browser's secure random number generator.
      </p>

      <!-- Reference Links -->
      <div class="text-caption text-medium-emphasis mt-3">
        <strong>Learn more:</strong>
        <a href="https://en.wikipedia.org/wiki/Password_strength" target="_blank" rel="noopener noreferrer" class="text-info">
          Wikipedia: Password Strength
        </a>
        •
        <a href="https://pages.nist.gov/800-63-3/sp800-63b.html" target="_blank" rel="noopener noreferrer" class="text-info">
          NIST: Password Guidelines
        </a>
      </div>

      <!-- Technical Details -->
      <div class="text-caption text-medium-emphasis mt-2">
        <strong>Technical:</strong> Uses
        <a href="https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues" target="_blank" rel="noopener noreferrer" class="text-info">Web Crypto API's crypto.getRandomValues()</a>
        for cryptographically secure random generation.
      </div>
    </LearnMorePanel>

    <v-card class="mb-4">
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
                <v-chip color="primary" size="x-small">{{ preferences.length }} chars</v-chip>
              </div>
              <v-slider
                v-model="preferences.length"
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
              <v-col cols="12" sm="6">
                <v-checkbox
                  v-model="preferences.includeUppercase"
                  label="Uppercase (A-Z)"
                  color="primary"
                  hide-details></v-checkbox>
              </v-col>
              <v-col cols="12" sm="6">
                <v-checkbox
                  v-model="preferences.includeLowercase"
                  label="Lowercase (a-z)"
                  color="primary"
                  hide-details></v-checkbox>
              </v-col>
              <v-col cols="12" sm="6">
                <v-checkbox
                  v-model="preferences.includeNumbers"
                  label="Numbers (0-9)"
                  color="primary"
                  hide-details></v-checkbox>
              </v-col>
              <v-col cols="12" sm="6">
                <v-checkbox
                  v-model="preferences.includeSpecial"
                  label="Special (!@#$%)"
                  color="primary"
                  hide-details></v-checkbox>
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

    <v-card class="mb-4">
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

    <v-card v-if="generatedPassword">
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
import { usePreferences } from '@/composables/usePreferences';
import { useSnackbar } from '@/composables/useSnackbar';
import EducationalAlert from '@/components/EducationalAlert.vue';
import LearnMorePanel from '@/components/LearnMorePanel.vue';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator.vue';
import SharedSnackbar from '@/components/SharedSnackbar.vue';
import ToolPageHeader from '@/components/ToolPageHeader.vue';

export default {
  name: 'PasswordGenerator',
  components: {
    EducationalAlert,
    LearnMorePanel,
    PasswordStrengthIndicator,
    SharedSnackbar,
    ToolPageHeader
  },
  setup() {
    // Reactive State
    const generatedPassword = ref('');

    // Composables
    const { snackbar, snackbarText, snackbarColor, showSnackbar } = useSnackbar();
    const { copyToClipboard } = useClipboard();
    const { preferences } = usePreferences('password-generator', {
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSpecial: true
    });

    // Computed Properties
    /**
     * Checks if at least one character type is selected
     */
    const hasCharacterTypeSelected = computed(() => {
      return preferences.includeUppercase ||
             preferences.includeLowercase ||
             preferences.includeNumbers ||
             preferences.includeSpecial;
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
          length: preferences.length,
          includeUppercase: preferences.includeUppercase,
          includeLowercase: preferences.includeLowercase,
          includeNumbers: preferences.includeNumbers,
          includeSpecial: preferences.includeSpecial
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
    watch(
      () => [
        preferences.length,
        preferences.includeUppercase,
        preferences.includeLowercase,
        preferences.includeNumbers,
        preferences.includeSpecial
      ],
      generateNewPassword
    );

    // Lifecycle Hooks
    onMounted(() => {
      generateNewPassword();
    });

    return {
      // State
      generatedPassword,

      // Preferences (persistent)
      preferences,

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
