/**
 * Centralized Icon Registry
 *
 * This file provides semantic icon names mapped to Lucide icon component names.
 * Benefits:
 * - Single source of truth for all icons in the application
 * - Easy to change icon library in the future (update this file only)
 * - Semantic naming makes code more readable (LOCK vs 'mdi-lock')
 * - Type-safe with IDE autocomplete
 * - Easy to audit unused icons
 *
 * Usage in components:
 * import { ICONS } from '@/constants/icons'
 * <v-icon :icon="ICONS.LOCK"></v-icon>
 *
 * Usage in utilities/configs:
 * import { ICONS } from '@/constants/icons'
 * { label: 'Title', icon: ICONS.TITLE, ... }
 */

export const ICONS = {
  // ==================== NAVIGATION ====================
  HOME: 'Home',
  MENU: 'Menu',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  ARROW_RIGHT_CIRCLE: 'ArrowRightCircle',
  ARROW_UP: 'ChevronUp',
  ARROW_DOWN: 'ChevronDown',
  CHEVRON_LEFT: 'ChevronLeft',
  CHEVRON_RIGHT: 'ChevronRight',
  CHEVRON_UP: 'ChevronUp',
  CHEVRON_DOWN: 'ChevronDown',
  MORE_VERTICAL: 'MoreVertical',
  CLOSE: 'X',

  // ==================== SECURITY & PRIVACY ====================
  LOCK: 'Lock',
  LOCK_OPEN: 'LockOpen',
  LOCK_KEYHOLE: 'LockKeyhole',
  UNLOCK: 'LockOpen',
  SHIELD: 'Shield',
  SHIELD_CHECK: 'ShieldCheck',
  KEY: 'Key',
  KEY_ROUND: 'KeyRound',
  PASSWORD: 'KeyRound',
  FINGERPRINT: 'Fingerprint',

  // ==================== FILES & UPLOAD/DOWNLOAD ====================
  FILE: 'File',
  FILE_TEXT: 'FileText',
  FILE_CODE: 'FileCode',
  FILE_LOCK: 'FileLock',
  FILE_TYPE: 'FileType',
  FILE_SEARCH: 'FileSearch',
  FILE_EYE: 'FileSearch',
  FOLDER: 'Folder',
  DOWNLOAD: 'Download',
  UPLOAD: 'Upload',
  SAVE: 'Save',
  PAPERCLIP: 'Paperclip',
  ARCHIVE: 'Archive',

  // ==================== IMAGES & MEDIA ====================
  IMAGE: 'Image',
  IMAGE_ICON: 'ImageIcon',
  IMAGE_PLUS: 'ImagePlus',
  IMAGE_OFF: 'ImageOff',
  CAMERA: 'Camera',
  CROP: 'Crop',
  MOUNTAIN: 'Mountain',

  // ==================== EDITING & ACTIONS ====================
  PENCIL: 'Pencil',
  PENCIL_LINE: 'PencilLine',
  EDIT: 'Pencil',
  DELETE: 'Trash2',
  TRASH: 'Trash2',
  COPY: 'Copy',
  PASTE: 'ClipboardPaste',
  REFRESH: 'RefreshCw',
  UNDO: 'Undo',
  RESTORE: 'RotateCcw',
  ROTATE: 'RotateCcw',
  ERASER: 'Eraser',
  PLUS: 'Plus',
  PLUS_CIRCLE: 'PlusCircle',
  ADD: 'Plus',

  // ==================== STATUS & FEEDBACK ====================
  CHECK: 'Check',
  CHECK_CIRCLE: 'CheckCircle',
  SUCCESS: 'CheckCircle',
  ERROR: 'XCircle',
  ALERT: 'AlertCircle',
  ALERT_CIRCLE: 'AlertCircle',
  WARNING: 'AlertCircle',
  INFO: 'Info',
  HELP: 'HelpCircle',
  QUESTION: 'HelpCircle',

  // ==================== UI ELEMENTS ====================
  EYE: 'Eye',
  EYE_OFF: 'EyeOff',
  VISIBLE: 'Eye',
  HIDDEN: 'EyeOff',
  SEARCH: 'Search',
  ZOOM_IN: 'ZoomIn',
  SETTINGS: 'Settings',
  COG: 'Settings',
  LIGHTBULB: 'Lightbulb',
  SPARKLES: 'Sparkles',

  // ==================== CODE & DEVELOPMENT ====================
  CODE: 'Code',
  CODE_2: 'Code2',
  BARCODE: 'Barcode',
  QR_CODE: 'QrCode',
  QRCODE: 'QrCode',
  QR_SCAN: 'ScanLine',
  HEXADECIMAL: 'Hash',
  HASH: 'Hash',
  NUMERIC: 'Binary',
  BINARY: 'Binary',
  SELECTION: 'Square',

  // ==================== LISTS & ORGANIZATION ====================
  TABLE: 'Table',
  TABLE_OFF: 'TableProperties',
  TABLE_PROPERTIES: 'TableProperties',
  LIST: 'List',
  LIST_ORDERED: 'ListOrdered',
  TAG: 'Tag',
  GRID: 'Grid2x2',

  // ==================== NETWORK & CONNECTIVITY ====================
  WIFI: 'Wifi',
  WIFI_OFF: 'WifiOff',
  SERVER_OFF: 'ServerOff',
  DATABASE: 'DatabaseZap',

  // ==================== THEME & APPEARANCE ====================
  SUN: 'Sun',
  MOON: 'Moon',
  SUN_DIM: 'SunDim',
  SUN_MEDIUM: 'SunMedium',
  SUN_MOON: 'SunMoon',
  THEME_AUTO: 'SunMoon',
  PALETTE: 'Palette',
  CONTRAST: 'Contrast',
  BRIGHTNESS: 'Sun',
  DROPLET: 'Droplet',

  // ==================== METADATA & EXIF ====================
  TITLE: 'Heading1',
  HEADING: 'Heading1',
  TEXT_BOX: 'FileText',
  COMMENT: 'MessageSquare',
  MESSAGE: 'MessageSquareText',
  USER: 'User',
  ACCOUNT: 'User',
  CALENDAR: 'Calendar',
  CALENDAR_CLOCK: 'CalendarClock',
  CLOCK: 'Clock',
  TIMER: 'Timer',
  MAP: 'Map',
  MAP_PIN: 'MapPin',
  MAP_PIN_CHECK: 'MapPinCheck',
  LOCATION: 'MapPin',
  COMPASS: 'Compass',
  RULER: 'Ruler',
  SATELLITE: 'Satellite',
  COPYRIGHT: 'Copyright',
  GIT_BRANCH: 'GitBranch',
  SOURCE: 'GitBranch',
  SMARTPHONE: 'Smartphone',
  GAUGE: 'Gauge',
  SPEEDOMETER: 'Gauge',
  CPU: 'Cpu',
  MEMORY: 'Cpu',
  FLASH: 'Zap',
  ZAP: 'Zap',

  // ==================== NUMBERS & CIRCLES ====================
  // Note: Lucide doesn't have numbered circles like Material Icons
  // Using plain Circle as fallback - consider custom implementation if needed
  CIRCLE: 'Circle',
  CIRCLE_1: 'Circle',
  CIRCLE_2: 'Circle',
  CIRCLE_3: 'Circle',
  CIRCLE_4: 'Circle',
  NUMBER_1: 'Circle',
  NUMBER_2: 'Circle',
  NUMBER_3: 'Circle',
  NUMBER_4: 'Circle',

  // ==================== MISCELLANEOUS ====================
  HEART: 'Heart',
  WRENCH: 'Wrench',
  TOOLBOX: 'Wrench',
  BOX: 'Box',
  COMPONENT: 'Box',
}

