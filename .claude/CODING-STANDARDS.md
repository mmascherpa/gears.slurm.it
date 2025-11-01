# Coding Standards - Slurm Tools

This document defines coding standards for all Vue 3 components in the Slurm Tools project.

## 1. Variable Naming Conventions

### Refs and Reactive State
- **Boolean refs**: Use `is` prefix for state checks → `isLoading`, `isPasswordConfirmed`
- **Boolean computed**: Use `can` prefix for validation checks → `canEncrypt`, `canDecrypt`
- **Arrays**: Use plural nouns → `tableHeaders`, `tableData`
- **File inputs**: Use descriptive names → `encryptedFile`, `plainFile` (not generic `file`)

### Functions
- **Event handlers**: Use `handle` prefix → `handlePaste()`, `handleCopy()`, `handleFileValidation()`
- **Clear functions**: Use `clear` prefix → `clearPlainText()`, `clearOutputs()`
- **Download functions**: Use `download` prefix → `downloadEncrypted()`, `downloadDecryptedText()`
- **Debounced functions**: Use `debounced` prefix → `debouncedEncrypt`, `debouncedDecode`

### Constants
- Use UPPERCASE for true constants → `MAX_PREVIEW_SIZE`
- Declare at top of setup() function

## 2. Import Organization

### Order (top to bottom)
1. **Vue imports** (alphabetical within group)
2. **Utility imports** from `@/utils/` (alphabetical)
3. **Composable imports** from `@/composables/` (alphabetical)
4. **Component imports** from `@/components/` (alphabetical)

### Example
```javascript
import { computed, onMounted, ref, watch } from 'vue';
import { downloadFile } from '@/utils/fileDownload';
import { parseCSV } from '@/utils/csvParser';
import { useAESWorker } from '@/composables/useAESWorker';
import { useClipboard } from '@/composables/useClipboard';
import { useDebounce } from '@/composables/useDebounce';
import { useSnackbar } from '@/composables/useSnackbar';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator.vue';
import SharedSnackbar from '@/components/SharedSnackbar.vue';
import ToolPageHeader from '@/components/ToolPageHeader.vue';
```

## 3. setup() Function Organization

### Standard Order
```javascript
setup() {
  // 1. Constants (if any)
  const MAX_PREVIEW_SIZE = 8 * 1024 * 1024; // 8MB

  // 2. Reactive State
  const password = ref('');
  const plainText = ref('');

  // 3. Composables
  const { snackbar, snackbarText, snackbarColor, showSnackbar } = useSnackbar();
  const { copyToClipboard } = useClipboard();

  // 4. Computed Properties
  const isPasswordConfirmed = computed(() => {...});
  const canEncrypt = computed(() => {...});

  // 5. Functions (grouped logically)
  const handlePaste = () => {...};
  const handleCopy = () => {...};

  // 6. Watchers
  watch(password, () => {...});

  // 7. Lifecycle Hooks
  onMounted(() => {...});

  // 8. Return (organized with comments)
  return {
    // State
    password,
    plainText,

    // Snackbar
    snackbar,
    snackbarText,
    snackbarColor,

    // Computed
    isPasswordConfirmed,
    canEncrypt,

    // Methods
    handlePaste,
    handleCopy
  };
}
```

## 4. Comment Standards

### Section Comments
Use `//` for section dividers:
```javascript
// Reactive State
// Composables
// Computed Properties
// Functions
// Watchers
```

### JSDoc Comments
**Required for**:
- All non-trivial functions
- All exported functions
- Any complex logic

**Format**:
```javascript
/**
 * Encrypts plain text using AES encryption
 * Converts text to blob and triggers worker encryption
 */
const encryptText = () => {
  // ...
};
```

Use proper grammar: "Encrypts" not "Encrypt", "Handles" not "Handle"

### Inline Comments
- Use for complex logic explanation
- Place above the line being explained
- Use complete sentences with proper punctuation

## 5. Error Handling

### Standard Pattern
```javascript
try {
  // operation
} catch (error) {
  const errorMessage = typeof error === 'string' ? error : (error.message || 'Unknown error');
  console.error('Operation failed:', error);
  showSnackbar(`❌ ${errorMessage}`, 'error');
}
```

### Error Display
- **For validation errors**: Use `v-alert` with closable
- **For operation errors**: Use snackbar only (no `error` ref needed for Base64 operations)
- **For critical errors** (encryption/decryption): Use both `v-alert` AND snackbar

## 6. Template Formatting

### Component Props
- Always use double quotes for attribute values
- Use kebab-case for prop names in templates
- Use self-closing `/>`  for components without children

```vue
<ToolPageHeader
  title="AES Encryption"
  description="Secure your files"
  icon="mdi-lock"
  avatar-color="primary" />
```

### Consistency
- `TextInputWithActions`: Use `:is-loading` (not `:loading`)
- `FileUploadWithValidation`: Use `@validation-change` (not `@update:validation`)
- Always include `avatar-color` prop on `ToolPageHeader`

## 7. Debounce Values

### Standard Delays
- **Text operations** (Base64 encode/decode): `350ms`
- **Crypto operations** (AES encrypt/decrypt): `800ms`
- **Password generation**: No debounce (instant)

### Usage
```javascript
// For crypto operations (800ms)
const { debounce: debouncedEncrypt, cancel: cancelEncryption } = useDebounce(() => {
  // encryption logic
}, 800);

// For text operations (350ms)
const { debounce: debouncedEncode } = useDebounce(() => {
  // encoding logic
}, 350);
```

## 8. Return Object Organization

### Always include section comments
```javascript
return {
  // State
  password,
  plainText,
  isLoading,

  // Snackbar
  snackbar,
  snackbarText,
  snackbarColor,

  // Computed
  isPasswordConfirmed,
  canEncrypt,

  // Methods
  handlePaste,
  handleCopy,
  clearPlainText
};
```

### Order within sections
- Alphabetical within each section
- Exception: Keep related items together (e.g., `password`, `passwordConfirm`)

## 9. Composable Usage

### Destructuring Pattern
```javascript
// Standard pattern
const { snackbar, snackbarText, snackbarColor, showSnackbar } = useSnackbar();
const { copyToClipboard, pasteFromClipboard } = useClipboard();

// With renaming
const { debounce: debouncedEncrypt, cancel: cancelEncryption } = useDebounce(fn, 800);
```

### Cleanup
- All composables with lifecycle hooks handle cleanup internally
- No manual cleanup needed in components

## 10. File Naming

### Refs for Files
- Encryption: `plainFile` (input), `encryptedFile` (output)
- Decryption: `encryptedFile` (input), `decryptedFile` (output)
- Base64: `plainFile` (input), `encodedFile` (output for encoding)
- Base64: `encodedFile` (input), `decodedFile` (output for decoding)

## 11. Computed Property Style

### Always use explicit return for clarity
```javascript
const isPasswordConfirmed = computed(() => {
  return password.value.trim() !== '' && password.value === passwordConfirm.value;
});
```

### Exception: Single-line expressions can use implicit return
```javascript
const hasText = computed(() => plainText.value.trim() !== '');
```

## 12. Watchers

### Placement
- After computed properties
- Before lifecycle hooks
- Group related watchers together

### Style
```javascript
// Single watcher
watch(password, () => {
  // logic
});

// Multiple sources
watch([password, passwordConfirm], () => {
  // logic
});
```

---

**Last Updated**: 2025-11-01
**Applies To**: All Vue 3 components in `/src/`
