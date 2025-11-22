<template>
    <div>
        <div class="text-center mb-8">
            <v-icon icon="mdi-shield-key" :size="$vuetify.display.xs ? 56 : 80" color="primary" class="mb-4"></v-icon>
            <h1 class="text-h4 text-sm-h3 font-weight-bold mb-2">About Slurm Tools</h1>
            <p class="text-subtitle-1 text-sm-h6 text-medium-emphasis">Privacy-focused cryptographic utilities for everyone</p>
        </div>

        <v-row>
            <v-col cols="12" md="6">
                <v-card class="h-100">
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
                <v-card class="h-100">
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
                <v-card>
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
                            <v-list-item prepend-icon="mdi-qrcode">
                                <v-list-item-title class="font-weight-bold">QR Code Generator</v-list-item-title>
                                <v-list-item-subtitle>Generate QR codes for text, URLs, WiFi credentials, contacts (vCard), email, and SMS</v-list-item-subtitle>
                            </v-list-item>
                            <v-divider class="my-2"></v-divider>
                            <v-list-item prepend-icon="mdi-lock">
                                <v-list-item-title class="font-weight-bold">AES Encryption</v-list-item-title>
                                <v-list-item-subtitle>Encrypt files and text with password protection using AES algorithm for maximum security</v-list-item-subtitle>
                            </v-list-item>
                            <v-divider class="my-2"></v-divider>
                            <v-list-item prepend-icon="mdi-lock-open">
                                <v-list-item-title class="font-weight-bold">AES Decryption</v-list-item-title>
                                <v-list-item-subtitle>Decrypt password-protected AES encrypted files and text securely in your browser</v-list-item-subtitle>
                            </v-list-item>
                            <v-divider class="my-2"></v-divider>
                            <v-list-item prepend-icon="mdi-form-textbox-password">
                                <v-list-item-title class="font-weight-bold">Password Generator</v-list-item-title>
                                <v-list-item-subtitle>Generate strong random passwords with customizable length and character types</v-list-item-subtitle>
                            </v-list-item>
                            <v-divider class="my-2"></v-divider>
                            <v-list-item prepend-icon="mdi-image-filter-hdr">
                                <v-list-item-title class="font-weight-bold">Metadata Editor</v-list-item-title>
                                <v-list-item-subtitle>View, edit, and remove EXIF metadata from images for complete privacy control</v-list-item-subtitle>
                            </v-list-item>
                            <v-divider class="my-2"></v-divider>
                            <v-list-item prepend-icon="mdi-file-code">
                                <v-list-item-title class="font-weight-bold">Hex Viewer</v-list-item-title>
                                <v-list-item-subtitle>View and analyze binary files with hex dump display and data interpretation</v-list-item-subtitle>
                            </v-list-item>
                        </v-list>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row class="mt-4">
            <v-col cols="12" md="6">
                <v-card class="h-100">
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
                                    <v-icon size="small">mdi-cog-sync</v-icon>
                                </template>
                                <v-list-item-title>Web Workers - Background Processing</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col cols="12" md="6">
                <v-card class="h-100">
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
                                <v-list-item-title>Cryptographically Secure Password Generation</v-list-item-title>
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