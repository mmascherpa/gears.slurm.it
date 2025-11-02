<template>
    <div v-if="password" class="password-strength-indicator">
        <!-- Strength Bar -->
        <v-progress-linear
            :model-value="strength.percentage"
            :color="strength.color"
            height="8"
            rounded
            class="mb-2">
        </v-progress-linear>

        <!-- Strength Label and Feedback -->
        <div class="d-flex align-center justify-space-between mb-2">
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
            <div v-if="showRequirements && strength.level !== 'empty'" class="mt-3">
                <div class="text-caption text-medium-emphasis mb-2 font-weight-medium">
                    Password Requirements:
                </div>
                <v-list density="compact" class="pa-0">
                    <v-list-item
                        v-for="(req, index) in strength.requirements"
                        :key="index"
                        class="pa-0 mb-1"
                        density="compact"
                        tabindex="-1">
                        <template v-slot:prepend>
                            <v-icon
                                :icon="req.icon"
                                :color="req.met ? 'success' : 'grey'"
                                size="small"
                                class="mr-2">
                            </v-icon>
                        </template>
                        <v-list-item-title
                            class="text-caption"
                            :class="req.met ? 'text-success' : 'text-medium-emphasis'">
                            {{ req.text }}
                        </v-list-item-title>
                    </v-list-item>
                </v-list>
            </div>
        </v-expand-transition>

        <!-- Feedback Messages -->
        <v-expand-transition>
            <div v-if="strength.feedback.length > 0 && showFeedback" class="mt-2">
                <v-alert
                    :color="strength.color"
                    variant="tonal"
                    density="compact"
                    class="text-caption pa-2">
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
</style>
