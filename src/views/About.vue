<template>
    <div>
        <div class="text-center mb-8">
            <v-icon icon="mdi-shield-key" :size="$vuetify.display.xs ? 56 : 80" color="primary" class="mb-4"></v-icon>
            <h1 class="text-h4 text-sm-h3 font-weight-bold mb-2">About Slurm Tools</h1>
            <p class="text-subtitle-1 text-sm-h6 text-medium-emphasis">Privacy-focused cryptographic utilities for everyone</p>
        </div>

        <!-- Privacy First & Works Offline -->
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
                        <v-chip color="success" class="mr-2">
                            <v-icon start icon="mdi-server-off"></v-icon>
                            No Servers
                        </v-chip>
                        <v-chip color="success">
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
                        <v-chip color="info" class="mr-2">
                            <v-icon start icon="mdi-download"></v-icon>
                            PWA Enabled
                        </v-chip>
                        <v-chip color="info">
                            <v-icon start icon="mdi-cached"></v-icon>
                            Cached Locally
                        </v-chip>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- How It Works -->
        <v-row class="mt-4">
            <v-col cols="12">
                <v-card>
                    <v-card-title class="bg-surface-variant">
                        <v-icon icon="mdi-cog-outline" class="mr-2"></v-icon>
                        How It Works
                    </v-card-title>
                    <v-card-text class="pa-4">
                        <p class="text-body-1 mb-3">
                            Slurm Tools is a <strong>Progressive Web Application (PWA)</strong> that leverages modern browser capabilities
                            to provide a secure, offline-first experience:
                        </p>
                        <v-list density="compact">
                            <v-list-item>
                                <template v-slot:prepend>
                                    <v-icon color="primary">mdi-numeric-1-circle</v-icon>
                                </template>
                                <v-list-item-title class="font-weight-medium">Client-Side Processing</v-list-item-title>
                                <v-list-item-subtitle>All operations run in your browser using JavaScript. Your files and data never touch a server.</v-list-item-subtitle>
                            </v-list-item>
                            <v-list-item>
                                <template v-slot:prepend>
                                    <v-icon color="primary">mdi-numeric-2-circle</v-icon>
                                </template>
                                <v-list-item-title class="font-weight-medium">Web Workers</v-list-item-title>
                                <v-list-item-subtitle>Heavy operations like AES encryption run on background threads to keep the UI responsive.</v-list-item-subtitle>
                            </v-list-item>
                            <v-list-item>
                                <template v-slot:prepend>
                                    <v-icon color="primary">mdi-numeric-3-circle</v-icon>
                                </template>
                                <v-list-item-title class="font-weight-medium">Service Workers</v-list-item-title>
                                <v-list-item-subtitle>The app is cached locally after first visit, enabling offline functionality and instant loading.</v-list-item-subtitle>
                            </v-list-item>
                            <v-list-item>
                                <template v-slot:prepend>
                                    <v-icon color="primary">mdi-numeric-4-circle</v-icon>
                                </template>
                                <v-list-item-title class="font-weight-medium">No Backend</v-list-item-title>
                                <v-list-item-subtitle>Zero server infrastructure means zero data collection, zero tracking, and maximum privacy.</v-list-item-subtitle>
                            </v-list-item>
                        </v-list>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Use Cases -->
        <v-row class="mt-4">
            <v-col cols="12">
                <v-card>
                    <v-card-title class="bg-surface-variant">
                        <v-icon icon="mdi-lightbulb-on-outline" class="mr-2"></v-icon>
                        Common Use Cases
                    </v-card-title>
                    <v-card-text class="pa-4">
                        <v-expansion-panels variant="accordion">
                            <v-expansion-panel>
                                <v-expansion-panel-title>
                                    <v-icon icon="mdi-lock" class="mr-3" color="primary"></v-icon>
                                    <span class="font-weight-medium">Encrypting Sensitive Files</span>
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <p class="text-body-2 mb-2">
                                        Use <strong>AES Encryption</strong> to password-protect documents, images, or any file before
                                        storing them in the cloud or sending them via email. Only someone with the password can decrypt them.
                                    </p>
                                    <p class="text-body-2 text-medium-emphasis">
                                        <strong>Example:</strong> Encrypt tax documents before uploading to cloud storage, then decrypt them
                                        only when needed using AES Decryption.
                                    </p>
                                </v-expansion-panel-text>
                            </v-expansion-panel>

                            <v-expansion-panel>
                                <v-expansion-panel-title>
                                    <v-icon icon="mdi-image-filter-hdr" class="mr-3" color="warning"></v-icon>
                                    <span class="font-weight-medium">Removing Photo Metadata</span>
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <p class="text-body-2 mb-2">
                                        Use <strong>Metadata Editor</strong> to strip GPS location, camera model, and other identifying
                                        information from photos before sharing them online.
                                    </p>
                                    <p class="text-body-2 text-medium-emphasis">
                                        <strong>Example:</strong> Remove location data from vacation photos before posting them on social media
                                        to protect your privacy.
                                    </p>
                                </v-expansion-panel-text>
                            </v-expansion-panel>

                            <v-expansion-panel>
                                <v-expansion-panel-title>
                                    <v-icon icon="mdi-qrcode" class="mr-3" color="secondary"></v-icon>
                                    <span class="font-weight-medium">Sharing WiFi Credentials</span>
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <p class="text-body-2 mb-2">
                                        Use <strong>QR Code Generator</strong> to create scannable QR codes for WiFi networks, making it
                                        easy for guests to connect without typing complex passwords.
                                    </p>
                                    <p class="text-body-2 text-medium-emphasis">
                                        <strong>Example:</strong> Generate a WiFi QR code for your home network and print it for visitors to scan
                                        with their phone cameras.
                                    </p>
                                </v-expansion-panel-text>
                            </v-expansion-panel>

                            <v-expansion-panel>
                                <v-expansion-panel-title>
                                    <v-icon icon="mdi-form-textbox-password" class="mr-3" color="primary"></v-icon>
                                    <span class="font-weight-medium">Creating Strong Passwords</span>
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <p class="text-body-2 mb-2">
                                        Use <strong>Password Generator</strong> to create cryptographically secure random passwords for
                                        your online accounts. The passwords are generated entirely in your browser.
                                    </p>
                                    <p class="text-body-2 text-medium-emphasis">
                                        <strong>Example:</strong> Generate a 16-character password with symbols and numbers for a new account,
                                        then store it in your password manager.
                                    </p>
                                </v-expansion-panel-text>
                            </v-expansion-panel>

                            <v-expansion-panel>
                                <v-expansion-panel-title>
                                    <v-icon icon="mdi-arrow-down-bold-box" class="mr-3" color="secondary"></v-icon>
                                    <span class="font-weight-medium">Encoding Data for APIs</span>
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <p class="text-body-2 mb-2">
                                        Use <strong>Base64 Encoder/Decoder</strong> to convert files or text to Base64 format for embedding
                                        in JSON APIs, HTML, or CSS. Decode Base64 data back to its original format.
                                    </p>
                                    <p class="text-body-2 text-medium-emphasis">
                                        <strong>Example:</strong> Encode an image to Base64 to embed it directly in an HTML email or API payload.
                                    </p>
                                </v-expansion-panel-text>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- FAQ -->
        <v-row class="mt-4">
            <v-col cols="12">
                <v-card>
                    <v-card-title class="bg-surface-variant">
                        <v-icon icon="mdi-help-circle-outline" class="mr-2"></v-icon>
                        Frequently Asked Questions
                    </v-card-title>
                    <v-card-text class="pa-4">
                        <v-expansion-panels variant="accordion">
                            <v-expansion-panel>
                                <v-expansion-panel-title class="font-weight-medium">
                                    Is my data safe? Can you see my files?
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <p class="text-body-2">
                                        <strong>Absolutely safe.</strong> All processing happens 100% in your browser. We have no backend servers,
                                        no databases, and no way to access your data. Your files never leave your device. This is a static
                                        web application that runs entirely client-side.
                                    </p>
                                </v-expansion-panel-text>
                            </v-expansion-panel>

                            <v-expansion-panel>
                                <v-expansion-panel-title class="font-weight-medium">
                                    How does offline mode work?
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <p class="text-body-2">
                                        After your first visit, a Service Worker caches the entire application on your device. This means you
                                        can use Slurm Tools without an internet connection. Updates are automatically downloaded when you're
                                        online, but the app will always work offline.
                                    </p>
                                </v-expansion-panel-text>
                            </v-expansion-panel>

                            <v-expansion-panel>
                                <v-expansion-panel-title class="font-weight-medium">
                                    What browsers are supported?
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <p class="text-body-2 mb-2">
                                        Slurm Tools works on all modern browsers that support Web Crypto API, Service Workers, and Web Workers:
                                    </p>
                                    <ul class="text-body-2 ml-4">
                                        <li>Chrome/Edge 90+</li>
                                        <li>Firefox 88+</li>
                                        <li>Safari 14+</li>
                                        <li>Opera 76+</li>
                                    </ul>
                                    <p class="text-body-2 text-medium-emphasis mt-2">
                                        Mobile browsers (iOS Safari, Chrome Mobile) are fully supported.
                                    </p>
                                </v-expansion-panel-text>
                            </v-expansion-panel>

                            <v-expansion-panel>
                                <v-expansion-panel-title class="font-weight-medium">
                                    Can I recover encrypted files if I forget the password?
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <p class="text-body-2">
                                        <strong>No.</strong> AES encryption is extremely secure, and there's no backdoor or password recovery.
                                        If you lose your password, the encrypted file cannot be recovered. This is a feature, not a bug -
                                        it ensures your data remains secure even if someone gains access to the encrypted file.
                                    </p>
                                </v-expansion-panel-text>
                            </v-expansion-panel>

                            <v-expansion-panel>
                                <v-expansion-panel-title class="font-weight-medium">
                                    Is this open source?
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <p class="text-body-2">
                                        Yes! Slurm Tools is open source and transparent. You can review the code, verify there's no data
                                        collection, and even host your own instance if desired. Check the source code to see exactly how
                                        everything works.
                                    </p>
                                </v-expansion-panel-text>
                            </v-expansion-panel>

                            <v-expansion-panel>
                                <v-expansion-panel-title class="font-weight-medium">
                                    Are there file size limits?
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <p class="text-body-2 mb-2">
                                        Yes, there are size limits to ensure optimal performance:
                                    </p>
                                    <ul class="text-body-2 ml-4 mb-2">
                                        <li><strong>General limit:</strong> 200 MB maximum file size</li>
                                        <li><strong>Base64 Encode:</strong> 10 MB maximum (Base64 expands file size by ~33%)</li>
                                        <li><strong>Base64 Decode:</strong> 15 MB maximum</li>
                                        <li><strong>Warning threshold:</strong> Files over 50 MB will show a performance warning</li>
                                    </ul>
                                    <p class="text-body-2">
                                        For encryption/decryption and large files, we use Web Workers to process data on background threads
                                        without blocking the UI. Processing time increases with file size - large files near the 200 MB limit
                                        may take several seconds to process depending on your device's performance.
                                    </p>
                                </v-expansion-panel-text>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Technology & Security Features -->
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
