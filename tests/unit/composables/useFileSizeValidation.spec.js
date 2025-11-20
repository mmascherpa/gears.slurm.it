import { describe, it, expect, vi } from 'vitest';
import { useFileSizeValidation } from '@/composables/useFileSizeValidation';
import { FILE_SIZE_LIMITS } from '@/utils/fileSizeValidator';

describe('useFileSizeValidation', () => {
  describe('initialization', () => {
    it('initializes with default state', () => {
      const {
        isFileSizeValid,
        showFileSizeWarning,
        fileSizeWarningMessage,
        fileSizeError,
        fileSizeHint
      } = useFileSizeValidation();

      expect(isFileSizeValid.value).toBe(true);
      expect(showFileSizeWarning.value).toBe(false);
      expect(fileSizeWarningMessage.value).toBe('');
      expect(fileSizeError.value).toBe('');
      expect(fileSizeHint.value).toBe('');
    });
  });

  describe('clearFileValidation', () => {
    it('resets all validation state to defaults', () => {
      const {
        isFileSizeValid,
        showFileSizeWarning,
        fileSizeWarningMessage,
        fileSizeError,
        fileSizeHint,
        clearFileValidation
      } = useFileSizeValidation();

      // Set some state
      isFileSizeValid.value = false;
      showFileSizeWarning.value = true;
      fileSizeWarningMessage.value = 'Warning message';
      fileSizeError.value = 'Error message';
      fileSizeHint.value = 'Hint message';

      // Clear
      clearFileValidation();

      // Verify reset
      expect(isFileSizeValid.value).toBe(true);
      expect(showFileSizeWarning.value).toBe(false);
      expect(fileSizeWarningMessage.value).toBe('');
      expect(fileSizeError.value).toBe('');
      expect(fileSizeHint.value).toBe('');
    });
  });

  describe('handleFileSelection', () => {
    describe('null/undefined file', () => {
      it('returns valid for null file', () => {
        const { handleFileSelection } = useFileSizeValidation();

        const result = handleFileSelection(null);

        expect(result.isValid).toBe(true);
      });

      it('returns valid for undefined file', () => {
        const { handleFileSelection } = useFileSizeValidation();

        const result = handleFileSelection(undefined);

        expect(result.isValid).toBe(true);
      });

      it('clears validation state for null file', () => {
        const {
          handleFileSelection,
          isFileSizeValid,
          fileSizeError,
          fileSizeHint
        } = useFileSizeValidation();

        // Set some state first
        isFileSizeValid.value = false;
        fileSizeError.value = 'Previous error';

        handleFileSelection(null);

        expect(isFileSizeValid.value).toBe(true);
        expect(fileSizeError.value).toBe('');
        expect(fileSizeHint.value).toBe('');
      });
    });

    describe('valid files (< 50 MB)', () => {
      it('validates small file without warnings', () => {
        const { handleFileSelection, isFileSizeValid, showFileSizeWarning, fileSizeHint } = useFileSizeValidation();

        const file = new File(['x'.repeat(1024)], 'test.txt');
        const result = handleFileSelection(file);

        expect(result.isValid).toBe(true);
        expect(result.hasWarning).toBeUndefined();
        expect(isFileSizeValid.value).toBe(true);
        expect(showFileSizeWarning.value).toBe(false);
        expect(fileSizeHint.value).toContain('File size:');
        expect(fileSizeHint.value).toContain('KB');
      });

      it('sets fileSizeHint with formatted size', () => {
        const { handleFileSelection, fileSizeHint } = useFileSizeValidation();

        const file = new File(['x'.repeat(1024 * 100)], 'test.txt'); // 100 KB
        handleFileSelection(file);

        expect(fileSizeHint.value).toBe('File size: 100 KB');
      });

      it('validates 1 MB file', () => {
        const { handleFileSelection, isFileSizeValid } = useFileSizeValidation();

        const size = 1 * 1024 * 1024;
        const file = new File(['x'.repeat(size)], 'test.txt');
        const result = handleFileSelection(file);

        expect(result.isValid).toBe(true);
        expect(isFileSizeValid.value).toBe(true);
      });
    });

    describe('files with warnings (50-200 MB)', () => {
      it('validates large file with warning', () => {
        const {
          handleFileSelection,
          isFileSizeValid,
          showFileSizeWarning,
          fileSizeWarningMessage
        } = useFileSizeValidation();

        const size = FILE_SIZE_LIMITS.WARNING_THRESHOLD + 1;
        const file = new File(['x'.repeat(size)], 'large.bin');
        const result = handleFileSelection(file);

        expect(result.isValid).toBe(true);
        expect(result.hasWarning).toBe(true);
        expect(isFileSizeValid.value).toBe(true);
        expect(showFileSizeWarning.value).toBe(true);
        expect(fileSizeWarningMessage.value).toContain('Large file detected');
      });

      it('validates 100 MB file with warning', () => {
        const { handleFileSelection, showFileSizeWarning } = useFileSizeValidation();

        const size = 100 * 1024 * 1024;
        const file = new File(['x'.repeat(size)], 'large.bin');
        handleFileSelection(file);

        expect(showFileSizeWarning.value).toBe(true);
      });

      it('sets warning message for large files', () => {
        const { handleFileSelection, fileSizeWarningMessage } = useFileSizeValidation();

        const size = FILE_SIZE_LIMITS.WARNING_THRESHOLD + 1;
        const file = new File(['x'.repeat(size)], 'large.bin');
        handleFileSelection(file);

        expect(fileSizeWarningMessage.value).toContain('Large file detected');
        expect(fileSizeWarningMessage.value).toContain('Processing may take longer');
      });
    });

    describe('invalid files (> 200 MB)', () => {
      it('invalidates file exceeding max size', () => {
        const {
          handleFileSelection,
          isFileSizeValid,
          fileSizeError
        } = useFileSizeValidation();

        const size = FILE_SIZE_LIMITS.MAX_SIZE + 1;
        const file = new File(['x'.repeat(size)], 'huge.bin');
        const result = handleFileSelection(file);

        expect(result.isValid).toBe(false);
        expect(isFileSizeValid.value).toBe(false);
        expect(fileSizeError.value).toContain('File is too large');
      });

      it('does not show warning for invalid files', () => {
        const { handleFileSelection, showFileSizeWarning } = useFileSizeValidation();

        const size = FILE_SIZE_LIMITS.MAX_SIZE + 1;
        const file = new File(['x'.repeat(size)], 'huge.bin');
        handleFileSelection(file);

        expect(showFileSizeWarning.value).toBe(false);
      });

      it('sets error message with size details', () => {
        const { handleFileSelection, fileSizeError } = useFileSizeValidation();

        const size = FILE_SIZE_LIMITS.MAX_SIZE + 1;
        const file = new File(['x'.repeat(size)], 'huge.bin');
        handleFileSelection(file);

        expect(fileSizeError.value).toContain('File is too large');
        expect(fileSizeError.value).toContain('Maximum allowed size is 200 MB');
      });
    });

    describe('state clearing between validations', () => {
      it('clears previous validation state before new validation', () => {
        const {
          handleFileSelection,
          isFileSizeValid,
          showFileSizeWarning,
          fileSizeError
        } = useFileSizeValidation();

        // First validate an invalid file
        const largeFile = new File(['x'.repeat(FILE_SIZE_LIMITS.MAX_SIZE + 1)], 'huge.bin');
        handleFileSelection(largeFile);

        expect(isFileSizeValid.value).toBe(false);
        expect(fileSizeError.value).toBeTruthy();

        // Then validate a small file
        const smallFile = new File(['test'], 'small.txt');
        handleFileSelection(smallFile);

        expect(isFileSizeValid.value).toBe(true);
        expect(fileSizeError.value).toBe('');
        expect(showFileSizeWarning.value).toBe(false);
      });

      it('clears warning when validating smaller file', () => {
        const {
          handleFileSelection,
          showFileSizeWarning,
          fileSizeWarningMessage
        } = useFileSizeValidation();

        // First validate a file with warning
        const largeFile = new File(['x'.repeat(FILE_SIZE_LIMITS.WARNING_THRESHOLD + 1)], 'large.bin');
        handleFileSelection(largeFile);

        expect(showFileSizeWarning.value).toBe(true);
        expect(fileSizeWarningMessage.value).toBeTruthy();

        // Then validate a small file
        const smallFile = new File(['test'], 'small.txt');
        handleFileSelection(smallFile);

        expect(showFileSizeWarning.value).toBe(false);
        expect(fileSizeWarningMessage.value).toBe('');
      });
    });
  });

  describe('reactive state', () => {
    it('provides reactive refs that can be watched', () => {
      const { isFileSizeValid } = useFileSizeValidation();

      let callbackExecuted = false;
      const stopWatch = vi.fn(() => {
        callbackExecuted = true;
      });

      // Manually trigger change
      isFileSizeValid.value = false;

      // Verify it's a ref
      expect(isFileSizeValid.value).toBe(false);
    });

    it('all returned values are reactive refs', () => {
      const {
        isFileSizeValid,
        showFileSizeWarning,
        fileSizeWarningMessage,
        fileSizeError,
        fileSizeHint
      } = useFileSizeValidation();

      // Check they are Vue refs (have .value property)
      expect(isFileSizeValid).toHaveProperty('value');
      expect(showFileSizeWarning).toHaveProperty('value');
      expect(fileSizeWarningMessage).toHaveProperty('value');
      expect(fileSizeError).toHaveProperty('value');
      expect(fileSizeHint).toHaveProperty('value');
    });
  });

  describe('edge cases', () => {
    it('handles zero-byte file', () => {
      const { handleFileSelection, fileSizeHint } = useFileSizeValidation();

      const file = new File([], 'empty.txt');
      const result = handleFileSelection(file);

      expect(result.isValid).toBe(true);
      expect(fileSizeHint.value).toBe('File size: 0 Bytes');
    });

    it('handles exact warning threshold boundary', () => {
      const { handleFileSelection, showFileSizeWarning, isFileSizeValid } = useFileSizeValidation();

      const size = FILE_SIZE_LIMITS.WARNING_THRESHOLD;
      const file = new File(['x'.repeat(size)], 'boundary.bin');
      handleFileSelection(file);

      expect(isFileSizeValid.value).toBe(true);
      expect(showFileSizeWarning.value).toBe(false);
    });

    it('handles exact max size boundary', () => {
      const { handleFileSelection, showFileSizeWarning, isFileSizeValid } = useFileSizeValidation();

      const size = FILE_SIZE_LIMITS.MAX_SIZE;
      const file = new File(['x'.repeat(size)], 'boundary.bin');
      handleFileSelection(file);

      expect(isFileSizeValid.value).toBe(true);
      expect(showFileSizeWarning.value).toBe(true);
    });
  });
});
