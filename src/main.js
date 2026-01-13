import './assets/global-styles.css'
import './assets/typography.css'

import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'

import Slurm from './Slurm.vue'
import HomePage from './views/Home.vue'

// 2. Define routes with lazy loading for better performance
// Home is eagerly loaded since it's the landing page
// All tool pages are lazy-loaded to reduce initial bundle size
const routes = [
  { path: '/', component: HomePage },
  { path: '/base64-encode', component: () => import('./views/Base64Encode.vue') },
  { path: '/base64-decode', component: () => import('./views/Base64Decode.vue') },
  { path: '/qr-code-generator', component: () => import('./views/QrCodeGenerator.vue') },
  { path: '/encrypt', component: () => import('./views/Encrypt.vue') },
  { path: '/decrypt', component: () => import('./views/Decrypt.vue') },
  { path: '/password-generator', component: () => import('./views/PasswordGenerator.vue') },
  { path: '/metadata-editor', component: () => import('./views/MetadataEditor.vue') },
  { path: '/hex-viewer', component: () => import('./views/HexViewer.vue') },
  { path: '/about', component: () => import('./views/About.vue') },
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
import { themes } from './theme.js'

// Lucide Icons - specific imports for tree-shaking
import { h } from 'vue'
import {
  AlertCircle, Archive, ArrowDownToLine, ArrowLeft, ArrowLeftRight, ArrowRight, ArrowRightCircle, ArrowUpDown, ArrowUpFromLine,
  Barcode, Binary, Box, Calendar, CalendarClock, Camera, Check, CheckCircle, CheckSquare, ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  Circle, ClipboardPaste, Clock, Code, Code2, Cog, Compass, Contrast, Copy, Copyright, Cpu,
  Crop, DatabaseZap, Download, Droplet, Eraser, Eye, EyeOff, File, FileCode, FileLock, FileSearch,
  FileText, FileType, Fingerprint, Folder, Gauge, GitBranch, Grid2x2, Hash, Heading1, Heart, HelpCircle, Home, Image, ImageIcon, ImageOff, ImagePlus,
  Info, Key, KeyRound, Lightbulb, List, ListOrdered, Lock, LockKeyhole, LockOpen,
  Map, MapPin, MapPinCheck, Menu, MessageSquare, MessageSquareText, MinusSquare, Moon, MoreVertical, Mountain, Palette,
  Paperclip, Pencil, PencilLine, Plus, PlusCircle, QrCode, RefreshCw, RotateCcw, Ruler, Satellite,
  Save, ScanLine, Search, ServerOff, Settings, Shield, ShieldCheck, Smartphone, Sparkles, Square, Sun,
  SunDim, SunMedium, SunMoon, Table, TableProperties, Tag, Timer, Trash2, Undo, Upload, User, Wifi, WifiOff, Wrench,
  X, XCircle, XOctagon, Zap, ZoomIn
} from 'lucide-vue-next'

// Create a lookup object for imported icons
const LucideIcons = {
  AlertCircle, Archive, ArrowDownToLine, ArrowLeft, ArrowLeftRight, ArrowRight, ArrowRightCircle, ArrowUpDown, ArrowUpFromLine,
  Barcode, Binary, Box, Calendar, CalendarClock, Camera, Check, CheckCircle, CheckSquare, ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  Circle, ClipboardPaste, Clock, Code, Code2, Cog, Compass, Contrast, Copy, Copyright, Cpu,
  Crop, DatabaseZap, Download, Droplet, Eraser, Eye, EyeOff, File, FileCode, FileLock, FileSearch,
  FileText, FileType, Fingerprint, Folder, Gauge, GitBranch, Grid2x2, Hash, Heading1, Heart, HelpCircle, Home, Image, ImageIcon, ImageOff, ImagePlus,
  Info, Key, KeyRound, Lightbulb, List, ListOrdered, Lock, LockKeyhole, LockOpen,
  Map, MapPin, MapPinCheck, Menu, MessageSquare, MessageSquareText, MinusSquare, Moon, MoreVertical, Mountain, Palette,
  Paperclip, Pencil, PencilLine, Plus, PlusCircle, QrCode, RefreshCw, RotateCcw, Ruler, Satellite,
  Save, ScanLine, Search, ServerOff, Settings, Shield, ShieldCheck, Smartphone, Sparkles, Square, Sun,
  SunDim, SunMedium, SunMoon, Table, TableProperties, Tag, Timer, Trash2, Undo, Upload, User, Wifi, WifiOff, Wrench,
  X, XCircle, XOctagon, Zap, ZoomIn
}

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
  'mdi-menu-down': 'ChevronDown',
  'mdi-menu-up': 'ChevronUp',
  'mdi-menu-left': 'ChevronLeft',
  'mdi-menu-right': 'ChevronRight',
  'mdi-dots-vertical': 'MoreVertical',
  'mdi-close': 'X',

  // Security & Privacy
  'mdi-lock': 'Lock',
  'mdi-lock-open': 'LockOpen',
  'mdi-lock-check': 'LockKeyhole',
  'mdi-shield-key': 'ShieldCheck',
  'mdi-shield-check': 'ShieldCheck',
  'mdi-shield-lock': 'ShieldCheck',
  'mdi-shield-account': 'ShieldCheck',
  'mdi-security': 'Shield',
  'mdi-key': 'Key',
  'mdi-file-lock': 'FileLock',

  // Files & Upload/Download
  'mdi-download': 'Download',
  'mdi-upload': 'Upload',
  'mdi-file': 'File',
  'mdi-file-code': 'FileCode',
  'mdi-file-document': 'FileText',
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
  'mdi-close-circle': 'XCircle',
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
  'mdi-cog-outline': 'Settings',
  'mdi-code-braces': 'Code',
  'mdi-code-tags': 'Code2',
  'mdi-form-textbox-password': 'KeyRound',
  'mdi-magnify': 'Search',
  'mdi-magnify-plus-outline': 'ZoomIn',
  'mdi-eye': 'Eye',
  'mdi-eye-off': 'EyeOff',
  'mdi-close-octagon-outline': 'XOctagon',
  'mdi-qrcode': 'QrCode',
  'mdi-qrcode-scan': 'ScanLine',
  'mdi-help-circle-outline': 'HelpCircle',

  // Lists & Organization
  'mdi-table': 'Table',
  'mdi-format-list-bulleted': 'List',
  'mdi-format-list-bulleted-type': 'ListOrdered',
  'mdi-folder': 'Folder',
  'mdi-tag': 'Tag',
  'mdi-lightbulb': 'Lightbulb',
  'mdi-lightbulb-on-outline': 'Lightbulb',

  // Misc
  'mdi-calendar': 'Calendar',
  'mdi-map-marker': 'MapPin',
  'mdi-memory': 'Cpu',

  // Theme toggle icons
  'mdi-white-balance-sunny': 'Sun',
  'mdi-moon-waning-crescent': 'Moon',
  'mdi-auto-fix': 'Sparkles',

  // Technology/Framework icons (brand icons → generic equivalents)
  'mdi-vuejs': 'Box',             // Vue.js → Box/Component icon
  'mdi-material-design': 'Palette', // Material Design → Palette
  'mdi-cog-sync': 'Cog',          // Settings/Sync → Cog

  // Metadata Editor icons (EXIF/Image metadata)
  'mdi-account': 'User',
  'mdi-application': 'FileCode',
  'mdi-arrow-left-right': 'ArrowLeftRight',
  'mdi-arrow-up-down': 'ArrowUpDown',
  'mdi-barcode': 'Barcode',
  'mdi-blur': 'Circle',
  'mdi-brightness-4': 'SunDim',
  'mdi-brightness-5': 'SunMedium',
  'mdi-brightness-6': 'Sun',
  'mdi-calendar-clock': 'CalendarClock',
  'mdi-calendar-edit': 'Calendar',
  'mdi-calendar-import': 'Calendar',
  'mdi-camera-iris': 'Camera',
  'mdi-clock': 'Clock',
  'mdi-clock-fast': 'Clock',
  'mdi-compass': 'Compass',
  'mdi-contrast-box': 'Contrast',
  'mdi-copyright': 'Copyright',
  'mdi-crop': 'Crop',
  'mdi-elevation-rise': 'Mountain',
  'mdi-fingerprint': 'Fingerprint',
  'mdi-flash': 'Zap',
  'mdi-gamma': 'SunMoon',
  'mdi-grain': 'Grid2x2',
  'mdi-incognito': 'EyeOff',
  'mdi-invert-colors': 'Droplet',
  'mdi-map': 'Map',
  'mdi-map-marker-check': 'MapPinCheck',
  'mdi-map-marker-distance': 'MapPin',
  'mdi-message-text': 'MessageSquareText',
  'mdi-phone-rotate-landscape': 'Smartphone',
  'mdi-ruler': 'Ruler',
  'mdi-satellite-variant': 'Satellite',
  'mdi-speedometer': 'Gauge',
  'mdi-timer': 'Timer',
  'mdi-white-balance-auto': 'SunMoon',
  'mdi-zip-box': 'Archive',

  // PNG metadata icons
  'mdi-format-title': 'Heading1',
  'mdi-comment-text': 'MessageSquare',
  'mdi-source-branch': 'GitBranch',
  'mdi-xml': 'FileType',
  'mdi-clock-outline': 'Clock',
  'mdi-text-box': 'FileText',

  // HexViewer specific icons
  'mdi-hexadecimal': 'Hash',
  'mdi-numeric': 'Binary',
  'mdi-arrow-right-circle': 'ArrowRightCircle',
  'mdi-file-eye': 'FileSearch',
  'mdi-selection': 'Square',
  'mdi-chevron-left': 'ChevronLeft',
  'mdi-chevron-right': 'ChevronRight',

  // About page icons
  'mdi-numeric-1-circle': 'Circle',  // Note: Lucide doesn't have numbered circles, using plain circle
  'mdi-numeric-2-circle': 'Circle',
  'mdi-numeric-3-circle': 'Circle',
  'mdi-numeric-4-circle': 'Circle',
  'mdi-heart': 'Heart',

  // Table & Data icons
  'mdi-table-off': 'TableProperties',

  // Additional security icons
  'mdi-shield-check-outline': 'ShieldCheck',
}

