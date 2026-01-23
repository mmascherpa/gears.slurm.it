import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { usePreferences } from '@/composables/usePreferences';

describe('usePreferences', () => {
  beforeEach(() => {
    // Clear all localStorage before each test
    localStorage.clear();
    // Clear any console warnings
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('initialization', () => {
    it('initializes with default values when no stored preferences exist', () => {
      const defaults = {
        length: 16,
        includeUppercase: true,
        includeLowercase: true
      };

      const { preferences } = usePreferences('test-tool', defaults);

      expect(preferences.length).toBe(16);
      expect(preferences.includeUppercase).toBe(true);
      expect(preferences.includeLowercase).toBe(true);
    });

    it('returns a reactive preferences object', () => {
      const { preferences } = usePreferences('test-tool', { value: 10 });

      preferences.value = 20;

      expect(preferences.value).toBe(20);
    });

    it('returns a resetPreferences function', () => {
      const { resetPreferences } = usePreferences('test-tool', { value: 10 });

      expect(typeof resetPreferences).toBe('function');
    });
  });

  describe('loading from localStorage', () => {
    it('loads stored preferences on initialization', () => {
      localStorage.setItem('slurm-pref-test-tool', JSON.stringify({
        length: 24,
        includeUppercase: false
      }));

      const { preferences } = usePreferences('test-tool', {
        length: 16,
        includeUppercase: true,
        includeLowercase: true
      });

      expect(preferences.length).toBe(24);
      expect(preferences.includeUppercase).toBe(false);
      expect(preferences.includeLowercase).toBe(true); // Default used for missing key
    });

    it('ignores stored keys not present in defaults', () => {
      localStorage.setItem('slurm-pref-test-tool', JSON.stringify({
        length: 24,
        extraKey: 'should be ignored'
      }));

      const { preferences } = usePreferences('test-tool', { length: 16 });

      expect(preferences.length).toBe(24);
      expect(preferences.extraKey).toBeUndefined();
    });

    it('handles corrupted localStorage data gracefully', () => {
      localStorage.setItem('slurm-pref-test-tool', 'not valid json');

      const { preferences } = usePreferences('test-tool', { length: 16 });

      expect(preferences.length).toBe(16);
      expect(console.warn).toHaveBeenCalled();
    });

    it('handles null localStorage data gracefully', () => {
      localStorage.setItem('slurm-pref-test-tool', 'null');

      const { preferences } = usePreferences('test-tool', { length: 16 });

      expect(preferences.length).toBe(16);
    });
  });

  describe('persisting to localStorage', () => {
    it('saves preferences when changed', async () => {
      const { preferences } = usePreferences('test-tool', {
        length: 16,
        active: true
      });

      preferences.length = 32;
      await nextTick();

      const stored = JSON.parse(localStorage.getItem('slurm-pref-test-tool'));
      expect(stored.length).toBe(32);
      expect(stored.active).toBe(true);
    });

    it('saves preferences on boolean change', async () => {
      const { preferences } = usePreferences('test-tool', { enabled: true });

      preferences.enabled = false;
      await nextTick();

      const stored = JSON.parse(localStorage.getItem('slurm-pref-test-tool'));
      expect(stored.enabled).toBe(false);
    });

    it('saves preferences on string change', async () => {
      const { preferences } = usePreferences('test-tool', { algorithm: 'aes' });

      preferences.algorithm = 'age';
      await nextTick();

      const stored = JSON.parse(localStorage.getItem('slurm-pref-test-tool'));
      expect(stored.algorithm).toBe('age');
    });
  });

  describe('type validation', () => {
    it('rejects stored number when default is boolean', () => {
      localStorage.setItem('slurm-pref-test-tool', JSON.stringify({
        enabled: 123
      }));

      const { preferences } = usePreferences('test-tool', { enabled: true });

      expect(preferences.enabled).toBe(true); // Default used
    });

    it('rejects stored string when default is number', () => {
      localStorage.setItem('slurm-pref-test-tool', JSON.stringify({
        length: 'sixteen'
      }));

      const { preferences } = usePreferences('test-tool', { length: 16 });

      expect(preferences.length).toBe(16); // Default used
    });

    it('rejects stored boolean when default is string', () => {
      localStorage.setItem('slurm-pref-test-tool', JSON.stringify({
        algorithm: true
      }));

      const { preferences } = usePreferences('test-tool', { algorithm: 'aes' });

      expect(preferences.algorithm).toBe('aes'); // Default used
    });

    it('rejects NaN stored values for numbers', () => {
      localStorage.setItem('slurm-pref-test-tool', JSON.stringify({
        length: NaN
      }));

      const { preferences } = usePreferences('test-tool', { length: 16 });

      // NaN is stored as null in JSON, which fails type validation
      expect(preferences.length).toBe(16);
    });

    it('rejects Infinity stored values for numbers', () => {
      localStorage.setItem('slurm-pref-test-tool', JSON.stringify({
        length: Infinity
      }));

      const { preferences } = usePreferences('test-tool', { length: 16 });

      // Infinity is stored as null in JSON, which fails type validation
      expect(preferences.length).toBe(16);
    });
  });

  describe('tool isolation', () => {
    it('isolates preferences between different tools', async () => {
      const { preferences: prefs1 } = usePreferences('tool-one', { value: 10 });
      const { preferences: prefs2 } = usePreferences('tool-two', { value: 20 });

      prefs1.value = 100;
      prefs2.value = 200;
      await nextTick();

      const stored1 = JSON.parse(localStorage.getItem('slurm-pref-tool-one'));
      const stored2 = JSON.parse(localStorage.getItem('slurm-pref-tool-two'));

      expect(stored1.value).toBe(100);
      expect(stored2.value).toBe(200);
    });

    it('does not affect other tools when loading', () => {
      localStorage.setItem('slurm-pref-tool-one', JSON.stringify({ value: 100 }));
      localStorage.setItem('slurm-pref-tool-two', JSON.stringify({ value: 200 }));

      const { preferences: prefs1 } = usePreferences('tool-one', { value: 10 });
      const { preferences: prefs2 } = usePreferences('tool-two', { value: 20 });

      expect(prefs1.value).toBe(100);
      expect(prefs2.value).toBe(200);
    });
  });

  describe('resetPreferences', () => {
    it('resets all preferences to default values', async () => {
      const defaults = {
        length: 16,
        includeUppercase: true,
        active: false
      };

      const { preferences, resetPreferences } = usePreferences('test-tool', defaults);

      preferences.length = 64;
      preferences.includeUppercase = false;
      preferences.active = true;
      await nextTick();

      resetPreferences();

      expect(preferences.length).toBe(16);
      expect(preferences.includeUppercase).toBe(true);
      expect(preferences.active).toBe(false);
    });

    it('persists reset values to localStorage', async () => {
      const { preferences, resetPreferences } = usePreferences('test-tool', { value: 10 });

      preferences.value = 100;
      await nextTick();

      resetPreferences();
      await nextTick();

      const stored = JSON.parse(localStorage.getItem('slurm-pref-test-tool'));
      expect(stored.value).toBe(10);
    });
  });

  describe('localStorage error handling', () => {
    it('handles localStorage.getItem errors gracefully', () => {
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = () => { throw new Error('Storage access denied'); };

      const { preferences } = usePreferences('test-tool', { value: 10 });

      expect(preferences.value).toBe(10);
      expect(console.warn).toHaveBeenCalled();

      localStorage.getItem = originalGetItem;
    });

    it('handles localStorage.setItem errors gracefully', async () => {
      const { preferences } = usePreferences('test-tool', { value: 10 });

      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => { throw new Error('Quota exceeded'); };

      // Should not throw
      preferences.value = 20;
      await nextTick();

      expect(preferences.value).toBe(20);
      expect(console.warn).toHaveBeenCalled();

      localStorage.setItem = originalSetItem;
    });
  });

  describe('multiple instances same tool', () => {
    it('loads same stored preferences for multiple instances', () => {
      localStorage.setItem('slurm-pref-test-tool', JSON.stringify({ value: 50 }));

      const { preferences: prefs1 } = usePreferences('test-tool', { value: 10 });
      const { preferences: prefs2 } = usePreferences('test-tool', { value: 10 });

      expect(prefs1.value).toBe(50);
      expect(prefs2.value).toBe(50);
    });
  });

  describe('edge cases', () => {
    it('handles empty defaults object', () => {
      const { preferences } = usePreferences('test-tool', {});

      expect(Object.keys(preferences).length).toBe(0);
    });

    it('handles zero as valid number value', () => {
      localStorage.setItem('slurm-pref-test-tool', JSON.stringify({ count: 0 }));

      const { preferences } = usePreferences('test-tool', { count: 10 });

      expect(preferences.count).toBe(0);
    });

    it('handles empty string as valid string value', () => {
      localStorage.setItem('slurm-pref-test-tool', JSON.stringify({ name: '' }));

      const { preferences } = usePreferences('test-tool', { name: 'default' });

      expect(preferences.name).toBe('');
    });

    it('handles false as valid boolean value', () => {
      localStorage.setItem('slurm-pref-test-tool', JSON.stringify({ enabled: false }));

      const { preferences } = usePreferences('test-tool', { enabled: true });

      expect(preferences.enabled).toBe(false);
    });
  });

  describe('typical usage patterns', () => {
    it('supports password generator preferences', async () => {
      const { preferences } = usePreferences('password-generator', {
        length: 16,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSpecial: true
      });

      preferences.length = 24;
      preferences.includeSpecial = false;
      await nextTick();

      const stored = JSON.parse(localStorage.getItem('slurm-pref-password-generator'));
      expect(stored.length).toBe(24);
      expect(stored.includeUppercase).toBe(true);
      expect(stored.includeSpecial).toBe(false);
    });

    it('supports encryption algorithm preference', async () => {
      const { preferences } = usePreferences('encrypt', {
        selectedAlgorithm: 'jsAesCrypt'
      });

      preferences.selectedAlgorithm = 'age';
      await nextTick();

      const stored = JSON.parse(localStorage.getItem('slurm-pref-encrypt'));
      expect(stored.selectedAlgorithm).toBe('age');
    });

    it('supports hex viewer preferences', async () => {
      const { preferences } = usePreferences('hex-viewer', {
        bytesPerRow: 16,
        offsetFormat: 'hex'
      });

      preferences.bytesPerRow = 32;
      preferences.offsetFormat = 'decimal';
      await nextTick();

      const stored = JSON.parse(localStorage.getItem('slurm-pref-hex-viewer'));
      expect(stored.bytesPerRow).toBe(32);
      expect(stored.offsetFormat).toBe('decimal');
    });
  });
});
