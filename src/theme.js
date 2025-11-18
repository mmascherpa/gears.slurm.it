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

// Default palette - "Forest Tech" - https://coolors.co/5f8a6f-4a7058-2e3b34-3a7ca5-2c5f7f
const DEFAULT_PALETTE = {
  sage: '#5F8A6F',          // Rich forest green (was #73877B)
  sageAccent: '#4A7058',    // Darker sage for variety
  coffee: '#2E3B34',        // Dark forest green (was #402E2A brown)
  tealBlue: '#3A7CA5',      // Tech teal (was #4464AD royal blue)
  deepTeal: '#2C5F7F',      // Deep teal (was #3943B7)
  silver: '#BDBBB6',
  white: '#FFFFFF',
  black: '#000000',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#3A7CA5',          // Use teal for info too
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
  // Opacity controls
  'border-opacity': 0.12,
  'high-emphasis-opacity': 0.87,
  'medium-emphasis-opacity': 0.60,
  'disabled-opacity': 0.38,
  'activated-opacity': 0.12,
  'hover-opacity': 0.08,
  'focus-opacity': 0.12,
  'selected-opacity': 0.16,

  // Spacing scale (modern minimalist - generous breathing room)
  'spacing-xs': '4px',
  'spacing-sm': '8px',
  'spacing-md': '16px',
  'spacing-lg': '24px',
  'spacing-xl': '32px',
  'spacing-2xl': '48px',

  // Border radius (subtle rounded corners for modern feel)
  'border-radius-sm': '4px',
  'border-radius-md': '8px',
  'border-radius-lg': '12px',
  'border-radius-xl': '16px',

  // Shadow definitions (subtle elevations)
  'shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  'shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  'shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  'shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
}

// ============================================================================
// THEME CONFIGURATIONS
// ============================================================================

export const themes = {
  // Default (Light) Theme - "Forest Tech"
  default: {
    dark: false,
    colors: {
      primary: DEFAULT_PALETTE.sage,
      'primary-darken-1': DEFAULT_PALETTE.sageAccent,
      secondary: DEFAULT_PALETTE.tealBlue,
      'secondary-darken-1': DEFAULT_PALETTE.deepTeal,
      background: '#F7F9F8',        // Subtle green tint (was #FAFAFA)
      surface: DEFAULT_PALETTE.white,
      'surface-bright': DEFAULT_PALETTE.white,
      'surface-light': '#F5F5F5',
      'surface-variant': '#DFE8E3',  // Greener tint (was #E8E6E3)
      'on-surface-variant': DEFAULT_PALETTE.coffee,
      'on-primary': DEFAULT_PALETTE.white,
      'on-secondary': DEFAULT_PALETTE.white,
      success: DEFAULT_PALETTE.success,
      error: DEFAULT_PALETTE.error,
      warning: DEFAULT_PALETTE.warning,
      info: DEFAULT_PALETTE.info,
      blue: DEFAULT_PALETTE.tealBlue,
      'blue-darken-2': DEFAULT_PALETTE.deepTeal,
      green: DEFAULT_PALETTE.sage,
      'green-darken-2': DEFAULT_PALETTE.sageAccent,
      grey: '#9E9E9E',

      // Semantic color tokens for consistent usage
      'text-primary': DEFAULT_PALETTE.coffee,
      'text-secondary': '#5A6D62',   // Forest-toned grey (was #666666)
      'text-muted': '#8A9D93',       // Sage-toned muted (was #999999)
      'border-subtle': '#D5E0D8',    // Green-tinted border (was #E0E0E0)
      'overlay-light': 'rgba(255, 255, 255, 0.9)',
      'overlay-dark': 'rgba(0, 0, 0, 0.6)',
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

  // Dark Theme - "Forest Tech Dark"
  dark: {
    dark: true,
    colors: {
      primary: '#7AAA8A',           // Lighter forest green for dark mode (updated)
      'primary-darken-1': '#5F8A6F',
      secondary: '#5B9AC9',         // Brighter teal for dark mode (updated)
      'secondary-darken-1': '#3A7CA5',
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

      // Semantic color tokens for dark mode
      'text-primary': '#E0E0E0',
      'text-secondary': '#B0B0B0',
      'text-muted': '#808080',
      'border-subtle': '#404040',
      'overlay-light': 'rgba(255, 255, 255, 0.1)',
      'overlay-dark': 'rgba(0, 0, 0, 0.8)',
    },
    variables: {
      ...COMMON_VARIABLES,
      'border-color': '#FFFFFF',
      'theme-kbd': '#424242',
      'theme-on-kbd': '#FFFFFF',
      'theme-code': '#2C2C2C',
      'theme-on-code': '#E0E0E0',
      // Dark mode specific shadows (lighter for visibility)
      'shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
      'shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
      'shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
      'shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
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

      // Semantic color tokens for crazy theme (high contrast on bright background)
      'text-primary': '#1A1A1A',
      'text-secondary': '#333333',
      'text-muted': '#666666',
      'border-subtle': 'rgba(0, 0, 0, 0.2)',
      'overlay-light': 'rgba(255, 255, 255, 0.8)',
      'overlay-dark': 'rgba(0, 0, 0, 0.7)',
    },
    variables: {
      ...COMMON_VARIABLES,
      'border-color': '#000000',
      'theme-kbd': '#212529',
      'theme-on-kbd': '#FFFFFF',
      'theme-code': '#F5F5F5',
      'theme-on-code': '#000000',
      // Crazy theme shadows (darker for contrast on bright cyan)
      'shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.15)',
      'shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.12)',
      'shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
      'shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
    }
  }
}
