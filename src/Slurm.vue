<script setup>
import { ref } from 'vue';

const drawer = ref(false);
</script>

<template>
<v-app>

<v-app-bar app>
    <template v-slot:prepend>
        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
    </template>

    <v-app-bar-title>Slurm!</v-app-bar-title>
</v-app-bar>

<v-navigation-drawer app v-model="drawer">
    <v-list-item to="/" title="Home"></v-list-item>
    <v-list-item to="/base64enc" title="Base64 Encoder"></v-list-item>
    <v-list-item to="/base64dec" title="Base64 Decoder"></v-list-item>
    <v-list-item to="/aesenc" title="AES Encrypt"></v-list-item>
    <v-list-item to="/about" title="About"></v-list-item>
</v-navigation-drawer>

<v-main app>
    <v-container>
        <router-view></router-view>
    </v-container>
</v-main>

</v-app>
</template>

<style >

</style>