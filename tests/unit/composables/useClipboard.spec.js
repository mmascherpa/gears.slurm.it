import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useClipboard } from '@/composables/useClipboard';

describe('useClipboard', () => {
  let mockClipboard;

  beforeEach(() => {
    // Mock clipboard API
    mockClipboard = {
      writeText: vi.fn(),
      readText: vi.fn()
    };

    // Assign to navigator
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
      configurable: true
    });
  });

  describe('copyToClipboard', () => {
    it('copies text to clipboard successfully', async () => {
      const { copyToClipboard } = useClipboard();
      const onSuccess = vi.fn();
      const onError = vi.fn();

      mockClipboard.writeText.mockResolvedValue();

      const result = await copyToClipboard('test text', onSuccess, onError);

      expect(mockClipboard.writeText).toHaveBeenCalledWith('test text');
      expect(onSuccess).toHaveBeenCalledWith('✓ Copied to clipboard!');
      expect(onError).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('calls onError when clipboard write fails', async () => {
      const { copyToClipboard } = useClipboard();
      const onSuccess = vi.fn();
      const onError = vi.fn();

      mockClipboard.writeText.mockRejectedValue(new Error('Permission denied'));

      const result = await copyToClipboard('test text', onSuccess, onError);

      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith('❌ Failed to copy to clipboard');
      expect(result).toBe(false);
    });

    it('returns false for empty text without calling clipboard API', async () => {
      const { copyToClipboard } = useClipboard();
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const result = await copyToClipboard('', onSuccess, onError);

      expect(mockClipboard.writeText).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('returns false for null text', async () => {
      const { copyToClipboard } = useClipboard();

      const result = await copyToClipboard(null);

      expect(mockClipboard.writeText).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('returns false for undefined text', async () => {
      const { copyToClipboard } = useClipboard();

      const result = await copyToClipboard(undefined);

      expect(mockClipboard.writeText).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('works without callbacks (callbacks are optional)', async () => {
      const { copyToClipboard } = useClipboard();

      mockClipboard.writeText.mockResolvedValue();

      const result = await copyToClipboard('test text');

      expect(mockClipboard.writeText).toHaveBeenCalledWith('test text');
      expect(result).toBe(true);
    });

    it('only calls onSuccess when provided', async () => {
      const { copyToClipboard } = useClipboard();
      const onSuccess = vi.fn();

      mockClipboard.writeText.mockResolvedValue();

      await copyToClipboard('test text', onSuccess);

      expect(onSuccess).toHaveBeenCalled();
    });

    it('logs error to console when copy fails', async () => {
      const { copyToClipboard } = useClipboard();
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Permission denied');

      mockClipboard.writeText.mockRejectedValue(error);

      await copyToClipboard('test text');

      expect(consoleError).toHaveBeenCalledWith('Clipboard copy error:', error);

      consoleError.mockRestore();
    });

    it('handles clipboard API not available', async () => {
      const { copyToClipboard } = useClipboard();
      const onError = vi.fn();

      // Remove clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
        configurable: true
      });

      const result = await copyToClipboard('test text', null, onError);

      expect(result).toBe(false);
    });
  });

  describe('pasteFromClipboard', () => {
    it('pastes text from clipboard successfully', async () => {
      const { pasteFromClipboard } = useClipboard();
      const onSuccess = vi.fn();
      const onError = vi.fn();

      mockClipboard.readText.mockResolvedValue('pasted text');

      const result = await pasteFromClipboard(onSuccess, onError);

      expect(mockClipboard.readText).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalledWith('pasted text', '✓ Pasted from clipboard');
      expect(onError).not.toHaveBeenCalled();
      expect(result).toBe('pasted text');
    });

    it('calls onError when clipboard read fails', async () => {
      const { pasteFromClipboard } = useClipboard();
      const onSuccess = vi.fn();
      const onError = vi.fn();

      mockClipboard.readText.mockRejectedValue(new Error('Permission denied'));

      const result = await pasteFromClipboard(onSuccess, onError);

      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith('❌ Failed to paste from clipboard');
      expect(result).toBeNull();
    });

    it('works without callbacks (callbacks are optional)', async () => {
      const { pasteFromClipboard } = useClipboard();

      mockClipboard.readText.mockResolvedValue('pasted text');

      const result = await pasteFromClipboard();

      expect(mockClipboard.readText).toHaveBeenCalled();
      expect(result).toBe('pasted text');
    });

    it('returns null on error', async () => {
      const { pasteFromClipboard } = useClipboard();

      mockClipboard.readText.mockRejectedValue(new Error('Failed'));

      const result = await pasteFromClipboard();

      expect(result).toBeNull();
    });

    it('logs error to console when paste fails', async () => {
      const { pasteFromClipboard } = useClipboard();
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Permission denied');

      mockClipboard.readText.mockRejectedValue(error);

      await pasteFromClipboard();

      expect(consoleError).toHaveBeenCalledWith('Clipboard paste error:', error);

      consoleError.mockRestore();
    });

    it('handles empty clipboard', async () => {
      const { pasteFromClipboard } = useClipboard();
      const onSuccess = vi.fn();

      mockClipboard.readText.mockResolvedValue('');

      const result = await pasteFromClipboard(onSuccess);

      expect(result).toBe('');
      expect(onSuccess).toHaveBeenCalledWith('', '✓ Pasted from clipboard');
    });

    it('handles clipboard API not available', async () => {
      const { pasteFromClipboard } = useClipboard();
      const onError = vi.fn();

      // Remove clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
        configurable: true
      });

      const result = await pasteFromClipboard(null, onError);

      expect(result).toBeNull();
    });
  });

  describe('integration', () => {
    it('can copy and paste text in sequence', async () => {
      const { copyToClipboard, pasteFromClipboard } = useClipboard();

      mockClipboard.writeText.mockResolvedValue();
      mockClipboard.readText.mockResolvedValue('copied text');

      await copyToClipboard('copied text');
      const result = await pasteFromClipboard();

      expect(result).toBe('copied text');
    });

    it('returns separate instances from multiple calls', () => {
      const instance1 = useClipboard();
      const instance2 = useClipboard();

      expect(instance1.copyToClipboard).toBeDefined();
      expect(instance2.copyToClipboard).toBeDefined();
      // Functions are different instances
      expect(instance1.copyToClipboard).not.toBe(instance2.copyToClipboard);
    });
  });

  describe('error handling edge cases', () => {
    it('handles DOMException errors', async () => {
      const { copyToClipboard } = useClipboard();
      const onError = vi.fn();

      mockClipboard.writeText.mockRejectedValue(new DOMException('NotAllowedError'));

      const result = await copyToClipboard('test', null, onError);

      expect(result).toBe(false);
      expect(onError).toHaveBeenCalled();
    });

    it('handles SecurityError', async () => {
      const { pasteFromClipboard } = useClipboard();
      const onError = vi.fn();

      mockClipboard.readText.mockRejectedValue(new DOMException('SecurityError'));

      const result = await pasteFromClipboard(null, onError);

      expect(result).toBeNull();
      expect(onError).toHaveBeenCalled();
    });
  });
});
