/**
 * Slurm Tools Vuetify Theme Configuration
 *
 * Imports color configuration from centralized config file.
 * To customize colors, edit: src/config/colors.js
 */

import { colorPalette, themeConfig } from './config/colors.js'

export { slurmTheme }

const slurmTheme = {
  // Color palette from https://coolors.co/73877b-402e2a-bdbbb6-4464ad-3943b7
  colors: {
    // Main brand colors
    primary: themeConfig.primary,           // #73877B - Sage green
    'primary-darken-1': themeConfig.primaryDark,  // #402E2A - Dark brown

    // Secondary/accent colors
    secondary: themeConfig.secondary,       // #4464AD - Royal blue
    'secondary-darken-1': themeConfig.secondaryDark, // #3943B7 - Deep blue

    // Background and surface colors
    background: '#FAFAFA',
    surface: colorPalette.white,
    'surface-bright': colorPalette.white,
    'surface-light': '#F5F5F5',
    'surface-variant': '#E8E6E3',          // Lighter version of silver

    // Text colors
    'on-surface-variant': colorPalette.coffee,
    'on-primary': colorPalette.white,
    'on-secondary': colorPalette.white,

    // Semantic colors
    success: themeConfig.success,
    error: themeConfig.error,
    warning: themeConfig.warning,
    info: themeConfig.info,

    // Additional UI colors
    blue: themeConfig.secondary,
    'blue-darken-2': themeConfig.secondaryDark,
    green: themeConfig.success,
    'green-darken-2': '#388E3C',
    grey: '#9E9E9E',
  },

  variables: {
    'border-color': colorPalette.coffee,
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
    'theme-kbd': colorPalette.coffee,
    'theme-on-kbd': colorPalette.white,
    'theme-code': colorPalette.silver,
    'theme-on-code': colorPalette.coffee,
  }
}
  
