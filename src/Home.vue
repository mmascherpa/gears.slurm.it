<template>
    <div>
        <div class="text-center mb-8">
            <v-icon icon="mdi-shield-key" size="64" color="primary" class="mb-4"></v-icon>
            <h1 class="text-h3 font-weight-bold mb-2">Slurm Tools</h1>
            <p class="text-h6 text-medium-emphasis mb-4">
                Privacy-focused cryptographic utilities that work entirely in your browser
            </p>
            <v-chip variant="tonal" color="success" size="small" class="mr-2">
                <v-icon start icon="mdi-shield-check"></v-icon>
                100% Client-Side
            </v-chip>
            <v-chip variant="tonal" color="info" size="small">
                <v-icon start icon="mdi-wifi-off"></v-icon>
                Works Offline
            </v-chip>
        </div>

        <v-row class="mb-6">
            <v-col cols="12" sm="6" md="6" v-for="(item, index) in menuItems" :key="index">
                <v-card
                    :to="item.route"
                    hover
                    class="tool-card"
                    :class="item.featured ? 'featured-card' : ''"
                    height="100%">
                    <v-card-text class="pa-6">
                        <div class="d-flex align-center mb-3">
                            <v-avatar :color="item.color" size="48" class="mr-4">
                                <v-icon :icon="item.icon" size="28" color="white"></v-icon>
                            </v-avatar>
                            <div>
                                <h3 class="text-h6 font-weight-bold">{{ item.title }}</h3>
                                <p class="text-caption text-medium-emphasis mb-0">{{ item.category }}</p>
                            </div>
                        </div>
                        <p class="text-body-2 text-medium-emphasis">{{ item.description }}</p>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script>
export default {
    data() {
        return {
            menuItems: [
                {
                    title: 'Base64 Encoder',
                    icon: 'mdi-arrow-down-bold-box',
                    route: '/base64enc',
                    category: 'Encoding Tool',
                    color: 'secondary',
                    description: 'Convert text or files to Base64 format for safe transmission and storage.'
                },
                {
                    title: 'Base64 Decoder',
                    icon: 'mdi-arrow-up-bold-box',
                    route: '/base64dec',
                    category: 'Encoding Tool',
                    color: 'secondary-darken-1',
                    description: 'Decode Base64 encoded text or files back to their original format.'
                },
                {
                    title: 'AES File Encryption',
                    icon: 'mdi-lock',
                    route: '/aesenc',
                    category: 'Security Tool',
                    color: 'primary',
                    featured: true,
                    description: 'Encrypt files with password protection using AES algorithm for maximum security.'
                },
                {
                    title: 'AES File Decryption',
                    icon: 'mdi-lock-open',
                    route: '/aesdec',
                    category: 'Security Tool',
                    color: 'primary-darken-1',
                    featured: true,
                    description: 'Decrypt password-protected AES encrypted files securely in your browser.'
                },
                {
                    title: 'AES Text Encryption',
                    icon: 'mdi-file-lock-outline',
                    route: '/textaesenc',
                    category: 'Security Tool',
                    color: 'primary',
                    featured: true,
                    description: 'Quickly encrypt text with password protection - perfect for API keys and secrets.'
                },
                {
                    title: 'AES Text Decryption',
                    icon: 'mdi-lock-open-variant-outline',
                    route: '/textaesdec',
                    category: 'Security Tool',
                    color: 'primary-darken-1',
                    featured: true,
                    description: 'Decrypt password-protected text and copy results instantly to clipboard.'
                },
                {
                    title: 'Password Generator',
                    icon: 'mdi-form-textbox-password',
                    route: '/password-generator',
                    category: 'Security Tool',
                    color: 'primary',
                    description: 'Generate strong random passwords with customizable length and character types.'
                },
                {
                    title: 'About',
                    icon: 'mdi-information',
                    route: '/about',
                    category: 'Information',
                    color: 'grey',
                    description: 'Learn more about Slurm Tools and our privacy-first approach.'
                }
            ]
        }
    }
}
</script>

<style scoped>
.tool-card {
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid rgba(var(--v-border-color), 0.12);
}

.tool-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
    border-color: rgb(var(--v-theme-primary));
}

.featured-card {
    border-left: 4px solid rgb(var(--v-theme-success));
}
</style>