import { describe, it, expect } from 'vitest';
import { useSnackbar } from '@/composables/useSnackbar';

describe('useSnackbar', () => {
  describe('initialization', () => {
    it('initializes with default state', () => {
      const { snackbar, snackbarText, snackbarColor } = useSnackbar();

      expect(snackbar.value).toBe(false);
      expect(snackbarText.value).toBe('');
      expect(snackbarColor.value).toBe('success');
    });

    it('returns reactive refs', () => {
      const { snackbar, snackbarText, snackbarColor } = useSnackbar();

      expect(snackbar).toHaveProperty('value');
      expect(snackbarText).toHaveProperty('value');
      expect(snackbarColor).toHaveProperty('value');
    });
  });

  describe('showSnackbar', () => {
    it('displays snackbar with text and default success color', () => {
      const { snackbar, snackbarText, snackbarColor, showSnackbar } = useSnackbar();

      showSnackbar('Operation successful');

      expect(snackbar.value).toBe(true);
      expect(snackbarText.value).toBe('Operation successful');
      expect(snackbarColor.value).toBe('success');
    });

    it('displays snackbar with custom color', () => {
      const { snackbar, snackbarText, snackbarColor, showSnackbar } = useSnackbar();

      showSnackbar('Error occurred', 'error');

      expect(snackbar.value).toBe(true);
      expect(snackbarText.value).toBe('Error occurred');
      expect(snackbarColor.value).toBe('error');
    });

    it('supports success color variant', () => {
      const { snackbarColor, showSnackbar } = useSnackbar();

      showSnackbar('Success message', 'success');

      expect(snackbarColor.value).toBe('success');
    });

    it('supports error color variant', () => {
      const { snackbarColor, showSnackbar } = useSnackbar();

      showSnackbar('Error message', 'error');

      expect(snackbarColor.value).toBe('error');
    });

    it('supports warning color variant', () => {
      const { snackbarColor, showSnackbar } = useSnackbar();

      showSnackbar('Warning message', 'warning');

      expect(snackbarColor.value).toBe('warning');
    });

    it('supports info color variant', () => {
      const { snackbarColor, showSnackbar } = useSnackbar();

      showSnackbar('Info message', 'info');

      expect(snackbarColor.value).toBe('info');
    });

    it('defaults to success when color is not provided', () => {
      const { snackbarColor, showSnackbar } = useSnackbar();

      showSnackbar('Message without color');

      expect(snackbarColor.value).toBe('success');
    });

    it('updates state for multiple calls', () => {
      const { snackbar, snackbarText, snackbarColor, showSnackbar } = useSnackbar();

      showSnackbar('First message', 'success');
      expect(snackbarText.value).toBe('First message');
      expect(snackbarColor.value).toBe('success');

      showSnackbar('Second message', 'error');
      expect(snackbarText.value).toBe('Second message');
      expect(snackbarColor.value).toBe('error');
      expect(snackbar.value).toBe(true);
    });

    it('handles empty message', () => {
      const { snackbar, snackbarText, showSnackbar } = useSnackbar();

      showSnackbar('', 'info');

      expect(snackbar.value).toBe(true);
      expect(snackbarText.value).toBe('');
    });

    it('handles long messages', () => {
      const { snackbarText, showSnackbar } = useSnackbar();
      const longMessage = 'This is a very long message that might wrap to multiple lines in the snackbar component';

      showSnackbar(longMessage, 'info');

      expect(snackbarText.value).toBe(longMessage);
    });
  });

  describe('reactive state updates', () => {
    it('allows manual state updates', () => {
      const { snackbar, snackbarText, snackbarColor } = useSnackbar();

      snackbar.value = true;
      snackbarText.value = 'Manual update';
      snackbarColor.value = 'warning';

      expect(snackbar.value).toBe(true);
      expect(snackbarText.value).toBe('Manual update');
      expect(snackbarColor.value).toBe('warning');
    });

    it('can be closed by setting snackbar to false', () => {
      const { snackbar, showSnackbar } = useSnackbar();

      showSnackbar('Test message');
      expect(snackbar.value).toBe(true);

      snackbar.value = false;
      expect(snackbar.value).toBe(false);
    });
  });

  describe('multiple instances', () => {
    it('creates independent instances', () => {
      const instance1 = useSnackbar();
      const instance2 = useSnackbar();

      instance1.showSnackbar('Message 1', 'success');
      instance2.showSnackbar('Message 2', 'error');

      expect(instance1.snackbarText.value).toBe('Message 1');
      expect(instance1.snackbarColor.value).toBe('success');

      expect(instance2.snackbarText.value).toBe('Message 2');
      expect(instance2.snackbarColor.value).toBe('error');
    });
  });

  describe('typical usage patterns', () => {
    it('supports success notification pattern', () => {
      const { snackbar, snackbarText, snackbarColor, showSnackbar } = useSnackbar();

      // Typical success pattern
      showSnackbar('✓ File saved successfully!', 'success');

      expect(snackbar.value).toBe(true);
      expect(snackbarText.value).toBe('✓ File saved successfully!');
      expect(snackbarColor.value).toBe('success');
    });

    it('supports error notification pattern', () => {
      const { snackbar, snackbarText, snackbarColor, showSnackbar } = useSnackbar();

      // Typical error pattern
      showSnackbar('❌ Failed to load file', 'error');

      expect(snackbar.value).toBe(true);
      expect(snackbarText.value).toBe('❌ Failed to load file');
      expect(snackbarColor.value).toBe('error');
    });

    it('supports warning notification pattern', () => {
      const { snackbar, snackbarText, snackbarColor, showSnackbar } = useSnackbar();

      // Typical warning pattern
      showSnackbar('⚠ Large file may take longer to process', 'warning');

      expect(snackbar.value).toBe(true);
      expect(snackbarText.value).toBe('⚠ Large file may take longer to process');
      expect(snackbarColor.value).toBe('warning');
    });

    it('supports info notification pattern', () => {
      const { snackbar, snackbarText, snackbarColor, showSnackbar } = useSnackbar();

      // Typical info pattern
      showSnackbar('ℹ Processing may take a few moments', 'info');

      expect(snackbar.value).toBe(true);
      expect(snackbarText.value).toBe('ℹ Processing may take a few moments');
      expect(snackbarColor.value).toBe('info');
    });
  });

  describe('edge cases', () => {
    it('handles null message', () => {
      const { snackbarText, showSnackbar } = useSnackbar();

      showSnackbar(null, 'success');

      expect(snackbarText.value).toBe(null);
    });

    it('handles undefined message', () => {
      const { snackbarText, showSnackbar } = useSnackbar();

      showSnackbar(undefined, 'success');

      expect(snackbarText.value).toBe(undefined);
    });

    it('handles numeric message', () => {
      const { snackbarText, showSnackbar } = useSnackbar();

      showSnackbar(404, 'error');

      expect(snackbarText.value).toBe(404);
    });
  });
});
