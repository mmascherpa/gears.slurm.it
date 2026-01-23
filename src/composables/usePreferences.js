/**
 * Composable for persistent user preferences
 *
 * Provides reactive state that automatically persists to localStorage.
 * Each tool has isolated preferences using namespaced storage keys.
 * Gracefully handles localStorage errors (e.g., private browsing mode).
 *
 * @param {string} toolName - Unique tool identifier (e.g., 'password-generator')
 * @param {Object} defaults - Default preference values with their types
 * @returns {Object} Reactive preferences object with auto-save
 *
 * @example
 * const { preferences } = usePreferences('password-generator', {
 *   length: 16,
 *   includeUppercase: true,
 *   includeLowercase: true
 * });
 *
 * // Use preferences reactively
 * preferences.length = 24; // Auto-saves to localStorage
 *
 * // In template: v-model="preferences.length"
 */
import { reactive, watch } from 'vue';

const STORAGE_PREFIX = 'slurm-pref-';

/**
 * Reads preferences from localStorage
 * @param {string} key - Storage key
 * @returns {Object|null} Parsed preferences or null
 */
function readFromStorage(key) {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn(`Failed to read preferences from localStorage (${key}):`, error);
  }
  return null;
}

/**
 * Writes preferences to localStorage
 * @param {string} key - Storage key
 * @param {Object} data - Preferences to store
 */
function writeToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn(`Failed to save preferences to localStorage (${key}):`, error);
  }
}

/**
 * Validates and coerces a stored value to match the expected type
 * @param {*} value - Stored value
 * @param {*} defaultValue - Default value (determines expected type)
 * @returns {*} Validated value or default
 */
function validateValue(value, defaultValue) {
  if (value === null || value === undefined) {
    return defaultValue;
  }

  const expectedType = typeof defaultValue;
  const actualType = typeof value;

  if (expectedType !== actualType) {
    return defaultValue;
  }

  // For numbers, ensure value is finite and reasonable
  if (expectedType === 'number' && !Number.isFinite(value)) {
    return defaultValue;
  }

  return value;
}

export function usePreferences(toolName, defaults) {
  const storageKey = `${STORAGE_PREFIX}${toolName}`;

  // Load stored preferences, merging with defaults
  const stored = readFromStorage(storageKey);
  const initial = { ...defaults };

  // Apply stored values, validating each against defaults
  if (stored && typeof stored === 'object') {
    for (const key of Object.keys(defaults)) {
      if (key in stored) {
        initial[key] = validateValue(stored[key], defaults[key]);
      }
    }
  }

  // Create reactive preferences object
  const preferences = reactive(initial);

  // Watch for changes and persist
  watch(
    () => ({ ...preferences }),
    (newPrefs) => {
      writeToStorage(storageKey, newPrefs);
    },
    { deep: true }
  );

  /**
   * Resets all preferences to their default values
   */
  const resetPreferences = () => {
    for (const key of Object.keys(defaults)) {
      preferences[key] = defaults[key];
    }
  };

  return {
    preferences,
    resetPreferences
  };
}
