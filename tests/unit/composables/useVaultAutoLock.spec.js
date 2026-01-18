/**
 * Tests for useVaultAutoLock composable
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useVaultAutoLock } from '@/composables/useVaultAutoLock';

describe('useVaultAutoLock', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('initializes with isActive as true', () => {
      const { isActive } = useVaultAutoLock();
      expect(isActive.value).toBe(true);
    });

    it('accepts custom options', () => {
      const onLock = vi.fn();
      const getTimeout = vi.fn(() => 10);
      const isLocked = vi.fn(() => false);

      const autoLock = useVaultAutoLock({ onLock, getTimeout, isLocked });

      expect(autoLock).toBeDefined();
    });
  });

  describe('updateActivity', () => {
    it('stores activity timestamp in sessionStorage', () => {
      const { updateActivity } = useVaultAutoLock({
        isLocked: () => false
      });

      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
      updateActivity();

      const stored = sessionStorage.getItem('slurm-vault-last-activity');
      expect(stored).toBe(Date.now().toString());
    });

    it('does not update when vault is locked', () => {
      const { updateActivity } = useVaultAutoLock({
        isLocked: () => true
      });

      updateActivity();

      const stored = sessionStorage.getItem('slurm-vault-last-activity');
      expect(stored).toBeNull();
    });
  });

  describe('getLastActivity', () => {
    it('returns stored timestamp', () => {
      const { getLastActivity } = useVaultAutoLock();

      const timestamp = Date.now();
      sessionStorage.setItem('slurm-vault-last-activity', timestamp.toString());

      expect(getLastActivity()).toBe(timestamp);
    });

    it('returns null when no timestamp stored', () => {
      const { getLastActivity } = useVaultAutoLock();

      expect(getLastActivity()).toBeNull();
    });

    it('handles storage errors gracefully', () => {
      const { getLastActivity } = useVaultAutoLock();

      const originalGetItem = sessionStorage.getItem;
      sessionStorage.getItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      expect(getLastActivity()).toBeNull();

      sessionStorage.getItem = originalGetItem;
    });
  });

  describe('checkAutoLock', () => {
    it('calls onLock when timeout exceeded', () => {
      const onLock = vi.fn();

      const { checkAutoLock, updateActivity } = useVaultAutoLock({
        onLock,
        getTimeout: () => 5, // 5 minutes
        isLocked: () => false
      });

      // Set activity 6 minutes ago
      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
      updateActivity();

      vi.setSystemTime(new Date('2024-01-01T12:06:00.000Z'));
      const locked = checkAutoLock();

      expect(onLock).toHaveBeenCalledTimes(1);
      expect(locked).toBe(true);
    });

    it('does not call onLock when activity is recent', () => {
      const onLock = vi.fn();

      const { checkAutoLock, updateActivity } = useVaultAutoLock({
        onLock,
        getTimeout: () => 5, // 5 minutes
        isLocked: () => false
      });

      // Set activity 2 minutes ago
      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
      updateActivity();

      vi.setSystemTime(new Date('2024-01-01T12:02:00.000Z'));
      const locked = checkAutoLock();

      expect(onLock).not.toHaveBeenCalled();
      expect(locked).toBe(false);
    });

    it('does not lock when vault is already locked', () => {
      const onLock = vi.fn();

      const { checkAutoLock } = useVaultAutoLock({
        onLock,
        getTimeout: () => 5,
        isLocked: () => true
      });

      const locked = checkAutoLock();

      expect(onLock).not.toHaveBeenCalled();
      expect(locked).toBe(false);
    });

    it('does not lock when isActive is false', () => {
      const onLock = vi.fn();

      const { checkAutoLock, stop, updateActivity } = useVaultAutoLock({
        onLock,
        getTimeout: () => 5,
        isLocked: () => false
      });

      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
      updateActivity();

      stop(); // Deactivate

      vi.setSystemTime(new Date('2024-01-01T12:06:00.000Z'));
      const locked = checkAutoLock();

      expect(onLock).not.toHaveBeenCalled();
      expect(locked).toBe(false);
    });

    it('returns false when no activity timestamp exists', () => {
      const onLock = vi.fn();

      const { checkAutoLock } = useVaultAutoLock({
        onLock,
        getTimeout: () => 5,
        isLocked: () => false
      });

      const locked = checkAutoLock();

      expect(onLock).not.toHaveBeenCalled();
      expect(locked).toBe(false);
    });
  });

  describe('start', () => {
    it('sets isActive to true', () => {
      const { start, stop, isActive } = useVaultAutoLock({
        isLocked: () => false
      });

      stop();
      expect(isActive.value).toBe(false);

      start();
      expect(isActive.value).toBe(true);
    });

    it('updates activity timestamp on start', () => {
      const { start } = useVaultAutoLock({
        isLocked: () => false
      });

      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
      start();

      const stored = sessionStorage.getItem('slurm-vault-last-activity');
      expect(stored).toBe(Date.now().toString());
    });

    it('sets up periodic check interval', () => {
      const onLock = vi.fn();

      const { start, updateActivity } = useVaultAutoLock({
        onLock,
        getTimeout: () => 1, // 1 minute
        isLocked: () => false
      });

      // Set activity now
      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
      start();

      // Advance time by 2 minutes (past timeout)
      vi.setSystemTime(new Date('2024-01-01T12:02:00.000Z'));

      // Advance timers to trigger interval check (every 30 seconds)
      vi.advanceTimersByTime(30000);

      expect(onLock).toHaveBeenCalledTimes(1);
    });
  });

  describe('stop', () => {
    it('sets isActive to false', () => {
      const { stop, isActive } = useVaultAutoLock();

      stop();

      expect(isActive.value).toBe(false);
    });

    it('clears the check interval', () => {
      const onLock = vi.fn();

      const { start, stop, updateActivity } = useVaultAutoLock({
        onLock,
        getTimeout: () => 1, // 1 minute
        isLocked: () => false
      });

      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
      start();

      stop();

      // Advance time past timeout
      vi.setSystemTime(new Date('2024-01-01T12:02:00.000Z'));
      vi.advanceTimersByTime(30000);

      // Should not call onLock because interval was cleared
      expect(onLock).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('updates activity timestamp', () => {
      const { reset } = useVaultAutoLock({
        isLocked: () => false
      });

      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
      reset();

      const stored = sessionStorage.getItem('slurm-vault-last-activity');
      expect(stored).toBe(Date.now().toString());
    });
  });

  describe('clear', () => {
    it('removes activity timestamp from sessionStorage', () => {
      const { updateActivity, clear } = useVaultAutoLock({
        isLocked: () => false
      });

      updateActivity();
      expect(sessionStorage.getItem('slurm-vault-last-activity')).not.toBeNull();

      clear();
      expect(sessionStorage.getItem('slurm-vault-last-activity')).toBeNull();
    });
  });

  describe('getTimeRemaining', () => {
    it('returns remaining seconds before auto-lock', () => {
      const { getTimeRemaining, updateActivity } = useVaultAutoLock({
        getTimeout: () => 5, // 5 minutes
        isLocked: () => false
      });

      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
      updateActivity();

      // 2 minutes later, should have 3 minutes (180 seconds) remaining
      vi.setSystemTime(new Date('2024-01-01T12:02:00.000Z'));

      const remaining = getTimeRemaining();
      expect(remaining).toBe(180);
    });

    it('returns 0 when timeout exceeded', () => {
      const { getTimeRemaining, updateActivity } = useVaultAutoLock({
        getTimeout: () => 5,
        isLocked: () => false
      });

      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
      updateActivity();

      vi.setSystemTime(new Date('2024-01-01T12:06:00.000Z'));

      const remaining = getTimeRemaining();
      expect(remaining).toBe(0);
    });

    it('returns null when vault is locked', () => {
      const { getTimeRemaining } = useVaultAutoLock({
        isLocked: () => true
      });

      const remaining = getTimeRemaining();
      expect(remaining).toBeNull();
    });

    it('returns null when no activity timestamp exists', () => {
      const { getTimeRemaining } = useVaultAutoLock({
        isLocked: () => false
      });

      const remaining = getTimeRemaining();
      expect(remaining).toBeNull();
    });
  });

  describe('visibility change handling', () => {
    it('checks auto-lock when tab becomes visible', () => {
      const onLock = vi.fn();

      const { start, updateActivity } = useVaultAutoLock({
        onLock,
        getTimeout: () => 1, // 1 minute
        isLocked: () => false
      });

      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
      start();

      // Simulate tab becoming visible after timeout
      vi.setSystemTime(new Date('2024-01-01T12:02:00.000Z'));

      // Simulate visibility change event
      Object.defineProperty(document, 'hidden', { value: false, writable: true });
      document.dispatchEvent(new Event('visibilitychange'));

      expect(onLock).toHaveBeenCalledTimes(1);
    });
  });
});
