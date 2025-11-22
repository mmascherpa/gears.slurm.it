/**
 * Service Worker Update Detection Composable
 *
 * Handles automatic update detection when the app comes back online.
 * Provides reactive state for update availability and methods to apply updates.
 */

import { ref, onMounted, onUnmounted } from 'vue';
import { getServiceWorkerRegistration } from '../registerServiceWorker.js';
import { debugLog, debugWarn, debugError } from '../utils/debug.js';

export function useServiceWorkerUpdate() {
  const updateAvailable = ref(false);
  const showOnlineNotification = ref(false);
  const isCheckingForUpdate = ref(false);

  let registration = null;
  let onlineHandler = null;
  let offlineHandler = null;
  let updateFoundHandler = null;
  let stateChangeHandler = null;
  let controllerChangeHandler = null;
  let wasOffline = !navigator.onLine;
  let connectionCheckInterval = null;

  /**
   * Test if we actually have network connectivity
   * Browser's navigator.onLine can be unreliable
   */
  const testNetworkConnectivity = async () => {
    try {
      // Try to fetch a small resource with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      await fetch('/favicon.svg', {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return true;
    } catch (error) {
      return false;
    }
  };

  /**
   * Check for service worker updates
   * Called when the app comes back online
   */
  const checkForUpdates = async () => {
    if (!registration || isCheckingForUpdate.value) {
      return;
    }

    try {
      isCheckingForUpdate.value = true;
      console.log('[SW Update] Checking for updates...');

      // Set up a listener for the installing worker before calling update
      const checkInstalling = () => {
        if (registration.installing) {
          console.log('[SW Update] New worker is installing...');
          const installingWorker = registration.installing;

          installingWorker.addEventListener('statechange', function onStateChange() {
            console.log('[SW Update] Installing worker state:', installingWorker.state);

            if (installingWorker.state === 'installed') {
              installingWorker.removeEventListener('statechange', onStateChange);

              if (navigator.serviceWorker.controller) {
                // There's an existing controller, so this is an update
                console.log('[SW Update] Update is ready!');
                updateAvailable.value = true;
              }
            }
          });
        }
      };

      // Check immediately if there's already an installing worker
      checkInstalling();

      // Call update
      await registration.update();

      console.log('[SW Update] Update check completed');

      // Give it time to install and check again
      setTimeout(() => {
        checkInstalling();

        // Also check if there's already a waiting worker
        if (registration.waiting && navigator.serviceWorker.controller) {
          console.log('[SW Update] Found waiting worker after update check');
          updateAvailable.value = true;
        }
      }, 500); // Increased delay to give more time for installation

    } catch (error) {
      console.error('[SW Update] Failed to check for updates:', error);
    } finally {
      isCheckingForUpdate.value = false;
    }
  };

  /**
   * Apply the pending update and reload the page
   */
  const applyUpdate = () => {
    console.log('[SW Update] applyUpdate called');

    // Immediately hide the notification
    updateAvailable.value = false;

    if (!registration) {
      console.error('[SW Update] No registration found');
      return;
    }

    const waitingWorker = registration.waiting;

    if (!waitingWorker) {
      console.error('[SW Update] No waiting service worker found');
      console.log('[SW Update] Registration state:', {
        installing: registration.installing,
        waiting: registration.waiting,
        active: registration.active
      });

      // Try to force an update check
      registration.update().then(() => {
        if (registration.waiting) {
          console.log('[SW Update] Found waiting worker after update check, retrying...');
          // Retry without recursion to avoid dismissing notification again
          const retryWorker = registration.waiting;
          if (retryWorker) {
            retryWorker.postMessage({ type: 'SKIP_WAITING' });
            setupReloadListener();
          }
        } else {
          console.error('[SW Update] Still no waiting worker after update check');
          console.log('[SW Update] Will try reloading anyway...');
          // Fallback: just reload the page
          setTimeout(() => window.location.reload(), 500);
        }
      }).catch(err => {
        console.error('[SW Update] Update check failed:', err);
        // Fallback: just reload the page
        setTimeout(() => window.location.reload(), 500);
      });
      return;
    }

    console.log('[SW Update] Applying update with waiting worker...');

    // Set up the reload listener
    setupReloadListener();

    // Tell the waiting service worker to activate
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  };

  /**
   * Set up listener for controller change to reload the page
   */
  const setupReloadListener = () => {
    let refreshing = false;

    controllerChangeHandler = () => {
      if (!refreshing) {
        refreshing = true;
        console.log('[SW Update] New service worker activated, reloading page...');
        window.location.reload();
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', controllerChangeHandler);

    // Fallback: if controllerchange doesn't fire within 2 seconds, reload anyway
    setTimeout(() => {
      if (!refreshing) {
        console.log('[SW Update] Fallback reload triggered');
        window.location.reload();
      }
    }, 2000);
  };

  /**
   * Dismiss the update notification
   */
  const dismissUpdate = () => {
    updateAvailable.value = false;
  };

  /**
   * Handle online status change
   */
  const handleOnline = async () => {
    console.log('[SW Update] Browser reports online');

    // Verify we actually have connectivity
    const isOnline = await testNetworkConnectivity();

    if (isOnline && wasOffline) {
      console.log('[SW Update] Confirmed back online');
      wasOffline = false;

      // Silently check for updates in the background
      // Don't show "back online" notification - only show if update is found
      setTimeout(() => {
        checkForUpdates();
      }, 1000);
    }
  };

  /**
   * Handle offline status change
   */
  const handleOffline = () => {
    console.log('[SW Update] App is offline');
    wasOffline = true;
    showOnlineNotification.value = false;
  };

  /**
   * Periodically check connection status
   * This catches connectivity changes that don't fire events
   */
  const startConnectionMonitoring = () => {
    connectionCheckInterval = setInterval(async () => {
      const isOnline = navigator.onLine && await testNetworkConnectivity();

      if (isOnline && wasOffline) {
        console.log('[SW Update] Connection restored (detected by polling)');
        handleOnline();
      } else if (!isOnline && !wasOffline) {
        console.log('[SW Update] Connection lost (detected by polling)');
        handleOffline();
      }
    }, 30000); // Check every 30 seconds
  };

  /**
   * Stop connection monitoring
   */
  const stopConnectionMonitoring = () => {
    if (connectionCheckInterval) {
      clearInterval(connectionCheckInterval);
      connectionCheckInterval = null;
    }
  };

  /**
   * Handle service worker update found
   */
  const handleUpdateFound = () => {
    console.log('[SW Update] New version found');

    const newWorker = registration.installing;

    if (!newWorker) {
      return;
    }

    // Listen for state changes on the new service worker
    stateChangeHandler = () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // New service worker is installed and there's an existing controller
        // This means an update is available
        console.log('[SW Update] New version installed and ready');
        updateAvailable.value = true;
      }
    };

    newWorker.addEventListener('statechange', stateChangeHandler);
  };

  /**
   * Initialize the service worker update detection
   */
  const initialize = async () => {
    if (!('serviceWorker' in navigator)) {
      console.warn('[SW Update] Service workers are not supported');
      return;
    }

    try {
      // Wait for the service worker to be registered
      const registrationPromise = getServiceWorkerRegistration();
      if (!registrationPromise) {
        console.warn('[SW Update] Service worker registration not initiated');
        return;
      }

      console.log('[SW Update] Waiting for service worker registration...');
      registration = await registrationPromise;

      if (!registration) {
        console.warn('[SW Update] Service worker registration failed');
        return;
      }

      console.log('[SW Update] Service worker update detection initialized');

      // Check if there's already an update waiting
      if (registration.waiting) {
        console.log('[SW Update] Update already waiting');
        updateAvailable.value = true;
      }

      // Listen for new updates
      updateFoundHandler = handleUpdateFound;
      registration.addEventListener('updatefound', updateFoundHandler);

      // Listen for online/offline events
      onlineHandler = handleOnline;
      offlineHandler = handleOffline;
      window.addEventListener('online', onlineHandler);
      window.addEventListener('offline', offlineHandler);

      // Start periodic connection monitoring
      startConnectionMonitoring();

      // Check for updates on initial load if online
      if (navigator.onLine) {
        setTimeout(async () => {
          const isOnline = await testNetworkConnectivity();
          if (isOnline) {
            checkForUpdates();
          }
        }, 2000); // Wait 2 seconds after app loads
      }

    } catch (error) {
      console.error('[SW Update] Failed to initialize:', error);
    }
  };

  /**
   * Cleanup event listeners
   */
  const cleanup = () => {
    stopConnectionMonitoring();

    if (onlineHandler) {
      window.removeEventListener('online', onlineHandler);
    }
    if (offlineHandler) {
      window.removeEventListener('offline', offlineHandler);
    }
    if (controllerChangeHandler) {
      navigator.serviceWorker.removeEventListener('controllerchange', controllerChangeHandler);
    }
    if (registration && updateFoundHandler) {
      registration.removeEventListener('updatefound', updateFoundHandler);
    }
    if (stateChangeHandler) {
      const newWorker = registration?.installing;
      if (newWorker) {
        newWorker.removeEventListener('statechange', stateChangeHandler);
      }
    }
  };

  // Initialize on mount
  onMounted(() => {
    initialize();
  });

  // Cleanup on unmount
  onUnmounted(() => {
    cleanup();
  });

  return {
    updateAvailable,
    showOnlineNotification,
    isCheckingForUpdate,
    applyUpdate,
    dismissUpdate,
    checkForUpdates,
  };
}
