<template>
    <div v-if="password" class="password-strength-indicator" data-testid="strength-indicator" tabindex="-1">
        <!-- Strength Bar -->
        <v-progress-linear
            :model-value="strength.percentage"
            :color="strength.color"
            height="8"
            rounded
            class="mb-2"
            tabindex="-1">
        </v-progress-linear>

        <!-- Strength Label and Entropy -->
        <div class="d-flex align-center justify-space-between mb-2" tabindex="-1">
            <div class="d-flex align-center flex-wrap">
                <v-chip
                    :color="strength.color"
                    size="small"
                    variant="flat"
                    class="mr-2"
                    tabindex="-1">
                    {{ strength.label }}
                </v-chip>
                <!-- Always show entropy (unified metric for both modes) -->
                <span class="text-caption text-medium-emphasis">
                    <v-icon icon="mdi-shield-lock" size="x-small" class="mr-1"></v-icon>
                    ~{{ displayEntropy }}
                    <a href="https://en.wikipedia.org/wiki/Password_strength#Entropy_as_a_measure_of_password_strength"
                       target="_blank"
                       rel="noopener noreferrer"
                       class="text-info"
                       title="Learn about password entropy">bits of entropy</a>
                </span>
            </div>
        </div>

        <!-- Requirements Checklist (for random passwords) -->
        <v-expand-transition>
            <div v-if="showRequirements && strength.level !== 'empty'" class="mt-2" data-testid="requirements" tabindex="-1">
                <div class="text-caption text-medium-emphasis mb-1 font-weight-medium">
                    Password Requirements:
                </div>
                <div class="requirements-list">
                    <div
                        v-for="(req, index) in passwordRequirements"
                        :key="index"
                        class="requirement-item"
                        :class="req.met ? 'requirement-met' : 'requirement-unmet'">
                        <v-icon
                            :icon="req.met ? 'mdi-check-circle' : 'mdi-close'"
                            :color="req.met ? 'success' : 'error'"
                            size="small"
                            class="requirement-icon">
                        </v-icon>
                        <span class="requirement-text">{{ req.text }}</span>
                    </div>
                </div>
            </div>
        </v-expand-transition>

        <!-- Suggestions/Feedback Messages -->
        <v-expand-transition>
            <div v-if="displayFeedback.length > 0 && showFeedback" class="mt-2" tabindex="-1">
                <v-alert
                    :color="strength.color"
                    variant="tonal"
                    density="compact"
                    class="text-caption pa-2"
                    tabindex="-1">
                    <div class="text-caption font-weight-medium mb-1">Suggestions:</div>
                    <ul class="mb-0 pl-4">
                        <li v-for="(msg, index) in displayFeedback" :key="index">
                            {{ msg }}
                        </li>
                    </ul>
                </v-alert>
            </div>
        </v-expand-transition>
    </div>
</template>

<script>
import { calculatePasswordStrength, calculateEntropyStrength } from '@/utils/passwordStrength';

export default {
    name: 'PasswordStrengthIndicator',
    props: {
        /**
         * The password to evaluate
         */
        password: {
            type: String,
            required: true,
            default: ''
        },
        /**
         * Whether to show the requirements checklist (for random passwords)
         */
        showRequirements: {
            type: Boolean,
            default: true
        },
        /**
         * Whether to show feedback/suggestion messages
         */
        showFeedback: {
            type: Boolean,
            default: true
        },
        /**
         * Pre-calculated entropy bits (for passphrases)
         * When provided, uses entropy-based strength calculation
         */
        entropyBits: {
            type: Number,
            default: null
        },
        /**
         * Suggestions for improving passphrase strength
         * Only used when entropyBits is provided
         */
        suggestions: {
            type: Array,
            default: () => []
        }
    },
    computed: {
        /**
         * Calculate password strength using the utility function
         * Uses entropy-based calculation when entropyBits is provided
         * @returns {Object} Strength object with level, score, color, label, etc.
         */
        strength() {
            // If entropy is provided, use entropy-based calculation (for passphrases)
            if (this.entropyBits !== null) {
                return calculateEntropyStrength(this.entropyBits, this.suggestions);
            }
            // Otherwise use password-based calculation (for random passwords)
            return calculatePasswordStrength(this.password);
        },
        /**
         * Get the entropy value to display
         */
        displayEntropy() {
            if (this.entropyBits !== null) {
                return Math.round(this.entropyBits);
            }
            return this.strength.entropy || 0;
        },
        /**
         * Get the feedback/suggestions to display
         */
        displayFeedback() {
            return this.strength.feedback || [];
        },
        /**
         * Builds password requirements list with check/cross indicators
         * @returns {Array} Array of requirement objects with met status and text
         */
        passwordRequirements() {
            const pwd = this.password;
            return [
                {
                    met: pwd.length >= 12,
                    text: 'At least 12 characters'
                },
                {
                    met: /[a-z]/.test(pwd) && /[A-Z]/.test(pwd),
                    text: 'Uppercase and lowercase letters'
                },
                {
                    met: /\d/.test(pwd),
                    text: 'At least one number'
                },
                {
                    met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
                    text: 'At least one special character'
                }
            ];
        }
    },
    watch: {
        /**
         * Emit strength changes to parent component
         */
        strength: {
            handler(newStrength) {
                this.$emit('strength-changed', newStrength);
            },
            deep: true,
            immediate: true
        }
    }
};
</script>

<style scoped>
.password-strength-indicator {
    margin-top: 8px;
}

.requirements-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.requirement-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.813rem;
    line-height: 1.4;
}

.requirement-icon {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
}

.requirement-text {
    flex: 1;
}

.requirement-met .requirement-text {
    color: rgb(var(--v-theme-success));
}

.requirement-unmet .requirement-text {
    color: rgb(var(--v-theme-error));
}
</style>
