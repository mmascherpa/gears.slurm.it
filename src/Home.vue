<template>
    <v-container>
        <h1 class="text-h4 mb-6">Welcome to Slurm Tools</h1>

        <v-row>
            <v-col cols="12" sm="6" md="4" lg="3" v-for="(item, index) in menuItems" :key="index">
                <v-card class="mx-auto" height="200" :to="item.route" hover elevation="2" variant="outlined">
                    <v-card-item>
                        <v-card-title class="text-center text-h5 mb-4">
                            {{ item.title }}
                        </v-card-title>
                        <div class="d-flex justify-center">
                            <v-icon :icon="item.icon" size="64" color="primary"></v-icon>
                        </div>
                    </v-card-item>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    data() {
        return {
            menuItems: [
                {
                    title: 'Base64 Encoder',
                    icon: 'mdi-arrow-down-bold-box',
                    route: '/base64enc'
                },
                {
                    title: 'Base64 Decoder',
                    icon: 'mdi-arrow-up-bold-box',
                    route: '/base64dec'
                },
                {
                    title: 'AES Encryption',
                    icon: 'mdi-lock',
                    route: '/aesenc'
                },
                {
                    title: 'AES Decryption',
                    icon: 'mdi-lock-open',
                    route: '/aesdec'
                },
                {
                    title: 'About',
                    icon: 'mdi-information',
                    route: '/about'
                }
            ]
        }
    }
}
</script>

<style scoped>
.v-card {
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid var(--v-border-color);
    background-color: var(--v-surface-variant);
}

.v-card:hover {
    transform: translateY(-5px);
    border-color: var(--v-primary-base);
    background-color: var(--v-surface);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.v-card-item {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
</style>