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

## 13. Icon Usage

### Icon Library
- **Current**: Lucide Icons (via `lucide-vue-next`)
- **Migration**: Fully migrated from Material Design Icons
- **Backward Compatibility**: Legacy `mdi-*` names still supported via mapping layer

### Using Icons in Components

#### Recommended: Semantic Icon Constants (Future-Proof)
```vue
<script setup>
import { ICONS } from '@/constants/icons'
</script>

<template>
  <!-- Preferred: Semantic constants -->
  <v-icon :icon="ICONS.LOCK"></v-icon>
  <v-icon :icon="ICONS.DOWNLOAD"></v-icon>

  <!-- Alternative: Icon wrapper component (most flexible) -->
  <Icon name="LOCK" />
  <Icon name="DOWNLOAD" size="small" color="primary" />
</template>
```

#### Legacy: Direct Icon Names (Backward Compatible)
```vue
<template>
  <!-- Still supported for existing code -->
  <v-icon icon="mdi-lock"></v-icon>
  <v-icon>mdi-download</v-icon>

  <!-- Direct Lucide names also work -->
  <v-icon icon="Lock"></v-icon>
  <v-icon>Download</v-icon>
</template>
```

### Using Icons in Utility Files

**Always use semantic constants from `@/constants/icons`**:

```javascript
import { ICONS } from '@/constants/icons'

export const METADATA_TAGS = {
  'Title': {
    label: 'Title',
    icon: ICONS.TITLE,  // ✅ Correct
    // icon: 'mdi-format-title',  // ❌ Avoid
  }
}
```

### Available Semantic Icon Constants

Icons are organized by category in `/src/constants/icons.js`:

- **Navigation**: `HOME`, `MENU`, `ARROW_LEFT`, `ARROW_RIGHT`, `CHEVRON_DOWN`, etc.
- **Security**: `LOCK`, `UNLOCK`, `SHIELD`, `SHIELD_CHECK`, `KEY`, `PASSWORD`, etc.
- **Files**: `FILE`, `FILE_TEXT`, `FILE_CODE`, `FOLDER`, `DOWNLOAD`, `UPLOAD`, `SAVE`
- **Images**: `IMAGE`, `IMAGE_ICON`, `IMAGE_PLUS`, `CAMERA`, `CROP`
- **Editing**: `PENCIL`, `EDIT`, `DELETE`, `COPY`, `PASTE`, `UNDO`, `RESTORE`
- **Status**: `CHECK`, `SUCCESS`, `ERROR`, `ALERT`, `WARNING`, `INFO`, `HELP`
- **Code**: `CODE`, `QR_CODE`, `BARCODE`, `HASH`, `BINARY`
- **Theme**: `SUN`, `MOON`, `PALETTE`, `CONTRAST`
- **Metadata**: `TITLE`, `COMMENT`, `USER`, `CALENDAR`, `CLOCK`, `MAP_PIN`, `CAMERA`

See [`/src/constants/icons.js`](../src/constants/icons.js) for the complete list.

### Adding New Icons

1. **Import the Lucide icon** in `/src/main.js`:
```javascript
import { NewIcon, AnotherIcon } from 'lucide-vue-next'
```

2. **Add to LucideIcons lookup** in `/src/main.js`:
```javascript
const LucideIcons = {
  // ... existing icons
  NewIcon, AnotherIcon
}
```

3. **Add semantic constant** in `/src/constants/icons.js`:
```javascript
export const ICONS = {
  // ... existing icons
  MY_NEW_ICON: 'NewIcon',
  ANOTHER: 'AnotherIcon',
}
```

4. **Use in components**:
```vue
<v-icon :icon="ICONS.MY_NEW_ICON"></v-icon>
```

### Future Icon Library Migrations

If we need to change icon libraries again:

1. **Option 1: Update mapping in `main.js`** (minimal changes)
   - Update icon imports from new library
   - Update `LucideIcons` lookup object
   - Keep semantic constants unchanged

2. **Option 2: Use Icon component** (maximum flexibility)
   - Update [`Icon.vue`](../src/components/Icon.vue) component implementation
   - All components using `<Icon name="..." />` work unchanged
   - No changes needed in consuming components

3. **Option 3: Update constants** (if icon names change significantly)
   - Update [`/src/constants/icons.js`](../src/constants/icons.js) mappings
   - All code using `ICONS.*` constants works unchanged

### Icon Naming Conventions

When choosing semantic names for new icons:

- Use **UPPERCASE_SNAKE_CASE** for constant names
- Use **descriptive, semantic names** (not library-specific)
- Group related icons with common prefixes:
  - `FILE`, `FILE_TEXT`, `FILE_CODE`, `FILE_LOCK`
  - `LOCK`, `LOCK_OPEN`, `LOCK_KEYHOLE`
  - `ARROW_LEFT`, `ARROW_RIGHT`, `ARROW_UP`, `ARROW_DOWN`

### Migration Notes

- All `mdi-*` icon references are automatically mapped to Lucide equivalents
- Legacy MDI names will continue to work indefinitely via the compatibility layer
- **New code should use semantic constants** from `ICONS` for future-proofing
- Some MDI icons don't have exact Lucide equivalents (e.g., numbered circles use plain circles)

### Future Migration Path

**Current State (as of 2025-11-23):**
- All existing components use `<v-icon icon="mdi-...">` with backward compatibility mapping
- Utility files (pngTags.js, exifTags.js) use `ICONS.*` semantic constants
- Icon.vue wrapper component exists but is **not yet used** in any components

**Future Consideration:**
At some point, we may want to migrate all components to use the `Icon` wrapper component (`<Icon name="..." />`) instead of direct `v-icon` usage. This would provide:
- Maximum abstraction from icon library implementation
- Easier future icon library migrations (update only Icon.vue)
- Consistent icon API across the application

This migration is **optional** and not urgent - the current architecture with semantic constants already provides excellent flexibility.

---

**Last Updated**: 2025-11-23
**Applies To**: All Vue 3 components in `/src/`
