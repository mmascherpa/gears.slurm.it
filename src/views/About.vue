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
                        <v-list density="comfortable">
                            <v-list-item>
                                <template v-slot:prepend>
                                    <v-icon color="primary">mdi-numeric-1-circle</v-icon>
                                </template>
                                <v-list-item-title class="font-weight-medium mb-1">Client-Side Processing</v-list-item-title>
                                <v-list-item-subtitle class="text-wrap mb-1">
                                    All operations run in your browser using JavaScript and Web APIs. Your files and data never touch a server.
                                </v-list-item-subtitle>
                                <v-list-item-subtitle class="text-wrap text-info">
                                    <v-icon size="x-small" class="mr-1">mdi-arrow-right</v-icon>
                                    <strong>Why it matters:</strong> Your files never leave your device, eliminating the risk of interception,
                                    logging, or unauthorized access.
                                </v-list-item-subtitle>
                            </v-list-item>

                            <v-list-item>
                                <template v-slot:prepend>
                                    <v-icon color="primary">mdi-numeric-2-circle</v-icon>
                                </template>
                                <v-list-item-title class="font-weight-medium mb-1">Web Workers</v-list-item-title>
                                <v-list-item-subtitle class="text-wrap mb-1">
                                    Heavy operations like file encryption and large file processing run on background threads.
                                </v-list-item-subtitle>
                                <v-list-item-subtitle class="text-wrap text-info">
                                    <v-icon size="x-small" class="mr-1">mdi-arrow-right</v-icon>
                                    <strong>Why it matters:</strong> Your browser stays responsive even when processing large files,
                                    providing a smooth experience without freezing or lag.
                                </v-list-item-subtitle>
                            </v-list-item>

                            <v-list-item>
                                <template v-slot:prepend>
                                    <v-icon color="primary">mdi-numeric-3-circle</v-icon>
                                </template>
                                <v-list-item-title class="font-weight-medium mb-1">Service Workers</v-list-item-title>
                                <v-list-item-subtitle class="text-wrap mb-1">
                                    The entire application is cached locally after your first visit, enabling complete offline functionality.
                                </v-list-item-subtitle>
                                <v-list-item-subtitle class="text-wrap text-info">
                                    <v-icon size="x-small" class="mr-1">mdi-arrow-right</v-icon>
                                    <strong>Why it matters:</strong> Use the tools anywhere—on planes, in secure facilities without internet,
                                    or in areas with poor connectivity. No network required after initial load.
                                </v-list-item-subtitle>
                            </v-list-item>

                            <v-list-item>
                                <template v-slot:prepend>
                                    <v-icon color="primary">mdi-numeric-4-circle</v-icon>
                                </template>
                                <v-list-item-title class="font-weight-medium mb-1">No Backend</v-list-item-title>
                                <v-list-item-subtitle class="text-wrap mb-1">
                                    Zero server infrastructure—no databases, no API endpoints, no data processing servers.
                                </v-list-item-subtitle>
                                <v-list-item-subtitle class="text-wrap text-info">
                                    <v-icon size="x-small" class="mr-1">mdi-arrow-right</v-icon>
                                    <strong>Why it matters:</strong> Eliminates entire categories of security vulnerabilities. No servers
                                    means no data breaches, no logging, no tracking, and complete privacy by design.
                                </v-list-item-subtitle>
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
                                    <span class="font-weight-medium">Encrypting Sensitive Files</span>
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <p class="text-body-2 mb-2">
                                        Use <strong>File Encryption</strong> to password-protect documents, images, or any file before
                                        storing them in the cloud or sending them via email. Only someone with the password can decrypt them.
                                    </p>
                                    <p class="text-body-2 text-medium-emphasis">
                                        <strong>Example:</strong> Encrypt tax documents before uploading to cloud storage, then decrypt them
                                        only when needed using File Decryption.
                                    </p>
                                </v-expansion-panel-text>
                            </v-expansion-panel>

                            <v-expansion-panel>
                                <v-expansion-panel-title>
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

                            <v-expansion-panel>
                                <v-expansion-panel-title>
                                    <span class="font-weight-medium">Secure Document Sharing</span>
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <p class="text-body-2 mb-2">
                                        Use <strong>File Encryption</strong> to encrypt files before uploading them to cloud storage (Dropbox, Google Drive, etc.)
                                        or sending via email. Share the password separately through a different channel (text message, phone call).
                                    </p>
                                    <p class="text-body-2 text-medium-emphasis">
                                        <strong>Example:</strong> Encrypt a confidential contract before uploading to Dropbox, then text the password
                                        to the recipient. Even if the cloud storage is compromised, the file remains secure.
                                    </p>
                                </v-expansion-panel-text>
                            </v-expansion-panel>

                            <v-expansion-panel>
                                <v-expansion-panel-title>
                                    <span class="font-weight-medium">Inspecting Unknown Files</span>
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <p class="text-body-2 mb-2">
                                        Use <strong>Hex Viewer</strong> to inspect binary files and understand their structure. View file headers,
                                        identify file types, analyze data patterns, and detect anomalies or corruption.
                                    </p>
                                    <p class="text-body-2 text-medium-emphasis">
                                        <strong>Example:</strong> Check if a file claiming to be an image actually has a valid image header, or
                                        inspect a corrupted file to identify where the damage occurred.
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
                                        <strong>No.</strong> Modern encryption (AES-256, Age) is extremely secure, and there's no backdoor or password recovery.
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

                            <v-expansion-panel>
                                <v-expansion-panel-title class="font-weight-medium">
                                    Why use Slurm Tools?
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <p class="text-body-2 mb-2">
                                        Slurm Tools offers several advantages for privacy-conscious users:
                                    </p>
                                    <ul class="text-body-2 ml-4">
                                        <li><strong>No account required</strong> - Start using tools immediately without registration</li>
                                        <li><strong>Complete privacy</strong> - Your data never leaves your browser</li>
                                        <li><strong>Works offline</strong> - Use it anywhere, even without internet access</li>
                                        <li><strong>Open source</strong> - Transparent code you can inspect and verify</li>
                                        <li><strong>No cost</strong> - Free to use with no ads or tracking</li>
                                    </ul>
                                </v-expansion-panel-text>
                            </v-expansion-panel>

                            <v-expansion-panel>
                                <v-expansion-panel-title class="font-weight-medium">
                                    What happens to my files after processing?
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <p class="text-body-2 mb-2">
                                        Nothing. Files are processed in your browser's memory and immediately discarded when you're done.
                                    </p>
                                    <ul class="text-body-2 ml-4">
                                        <li><strong>No temporary storage</strong> - Files exist only in memory during processing</li>
                                        <li><strong>No caching</strong> - Your files are not saved to browser cache or disk</li>
                                        <li><strong>No uploads</strong> - Files never leave your device</li>
                                        <li><strong>User control</strong> - Downloaded results are saved only where you choose</li>
                                    </ul>
                                    <p class="text-body-2 mt-2">
                                        Close the tab or refresh the page, and all traces of your files are gone.
                                    </p>
                                </v-expansion-panel-text>
                            </v-expansion-panel>

                            <v-expansion-panel>
                                <v-expansion-panel-title class="font-weight-medium">
                                    Can I install this as an app?
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <p class="text-body-2 mb-2">
                                        Yes! Slurm Tools is a Progressive Web App (PWA) and can be installed on your device:
                                    </p>
                                    <ul class="text-body-2 ml-4 mb-2">
                                        <li><strong>Chrome/Edge:</strong> Click the install icon in the address bar or "Install Slurm Tools" in the menu</li>
                                        <li><strong>Safari (iOS/macOS):</strong> Tap Share → "Add to Home Screen"</li>
                                        <li><strong>Firefox:</strong> Click the home icon in the address bar to add to home screen</li>
                                    </ul>
                                    <p class="text-body-2">
                                        Once installed, Slurm Tools works like a native app with its own icon and window, and functions
                                        completely offline after the initial installation.
                                    </p>
                                </v-expansion-panel-text>
                            </v-expansion-panel>

                            <v-expansion-panel>
                                <v-expansion-panel-title class="font-weight-medium">
                                    How do I verify this app is safe?
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <p class="text-body-2 mb-2">
                                        You can verify Slurm Tools' safety through several methods:
                                    </p>
                                    <ul class="text-body-2 ml-4 mb-2">
                                        <li><strong>Open source code</strong> - Review the complete source code on GitHub to see exactly how it works</li>
                                        <li><strong>Network inspection</strong> - Open your browser's developer tools (F12) and check the Network tab
                                        while using the app - you'll see zero external requests during file processing</li>
                                        <li><strong>Code transparency</strong> - All JavaScript is unminified and readable, with no obfuscation</li>
                                        <li><strong>Service Worker inspection</strong> - View what's cached by checking Application → Service Workers
                                        in browser dev tools</li>
                                    </ul>
                                    <p class="text-body-2">
                                        For security-critical use cases, you can even download and host your own instance.
                                    </p>
                                </v-expansion-panel-text>
                            </v-expansion-panel>

                            <v-expansion-panel>
                                <v-expansion-panel-title class="font-weight-medium">
                                    What if I get errors or decryption fails?
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <p class="text-body-2 mb-2">
                                        Common issues and solutions:
                                    </p>
                                    <ul class="text-body-2 ml-4 mb-2">
                                        <li><strong>Wrong password</strong> - Decryption requires the exact password used for encryption.
                                        Passwords are case-sensitive.</li>
                                        <li><strong>Corrupted file</strong> - If a file was modified or incompletely transferred, decryption will fail</li>
                                        <li><strong>Wrong file format</strong> - Ensure you're using the correct algorithm (e.g., .aes files for AES algorithm, .age files for Age algorithm)</li>
                                        <li><strong>Browser compatibility</strong> - Use a modern browser (Chrome 90+, Firefox 88+, Safari 14+)</li>
                                        <li><strong>File size exceeded</strong> - Check that your file is within the size limits (see "Are there file size limits?")</li>
                                    </ul>
                                    <p class="text-body-2">
                                        For technical details, open your browser's console (F12 → Console tab) to see specific error messages.
                                    </p>
                                </v-expansion-panel-text>
                            </v-expansion-panel>

                            <v-expansion-panel>
                                <v-expansion-panel-title class="font-weight-medium">
                                    Can I use this for work or business?
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <p class="text-body-2 mb-2">
                                        Yes! Slurm Tools is released under the MIT license, which allows both personal and commercial use
                                        without restrictions.
                                    </p>
                                    <p class="text-body-2 mb-2">
                                        There is no usage tracking, no account system, and no limitations on how you use the tools. Because
                                        everything runs locally in your browser, it's perfect for handling sensitive business data without
                                        risk of data exposure.
                                    </p>
                                    <p class="text-body-2">
                                        You can even host your own instance if your organization requires it for internal use.
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
                                <v-list-item-title>Encryption Libraries</v-list-item-title>
                                <v-list-item-subtitle>jsAesCrypt (AES-256-CBC), Web Crypto API (AES-256-GCM), rage-wasm (Age encryption)</v-list-item-subtitle>
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
                        <p class="text-body-2 mb-3">
                            Security through architecture: Slurm Tools eliminates entire categories of vulnerabilities
                            by never transmitting your data anywhere.
                        </p>
                        <v-list density="compact">
                            <v-list-item>
                                <template v-slot:prepend>
                                    <v-icon size="small" color="success">mdi-check-circle</v-icon>
                                </template>
                                <v-list-item-title>Military-Grade Encryption (AES-256 & Age)</v-list-item-title>
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
                            <v-list-item>
                                <template v-slot:prepend>
                                    <v-icon size="small" color="success">mdi-check-circle</v-icon>
                                </template>
                                <v-list-item-title>Zero Network Requests During Processing</v-list-item-title>
                            </v-list-item>
                            <v-list-item>
                                <template v-slot:prepend>
                                    <v-icon size="small" color="success">mdi-check-circle</v-icon>
                                </template>
                                <v-list-item-title>Ephemeral In-Memory Processing</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Security Best Practices -->
        <v-row class="mt-4">
            <v-col cols="12">
                <v-card>
                    <v-card-title class="bg-surface-variant">
                        <v-icon icon="mdi-shield-check-outline" class="mr-2"></v-icon>
                        Security Best Practices
                    </v-card-title>
                    <v-card-text class="pa-4">
                        <p class="text-body-1 mb-3">
                            While Slurm Tools provides strong technical security, following these practices ensures maximum protection
                            when working with encryption and sensitive data:
                        </p>
                        <v-expansion-panels variant="accordion">
                            <v-expansion-panel>
                                <v-expansion-panel-title>
                                    <span class="font-weight-medium">Use Strong Passwords</span>
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <ul class="text-body-2 ml-4">
                                        <li><strong>Minimum 12 characters</strong> with mixed case letters, numbers, and symbols</li>
                                        <li><strong>Use a password manager</strong> like Bitwarden, 1Password, or KeePass to generate and store passwords</li>
                                        <li><strong>Never reuse passwords</strong> across different encrypted files or accounts</li>
                                        <li><strong>Avoid dictionary words</strong> and predictable patterns (like "Password123!")</li>
                                    </ul>
                                    <p class="text-body-2 mt-2 text-medium-emphasis">
                                        Remember: AES encryption is unbreakable with a strong password, but weak passwords can be guessed.
                                    </p>
                                </v-expansion-panel-text>
                            </v-expansion-panel>

                            <v-expansion-panel>
                                <v-expansion-panel-title>
                                    <span class="font-weight-medium">Backup Strategy</span>
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <ul class="text-body-2 ml-4">
                                        <li><strong>Store encrypted files and passwords separately</strong> - never in the same location</li>
                                        <li><strong>Test decryption immediately</strong> after encrypting important files to verify password correctness</li>
                                        <li><strong>Keep multiple backups</strong> of critical encrypted files in different locations</li>
                                        <li><strong>Document password hints separately</strong> (never with the encrypted file itself)</li>
                                        <li><strong>Consider offline backups</strong> for highly sensitive data</li>
                                    </ul>
                                    <p class="text-body-2 mt-2 text-medium-emphasis">
                                        Lost passwords mean permanently lost data. There is no recovery mechanism by design.
                                    </p>
                                </v-expansion-panel-text>
                            </v-expansion-panel>

                            <v-expansion-panel>
                                <v-expansion-panel-title>
                                    <span class="font-weight-medium">Secure File Handling</span>
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <ul class="text-body-2 ml-4">
                                        <li><strong>Delete original unencrypted files</strong> after successful encryption and backup verification</li>
                                        <li><strong>Use secure deletion tools</strong> for sensitive originals (simple deletion doesn't overwrite data)</li>
                                        <li><strong>Verify encrypted file integrity</strong> before deleting originals</li>
                                        <li><strong>Don't store passwords in filenames</strong> or in the same folder as encrypted files</li>
                                        <li><strong>Be cautious with cloud storage</strong> - encrypted files are safe, but keep passwords elsewhere</li>
                                    </ul>
                                </v-expansion-panel-text>
                            </v-expansion-panel>

                            <v-expansion-panel>
                                <v-expansion-panel-title>
                                    <span class="font-weight-medium">Verification & Trust</span>
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <ul class="text-body-2 ml-4">
                                        <li><strong>Review source code on GitHub</strong> if handling security-critical data</li>
                                        <li><strong>Check browser network tab</strong> (F12 → Network) - you should see zero requests during file processing</li>
                                        <li><strong>Bookmark the official URL</strong> to avoid phishing sites</li>
                                        <li><strong>Verify the app is cached</strong> by checking Application → Service Workers in browser dev tools</li>
                                        <li><strong>Keep your browser updated</strong> for latest security patches</li>
                                    </ul>
                                    <p class="text-body-2 mt-2 text-medium-emphasis">
                                        For maximum security, you can host your own instance from the source code.
                                    </p>
                                </v-expansion-panel-text>
                            </v-expansion-panel>

                            <v-expansion-panel>
                                <v-expansion-panel-title>
                                    <span class="font-weight-medium">Metadata Awareness</span>
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <ul class="text-body-2 ml-4">
                                        <li><strong>Photos contain hidden data</strong> - GPS coordinates, camera model, timestamps, and more</li>
                                        <li><strong>Always use Metadata Editor</strong> before sharing images publicly</li>
                                        <li><strong>QR codes are readable by anyone</strong> - don't encode sensitive information in public QR codes</li>
                                        <li><strong>Base64 is not encryption</strong> - it's encoding. Anyone can decode Base64 data.</li>
                                        <li><strong>File extensions matter</strong> - .aes files are encrypted, but originals may still exist elsewhere</li>
                                    </ul>
                                    <p class="text-body-2 mt-2 text-medium-emphasis">
                                        Understanding what each tool does (encryption vs. encoding vs. metadata removal) is crucial for proper use.
                                    </p>
                                </v-expansion-panel-text>
                            </v-expansion-panel>
                        </v-expansion-panels>
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
