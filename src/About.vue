<template>
    <div>
        <div class="text-center mb-8">
            <v-icon icon="mdi-shield-key" size="80" color="primary" class="mb-4"></v-icon>
            <h1 class="text-h3 font-weight-bold mb-2">About Slurm Tools</h1>
            <p class="text-h6 text-medium-emphasis">Privacy-focused cryptographic utilities for everyone</p>
        </div>

        <v-row>
            <v-col cols="12" md="6">
                <v-card elevation="2" class="h-100">
                    <v-card-title class="bg-surface-variant">
                        <v-icon icon="mdi-shield-check" class="mr-2" color="success"></v-icon>
                        Privacy First
                    </v-card-title>
                    <v-card-text class="pa-4">
                        <p class="text-body-1 mb-3">
                            All encryption and encoding operations happen <strong>entirely in your browser</strong>.
                            Your data never leaves your device, and we have no servers to store or process your files.
                        </p>
                        <v-chip size="small" variant="tonal" color="success" class="mr-2">
                            <v-icon start icon="mdi-server-off"></v-icon>
                            No Servers
                        </v-chip>
                        <v-chip size="small" variant="tonal" color="success">
                            <v-icon start icon="mdi-database-off"></v-icon>
                            No Data Collection
                        </v-chip>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col cols="12" md="6">
                <v-card elevation="2" class="h-100">
                    <v-card-title class="bg-surface-variant">
                        <v-icon icon="mdi-wifi-off" class="mr-2" color="info"></v-icon>
                        Works Offline
                    </v-card-title>
                    <v-card-text class="pa-4">
                        <p class="text-body-1 mb-3">
                            Powered by Service Workers, Slurm Tools works completely offline after your first visit.
                            Perfect for sensitive environments where internet access is restricted.
                        </p>
                        <v-chip size="small" variant="tonal" color="info" class="mr-2">
                            <v-icon start icon="mdi-download"></v-icon>
                            PWA Enabled
                        </v-chip>
                        <v-chip size="small" variant="tonal" color="info">
                            <v-icon start icon="mdi-cached"></v-icon>
                            Cached Locally
                        </v-chip>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row class="mt-4">
            <v-col cols="12">
                <v-card elevation="2">
                    <v-card-title class="bg-surface-variant">
                        <v-icon icon="mdi-toolbox" class="mr-2"></v-icon>
                        Available Tools
                    </v-card-title>
                    <v-card-text class="pa-4">
                        <v-list>
                            <v-list-item prepend-icon="mdi-arrow-down-bold-box">
                                <v-list-item-title class="font-weight-bold">Base64 Encoder</v-list-item-title>
                                <v-list-item-subtitle>Convert text or files to Base64 format for safe transmission</v-list-item-subtitle>
                            </v-list-item>
                            <v-divider class="my-2"></v-divider>
                            <v-list-item prepend-icon="mdi-arrow-up-bold-box">
                                <v-list-item-title class="font-weight-bold">Base64 Decoder</v-list-item-title>
                                <v-list-item-subtitle>Decode Base64 encoded text or files back to original format</v-list-item-subtitle>
                            </v-list-item>
                            <v-divider class="my-2"></v-divider>
                            <v-list-item prepend-icon="mdi-lock">
                                <v-list-item-title class="font-weight-bold">AES Encryption</v-list-item-title>
                                <v-list-item-subtitle>Secure your files with password-protected AES encryption</v-list-item-subtitle>
                            </v-list-item>
                            <v-divider class="my-2"></v-divider>
                            <v-list-item prepend-icon="mdi-lock-open">
                                <v-list-item-title class="font-weight-bold">AES Decryption</v-list-item-title>
                                <v-list-item-subtitle>Decrypt password-protected AES encrypted files</v-list-item-subtitle>
                            </v-list-item>
                        </v-list>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row class="mt-4">
            <v-col cols="12" md="6">
                <v-card elevation="2" class="h-100">
                    <v-card-title class="bg-surface-variant">
                        <v-icon icon="mdi-code-braces" class="mr-2"></v-icon>
                        Technology
                    </v-card-title>
                    <v-card-text class="pa-4">
                        <v-list density="compact">
                            <v-list-item>
                                <template v-slot:prepend>
                                    <v-icon size="small">mdi-vuejs</v-icon>
                                </template>
                                <v-list-item-title>Vue 3 - Progressive JavaScript Framework</v-list-item-title>
                            </v-list-item>
                            <v-list-item>
                                <template v-slot:prepend>
                                    <v-icon size="small">mdi-material-design</v-icon>
                                </template>
                                <v-list-item-title>Vuetify - Material Design Components</v-list-item-title>
                            </v-list-item>
                            <v-list-item>
                                <template v-slot:prepend>
                                    <v-icon size="small">mdi-lock</v-icon>
                                </template>
                                <v-list-item-title>CryptoJS - Encryption Library</v-list-item-title>
                            </v-list-item>
                            <v-list-item>
                                <template v-slot:prepend>
                                    <v-icon size="small">mdi-worker</v-icon>
                                </template>
                                <v-list-item-title>Web Workers - Background Processing</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col cols="12" md="6">
                <v-card elevation="2" class="h-100">
                    <v-card-title class="bg-surface-variant">
                        <v-icon icon="mdi-security" class="mr-2"></v-icon>
                        Security Features
                    </v-card-title>
                    <v-card-text class="pa-4">
                        <v-list density="compact">
                            <v-list-item>
                                <template v-slot:prepend>
                                    <v-icon size="small" color="success">mdi-check-circle</v-icon>
                                </template>
                                <v-list-item-title>AES-256 Encryption Standard</v-list-item-title>
                            </v-list-item>
                            <v-list-item>
                                <template v-slot:prepend>
                                    <v-icon size="small" color="success">mdi-check-circle</v-icon>
                                </template>
                                <v-list-item-title>Client-Side Processing Only</v-list-item-title>
                            </v-list-item>
                            <v-list-item>
                                <template v-slot:prepend>
                                    <v-icon size="small" color="success">mdi-check-circle</v-icon>
                                </template>
                                <v-list-item-title>No Data Transmission</v-list-item-title>
                            </v-list-item>
                            <v-list-item>
                                <template v-slot:prepend>
                                    <v-icon size="small" color="success">mdi-check-circle</v-icon>
                                </template>
                                <v-list-item-title>Open Source & Transparent</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <div class="text-center mt-8">
            <v-divider class="mb-4"></v-divider>
            <p class="text-body-2 text-medium-emphasis">
                Made with <v-icon size="small" color="red">mdi-heart</v-icon> for privacy-conscious users
            </p>
        </div>
    </div>
</template>