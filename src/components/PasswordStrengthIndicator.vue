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

        <!-- Strength Label and Feedback -->
        <div class="d-flex align-center justify-space-between mb-2" tabindex="-1">
            <div class="d-flex align-center">
                <v-chip
                    :color="strength.color"
                    size="small"
                    variant="flat"
                    class="mr-2"
                    tabindex="-1">
                    {{ strength.label }}
                </v-chip>
                <span v-if="showScore" class="text-caption text-medium-emphasis">
                    Score: {{ strength.score }}/100
                </span>
            </div>
        </div>

        <!-- Requirements Checklist (expanded view) -->
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

        <!-- Feedback Messages -->
        <v-expand-transition>
            <div v-if="strength.feedback.length > 0 && showFeedback" class="mt-2" tabindex="-1">
                <v-alert
                    :color="strength.color"
                    variant="tonal"
                    density="compact"
                    class="text-caption pa-2"
                    tabindex="-1">
                    <ul class="mb-0 pl-4">
                        <li v-for="(msg, index) in strength.feedback" :key="index">
                            {{ msg }}
                        </li>
                    </ul>
                </v-alert>
            </div>
        </v-expand-transition>
    </div>
</template>

<script>
import { calculatePasswordStrength } from '@/utils/passwordStrength';

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
         * Whether to show the requirements checklist
         */
        showRequirements: {
            type: Boolean,
            default: true
        },
        /**
         * Whether to show feedback messages
         */
        showFeedback: {
            type: Boolean,
            default: true
        },
        /**
         * Whether to show the numerical score
         */
        showScore: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        /**
         * Calculate password strength using the utility function
         * @returns {Object} Strength object with level, score, color, label, etc.
         */
        strength() {
            return calculatePasswordStrength(this.password);
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
