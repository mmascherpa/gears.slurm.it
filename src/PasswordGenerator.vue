<template>
  <div>
    <!-- Header with Icon and Title -->
    <div class="d-flex align-center mb-6">
      <v-avatar color="primary" size="48" class="mr-4">
        <v-icon icon="mdi-form-textbox-password" size="28" color="white"></v-icon>
      </v-avatar>
      <div>
        <h1 class="text-h4 font-weight-bold">Password Generator</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">Generate strong random passwords with customizable options</p>
      </div>
    </div>

    <!-- Password Options Card -->
    <v-card class="mb-4" elevation="2">
      <v-card-title class="bg-surface-variant">
        <v-icon icon="mdi-cog" class="mr-2"></v-icon>
        Password Options
      </v-card-title>
      <v-card-text class="pa-4">
        <!-- Length Slider -->
        <div class="mb-6">
          <div class="d-flex justify-space-between align-center mb-2">
            <label class="text-subtitle-1 font-weight-medium">Password Length</label>
            <v-chip color="primary" size="small">{{ length }} characters</v-chip>
          </div>
          <v-slider
            v-model="length"
            :min="8"
            :max="64"
            :step="1"
            color="primary"
            track-color="grey-lighten-2"
            thumb-label
          ></v-slider>
        </div>

        <!-- Character Type Checkboxes -->
        <div>
          <label class="text-subtitle-1 font-weight-medium d-block mb-3">Character Types</label>
          <v-row>
            <v-col cols="12" sm="6">
              <v-checkbox
                v-model="includeUppercase"
                label="Uppercase Letters (A-Z)"
                color="primary"
                hide-details
                density="comfortable"
              ></v-checkbox>
            </v-col>
            <v-col cols="12" sm="6">
              <v-checkbox
                v-model="includeLowercase"
                label="Lowercase Letters (a-z)"
                color="primary"
                hide-details
                density="comfortable"
              ></v-checkbox>
            </v-col>
            <v-col cols="12" sm="6">
              <v-checkbox
                v-model="includeNumbers"
                label="Numbers (0-9)"
                color="primary"
                hide-details
                density="comfortable"
              ></v-checkbox>
            </v-col>
            <v-col cols="12" sm="6">
              <v-checkbox
                v-model="includeSpecial"
                label="Special Characters (!@#$%...)"
                color="primary"
                hide-details
                density="comfortable"
              ></v-checkbox>
            </v-col>
          </v-row>

          <!-- Warning if no character types selected -->
          <v-alert
            v-if="!hasCharacterTypeSelected"
            type="warning"
            variant="tonal"
            density="compact"
            class="mt-4"
          >
            Please select at least one character type
          </v-alert>
        </div>
      </v-card-text>
    </v-card>

    <!-- Generated Password Card -->
    <v-card class="mb-4" elevation="2">
      <v-card-title class="bg-surface-variant">
        <v-icon icon="mdi-form-textbox-password" class="mr-2"></v-icon>
        Generated Password
      </v-card-title>
      <v-card-text class="pa-4">
        <!-- Password Display -->
        <v-row no-gutters>
          <v-col class="flex-grow-1">
            <v-text-field
              v-model="generatedPassword"
              label="Password"
              variant="outlined"
              readonly
              placeholder="Password will appear here"
              class="monospace-output"
              hide-details>
            </v-text-field>
          </v-col>
          <v-col class="ml-2" cols="auto">
            <v-tooltip text="Copy to clipboard" location="top">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" flat icon @click="copyToClipboard" v-show="!!generatedPassword">
                  <v-icon icon='mdi-content-copy' />
                </v-btn>
              </template>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Password Strength Indicator Card -->
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
          :show-score="true"
        />
      </v-card-text>
    </v-card>

    <!-- Snackbar for Feedback -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="3000"
      location="top"
    >
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script>
import { generatePassword } from '@/utils/passwordGenerator';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator.vue';

export default {
  name: 'PasswordGenerator',
  components: {
    PasswordStrengthIndicator
  },
  data() {
    return {
      // Password options
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSpecial: true,

      // Generated password
      generatedPassword: '',

      // Snackbar
      snackbar: false,
      snackbarText: '',
      snackbarColor: 'success'
    };
  },
  computed: {
    /**
     * Check if at least one character type is selected
     */
    hasCharacterTypeSelected() {
      return this.includeUppercase ||
             this.includeLowercase ||
             this.includeNumbers ||
             this.includeSpecial;
    }
  },
  watch: {
    /**
     * Watch for changes in password options and regenerate
     */
    length() {
      this.generateNewPassword();
    },
    includeUppercase() {
      this.generateNewPassword();
    },
    includeLowercase() {
      this.generateNewPassword();
    },
    includeNumbers() {
      this.generateNewPassword();
    },
    includeSpecial() {
      this.generateNewPassword();
    }
  },
  methods: {
    /**
     * Generates a new password based on current options
     */
    generateNewPassword() {
      if (!this.hasCharacterTypeSelected) {
        this.generatedPassword = '';
        return;
      }

      try {
        const options = {
          length: this.length,
          includeUppercase: this.includeUppercase,
          includeLowercase: this.includeLowercase,
          includeNumbers: this.includeNumbers,
          includeSpecial: this.includeSpecial
        };

        this.generatedPassword = generatePassword(options);
      } catch (error) {
        const errorMessage = typeof error === 'string' ? error : (error.message || 'Unknown error');
        this.generatedPassword = '';
        console.error('Password generation error:', error);
      }
    },

    /**
     * Copies the generated password to clipboard
     */
    async copyToClipboard() {
      if (!this.generatedPassword) {
        return;
      }

      try {
        await navigator.clipboard.writeText(this.generatedPassword);
        this.showSnackbar('Copied to clipboard', 'success');
      } catch (error) {
        console.error('Failed to copy password:', error);
        this.showSnackbar('Failed to copy to clipboard', 'error');
      }
    },

    /**
     * Shows a snackbar with a message
     * @param {string} message - Message to display
     * @param {string} color - Snackbar color (success, error, warning, info)
     */
    showSnackbar(message, color = 'success') {
      this.snackbarText = message;
      this.snackbarColor = color;
      this.snackbar = true;
    }
  },
  mounted() {
    // Generate a password on initial load
    this.generateNewPassword();
  }
};
</script>

<style scoped>
.monospace-output :deep(input) {
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 0.5px;
}
</style>
