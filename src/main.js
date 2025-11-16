import './assets/global-styles.css'

import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'

import Slurm from './Slurm.vue'
import About from './About.vue'
import Home from './Home.vue'
import Base64Encode from './Base64Encode.vue'
import Base64Decode from './Base64Decode.vue'
import AesEncrypt from './AesEncrypt.vue'
import AesDecrypt from './AesDecrypt.vue'
import PasswordGenerator from './PasswordGenerator.vue'
import MetadataEditor from './MetadataEditor.vue'

// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
const routes = [
  { path: '/', component: Home },
  { path: '/base64-encode', component: Base64Encode },
  { path: '/base64-decode', component: Base64Decode },
  { path: '/aes-encrypt', component: AesEncrypt },
  { path: '/aes-decrypt', component: AesDecrypt },
  { path: '/password-generator', component: PasswordGenerator },
  { path: '/metadata-editor', component: MetadataEditor },
  { path: '/about', component: About },
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHashHistory(),
  routes, // short for `routes: routes`
})

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { md2 } from 'vuetify/blueprints'
import '@mdi/font/css/materialdesignicons.css'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { themes } from './theme.js'

const vuetify = createVuetify({
  components,
  directives,
  blueprint: md2,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'default',
    themes: themes,
  }
})

createApp(Slurm).use(router).use(vuetify).mount('#app')
