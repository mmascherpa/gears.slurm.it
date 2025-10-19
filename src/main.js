import './assets/global-styles.css'

import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'

import Slurm from './Slurm.vue'
import About from './About.vue'
import Home from './Home.vue'
import Base64Enc from './Base64Enc.vue'
import Base64Dec from './Base64Dec.vue'
import AESEnc from './AESEnc.vue'
import AESDec from './AESDec.vue'

// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
const routes = [
  { path: '/', component: Home },
  { path: '/base64enc', component: Base64Enc },
  { path: '/base64dec', component: Base64Dec },
  { path: '/aesenc', component: AESEnc },
  { path: '/aesdec', component: AESDec },
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
import {slurmTheme} from './theme.js'

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
    defaultTheme: 'slurmTheme',
    themes: {
      slurmTheme,
    },
  }
})

createApp(Slurm).use(router).use(vuetify).mount('#app')
