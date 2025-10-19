<script setup>
import { ref } from 'vue';

const drawer = ref(false);
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

/* Page transition */
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.25s ease;
}

.fade-enter-from, .fade-leave-to {
    opacity: 0;
}
</style>