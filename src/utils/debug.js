/**
 * Debug Utility
 *
 * Centralized debug logging that automatically disables in production builds.
 * Uses Vite's import.meta.env.MODE to detect environment.
 */

// Auto-detect: true in development, false in production
export const DEBUG = import.meta.env.MODE === 'development';

/**
 * Conditional console.log - only logs in development
 * @param {...any} args - Arguments to log
 */
export function debugLog(...args) {
  if (DEBUG) {
    console.log(...args);
  }
}

/**
 * Conditional console.warn - only warns in development
 * @param {...any} args - Arguments to warn
 */
export function debugWarn(...args) {
  if (DEBUG) {
    console.warn(...args);
  }
}

/**
 * Conditional console.error - always logs (errors should be visible in production)
 * @param {...any} args - Arguments to error
 */
export function debugError(...args) {
  console.error(...args);
}

/**
 * Conditional console.info - only logs in development
 * @param {...any} args - Arguments to info
 */
export function debugInfo(...args) {
  if (DEBUG) {
    console.info(...args);
  }
}
