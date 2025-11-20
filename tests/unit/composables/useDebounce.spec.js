import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useDebounce } from '@/composables/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('returns debounce and cancel functions', () => {
      const callback = vi.fn();
      const { debounce, cancel } = useDebounce(callback);

      expect(typeof debounce).toBe('function');
      expect(typeof cancel).toBe('function');
    });

    it('uses default delay of 350ms', () => {
      const callback = vi.fn();
      const { debounce } = useDebounce(callback);

      debounce();

      // Should not execute before delay
      expect(callback).not.toHaveBeenCalled();

      // Fast-forward 349ms (not enough)
      vi.advanceTimersByTime(349);
      expect(callback).not.toHaveBeenCalled();

      // Fast-forward 1ms more (total 350ms)
      vi.advanceTimersByTime(1);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('accepts custom delay', () => {
      const callback = vi.fn();
      const { debounce } = useDebounce(callback, 1000);

      debounce();

      vi.advanceTimersByTime(999);
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('debouncing behavior', () => {
    it('delays callback execution', () => {
      const callback = vi.fn();
      const { debounce } = useDebounce(callback, 500);

      debounce();

      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('cancels previous invocation on rapid calls', () => {
      const callback = vi.fn();
      const { debounce } = useDebounce(callback, 500);

      debounce();
      vi.advanceTimersByTime(200);

      debounce();
      vi.advanceTimersByTime(200);

      debounce();

      // Only 400ms have passed since first call, but we've made 3 calls
      expect(callback).not.toHaveBeenCalled();

      // Fast-forward 500ms from last call
      vi.advanceTimersByTime(500);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('executes callback only once for multiple rapid calls', () => {
      const callback = vi.fn();
      const { debounce } = useDebounce(callback, 300);

      // Simulate rapid typing
      debounce();
      debounce();
      debounce();
      debounce();
      debounce();

      // Wait for delay
      vi.advanceTimersByTime(300);

      // Should execute only once
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('executes multiple times if calls are spaced out', () => {
      const callback = vi.fn();
      const { debounce } = useDebounce(callback, 300);

      debounce();
      vi.advanceTimersByTime(300);
      expect(callback).toHaveBeenCalledTimes(1);

      debounce();
      vi.advanceTimersByTime(300);
      expect(callback).toHaveBeenCalledTimes(2);

      debounce();
      vi.advanceTimersByTime(300);
      expect(callback).toHaveBeenCalledTimes(3);
    });
  });

  describe('callback arguments', () => {
    it('passes arguments to callback', () => {
      const callback = vi.fn();
      const { debounce } = useDebounce(callback, 300);

      debounce('arg1', 'arg2', 'arg3');

      vi.advanceTimersByTime(300);

      expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });

    it('passes latest arguments when called multiple times', () => {
      const callback = vi.fn();
      const { debounce } = useDebounce(callback, 300);

      debounce('first');
      debounce('second');
      debounce('third');

      vi.advanceTimersByTime(300);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('third');
    });

    it('handles no arguments', () => {
      const callback = vi.fn();
      const { debounce } = useDebounce(callback, 300);

      debounce();

      vi.advanceTimersByTime(300);

      expect(callback).toHaveBeenCalledWith();
    });

    it('handles object arguments', () => {
      const callback = vi.fn();
      const { debounce } = useDebounce(callback, 300);

      const arg = { key: 'value' };
      debounce(arg);

      vi.advanceTimersByTime(300);

      expect(callback).toHaveBeenCalledWith(arg);
    });
  });

  describe('cancel functionality', () => {
    it('cancels pending callback execution', () => {
      const callback = vi.fn();
      const { debounce, cancel } = useDebounce(callback, 300);

      debounce();

      vi.advanceTimersByTime(200);
      cancel();

      vi.advanceTimersByTime(100); // Would have executed at 300ms
      expect(callback).not.toHaveBeenCalled();
    });

    it('allows new calls after cancel', () => {
      const callback = vi.fn();
      const { debounce, cancel } = useDebounce(callback, 300);

      debounce('first');
      cancel();

      debounce('second');
      vi.advanceTimersByTime(300);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('second');
    });

    it('does nothing when called with no pending execution', () => {
      const callback = vi.fn();
      const { cancel } = useDebounce(callback, 300);

      // Call cancel without any pending execution
      expect(() => cancel()).not.toThrow();
    });

    it('can be called multiple times safely', () => {
      const callback = vi.fn();
      const { debounce, cancel } = useDebounce(callback, 300);

      debounce();
      cancel();
      cancel();
      cancel();

      expect(() => cancel()).not.toThrow();
    });
  });

  describe('typical usage patterns', () => {
    it('simulates text input debouncing (fast operations)', () => {
      const encodeText = vi.fn();
      const { debounce } = useDebounce(encodeText, 350);

      // Simulate typing "hello"
      debounce('h');
      vi.advanceTimersByTime(100);

      debounce('he');
      vi.advanceTimersByTime(100);

      debounce('hel');
      vi.advanceTimersByTime(100);

      debounce('hell');
      vi.advanceTimersByTime(100);

      debounce('hello');

      // Should not have encoded yet
      expect(encodeText).not.toHaveBeenCalled();

      // Wait for debounce delay
      vi.advanceTimersByTime(350);

      // Should encode only the final value
      expect(encodeText).toHaveBeenCalledTimes(1);
      expect(encodeText).toHaveBeenCalledWith('hello');
    });

    it('simulates crypto operation debouncing (slower operations)', () => {
      const encryptText = vi.fn();
      const { debounce } = useDebounce(encryptText, 800);

      // User types password
      debounce('pass');
      vi.advanceTimersByTime(200);

      debounce('password');
      vi.advanceTimersByTime(200);

      debounce('password123');

      // Should not have encrypted yet
      expect(encryptText).not.toHaveBeenCalled();

      // Wait for debounce delay
      vi.advanceTimersByTime(800);

      // Should encrypt only the final value
      expect(encryptText).toHaveBeenCalledTimes(1);
      expect(encryptText).toHaveBeenCalledWith('password123');
    });

    it('simulates search input debouncing', () => {
      const searchAPI = vi.fn();
      const { debounce } = useDebounce(searchAPI, 500);

      // User types search query
      debounce('a');
      vi.advanceTimersByTime(100);
      debounce('ap');
      vi.advanceTimersByTime(100);
      debounce('app');
      vi.advanceTimersByTime(100);
      debounce('appl');
      vi.advanceTimersByTime(100);
      debounce('apple');

      // Wait for debounce
      vi.advanceTimersByTime(500);

      expect(searchAPI).toHaveBeenCalledTimes(1);
      expect(searchAPI).toHaveBeenCalledWith('apple');
    });
  });

  describe('edge cases', () => {
    it('handles zero delay', () => {
      const callback = vi.fn();
      const { debounce } = useDebounce(callback, 0);

      debounce();

      vi.advanceTimersByTime(0);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('handles very large delay', () => {
      const callback = vi.fn();
      const { debounce } = useDebounce(callback, 10000);

      debounce();

      vi.advanceTimersByTime(9999);
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('handles callback that throws error', () => {
      const callback = vi.fn(() => {
        throw new Error('Callback error');
      });
      const { debounce } = useDebounce(callback, 300);

      debounce();

      expect(() => {
        vi.advanceTimersByTime(300);
      }).toThrow('Callback error');
    });

    it('clears timer reference after execution', () => {
      const callback = vi.fn();
      const { debounce, cancel } = useDebounce(callback, 300);

      debounce();
      vi.advanceTimersByTime(300);

      // Timer should be cleared, cancel should be safe
      expect(() => cancel()).not.toThrow();
    });
  });

  describe('cleanup', () => {
    it('supports manual cleanup pattern', () => {
      const callback = vi.fn();
      const { debounce, cancel } = useDebounce(callback, 300);

      debounce();

      // Simulate component unmount cleanup
      cancel();

      vi.advanceTimersByTime(300);
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
