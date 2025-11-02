/**
 * Service Worker Registration Module
 *
 * Registers the service worker and sets up periodic update checks.
 * This runs independently of the Vue app to ensure PWA functionality
 * is available as early as possible.
 */

import { DEBUG, debugLog, debugWarn } from './utils/debug.js';

// Store the registration promise globally so the composable can access it
let registrationPromise = null;

/**
 * Get the service worker registration (promise that resolves when ready)
 * @returns {Promise<ServiceWorkerRegistration|null>}
 */
export function getServiceWorkerRegistration() {
  return registrationPromise;
}

/**
 * Register the service worker and set up update checking
 */
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    debugWarn('[SW] Service workers are not supported in this browser');
    registrationPromise = Promise.resolve(null);
    return;
  }

  // Create the registration promise immediately
  registrationPromise = new Promise((resolve) => {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          debugLog('[SW] Registration successful');
          resolve(registration);

          // Check for updates periodically (every hour)
          // Only checks when online to avoid unnecessary errors
          setInterval(() => {
            if (navigator.onLine) {
              debugLog('[SW] Periodic update check');
              registration.update().catch(err => {
                debugWarn('[SW] Periodic update check failed:', err);
              });
            }
          }, 60 * 60 * 1000); // 1 hour in milliseconds

          // Optional: Check for updates when the page becomes visible again
          // This catches updates when users return to the tab after a while
          document.addEventListener('visibilitychange', () => {
            if (!document.hidden && navigator.onLine) {
              debugLog('[SW] Visibility change update check');
              registration.update().catch(err => {
                debugWarn('[SW] Visibility update check failed:', err);
              });
            }
          });
        })
        .catch(err => {
          console.error('[SW] Registration failed:', err);
          resolve(null);
        });
    });
  });
}