// Create Lucide icon set for Vuetify
const lucideIconSet = {
  component: (props) => {
    let iconName = props.icon

    // Step 1: If it's an MDI icon (backward compatibility), map it to Lucide
    if (typeof iconName === 'string' && iconName.startsWith('mdi-')) {
      iconName = iconMap[iconName] || null
    }

    // Step 2: Convert kebab-case to PascalCase for Lucide
    // This supports direct Lucide names like 'lock-open' → 'LockOpen'
    if (typeof iconName === 'string' && iconName.includes('-')) {
      iconName = iconName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')
    }

    // Step 3: Icon name is already in PascalCase (from ICONS constants or direct usage)
    // No transformation needed, just look it up

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

    // No icon found - log warning in development
    if (import.meta.env.DEV) {
      console.warn(`Icon not found: ${props.icon} (original: ${props.icon})`)
    }
    return null
  }
}

const vuetify = createVuetify({
  components,
  directives,
  blueprint: md2,
  icons: {
    defaultSet: 'lucide',
    aliases: {
      checkboxOn: 'CheckSquare',
      checkboxOff: 'Square',
      checkboxIndeterminate: 'MinusSquare',
      radioOn: 'CheckCircle',
      radioOff: 'Circle',
    },
    sets: {
      lucide: lucideIconSet,
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
    VSelect: {
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
