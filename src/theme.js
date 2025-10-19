/**
 * Slurm Tools Vuetify Theme Configuration
 *
 * Centralized theme and color configuration.
 * To customize the app's appearance, modify the COLOR_PALETTE object below.
 */

export { slurmTheme }

// ============================================================================
// COLOR PALETTE - Customize your app's colors here
// ============================================================================
// Based on: https://coolors.co/73877b-402e2a-bdbbb6-4464ad-3943b7

const COLOR_PALETTE = {
  // Primary colors (used for encryption tools)
  sage: '#73877B',        // Muted sage green
  coffee: '#402E2A',      // Dark brown/coffee

  // Secondary colors (used for encoding tools)
  royalBlue: '#4464AD',   // Royal blue
  deepBlue: '#3943B7',    // Deeper blue

  // Neutral colors
  silver: '#BDBBB6',      // Silver/light gray
  white: '#FFFFFF',
  black: '#000000',

  // Semantic colors (success, error, etc.)
  success: '#4CAF50',     // Green
  warning: '#FF9800',     // Orange
  error: '#F44336',       // Red
  info: '#2196F3',        // Blue
}

// ============================================================================
// VUETIFY THEME - Maps palette colors to Vuetify theme properties
// ============================================================================

const slurmTheme = {
  colors: {
    // Main brand colors
    primary: COLOR_PALETTE.sage,                    // #73877B - Sage green
    'primary-darken-1': COLOR_PALETTE.coffee,       // #402E2A - Dark brown

    // Secondary/accent colors
    secondary: COLOR_PALETTE.royalBlue,             // #4464AD - Royal blue
    'secondary-darken-1': COLOR_PALETTE.deepBlue,   // #3943B7 - Deep blue

    // Background and surface colors
    background: '#FAFAFA',
    surface: COLOR_PALETTE.white,
    'surface-bright': COLOR_PALETTE.white,
    'surface-light': '#F5F5F5',
    'surface-variant': '#E8E6E3',                   // Lighter version of silver

    // Text colors
    'on-surface-variant': COLOR_PALETTE.coffee,
    'on-primary': COLOR_PALETTE.white,
    'on-secondary': COLOR_PALETTE.white,

    // Semantic colors
    success: COLOR_PALETTE.success,
    error: COLOR_PALETTE.error,
    warning: COLOR_PALETTE.warning,
    info: COLOR_PALETTE.info,

    // Additional UI colors (aliases for convenience)
    blue: COLOR_PALETTE.royalBlue,
    'blue-darken-2': COLOR_PALETTE.deepBlue,
    green: COLOR_PALETTE.success,
    'green-darken-2': '#388E3C',
    grey: '#9E9E9E',
  },

  variables: {
    'border-color': COLOR_PALETTE.coffee,
    'border-opacity': 0.12,
    'high-emphasis-opacity': 0.87,
    'medium-emphasis-opacity': 0.60,
    'disabled-opacity': 0.38,
    'idle-opacity': 0.04,
    'hover-opacity': 0.08,
    'focus-opacity': 0.12,
    'selected-opacity': 0.12,
    'activated-opacity': 0.16,
    'pressed-opacity': 0.14,
    'dragged-opacity': 0.10,
    'theme-kbd': COLOR_PALETTE.coffee,
    'theme-on-kbd': COLOR_PALETTE.white,
    'theme-code': COLOR_PALETTE.silver,
    'theme-on-code': COLOR_PALETTE.coffee,
  }
}
  
