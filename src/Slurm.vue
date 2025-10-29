<script setup>
import { ref } from 'vue';
import { useTheme } from 'vuetify';
import { THEME_MODES } from './theme.js';

const drawer = ref(false);
const theme = useTheme();

// Theme management
const STORAGE_KEY = 'slurm-theme-preference';

/**
 * Get saved theme from localStorage or default to 'default'
 * Falls back to default theme if localStorage is unavailable
 */
const getSavedTheme = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && Object.values(THEME_MODES).includes(saved) ? saved : THEME_MODES.DEFAULT;
  } catch (error) {
    console.warn('Failed to read theme preference from localStorage:', error);
    return THEME_MODES.DEFAULT;
  }
};

/**
 * Set theme and persist to localStorage
 * @param {string} themeName - One of THEME_MODES values
 */
const setTheme = (themeName) => {
  theme.global.name.value = themeName;

  try {
    localStorage.setItem(STORAGE_KEY, themeName);
  } catch (error) {
    console.warn('Failed to save theme preference to localStorage:', error);
    // Theme still works, just won't persist across sessions
  }
};

// Initialize theme immediately (before component renders)
theme.global.name.value = getSavedTheme();
</script>

<template>
    <v-app>
        <v-app-bar app elevation="0" class="app-bar">
            <template v-slot:prepend>
                <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
            </template>

            <v-icon icon="mdi-shield-key" size="32" class="mr-2"></v-icon>
            <v-app-bar-title class="font-weight-bold">Slurm Tools</v-app-bar-title>

            <template v-slot:append>
                <!-- Theme Toggle Buttons -->
                <v-btn-toggle
                    mandatory
                    density="compact"
                    class="mr-2 theme-toggle"
                    :model-value="theme.global.name.value"
                    @update:model-value="setTheme"
                >
                    <v-btn
                        :value="THEME_MODES.DEFAULT"
                        size="small"
                        :variant="theme.global.name.value === THEME_MODES.DEFAULT ? 'flat' : 'text'"
                        class="square-btn"
                    >
                        <v-icon>mdi-white-balance-sunny</v-icon>
                        <v-tooltip activator="parent" location="bottom">Default Theme</v-tooltip>
                    </v-btn>

                    <v-btn
                        :value="THEME_MODES.DARK"
                        size="small"
                        :variant="theme.global.name.value === THEME_MODES.DARK ? 'flat' : 'text'"
                        class="square-btn"
                    >
                        <v-icon>mdi-moon-waning-crescent</v-icon>
                        <v-tooltip activator="parent" location="bottom">Dark Mode</v-tooltip>
                    </v-btn>

                    <v-btn
                        :value="THEME_MODES.CRAZY"
                        size="small"
                        :variant="theme.global.name.value === THEME_MODES.CRAZY ? 'flat' : 'text'"
                        class="square-btn"
                    >
                        <v-icon>mdi-auto-fix</v-icon>
                        <v-tooltip activator="parent" location="bottom">Slurm Mode</v-tooltip>
                    </v-btn>
                </v-btn-toggle>

                <v-chip size="small" variant="tonal" color="success" class="d-none d-sm-flex">
                    <v-icon start icon="mdi-shield-check"></v-icon>
                    Private & Offline
                </v-chip>
            </template>
        </v-app-bar>

        <v-navigation-drawer app v-model="drawer" class="nav-drawer">
            <v-list density="comfortable" nav>
                <v-list-item
                    to="/"
                    prepend-icon="mdi-home"
                    title="Home"
                    value="home">
                </v-list-item>

                <v-divider class="my-2"></v-divider>

                <v-list-subheader>ENCODING TOOLS</v-list-subheader>
                <v-list-item
                    to="/base64enc"
                    prepend-icon="mdi-arrow-down-bold-box"
                    title="Base64 Encoder"
                    value="base64enc">
                </v-list-item>
                <v-list-item
                    to="/base64dec"
                    prepend-icon="mdi-arrow-up-bold-box"
                    title="Base64 Decoder"
                    value="base64dec">
                </v-list-item>

                <v-divider class="my-2"></v-divider>

                <v-list-subheader>ENCRYPTION TOOLS</v-list-subheader>
                <v-list-item
                    to="/aesenc"
                    prepend-icon="mdi-lock"
                    title="AES Encrypt"
                    value="aesenc">
                </v-list-item>
                <v-list-item
                    to="/aesdec"
                    prepend-icon="mdi-lock-open"
                    title="AES Decrypt"
                    value="aesdec">
                </v-list-item>
                <v-list-item
                    to="/password-generator"
                    prepend-icon="mdi-form-textbox-password"
                    title="Password Generator"
                    value="password-generator">
                </v-list-item>

                <v-divider class="my-2"></v-divider>

                <v-list-item
                    to="/about"
                    prepend-icon="mdi-information"
                    title="About"
                    value="about">
                </v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-main app>
            <v-container fluid class="pa-4 pa-md-6 main-container">
                <router-view v-slot="{ Component }">
                    <transition name="fade" mode="out-in">
                        <component :is="Component" />
                    </transition>
                </router-view>
            </v-container>
        </v-main>
    </v-app>
</template>

<style scoped>
.app-bar {
    background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-primary-darken-1)) 100%) !important;
}

.nav-drawer {
    border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

/* Max width for better readability on large screens */
.main-container {
    max-width: 1400px;
    margin: 0 auto;
}

/* Theme toggle buttons */
.theme-toggle {
    background-color: rgba(255, 255, 255, 0.2) !important;
    border-radius: 4px;
    overflow: hidden;
}

.theme-toggle :deep(.v-btn) {
    color: rgba(255, 255, 255, 0.9);
    transition: all 0.2s ease;
}

.theme-toggle :deep(.v-btn.square-btn) {
    border-radius: 0;
    min-width: 36px;
    width: 36px;
    height: 36px;
    padding: 0;
}

.theme-toggle :deep(.v-btn--variant-flat) {
    background-color: rgba(255, 255, 255, 0.3);
    color: white;
}

.theme-toggle :deep(.v-btn:hover) {
    background-color: rgba(255, 255, 255, 0.15);
}

/* Page transition */
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.25s ease;
}

.fade-enter-from, .fade-leave-to {
    opacity: 0;
}
</style>