/**
 * Legacy MDI icon name mappings for backward compatibility
 * Maps old mdi-* names to semantic ICONS constants
 *
 * @deprecated Use ICONS constants directly in new code
 */
export const MDI_TO_SEMANTIC = {
  'mdi-lock': ICONS.LOCK,
  'mdi-lock-open': ICONS.LOCK_OPEN,
  'mdi-shield-check': ICONS.SHIELD_CHECK,
  'mdi-shield-key': ICONS.SHIELD_CHECK,
  'mdi-download': ICONS.DOWNLOAD,
  'mdi-upload': ICONS.UPLOAD,
  'mdi-file': ICONS.FILE,
  'mdi-image': ICONS.IMAGE,
  'mdi-qrcode': ICONS.QR_CODE,
  'mdi-home': ICONS.HOME,
  'mdi-menu': ICONS.MENU,
  'mdi-eye': ICONS.EYE,
  'mdi-eye-off': ICONS.EYE_OFF,
  'mdi-pencil': ICONS.PENCIL,
  'mdi-delete': ICONS.DELETE,
  'mdi-copy': ICONS.COPY,
  'mdi-check': ICONS.CHECK,
  'mdi-alert': ICONS.ALERT,
  'mdi-information': ICONS.INFO,
  'mdi-cog': ICONS.SETTINGS,
  'mdi-moon-waning-crescent': ICONS.MOON,
  'mdi-white-balance-sunny': ICONS.SUN,
  // Add more as needed
}

/**
 * Icon categories for documentation and organization
 */
export const ICON_CATEGORIES = {
  NAVIGATION: [
    'HOME', 'MENU', 'ARROW_LEFT', 'ARROW_RIGHT', 'CHEVRON_LEFT',
    'CHEVRON_RIGHT', 'CHEVRON_UP', 'CHEVRON_DOWN'
  ],
  SECURITY: [
    'LOCK', 'LOCK_OPEN', 'SHIELD', 'SHIELD_CHECK', 'KEY',
    'PASSWORD', 'FINGERPRINT'
  ],
  FILES: [
    'FILE', 'FILE_TEXT', 'FILE_CODE', 'FILE_LOCK', 'FOLDER',
    'DOWNLOAD', 'UPLOAD', 'SAVE'
  ],
  IMAGES: [
    'IMAGE', 'IMAGE_ICON', 'IMAGE_PLUS', 'CAMERA', 'CROP'
  ],
  EDITING: [
    'PENCIL', 'EDIT', 'DELETE', 'COPY', 'PASTE', 'UNDO', 'RESTORE'
  ],
  STATUS: [
    'CHECK', 'SUCCESS', 'ERROR', 'ALERT', 'WARNING', 'INFO', 'HELP'
  ],
  CODE: [
    'CODE', 'BARCODE', 'QR_CODE', 'HASH', 'BINARY'
  ],
  THEME: [
    'SUN', 'MOON', 'PALETTE', 'CONTRAST'
  ]
}

export default ICONS
