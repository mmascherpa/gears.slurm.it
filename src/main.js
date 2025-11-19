import './assets/global-styles.css'
import './assets/typography.css'

import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'

import Slurm from './Slurm.vue'
import About from './views/About.vue'
import Home from './views/Home.vue'
import Base64Encode from './views/Base64Encode.vue'
import Base64Decode from './views/Base64Decode.vue'
import AesEncrypt from './views/AesEncrypt.vue'
import AesDecrypt from './views/AesDecrypt.vue'
import PasswordGenerator from './views/PasswordGenerator.vue'
import MetadataEditor from './views/MetadataEditor.vue'
import HexViewer from './views/HexViewer.vue'

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
  { path: '/hex-viewer', component: HexViewer },
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

// Lucide Icons
import { h } from 'vue'
import * as LucideIcons from 'lucide-vue-next'

// MDI to Lucide icon mapping
const iconMap = {
  // Navigation & Actions
  'mdi-arrow-down-bold-box': 'ArrowDownToLine',
  'mdi-arrow-up-bold-box': 'ArrowUpFromLine',
  'mdi-arrow-left': 'ArrowLeft',
  'mdi-home': 'Home',
  'mdi-chevron-down': 'ChevronDown',
  'mdi-chevron-up': 'ChevronUp',
  'mdi-menu': 'Menu',
  'mdi-dots-vertical': 'MoreVertical',
  'mdi-close': 'X',

  // Security & Privacy
  'mdi-lock': 'Lock',
  'mdi-lock-open': 'LockOpen',
  'mdi-lock-check': 'LockKeyhole',
  'mdi-shield-key': 'ShieldCheck',
  'mdi-shield-check': 'ShieldCheck',
  'mdi-shield-lock': 'ShieldCheck',
  'mdi-security': 'Shield',
  'mdi-key': 'Key',
  'mdi-file-lock': 'FileLock',

  // Files & Upload/Download
  'mdi-download': 'Download',
  'mdi-upload': 'Upload',
  'mdi-file': 'File',
  'mdi-file-code': 'FileCode',
  'mdi-text': 'FileText',
  'mdi-paperclip': 'Paperclip',

  // Images
  'mdi-image': 'Image',
  'mdi-image-filter-hdr': 'ImageIcon',
  'mdi-image-edit': 'ImagePlus',
  'mdi-image-off': 'ImageOff',
  'mdi-camera': 'Camera',

  // Status & Feedback
  'mdi-check': 'Check',
  'mdi-check-circle': 'CheckCircle',
  'mdi-alert': 'AlertCircle',
  'mdi-alert-circle': 'AlertCircle',
  'mdi-alert-circle-outline': 'AlertCircle',
  'mdi-information': 'Info',
  'mdi-information-outline': 'Info',

  // Editing & Actions
  'mdi-pencil': 'Pencil',
  'mdi-pencil-outline': 'PencilLine',
  'mdi-delete': 'Trash2',
  'mdi-content-copy': 'Copy',
  'mdi-content-paste': 'ClipboardPaste',
  'mdi-content-save': 'Save',
  'mdi-refresh': 'RefreshCw',
  'mdi-cached': 'RefreshCw',
  'mdi-undo': 'Undo',
  'mdi-restore': 'RotateCcw',
  'mdi-eraser': 'Eraser',
  'mdi-plus': 'Plus',
  'mdi-plus-circle': 'PlusCircle',

  // Network & Connectivity
  'mdi-server-off': 'ServerOff',
  'mdi-database-off': 'DatabaseZap',
  'mdi-wifi': 'Wifi',
  'mdi-wifi-off': 'WifiOff',
  'mdi-update': 'RefreshCw',

  // UI Elements
  'mdi-toolbox': 'Wrench',
  'mdi-cog': 'Settings',
  'mdi-code-braces': 'Code',
  'mdi-form-textbox-password': 'KeyRound',
  'mdi-magnify': 'Search',
  'mdi-magnify-plus-outline': 'ZoomIn',
  'mdi-eye': 'Eye',
  'mdi-eye-off': 'EyeOff',
  'mdi-close-octagon-outline': 'XOctagon',

  // Lists & Organization
  'mdi-table': 'Table',
  'mdi-format-list-bulleted': 'List',
  'mdi-format-list-bulleted-type': 'ListOrdered',
  'mdi-folder': 'Folder',
  'mdi-tag': 'Tag',
  'mdi-lightbulb': 'Lightbulb',

  // Misc
  'mdi-calendar': 'Calendar',
  'mdi-map-marker': 'MapPin',
  'mdi-memory': 'Cpu',
}

// Create Lucide icon set for Vuetify
const lucideIconSet = {
  component: (props) => {
    let iconName = props.icon

    // If it's an MDI icon, try to map it to Lucide
    if (typeof iconName === 'string' && iconName.startsWith('mdi-')) {
      iconName = iconMap[iconName] || null
    }

    // Convert kebab-case to PascalCase for Lucide
    if (typeof iconName === 'string' && iconName.includes('-')) {
      iconName = iconName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')
    }

    const LucideIcon = iconName ? LucideIcons[iconName] : null

    // If Lucide icon exists, use it
    if (typeof LucideIcon === 'function') {
      return h(LucideIcon, {
        size: props.size || 24,
        color: props.color,
        strokeWidth: 2,
        ...props
      })
    }

    // Fallback to MDI if Lucide icon not found
    return h('i', {
      class: `mdi ${props.icon}`,
      style: {
        fontSize: props.size ? `${props.size}px` : '24px',
        color: props.color
      }
    })
  }
}

const vuetify = createVuetify({
  components,
  directives,
  blueprint: md2,
  icons: {
    defaultSet: 'lucide',
    aliases,
    sets: {
      lucide: lucideIconSet,
      mdi, // Keep MDI as fallback for missing icons
    },
  },
  theme: {
    defaultTheme: 'default',
    themes: themes,
  },
  defaults: {
    // Button defaults - modern elevated style
    VBtn: {
      variant: 'elevated',
      elevation: 2,
    },

    // Card defaults - consistent elevation and styling
    VCard: {
      elevation: 2,
    },
    VCardTitle: {
      class: 'bg-surface-variant pa-2',
    },
    VCardText: {
      class: 'pa-4',
    },

    // Text input defaults - comfortable density, outlined variant
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
    },

    // Alert defaults - compact, tonal style
    VAlert: {
      variant: 'tonal',
      density: 'compact',
    },

    // List defaults - compact density for better spacing
    VList: {
      density: 'compact',
    },

    // Chip defaults - tonal variant, small size
    VChip: {
      variant: 'tonal',
      size: 'small',
    },
  }
})

createApp(Slurm).use(router).use(vuetify).mount('#app')
