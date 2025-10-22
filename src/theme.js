/**
 * Slurm Tools Vuetify Theme Configuration
 *
 * Supports three theme modes: Default (Light), Dark, and Crazy (original bright palette).
 * Theme preference is persisted in localStorage.
 */

// ============================================================================
// THEME MODES - Available theme options
// ============================================================================

export const THEME_MODES = {
  DEFAULT: 'default',
  DARK: 'dark',
  CRAZY: 'crazy'
}

// ============================================================================
// COLOR PALETTES
// ============================================================================

// Default palette - https://coolors.co/73877b-402e2a-bdbbb6-4464ad-3943b7
const DEFAULT_PALETTE = {
  sage: '#73877B',
  coffee: '#402E2A',
  royalBlue: '#4464AD',
  deepBlue: '#3943B7',
  silver: '#BDBBB6',
  white: '#FFFFFF',
  black: '#000000',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
}

// Crazy palette (original) - https://coolors.co/0caee9-92b257-718c40-754668-59364f
const CRAZY_PALETTE = {
  brightCyan: '#0CAEE9',
  limeGreen: '#92B257',
  oliveGreen: '#718C40',
  plum: '#754668',
  darkPlum: '#59364F',
  error: '#BA1200',
  warning: '#EE964B',
}

// ============================================================================
// COMMON THEME VARIABLES
// ============================================================================

const COMMON_VARIABLES = {
  'border-opacity': 0.12,
  'high-emphasis-opacity': 0.87,
  'medium-emphasis-opacity': 0.60,
  'disabled-opacity': 0.38,
}

// ============================================================================
// THEME CONFIGURATIONS
// ============================================================================

export const themes = {
  // Default (Light) Theme
  default: {
    dark: false,
    colors: {
      primary: DEFAULT_PALETTE.sage,
      'primary-darken-1': DEFAULT_PALETTE.coffee,
      secondary: DEFAULT_PALETTE.royalBlue,
      'secondary-darken-1': DEFAULT_PALETTE.deepBlue,
      background: '#FAFAFA',
      surface: DEFAULT_PALETTE.white,
      'surface-bright': DEFAULT_PALETTE.white,
      'surface-light': '#F5F5F5',
      'surface-variant': '#E8E6E3',
      'on-surface-variant': DEFAULT_PALETTE.coffee,
      'on-primary': DEFAULT_PALETTE.white,
      'on-secondary': DEFAULT_PALETTE.white,
      success: DEFAULT_PALETTE.success,
      error: DEFAULT_PALETTE.error,
      warning: DEFAULT_PALETTE.warning,
      info: DEFAULT_PALETTE.info,
      blue: DEFAULT_PALETTE.royalBlue,
      'blue-darken-2': DEFAULT_PALETTE.deepBlue,
      green: DEFAULT_PALETTE.success,
      'green-darken-2': '#388E3C',
      grey: '#9E9E9E',
    },
    variables: {
      ...COMMON_VARIABLES,
      'border-color': DEFAULT_PALETTE.coffee,
      'theme-kbd': DEFAULT_PALETTE.coffee,
      'theme-on-kbd': DEFAULT_PALETTE.white,
      'theme-code': DEFAULT_PALETTE.silver,
      'theme-on-code': DEFAULT_PALETTE.coffee,
    }
  },

  // Dark Theme
  dark: {
    dark: true,
    colors: {
      primary: '#8FA599',           // Lighter sage for dark mode
      'primary-darken-1': '#5C6B63',
      secondary: '#5C7BC4',         // Brighter royal blue
      'secondary-darken-1': '#4464AD',
      background: '#121212',        // Material Design dark
      surface: '#1E1E1E',
      'surface-bright': '#2C2C2C',
      'surface-light': '#1A1A1A',
      'surface-variant': '#2C2C2C',
      'on-surface-variant': '#E0E0E0',
      'on-primary': '#000000',
      'on-secondary': '#FFFFFF',
      success: '#66BB6A',
      error: '#EF5350',
      warning: '#FFA726',
      info: '#42A5F5',
      blue: '#5C7BC4',
      'blue-darken-2': '#4464AD',
      green: '#66BB6A',
      'green-darken-2': '#4CAF50',
      grey: '#757575',
    },
    variables: {
      ...COMMON_VARIABLES,
      'border-color': '#FFFFFF',
      'theme-kbd': '#424242',
      'theme-on-kbd': '#FFFFFF',
      'theme-code': '#2C2C2C',
      'theme-on-code': '#E0E0E0',
    }
  },

  // Crazy Theme (Original bright palette)
  crazy: {
    dark: false,
    colors: {
      primary: CRAZY_PALETTE.limeGreen,
      'primary-darken-1': CRAZY_PALETTE.oliveGreen,
      secondary: CRAZY_PALETTE.plum,
      'secondary-darken-1': CRAZY_PALETTE.darkPlum,
      background: CRAZY_PALETTE.brightCyan,
      surface: CRAZY_PALETTE.brightCyan,
      'surface-bright': CRAZY_PALETTE.brightCyan,
      'surface-light': '#EEEEEE',
      'surface-variant': '#424242',
      'on-surface-variant': '#EEEEEE',
      'on-primary': '#FFFFFF',
      'on-secondary': '#FFFFFF',
      success: CRAZY_PALETTE.limeGreen,
      error: CRAZY_PALETTE.error,
      warning: CRAZY_PALETTE.warning,
      info: CRAZY_PALETTE.darkPlum,
      blue: CRAZY_PALETTE.plum,
      'blue-darken-2': CRAZY_PALETTE.darkPlum,
      green: CRAZY_PALETTE.limeGreen,
      'green-darken-2': CRAZY_PALETTE.oliveGreen,
      grey: '#9E9E9E',
    },
    variables: {
      ...COMMON_VARIABLES,
      'border-color': '#000000',
      'theme-kbd': '#212529',
      'theme-on-kbd': '#FFFFFF',
      'theme-code': '#F5F5F5',
      'theme-on-code': '#000000',
    }
  }
}
