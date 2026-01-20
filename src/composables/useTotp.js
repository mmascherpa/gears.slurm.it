/**
 * Composable for TOTP code generation with reactive state and countdown timer
 *
 * Provides reactive TOTP code generation with automatic refresh and countdown.
 * Uses the native Web Crypto API for TOTP generation (RFC 6238 compliant).
 *
 * @param {Ref<string>} secretRef - Reactive reference to the Base32 secret
 * @param {Object} options - Configuration options
 * @param {number} options.period - Time step in seconds (default: 30)
 * @param {number} options.digits - Number of digits (default: 6)
 * @param {string} options.algorithm - Hash algorithm (default: 'SHA-1')
 * @returns {Object} Reactive TOTP state and controls
 *
 * @example
 * const secret = ref('JBSWY3DPEHPK3PXP');
 * const { code, timeRemaining, isValid, error, start, stop } = useTotp(secret);
 *
 * onMounted(() => start());
 * onBeforeUnmount(() => stop());
 */

import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { generateTotp, getTotpTimeRemaining, validateTotpSecret } from '@/utils/totp';

export function useTotp(secretRef, options = {}) {
  const {
    period = 30,
    digits = 6,
    algorithm = 'SHA-1'
  } = options;

  // Reactive state
  const code = ref('------');
  const timeRemaining = ref(period);
  const isGenerating = ref(false);
  const error = ref(null);

  // Timer reference
  let intervalId = null;

  // Validation computed
  const validation = computed(() => {
    const secret = secretRef?.value || secretRef;
    if (!secret) {
      return { isValid: false, error: null, normalized: '' };
    }
    return validateTotpSecret(secret);
  });

  const isValid = computed(() => validation.value.isValid);

  /**
   * Generate a new TOTP code
   */
  async function refresh() {
    const secret = secretRef?.value || secretRef;

    if (!secret) {
      code.value = '------';
      error.value = null;
      return;
    }

    if (!validation.value.isValid) {
      code.value = '------';
      error.value = validation.value.error;
      return;
    }

    isGenerating.value = true;
    error.value = null;

    try {
      code.value = await generateTotp(secret, { period, digits, algorithm });
    } catch (err) {
      const errorMessage = typeof err === 'string' ? err : (err.message || 'Failed to generate code');
      error.value = errorMessage;
      code.value = '------';
      console.error('TOTP generation error:', err);
    } finally {
      isGenerating.value = false;
    }
  }

  /**
   * Update the countdown timer
   */
  function updateTimeRemaining() {
    timeRemaining.value = getTotpTimeRemaining(period);
  }

  /**
   * Timer tick handler - updates countdown and refreshes code when period expires
   */
  async function tick() {
    const previousRemaining = timeRemaining.value;
    updateTimeRemaining();

    // Refresh code when period rolls over (time remaining increased)
    if (timeRemaining.value > previousRemaining) {
      await refresh();
    }
  }

  /**
   * Start the TOTP timer
   * Immediately generates a code and starts countdown
   */
  async function start() {
    stop(); // Clear any existing timer

    updateTimeRemaining();
    await refresh();

    // Update every second
    intervalId = setInterval(tick, 1000);
  }

  /**
   * Stop the TOTP timer
   */
  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  // Watch for secret changes and refresh
  watch(
    () => secretRef?.value || secretRef,
    async (newSecret) => {
      if (newSecret && intervalId) {
        await refresh();
      }
    }
  );

  // Auto-cleanup on unmount
  onBeforeUnmount(() => {
    stop();
  });

  return {
    code,
    timeRemaining,
    isGenerating,
    isValid,
    error,
    start,
    stop,
    refresh
  };
}

/**
 * Global TOTP timer singleton for synchronized countdown across components
 *
 * All TOTP codes expire at the same time (aligned to Unix epoch),
 * so a single global timer is more efficient than per-component timers.
 *
 * @returns {Object} Global timer state and subscription methods
 *
 * @example
 * const { timeRemaining, onTick, offTick } = useGlobalTotpTimer();
 *
 * const handler = (remaining) => console.log(`${remaining}s remaining`);
 * onTick(handler);
 * onBeforeUnmount(() => offTick(handler));
 */
let globalTimerInstance = null;

export function useGlobalTotpTimer(period = 30) {
  // Create singleton instance if it doesn't exist
  if (!globalTimerInstance) {
    const timeRemaining = ref(getTotpTimeRemaining(period));
    const listeners = new Set();
    let intervalId = null;

    function tick() {
      timeRemaining.value = getTotpTimeRemaining(period);
      listeners.forEach((listener) => listener(timeRemaining.value));
    }

    function startGlobalTimer() {
      if (!intervalId) {
        intervalId = setInterval(tick, 1000);
      }
    }

    function stopGlobalTimer() {
      if (intervalId && listeners.size === 0) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }

    globalTimerInstance = {
      timeRemaining,
      onTick: (callback) => {
        listeners.add(callback);
        startGlobalTimer();
      },
      offTick: (callback) => {
        listeners.delete(callback);
        stopGlobalTimer();
      },
      getListenerCount: () => listeners.size
    };
  }

  return globalTimerInstance;
}
