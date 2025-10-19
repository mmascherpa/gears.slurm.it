/**
 * Slurm Tools Color Configuration
 *
 * Centralized color palette for easy theme customization.
 * Based on: https://coolors.co/73877b-402e2a-bdbbb6-4464ad-3943b7
 *
 * To change the app's color scheme, modify the values in this file.
 */

export const colorPalette = {
  // Primary colors from palette
  sage: '#73877B',        // Xanadu - muted sage green
  coffee: '#402E2A',      // Dark brown/coffee
  silver: '#BDBBB6',      // Silver/light gray
  royalBlue: '#4464AD',   // Royal blue
  deepBlue: '#3943B7',    // Deeper blue

  // Extended palette for UI needs
  white: '#FFFFFF',
  black: '#000000',

  // Semantic colors (can be customized)
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
}

/**
 * Theme configuration
 * Maps semantic color names to palette colors
 */
export const themeConfig = {
  // Main brand colors
  primary: colorPalette.sage,
  primaryDark: colorPalette.coffee,

  // Secondary/accent colors
  secondary: colorPalette.royalBlue,
  secondaryDark: colorPalette.deepBlue,

  // Surface colors
  background: colorPalette.silver,
  surface: colorPalette.white,

  // Semantic colors
  success: colorPalette.success,
  warning: colorPalette.warning,
  error: colorPalette.error,
  info: colorPalette.info,
}

export default themeConfig
