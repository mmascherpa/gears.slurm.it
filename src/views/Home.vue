<template>
    <div>
        <!-- Header Section -->
        <div class="text-center mb-8">
            <v-icon icon="mdi-shield-key" :size="$vuetify.display.xs ? 48 : 64" color="primary" class="mb-4"></v-icon>
            <h1 class="text-h4 text-sm-h3 font-weight-bold mb-2">Slurm Tools</h1>
            <p class="text-subtitle-1 text-sm-h6 text-medium-emphasis mb-4">
                Privacy-focused cryptographic utilities that work entirely in your browser
            </p>
            <v-chip color="success" class="mr-2 mb-2">
                <v-icon start icon="mdi-shield-check"></v-icon>
                100% Client-Side
            </v-chip>
            <v-chip color="info" class="mb-2">
                <v-icon start icon="mdi-wifi-off"></v-icon>
                Works Offline
            </v-chip>
        </div>

        <!-- Tools Grid -->
        <div class="tools-container">
            <!-- Security Tools -->
            <div class="tool-category mb-6">
                <h2 class="text-h6 text-medium-emphasis mb-4 text-center">
                    <v-icon icon="mdi-shield-lock" class="mr-2"></v-icon>
                    Security Tools
                </h2>
                <div class="tool-grid">
                    <div v-for="tool in securityTools" :key="tool.route" class="tool-item">
                        <v-btn
                            icon
                            :color="tool.color"
                            :to="tool.route"
                            size="x-large"
                            variant="tonal"
                            class="tool-icon-btn">
                            <v-icon size="36">{{ tool.icon }}</v-icon>

                            <!-- Rich tooltip for desktop only -->
                            <v-tooltip
                                v-if="$vuetify.display.mdAndUp"
                                activator="parent"
                                location="bottom"
                                max-width="300"
                                :open-delay="400"
                                :close-delay="100">
                                <div class="pa-2">
                                    <div class="d-flex align-center mb-2">
                                        <v-icon :color="tool.color" size="small" class="mr-2">{{ tool.icon }}</v-icon>
                                        <span class="font-weight-bold text-subtitle-1">{{ tool.title }}</span>
                                    </div>
                                    <div class="text-caption text-medium-emphasis mb-2">{{ tool.category }}</div>
                                    <div class="text-body-2">{{ tool.description }}</div>
                                </div>
                            </v-tooltip>
                        </v-btn>
                        <div class="tool-label text-caption mt-2 text-center">{{ tool.shortName || tool.title }}</div>
                    </div>
                </div>
            </div>

            <!-- Encoding Tools -->
            <div class="tool-category mb-6">
                <h2 class="text-h6 text-medium-emphasis mb-4 text-center">
                    <v-icon icon="mdi-code-tags" class="mr-2"></v-icon>
                    Encoding Tools
                </h2>
                <div class="tool-grid">
                    <div v-for="tool in encodingTools" :key="tool.route" class="tool-item">
                        <v-btn
                            icon
                            :color="tool.color"
                            :to="tool.route"
                            size="x-large"
                            variant="tonal"
                            class="tool-icon-btn">
                            <v-icon size="36">{{ tool.icon }}</v-icon>

                            <!-- Rich tooltip for desktop only -->
                            <v-tooltip
                                v-if="$vuetify.display.mdAndUp"
                                activator="parent"
                                location="bottom"
                                max-width="300"
                                :open-delay="400"
                                :close-delay="100">
                                <div class="pa-2">
                                    <div class="d-flex align-center mb-2">
                                        <v-icon :color="tool.color" size="small" class="mr-2">{{ tool.icon }}</v-icon>
                                        <span class="font-weight-bold text-subtitle-1">{{ tool.title }}</span>
                                    </div>
                                    <div class="text-caption text-medium-emphasis mb-2">{{ tool.category }}</div>
                                    <div class="text-body-2">{{ tool.description }}</div>
                                </div>
                            </v-tooltip>
                        </v-btn>
                        <div class="tool-label text-caption mt-2 text-center">{{ tool.shortName || tool.title }}</div>
                    </div>
                </div>
            </div>

            <!-- Privacy & Analysis Tools -->
            <div class="tool-category mb-6">
                <h2 class="text-h6 text-medium-emphasis mb-4 text-center">
                    <v-icon icon="mdi-shield-account" class="mr-2"></v-icon>
                    Privacy & Analysis
                </h2>
                <div class="tool-grid">
                    <div v-for="tool in privacyAnalysisTools" :key="tool.route" class="tool-item">
                        <v-btn
                            icon
                            :color="tool.color"
                            :to="tool.route"
                            size="x-large"
                            variant="tonal"
                            class="tool-icon-btn">
                            <v-icon size="36">{{ tool.icon }}</v-icon>

                            <!-- Rich tooltip for desktop only -->
                            <v-tooltip
                                v-if="$vuetify.display.mdAndUp"
                                activator="parent"
                                location="bottom"
                                max-width="300"
                                :open-delay="400"
                                :close-delay="100">
                                <div class="pa-2">
                                    <div class="d-flex align-center mb-2">
                                        <v-icon :color="tool.color" size="small" class="mr-2">{{ tool.icon }}</v-icon>
                                        <span class="font-weight-bold text-subtitle-1">{{ tool.title }}</span>
                                    </div>
                                    <div class="text-caption text-medium-emphasis mb-2">{{ tool.category }}</div>
                                    <div class="text-body-2">{{ tool.description }}</div>
                                </div>
                            </v-tooltip>
                        </v-btn>
                        <div class="tool-label text-caption mt-2 text-center">{{ tool.shortName || tool.title }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            securityTools: [
                {
                    title: 'AES Encryption',
                    shortName: 'AES Encrypt',
                    icon: 'mdi-lock',
                    route: '/aes-encrypt',
                    category: 'Security Tool',
                    color: 'primary',
                    featured: true,
                    description: 'Encrypt files and text with password protection using AES algorithm for maximum security.'
                },
                {
                    title: 'AES Decryption',
                    shortName: 'AES Decrypt',
                    icon: 'mdi-lock-open',
                    route: '/aes-decrypt',
                    category: 'Security Tool',
                    color: 'primary-darken-1',
                    featured: true,
                    description: 'Decrypt password-protected AES encrypted files and text securely in your browser.'
                },
                {
                    title: 'Password Generator',
                    shortName: 'Password Gen',
                    icon: 'mdi-form-textbox-password',
                    route: '/password-generator',
                    category: 'Security Tool',
                    color: 'primary',
                    description: 'Generate strong random passwords with customizable length and character types.'
                }
            ],
            encodingTools: [
                {
                    title: 'Base64 Encoder',
                    shortName: 'Base64 Encode',
                    icon: 'mdi-arrow-down-bold-box',
                    route: '/base64-encode',
                    category: 'Encoding Tool',
                    color: 'secondary',
                    description: 'Convert text or files to Base64 format for safe transmission and storage.'
                },
                {
                    title: 'Base64 Decoder',
                    shortName: 'Base64 Decode',
                    icon: 'mdi-arrow-up-bold-box',
                    route: '/base64-decode',
                    category: 'Encoding Tool',
                    color: 'secondary-darken-1',
                    description: 'Decode Base64 encoded text or files back to their original format.'
                },
                {
                    title: 'QR Code Generator',
                    shortName: 'QR Code',
                    icon: 'mdi-qrcode',
                    route: '/qr-code-generator',
                    category: 'Encoding Tool',
                    color: 'secondary',
                    description: 'Generate QR codes for text, URLs, WiFi credentials, contacts, and more.'
                }
            ],
            privacyAnalysisTools: [
                {
                    title: 'Metadata Editor',
                    shortName: 'Metadata',
                    icon: 'mdi-image-filter-hdr',
                    route: '/metadata-editor',
                    category: 'Privacy Tool',
                    color: 'warning',
                    featured: true,
                    description: 'View, edit, and remove EXIF metadata from images for complete privacy control.'
                },
                {
                    title: 'Hex Viewer',
                    shortName: 'Hex Viewer',
                    icon: 'mdi-file-code',
                    route: '/hex-viewer',
                    category: 'Analysis Tool',
                    color: 'info',
                    description: 'View and analyze binary files with hex dump display and data interpretation.'
                }
            ]
        }
    }
}
</script>

<style scoped>
.tools-container {
    max-width: 900px;
    margin: 0 auto;
}

.tool-category {
    margin-bottom: 2rem;
}

.tool-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 1.5rem;
    justify-items: center;
    max-width: 600px;
    margin: 0 auto;
}

/* Mobile: 2-3 columns */
@media (max-width: 599px) {
    .tool-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
    }
}

/* Tablet: 3-4 columns */
@media (min-width: 600px) and (max-width: 959px) {
    .tool-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
    }
}

/* Desktop: 3-4 columns (max) */
@media (min-width: 960px) {
    .tool-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;
    }
}

.tool-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 120px;
}

.tool-icon-btn {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tool-icon-btn:hover {
    transform: translateY(-4px);
}

.tool-label {
    word-wrap: break-word;
    max-width: 100%;
    line-height: 1.2;
    color: rgb(var(--v-theme-on-surface));
    opacity: 0.7;
}
</style>
